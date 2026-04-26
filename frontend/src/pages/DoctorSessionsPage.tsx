import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DoctorSessionsPage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'today' | 'week' | 'past'>('today');
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            fetchSessions(parsedUser.doctorId);
        }
    }, []);

    const fetchSessions = async (doctorId: string) => {
        if (!doctorId) return;
        try {
            const response = await fetch('/api/schedule');
            if (response.ok) {
                const allSessions = await response.json();
                // Filter sessions belonging to this doctor
                const doctorSessions = allSessions.filter((s: any) => s.doctor?.id === doctorId || s.doctor === doctorId);
                setSessions(doctorSessions);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getFilteredSessions = () => {
        const now = new Date();
        const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDayName = days[now.getDay()];

        // Custom order to match the model and business logic (Monday-Sunday)
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const currentDayIndex = dayOrder.indexOf(currentDayName);
        
        // Helper to get normalized date string from any date
        const toDateStr = (date: Date) => date.toLocaleDateString('en-CA');

        // Get bounds for the current week (Monday to Sunday)
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay(); 
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const startOfWeekStr = toDateStr(startOfWeek);
        const endOfWeekStr = toDateStr(endOfWeek);

        if (activeTab === 'today') {
            return sessions.filter(s => s.date === todayStr && s.dayOfWeek === currentDayName);
        } else if (activeTab === 'week') {
            return sessions.filter(s => {
                // Return sessions within this week, focusing on upcoming or current
                return s.date >= startOfWeekStr && s.date <= endOfWeekStr;
            });
        } else {
            return sessions.filter(s => {
                // It's a past session if:
                // 1. The date is strictly before today
                // 2. OR the date is today but the day of week passed (for batch-generated sessions)
                const sDayIndex = dayOrder.indexOf(s.dayOfWeek);
                const isEarlierInBatch = s.date === todayStr && sDayIndex < currentDayIndex;
                return s.date < todayStr || isEarlierInBatch;
            });
        }
    };

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

    const filtered = getFilteredSessions();

    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-white relative custom-scrollbar">
                <Header title="My Medical Sessions" />
                
                <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30">
                    <div className="max-w-6xl mx-auto space-y-10">
                        {/* Title Section */}
                        <div className="flex flex-col gap-2">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">My Sessions</h2>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">Manage your professional schedule & patient intake</p>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-[24px] w-fit border border-slate-200/60 shadow-inner">
                            <button
                                onClick={() => setActiveTab('today')}
                                className={`px-8 py-3 rounded-[20px] text-[12px] font-black uppercase tracking-tighter transition-all flex items-center gap-2 ${activeTab === 'today' ? 'bg-white text-primary shadow-lg shadow-primary/5 border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                Today's Sessions
                                {sessions.filter(s => {
                                     const now = new Date();
                                     const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                                     return s.date === now.toLocaleDateString('en-CA') && s.dayOfWeek === days[now.getDay()];
                                 }).length > 0 && (
                                    <span className="size-2 rounded-full bg-primary animate-pulse ml-1" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('week')}
                                className={`px-8 py-3 rounded-[20px] text-[12px] font-black uppercase tracking-tighter transition-all flex items-center gap-2 ${activeTab === 'week' ? 'bg-white text-primary shadow-lg shadow-primary/5 border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <span className="material-symbols-outlined text-[18px]">calendar_view_week</span>
                                This Week
                            </button>
                            <button
                                onClick={() => setActiveTab('past')}
                                className={`px-8 py-3 rounded-[20px] text-[12px] font-black uppercase tracking-tighter transition-all flex items-center gap-2 ${activeTab === 'past' ? 'bg-white text-primary shadow-lg shadow-primary/5 border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <span className="material-symbols-outlined text-[18px]">history</span>
                                Past Sessions
                            </button>
                        </div>

                        {/* Sessions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {isLoading ? (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-slate-300">
                                    <span className="material-symbols-outlined text-5xl animate-spin">sync</span>
                                    <span className="font-black uppercase tracking-[0.2em]">Syncing Schedule...</span>
                                </div>
                            ) : filtered.length > 0 ? (
                                filtered.map((session) => (
                                    <div 
                                        key={session.id || session._id} 
                                        onClick={() => navigate(`/doctor/sessions/${session.id || session._id}`)}
                                        className="group bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        {/* Background Decor */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -mr-10 -mt-10 group-hover:scale-110 transition-transform" />

                                        <div className="relative space-y-6">
                                            {/* Time & Date */}
                                            <div className="flex justify-between items-start">
                                                <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                                    <span className="material-symbols-outlined text-[32px]">schedule</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[14px] font-black text-slate-900">{session.timeBlock.replace(' Session', '')}</div>
                                                    <div className="flex flex-col items-end">
                                                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{session.dayOfWeek}</span>
                                                         <span className="text-[10px] font-black text-primary uppercase tracking-tighter mt-0.5 whitespace-nowrap">
                                                             {new Date(session.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                         </span>
                                                     </div>
                                                </div>
                                            </div>

                                            {/* Room Info */}
                                            <div className="pt-2">
                                                <div className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1">Clinic Unit</div>
                                                <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                                    {session.room?.name || 'Unit Alpha'}
                                                    <span className="px-3 py-1 bg-slate-100 text-[10px] font-black rounded-lg text-slate-500 uppercase">
                                                        {session.room?.specialization}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Progress Bar (Enrolled vs Capacity) */}
                                            <div className="space-y-3 pt-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Live Appointments</span>
                                                    <div className="flex items-end gap-1">
                                                        <span className="text-xl font-black text-primary leading-none">{(session.enrolledPatients || []).length}</span>
                                                        <span className="text-[12px] font-bold text-slate-400 mb-0.5">/ {session.room?.capacity || 20} Patients</span>
                                                    </div>
                                                </div>
                                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-1000"
                                                        style={{ width: `${Math.min(((session.enrolledPatients || []).length / (session.room?.capacity || 20)) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Indicator */}
                                            <div className="pt-4 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {getSessionStatus(session) === 'ACTIVE' ? (
                                                        <span className="px-3 py-1 bg-primary text-white text-[9px] font-black rounded-lg uppercase flex items-center gap-1.5 shadow-lg shadow-primary/20">
                                                            <span className="size-1.5 bg-white rounded-full animate-pulse" />
                                                            Live Now
                                                        </span>
                                                    ) : getSessionStatus(session) === 'COMPLETED' ? (
                                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-lg uppercase border border-emerald-100">
                                                            Completed
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black rounded-lg uppercase">
                                                            Upcoming
                                                        </span>
                                                    )}
                                                </div>
                                                <button className={`flex items-center gap-2 font-black text-[12px] uppercase tracking-tighter group-hover:gap-3 transition-all ${getSessionStatus(session) === 'COMPLETED' ? 'text-slate-400' : 'text-primary'}`}>
                                                    {getSessionStatus(session) === 'COMPLETED' ? 'View Summary' : getSessionStatus(session) === 'ACTIVE' ? 'Resume Session' : 'Open Session'}
                                                    <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-[40px] bg-white">
                                    <div className="size-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                                        <span className="material-symbols-outlined text-4xl text-slate-200">event_busy</span>
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">No sessions found</h4>
                                    <p className="font-bold text-[12px] uppercase tracking-widest mt-1 opacity-60">You don't have any sessions scheduled in this category</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
