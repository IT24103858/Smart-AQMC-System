import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';

interface AddRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
    specializations: string[];
}

export default function AddRoomModal({ isOpen, onClose, onCreated, specializations }: AddRoomModalProps) {
    const [name, setName] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [capacity, setCapacity] = useState(20);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { showNotification } = useNotification();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !specialization) {
            showNotification('Please fill in all fields.', 'error');
            return;
        }

        if (capacity < 1 || capacity > 20) {
            showNotification('Room capacity must be between 1 and 20 patients.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, specialization, capacity })
            });

            if (response.ok) {
                showNotification('Room created successfully!');
                setName('');
                setSpecialization('');
                setCapacity(20);
                onCreated();
                onClose();
            } else {
                const err = await response.json();
                alert(err.error || 'Failed to create room.');
            }
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Error connecting to server.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header - Added rounded top to match parent */}
                <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[32px]">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <span className="material-symbols-outlined text-[28px]">meeting_room</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Add New Room</h2>
                    </div>
                    <button onClick={onClose} className="size-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-all">
                        <span className="material-symbols-outlined text-slate-400 text-[24px]">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 opacity-80">Room Name / Number</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors text-[18px]">badge</span>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Room 101"
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-[13px] text-slate-700 placeholder:text-slate-300"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 opacity-80">Patient Capacity</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors text-[18px]">groups</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={capacity}
                                        onChange={(e) => setCapacity(parseInt(e.target.value))}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-[13px] text-slate-700"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 opacity-80">Clinic Specialization</label>
                            <div className="relative">
                                {/* Custom Dropdown Trigger */}
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`w-full flex items-center justify-between pl-10 pr-4 py-2.5 bg-white border rounded-xl transition-all font-bold text-[13px] text-slate-700 outline-none ${isDropdownOpen ? 'border-primary ring-4 ring-primary/5' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined absolute left-4 text-[18px] transition-colors ${isDropdownOpen ? 'text-primary' : 'text-slate-400'}`}>medical_services</span>
                                        <span className={specialization ? 'text-slate-700' : 'text-slate-300'}>
                                            {specialization || 'Select Specialization'}
                                        </span>
                                    </div>
                                    <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-primary' : 'text-slate-300'}`}>expand_more</span>
                                </button>

                                {/* Custom Options List - Always opens DOWN */}
                                {isDropdownOpen && (
                                    <>
                                        {/* Overlay to close on click outside */}
                                        <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                                        
                                        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[240px] overflow-y-auto custom-scrollbar">
                                            {specializations.filter(s => s !== 'All').map(spec => (
                                                <button
                                                    key={spec}
                                                    type="button"
                                                    onClick={() => {
                                                        setSpecialization(spec);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`w-full px-5 py-3 text-left text-[13px] font-bold transition-all flex items-center justify-between group ${specialization === spec ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                                                >
                                                    {spec}
                                                    {specialization === spec && (
                                                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 bg-slate-50 text-slate-500 font-bold rounded-xl hover:bg-slate-100 transition-all active:scale-[0.98] border border-slate-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-[2] px-6 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                                    <span>Create Room</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
