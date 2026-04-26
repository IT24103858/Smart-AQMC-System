import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

export default function AdminEditPatientPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showNotification } = useNotification();
    const [isLoading, setIsLoading] = useState(true);
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
        password: '' // Optional for edit
    });

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const response = await fetch(`/api/users/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        name: data.name || '',
                        email: data.email || '',
                        nic: data.nic || '',
                        dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
                        phone: data.phone || '',
                        emergencyContact: data.emergencyContact || '',
                        address: data.address || '',
                        gender: data.gender || 'Female',
                        bloodGroup: data.bloodGroup || '',
                        medicalHistory: data.medicalHistory || '',
                        isActive: data.status === 'active',
                        password: ''
                    });
                }
            } catch (error) {
                console.error('Error fetching patient:', error);
                showNotification('Failed to load patient data', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchPatient();
    }, [id]);

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
            const updateData: any = {
                ...formData,
                status: formData.isActive ? 'active' : 'inactive'
            };
            if (!updateData.password) delete updateData.password;

            const response = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                showNotification('Patient profile updated successfully!', 'success');
                navigate('/admin/patients');
            } else {
                const data = await response.json();
                showNotification(data.error || 'Failed to update patient', 'error');
            }
        } catch (error) {
            console.error('Error updating patient:', error);
            showNotification('Server connection error', 'error');
        }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-white relative custom-scrollbar text-slate-900 border-l border-slate-100">
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-slate-800">Patient Management Module</h1>
                    <p className="text-sm text-slate-400 mt-1">Edit patient profile details.</p>
                </div>

                <div className="flex-1 overflow-y-auto px-10 py-5 bg-slate-50/50">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50">
                                <h3 className="text-xl font-bold text-slate-800">Edit Patient Profile</h3>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
                                {/* Full Name */}
                                <div className="w-full">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700 font-medium"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Email Address */}
                                <div className="w-full">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700 font-medium"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Password Reset */}
                                <div className="w-full">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Reset Password (Leave blank to keep current)</label>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Enter new password"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700 font-medium"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* NIC and DOB */}
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">NIC</label>
                                        <input
                                            type="text"
                                            name="nic"
                                            placeholder="NIC"
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700 font-medium"
                                            value={formData.nic}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Date of Birth</label>
                                        <input
                                            type="date"
                                            name="dob"
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700 font-medium"
                                            value={formData.dob}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Phone and Emergency Contact */}
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Phone Number</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            placeholder="Phone Number"
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700 font-medium"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Emergency Contact</label>
                                        <input
                                            type="text"
                                            name="emergencyContact"
                                            placeholder="Emergency Contact"
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700 font-medium"
                                            value={formData.emergencyContact}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="w-full">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Address"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700 font-medium"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Gender and Blood Group */}
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Gender</label>
                                        <select
                                            name="gender"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700 font-medium"
                                            value={formData.gender}
                                            onChange={handleChange}
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Blood Group</label>
                                        <select
                                            name="bloodGroup"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700 font-medium"
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
                                </div>

                                {/* Medical History */}
                                <div className="w-full">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Medical History</label>
                                    <textarea
                                        name="medicalHistory"
                                        placeholder="Medical History"
                                        rows={4}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary transition-all text-slate-700 placeholder:text-slate-300 resize-none font-medium"
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
                                        Update Profile
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
