import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import AddDoctorModal from './AddDoctorModal';

interface Doctor {
    name: string;
    id: string;
    image: string;
    department: string;
    patients: string[];
    patientCount: number;
    status: string;
    statusColor: 'emerald' | 'amber' | 'red';
    experience?: number;
    fee?: number;
    hospital?: string;
    email?: string;
    password?: string;
}

const staticDoctors: Doctor[] = [
    {
        name: 'Dr. Sarah Wilson',
        id: '#DOC-1024',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTRQkqcUObxncDIxNluMa4RoBedvuSK-y5zxx9ry7MDCYBqe4UE97rOHpx2y8E2t7MxRuVnC3mKE7ESQdPZ0BfIw1NITXa7NKrkxII8L3Jc-Gr5wxwTJ2Ct6OLjHCVYSQgCMghuoLk5A-a-IlFECBg8tTIlTRA1VaTBwNTW0oV2FPEuhyKRxBrv95UcwaNlSOx8y4fjD2D4zrf4E-qpW2Eq0vUdddrpirvYpjEnz-LX-h1eIZUEWIxbpvjUp1Bj3OL7nyYrkcsreE',
        department: 'Cardiology',
        patients: [
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDy3924JG6eocxV7PU8PRYv9--vaqlLnAiIdj_80BilOjQsCn-bC4YkGTdgDJN7RzozczX12sNR9f0UM7yjAkZkrJ_xVlOv-7XoUbnIdSandTLnGGv67LJySgOVZNRG6SR2giLdbQwZUdVkB2OecAQ_E5HMKdXsivb08aX-3NXCEX0m5iGaruJ0ORM88AgrOpSsnEmleJKxXRfyLW5Q4APnVGuEoBIaxJjo_Wh75pNOejnvzlFXzpEYc5wW50TtIDuTTU96aWFnZ-A',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuB_w8ANyzLKGfstq-1-GB_euvngd0RLX2gE0Mq2bg77w95iKIQy4OEgza5r09MakvxCe6Ub3Pqo6XFP08CO2yLlA6zZpmCO7Qs6m-y5KsE2vxeE8wF2ZJbk1A1cxC1WJFvWNDv-LD1PuumGdGeAfTOvbvJ2UFaCGIM6ErhCWjPQ83KkESTQB8rQQ0NKcKGQ5jBEEczmJdL3L2p6-5Ydl7CQ8Dm5ZGLXpA-F0iWndim1wsfjb5XtJ2-zVhoBqEhoSWPE8STrFM9mFx0',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDW0gW8MzBXcckRqb3AXjG2FwpVBuIUAhOP7lPnc1vLH90iD-OoaJXCB5s_J-rsJ1Jf2AU3PjzTuL5CT0nRp7mdhAFmuo4bedAsC1BH9fjYKicEQCCQS_cOpmGs6Ax7j_rIY3OJCmVEZzMxtnLq_QEYQviu2Dku-oZ39e4j5bX3Oqko8mFjawPe2_KF4MKTxUAZo5dxHUTRItAjU6bbkEt6Ju7jm6Av6yevNqRq0dy7N7Ior2JV3RRX3ZH6Vp3Q06BjS6rmwZt1mjw',
        ],
        patientCount: 12,
        status: 'Available',
        statusColor: 'emerald',
    }
];

interface StatusBadgeProps {
    status: string;
    color: 'emerald' | 'amber' | 'red';
}

const StatusBadge = ({ status, color }: StatusBadgeProps) => {
    const colorClasses = {
        emerald: 'bg-emerald-100 text-emerald-800',
        amber: 'bg-amber-100 text-amber-800',
        red: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]}`}>
            {status}
        </span>
    );
};


interface DoctorDirectoryProps {
    onEditDoctor: (doctor: any) => void;
    onViewProfile: (id: string) => void;
    onAddDoctorClick: () => void;
    refreshTrigger?: number;
}

export default function DoctorDirectory({ onEditDoctor, onViewProfile, onAddDoctorClick, refreshTrigger }: DoctorDirectoryProps) {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const fetchDoctors = async () => {
        try {
            const response = await fetch('/api/doctors');
            if (response.ok) {
                const data = await response.json();
                const formattedDoctors = data.map((d: any) => ({
                    ...d, // Keep all raw backend fields
                    displayId: `#DOC-${d.id + 1000}`,
                    name: d.user?.name || 'Unknown',
                    image: '', // No default image
                    department: d.specialization,
                    patients: [],
                    patientCount: 0,
                    status: d.user?.status || 'active',
                    statusColor: 'emerald' as const,
                    experience: d.experienceYears,
                    fee: d.consultantFee,
                    hospital: d.primaryHospital,
                    email: d.user?.email || '',
                    password: d.user?.password || '',
                }));
                // Combine static ones with DB ones but without random images for DB ones
                setDoctors(formattedDoctors);
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };

    const handleDeleteDoctor = async (id: any) => {
        if (!window.confirm('Are you sure you want to delete this doctor? This will also delete all their availability records.')) return;

        try {
            const response = await fetch(`/api/doctors/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchDoctors();
            } else {
                alert('Failed to delete doctor');
            }
        } catch (error) {
            console.error('Error deleting doctor:', error);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, [refreshTrigger]);

    const toggleStatus = async (doctor: any) => {
        const currentStatus = doctor.user?.status || doctor.status;
        const newStatus = (currentStatus?.toLowerCase() === 'active') ? 'inactive' : 'active';
        
        try {
            const response = await fetch(`/api/users/${doctor.user?._id || doctor.user?.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                showNotification(`Doctor account ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`, 'success');
                fetchDoctors();
            } else {
                showNotification('Failed to update account status', 'error');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showNotification('Error updating account status', 'error');
        }
    };

    return (
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Doctor Directory</h3>
                    <p className="text-sm text-text-secondary mt-1 font-medium">Manage and monitor all clinic specialists</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={onAddDoctorClick}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Add Doctor
                    </button>
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        <input className="pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 w-full sm:w-72 placeholder:text-slate-400 text-slate-700 bg-slate-50/50 hover:bg-slate-50 transition-all font-medium" placeholder="Search doctor name or ID" type="text" />
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/10 custom-scrollbar">
                <div className="flex flex-col gap-4 max-w-5xl mx-auto">
                    {doctors.map((doctor: any) => (
                        <div key={doctor.id} className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 flex items-center p-5 relative overflow-hidden">
                            {/* Identity Section */}
                            <div className="flex items-center gap-6 flex-1 min-w-0">
                                <div className="size-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100 shadow-inner group-hover:bg-primary/5 transition-colors shrink-0">
                                    {doctor.image ? (
                                        <img src={doctor.image} alt={doctor.name} className="size-full object-cover rounded-2xl" />
                                    ) : (
                                        <span className="material-symbols-outlined text-3xl">stethoscope</span>
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-lg font-extrabold text-slate-900 truncate group-hover:text-primary transition-colors">{doctor.name}</h4>
                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                                            doctor.status?.toLowerCase() === 'active' 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                            : 'bg-rose-50 text-rose-600 border-rose-100'
                                        }`}>
                                            {doctor.status || 'Active'}
                                        </span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-3">
                                        <span className="inline-flex px-3 py-0.5 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10">
                                            {doctor.department}
                                        </span>
                                        <div className="size-1 rounded-full bg-slate-200"></div>
                                        <span className="text-[11px] font-bold text-slate-500">{doctor.experience} Years Experience</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Section */}
                            <div className="flex items-center gap-3 pl-8 shrink-0">
                                <button
                                    onClick={() => toggleStatus(doctor)}
                                    className={`px-6 h-11 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 ${
                                        doctor.status?.toLowerCase() === 'active' 
                                        ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-200' 
                                        : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200'
                                    }`}
                                >
                                    {doctor.status?.toLowerCase() === 'active' ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                    onClick={() => onViewProfile(doctor.user?._id || doctor.user?.id)}
                                    className="px-6 h-11 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg active:scale-95 flex items-center gap-2 group/btn"
                                    title="View Profile"
                                >
                                    <span className="material-symbols-outlined text-lg">visibility</span>
                                    View Profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="px-12 py-5 border-t border-slate-100 flex items-center justify-between bg-white relative z-10">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Total Specialists: <span className="text-primary font-black">{doctors.length}</span></p>
                <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Directory Online</span>
                </div>
            </div>
        </div>
    );
}
