import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../shared/api/client';
import { useAuth } from '../../shared/context/AuthContext';
import Button from '../../shared/components/Button';
import DoctorSlots from '../../shared/components/DoctorSlots';
import Chat from '../../shared/components/Chat';


const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(true); // Default true to avoid flash



  const checkProfileStatus = async () => {
    if (!user) return;
    try {
      await api.get(`/doctors/profile/me?providerId=${user.id}`);
      setIsProfileComplete(true);
    } catch (e: any) {
      if (e.response && e.response.status === 404) {
        setIsProfileComplete(false);
      }
    }
  };



  useEffect(() => {
    if (user) {
      checkProfileStatus();
      setLoading(false);
    }
  }, [user]);



  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  if (!isProfileComplete) return <div className="p-8 text-center text-gray-500">Redirecting...</div>;

  // LOCK SCREEN: Check for verification and KYC
  // We need to fetch the actual profile data to check isVerified and kycDocumentPath
  // Ideally this should be part of the initial check, but for now we rely on the checkProfileStatus side effect
  // actually checkProfileStatus only checked for 404. We need the data.
  // Let's refactor to use dashboardData or a separate profile state.
  return <DoctorDashboardContent user={user} />;
};

const DoctorDashboardContent = ({ user }: { user: any }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'slots' | 'history' | 'complaints' | 'messages'>('appointments');
  const [dashboardData, setDashboardData] = useState<any[]>([]);
  useEffect(() => {
    const init = async () => {
      try {
        const p: any = await api.get(`/doctors/profile/me?providerId=${user.id}`);
        setProfile(p);

        // Only fetch data if verified
        if (p.isVerified) {
          const response: any[] = await api.get(`/appointments/provider/${user?.id}/with-customers`);
          setDashboardData(response || []);
        }
      } catch (e) {
        // If 404, profile is null
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user]);

  const handleStatusChange = async (bookingId: number, status: string) => {
    try {
      await api.put(`/appointments/${bookingId}`, { appointmentStatus: status });
      const updatedData = dashboardData.map(d => {
        if (d.booking.id === bookingId) {
          return { ...d, booking: { ...d.booking, appointmentStatus: status } };
        }
        return d;
      });
      setDashboardData(updatedData);
    } catch (error) {
      alert(`Failed to update status.`);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Doctor Portal...</div>;

  const renderBookingList = (filterStatus: string[]) => {
    const filtered = dashboardData.filter(d => filterStatus.includes(d.booking.appointmentStatus));
    if (filtered.length === 0) return <p className="text-gray-500 italic">No appointments found.</p>;
    return (
      <div className="grid grid-cols-1 gap-4">
        {filtered.map(({ booking, customer }) => (
          <div key={booking.id} className="card border-slate-900 p-0 overflow-hidden">
            <div className="p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg">{customer.name}</h4>
                  <p className="text-sm text-gray-600">{booking.appointmentDate} at {booking.appointmentTime}</p>
                  <p className="text-xs text-gray-500 mt-1">Status: <span className="font-bold">{booking.appointmentStatus}</span></p>
                </div>
                <div className="flex flex-col gap-2">
                  {booking.appointmentStatus === 'PENDING' && <Button size="sm" onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}>Accept</Button>}
                  {booking.appointmentStatus === 'CONFIRMED' && <Button size="sm" onClick={() => handleStatusChange(booking.id, 'COMPLETED')}>Complete</Button>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 1. NO PROFILE -> BLOCK
  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">👤</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Setup Your Profile</h1>
          <p className="text-slate-600 mb-8">You need to create your doctor profile to start using the platform.</p>
          <Button onClick={() => window.location.href = '/create-doctor-profile'} className="w-full py-3">Create Profile</Button>
        </div>
      </div>
    );
  }

  // 2. VERIFIED -> SHOW DASHBOARD (Prioritize this to handle legacy/bugged cases)
  if (profile.isVerified) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col z-20 hidden md:flex">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">D</div>
              <h1 className="font-bold text-xl text-slate-800">Doctor<span className="text-blue-600">Portal</span></h1>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {['appointments', 'slots', 'history', 'complaints', 'messages'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}>
                <span className="capitalize">{tab}</span>
              </button>
            ))}
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
          <div className="max-w-6xl mx-auto">
            {activeTab === 'appointments' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div><h3 className="font-bold text-lg mb-4 text-slate-700">Pending Requests</h3>{renderBookingList(['PENDING'])}</div>
                <div><h3 className="font-bold text-lg mb-4 text-slate-700">Upcoming</h3>{renderBookingList(['CONFIRMED'])}</div>
              </div>
            )}
            {activeTab === 'slots' && user && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <DoctorSlots doctorId={user.id} />
              </div>
            )}
            {activeTab === 'history' && <div><h3 className="font-bold text-lg mb-4">History</h3>{renderBookingList(['COMPLETED', 'CANCELLED'])}</div>}
            {activeTab === 'messages' && <Chat currentUserId={user.id} otherUserId={null} otherUserName={null} onClose={() => { }} />}
          </div>
        </main>
      </div>
    );
  }

  // 3. NO KYC -> BLOCK
  if (!profile.kycDocumentPath) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl border-t-4 border-amber-500">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">📂</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">KYC Required</h1>
          <p className="text-slate-600 mb-8">Please upload your KYC documents to complete verification. Access to dashboard is restricted.</p>
          <Button onClick={() => window.location.href = '/create-doctor-profile'} className="w-full py-3 bg-amber-600 hover:bg-amber-700">Complete KYC</Button>
        </div>
      </div>
    );
  }

  // 3. PENDING VERIFICATION -> BLOCK/READ-ONLY
  if (!profile.isVerified) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl border-t-4 border-blue-500">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">⏳</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Verification Pending</h1>
          <p className="text-slate-600 mb-6">Your profile and KYC documents have been submitted and are currently under review by the Admin.</p>
          <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-500 mb-4">
            Validation usually takes 24-48 hours. You will receive an email once approved.
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>Check Status</Button>
        </div>
      </div>
    );
  }



  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col z-20 hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">D</div>
            <h1 className="font-bold text-xl text-slate-800">Doctor<span className="text-primary">Portal</span></h1>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {['appointments', 'slots', 'history', 'complaints', 'messages'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === tab ? 'bg-primary/10 text-primary font-bold shadow-sm translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}>
              <span className="capitalize">{tab}</span>
            </button>
          ))}
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
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'appointments' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div><h3 className="font-bold text-lg mb-4 text-slate-700">Pending Requests</h3>{renderBookingList(['PENDING'])}</div>
                  <div><h3 className="font-bold text-lg mb-4 text-slate-700">Upcoming</h3>{renderBookingList(['CONFIRMED'])}</div>
                </div>
              )}
              {activeTab === 'slots' && user && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <DoctorSlots doctorId={user.id} />
                </div>
              )}
              {activeTab === 'history' && <div><h3 className="font-bold text-lg mb-4">History</h3>{renderBookingList(['COMPLETED', 'CANCELLED'])}</div>}
              {activeTab === 'messages' && <Chat currentUserId={user.id} otherUserId={null} otherUserName={null} onClose={() => { }} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;


