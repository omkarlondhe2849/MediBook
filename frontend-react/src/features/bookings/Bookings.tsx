import React, { useEffect, useState } from 'react';
import { api } from '../../shared/api/client';
import { useAuth } from '../../shared/context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../../shared/components/Button';
import PatientLayout from '../../shared/components/PatientLayout';

const Bookings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const res: any = await api.get(`/appointments/user/${user.id}`);
        setBookings(res);

        if (sessionId) {
          const booking = res.find((b: any) => b.stripeSessionId === sessionId);
          if (booking && booking.paymentStatus === 'PENDING') {
            try {
              await api.post('/appointments/confirm-payment', {
                bookingId: booking.id,
                sessionId: sessionId
              });
              // Refresh bookings
              const updatedRes: any = await api.get(`/appointments/user/${user.id}`);
              setBookings(updatedRes);
              alert('Payment Confirmed Successfully!');
              // Remove session_id
              navigate('/bookings', { replace: true });
            } catch (err) {
              console.error("Auto-confirmation failed", err);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate, sessionId]);

  const confirmBookingPayment = async (booking: any) => {
    if (booking.paymentStatus === 'PENDING' && booking.stripeSessionId) {
      try {
        await api.post('/appointments/confirm-payment', {
          bookingId: booking.id,
          sessionId: booking.stripeSessionId
        });
        alert('Payment Confirmed! OTP: ' + (booking.otp || 'Sent via Email'));
        window.location.reload();
      } catch (err) {
        console.error("Payment confirmation failed", err);
      }
    }
  };

  const handleOpenComplaint = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setComplaintModalOpen(true);
  };

  const submitComplaint = async () => {
    if (!selectedBookingId || !complaintSubject || !complaintDesc) return;
    setSubmittingComplaint(true);
    try {
      // Find doctorId from bookings
      const booking = bookings.find(b => b.id === selectedBookingId);
      if (!booking) return;

      await api.post('/api/complaints', {
        patientId: user?.id,
        doctorId: booking.providerId,
        subject: complaintSubject,
        description: complaintDesc
      });
      alert('Complaint submitted successfully');
      setComplaintModalOpen(false);
      setComplaintSubject('');
      setComplaintDesc('');
    } catch (err) {
      console.error("Failed to submit complaint", err);
      alert('Failed to submit complaint');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'upcoming') {
      return ['PENDING', 'CONFIRMED'].includes(b.appointmentStatus);
    } else {
      return ['COMPLETED', 'CANCELLED'].includes(b.appointmentStatus);
    }
  });

  if (loading) return <div className="p-20 text-center text-slate-500 font-medium">Loading your bookings...</div>;

  return (
    <PatientLayout activePage="bookings">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">My Bookings</h1>
        <p className="text-slate-500">Track your upcoming consultations and history.</p>
      </div>

      <div>

        <div className="flex gap-4 mb-6 border-b border-slate-200 w-full overflow-x-auto">
          <button
            className={`pb-3 px-2 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'upcoming' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`pb-3 px-2 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'history' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 border-dashed">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                📅
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No {activeTab} Appointments</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                {activeTab === 'upcoming' ? "You have no upcoming appointments." : "No past appointments found."}
              </p>
              {activeTab === 'upcoming' && (
                <button
                  onClick={() => navigate('/services')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm"
                >
                  Find a Doctor
                </button>
              )}
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                <div className="flex items-start gap-4 w-full md:w-auto">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xl md:text-2xl border border-teal-100 shadow-sm flex-shrink-0">
                    {booking.doctorName ? booking.doctorName.charAt(0) : 'D'}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {booking.doctorName || 'Unknown Doctor'}
                      </h3>
                      {booking.appointmentStatus === 'CONFIRMED' && (
                        <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-700 text-[10px] font-bold uppercase tracking-wide">
                          Confirmed
                        </span>
                      )}
                      {booking.appointmentStatus === 'PENDING' && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
                          Pending
                        </span>
                      )}
                      {booking.appointmentStatus === 'COMPLETED' && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide">
                          Completed
                        </span>
                      )}
                      {booking.appointmentStatus === 'CANCELLED' && (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wide">
                          Cancelled
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 font-medium mb-2 text-sm md:text-base">{booking.specialization} • {booking.clinicName}</p>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md text-slate-700 font-semibold border border-slate-100">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 0 0 0-2-2H5a2 0 0 0-2 2v12a2 0 0 0 2 2z" /></svg>
                        {booking.appointmentDate}
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md text-slate-700 font-semibold border border-slate-100">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {booking.appointmentTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 pl-18 md:pl-0">
                  <div className="flex flex-col items-start md:items-end">
                    <div className="text-xl md:text-2xl font-extrabold text-slate-900">₹{booking.price}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Consultation Fee</div>
                  </div>


                  <div className="flex gap-2">
                    {booking.paymentStatus === 'PENDING' && booking.stripeSessionId ? (
                      <Button size="sm" onClick={() => confirmBookingPayment(booking)} className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm text-xs px-4">
                        Verify Payment
                      </Button>
                    ) : (
                      <>
                        {booking.appointmentStatus === 'COMPLETED' && (
                          <button
                            onClick={() => handleOpenComplaint(booking.id)}
                            className="text-xs font-bold text-red-600 underline hover:text-red-800"
                          >
                            Report Issue
                          </button>
                        )}
                        {booking.otp && booking.appointmentStatus !== 'COMPLETED' && (
                          <div className="group/otp relative cursor-default">
                            <div className="bg-indigo-50 hover:bg-indigo-100 transition-colors px-4 py-2 rounded-lg border border-indigo-100 text-center">
                              <span className="block text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-0.5">Session OTP</span>
                              <span className="text-xl font-mono font-bold text-indigo-600 tracking-widest">{booking.otp}</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Complaint Modal */}
      {complaintModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">File a Complaint</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input className="w-full border p-2 rounded" value={complaintSubject} onChange={e => setComplaintSubject(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full border p-2 rounded h-24" value={complaintDesc} onChange={e => setComplaintDesc(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setComplaintModalOpen(false)}>Cancel</Button>
                <Button onClick={submitComplaint} isLoading={submittingComplaint}>Submit</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PatientLayout>

  );
};

export default Bookings;
