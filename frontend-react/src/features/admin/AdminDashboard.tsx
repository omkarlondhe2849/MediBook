import React, { useEffect, useState } from 'react';
import { api } from '../../shared/api/client';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'complaints'>('pending');
    const [users, setUsers] = useState<any[]>([]);
    const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);
    const [complaints, setComplaints] = useState<any[]>([]);

    useEffect(() => {
        fetchUsers();
        fetchPendingDoctors();
        fetchComplaints();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers((response as any[]) || []);
        } catch (error) {
            console.error("Failed to fetch users");
        }
    };

    const fetchPendingDoctors = async () => {
        try {
            const response = await api.get('/admin/doctors/pending');
            setPendingDoctors((response as any[]) || []);
        } catch (error) {
            console.error("Failed to fetch pending doctors");
        }
    };

    const fetchComplaints = async () => {
        try {
            const response = await api.get('/admin/complaints');
            setComplaints((response as any[]) || []);
        } catch (error) {
            console.error("Failed to fetch complaints");
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await api.post(`/admin/approve/${id}`, {});
            fetchPendingDoctors();
            fetchUsers();
        } catch (error) {
            console.error("Failed to approve doctor");
        }
    };

    const handleReject = async (id: number) => {
        if (!window.confirm("Are you sure you want to reject this doctor?")) return;
        try {
            await api.post(`/admin/reject/${id}`, {});
            fetchPendingDoctors();
            fetchUsers();
        } catch (error) {
            console.error("Failed to reject doctor");
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
            fetchPendingDoctors();
        } catch (error) {
            console.error("Failed to delete user");
        }
    };

    const handleUpdateComplaintStatus = async (id: number, status: string) => {
        try {
            await api.post(`/admin/complaints/${id}/status`, { status });
            fetchComplaints();
        } catch (error) {
            console.error("Failed to update complaint status");
        }
    };

    return (

        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col z-20 hidden md:flex">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">A</div>
                        <h1 className="font-bold text-xl tracking-tight text-slate-800">Admin<span className="text-indigo-600">Portal</span></h1>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'pending' ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}
                    >
                        <span className="text-lg">⏳</span> Pending Requests
                        {pendingDoctors.length > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">{pendingDoctors.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}
                    >
                        <span className="text-lg">👥</span> User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('complaints')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'complaints' ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}
                    >
                        <span className="text-lg">⚠️</span> Complaints
                        {complaints.filter((c: any) => c.status === 'PENDING').length > 0 && <span className="ml-auto bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">{complaints.filter((c: any) => c.status === 'PENDING').length}</span>}
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="font-bold text-slate-900">Administrator</div>
                        <div className="text-xs text-slate-500">System Control</div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-full p-4 md:p-8 relative">
                {/* Mobile Header */}
                <div className="md:hidden mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">A</div>
                        <h1 className="font-bold text-xl tracking-tight text-slate-800">Admin<span className="text-indigo-600">Portal</span></h1>
                    </div>
                    <div className="flex gap-2 text-xs overflow-x-auto pb-2 scrollbar-none">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'pending' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600'}`}
                        >
                            Pending Request
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600'}`}
                        >
                            User Management
                        </button>
                        <button
                            onClick={() => setActiveTab('complaints')}
                            className={`px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'complaints' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600'}`}
                        >
                            Complaints
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card bg-white border-slate-200 shadow-sm p-5">
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Users</div>
                        <div className="text-4xl font-black text-slate-900">{users.length}</div>
                    </div>
                    <div className="card bg-white border-slate-200 shadow-sm p-5">
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Doctors</div>
                        <div className="text-4xl font-black text-teal-600">{users.filter((u: any) => u.role === 'DOCTOR').length}</div>
                    </div>
                    <div className="card bg-white border-slate-200 shadow-sm p-5">
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Complaints</div>
                        <div className="text-4xl font-black text-amber-500">{complaints.filter((c: any) => c.status === 'PENDING').length}</div>
                    </div>
                </div>

                {/* Pending Doctors */}
                {activeTab === 'pending' && (
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Pending Doctor Approvals</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingDoctors.length === 0 ? (
                                <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-slate-300">
                                    <div className="text-5xl mb-4 grayscale opacity-40">✨</div>
                                    <div className="text-slate-500 font-medium">No pending approvals. All caught up!</div>
                                </div>
                            ) : (
                                pendingDoctors.map((doctor: any) => (
                                    <div key={doctor.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                                            {doctor.profilePhoto ? (
                                                <img src={doctor.profilePhoto} alt={doctor.name} className="w-14 h-14 rounded-full object-cover border border-slate-200" />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl">
                                                    {doctor.name?.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900">{doctor.name}</h3>
                                                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-bold uppercase">{doctor.specialization || 'General'}</span>
                                            </div>
                                        </div>

                                        <div className="p-6 grid grid-cols-2 gap-4 text-sm bg-slate-50/50 flex-1">
                                            <div>
                                                <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Experience</span>
                                                <span className="font-bold text-slate-800">{doctor.experienceYears || 0} Years</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Fees</span>
                                                <span className="font-bold text-slate-800">${doctor.consultationFee || 0}</span>
                                            </div>
                                        </div>

                                        <div className="p-4 flex gap-3 bg-white border-t border-slate-100">
                                            <button onClick={() => handleApprove(doctor.id)} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition-colors text-sm">
                                                Approve
                                            </button>
                                            <button onClick={() => handleReject(doctor.id)} className="flex-1 bg-white hover:bg-red-50 text-red-500 border border-slate-200 font-bold py-2 rounded-lg transition-colors text-sm">
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* User Management */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800">All System Users</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
                                        <th className="p-5">User</th>
                                        <th className="p-5">Role</th>
                                        <th className="p-5">Status</th>
                                        <th className="p-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.map((user: any) => (
                                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                                                        {user.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                                                        <div className="text-xs text-slate-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                    user.role === 'DOCTOR' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                                                        'bg-blue-50 text-blue-700 border-blue-200'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${user.role === 'DOCTOR' && !user.isVerified ? 'text-amber-500' : 'text-green-500'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.role === 'DOCTOR' && !user.isVerified ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                                                    {user.role === 'DOCTOR' && !user.isVerified ? 'Pending' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-all"
                                                    title="Delete User"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Complaints */}
                {activeTab === 'complaints' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Patient Complaints</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
                                        <th className="p-5">Issue</th>
                                        <th className="p-5">Reported By</th>
                                        <th className="p-5">Against</th>
                                        <th className="p-5">Status</th>
                                        <th className="p-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {complaints.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-10 text-center text-slate-500">No complaints found.</td>
                                        </tr>
                                    ) : (
                                        complaints.map((complaint: any) => (
                                            <tr key={complaint.id} className="hover:bg-slate-50 transition-colors bg-white">
                                                <td className="p-5 max-w-xs">
                                                    <div className="font-bold text-slate-900 text-sm">{complaint.subject}</div>
                                                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">{complaint.description}</div>
                                                    <div className="text-[10px] text-slate-400 mt-1 uppercase">ID: #{complaint.id} • Booking: #{complaint.appointmentId}</div>
                                                </td>
                                                <td className="p-5">
                                                    <div className="font-bold text-slate-800 text-sm">{complaint.patientName || `User #${complaint.patientId}`}</div>
                                                </td>
                                                <td className="p-5">
                                                    <div className="font-bold text-slate-800 text-sm">{complaint.doctorName || `Dr. #${complaint.doctorId}`}</div>
                                                </td>
                                                <td className="p-5">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${complaint.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                        complaint.status === 'RESOLVED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            'bg-slate-100 text-slate-600 border-slate-200'
                                                        }`}>
                                                        {complaint.status}
                                                    </span>
                                                </td>
                                                <td className="p-5 text-right">
                                                    {complaint.status === 'PENDING' && (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleUpdateComplaintStatus(complaint.id, 'RESOLVED')}
                                                                className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded hover:bg-green-100 border border-green-200"
                                                            >
                                                                Resolve
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateComplaintStatus(complaint.id, 'DISMISSED')}
                                                                className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded hover:bg-slate-100 border border-slate-200"
                                                            >
                                                                Dismiss
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
