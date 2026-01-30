import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './shared/context/AuthContext';
import { ToastProvider } from './shared/context/ToastContext';
import Navbar from './shared/components/Navbar';
import Home from './features/home/Home';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Services from './features/services/Services';
import ServiceDetails from './features/services/ServiceDetails';
import Dashboard from './features/patient/Dashboard';
import DoctorDashboard from './features/doctor/DoctorDashboard';
import Bookings from './features/bookings/Bookings';
import BookingDetails from './features/bookings/BookingDetails';
import Profile from './features/user/Profile';
import ForgotPassword from './features/auth/ForgotPassword';
import ResetPassword from './features/auth/ResetPassword';
import CreateDoctorProfile from './features/doctor/CreateDoctorProfile';
import DoctorAvailability from './features/doctor/DoctorAvailability';
import AdminDashboard from './features/admin/AdminDashboard';
import Chat from './features/chat/Chat';


const ProtectedRoute = ({ children, roles }: { children: React.ReactElement, roles?: string[] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AppContent />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

import AIAssistant from './shared/components/AIAssistant';



import { AnimatePresence } from 'framer-motion';
import PageTransition from './shared/components/PageTransition';

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation(); // Need to import useLocation
  const shouldShowNavbar = true;

  return (
    <div className="app-layout">
      {shouldShowNavbar && <Navbar />}
      <main className="main-content">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
            <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
            <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
            <Route path="/services/:id" element={<PageTransition><ServiceDetails /></PageTransition>} />

            {/* User Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <PageTransition>
                  {user?.role === 'ADMIN' ? <Navigate to="/admin" replace /> :
                    user?.role === 'DOCTOR' ? <DoctorDashboard /> : <Dashboard />}
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/bookings" element={<ProtectedRoute><PageTransition><Bookings /></PageTransition></ProtectedRoute>} />
            <Route path="/bookings/:id" element={<ProtectedRoute><PageTransition><BookingDetails /></PageTransition></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><PageTransition><Chat /></PageTransition></ProtectedRoute>} />

            {/* Doctor Routes */}
            <Route path="/create-doctor-profile" element={
              <ProtectedRoute roles={['DOCTOR']}>
                <PageTransition><CreateDoctorProfile /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/doctor/availability" element={
              <ProtectedRoute roles={['DOCTOR']}>
                <PageTransition><DoctorAvailability /></PageTransition>
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['ADMIN']}>
                <PageTransition><AdminDashboard /></PageTransition>
              </ProtectedRoute>
            } />
          </Routes>
        </AnimatePresence>
      </main>

      <AIAssistant />
    </div>
  );
};


export default App;
