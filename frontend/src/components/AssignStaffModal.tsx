import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';

interface AssignStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: () => void;
    room: any;
    allRooms: any[];
    allSchedule: any[];
}

export default function AssignStaffModal({ isOpen, onClose, onAssign, room, allRooms, allSchedule }: AssignStaffModalProps) {
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [selectedNurses, setSelectedNurses] = useState<string[]>([]);
    const [selectedAttendants, setSelectedAttendants] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [nurseError, setNurseError] = useState<string | null>(null);
    const [attendantError, setAttendantError] = useState<string | null>(null);
    const { showNotification } = useNotification();

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            if (room) {
                const getStaffId = (s: any) => (typeof s === 'string' ? s : (s.id || s._id));
                setSelectedNurses(room.nurses?.map(getStaffId) || []);
                setSelectedAttendants(room.attendants?.map(getStaffId) || []);
            }
            setNurseError(null);
            setAttendantError(null);
        }
    }, [isOpen, room]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            if (response.ok) {
                const data = await response.json();
                setAllUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const [searchTermNurse, setSearchTermNurse] = useState('');
    const [searchTermAttendant, setSearchTermAttendant] = useState('');
    const [isNurseDropdownOpen, setIsNurseDropdownOpen] = useState(false);
    const [isAttendantDropdownOpen, setIsAttendantDropdownOpen] = useState(false);

    if (!isOpen || !room) return null;

    const nursesList = allUsers
        .filter(u => u.role === 'NURSE' && u.name.toLowerCase().includes(searchTermNurse.toLowerCase()))
        .filter(u => !selectedNurses.includes(u.id));

    const attendantsList = allUsers
        .filter(u => u.role === 'ATTENDANT' && u.name.toLowerCase().includes(searchTermAttendant.toLowerCase()))
        .filter(u => !selectedAttendants.includes(u.id));

    const checkLocalConflict = (staffId: string) => {
        // Find sessions for THIS room
        const currentRoomSessions = allSchedule.filter(s => 
            (s.room?.id === room.id || s.room?._id === room.id)
        );
        
        for (const session of currentRoomSessions) {
            // Find OTHER rooms at the same time that have this staff
            const conflict = allSchedule.find(s => 
                (s.room?.id !== room.id && s.room?._id !== room.id) &&
                s.dayOfWeek === session.dayOfWeek &&
                s.timeBlock === session.timeBlock &&
                (
                    s.room?.nurses?.some((n: any) => (n._id === staffId || n.id === staffId)) ||
                    s.room?.attendants?.some((a: any) => (a._id === staffId || a.id === staffId))
                )
            );

            if (conflict) {
                return `Conflict: This person is already assigned to ${conflict.room?.name || 'another room'} during the ${session.timeBlock} session on ${session.dayOfWeek}.`;
            }
        }
        return null;
    };

    const handleToggleNurse = (id: string) => {
        if (!selectedNurses.includes(id)) {
            const conflictMsg = checkLocalConflict(id);
            if (conflictMsg) {
                setNurseError(conflictMsg);
            } else {
                setNurseError(null);
            }
            setSelectedNurses(prev => [...prev, id]);
        } else {
            setSelectedNurses(prev => prev.filter(i => i !== id));
            setNurseError(null);
        }
        setSearchTermNurse('');
    };

    const handleToggleAttendant = (id: string) => {
        if (!selectedAttendants.includes(id)) {
            const conflictMsg = checkLocalConflict(id);
            if (conflictMsg) {
                setAttendantError(conflictMsg);
            } else {
                setAttendantError(null);
            }
            setSelectedAttendants(prev => [...prev, id]);
        } else {
            setSelectedAttendants(prev => prev.filter(i => i !== id));
            setAttendantError(null);
        }
        setSearchTermAttendant('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`/api/rooms/${room.id}/assign-staff`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nurses: selectedNurses,
                    attendants: selectedAttendants
                })
            });

            if (response.ok) {
                showNotification(`Staff assignments for Room ${room.name} updated successfully!`);
                onAssign();
                onClose();
            } else {
                const data = await response.json();
                // If it's a general assignment error, you could use either or both
                setNurseError(data.error || 'Failed to assign staff');
            }
        } catch (error) {
            console.error('Error assigning staff:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-white rounded-t-[32px]">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Assign Team</h2>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
                            Room {room.name} • {room.specialization} Unit
                        </p>
                    </div>
                    <button onClick={onClose} className="size-12 flex items-center justify-center hover:bg-slate-50 rounded-2xl transition-all group border border-transparent hover:border-slate-100">
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-900 transition-colors">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-10 space-y-10 overflow-visible">
                    {/* Nurses Selector */}
                    <div className="relative">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">Nursing Staff</label>
                        
                        <div className="relative mb-4">
                            <div className={`flex items-center gap-3 px-4 py-3.5 bg-slate-50 border transition-all rounded-2xl ${isNurseDropdownOpen ? 'border-primary shadow-sm bg-white' : 'border-slate-100 hover:border-slate-200'}`}>
                                <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                                <input 
                                    type="text"
                                    placeholder="Search and add nurses..."
                                    className="bg-transparent border-none focus:outline-none text-sm font-bold text-slate-700 w-full placeholder:text-slate-300"
                                    value={searchTermNurse}
                                    onChange={(e) => setSearchTermNurse(e.target.value)}
                                    onFocus={() => setIsNurseDropdownOpen(true)}
                                />
                                {isNurseDropdownOpen && (
                                    <button onClick={() => setIsNurseDropdownOpen(false)} className="material-symbols-outlined text-slate-300 hover:text-slate-900 text-[18px]">expand_less</button>
                                )}
                            </div>

                            {isNurseDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto p-2 animate-in slide-in-from-top-2 duration-200 custom-scrollbar">
                                    {nursesList.map(nurse => (
                                        <button
                                            key={nurse.id}
                                            onClick={() => {
                                                handleToggleNurse(nurse.id);
                                                setIsNurseDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-rose-50 rounded-xl transition-all flex items-center justify-between group"
                                        >
                                            <span className="text-sm font-bold text-slate-600 group-hover:text-rose-700">{nurse.name}</span>
                                            <span className="material-symbols-outlined text-slate-200 group-hover:text-rose-400 text-[18px]">add_circle</span>
                                        </button>
                                    ))}
                                    {nursesList.length === 0 && <p className="p-4 text-xs text-slate-400 text-center font-bold uppercase tracking-widest">No more nurses available</p>}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {selectedNurses.map(id => {
                                const nurse = allUsers.find(u => u.id === id || u._id === id);
                                return (
                                    <div key={id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-[11px] font-black uppercase animate-in scale-in-95 duration-200">
                                        <span>{nurse?.name || 'Nurse'}</span>
                                        <button onClick={() => handleToggleNurse(id)} className="hover:text-rose-900 transition-colors">
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    </div>
                                );
                            })}
                            {selectedNurses.length === 0 && <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic ml-1 pt-1">No nurses assigned</span>}
                        </div>

                        {/* Nurse Internal Error */}
                        {nurseError && (
                            <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                                <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl flex items-center gap-3">
                                    <span className="material-symbols-outlined text-rose-500 text-[18px]">warning</span>
                                    <p className="text-[10px] font-bold text-rose-600 leading-tight">{nurseError}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Attendants Selector */}
                    <div className="relative">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">Attendants</label>
                        
                        <div className="relative mb-4">
                            <div className={`flex items-center gap-3 px-4 py-3.5 bg-slate-50 border transition-all rounded-2xl ${isAttendantDropdownOpen ? 'border-primary shadow-sm bg-white' : 'border-slate-100 hover:border-slate-200'}`}>
                                <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                                <input 
                                    type="text"
                                    placeholder="Search and add attendants..."
                                    className="bg-transparent border-none focus:outline-none text-sm font-bold text-slate-700 w-full placeholder:text-slate-300"
                                    value={searchTermAttendant}
                                    onChange={(e) => setSearchTermAttendant(e.target.value)}
                                    onFocus={() => setIsAttendantDropdownOpen(true)}
                                />
                                {isAttendantDropdownOpen && (
                                    <button onClick={() => setIsAttendantDropdownOpen(false)} className="material-symbols-outlined text-slate-300 hover:text-slate-900 text-[18px]">expand_less</button>
                                )}
                            </div>

                            {isAttendantDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 max-h-48 overflow-y-auto p-2 animate-in slide-in-from-top-2 duration-200 custom-scrollbar">
                                    {attendantsList.map(attendant => (
                                        <button
                                            key={attendant.id}
                                            onClick={() => {
                                                handleToggleAttendant(attendant.id);
                                                setIsAttendantDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-indigo-50 rounded-xl transition-all flex items-center justify-between group"
                                        >
                                            <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-700">{attendant.name}</span>
                                            <span className="material-symbols-outlined text-slate-200 group-hover:text-indigo-400 text-[18px]">add_circle</span>
                                        </button>
                                    ))}
                                    {attendantsList.length === 0 && <p className="p-4 text-xs text-slate-400 text-center font-bold uppercase tracking-widest">No more attendants available</p>}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {selectedAttendants.map(id => {
                                const attendant = allUsers.find(u => u.id === id || u._id === id);
                                return (
                                    <div key={id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 text-[11px] font-black uppercase animate-in scale-in-95 duration-200">
                                        <span>{attendant?.name || 'Attendant'}</span>
                                        <button onClick={() => handleToggleAttendant(id)} className="hover:text-indigo-900 transition-colors">
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    </div>
                                );
                            })}
                            {selectedAttendants.length === 0 && <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic ml-1 pt-1">No attendants assigned</span>}
                        </div>

                        {/* Attendant Internal Error */}
                        {attendantError && (
                            <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                                <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl flex items-center gap-3">
                                    <span className="material-symbols-outlined text-indigo-500 text-[18px]">warning</span>
                                    <p className="text-[10px] font-bold text-indigo-600 leading-tight">{attendantError}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-10 py-8 bg-slate-50/50 rounded-b-[32px] flex gap-4 border-t border-slate-100">
                    <button onClick={onClose} className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-white hover:border-slate-300 transition-all active:scale-95">Cancel</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={isLoading}
                        className="flex-1 px-6 py-3.5 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all disabled:opacity-50 active:scale-95"
                    >
                        {isLoading ? 'Processing...' : 'Save Assignments'}
                    </button>
                </div>
            </div>
            
            {/* Overlay click to close dropdowns */}
            {(isNurseDropdownOpen || isAttendantDropdownOpen) && (
                <div className="fixed inset-0 z-[5]" onClick={() => { setIsNurseDropdownOpen(false); setIsAttendantDropdownOpen(false); }}></div>
            )}
        </div>
    );
}
