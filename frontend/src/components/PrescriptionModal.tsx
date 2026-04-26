import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientID: string;
  doctorID: string;
  sessionId: string;
  onSuccess?: () => void;
  isViewOnly?: boolean;
  existingData?: {
    diagnosis: string;
    medications: string;
    instructions: string;
    followUp: string;
  };
}

export default function PrescriptionModal({ 
  isOpen, 
  onClose, 
  patientName, 
  patientID, 
  doctorID, 
  sessionId, 
  onSuccess,
  isViewOnly = false,
  existingData
}: Props) {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    diagnosis: '',
    medications: '',
    instructions: '',
    followUp: 'none'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (existingData) {
      setFormData(existingData);
    } else {
      setFormData({
        diagnosis: '',
        medications: '',
        instructions: '',
        followUp: 'none'
      });
    }
  }, [existingData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly) return;
    setIsLoading(true);

    const payload = {
      doctor: doctorID,
      patient: patientID,
      session: sessionId,
      ...formData
    };
    console.log('Submitting prescription payload:', payload);

    try {
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      console.log('Prescription response:', resData);

      if (response.ok) {
        showNotification(`Prescription saved for ${patientName}`);
        onSuccess?.();
        onClose();
        setFormData({
            diagnosis: '',
            medications: '',
            instructions: '',
            followUp: 'none'
        });
      } else {
        showNotification(resData.error || 'Failed to save prescription');
      }
    } catch (err) {
      console.error('Prescription submission failed:', err);
      showNotification('Network error, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className={`size-12 rounded-2xl flex items-center justify-center ${isViewOnly ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'}`}>
              <span className="material-symbols-outlined text-[28px]">{isViewOnly ? 'visibility' : 'prescriptions'}</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {isViewOnly ? 'Prescription View' : 'Prescription Details'}
              </h2>
              <p className="text-slate-400 text-[12px] font-bold uppercase tracking-widest mt-0.5">Patient: {patientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="size-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-all text-slate-300 hover:text-slate-500">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Diagnosis */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Diagnosis</label>
            <input
              required
              disabled={isViewOnly}
              placeholder="e.g. Common Cold, Hypertension, etc."
              className={`w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-500/5 outline-none transition-all placeholder:text-slate-300 ${isViewOnly ? 'opacity-70 cursor-default' : ''}`}
              value={formData.diagnosis}
              onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
            />
          </div>

          {/* Medications */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Medications & Dosage</label>
            <textarea
              required
              disabled={isViewOnly}
              rows={4}
              placeholder="e.g. Paracetamol 500mg - 2 times daily after meals"
              className={`w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-500/5 outline-none transition-all placeholder:text-slate-300 resize-none ${isViewOnly ? 'opacity-70 cursor-default' : ''}`}
              value={formData.medications}
              onChange={e => setFormData({ ...formData, medications: e.target.value })}
            />
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Special Instructions (Optional)</label>
            <textarea
              disabled={isViewOnly}
              rows={3}
              placeholder="e.g. Avoid cold drinks, bed rest for 2 days..."
              className={`w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-500/5 outline-none transition-all placeholder:text-slate-300 resize-none ${isViewOnly ? 'opacity-70 cursor-default' : ''}`}
              value={formData.instructions}
              onChange={e => setFormData({ ...formData, instructions: e.target.value })}
            />
          </div>

          {/* Follow-up */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Suggested Follow-up</label>
            <div className="flex flex-wrap gap-2">
              {['none', '3 days', '1 week', '2 weeks', '1 month'].map(option => (
                <button
                  key={option}
                  type="button"
                  disabled={isViewOnly}
                  onClick={() => setFormData({ ...formData, followUp: option })}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${formData.followUp === option
                    ? 'bg-sky-600 border-sky-600 text-white shadow-lg shadow-sky-200'
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500 hover:bg-slate-50'
                    } ${isViewOnly && formData.followUp !== option ? 'hidden' : ''} ${isViewOnly ? 'cursor-default opacity-100' : ''}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {!isViewOnly && (
            <div className="pt-4">
              <button
                disabled={isLoading}
                className="group w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-slate-200 hover:bg-sky-600 hover:shadow-sky-200 active:scale-[0.98] transition-all disabled:opacity-20 disabled:scale-100 disabled:pointer-events-none flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">send</span>
                {isLoading ? 'Saving...' : 'Submit Prescription'}
              </button>
            </div>
          )}

          {isViewOnly && (
            <button
                type="button"
                onClick={onClose}
                className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-slate-200 transition-all mt-4"
            >
                Close View
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
