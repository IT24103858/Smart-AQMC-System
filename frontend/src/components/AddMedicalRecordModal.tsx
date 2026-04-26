import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';

interface AddMedicalRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: () => void;
    patientId: string;
}

export default function AddMedicalRecordModal({ isOpen, onClose, onAdd, patientId }: AddMedicalRecordModalProps) {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        recordType: 'PAST_REPORT'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file && formData.recordType === 'PAST_REPORT') {
            showNotification('Please select a report file to upload', 'error');
            return;
        }

        setLoading(true);
        const data = new FormData();
        data.append('patient', patientId);
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('recordType', formData.recordType);
        if (file) {
            data.append('file', file);
        }

        try {
            const response = await fetch('/api/medical-records', {
                method: 'POST',
                body: data,
            });

            if (response.ok) {
                showNotification('Medical record added successfully!', 'success');
                onAdd();
                onClose();
                setFormData({ title: '', description: '', recordType: 'PAST_REPORT' });
                setFile(null);
            } else {
                const error = await response.json();
                showNotification(error.error || 'Failed to add record', 'error');
            }
        } catch (error) {
            console.error('Error adding medical record:', error);
            showNotification('Server connection error', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight text-slate-900">Add Medical Record</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Upload reports or history</p>
                    </div>
                    <button onClick={onClose} className="size-8 flex items-center justify-center hover:bg-slate-50 rounded-full transition-all group">
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-600 transition-colors">close</span>
                    </button>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Record Title</label>
                            <input
                                type="text"
                                name="title"
                                required
                                placeholder="e.g., Blood Test Report - April 2024"
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                            <textarea
                                name="description"
                                rows={3}
                                placeholder="Any notes about this record..."
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-slate-700 resize-none placeholder:text-slate-300"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-1.5 text-slate-900">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Upload Document (PDF/Image)</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                    accept=".pdf,image/*"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-slate-50 border-2 border-slate-200 border-dashed rounded-2xl hover:border-primary/50 hover:bg-primary/5 cursor-pointer group-hover:bg-primary/5"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <span className="material-symbols-outlined text-slate-400 text-3xl mb-2 group-hover:text-primary group-hover:scale-110 transition-all">cloud_upload</span>
                                        <p className="text-sm font-bold text-slate-500 group-hover:text-primary">
                                            {file ? file.name : "Click to upload your report"}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">PDF, PNG, JPG up to 10MB</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-4 border border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-4 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                        Uploading...
                                    </>
                                ) : (
                                    "Add Record"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
