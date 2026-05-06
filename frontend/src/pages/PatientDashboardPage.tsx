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
}

interface Prescription {
    id: string;
    doctor: {
        user: {
            name: string;
        };
    };
    diagnosis: string;
    medications: string;
    instructions: string;
    followUp: string;
    date: string;
}

export default function PatientDashboardPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            fetchPatientData(parsedUser.id);
        }
    }, []);

    // Handle anchor scrolling
    useEffect(() => {
        if (window.location.hash) {
            const id = window.location.hash.substring(1);
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [window.location.hash, appointments, prescriptions]);

    const fetchPatientData = async (patientId: string) => {
        setLoading(true);
        try {
            const [apptsRes, prescsRes] = await Promise.all([
                fetch(`/api/schedule/patient/${patientId}`),
                fetch(`/api/prescriptions/patient/${patientId}`)
            ]);

            if (apptsRes.ok) {
                const apptsData = await apptsRes.json();
                // Sort appointments by date
                const sortedAppts = apptsData.sort((a: Appointment, b: Appointment) => 
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );
                setAppointments(sortedAppts);
            }
            if (prescsRes.ok) {
                const prescsData = await prescsRes.json();
                // Sort prescriptions by date desc
                const sortedPrescs = prescsData.sort((a: Prescription, b: Prescription) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                setPrescriptions(sortedPrescs);
            }
        } catch (error) {
            console.error('Error fetching patient data:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextAppointment = appointments.length > 0 ? appointments[0] : null;
    const lastPrescription = prescriptions.length > 0 ? prescriptions[0] : null;

    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                <Header title="Patient Portal" />
                <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
                    <div className="max-w-7xl mx-auto flex flex-col gap-10">
                        {/* Welcome Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                    Welcome Back, {user?.name?.split(' ')[0]}!
                                </h1>
                                <p className="text-slate-500 font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-xl">waving_hand</span>
                                    Manage your health records and appointments effortlessly.
                                </p>
                            </div>
                        </div>

                        {/* Quick Access Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
                            {/* Quick Appointment */}
                            <div className="relative group overflow-hidden bg-gradient-to-br from-primary to-primary-dark rounded-[32px] p-8 text-white shadow-2xl shadow-primary/20">
                                <div className="absolute -right-10 -bottom-10 size-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                                <div className="relative z-10 flex flex-col gap-6">
                                    <div className="flex items-center justify-between">
                                        <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Next Appointment</div>
                                        <span className="material-symbols-outlined text-white/50">event_available</span>
                                    </div>
                                    
                                    {nextAppointment ? (
                                        <div className="flex items-center gap-6">
                                            <div className="size-20 rounded-2xl bg-white/20 backdrop-blur-md flex flex-col items-center justify-center border border-white/30">
                                                <span className="text-2xl font-black">{nextAppointment.date.split('-')[2]}</span>
                                                <span className="text-[10px] font-bold uppercase">{new Date(nextAppointment.date).toLocaleString('default', { month: 'short' })}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="text-xl font-black">Dr. {nextAppointment.doctor.user.name}</h3>
                                                <p className="text-white/70 text-sm font-medium">{nextAppointment.doctor.specialization} • {nextAppointment.timeBlock}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-white/60 font-bold italic">No upcoming appointments scheduled.</p>
                                    )}
                                    
                                    <button 
                                        onClick={() => navigate('/patient/appointments')}
                                        className="w-fit px-6 py-2.5 bg-white text-primary rounded-xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-black/10"
                                    >
                                        Quick View Details
                                    </button>
                                </div>
                            </div>

                            {/* Quick Prescription */}
                            <div className="relative group overflow-hidden bg-white rounded-[32px] p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
                                <div className="absolute -right-10 -bottom-10 size-48 bg-emerald-50 rounded-full blur-3xl group-hover:bg-emerald-100 transition-all duration-700"></div>
                                <div className="relative z-10 flex flex-col gap-6 text-slate-900">
                                    <div className="flex items-center justify-between">
                                        <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Latest Prescription</div>
                                        <span className="material-symbols-outlined text-emerald-600/50">pill</span>
                                    </div>
                                    
                                    {lastPrescription ? (
                                        <div className="flex items-center gap-6">
                                            <div className="size-20 rounded-2xl bg-emerald-50 flex flex-col items-center justify-center border border-emerald-100 text-emerald-600">
                                                <span className="material-symbols-outlined text-3xl">medication</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="text-xl font-black">{lastPrescription.diagnosis}</h3>
                                                <p className="text-slate-500 text-sm font-medium">By Dr. {lastPrescription.doctor.user.name} • {new Date(lastPrescription.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 font-bold italic">No prescriptions recorded yet.</p>
                                    )}
                                    
                                    <button 
                                        onClick={() => navigate('/patient/prescriptions')}
                                        className="w-fit px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-slate-900/10"
                                    >
                                        Get Prescription
                                    </button>
                                </div>
                            </div>

                            {/* Live Queue Tracker */}
                            <div className="relative group overflow-hidden bg-white rounded-[32px] p-8 border border-slate-200 shadow-xl shadow-slate-200/50 lg:col-span-2">
                                <div className="absolute -right-10 -bottom-10 size-48 bg-sky-50 rounded-full blur-3xl group-hover:bg-sky-100 transition-all duration-700"></div>
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex flex-col gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="px-4 py-1.5 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Queue Status</div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Now</span>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900">Track Your Position in Real-Time</h3>
                                            <p className="text-slate-500 font-medium mt-1">Check how many people are ahead of you and get notified when it's your turn.</p>
                                        </div>

                                        <button 
                                            onClick={() => navigate('/patient/live-queue')}
                                            className="w-fit px-8 py-3 bg-sky-500 text-white rounded-2xl font-black text-sm hover:bg-sky-600 transition-all shadow-xl shadow-sky-200 flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-lg">pedometer</span>
                                            Open Live Tracker
                                        </button>
                                    </div>
                                    <div className="hidden md:flex size-32 rounded-[2.5rem] bg-sky-50 items-center justify-center text-sky-500">
                                        <span className="material-symbols-outlined text-6xl animate-bounce">hourglass_top</span>
                                    </div>
                                </div>
                            </div>
                        </div>                        {/* Information Grid Replace Full Lists with Quick Navigation */}
                        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recent Overview</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col gap-4 group hover:border-primary/30 transition-all cursor-pointer" onClick={() => navigate('/patient/appointments')}>
                                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined">history</span>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900">Total Visits</h3>
                                        <p className="text-3xl font-black text-primary">{appointments.length}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col gap-4 group hover:border-primary/30 transition-all cursor-pointer" onClick={() => navigate('/patient/prescriptions')}>
                                    <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <span className="material-symbols-outlined">medication_liquid</span>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900">Prescriptions</h3>
                                        <p className="text-3xl font-black text-emerald-600">{prescriptions.length}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col gap-4 group hover:border-primary/30 transition-all">
                                    <div className="size-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                        <span className="material-symbols-outlined">health_metrics</span>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900">Health Status</h3>
                                        <p className="text-lg font-black text-amber-600 uppercase tracking-widest">Active</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
