import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

interface ServiceCardProps {
    service: {
        id: number;
        doctorName: string;
        specialization: string;
        clinicCity: string;
        consultationFee: number;
        profilePhoto?: string;
    };
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group flex flex-col hover:shadow-md transition-all duration-300">
            <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        {service.profilePhoto ? (
                            <img src={service.profilePhoto} alt={service.doctorName} className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                        ) : (
                            <div className="w-16 h-16 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-2xl border border-indigo-100">
                                {service.doctorName.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h3 className="text-xl font-black text-slate-900 leading-tight">
                                {service.doctorName}
                            </h3>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide border border-slate-200">
                                {service.specialization}
                            </span>
                        </div>
                    </div>
                </div>

                <p className="text-slate-500 text-sm leading-relaxed mb-4 font-medium line-clamp-2">
                    Expert care in {service.specialization}.
                </p>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-slate-600 font-bold">
                        <span className="w-5 text-center mr-2 text-slate-400">🏥</span>
                        {service.clinicCity}
                    </div>
                    <div className="flex items-center text-sm text-slate-600 font-bold">
                        <span className="w-5 text-center mr-2 text-slate-400">💵</span>
                        ₹{service.consultationFee} Consultation Fee
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 mt-auto flex items-center justify-between gap-3">
                <div className="pl-2">
                    <div className="text-xs text-slate-400 uppercase font-black tracking-wide">Fee</div>
                    <div className="text-lg font-black text-slate-900">₹{service.consultationFee}</div>
                </div>
                <div className="flex gap-2">
                    <Link to={`/services/${service.id}`}>
                        <Button variant="outline" className="px-4 py-2 text-sm shadow-none">Profile</Button>
                    </Link>
                    <Link to={`/services/${service.id}?book=true`}>
                        <Button className="px-4 py-2 text-sm shadow-none bg-indigo-600 hover:bg-indigo-700 text-white border-transparent">Book Now</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;
