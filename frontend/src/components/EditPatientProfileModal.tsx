import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';

interface EditPatientProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedUser: any) => void;
    initialData: any;
}

export default function EditPatientProfileModal({ isOpen, onClose, onUpdate, initialData }: EditPatientProfileModalProps) {
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        nic: '',
        dob: '',
        phone: '',
        emergencyContact: '',
        address: '',
        gender: 'Female',
        bloodGroup: '',
        medicalHistory: '',
        age: '',
        password: ''
    });

    useEffect(() => {
        if (initialData && isOpen) {
            setFormData({
                name: initialData.name || '',
                email: initialData.email || '',
                nic: initialData.nic || '',
                dob: initialData.dob ? new Date(initialData.dob).toISOString().split('T')[0] : '',
                phone: initialData.phone || '',
                emergencyContact: initialData.emergencyContact || '',
                address: initialData.address || '',
                gender: initialData.gender || 'Female',
                bloodGroup: initialData.bloodGroup || '',
                medicalHistory: initialData.medicalHistory || '',
                age: initialData.age?.toString() || '',
                password: ''
            });
        }
    }, [initialData, isOpen]);

    // Handle auto-age calculation when birthday changes
    useEffect(() => {
        if (formData.dob) {
            const birthDate = new Date(formData.dob);
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
            }
            if (calculatedAge >= 0) {
                setFormData(prev => ({ ...prev, age: calculatedAge.toString() }));
            }
        }
    }, [formData.dob]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const updateData: any = { ...formData };
            if (!updateData.password) delete updateData.password;

            const response = await fetch(`/api/users/${initialData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                showNotification('Profile updated successfully!', 'success');
                onUpdate(updatedUser);
            } else {
                const data = await response.json();
                showNotification(data.error || 'Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification('Server connection error', 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col animate-in zoom-in-95 duration-200 h-auto max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Personal Details</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Manage your personal information</p>
                    </div>
                    <button onClick={onClose} className="size-8 flex items-center justify-center hover:bg-slate-50 rounded-full transition-all group">
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-600 transition-colors">close</span>
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <form id="edit-profile-form" onSubmit={handleSubmit} className="flex flex-col gap-10">
                        {/* Section 1: Basic Identity */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">person</span>
                                </span>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Identity & Basic Info</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5 md:col-span-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center gap-4 group focus-within:bg-white focus-within:border-primary/20 transition-all">
                                    <div className="size-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-focus-within:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-2xl">account_circle</span>
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Enter full name"
                                            required
                                            className="w-full bg-transparent border-none focus:ring-0 text-lg font-black text-slate-800 placeholder:text-slate-300 p-0"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="material-symbols-outlined text-[10px] text-slate-400">mail</span>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{formData.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIC Number</label>
                                    <input
                                        type="text"
                                        name="nic"
                                        required
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-slate-700"
                                        value={formData.nic}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                        <input
                                            type="date"
                                            name="dob"
                                            required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-slate-700 uppercase text-xs"
                                            value={formData.dob}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                                        <input
                                            type="number"
                                            name="age"
                                            required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-slate-700"
                                            value={formData.age}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                                    <select
                                        name="gender"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-slate-700"
                                        value={formData.gender}
                                        onChange={handleChange}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blood Group</label>
                                    <select
                                        name="bloodGroup"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-slate-700"
                                        value={formData.bloodGroup}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Blood Group</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Contact Details */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">contact_phone</span>
                                </span>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Contact Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        required
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-slate-700"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Emergency Contact</label>
                                    <input
                                        type="text"
                                        name="emergencyContact"
                                        required
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-slate-700"
                                        value={formData.emergencyContact}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Residential Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-slate-700"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Health Info */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="size-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">medical_services</span>
                                </span>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Medical Context</h3>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medical History & Allergies</label>
                                <textarea
                                    name="medicalHistory"
                                    rows={4}
                                    placeholder="List any chronic conditions, allergies, or past surgeries..."
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-slate-700 resize-none leading-relaxed"
                                    value={formData.medicalHistory}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Footer Section: Security */}
                        <div className="mt-4 p-8 bg-sky-50 rounded-[2.5rem] border border-sky-100 space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-sky-500 p-2 bg-white rounded-xl shadow-sm">security</span>
                                <h3 className="text-sm font-black text-sky-900 uppercase tracking-[0.2em]">Security Access</h3>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-sky-400 uppercase tracking-widest ml-1">Change Account Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Leave empty to keep current password"
                                    className="w-full px-6 py-4 bg-white border border-sky-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold text-sky-900 placeholder:text-sky-200"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <p className="text-[9px] font-medium text-sky-400 italic ml-1">For your security, use a combination of letters, numbers, and symbols.</p>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="px-8 py-6 border-t border-slate-100 bg-white flex gap-3 sticky bottom-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        form="edit-profile-form"
                        type="submit"
                        className="flex-1 px-6 py-3 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
