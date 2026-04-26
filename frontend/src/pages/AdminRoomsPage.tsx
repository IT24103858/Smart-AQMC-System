import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useState, useEffect } from 'react';
import AssignStaffModal from '../components/AssignStaffModal';
import AddRoomModal from '../components/AddRoomModal';

export default function AdminRoomsPage() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [filterSpecialization, setFilterSpecialization] = useState('All');
    const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const specializations = [
        'All', 'Cardiology', 'Neurology', 'Pediatrics', 'Oncology', 'Orthopedics', 
        'ENT', 'Dental', 'Radiology', 'Psychiatry', 'Dermatology', 
        'Ophthalmology', 'General Physician', 'Gynaecology'
    ];

    const fetchData = async () => {
        try {
            const [roomsRes, scheduleRes] = await Promise.all([
                fetch('/api/rooms'),
                fetch('/api/schedule')
            ]);
            
            if (roomsRes.ok) setRooms(await roomsRes.json());
            if (scheduleRes.ok) setSchedule(await scheduleRes.json());
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refreshTrigger]);


    const handleOpenAssignModal = (room: any) => {
        setSelectedRoom(room);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const filteredRooms = rooms.filter(room => {
        // First filter by specialization
        if (filterSpecialization !== 'All' && room.specialization !== filterSpecialization) return false;
        
        // Then filter to show only rooms that are "USING" (scheduled) on the selected day
        const hasSession = schedule.some(s => 
            (s.room?._id === room._id || s.room === room.id) && 
            s.dayOfWeek?.toLowerCase() === selectedDay.toLowerCase()
        );
        return hasSession;
    });


    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light relative custom-scrollbar">
                <Header title="Room Management" />
                <div className="flex-1 overflow-y-auto p-10">
                    <div className="max-w-7xl mx-auto flex flex-col gap-10">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none uppercase">Room Management</h3>
                                <div className="flex items-center gap-3 mt-4">
                                    <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                                        {DAYS.map(day => (
                                            <button
                                                key={day}
                                                onClick={() => setSelectedDay(day)}
                                                className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all ${selectedDay === day ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {day.substring(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-end gap-3">
                                <div className="flex flex-col gap-1.5 min-w-[180px]">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 opacity-80">Specialization</label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors text-[18px]">filter_list</span>
                                        <select 
                                            value={filterSpecialization}
                                            onChange={(e) => setFilterSpecialization(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-[12px] text-slate-700 appearance-none shadow-sm cursor-pointer"
                                        >
                                            {specializations.map(spec => (
                                                <option key={spec} value={spec}>{spec}</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-slate-500 text-[18px]">expand_more</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsAddRoomModalOpen(true)}
                                    className="h-10 px-5 flex items-center gap-2 bg-primary text-white text-[12px] font-black rounded-xl hover:bg-primary-dark transition-all transform active:scale-95 shadow-lg shadow-primary/20 uppercase tracking-tighter"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                                    Add Room
                                </button>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                            <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-slate-900">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
                                        <span className="material-symbols-outlined text-[28px]">calendar_today</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Active Room Occupancy</h3>
                                        <p className="text-sm font-medium text-slate-400 flex items-center gap-1.5 mt-0.5">
                                            Status indicated for <span className="text-indigo-500 font-black">{selectedDay}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-separate border-spacing-0">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-900">
                                            <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Time / Period</th>
                                            <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Active Room Unit</th>
                                            <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Scheduled Doctor</th>
                                            <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Nursing Staff</th>
                                            <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Attendants</th>
                                            <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100 text-slate-900 font-bold">
                                        {schedule
                                            .filter(s => {
                                                const matchesDay = s.dayOfWeek?.toLowerCase() === selectedDay.toLowerCase();
                                                const matchesSpec = filterSpecialization === 'All' || s.room?.specialization === filterSpecialization;
                                                return matchesDay && matchesSpec;
                                            })
                                            .sort((a, b) => a.timeBlock.localeCompare(b.timeBlock))

                                            .map((session: any) => {
                                                const room = session.room;
                                                return (
                                                    <tr key={session._id} className="hover:bg-slate-50/80 transition-all group duration-200">
                                                        {/* Time Column */}
                                                        <td className="px-8 py-6 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                                                                    <span className="material-symbols-outlined text-[18px]">timer</span>
                                                                </div>
                                                                <div className="text-[13px] font-black text-slate-900 tracking-tight leading-none">
                                                                    {session.timeBlock.replace(' Session', '')}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Room Column */}
                                                        <td className="px-8 py-6 whitespace-nowrap">
                                                            <div className="flex flex-col">
                                                                <div className="text-[13px] font-black text-slate-900 font-mono tracking-tight uppercase leading-none mb-1.5">{room?.name || 'Unit Alpha'}</div>
                                                                <span className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-slate-100 text-slate-400 uppercase tracking-widest self-start">
                                                                    {room?.specialization || 'General'}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Doctor Column */}
                                                        <td className="px-8 py-6 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                                                                <div className="text-[13px] font-black text-primary uppercase">
                                                                    Dr. {session.doctor?.user?.name || 'Assigned Specialist'}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Nurses Column */}
                                                        <td className="px-8 py-6 whitespace-nowrap">
                                                            <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                                                                 {room?.nurses && room.nurses.length > 0 ? (
                                                                    room.nurses.map((nurse: any) => (
                                                                        <span key={nurse.id || nurse._id || nurse} className="px-2 py-0.5 bg-rose-50 text-rose-500 rounded-md text-[10px] font-black uppercase">
                                                                            {nurse.name || (typeof nurse === 'string' ? 'Loading...' : 'Nurse')}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">No Staff Assigned</span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Attendants Column */}
                                                        <td className="px-8 py-6 whitespace-nowrap">
                                                            <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                                                                {room?.attendants && room.attendants.length > 0 ? (
                                                                    room.attendants.map((att: any) => (
                                                                        <span key={att.id || att._id || att} className="px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded-md text-[10px] font-black uppercase">
                                                                            {att.name || (typeof att === 'string' ? 'Loading...' : 'Attendant')}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">No Staff Assigned</span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Actions Column */}
                                                        <td className="px-8 py-6 whitespace-nowrap text-right">
                                                            <div className="flex justify-end">
                                                                <button
                                                                    onClick={() => handleOpenAssignModal(room)}
                                                                    className="size-11 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all active:scale-95 shadow-sm"
                                                                    title="Assign Nursing Staff"
                                                                >
                                                                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                                                                </button>
                                                            </div>
                                                        </td>

                                                    </tr>
                                                );
                                            })}

                                        {schedule.filter(s => s.dayOfWeek?.toLowerCase() === selectedDay.toLowerCase()).length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-2 opacity-20">
                                                        <span className="material-symbols-outlined text-[48px] text-slate-400">event_busy</span>
                                                        <span className="text-sm font-black uppercase tracking-widest text-slate-400">No Active Sessions for {selectedDay}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ROOM MASTER LIST - THE SECOND TABLE */}
                        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm flex flex-col overflow-hidden mb-10">
                            <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-slate-900 bg-slate-50/30">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                        <span className="material-symbols-outlined text-[28px]">inventory_2</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Room Master Inventory</h3>
                                        <p className="text-sm font-medium text-slate-400 flex items-center gap-1.5 mt-0.5 uppercase tracking-widest text-[11px]">
                                            All Registered Medical Units
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-separate border-spacing-0">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-900">
                                            <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Room Unit</th>
                                            <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Specialization</th>
                                            <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Capacity</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100 text-slate-900 font-bold">
                                        {rooms
                                            .filter(r => filterSpecialization === 'All' || r.specialization === filterSpecialization)
                                            .map((room: any) => (
                                                <tr key={room.id || room._id} className="hover:bg-slate-50/80 transition-all group duration-200">
                                                    <td className="px-8 py-6 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2.5 rounded-xl bg-primary/5 text-primary border border-primary/10 shadow-sm">
                                                                <span className="material-symbols-outlined text-[18px]">meeting_room</span>
                                                            </div>
                                                            <div className="text-[13px] font-black font-mono text-slate-900 tracking-tight uppercase">
                                                                {room.name}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-indigo-50 text-indigo-500 uppercase tracking-widest border border-indigo-100">
                                                            {room.specialization}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[12px] font-black">
                                                            <span className="material-symbols-outlined text-[16px] text-slate-400">people</span>
                                                            {room.capacity || 20}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
                {selectedRoom && (
                    <AssignStaffModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onAssign={handleSuccess}
                        room={selectedRoom}
                        allRooms={rooms}
                        allSchedule={schedule}
                    />
                )}
                <AddRoomModal 
                    isOpen={isAddRoomModalOpen}
                    onClose={() => setIsAddRoomModalOpen(false)}
                    onCreated={handleSuccess}
                    specializations={specializations}
                />
            </main>
        </div>
    );
}
