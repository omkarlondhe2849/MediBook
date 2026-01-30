import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../shared/api/client';
import PatientLayout from '../../shared/components/PatientLayout';
import Button from '../../shared/components/Button';
import ReportIssueModal from '../../shared/components/ReportIssueModal';
import { formatDate, formatTime } from '../../shared/utils/dateUtils';

const BookingDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [reportModalOpen, setReportModalOpen] = useState(false);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await api.get(`/appointments/${id}`);
                setBooking(res);
            } catch (error) {
                console.error("Failed to fetch booking details", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchBooking();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading details...</div>;
    if (!booking) return (
        <PatientLayout activePage="bookings">
            <div className="text-center py-20">
                <h2 className="text-xl font-bold">Booking not found</h2>
                <Link to="/bookings" className="text-blue-600 hover:underline">Return to list</Link>
            </div>
        </PatientLayout>
    );

    const isUpcoming = booking.appointmentStatus === 'CONFIRMED' || booking.appointmentStatus === 'PENDING';

    return (
        <PatientLayout activePage="bookings">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <Link to="/bookings" className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold text-sm">
                        <span>←</span> Back
                    </Link>
                    <div className="flex gap-2">

                        {booking.appointmentStatus === 'PENDING' && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">Awaiting Payment/Confirmation</span>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                        <div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">Appointment ID: #{booking.id}</div>
                            <h1 className="text-3xl font-black text-slate-900 mb-2">{booking.specialization || 'General Consultation'}</h1>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${booking.appointmentStatus === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                    booking.appointmentStatus === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                    {booking.appointmentStatus}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-black text-slate-800">{formatDate(booking.appointmentDate).split(',')[0]}</div>
                            <div className="text-lg font-bold text-slate-500">{formatTime(booking.appointmentTime)}</div>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">👨‍⚕️</span>
                                Doctor Details
                            </h3>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="font-bold text-lg text-slate-800">{booking.doctorName}</p>
                                <p className="text-slate-500 text-sm">Specialist</p>
                                <div className="mt-4 flex gap-2">
                                    <Link to={`/services/${booking.doctorId}`}>
                                        <Button variant="outline" size="sm" className="w-full">View Profile</Button>
                                    </Link>
                                    <Link to="/chat" state={{ startChatWith: { id: booking.doctorId, name: booking.doctorName, role: 'DOCTOR' } }}>
                                        <Button size="sm" className="w-full">Message</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">📍</span>
                                Visit Details
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between border-b border-slate-100 pb-2">
                                    <span className="text-slate-500 font-medium">Date</span>
                                    <span className="font-bold text-slate-900">{formatDate(booking.appointmentDate)}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-2">
                                    <span className="text-slate-500 font-medium">Time</span>
                                    <span className="font-bold text-slate-900">{formatTime(booking.appointmentTime)}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-2">
                                    <span className="text-slate-500 font-medium">Consultation Fee</span>
                                    <span className="font-bold text-slate-900">₹{booking.consultationFee || 500}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Help */}
                    <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
                        <p className="text-slate-500 text-sm mb-4">Need to reschedule or have questions?</p>
                        <div className="flex justify-center gap-4">
                            <Button variant="outline">Contact Support</Button>
                            {isUpcoming && <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">Cancel Appointment</Button>}
                            <Button variant="outline" onClick={() => setReportModalOpen(true)}>Report Issue</Button>
                        </div>
                    </div>
                </div>
            </div>

            <ReportIssueModal
                isOpen={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
                bookingId={booking.id}
                patientId={booking.userId}
                doctorId={booking.providerId}
                onSuccess={() => setReportModalOpen(false)}
            />
        </PatientLayout>
    );
};

export default BookingDetails;
