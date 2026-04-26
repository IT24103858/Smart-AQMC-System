import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface Appointment {
    id: string;
    doctor: {
        id: string;
        user: {
            name: string;
        };
        specialization: string;
    };
    room: {
        name: string;
        location: string;
    };
    dayOfWeek: string;
    timeBlock: string;
    date: string;
    enrolledPatients: Array<{
        patient: string | { id: string };
        medicalReport: string | null;
    }>;
}

export default function MyAppointmentsPage() {
    const [user, setUser] = useState<any>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            fetchAppointments(parsedUser.id);
        }
    }, []);

    const fetchAppointments = async (patientId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/schedule/patient/${patientId}`);
            if (response.ok) {
                const data = await response.json();
                const sortedAppts = data.sort((a: Appointment, b: Appointment) => 
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );
                setAppointments(sortedAppts);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (sessionId: string) => {
        if (!user || !window.confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            const response = await fetch(`/api/schedule/${sessionId}/unenroll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId: user.id })
            });
            if (response.ok) {
                alert('Appointment cancelled successfully.');
                fetchAppointments(user.id);
            } else {
                const data = await response.json();
                alert(`Cancellation failed: ${data.error}`);
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            alert('Failed to cancel appointment. Please try again.');
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                <Header title="My Appointments" />
                <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
                    <div className="max-w-7xl mx-auto flex flex-col gap-10">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Session History</h1>
                            <p className="text-slate-500 font-medium flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-xl">calendar_month</span>
                                View all your upcoming and past medical appointments.
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                        ) : appointments.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {appointments.map((appt) => (
                                    <div key={appt.id} className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm flex items-center gap-8 group hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
                                        <div className="flex flex-col items-center justify-center size-24 rounded-2xl bg-slate-50 text-slate-900 border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{appt.dayOfWeek.substring(0,3)}</span>
                                            <span className="text-2xl font-black tracking-tighter">{appt.date.split('-')[2]}</span>
                                            <span className="text-[10px] font-bold uppercase">{new Date(appt.date).toLocaleString('default', { month: 'short' })}</span>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-3">
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 leading-none">
                                                    {appt.doctor.user.name.startsWith('Dr.') ? appt.doctor.user.name : `Dr. ${appt.doctor.user.name}`}
                                                </h3>
                                                <p className="text-primary font-bold text-xs mt-1 uppercase tracking-widest">{appt.doctor.specialization}</p>
                                            </div>
                                            <div className="flex flex-col gap-1.5 text-left">
                                                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                                    <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
                                                    {appt.timeBlock}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                                    <span className="material-symbols-outlined text-primary text-[18px]">meeting_room</span>
                                                    {appt.room.name} • {appt.room.location}
                                                </div>
                                                <div className="mt-1 flex flex-wrap gap-2">
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                        <span className="text-[10px] font-black uppercase tracking-tight">Appointment Confirmed</span>
                                                    </div>
                                                    {appt.enrolledPatients?.find(ep => 
                                                        (typeof ep.patient === 'string' ? ep.patient : ep.patient?.id) === user?.id
                                                    )?.medicalReport && (
                                                        <a 
                                                            href={`/api/${appt.enrolledPatients.find(ep => (typeof ep.patient === 'string' ? ep.patient : ep.patient?.id) === user?.id)?.medicalReport?.replace(/\\/g, '/')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">description</span>
                                                            <span className="text-[10px] font-black uppercase tracking-tight">View Your Report</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button 
                                                onClick={() => navigate('/patient/booking', { state: { 
                                                    doctor: appt.doctor, 
                                                    specialization: appt.doctor.specialization,
                                                    oldSessionId: appt.id,
                                                    oldSessionDetails: appt 
                                                } })}
                                                className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-primary transition-all shadow-inner group/btn"
                                                title="Reschedule"
                                            >
                                                <span className="material-symbols-outlined">edit_calendar</span>
                                            </button>
                                            <button 
                                                onClick={() => handleCancel(appt.id)}
                                                className="p-3 rounded-xl bg-rose-50 text-rose-300 hover:text-rose-500 transition-all shadow-inner group/btn"
                                                title="Cancel Appointment"
                                            >
                                                <span className="material-symbols-outlined">event_busy</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl p-12 border border-slate-200/60 shadow-sm flex flex-col items-center gap-4 text-center">
                                <div className="size-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                    <span className="material-symbols-outlined text-5xl">event_busy</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">No appointments found</h3>
                                    <p className="text-slate-500 font-medium">You don't have any medical sessions scheduled yet.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
