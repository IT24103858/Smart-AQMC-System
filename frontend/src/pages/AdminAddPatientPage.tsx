import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

export default function AdminAddPatientPage() {
    const navigate = useNavigate();
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
        isActive: true,
        password: '' // Clear default password
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    role: 'PATIENT',
                    status: formData.isActive ? 'active' : 'inactive'
                })
            });

            if (response.ok) {
                showNotification('Patient profile created successfully!', 'success');
                navigate('/admin/patients');
            } else {
                const data = await response.json();
                showNotification(data.error || 'Failed to create patient', 'error');
            }
        } catch (error) {
            console.error('Error creating patient:', error);
            showNotification('Server connection error', 'error');
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-white relative custom-scrollbar text-slate-900 border-l border-slate-100">
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-slate-800">Patient Management Module</h1>
                    <p className="text-sm text-slate-400 mt-1">Create a new patient profile.</p>
                </div>

                <div className="flex-1 overflow-y-auto px-10 py-5 bg-slate-50/50">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50">
                                <h3 className="text-xl font-bold text-slate-800">Create New Patient</h3>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
                                {/* Full Name */}
                                <div className="w-full">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700 placeholder:text-slate-300"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Email Address */}
                                <div className="w-full">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700 placeholder:text-slate-300"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Password */}
                                <div className="w-full">
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Set Login Password"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700 placeholder:text-slate-300"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* NIC and DOB */}
                                <div className="grid grid-cols-2 gap-5">
                                    <input
                                        type="text"
                                        name="nic"
                                        placeholder="NIC"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700 placeholder:text-slate-300"
                                        value={formData.nic}
                                        onChange={handleChange}
                                    />
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="dob"
                                            placeholder="mm/dd/yyyy"
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700 placeholder:text-slate-300 pr-10"
                                            value={formData.dob}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Phone and Emergency Contact */}
                                <div className="grid grid-cols-2 gap-5">
                                    <input
                                        type="text"
                                        name="phone"
                                        placeholder="Phone Number"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700 placeholder:text-slate-300"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                    <input
                                        type="text"
                                        name="emergencyContact"
                                        placeholder="Emergency Contact"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700 placeholder:text-slate-300"
                                        value={formData.emergencyContact}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Address */}
                                <div className="w-full">
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Address"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700 placeholder:text-slate-300"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Gender and Extra Dropdown */}
                                <div className="grid grid-cols-2 gap-5">
                                    <select
                                        name="gender"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700"
                                        value={formData.gender}
                                        onChange={handleChange}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <select
                                        name="bloodGroup"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700"
                                        value={formData.bloodGroup}
                                        onChange={handleChange}
                                    >
                                        <option value="">Blood Group</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
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

                                {/* Medical History */}
                                <div className="w-full">
                                    <textarea
                                        name="medicalHistory"
                                        placeholder="Medical History"
                                        rows={4}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700 placeholder:text-slate-300 resize-none"
                                        value={formData.medicalHistory}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Active Checkbox above Buttons */}
                                <div className="flex items-center gap-4 mt-6">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        id="isActive"
                                        className="size-5 text-primary focus:ring-primary border-slate-300 rounded cursor-pointer"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                    />
                                    <span className="text-sm font-bold text-slate-500">Patient is active</span>
                                </div>

                                {/* Buttons */}
                                <div className="flex items-center gap-3 mt-4">
                                    <button
                                        type="submit"
                                        className="bg-primary text-white px-8 py-2.5 rounded-lg font-bold hover:bg-primary-dark transition-all"
                                    >
                                        Create Patient
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/admin/patients')}
                                        className="bg-slate-200 text-slate-600 px-8 py-2.5 rounded-xl font-bold hover:bg-slate-300 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
