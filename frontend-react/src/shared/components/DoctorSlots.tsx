import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import Button from './Button';


interface Slot {
    id: number;
    startTime: string;
    endTime: string;
    booked: boolean;
    capacity: number;
    bookedCount: number;
}

interface DoctorSlotsProps {
    doctorId: number;
}

const DoctorSlots: React.FC<DoctorSlotsProps> = ({ doctorId }) => {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [capacity, setCapacity] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchSlots = async () => {
        try {
            const res: any = await api.get(`/api/slots/doctor/${doctorId}`);
            setSlots(res || []);
        } catch (err) {
            console.error("Failed to fetch slots", err);
        }
    };

    useEffect(() => {
        if (doctorId) fetchSlots();
    }, [doctorId]);

    const handleCreateSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !startTime || !endTime) return;

        setLoading(true);
        try {
            const startDateTime = `${date}T${startTime}:00`;
            const endDateTime = `${date}T${endTime}:00`;

            await api.post('/api/slots/create', {
                doctorId,
                startTime: startDateTime,
                endTime: endDateTime,
                capacity: Number(capacity)
            });
            alert('Slot created successfully');
            fetchSlots();
            setStartTime('');
            setEndTime('');
            setCapacity(1);
        } catch (err) {
            console.error("Failed to create slot", err);
            alert('Failed to create slot');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card border-slate-200 mt-6">
            <h3 className="text-xl font-bold mb-4 text-slate-800">Manage Availability Slots</h3>

            <form onSubmit={handleCreateSlot} className="flex flex-wrap gap-4 items-end mb-8 p-4 bg-slate-50 rounded-lg">
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input
                        type="date"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
                <div className="flex-1 min-w-[120px]">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                    <input
                        type="time"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                    />
                </div>
                <div className="flex-1 min-w-[120px]">
                    <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                    <input
                        type="time"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                    />
                </div>
                <div className="flex-1 min-w-[100px]">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                    <input
                        type="number"
                        min="1"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={capacity}
                        onChange={(e) => setCapacity(parseInt(e.target.value))}
                        required
                    />
                </div>
                <div className="pb-0.5">
                    <Button type="submit" isLoading={loading}>Add Slot</Button>
                </div>
            </form>

            <div className="space-y-2">
                <h4 className="font-semibold text-slate-700">Your Slots</h4>
                {slots.length === 0 ? (
                    <p className="text-gray-500 text-sm">No slots created yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {slots.map(slot => (
                            <div key={slot.id} className={`p-3 rounded border ${slot.booked ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                <div className="text-sm font-bold mb-1">
                                    {new Date(slot.startTime).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-slate-600 mb-1">
                                    {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="flex justify-between items-center mt-2 border-t pt-2 border-dashed border-slate-300">
                                    <span className={`text-xs font-bold uppercase ${slot.booked ? 'text-red-700' : 'text-green-700'}`}>
                                        {slot.booked ? 'Full' : 'Available'}
                                    </span>
                                    <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                                        {slot.bookedCount || 0} / {slot.capacity || 1}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorSlots;
