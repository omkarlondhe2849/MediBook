import React, { useState } from 'react';
import Button from './Button';
import { api } from '../api/client';

interface ReportIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId?: number;
    patientId: number;
    doctorId: number;
    onSuccess: () => void;
}

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
    isOpen,
    onClose,
    bookingId,
    patientId,
    doctorId,
    onSuccess
}) => {
    const [subject, setSubject] = useState('Doctor late for appointment');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await api.post('/api/complaints', {
                patientId,
                doctorId,
                appointmentId: bookingId,
                subject,
                description
            });
            onSuccess();
            onClose();
            alert('Issue reported successfully. Our support team will review it shortly.');
        } catch (err) {
            console.error(err);
            setError('Failed to report issue. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">Report an Issue</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Issue Type</label>
                        <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option>Doctor late for appointment</option>
                            <option>Doctor did not specific show up</option>
                            <option>Unprofessional behavior</option>
                            <option>Technical issues with call</option>
                            <option>Refund request</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px]"
                            placeholder="Please provide more details..."
                            required
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <Button type="button" variant="text" onClick={onClose} className="flex-1">Cancel</Button>
                        <Button type="submit" isLoading={submitting} className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none shadow-red-200">Submit Report</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportIssueModal;
