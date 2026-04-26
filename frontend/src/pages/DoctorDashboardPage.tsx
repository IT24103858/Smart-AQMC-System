import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const REFRESH_INTERVAL = 30_000; // 30 seconds

export default function DoctorDashboardPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchStats = useCallback(async (doctorId: string) => {
        try {
            const response = await fetch(`/api/stats/doctor/${doctorId}`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Error fetching doctor stats:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            
            // Initial fetch
            const doctorId = parsedUser.doctorId || parsedUser.id;
            fetchStats(doctorId);

            // Setup polling
            const interval = setInterval(() => fetchStats(doctorId), REFRESH_INTERVAL);
            return () => clearInterval(interval);
        }
    }, [fetchStats]);

    const statCards = [
        {
            icon: 'group',
            label: 'Today\'s Patients',
            value: stats?.totalTodayPatients?.toString() || '0',
            change: stats?.totalTodayPatients > 0 ? `+${stats.totalTodayPatients}` : '0',
            changeType: 'positive' as const,
            period: 'Active bookings',
            color: 'primary',
        },
        {
            icon: 'calendar_clock',
            label: 'Upcoming Appts',
            value: stats?.todaySessionsCount?.toString() || '0',
            change: 'Running',
            changeType: 'positive' as const,
            period: 'Total sessions',
            color: 'blue-500',
        },
        {
            icon: 'clinical_notes',
            label: 'Prescriptions',
            value: stats?.todayPrescriptionCount?.toString() || '0',
            change: 'Issued',
            changeType: 'positive' as const,
            period: 'for today',
            color: 'amber-500',
        },
        {
            icon: 'verified_user',
            label: 'Consultation Fee',
            value: `LKR ${stats?.consultantFee || '0'}`,
            change: 'Per Session',
            changeType: 'positive' as const,
            period: 'Standard',
            color: 'emerald-500',
        },
    ];

    const activeSession = stats?.todaySessions?.find((s: any) => {
        const now = new Date();
        const [sh, sm] = (s.startTime || '00:00').split(':').map(Number);
        const [eh, em] = (s.endTime || '00:00').split(':').map(Number);
        
        const start = new Date();
        start.setHours(sh, sm, 0, 0);
        
        const end = new Date();
        end.setHours(eh, em, 0, 0);
        
        return now >= start && now <= end;
    });

    const getSessionStatus = (s: any) => {
        const now = new Date();
        const [sh, sm] = (s.startTime || '00:00').split(':').map(Number);
        const [eh, em] = (s.endTime || '00:00').split(':').map(Number);
        
        const start = new Date();
        start.setHours(sh, sm, 0, 0);
        const end = new Date();
        end.setHours(eh, em, 0, 0);

        if (now > end) return 'COMPLETED';
        if (now >= start && now <= end) return 'ACTIVE';
        return 'UPCOMING';
    };

    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light relative custom-scrollbar text-slate-900">
                <Header title="Doctor Overview" />
                <div className="flex-1 overflow-y-auto p-10">
                    <div className="max-w-7xl mx-auto flex flex-col gap-10">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                    welcome back, {user?.name || 'Doctor'}!
                                </h3>
                                <div className="flex items-center gap-4">
                                    <p className="text-text-secondary font-medium flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">medical_services</span>
                                        {stats?.todaySessionsCount > 0
                                            ? `You have ${stats.todaySessionsCount} session${stats.todaySessionsCount > 1 ? 's' : ''} scheduled for today.`
                                            : 'You have no clinical sessions scheduled for today.'}
                                    </p>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/50 shadow-sm">
                                        <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse shadow-emerald-200 shadow-[0_0_8px]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
                                        {lastUpdated && (
                                            <span className="text-[10px] text-emerald-500 font-bold ml-1">
                                                · {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {statCards.map((stat, index) => (
                                <StatCard
                                    key={index}
                                    icon={stat.icon}
                                    label={stat.label}
                                    value={isLoading ? '...' : stat.value}
                                    change={stat.change}
                                    changeType={stat.changeType}
                                    period={stat.period}
                                    color={stat.color}
                                />
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    Today's Schedule
                                    {stats?.todaySessionsCount > 0 && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg uppercase">Active</span>}
                                </h4>
                                <div className="space-y-4">
                                    {stats?.todaySessions?.length > 0 ? (
                                        stats.todaySessions.map((session: any, i: number) => {
                                            const status = getSessionStatus(session);
                                            return (
                                                <div key={i} className={`flex items-center justify-between p-5 rounded-2xl border transition-all group ${
                                                    status === 'ACTIVE' ? 'bg-white border-primary/20 shadow-xl shadow-primary/5' : 
                                                    status === 'COMPLETED' ? 'bg-slate-50 border-slate-100 opacity-75' : 'bg-slate-50 border-slate-100'
                                                }`}>
                                                    <div className="flex items-center gap-6">
                                                        <div className={`p-3 rounded-xl border flex flex-col items-center min-w-[70px] ${
                                                            status === 'ACTIVE' ? 'bg-primary text-white border-primary' : 'bg-white border-slate-100'
                                                        }`}>
                                                            <p className={`text-[10px] font-black uppercase leading-none mb-1 ${status === 'ACTIVE' ? 'text-white/60' : 'text-slate-400'}`}>Starts</p>
                                                            <p className={`font-black text-sm ${status === 'ACTIVE' ? 'text-white' : 'text-primary'}`}>{session.startTime}</p>
                                                        </div>
                                                        <div className="w-px h-10 bg-slate-200"></div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="text-sm font-black text-slate-900">{session.room?.name || 'Main Unit'}</div>
                                                                {status === 'COMPLETED' && (
                                                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded uppercase border border-emerald-100">Completed</span>
                                                                )}
                                                                {status === 'ACTIVE' && (
                                                                    <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-black rounded uppercase flex items-center gap-1">
                                                                        <span className="size-1 bg-white rounded-full animate-pulse" />
                                                                        Live Now
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{session.room?.specialization}</div>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                                                    status === 'COMPLETED' ? 'text-slate-500 bg-slate-100' : 'text-emerald-600 bg-emerald-50'
                                                                }`}>
                                                                    <span className="material-symbols-outlined text-[14px]">group</span>
                                                                    {session.enrolledPatients?.length || 0} Appointments
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => navigate(`/doctor/sessions/${session.id || session._id}`)}
                                                        className={`px-5 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg ${
                                                            status === 'ACTIVE' ? 'bg-primary text-white hover:bg-primary-dark shadow-primary/20' : 
                                                            status === 'COMPLETED' ? 'bg-slate-200 text-slate-500 hover:bg-slate-300 shadow-slate-200' : 
                                                            'bg-slate-900 text-white hover:bg-primary shadow-slate-200'
                                                        }`}
                                                    >
                                                        {status === 'COMPLETED' ? 'View Results' : status === 'ACTIVE' ? 'Resume Session' : 'Open Session'}
                                                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                                    </button>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                                            <span className="material-symbols-outlined text-6xl mb-4">event_busy</span>
                                            <p className="font-black uppercase tracking-[0.2em] text-sm text-slate-400">No sessions for today</p>
                                            <p className="text-xs text-slate-300 font-medium mt-1">Enjoy your day off or check "My Sessions" for the full week.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-8">
                                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                    <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">person</span>
                                        Profile Summary
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                            <p className="text-sm font-black text-slate-700">{user?.status || 'Active'}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consultancy</p>
                                                <p className="text-sm font-black text-slate-700">LKR {stats?.consultantFee || '0'}</p>
                                            </div>
                                            <div className={`p-5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                                                activeSession 
                                                ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                                                : 'bg-slate-50 border-slate-100'
                                            }`}>
                                                {activeSession ? (
                                                    <div className="flex flex-col items-center text-center">
                                                        <div className="size-2 bg-emerald-500 rounded-full animate-pulse mb-2 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">Status</p>
                                                        <p className="text-[12px] font-black text-emerald-700 uppercase tracking-tight mt-1">In Clinic</p>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => fetchStats(user.doctorId || user.id)}
                                                        className="flex flex-col items-center gap-1 group text-slate-400 hover:text-primary transition-all"
                                                        title="Refresh Stats"
                                                    >
                                                        <span className="material-symbols-outlined text-2xl group-hover:rotate-180 transition-transform duration-500">refresh</span>
                                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Sync</p>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => navigate('/doctor/profile')} className="mt-8 block w-full py-4 bg-slate-100 text-slate-600 text-center font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm">
                                        Manage Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
