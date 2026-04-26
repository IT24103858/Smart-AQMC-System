import Header from './Header';
import StatCard from './StatCard';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const REFRESH_INTERVAL = 10_000; // 10 seconds for more "real-time" feel

export default function Dashboard() {
  const navigate = useNavigate();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    doctors: 0,
    rooms: 0,
    sessions: 0,
    staff: 0,
    patients: 0,
    conflicts: 0,
    activeRooms: 0,
    activeDoctors: 0
  });

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Stats fetch failed');
      const data = await res.json();
      setStats({
        doctors:   data.doctors   ?? 0,
        rooms:     data.rooms     ?? 0,
        sessions:  data.sessions  ?? 0,
        staff:     data.staff     ?? 0,
        patients:  data.patients  ?? 0,
        conflicts: data.conflicts ?? 0,
        activeRooms: data.activeRooms ?? 0,
        activeDoctors: data.activeDoctors ?? 0,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const inactiveRooms = Math.max(0, stats.rooms - stats.activeRooms);
  const roomPercentage = stats.rooms > 0 ? (stats.activeRooms / stats.rooms) * 100 : 0;
  
  // SVG Pie Chart helper
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (roomPercentage / 100) * circumference;

  const statCards = [
    { icon: 'stethoscope',      label: 'Total Doctors', value: stats.doctors,   change: 'Expert',    period: 'in system',   color: 'primary',      negativeAt: -1 },
    { icon: 'meeting_room',     label: 'Total Rooms',   value: stats.rooms,     change: 'Capacity',  period: 'in system',   color: 'sky-500',      negativeAt: -1 },
    { icon: 'calendar_month',   label: 'Sessions',      value: stats.sessions,  change: 'Scheduled', period: 'this week',   color: 'violet-500',   negativeAt: -1 },
    { icon: 'groups',           label: 'Staff',         value: stats.staff,     change: 'On Roster', period: 'active',      color: 'indigo-500',   negativeAt: -1 },
    { icon: 'personal_injury',  label: 'Patients',      value: stats.patients,  change: 'Enrolled',  period: 'registered',  color: 'emerald-500',  negativeAt: -1 },
    { icon: 'warning',          label: 'Conflicts',     value: stats.conflicts, change: stats.conflicts === 0 ? 'Clean' : 'Alert', period: 'detected', color: 'rose-500', negativeAt: 1 },
  ];

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative custom-scrollbar">
      <Header />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-10">

          {/* Title row */}
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Dashboard Overview</h3>
              <p className="text-slate-400 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Live badge + manual refresh */}
            <div className="flex items-center gap-3">
              <button
                onClick={fetchStats}
                title="Refresh now"
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-sky-600"
              >
                <span className="material-symbols-outlined text-[20px]">refresh</span>
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-sm">
                <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest">Live</span>
                {lastUpdated && (
                  <span className="text-xs text-emerald-500 font-medium ml-1">
                    · {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {statCards.map((stat, index) => (
              <StatCard
                key={index}
                icon={stat.icon}
                label={stat.label}
                value={loading ? '…' : stat.value.toString()}
                change={stat.change}
                changeType={stat.value >= stat.negativeAt && stat.negativeAt !== -1 ? 'negative' : 'positive'}
                period={stat.period}
                color={stat.color}
                onClick={stat.label === 'Sessions' ? () => navigate('/admin/appointments') : undefined}
              />
            ))}
          </div>

          {/* Real-time Insights Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Room Status Pie Chart */}
            <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Room Utilization</h4>
                <div className="flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-[10px] font-bold">
                  REAL-TIME
                </div>
              </div>

              <div className="flex items-center justify-around gap-4">
                <div className="relative size-32">
                  {/* Background Circle */}
                  <svg className="size-full -rotate-90">
                    <circle
                      cx="64" cy="64" r={radius}
                      className="fill-none stroke-slate-50 stroke-[8]"
                    />
                    {/* Active Progress Circle */}
                    <motion.circle
                      cx="64" cy="64" r={radius}
                      className="fill-none stroke-sky-500 stroke-[8] stroke-linecap-round"
                      initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: offset }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-800 leading-none">{Math.round(roomPercentage)}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Active</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full bg-sky-500" />
                    <div>
                      <div className="text-xl font-black text-slate-800 leading-none">{stats.activeRooms}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Rooms</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full bg-slate-100" />
                    <div>
                      <div className="text-xl font-black text-slate-800 leading-none">{inactiveRooms}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Empty Rooms</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-[11px] font-medium text-slate-400">
                <span>Current Shift Activity</span>
                <span className="text-sky-600 font-bold tracking-tight">System Managed</span>
              </div>
            </div>

            {/* Doctor Availability Real-time */}
            <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Doctor Status</h4>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">
                  ON-DUTY
                </div>
              </div>

              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <div className="text-6xl font-black text-slate-800 tracking-tighter tabular-nums">
                  {stats.activeDoctors}
                </div>
                <div className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Doctors in Session</div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100/50">
                  <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Currently Serving Patients
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-2">
                   <span>Total Pool: {stats.doctors} Doctors</span>
                   <span>{stats.doctors > 0 ? Math.round((stats.activeDoctors/stats.doctors)*100) : 0}% Active</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-emerald-500" 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.doctors > 0 ? (stats.activeDoctors/stats.doctors)*100 : 0}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="lg:col-span-4">
              <div className="h-full bg-sky-600 p-8 rounded-[2.5rem] shadow-xl shadow-sky-200 text-white flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                  <span className="material-symbols-outlined text-[180px]">health_metrics</span>
                </div>
                
                <div>
                  <h4 className="text-sm font-black text-sky-100 uppercase tracking-widest mb-2">Clinic Pulse</h4>
                  <p className="text-xl font-bold leading-snug">
                    {stats.activeDoctors > 0 
                      ? `${stats.activeDoctors} medical professionals are currently treating patients across ${stats.activeRooms} specialized rooms.`
                      : "The clinic is currently in a transition period between shifts."}
                  </p>
                </div>

                <button 
                  onClick={() => navigate('/admin/appointments')}
                  className="mt-6 w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all backdrop-blur-sm"
                >
                  Manage Appointments
                </button>
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-12">
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h4 className="text-lg font-black text-slate-800 mb-8 uppercase tracking-widest">Core Actions</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                  <button
                    onClick={() => navigate('/admin/scheduling')}
                    className="p-8 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-sky-500/10 border border-slate-100 rounded-[2rem] transition-all flex flex-col items-center justify-center gap-5 group"
                  >
                    <div className="size-16 rounded-2xl bg-white flex items-center justify-center text-sky-600 shadow-sm group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[32px]">calendar_add_on</span>
                    </div>
                    <span className="text-[13px] font-black text-slate-600 uppercase tracking-wider">New Session</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/scheduling')}
                    className="p-8 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-sky-500/10 border border-slate-100 rounded-[2rem] transition-all flex flex-col items-center justify-center gap-5 group"
                  >
                    <div className="size-16 rounded-2xl bg-white flex items-center justify-center text-sky-600 shadow-sm group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[32px]">analytics</span>
                    </div>
                    <span className="text-[13px] font-black text-slate-600 uppercase tracking-wider">Allocation</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/rooms')}
                    className="p-8 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-sky-500/10 border border-slate-100 rounded-[2rem] transition-all flex flex-col items-center justify-center gap-5 group"
                  >
                    <div className="size-16 rounded-2xl bg-white flex items-center justify-center text-sky-600 shadow-sm group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[32px]">door_open</span>
                    </div>
                    <span className="text-[13px] font-black text-slate-600 uppercase tracking-wider">Manage Rooms</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/doctors')}
                    className="p-8 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-sky-500/10 border border-slate-100 rounded-[2rem] transition-all flex flex-col items-center justify-center gap-5 group"
                  >
                    <div className="size-16 rounded-2xl bg-white flex items-center justify-center text-sky-600 shadow-sm group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[32px]">medical_information</span>
                    </div>
                    <span className="text-[13px] font-black text-slate-600 uppercase tracking-wider">Doctor Directory</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
