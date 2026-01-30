import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../shared/api/client';
import { useAuth } from '../../shared/context/AuthContext';
import Button from '../../shared/components/Button';
import Input from '../../shared/components/Input';

declare global {
  interface Window {
    Stripe: any;
  }
}

const ServiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingNote, setBookingNote] = useState('');
  const [bookingError, setBookingError] = useState('');

  // New State for Enhanced Booking
  const [bookingFor, setBookingFor] = useState<'self' | 'friend'>('self');
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'CASH'>('ONLINE');
  const [friendName, setFriendName] = useState('');
  const [friendEmail, setFriendEmail] = useState('');
  const [friendPhone, setFriendPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  useEffect(() => {
    if (user && bookingFor === 'self') {
      if (!friendName) setFriendName(user.name || '');
      if (!friendEmail) setFriendEmail(user.email || '');
      if (!friendPhone) setFriendPhone(user.phone || '');
    }
  }, [user, bookingFor]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response: any = await api.get(`/doctors/${id}/details`);
        setDoctor(response.doctor);

        // Fetch slots
        if (response.doctor && response.doctor.providerId) {
          try {
            // We need providerId to fetch slots, but the doctors endpoint returns details. 
            // Ideally it should return providerId. Assume response.doctor holds it or we use 'id' if 'id' is service id.
            // Wait, id param is serviceId (doctor_profile_id). We need doctorId (user id of provider).
            // response.doctor usually has providerId.
            const slotsRes: any = await api.get(`/api/slots/doctor/${response.doctor.providerId}/available`);
            setSlots(slotsRes || []);
          } catch (e) { console.error("Failed to fetch slots", e); }
        }
      } catch (error) {
        console.error("Failed to fetch doctor details", error);
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id, navigate]);

  const handleSlotSelect = (slot: any) => {
    setSelectedSlotId(slot.id);
    // Auto-fill date/time for display or backend
    const dateStr = slot.startTime.split('T')[0];
    const timeStr = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    setBookingDate(dateStr);
    setBookingTime(timeStr);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (slots.length > 0 && !selectedSlotId) {
      setBookingError("Please select a time slot.");
      return;
    }

    setBookingError('');
    try {
      const res: any = await api.post('/appointments/create-with-payment', {
        serviceId: id,
        userId: user.id,
        bookingDate,
        bookingTime: bookingTime.length === 5 ? bookingTime + ":00" : bookingTime,
        slotId: selectedSlotId,
        addressLine: address,
        city,
        state,
        zip,
        bookingFor,
        paymentMethod,
        friendName: bookingFor === 'friend' ? friendName : null,
        friendEmail: bookingFor === 'friend' ? friendEmail : null,
        friendPhone: bookingFor === 'friend' ? friendPhone : null,
      });

      console.log("Booking created:", res);

      if (paymentMethod === 'ONLINE' && res && res.sessionId) {
        const stripe = await (window as any).Stripe('pk_test_51Sev9JLVlhVkpMjJI42rKrIyok1jUgXM8UQyKK3Ju5TLlRS8woqrDKkju0kr9ztyJyBKCc68pJzjRowumSICqvWI00O8ucdqnZ');
        const result = await stripe.redirectToCheckout({ sessionId: res.sessionId });
        if (result.error) setBookingError(result.error.message);
      } else {
        navigate('/bookings');
      }

    } catch (err: any) {
      console.error(err);
      setBookingError(err.message || 'Failed to initiate booking');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!doctor) return <div className="p-8 text-center">Doctor not found</div>;

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Doctor Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">


            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{doctor.doctorName}</h1>
                <p className="text-xl text-primary font-medium">{doctor.specialization}</p>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-bold mb-2">${doctor.consultationFee}</span>
                {user && (
                  <button
                    onClick={() => navigate('/chat', {
                      state: {
                        startChatWith: {
                          id: doctor.providerId,
                          name: doctor.doctorName,
                          role: 'DOCTOR'
                        }
                      }
                    })}
                    className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    Chat
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-1">About</h3>
                <p className="text-[var(--text-secondary)]">{doctor.shortBio}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <span className="block text-xs font-bold text-blue-800 uppercase">Clinic</span>
                  <p className="font-medium">{doctor.clinicName}</p>
                  <p className="text-sm">{doctor.clinicAddress}, {doctor.clinicCity}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <span className="block text-xs font-bold text-green-800 uppercase">Experience</span>
                  <p className="font-medium">{doctor.experienceYears} Years</p>
                </div>
              </div>
            </div>
          </div>

          {/* Slots Display (if any) */}
          {slots.length > 0 && (
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Available Slots</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {slots.map(slot => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => handleSlotSelect(slot)}
                    className={`p-3 rounded border text-sm font-medium transition-all ${selectedSlotId === slot.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                  >
                    <div className="text-xs opacity-75">{new Date(slot.startTime).toDateString()}</div>
                    <div className="text-lg">{new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    {slot.capacity > 1 && (
                      <div className="text-[10px] text-green-600 font-bold mt-1">
                        {slot.capacity - (slot.bookedCount || 0)} spots left
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="text-xl font-bold mb-4">Book Appointment</h2>
            <form onSubmit={handleBook} className="space-y-4">

              {/* Show manual inputs ONLY if no slots available */}
              {slots.length === 0 ? (
                <>
                  <Input
                    label="Date"
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <Input
                    label="Time"
                    type="time"
                    required
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                  />
                </>
              ) : (
                <div className="p-3 bg-blue-50 rounded border border-blue-100 mb-4">
                  {selectedSlotId ? (
                    <div>
                      <span className="text-xs font-bold text-blue-800 uppercase">Selected Time</span>
                      <div className="font-bold text-blue-900 text-lg">{bookingDate} @ {bookingTime}</div>
                    </div>
                  ) : (
                    <div className="text-blue-800 text-sm font-medium">Please select a slot from the available times.</div>
                  )}
                </div>
              )}

              {/* Booking For Selection */}
              <div className="input-group">
                <label className="input-label">Booking For</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bookingFor"
                      value="self"
                      checked={bookingFor === 'self'}
                      onChange={() => setBookingFor('self')}
                    />
                    Self
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bookingFor"
                      value="friend"
                      checked={bookingFor === 'friend'}
                      onChange={() => setBookingFor('friend')}
                    />
                    Friend/Family
                  </label>
                </div>
              </div>

              {bookingFor === 'friend' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                  <Input
                    label="Patient Name"
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    required
                  />
                  <Input
                    label="Patient Email"
                    type="email"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                  />
                  <Input
                    label="Patient Phone"
                    type="tel"
                    value={friendPhone}
                    onChange={(e) => setFriendPhone(e.target.value)}
                  />
                </div>
              )}

              <Input
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                placeholder="House/Flat No, Street"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
                <Input
                  label="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
              </div>
              <Input
                label="ZIP Code"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                required
              />

              <div className="input-group">
                <label className="input-label">Reason for Visit</label>
                <textarea
                  className="input-field h-24 resize-none"
                  value={bookingNote}
                  onChange={(e) => setBookingNote(e.target.value)}
                  placeholder="Describe your symptoms..."
                />
              </div>

              <div className="input-group">
                <label className="input-label">Payment Method</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={paymentMethod === 'ONLINE'}
                      onChange={() => setPaymentMethod('ONLINE')}
                    />
                    Pay Online (Stripe)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CASH"
                      checked={paymentMethod === 'CASH'}
                      onChange={() => setPaymentMethod('CASH')}
                    />
                    Pay at Clinic
                  </label>
                </div>
              </div>

              {bookingError && <p className="text-red-500 text-sm">{bookingError}</p>}

              {user ? (
                <Button fullWidth type="submit">
                  {paymentMethod === 'ONLINE' ? `Pay ₹${doctor.consultationFee} & Book` : 'Book Appointment'}
                </Button>
              ) : (
                <Button fullWidth type="button" onClick={() => navigate('/login')}>
                  Login to Book
                </Button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
