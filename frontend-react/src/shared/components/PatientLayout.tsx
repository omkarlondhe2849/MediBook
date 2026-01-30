import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PatientLayoutProps {
    children: React.ReactNode;
    activePage?: 'overview' | 'bookings' | 'find-doctors' | 'messages';
    hideSidebar?: boolean;
}

const PatientLayout: React.FC<PatientLayoutProps> = ({ children, activePage, hideSidebar = false }) => {
    const { user } = useAuth();
    const location = useLocation();

    // Determine active page
    const currentPath = location.pathname;
    const derivedActivePage = activePage ||
        (currentPath === '/dashboard' ? 'overview' :
            currentPath.startsWith('/bookings') ? 'bookings' :
                currentPath.startsWith('/services') ? 'find-doctors' :
                    currentPath.startsWith('/chat') ? 'messages' : 'overview');

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

            {/* Sidebar */}
            {!hideSidebar && (
                <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col z-20 hidden md:flex transition-all duration-300">

                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">P</div>
                            <h1 className="font-bold text-xl text-slate-800 tracking-tight">My<span className="text-emerald-600">Health</span></h1>
                        </div>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        <Link to="/dashboard">
                            <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${derivedActivePage === 'overview' ? 'bg-emerald-50 text-emerald-700 font-bold shadow-sm translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}>
                                <span className="text-lg">🏠</span> Overview
                            </button>
                        </Link>
                        <Link to="/bookings">
                            <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${derivedActivePage === 'bookings' ? 'bg-emerald-50 text-emerald-700 font-bold shadow-sm translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}>
                                <span className="text-lg">📅</span> My Bookings
                            </button>
                        </Link>
                        <Link to="/services">
                            <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${derivedActivePage === 'find-doctors' ? 'bg-emerald-50 text-emerald-700 font-bold shadow-sm translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}>
                                <span className="text-lg">🔍</span> Find Doctors
                            </button>
                        </Link>
                        <Link to="/chat">
                            <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${derivedActivePage === 'messages' ? 'bg-emerald-50 text-emerald-700 font-bold shadow-sm translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}>
                                <span className="text-lg">💬</span> Messages
                            </button>
                        </Link>
                    </nav>

                    <div className="p-4 border-t border-slate-100">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="font-bold text-slate-900 truncate">{user?.name}</div>
                            <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                        </div>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-full p-4 md:p-8 relative scroll-smooth">
                {/* Mobile Header */}
                <div className="md:hidden mb-4 flex justify-between items-center pb-4 border-b border-slate-200">
                    <h1 className="font-bold text-lg text-slate-800">MyHealth</h1>
                    <div className="flex gap-2">
                        <Link to="/dashboard" className={`p-2 rounded-lg ${derivedActivePage === 'overview' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>🏠</Link>
                        <Link to="/bookings" className={`p-2 rounded-lg ${derivedActivePage === 'bookings' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>📅</Link>
                        <Link to="/services" className={`p-2 rounded-lg ${derivedActivePage === 'find-doctors' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>🔍</Link>
                        <Link to="/chat" className={`p-2 rounded-lg ${derivedActivePage === 'messages' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>💬</Link>
                    </div>
                </div>

                {children}
            </main>
        </div>
    );
};

export default PatientLayout;
