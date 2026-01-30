import React, { useState, useEffect } from 'react';
import { api } from '../../shared/api/client';
import { useAuth } from '../../shared/context/AuthContext';
import Button from '../../shared/components/Button';

interface Vacation {
    id: number;
    startDate: string;
    endDate: string;
    reason: string;
}

interface DoctorAvailability {
    id: number;
    morningStartTime: string;
    morningEndTime: string;
    afternoonStartTime: string;
    afternoonEndTime: string;
    capacity: number;
    active: boolean;
}

const DoctorAvailability: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'schedule' | 'vacation' | 'generate'>('schedule');


    const [availability, setAvailability] = useState<DoctorAvailability>({
        id: 0,
        morningStartTime: '',
        morningEndTime: '',
        afternoonStartTime: '',
        afternoonEndTime: '',
        capacity: 1,
        active: true
    });


    const [vacations, setVacations] = useState<Vacation[]>([]);
    const [vacationForm, setVacationForm] = useState({ startDate: '', endDate: '', reason: '' });


    const [generateDays, setGenerateDays] = useState(30);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user?.id) {
            fetchAvailability();
            fetchVacations();
        }
    }, [user]);

    const fetchAvailability = async () => {
        try {
            const res: any = await api.get(`/api/slots/availability/${user?.id}`);
            if (res) {
                const formatTime = (t: string) => t ? t.substring(0, 5) : '';
                setAvailability({
                    ...res,
                    morningStartTime: formatTime(res.morningStartTime),
                    morningEndTime: formatTime(res.morningEndTime),
                    afternoonStartTime: formatTime(res.afternoonStartTime),
                    afternoonEndTime: formatTime(res.afternoonEndTime),
                });
            }
        } catch (err) {
            console.log("No availability set yet");
        }
    };

    const fetchVacations = async () => {
        try {
            const res: any = await api.get(`/api/slots/vacation/${user?.id}`);
            setVacations(res || []);
        } catch (err) {
            console.error("Failed to fetch vacations", err);
        }
    };

    const handleSaveAvailability = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            // Ensure correct time format
            const payload = {
                doctorId: user?.id,
                morningStartTime: availability.morningStartTime ? availability.morningStartTime + ":00" : null,
                morningEndTime: availability.morningEndTime ? availability.morningEndTime + ":00" : null,
                afternoonStartTime: availability.afternoonStartTime ? availability.afternoonStartTime + ":00" : null,
                afternoonEndTime: availability.afternoonEndTime ? availability.afternoonEndTime + ":00" : null,
                capacity: availability.capacity,
                active: availability.active
            };
            await api.post('/api/slots/availability', payload);
            setMessage({ type: 'success', text: 'Schedule settings saved successfully.' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed to save settings.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddVacation = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            await api.post('/api/slots/vacation', { ...vacationForm, doctorId: user?.id });
            setMessage({ type: 'success', text: 'Vacation added.' });
            setVacationForm({ startDate: '', endDate: '', reason: '' });
            fetchVacations();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed to add vacation.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVacation = async (id: number) => {
        if (!window.confirm("Delete this vacation?")) return;
        try {
            await api.delete(`/api/slots/vacation/${id}`);
            fetchVacations();
        } catch (err) {
            console.error(err);
        }
    };

    const handleGenerateSlots = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const res: any = await api.post('/api/slots/generate-bulk', { doctorId: user?.id, days: generateDays });
            setMessage({ type: 'success', text: res });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed to generate slots.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-4xl py-8">
            <h1 className="text-3xl font-bold mb-6 text-slate-800">Availability Management</h1>

            {message && (
                <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`pb-2 px-4 font-medium ${activeTab === 'schedule' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Daily Schedule
                </button>
                <button
                    onClick={() => setActiveTab('vacation')}
                    className={`pb-2 px-4 font-medium ${activeTab === 'vacation' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Vacation Mode
                </button>
                <button
                    onClick={() => setActiveTab('generate')}
                    className={`pb-2 px-4 font-medium ${activeTab === 'generate' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Generate Slots
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                {activeTab === 'schedule' && (
                    <form onSubmit={handleSaveAvailability}>
                        <h2 className="text-xl font-semibold mb-4">Daily Fixed Slots</h2>
                        <p className="text-sm text-gray-500 mb-6">Set your standard availability for morning and afternoon shifts.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="p-4 bg-orange-50 rounded-lg">
                                <h3 className="font-medium text-orange-800 mb-3">Morning Shift</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            className="input-field w-full"
                                            value={availability.morningStartTime}
                                            onChange={e => setAvailability({ ...availability, morningStartTime: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">End Time</label>
                                        <input
                                            type="time"
                                            className="input-field w-full"
                                            value={availability.morningEndTime}
                                            onChange={e => setAvailability({ ...availability, morningEndTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-medium text-blue-800 mb-3">Afternoon Shift</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            className="input-field w-full"
                                            value={availability.afternoonStartTime}
                                            onChange={e => setAvailability({ ...availability, afternoonStartTime: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">End Time</label>
                                        <input
                                            type="time"
                                            className="input-field w-full"
                                            value={availability.afternoonEndTime}
                                            onChange={e => setAvailability({ ...availability, afternoonEndTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm text-gray-600 mb-1">Patients per Slot (Capacity)</label>
                            <input
                                type="number"
                                min="1"
                                className="input-field w-full md:w-1/3"
                                value={availability.capacity || ''}
                                onChange={e => {
                                    const val = parseInt(e.target.value);
                                    setAvailability({ ...availability, capacity: isNaN(val) ? 0 : val });
                                }}
                            />
                            <p className="text-xs text-gray-500 mt-1">Number of patients allowed to book the same time slot.</p>
                        </div>

                        <div className="flex items-center mb-6">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={availability.active}
                                onChange={e => setAvailability({ ...availability, active: e.target.checked })}
                                className="mr-2 h-4 w-4 text-blue-600"
                            />
                            <label htmlFor="isActive" className="text-gray-700">Enable Daily Schedule</label>
                        </div>

                        <Button type="submit" isLoading={loading}>Save Settings</Button>
                    </form>
                )}

                {activeTab === 'vacation' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Vacation Planner</h2>
                        <form onSubmit={handleAddVacation} className="mb-8 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="input-field w-full"
                                        value={vacationForm.startDate}
                                        onChange={e => setVacationForm({ ...vacationForm, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="input-field w-full"
                                        value={vacationForm.endDate}
                                        onChange={e => setVacationForm({ ...vacationForm, endDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Reason (Optional)</label>
                                    <input
                                        type="text"
                                        className="input-field w-full"
                                        placeholder="e.g. Annual Leave"
                                        value={vacationForm.reason}
                                        onChange={e => setVacationForm({ ...vacationForm, reason: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button type="submit" isLoading={loading} variant="outline">Add Vacation</Button>
                        </form>

                        <div className="space-y-3">
                            <h3 className="font-medium text-gray-700">Upcoming Vacations</h3>
                            {vacations.length === 0 ? (
                                <p className="text-sm text-gray-500">No vacations scheduled.</p>
                            ) : (
                                vacations.map(v => (
                                    <div key={v.id} className="flex justify-between items-center p-3 border border-gray-200 rounded hover:bg-gray-50">
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {new Date(v.startDate).toLocaleDateString()} - {new Date(v.endDate).toLocaleDateString()}
                                            </p>
                                            {v.reason && <p className="text-sm text-gray-500">{v.reason}</p>}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteVacation(v.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'generate' && (
                    <div className="text-center py-8">
                        <div className="mb-6">
                            <svg className="w-16 h-16 mx-auto text-blue-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-xl font-semibold mb-2">Generate Slots</h2>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Automatically create appointment slots for the next 30 days based on your "Daily Schedule" settings.
                                Vacation days will be skipped.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-4 mb-6">
                            <label className="text-sm text-gray-600">Days to generate:</label>
                            <input
                                type="number"
                                min="1"
                                max="90"
                                value={generateDays}
                                onChange={e => setGenerateDays(parseInt(e.target.value))}
                                className="w-20 p-2 border border-gray-300 rounded text-center"
                            />
                        </div>

                        <Button onClick={handleGenerateSlots} isLoading={loading} size="lg">
                            Generate Slots Now
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorAvailability;
