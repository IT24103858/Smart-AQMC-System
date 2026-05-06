import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import CreateSessionModal from '../components/CreateSessionModal';
import ConfirmationModal from '../components/ConfirmationModal';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const BLOCKS = [
    '08:00 - 10:00',
    '10:00 - 12:00',
    '12:00 - 14:00',
    '14:00 - 16:00',
    '16:00 - 18:00',
    '18:00 - 20:00',
    '20:00 - 22:00'
];

const SPECIALIZATION_COLORS: any = {
    'Cardiology': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', accent: 'bg-blue-600' },
    'Neurology': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', accent: 'bg-purple-600' },
    'Pediatrics': { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', accent: 'bg-green-600' },
    'Oncology': { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', accent: 'bg-rose-600' },
    'Dental': { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100', accent: 'bg-cyan-600' },
    'Orthopedics': { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', accent: 'bg-orange-600' },
    'ENT': { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', accent: 'bg-indigo-600' },
    'Dermatology': { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100', accent: 'bg-teal-600' },
};

export default function AdminSchedulingPage() {
    const { showNotification } = useNotification();
    const [schedule, setSchedule] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editSession, setEditSession] = useState<any>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Confirmation Modal State
    const [confirmConfig, setConfirmConfig] = useState<any>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        type: 'info' as 'danger' | 'warning' | 'info'
    });

    const fetchSchedule = async () => {
        try {
            const response = await fetch('/api/schedule');
            if (response.ok) {
                const data = await response.json();
                setSchedule(data);
            }
        } catch (error) {
            console.error('Error fetching schedule:', error);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, [refreshTrigger]);

    const handleGenerate = async () => {
        setConfirmConfig({
            isOpen: true,
            title: 'Generate Timetable?',
            message: 'This will wipe the current timetable and generate a new one based on doctor and room availability. Continue?',
            onConfirm: performGenerate,
            type: 'warning'
        });
    };

    const performGenerate = async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        setIsGenerating(true);
        try {
            const response = await fetch('/api/schedule/generate', { method: 'POST' });
            if (response.ok) {
                const result = await response.json();
                showNotification('Timetable generated successfully!');
                setRefreshTrigger(prev => prev + 1);
            } else {
                const errorData = await response.json();
                alert(`Generation failed: ${errorData.error || 'Unknown server error'}`);
            }
        } catch (error) {
            console.error('Error generating schedule:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClear = async () => {
        setConfirmConfig({
            isOpen: true,
            title: 'Clear Everything?',
            message: 'Are you SURE you want to delete the ENTIRE weekly timetable? This cannot be undone.',
            onConfirm: performClear,
            type: 'danger'
        });
    };

    const performClear = async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        try {
            const response = await fetch('/api/schedule', { method: 'DELETE' });
            if (response.ok) {
                showNotification('Timetable cleared successfully!');
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error clearing schedule:', error);
        }
    };

    const handleDeleteSession = async (id: string) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Session?',
            message: 'Are you sure you want to permanently remove this scheduling block? This action cannot be reversed.',
            onConfirm: () => performDeleteSession(id),
            confirmText: 'Delete Now',
            type: 'danger'
        });
    };

    const performDeleteSession = async (id: string) => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        try {
            const response = await fetch(`/api/schedule/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showNotification('Session deleted successfully!');
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error deleting session:', error);
        }
    };

    const handleEditSession = (session: any, columnDate: string) => {
        setEditSession({ ...session, date: session.date || columnDate });
        setIsCreateModalOpen(true);
    };

    const isPastSession = (day: string, block: string) => {
        const currentDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
        const dayIndex = DAYS.indexOf(day);

        if (dayIndex < currentDayIndex) return true;
        if (dayIndex === currentDayIndex) {
            const endHour = parseInt(block.split(' - ')[1].split(':')[0]);
            if (new Date().getHours() >= endHour) return true;
        }
        return false;
    };

    const getWeeklyData = () => {
        const displayDates: string[] = [];
        const isoDates: string[] = [];
        const today = new Date();
        const currentDay = today.getDay(); // 0 (Sun) to 6 (Sat)
        const diff = today.getDate() - (currentDay === 0 ? 6 : currentDay - 1); // Adjust to Monday
        const monday = new Date(today);
        monday.setDate(diff);

        for (let i = 0; i < 7; i++) {
            const nextDay = new Date(monday);
            nextDay.setDate(monday.getDate() + i);
            displayDates.push(nextDay.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }));
            isoDates.push(nextDay.toISOString().split('T')[0]);
        }
        return { displayDates, isoDates };
    };

    const { displayDates, isoDates } = getWeeklyData();

    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light relative custom-scrollbar">
                <Header title="Weekly Scheduling" />
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="w-full mx-auto flex flex-col gap-8">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex flex-col gap-2">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Weekly Timetable</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-[12px] font-black text-slate-400 tracking-[0.2em] uppercase">Current Schedule</span>
                                    <div className="size-1.5 rounded-full bg-slate-300" />
                                    <span className="text-[12px] font-black text-primary tracking-[0.2em] uppercase">{schedule.length} ACTIVE SESSIONS</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <button
                                    onClick={handleClear}
                                    className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all bg-white text-rose-500 border border-rose-100 hover:bg-rose-50 hover:border-rose-200 active:scale-95 shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                                    Clear Timetable
                                </button>

                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all bg-white text-primary border border-primary/10 hover:bg-primary/5 hover:border-primary/20 active:scale-95 shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                                    Create Session
                                </button>

                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all shadow-xl ${isGenerating ? 'bg-slate-200 text-slate-400' : 'bg-primary text-white hover:bg-primary-dark shadow-primary/20 active:scale-95'}`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${isGenerating ? 'animate-spin' : ''}`}>
                                        {isGenerating ? 'sync' : 'calendar_add_on'}
                                    </span>
                                    {isGenerating ? 'Generating...' : 'Generate Weekly Timetable'}
                                </button>
                            </div>
                        </div>


                        {/* Timetable Matrix */}
                        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full border-collapse table-fixed min-w-[1100px]">
                                    <thead>
                                        <tr>
                                            <th className="sticky left-0 z-20 bg-slate-50 p-4 w-[120px] border-b border-r border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                                                Time
                                            </th>
                                            {DAYS.map((day, index) => (
                                                <th key={day} className="p-4 bg-slate-50 border-b border-slate-100 text-center">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.1em]">{day}</span>
                                                        <span className="text-[10px] font-black text-slate-600">{displayDates[index]}</span>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {BLOCKS.map(block => (
                                            <tr key={block} className="group">
                                                <td className="sticky left-0 z-20 bg-white group-hover:bg-slate-50/50 p-4 border-b border-r border-slate-100 transition-colors">
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <span className="text-[12px] font-extrabold text-slate-900">{block.split(' - ')[0]}</span>
                                                        <span className="text-[10px] text-slate-300 font-bold">to</span>
                                                        <span className="text-[12px] font-extrabold text-slate-900">{block.split(' - ')[1]}</span>
                                                    </div>
                                                </td>
                                                {DAYS.map((day, dayIndex) => {
                                                    const sessions = schedule.filter(s =>
                                                        s.dayOfWeek?.toString().trim().toLowerCase() === day.toLowerCase() &&
                                                        s.timeBlock?.toString().trim().toLowerCase() === block.toLowerCase()
                                                    );
                                                    return (
                                                        <td key={`${day}-${block}`} className="p-2 border-b border-slate-100 align-top group-hover:bg-slate-50/30 transition-colors">
                                                            <div className="flex flex-col gap-1.5">
                                                                {sessions
                                                                    .filter(s => s.doctor?.user?.status !== 'deactivated') // Deactivate filter
                                                                    .map((session: any) => {
                                                                    const spec = session.doctor?.specialization || 'Default';
                                                                    const colors = SPECIALIZATION_COLORS[spec] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', accent: 'bg-slate-400' };

                                                                    return (
                                                                        <div
                                                                            key={session.id}
                                                                            className={`group/card p-2.5 rounded-xl border ${colors.bg} ${colors.border} shadow-sm hover:shadow-md transition-all flex flex-col gap-1 relative overflow-hidden`}
                                                                        >
                                                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.accent}`} />
                                                                            <div className="flex items-start justify-between gap-2">
                                                                                <span className={`text-[10px] font-black ${colors.text} leading-tight`}>
                                                                                    DR. {session.doctor?.user?.name.split(' ').pop().toUpperCase()}
                                                                                </span>
                                                                                <div className="flex items-center gap-1">
                                                                                    {!isPastSession(day, block) && (
                                                                                        <>
                                                                                          <button
                                                                                                onClick={() => handleEditSession(session, isoDates[dayIndex])}
                                                                                                className="size-6 flex items-center justify-center rounded bg-slate-100 text-slate-500 hover:text-primary hover:bg-white shadow-sm transition-all"
                                                                                            >
                                                                                                <span className="material-symbols-outlined text-[14px]">edit</span>
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => handleDeleteSession(session.id)}
                                                                                                className="size-6 flex items-center justify-center rounded bg-slate-100 text-slate-500 hover:text-rose-500 hover:bg-white shadow-sm transition-all"
                                                                                            >
                                                                                                <span className="material-symbols-outlined text-[14px]">delete</span>
                                                                                            </button>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center justify-between">
                                                                                <span className={`text-[9px] font-black opacity-70 uppercase tracking-wider`}>
                                                                                    {spec}
                                                                                </span>
                                                                                <span className="text-[9px] font-bold text-slate-400 px-1 py-0.5 bg-white/40 rounded">
                                                                                    {session.room?.name.replace('Room ', '')}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                                {sessions.length === 0 && (
                                                                    <div className="h-8 border border-dashed border-slate-100/50 rounded-xl flex items-center justify-center opacity-30">
                                                                        <span className="material-symbols-outlined text-slate-300 text-[16px]">block</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Specialization Color Guide */}
                        <div className="mt-6 flex flex-wrap gap-4 items-center justify-center p-6 bg-white border border-slate-100 rounded-2xl shadow-sm mb-8">
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">palette</span>
                                Specialization Guide
                            </div>
                            {Object.entries(SPECIALIZATION_COLORS).map(([spec, colors]: [string, any]) => (
                                <div key={spec} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100">
                                    <div className={`size-2.5 rounded-full ${colors.accent}`} />
                                    <span className={`text-[9px] font-black ${colors.text} uppercase tracking-tighter`}>{spec}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <CreateSessionModal
                isOpen={isCreateModalOpen}
                editSession={editSession}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditSession(null);
                }}
                onCreated={() => setRefreshTrigger(prev => prev + 1)}
            />
            <ConfirmationModal 
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                type={confirmConfig.type}
                confirmText={confirmConfig.confirmText}
            />
        </div>
    );
}
