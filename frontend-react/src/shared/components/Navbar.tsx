import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel transition-all font-sans">
      <div className="container mx-auto px-6 h-[72px] flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-white p-1.5 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent tracking-tight">
            MediBook
          </span>
        </Link>


        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={`text-sm font-semibold transition-colors ${isActive('/') ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'}`}>Home</Link>
          <Link to="/services" className={`text-sm font-semibold transition-colors ${isActive('/services') ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'}`}>Find Doctors</Link>
          {!user && (
            <Link to="/register-doctor" className={`text-sm font-semibold transition-colors ${isActive('/register-doctor') ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'}`}>For Doctors</Link>
          )}
        </div>


        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/chat">
                <Button variant="outline" className={`text-sm font-medium border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 ${isActive('/chat') ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}>
                  Chat
                </Button>
              </Link>
              <Link to={user.role === 'ADMIN' ? "/admin" : "/dashboard"}>
                <Button variant="outline" className={`text-sm font-medium border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 ${isActive('/dashboard') || isActive('/admin') ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}>
                  Dashboard
                </Button>
              </Link>
              <div className="h-8 w-[1px] bg-slate-200"></div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800 leading-none mb-1">{user.name}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{user.role}</div>
                </div>
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-10 h-10 rounded-full border-2 border-slate-100 object-cover shadow-sm" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200 shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-slate-50 rounded-full"
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600 px-4 py-2 hover:bg-slate-50 rounded-full transition-all">
                Login
              </Link>
              <Link to="/register">
                <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 hover:shadow-lg text-sm px-6 py-2.5 rounded-full font-bold">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>


        <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>


      {isMenuOpen && (
        <div className="md:hidden absolute top-[72px] left-0 w-full bg-white border-b border-slate-100 shadow-xl animate-fade-in z-40">
          <div className="flex flex-col p-4 gap-2">
            <Link to="/" className="p-3 rounded-lg hover:bg-slate-50 font-semibold text-slate-700" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/services" className="p-3 rounded-lg hover:bg-slate-50 font-semibold text-slate-700" onClick={() => setIsMenuOpen(false)}>Find Doctors</Link>
            {!user && <Link to="/register-doctor" className="p-3 rounded-lg hover:bg-slate-50 font-semibold text-slate-700" onClick={() => setIsMenuOpen(false)}>For Doctors</Link>}
            <div className="h-[1px] bg-slate-100 my-2"></div>
            {user ? (
              <>
                <Link to="/dashboard" className="p-3 rounded-lg hover:bg-slate-50 font-semibold text-slate-700" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                <Link to="/chat" className="p-3 rounded-lg hover:bg-slate-50 font-semibold text-slate-700" onClick={() => setIsMenuOpen(false)}>Chat</Link>
                <button onClick={handleLogout} className="p-3 rounded-lg hover:bg-red-50 font-semibold text-red-600 text-left w-full">Logout</button>
              </>
            ) : (
              <div className="flex gap-3 mt-2">
                <Link to="/login" className="flex-1" onClick={() => setIsMenuOpen(false)}><Button variant="outline" className="w-full justify-center">Login</Button></Link>
                <Link to="/register" className="flex-1" onClick={() => setIsMenuOpen(false)}><Button className="w-full justify-center bg-blue-600 text-white">Sign Up</Button></Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
