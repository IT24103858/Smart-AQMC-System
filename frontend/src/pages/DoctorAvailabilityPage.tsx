import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';

export default function DoctorAvailabilityPage() {
    const { showNotification } = useNotification();
    const [user, setUser] = useState<any>(null);
    const [availability, setAvailability] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        patientLimit: 20
    });
    const [errors, setErrors] = useState<{ startTime?: string, endTime?: string }>({});
    const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

    const daysOfWeek = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ];
    
    const timeOptions = [
        '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
        '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
    ];

    const isDayPassed = (dayName: string) => {
        const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const today = new Date();
        const currentDayIndex = (today.getDay() + 6) % 7; // Monday=0, ..., Sunday=6
        const targetDayIndex = daysOrder.indexOf(dayName);
        return currentDayIndex > targetDayIndex;
    };


    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            // Use doctorId if available, otherwise fallback to id
            fetchAvailability(parsedUser.doctorId || parsedUser.id);
        }
    }, []);

    const fetchAvailability = async (doctorId: string) => {
        try {
            // Updated to match backend route: /api/doctor-availabilities?doctorId=...
            const response = await fetch(`/api/doctor-availabilities?doctorId=${doctorId}`);
            if (response.ok) {
                const data = await response.json();
                setAvailability(data);
            }
        } catch (error) {
            console.error('Error fetching availability:', error);
        }
    };

    const validateTimes = (start: string, end: string) => {
        const newErrors: any = {};
        if (!start) newErrors.startTime = 'Start time is required';
        if (!end) newErrors.endTime = 'End time is required';
        
        if (start && end) {
            if (start >= end) {
                newErrors.endTime = 'Must be after start time';
                newErrors.startTime = 'Invalid time range';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
        let newData = { ...formData, [field]: value };
        setFormData(newData);
        validateTimes(newData.startTime, newData.endTime);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!validateTimes(formData.startTime, formData.endTime)) {
            return;
        }

        const isConflict = availability.some(slot => {
            if (editingSlotId && (slot.id === editingSlotId || slot._id === editingSlotId)) return false;
            
            if (slot.dayOfWeek !== formData.dayOfWeek) return false;

            return (
                (formData.startTime >= slot.startTime && formData.startTime < slot.endTime) ||
                (formData.endTime > slot.startTime && formData.endTime <= slot.endTime) ||
                (formData.startTime <= slot.startTime && formData.endTime >= slot.endTime)
            );
        });

        if (isConflict) {
            showNotification(`You already have an overlapping availability slot on ${formData.dayOfWeek}. Please choose a different time.`, 'error');
            return;
        }

        const payload = {
            doctor: user.doctorId || user.id,
            dayOfWeek: formData.dayOfWeek,
            startTime: formData.startTime,
            endTime: formData.endTime,
            patientLimit: formData.patientLimit,
            isBooked: false
        };

        try {
            const url = editingSlotId ? `/api/doctor-availabilities/${editingSlotId}` : '/api/doctor-availabilities';
            const method = editingSlotId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                fetchAvailability(user.doctorId || user.id);
                setFormData({ dayOfWeek: '', startTime: '', endTime: '', patientLimit: 20 });
                setEditingSlotId(null);
                showNotification(editingSlotId ? 'Availability slot updated successfully!' : 'Availability slot added successfully!', 'success');
            } else {
                const errorData = await response.json();
                showNotification('Failed to save slot: ' + (errorData.error || response.statusText), 'error');
            }
        } catch (error) {
            console.error('Error saving availability:', error);
            showNotification('Error saving availability slot', 'error');
        }
    };

    const handleEdit = (slot: any) => {
        setFormData({
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime || '',
            endTime: slot.endTime || '',
            patientLimit: slot.patientLimit || 20
        });
        setEditingSlotId(slot.id || slot._id);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/doctor-availabilities/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchAvailability(user.doctorId || user.id);
                showNotification('Availability slot removed successfully!', 'success');
            } else {
                showNotification('Failed to remove slot', 'error');
            }
        } catch (error) {
            console.error('Error deleting availability:', error);
            showNotification('Error removing slot', 'error');
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light relative custom-scrollbar text-slate-900">
                <Header title="Manage Availability" />
                <div className="flex-1 overflow-y-auto p-10">
                    <div className="max-w-4xl mx-auto flex flex-col gap-10">

                        {/* Add Availability Form */}
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">{editingSlotId ? 'edit_calendar' : 'add_circle'}</span>
                                {editingSlotId ? 'Edit Availability Slot' : 'Add New Availability Slot'}
                            </h3>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Day of Week</label>
                                    <select
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                        value={formData.dayOfWeek}
                                        onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                                    >
                                        <option value="">Select Day</option>
                                        {daysOfWeek.map(day => {
                                            const passed = isDayPassed(day);
                                            return (
                                                <option key={day} value={day} disabled={passed}>
                                                    {day} {passed ? '(Passed)' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Start Time</label>
                                    <select
                                        required
                                        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium ${
                                            errors.startTime ? 'border-red-400 ring-red-400/20 text-red-600' : 'border-slate-200'
                                        }`}
                                        value={formData.startTime}
                                        onChange={(e) => handleTimeChange('startTime', e.target.value)}
                                    >
                                        <option value="">Select Time</option>
                                        {timeOptions.filter(t => t < '21:00').map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                    {errors.startTime && <p className="absolute -bottom-5 left-1 text-[11px] font-bold text-red-500 animate-in slide-in-from-top-1">{errors.startTime}</p>}
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">End Time</label>
                                    <select
                                        required
                                        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium ${
                                            errors.endTime ? 'border-red-400 ring-red-400/20 text-red-600' : 'border-slate-200'
                                        }`}
                                        value={formData.endTime}
                                        onChange={(e) => handleTimeChange('endTime', e.target.value)}
                                    >
                                        <option value="">Select Time</option>
                                        {timeOptions.filter(t => !formData.startTime || t > formData.startTime).map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                    {errors.endTime && <p className="absolute -bottom-5 left-1 text-[11px] font-bold text-red-500 animate-in slide-in-from-top-1">{errors.endTime}</p>}
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Patient Limit (1-20)</label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors text-[18px]">groups</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-700"
                                            value={formData.patientLimit}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setFormData({ ...formData, patientLimit: isNaN(val) ? 20 : Math.min(20, Math.max(1, val)) });
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-3 flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex-1 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined">{editingSlotId ? 'update' : 'save'}</span>
                                        {editingSlotId ? 'Update Slot' : 'Save Slot'}
                                    </button>
                                    {editingSlotId && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({ dayOfWeek: '', startTime: '', endTime: '', patientLimit: 20 });
                                                setEditingSlotId(null);
                                            }}
                                            className="px-6 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Availability List */}
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">event_available</span>
                                Your Availability Slots
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Day</th>
                                            <th className="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Time Slot</th>
                                            <th className="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Limit</th>
                                            <th className="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                            <th className="text-right py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {availability.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-10 text-center text-slate-400 font-medium">
                                                    No availability slots added yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            availability.map((slot) => (
                                                <tr key={slot.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-4 px-4">
                                                        <div className="font-bold text-slate-900">{slot.dayOfWeek}</div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="text-sm font-medium text-slate-600">
                                                            {slot.startTime?.substring(0, 5)} - {slot.endTime?.substring(0, 5)}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2 font-bold text-slate-700">
                                                            <span className="material-symbols-outlined text-[16px] text-slate-400">group</span>
                                                            {slot.patientLimit || 20}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${slot.isBooked
                                                            ? 'bg-amber-100 text-amber-600'
                                                            : 'bg-emerald-100 text-emerald-600'
                                                            }`}>
                                                            {slot.isBooked ? 'Booked' : 'Available'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right flex justify-end gap-2">
                                                        <button
                                                            disabled={isDayPassed(slot.dayOfWeek)}
                                                            onClick={() => handleEdit(slot)}
                                                            className={`p-2 transition-all rounded-lg ${
                                                                isDayPassed(slot.dayOfWeek) 
                                                                ? 'text-slate-200 cursor-not-allowed opacity-50' 
                                                                : 'text-slate-400 hover:text-primary hover:bg-primary/10'
                                                            }`}
                                                            title={isDayPassed(slot.dayOfWeek) ? "Cannot edit past day" : "Edit Slot"}
                                                        >
                                                            <span className="material-symbols-outlined text-xl">edit</span>
                                                        </button>
                                                        <button
                                                            disabled={isDayPassed(slot.dayOfWeek)}
                                                            onClick={() => handleDelete(slot.id || slot._id)}
                                                            className={`p-2 transition-all rounded-lg ${
                                                                isDayPassed(slot.dayOfWeek) 
                                                                ? 'text-slate-200 cursor-not-allowed opacity-50' 
                                                                : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                                                            }`}
                                                            title={isDayPassed(slot.dayOfWeek) ? "Cannot delete past day" : "Delete Slot"}
                                                        >
                                                            <span className="material-symbols-outlined text-xl">delete</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
