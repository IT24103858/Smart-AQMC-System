import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';

interface CreateSessionModalProps {
    isOpen: boolean;
    editSession?: any;
    onClose: () => void;
    onCreated: () => void;
}

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

export default function CreateSessionModal({ isOpen, editSession, onClose, onCreated }: CreateSessionModalProps) {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [availabilities, setAvailabilities] = useState<any[]>([]);
    const [schedules, setSchedules] = useState<any[]>([]);
    const { showNotification } = useNotification();

    const [formData, setFormData] = useState({
        specialization: '',
        date: new Date().toLocaleDateString('en-CA'),
        startTime: '08:00',
        endTime: '10:00',
        doctor: '',
        room: ''
    });

    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchData();
            if (editSession) {
                setFormData({
                    specialization: editSession.doctor?.specialization || '',
                    date: editSession.date || new Date().toLocaleDateString('en-CA'),
                    startTime: editSession.startTime || '08:00',
                    endTime: editSession.endTime || '10:00',
                    doctor: editSession.doctor?.id || editSession.doctor,
                    room: editSession.room?.id || editSession.room
                });
            } else {
                setFormData({
                    specialization: '',
                    date: new Date().toLocaleDateString('en-CA'),
                    startTime: '08:00',
                    endTime: '10:00',
                    doctor: '',
                    room: ''
                });
            }
        }
    }, [isOpen, editSession]);

    // LIVE VALIDATION
    useEffect(() => {
        if (touched) {
            validate();
        }
    }, [formData, touched]);

    const fetchData = async () => {
        try {
            const [docsRes, roomsRes, availRes, schedRes] = await Promise.all([
                fetch('/api/doctors'),
                fetch('/api/rooms'),
                fetch('/api/doctor-availabilities'),
                fetch('/api/schedule')
            ]);
            if (docsRes.ok) setDoctors(await docsRes.json());
            if (roomsRes.ok) setRooms(await roomsRes.json());
            if (availRes.ok) setAvailabilities(await availRes.json());
            if (schedRes.ok) setSchedules(await schedRes.json());
        } catch (error) {
            console.error('Error fetching data for modal:', error);
        }
    };

    const validate = () => {
        const newErrors: any = {};

        // 1. Time Logic
        const start = parseInt(formData.startTime.replace(':', ''));
        const end = parseInt(formData.endTime.replace(':', ''));

        if (end <= start) {
            newErrors.time = 'End time must be after the start time.';
        } else {
        if (end <= start) {
            newErrors.time = 'End time must be after the start time.';
        }
        }

        // 2. Derive dayOfWeek and timeBlock for further validation
        const dateObj = new Date(formData.date);
        const dayOfWeek = DAYS[dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1];
        const timeBlock = `${formData.startTime} - ${formData.endTime}`;

        // 3. Doctor availability check
        if (formData.doctor && formData.date && dayOfWeek) {
            const isAvailable = availabilities.some(a =>
                (a.doctor === formData.doctor || a.doctor?.id === formData.doctor) &&
                a.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase()
            );

            if (!isAvailable) {
                newErrors.doctor = `Not available on ${dayOfWeek}`;
            }
        }

        // 4. LIVE CONFLICT DETECTION (Room and Doctor overlaps)
        if (formData.room && dayOfWeek && timeBlock) {
            const roomConflict = schedules.some(s => 
                (s.room === formData.room || s.room?.id === formData.room) && 
                s.dayOfWeek?.toLowerCase() === dayOfWeek?.toLowerCase() && 
                s.timeBlock === timeBlock &&
                (!editSession || s.id !== editSession.id)
            );
            if (roomConflict) {
                newErrors.room = 'This room is already occupied during this time block.';
            }
        }

        if (formData.doctor && dayOfWeek && timeBlock) {
            const doctorConflict = schedules.some(s => 
                (s.doctor === formData.doctor || s.doctor?.id === formData.doctor) && 
                s.dayOfWeek?.toLowerCase() === dayOfWeek?.toLowerCase() && 
                s.timeBlock === timeBlock &&
                (!editSession || s.id !== editSession.id)
            );
            if (doctorConflict) {
                // Do not overwrite availability error if it exists
                if (!newErrors.doctor) {
                    newErrors.doctor = 'This doctor is already scheduled for another session during this time block.';
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched(true);

        if (!validate()) return;

        if (!formData.doctor || !formData.room) {
            alert('Please select both a doctor and a room.');
            return;
        }

        setIsLoading(true);
        try {
            const dateObj = new Date(formData.date);
            const dayOfWeek = DAYS[dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1];
            const timeBlock = `${formData.startTime} - ${formData.endTime}`;

            // Find matching availability to get the patient limit
            const matchingAvail = availabilities.find(a => 
                (a.doctor === formData.doctor || a.doctor?.id === formData.doctor) &&
                a.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase() &&
                a.startTime === formData.startTime &&
                a.endTime === formData.endTime
            );

            const patientLimit = matchingAvail?.patientLimit || 20;

            const url = editSession ? `/api/schedule/${editSession.id}` : '/api/schedule/manual';
            const method = editSession ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctor: formData.doctor,
                    room: formData.room,
                    dayOfWeek,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    timeBlock,
                    date: formData.date,
                    patientLimit: patientLimit
                })
            });

            if (response.ok) {
                showNotification(`Session ${editSession ? 'updated' : 'created'} successfully!`);
                onCreated();
                setTouched(false);
                setErrors({});
                onClose();
            } else {
                const err = await response.json();
                // 3. Conflict Detection (from server)
                if (err.error?.toLowerCase().includes('occupied') || err.error?.toLowerCase().includes('room')) {
                    setErrors({ room: err.error });
                } else if (err.error?.toLowerCase().includes('doctor')) {
                    setErrors({ doctor: err.error });
                } else {
                    alert(err.error || 'Failed to create session');
                }
            }
        } catch (error) {
            console.error('Error creating manual session:', error);
        } finally {
            setIsLoading(false);
        }
    };


    if (!isOpen) return null;

    const specs = Array.from(new Set(rooms.map(r => r.specialization)));
    const filteredRooms = rooms.filter(r => !formData.specialization || r.specialization === formData.specialization);
    const filteredDoctors = doctors.filter(d => !formData.specialization || d.specialization === formData.specialization);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">{editSession ? 'Update Session' : 'Schedule New Session'}</h2>
                    <button onClick={() => { onClose(); setTouched(false); setErrors({}); }} className="size-8 flex items-center justify-center hover:bg-slate-50 rounded-full transition-all">
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">close</span>
                    </button>
                </div>

                {/* Form Body - Matching the 2-column layout in Image 2 */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        {/* Clinic Type Selection */}
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-slate-500">Clinic Type</label>
                            <select
                                value={formData.specialization}
                                onChange={(e) => {
                                    setFormData({ ...formData, specialization: e.target.value, room: '', doctor: '' });
                                    setTouched(true);
                                }}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 outline-none focus:border-primary transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
                            >
                                <option value="">Select Specialty</option>
                                {specs.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Room Priority Selection */}
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-slate-500">Room Priority</label>
                            <select
                                value={formData.room}
                                onChange={(e) => {
                                    setFormData({ ...formData, room: e.target.value });
                                    setTouched(true);
                                }}
                                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-[13px] font-medium text-slate-700 outline-none transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat ${errors.room ? 'border-rose-500 bg-rose-50/10' : 'border-slate-200 focus:border-primary'}`}
                            >
                                <option value="">Choose a Room</option>
                                {filteredRooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.specialization})</option>)}
                            </select>
                            {errors.room && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1">{errors.room}</p>}
                        </div>

                        {/* Start Time */}
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-slate-500">Start Time</label>
                            <select
                                value={formData.startTime}
                                onChange={(e) => {
                                    setFormData({ ...formData, startTime: e.target.value });
                                    setTouched(true);
                                }}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 outline-none focus:border-primary"
                            >
                                {Array.from({ length: 15 }, (_, i) => 8 + i).map(hour => {
                                    const time = `${hour.toString().padStart(2, '0')}:00`;
                                    const label = hour === 12 ? '12:00 PM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
                                    return <option key={time} value={time}>{label}</option>;
                                })}
                            </select>
                        </div>

                        {/* End Time */}
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-slate-500">End Time</label>
                            <select
                                value={formData.endTime}
                                onChange={(e) => {
                                    setFormData({ ...formData, endTime: e.target.value });
                                    setTouched(true);
                                }}
                                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-[13px] font-medium text-slate-700 outline-none transition-all ${errors.time ? 'border-rose-500 bg-rose-50/10' : 'border-slate-200 focus:border-primary'}`}
                            >
                                {Array.from({ length: 15 }, (_, i) => 9 + i).map(hour => {
                                    const time = `${hour.toString().padStart(2, '0')}:00`;
                                    const label = hour === 12 ? '12:00 PM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
                                    return <option key={time} value={time}>{label}</option>;
                                })}
                            </select>
                            {errors.time && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1">{errors.time}</p>}
                        </div>

                        {/* Session Date Selector */}
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-slate-500">Session Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                min={editSession ? formData.date : new Date().toLocaleDateString('en-CA')}
                                max={editSession ? formData.date : (() => {
                                    const d = new Date();
                                    const day = d.getDay();
                                    const diff = (day === 0 ? 0 : 7 - day);
                                    d.setDate(d.getDate() + diff);
                                    return d.toLocaleDateString('en-CA');
                                })()}
                                onChange={(e) => {
                                    setFormData({ ...formData, date: e.target.value });
                                    setTouched(true);
                                }}
                                className={`w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 outline-none focus:border-primary shrink-0 ${editSession ? 'cursor-not-allowed opacity-80' : ''}`}
                                readOnly={!!editSession}
                            />
                        </div>

                        {/* Assigned Staff (Doctor) */}
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-slate-500">Assigned Doctor</label>
                            <select
                                value={formData.doctor}
                                onChange={(e) => {
                                    setFormData({ ...formData, doctor: e.target.value });
                                    setTouched(true);
                                }}
                                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-[13px] font-medium text-slate-700 outline-none transition-all ${errors.doctor ? 'border-rose-500 bg-rose-50/10' : 'border-slate-200 focus:border-primary'}`}
                            >
                                <option value="">Select Doctor</option>
                                {filteredDoctors.map(d => <option key={d.id} value={d.id}>{d.user?.name} ({d.specialization})</option>)}
                            </select>
                            {errors.doctor && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1">{errors.doctor}</p>}
                        </div>
                    </div>
                </form>

                <div className="px-8 py-6 border-t border-slate-100 flex justify-end gap-3">
                    <button type="button" onClick={() => { onClose(); setTouched(false); setErrors({}); }} className="px-6 py-2.5 text-[13px] font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-all">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-primary text-white text-[13px] font-bold rounded-lg hover:bg-primary-dark transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : editSession ? 'Update Session' : 'Create Session'}
                    </button>
                </div>
            </div>
        </div>
    );
}

