import React, { useEffect, useState } from 'react';
import { api } from '../../shared/api/client';
import { useAuth } from '../../shared/context/AuthContext';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import { Link } from 'react-router-dom';
import { formatTime, getDayOfMonth, getMonthShort } from '../../shared/utils/dateUtils';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response: any = await api.get(`/appointments/user/${user?.id}`);
        setBookings(response || []);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchBookings();
  }, [user]);


  const upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING');
  const pastBookings = bookings.length - upcomingBookings.length;

  return (

    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col z-20 hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">P</div>
            <h1 className="font-bold text-xl text-slate-800">My<span className="text-emerald-600">Health</span></h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-emerald-50 text-emerald-700 font-bold shadow-sm`}>
            <span className="text-lg">🏠</span> Overview
          </button>
          <Link to="/bookings" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium`}>
            <span className="text-lg">📅</span> My Bookings
          </Link>
          <Link to="/services" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium`}>
            <span className="text-lg">🔍</span> Find Doctors
          </Link>
          <Link to="/chat" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium`}>
            <span className="text-lg">💬</span> Messages
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900">{user?.name}</div>
            <div className="text-xs text-slate-500">{user?.email}</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-full p-4 md:p-8 relative">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Hello, {user?.name?.split(' ')[0] || 'Patient'} 👋
            </h1>
            <p className="text-slate-500 mt-1">Here is what's happening with your health appointments today.</p>
          </div>
          <Link to="/services">
            <Button size="lg" className="shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 border-none text-white">
              + New Appointment
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-blue-100 shadow-sm hover:shadow-md transition-all">
            <div className="text-blue-600 text-3xl mb-2">📅</div>
            <div className="text-4xl font-black text-slate-900 mb-1">{upcomingBookings.length}</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Upcoming Appointments</div>
          </Card>
          <Card className="border-emerald-100 shadow-sm hover:shadow-md transition-all">
            <div className="text-emerald-600 text-3xl mb-2">✅</div>
            <div className="text-4xl font-black text-slate-900 mb-1">{pastBookings}</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Completed Visits</div>
          </Card>
          <Card className="border-purple-100 shadow-sm hover:shadow-md transition-all">
            <div className="text-purple-600 text-3xl mb-2">❤️</div>
            <div className="text-lg font-black text-slate-900 mb-1">Health Tip</div>
            <div className="text-xs text-slate-500 font-medium">Stay hydrated, get 8 hours of sleep, and smile often!</div>
          </Card>
        </div>

        {/* Appointments */}
        <div className="mb-6 flex justify-between items-end">
          <h3 className="text-xl font-bold text-slate-800">Your Recent Appointments</h3>
          {bookings.length > 0 && (
            <Link to="/bookings" className="text-sm text-blue-600 font-bold hover:underline">View All</Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="h-40 bg-gray-100 rounded-2xl"></div>
            ))}
          </div>
        ) : bookings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
            {bookings.slice(0, 4).map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-all flex flex-col justify-between border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mb-2 ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                      {booking.status}
                    </span>
                    <h4 className="font-bold text-lg text-slate-900">{booking.serviceName || 'General Consultation'}</h4>
                    <p className="text-sm text-slate-500 font-medium mt-1">Dr. {booking.doctorName || 'Assigned Doctor'}</p>
                  </div>
                  <div className="text-right bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="text-2xl font-black text-slate-800">
                      {getDayOfMonth(booking.bookingDate)}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase font-black">
                      {getMonthShort(booking.bookingDate)}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-2 flex justify-between items-center text-sm">
                  <div className="flex items-center text-slate-500 font-medium">
                    <span className="mr-2">🕒</span>
                    {formatTime(booking.bookingDate)}
                  </div>
                  <Link to={`/bookings/${booking.id}`} className="text-blue-600 font-bold hover:underline text-xs uppercase tracking-wide">
                    View Details →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
            <div className="text-6xl mb-6 grayscale opacity-50">🩺</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No appointments yet</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">Book your first consultation today.</p>
            <Link to="/services">
              <Button className="btn-primary">Book Now</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
