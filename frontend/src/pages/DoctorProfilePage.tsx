import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useEffect, useState } from 'react';
import AddDoctorModal from '../components/AddDoctorModal';

export default function DoctorProfilePage() {
    const [doctor, setDoctor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [availabilities, setAvailabilities] = useState<any[]>([]);
    const [schedules, setSchedules] = useState<any[]>([]);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            fetchDoctorProfile(user.id);
        }
    }, []);

    const fetchDoctorProfile = async (userId: number) => {
        try {
            const response = await fetch(`/api/doctors/user/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setDoctor(data);

                // Fetch data for the sub-sections
                if (data.id) {
                    const [availRes, schedRes] = await Promise.all([
                        fetch(`/api/doctors/${data.id}/availabilities`),
                        fetch(`/api/schedule?doctorId=${data.id}`)
                    ]);
                    if (availRes.ok) setAvailabilities(await availRes.json());
                    if (schedRes.ok) setSchedules(await schedRes.json());
                }
            }
        } catch (error) {
            console.error('Error fetching doctor profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const isDayPassed = (dayName: string) => {
        const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const today = new Date();
        const currentDayIndex = (today.getDay() + 6) % 7; // Monday=0, ..., Sunday=6
        const targetDayIndex = daysOrder.indexOf(dayName);
        return currentDayIndex > targetDayIndex;
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-slate-50 items-center justify-center">
                <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light relative custom-scrollbar text-slate-900">
                <Header title="My Profile" />
                <div className="flex-1 overflow-y-auto p-10">
                    <div className="max-w-4xl mx-auto flex flex-col gap-8">

                        {/* Profile Header Card */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="h-32 bg-gradient-to-r from-primary to-primary-dark"></div>
                            <div className="px-10 pb-10">
                                <div className="relative -mt-16 mb-6 flex items-end gap-6">
                                    <div
                                        className="size-32 rounded-3xl bg-white p-1 shadow-xl shadow-slate-200/50"
                                    >
                                        <div className="size-full rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                                            <span className="material-symbols-outlined text-6xl">person</span>
                                        </div>
                                    </div>
                                    <div className="mb-2 flex-1">
                                        <div className="flex items-center justify-between gap-4">
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{doctor?.user?.name || doctor?.fullName}</h2>
                                            <button 
                                                onClick={() => setIsEditModalOpen(true)}
                                                className="px-6 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                                Edit Profile
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <p className="text-primary font-bold">{doctor?.specialization}</p>
                                            <span className="size-1 rounded-full bg-slate-300"></span>
                                            <p className="text-slate-500 font-medium">{doctor?.user?.gender}, {doctor?.user?.age} Years</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-slate-100">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Experience</span>
                                        <span className="text-lg font-bold text-slate-800">{doctor?.experienceYears} Years</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Consultant Fee</span>
                                        <span className="text-lg font-bold text-slate-800">LKR {doctor?.consultantFee}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Primary Hospital</span>
                                        <span className="text-lg font-bold text-slate-800">{doctor?.primaryHospital}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Details */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">contact_mail</span>
                                    Contact Information
                                </h3>
                                <div className="flex flex-wrap gap-6">
                                    <div className="flex-1 min-w-[280px] flex items-center gap-4 p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100/50 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                                        <div className="size-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-2xl">mail</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                                            <p className="font-bold text-slate-700 text-[13px] break-all">{doctor?.user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-[200px] flex items-center gap-4 p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100/50 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                                        <div className="size-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-2xl">call</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                                            <p className="font-bold text-slate-700 text-[13px]">{doctor?.user?.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-[200px] flex items-center gap-4 p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100/50 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                                        <div className="size-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-2xl">id_card</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">NIC</p>
                                            <p className="font-bold text-slate-700 text-[13px]">{doctor?.user?.nic}</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-[200px] flex items-center gap-4 p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100/50 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                                        <div className="size-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-2xl">cake</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Age & Gender</p>
                                            <p className="font-bold text-slate-700 text-[13px]">{doctor?.user?.age} Yrs / {doctor?.user?.gender}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Weekly Clinical Availability */}
                        <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">schedule</span>
                                Weekly Clinical Availability
                            </h3>
                            {availabilities.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {availabilities.map((slot) => (
                                        <div key={slot.id} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-50 group-hover:bg-primary group-hover:text-white transition-all">
                                                    <span className="material-symbols-outlined">calendar_today</span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{slot.dayOfWeek}</p>
                                                    <p className="text-lg font-black text-slate-800 leading-none tracking-tight">{slot.startTime} - {slot.endTime}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-1">
                                                {isDayPassed(slot.dayOfWeek) ? (
                                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100 uppercase tracking-widest">
                                                        Completed
                                                    </span>
                                                ) : (
                                                    <>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Max Capacity</p>
                                                        <p className="text-sm font-bold text-slate-600">{slot.patientLimit || 20} Patients</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                    <span className="material-symbols-outlined text-4xl text-slate-200 mb-3 block">event_busy</span>
                                    <p className="text-slate-400 font-bold italic uppercase tracking-widest text-xs">No recurring availability slots defined.</p>
                                </div>
                            )}
                        </div>

                        {/* Active Clinic Sessions */}
                        <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
                            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-emerald-500">event_available</span>
                                Upcoming Weekly Clinic Sessions
                            </h3>
                            {schedules.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {schedules
                                        .filter(s => {
                                            const sessionDate = new Date(s.date);
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            const nextWeek = new Date();
                                            nextWeek.setDate(today.getDate() + 7);
                                            return sessionDate >= today && sessionDate <= nextWeek;
                                        })
                                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                        .map((session) => {
                                            const enrolledCount = session.enrolledPatients?.length || 0;
                                            const totalCapacity = session.patientLimit || 20;
                                            const isFull = enrolledCount >= totalCapacity;
                                            const formattedDate = new Date(session.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            });

                                            const getSessionStatus = (s: any) => {
                                                const now = new Date();
                                                const [sh, sm] = (s.startTime || '00:00').split(':').map(Number);
                                                const [eh, em] = (s.endTime || '00:00').split(':').map(Number);
                                                
                                                const start = new Date(s.date + 'T00:00:00');
                                                start.setHours(sh, sm, 0, 0);
                                                const end = new Date(s.date + 'T00:00:00');
                                                end.setHours(eh, em, 0, 0);

                                                if (now > end) return 'COMPLETED';
                                                if (now >= start && now <= end) return 'ACTIVE';
                                                return 'UPCOMING';
                                            };

                                            const status = getSessionStatus(session);

                                            return (
                                                <div key={session.id} className="p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] flex flex-col gap-5 group hover:bg-white hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{session.dayOfWeek}</span>
                                                                <span className="size-1 rounded-full bg-slate-300"></span>
                                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">{formattedDate}</span>
                                                            </div>
                                                            <span className="text-lg font-black text-slate-800 tracking-tight leading-none">{session.startTime} - {session.endTime}</span>
                                                        </div>
                                                        <div className="px-4 py-1.5 bg-white border border-slate-100 rounded-xl shadow-sm text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                            {session.room?.name || 'Assigned Room'}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4 pt-2">
                                                        <div className="flex justify-between items-end">
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Enrollment Progress</span>
                                                                <div className="flex items-baseline gap-1.5">
                                                                    <span className={`text-3xl font-black ${isFull ? 'text-rose-500' : 'text-slate-900'} leading-none`}>{enrolledCount}</span>
                                                                    <span className="text-sm font-bold text-slate-300">/ {totalCapacity} Patients</span>
                                                                </div>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                                status === 'COMPLETED' ? 'bg-slate-100 text-slate-500' :
                                                                status === 'ACTIVE' ? 'bg-primary text-white flex items-center gap-1.5 shadow-lg shadow-primary/20' :
                                                                isFull ? 'bg-rose-100 text-rose-500' : 'bg-emerald-100 text-emerald-600'
                                                            }`}>
                                                                {status === 'COMPLETED' ? 'SESSION COMPLETED' :
                                                                 status === 'ACTIVE' ? <><span className="size-1.5 bg-white rounded-full animate-pulse"/>LIVE NOW</> :
                                                                 isFull ? 'SESSION FULL' : 'OPEN FOR CHANNELLING'}
                                                            </span>
                                                        </div>
                                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                            <div 
                                                                className={`h-full transition-all duration-1000 ${isFull ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'}`}
                                                                style={{ width: `${(enrolledCount / totalCapacity) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <div className="py-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                    <span className="material-symbols-outlined text-4xl text-slate-200 mb-3 block">clinical_notes</span>
                                    <p className="text-slate-400 font-bold italic uppercase tracking-widest text-xs">No active sessions scheduled by the hospital for the next 7 days.</p>
                                </div>
                            )}
                        </div>





                        <div className="h-20" />

                        <AddDoctorModal
                            isOpen={isEditModalOpen}
                            onClose={() => setIsEditModalOpen(false)}
                            onAdd={(updatedDoctor) => {
                                setDoctor(updatedDoctor);
                                setIsEditModalOpen(false);
                            }}
                            initialData={doctor}
                        />

                    </div>
                </div>
            </main>
        </div>
    );
}
