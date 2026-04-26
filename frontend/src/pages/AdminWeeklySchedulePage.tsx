import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useState, useEffect } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AdminWeeklySchedulePage() {
    const [schedule, setSchedule] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/schedule');
            if (response.ok) {
                setSchedule(await response.json());
            }
        } catch (error) {
            console.error('Error fetching schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    const filteredSchedule = schedule.filter(s => s.dayOfWeek === selectedDay);

    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-white relative custom-scrollbar text-slate-900 border-l border-slate-100">
                <Header title="Hospital Weekly Timetable" />
                
                <div className="flex-1 overflow-y-auto px-10 py-8 bg-slate-50/50">
                    <div className="max-w-6xl mx-auto flex flex-col gap-8">
                        {/* Day Selector Tabs */}
                        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex gap-1 overflow-x-auto no-scrollbar">
                            {DAYS.map((day) => (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                        selectedDay === day 
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                    }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>

                        {/* Title and Stats */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-black text-slate-800 tracking-tight">{selectedDay}'s Clinical Schedule</h1>
                                <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-wider">Hospital-wide session overview and enrollment</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Sessions</span>
                                    <span className="text-xl font-black text-primary">{filteredSchedule.length}</span>
                                </div>
                                <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment High</span>
                                    <span className="text-xl font-black text-emerald-500">
                                        {filteredSchedule.filter(s => (s.enrolledPatients?.length || 0) >= (s.patientLimit || 20)).length} Full
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Grid */}
                        {loading ? (
                            <div className="grid grid-cols-2 gap-6 opacity-50">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-48 bg-white rounded-3xl animate-pulse border border-slate-100 shadow-sm"></div>
                                ))}
                            </div>
                        ) : filteredSchedule.length > 0 ? (
                            <div className="grid grid-cols-2 gap-6">
                                {filteredSchedule.map((session) => {
                                    const enrolledCount = session.enrolledPatients?.length || 0;
                                    const totalCapacity = session.patientLimit || 20;
                                    const isFull = enrolledCount >= totalCapacity;

                                    return (
                                        <div key={session.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6 group hover:shadow-xl hover:shadow-slate-200/50 hover:border-primary/20 transition-all duration-500">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
                                                        <span className="material-symbols-outlined text-3xl">stethoscope</span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">DR. {session.doctor?.user?.name || 'Unknown Specialist'}</h3>
                                                            {isFull && <span className="material-symbols-outlined text-rose-500 text-[18px]">verified</span>}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{session.doctor?.specialization || 'General Clinic'}</span>
                                                            <span className="size-1 rounded-full bg-slate-200" />
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{session.room?.name || 'Main Hall'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-lg font-black text-slate-800 tracking-tight">{session.startTime} - {session.endTime}</span>
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{selectedDay}</span>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50">
                                                <div className="flex justify-between items-end mb-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Clinic Capacity</span>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className={`text-3xl font-black leading-none ${isFull ? 'text-rose-600' : 'text-slate-900'}`}>{enrolledCount}</span>
                                                            <span className="text-base font-bold text-slate-300">/ {totalCapacity}</span>
                                                        </div>
                                                    </div>
                                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                                                        isFull ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    }`}>
                                                        {isFull ? 'Session Full' : 'Seats Available'}
                                                    </div>
                                                </div>
                                                <div className="h-3 w-full bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                                                    <div 
                                                        className={`h-full transition-all duration-1000 rounded-full shadow-lg ${isFull ? 'bg-gradient-to-r from-rose-500 to-rose-400 shadow-rose-200' : 'bg-gradient-to-r from-primary to-primary/80 shadow-primary/20'}`}
                                                        style={{ width: `${Math.min(100, (enrolledCount / totalCapacity) * 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] py-24 flex flex-col items-center justify-center gap-4 text-center">
                                <span className="material-symbols-outlined text-6xl text-slate-100">calendar_today</span>
                                <div>
                                    <h2 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Sessions Scheduled</h2>
                                    <p className="text-slate-300 font-bold mt-1 uppercase text-xs tracking-widest">There are no clinical sessions registered for this {selectedDay}.</p>
                                </div>
                            </div>
                        )}

                        <div className="h-20" />
                    </div>
                </div>
            </main>
        </div>
    );
}
