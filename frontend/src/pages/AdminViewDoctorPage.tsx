import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import AddDoctorModal from '../components/AddDoctorModal';
import { useNotification } from '../context/NotificationContext';

export default function AdminViewDoctorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { showNotification } = useNotification();
    const [doctor, setDoctor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [availabilities, setAvailabilities] = useState<any[]>([]);
    const [schedules, setSchedules] = useState<any[]>([]);

    const fetchDoctorProfile = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/doctors/user/${id}`);
            if (response.ok) {
                const data = await response.json();
                setDoctor(data);
                
                // Fetch availabilities using doctor id (not user id)
                if (data.id) {
                    const [availRes, schedRes] = await Promise.all([
                        fetch(`/api/doctors/${data.id}/availabilities`),
                        fetch(`/api/schedule?doctorId=${data.id}`)
                    ]);

                    if (availRes.ok) setAvailabilities(await availRes.json());
                    if (schedRes.ok) setSchedules(await schedRes.json());
                }
                
                // Check if we should open edit modal from navigation state
                if (location.state?.openEdit) {
                    setIsEditModalOpen(true);
                    // Clear state to avoid reopening on refresh
                    window.history.replaceState({}, document.title);
                }
            } else {
                const userResponse = await fetch(`/api/users/${id}`);
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setDoctor({ user: userData, fullName: userData.name });
                }
            }
        } catch (error) {
            console.error('Error fetching doctor details:', error);
            showNotification('Failed to load doctor profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchDoctorProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen bg-slate-50 items-center justify-center">
                <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!doctor) {
        return <div className="flex h-screen items-center justify-center text-slate-500 font-bold">Doctor Profile Not Found</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-white relative custom-scrollbar text-slate-900 border-l border-slate-100">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => navigate('/admin/doctors')}
                                className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm"
                                title="Back to Directory"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                            <h1 className="text-2xl font-bold text-slate-800">Specialist Profile</h1>
                        </div>
                        <p className="text-sm text-slate-400 mt-1 ml-13">Detailed view of the specialist's clinical qualifications and credentials.</p>
                    </div>
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined">edit</span>
                        Edit Details
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-10 py-5 bg-slate-50/50">
                    <div className="max-w-4xl mx-auto flex flex-col gap-8">
                        {/* Profile Header Card */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="h-32 bg-gradient-to-r from-primary/80 to-primary shadow-inner"></div>
                            <div className="px-10 pb-10">
                                <div className="relative -mt-16 mb-6 flex items-end gap-8">
                                    <div className="size-32 rounded-3xl bg-white p-1 shadow-2xl shadow-slate-200/50">
                                        <div className="size-full rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-50">
                                            <span className="material-symbols-outlined text-6xl">stethoscope</span>
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{doctor.user?.name || doctor.fullName}</h2>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-lg">
                                                {doctor.specialization || 'General Specialist'}
                                            </span>
                                            <span className="size-1.5 rounded-full bg-slate-300"></span>
                                            <p className="text-slate-500 font-bold text-sm">{doctor.user?.gender}, {doctor.user?.age} Years Old</p>
                                        </div>
                                    </div>
                                    <div className="ml-auto mb-2 flex flex-col items-end gap-2">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                                            doctor.user?.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                        }`}>
                                            {doctor.user?.status === 'active' ? 'Accredited' : 'Incative'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-10 pt-10 border-t border-slate-50">
                                    <StatItem label="Years of Experience" value={`${doctor.experienceYears || '0'} Years`} />
                                    <StatItem label="Consultant Fee" value={`Rs. ${doctor.consultantFee || '0'}.00`} color="text-emerald-600" />
                                    <StatItem label="Primary Medical Center" value={doctor.primaryHospital || 'Main Clinic'} />
                                </div>
                            </div>
                        </div>

                        {/* Details Sections */}
                        <div className="grid grid-cols-2 gap-8">
                            {/* Contact Card */}
                            <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
                                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">contact_mail</span>
                                    Contact Details
                                </h3>
                                <div className="space-y-8">
                                    <IconDetail icon="mail" label="E-Mail Address" value={doctor.user?.email} />
                                    <IconDetail icon="call" label="Direct Phone" value={doctor.user?.phone} />
                                    <IconDetail icon="id_card" label="NIC / Registration" value={doctor.user?.nic} />
                                </div>
                            </div>

                            {/* Medical Background */}
                            <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full">
                                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">history_edu</span>
                                    Professional Summary
                                </h3>
                                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex-1">
                                    <p className="text-slate-600 font-semibold leading-relaxed">
                                        Dr. {doctor.user?.name} is a board-certified specialist in {doctor.specialization || 'General Medicine'}. 
                                        {doctor.medicalHistory || 'No additional professional history provided.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Clinical Schedule Section */}
                        <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">calendar_month</span>
                                Active Clinic Schedules
                            </h3>
                            
                            {schedules.length === 0 ? (
                                <div className="py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-300 text-5xl mb-3">calendar_today</span>
                                    <p className="text-slate-400 font-bold">No active sessions scheduled for this specialist</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {schedules.map((session, idx) => (
                                        <div key={idx} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 block">{session.dayOfWeek}</span>
                                                    <h4 className="text-lg font-black text-slate-800 tracking-tight">{session.date}</h4>
                                                </div>
                                                <div className="px-3 py-1 bg-white rounded-lg border border-slate-100 text-[10px] font-black text-slate-500 shadow-sm">
                                                    {session.timeBlock}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-6 border-t border-slate-100/50">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-slate-400 text-lg">door_open</span>
                                                    <span className="text-xs font-bold text-slate-500">{session.room?.name || 'Room N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{session.enrolledPatients?.length || 0} Booked</span>
                                                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-8 flex items-center justify-between text-[11px] font-bold text-slate-400 px-2">
                                <span>Total Sessions Found: {schedules.length}</span>
                                <span className="text-primary hover:underline cursor-pointer" onClick={() => navigate('/admin/scheduling')}>Update Timetable →</span>
                            </div>
                        </div>

                        <div className="h-20"></div> {/* Spacer for bottom padding */}
                    </div>
                </div>

                <AddDoctorModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onAdd={() => fetchDoctorProfile()}
                    initialData={doctor}
                />
            </main>
        </div>
    );
}

function StatItem({ label, value, color = "text-slate-800" }: { label: string, value: string, color?: string }) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <span className={`text-xl font-black tracking-tight ${color}`}>{value}</span>
        </div>
    );
}

function IconDetail({ icon, label, value }: { icon: string, label: string, value: string }) {
    return (
        <div className="flex items-center gap-5 group">
            <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300">
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-0.5">{label}</p>
                <p className="font-bold text-slate-800 tracking-tight">{value || 'N/A'}</p>
            </div>
        </div>
    );
}
