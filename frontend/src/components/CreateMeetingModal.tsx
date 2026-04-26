import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateMeetingModal({ isOpen, onClose, onSuccess }: Props) {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toLocaleDateString('en-CA'),
    startTime: '08:00',
    endTime: '09:00',
    participants: ['ALL_STAFF'],
    location: 'Main Conference Hall',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);

  React.useEffect(() => {
    validate();
  }, [formData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const start = parseInt(formData.startTime.replace(':', ''));
    const end = parseInt(formData.endTime.replace(':', ''));

    if (end <= start) {
      newErrors.time = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        showNotification('Meeting scheduled successfully!');
        onSuccess();
        onClose();
        setFormData({
          title: '',
          date: new Date().toLocaleDateString('en-CA'),
          startTime: '08:00',
          endTime: '09:00',
          participants: ['ALL_STAFF'],
          location: 'Main Conference Hall',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Failed to create meeting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleParticipant = (role: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(role)
        ? prev.participants.filter(r => r !== role)
        : [...prev.participants, role]
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-7 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Staff Meeting</h2>
            <p className="text-slate-400 text-[13px] font-medium">Coordinate internal clinic briefings</p>
          </div>
          <button onClick={onClose} className="size-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-all text-slate-300 hover:text-slate-500">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-0.5">Meeting Title</label>
            <input
              required
              placeholder="e.g. Monthly Surgeons Briefing"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:border-slate-400 focus:ring-0 outline-none transition-all placeholder:text-slate-300"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-0.5">Date</label>
              <input
                type="date"
                required
                min={new Date().toLocaleDateString('en-CA')}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:border-slate-400 outline-none transition-all"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-0.5">Location</label>
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:border-slate-400 outline-none transition-all"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3 relative pb-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-0.5">Start Time</label>
                <select
                  className={`w-full bg-white border rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:border-slate-300 focus:border-slate-400 outline-none transition-all appearance-none ${errors.time ? 'border-rose-300 bg-rose-50/20 text-rose-600' : 'border-slate-200'}`}
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={`${String(i).padStart(2, '0')}:00`}>{String(i).padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-0.5">End Time</label>
                <select
                  className={`w-full bg-white border rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:border-slate-300 focus:border-slate-400 outline-none transition-all appearance-none ${errors.time ? 'border-rose-300 bg-rose-50/20 text-rose-600' : 'border-slate-200'}`}
                  value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={`${String(i).padStart(2, '0')}:00`}>{String(i).padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
            </div>
            
            {errors.time && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl flex items-center gap-3">
                  <span className="material-symbols-outlined text-rose-500 text-[18px]">warning</span>
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-tight leading-tight">{errors.time}</p>
                </div>
              </div>
            )}
          </div>

          {/* Participants */}
          <div className="space-y-3 pt-2">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-0.5">Who needs to attend?</label>
            <div className="flex flex-wrap gap-2">
              {['DOCTORS', 'NURSES', 'ALL_STAFF', 'ADMIN'].map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleParticipant(role)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all border ${formData.participants.includes(role)
                    ? 'bg-sky-600 border-sky-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500'
                    }`}
                >
                  {role.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={isLoading || Object.keys(errors).length > 0}
            className="w-full bg-sky-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-md shadow-sky-100 hover:bg-sky-700 active:scale-[0.98] transition-all disabled:opacity-20 disabled:scale-100 disabled:pointer-events-none mt-4"
          >
            {isLoading ? 'Scheduling...' : 'Save Meeting'}
          </button>
        </form>
      </div>
    </div>
  );
}
