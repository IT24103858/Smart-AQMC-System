import React from 'react';
import { useNotification } from '../context/NotificationContext';
import ConfirmationModal from './ConfirmationModal';

interface AddDoctorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (doctor: any) => void;
    initialData?: any;
}

export default function AddDoctorModal({ isOpen, onClose, onAdd, initialData }: AddDoctorModalProps) {
    const { showNotification } = useNotification();
    const [formData, setFormData] = React.useState({
        fullName: '',
        phone: '',
        nic: '',
        experienceYears: '',
        specialization: '',
        consultantFee: '',
        primaryHospital: '',
        email: '',
        password: '',
        age: '',
        gender: ''
    });
    const [showPassword, setShowPassword] = React.useState(false);
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        
        if (formData.fullName && formData.fullName.trim().length < 3) {
            newErrors.fullName = "Name must be at least 3 characters";
        }
        
        if (formData.age && (parseInt(formData.age) < 18 || parseInt(formData.age) > 100)) {
            newErrors.age = "Age must be between 18 and 100";
        }
        
        if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = "Phone must be exactly 10 digits";
        }
        
        if (formData.nic && !/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(formData.nic)) {
            newErrors.nic = "Invalid NIC format";
        }
        
        if (formData.experienceYears && parseInt(formData.experienceYears) < 0) {
            newErrors.experienceYears = "Cannot be negative";
        }
        
        if (formData.consultantFee && parseFloat(formData.consultantFee) < 0) {
            newErrors.consultantFee = "Cannot be negative";
        }
        
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email address";
        }
        
        if (!initialData && formData.password && formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    React.useEffect(() => {
        validate();
    }, [formData]);

    const [availabilities, setAvailabilities] = React.useState<any[]>([]);
    const [isLoadingAvailabilities, setIsLoadingAvailabilities] = React.useState(false);
    const [isSpecListOpen, setIsSpecListOpen] = React.useState(false);
    const [isHospitalListOpen, setIsHospitalListOpen] = React.useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

    const specializations = [
        'Cardiology', 'Neurology', 'Pediatrics', 'Oncology', 'Orthopedics', 
        'ENT', 'Dental', 'Radiology', 'Psychiatry', 'Dermatology', 
        'Ophthalmology', 'General Physician', 'Gynaecology'
    ].sort();

    const hospitals = [
        "Karapitiya Teaching Hospital",
        "National Hospital of Sri Lanka (Colombo)",
        "Colombo North Teaching Hospital (Ragama)",
        "Colombo South Teaching Hospital (Kalubowila)",
        "Sri Jayewardenepura General Hospital",
        "Apeksha Hospital (Maharagama)",
        "Lady Ridgeway Hospital for Children",
        "Teaching Hospital (Peradeniya)",
        "General Hospital (Kandy)",
        "Base Hospital (Panadura)",
        "Nawaloka Hospital",
        "Asiri Hospital",
        "Duridans Hospital",
        "Lanka Hospital"
    ];

    React.useEffect(() => {
        if (initialData && isOpen) {
            setFormData({
                fullName: initialData.user?.name || '',
                phone: initialData.user?.phone || '',
                nic: initialData.user?.nic || '',
                experienceYears: initialData.experienceYears?.toString() || '',
                specialization: initialData.specialization || '',
                consultantFee: initialData.consultantFee?.toString() || '',
                primaryHospital: initialData.primaryHospital || '',
                email: initialData.user?.email || '',
                password: '', // Don't show password for editing
                age: initialData.user?.age?.toString() || '',
                gender: initialData.user?.gender || ''
            });

            // Fetch availabilities
            const fetchAvailabilities = async () => {
                setIsLoadingAvailabilities(true);
                try {
                    const response = await fetch(`/api/doctors/${initialData.id}/availabilities`);
                    if (response.ok) {
                        const data = await response.json();
                        setAvailabilities(data);
                    }
                } catch (error) {
                    console.error('Error fetching availabilities:', error);
                } finally {
                    setIsLoadingAvailabilities(false);
                }
            };
            fetchAvailabilities();
        } else if (isOpen) {
            setFormData({
                fullName: '',
                phone: '',
                nic: '',
                experienceYears: '',
                specialization: '',
                consultantFee: '',
                primaryHospital: '',
                email: '',
                password: '',
                age: '',
                gender: ''
            });
            setAvailabilities([]);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleDeleteAccount = async () => {
        if (!initialData) return;
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await fetch(`/api/doctors/${initialData.id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                showNotification('Doctor account deleted successfully');
                onAdd(null); // Signal refresh
                onClose();
            } else {
                showNotification('Failed to delete account');
            }
        } catch (error: any) {
            showNotification(`Error: ${error.message}`);
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) {
            showNotification('Please fix the errors in the form');
            return;
        }

        const doctorData = {
            user: {
                name: formData.fullName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                nic: formData.nic,
                role: 'DOCTOR',
                age: parseInt(formData.age),
                gender: formData.gender
            },
            experienceYears: parseInt(formData.experienceYears),
            specialization: formData.specialization,
            consultantFee: parseFloat(formData.consultantFee),
            primaryHospital: formData.primaryHospital
        };

        try {
            const url = initialData?.id ? `/api/doctors/${initialData.id}` : '/api/doctors';
            const method = initialData?.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(doctorData),
            });

            if (response.ok) {
                const savedDoctor = await response.json();
                showNotification(`Doctor ${initialData ? 'profile updated' : 'added'} successfully!`);
                onAdd(savedDoctor);
                onClose();
            } else {
                const errorData = await response.text();
                alert(`Failed to save doctor: ${errorData || response.statusText}`);
            }
        } catch (error: any) {
            console.error('Error saving doctor:', error);
            alert(`Could not connect to server: ${error.message}`);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white text-slate-900 animate-in fade-in duration-300">
            <div className="w-full h-full flex flex-col overflow-hidden">
                <div className="px-8 py-3 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{initialData ? 'Doctor Profile Details' : 'Add New Doctor'}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{initialData ? 'View and update specialist information' : 'Create a new doctor record'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                         {initialData && (
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                className="flex items-center gap-2 px-5 py-2 text-red-500 text-xs font-bold hover:bg-red-50 rounded-xl transition-all group"
                            >
                                <span className="material-symbols-outlined text-lg group-hover:animate-pulse">delete_forever</span>
                                Delete Account
                            </button>
                        )}
                        <div className="h-6 w-px bg-slate-100 ml-2 mr-2"></div>
                        <button onClick={onClose} className="size-9 flex items-center justify-center hover:bg-slate-100 rounded-full transition-all group">
                            <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-900 transition-colors text-xl">close</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 pt-10 pb-20">
                    <div className="max-w-5xl mx-auto px-8">
                        <form id="doctor-form" onSubmit={handleSubmit} className="space-y-12">
                            {/* Section: Personal Info */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-5">
                                    <div className="size-12 rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center text-white shrink-0">
                                        <span className="material-symbols-outlined text-2xl">person</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Personal Information</h3>
                                        <p className="text-sm text-slate-400 font-medium">Basic identity and contact details for the specialist's profile.</p>
                                    </div>
                                </div>
                                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-2 gap-x-10 gap-y-7">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2.5">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter full legal name"
                                            className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-900 bg-slate-50/30"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        />
                                        {errors.fullName && <p className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 uppercase tracking-tight">{errors.fullName}</p>}
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="block text-sm font-bold text-slate-700 mb-2.5">Age</label>
                                        <input
                                            type="number"
                                            required
                                            className={`w-full px-5 py-3.5 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-900 bg-slate-50/30 ${errors.age ? 'border-rose-300' : 'border-slate-200'}`}
                                            value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        />
                                        {errors.age && <p className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 uppercase tracking-tight">{errors.age}</p>}
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="block text-sm font-bold text-slate-700 mb-2.5">Gender</label>
                                        <select
                                            required
                                            className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-900 bg-slate-50/30"
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="block text-sm font-bold text-slate-700 mb-2.5">Phone</label>
                                        <input
                                            type="text"
                                            required
                                            className={`w-full px-5 py-3.5 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-900 bg-slate-50/30 ${errors.phone ? 'border-rose-300' : 'border-slate-200'}`}
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                        {errors.phone && <p className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 uppercase tracking-tight">{errors.phone}</p>}
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="block text-sm font-bold text-slate-700 mb-2.5">NIC</label>
                                        <input
                                            type="text"
                                            required
                                            className={`w-full px-5 py-3.5 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-900 bg-slate-50/30 ${errors.nic ? 'border-rose-300' : 'border-slate-200'}`}
                                            value={formData.nic}
                                            onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                                        />
                                        {errors.nic && <p className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 uppercase tracking-tight">{errors.nic}</p>}
                                    </div>
                                </div>
                            </section>

                            {/* Section: Professional Details */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-5">
                                    <div className="size-12 rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/20 flex items-center justify-center text-white shrink-0">
                                        <span className="material-symbols-outlined text-2xl">medical_services</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Professional Details</h3>
                                        <p className="text-sm text-slate-400 font-medium">Experience, specialization, and hospital affiliations.</p>
                                    </div>
                                </div>
                                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-2 gap-x-10 gap-y-7">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2.5">Experience (Years)</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-900 bg-slate-50/30"
                                            value={formData.experienceYears}
                                            onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                                        />
                                        {errors.experienceYears && <p className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 uppercase tracking-tight">{errors.experienceYears}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2.5">Consultant Fee</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rs.</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                className="w-full pl-14 pr-5 py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-900 bg-slate-50/30"
                                                value={formData.consultantFee}
                                                onChange={(e) => setFormData({ ...formData, consultantFee: e.target.value })}
                                            />
                                        </div>
                                        {errors.consultantFee && <p className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 uppercase tracking-tight">{errors.consultantFee}</p>}
                                    </div>
                                    <div className="col-span-2 relative">
                                        <label className="block text-sm font-bold text-slate-700 mb-2.5">Specialization</label>
                                        <select
                                            required
                                            className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-900 bg-slate-50/30"
                                            value={formData.specialization}
                                            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                        >
                                            <option value="">Select Hospital Specialization</option>
                                            {specializations.map(spec => (
                                                <option key={spec} value={spec}>{spec}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2 relative">
                                        <label className="block text-sm font-bold text-slate-700 mb-2.5">Primary Hospital</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                required
                                                placeholder="Search or select hospital"
                                                className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-900 bg-slate-50/30 pr-12"
                                                value={formData.primaryHospital}
                                                onFocus={() => setIsHospitalListOpen(true)}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, primaryHospital: e.target.value });
                                                    setIsHospitalListOpen(true);
                                                }}
                                            />
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none">
                                                {isHospitalListOpen ? 'keyboard_arrow_up' : 'search'}
                                            </span>

                                            {isHospitalListOpen && (
                                                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl p-2 z-[60] max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 custom-scrollbar">
                                                    {(formData.primaryHospital.length === 0 ? hospitals : hospitals.filter(h => h.toLowerCase().includes(formData.primaryHospital.toLowerCase()))).map((hosp, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-slate-50 hover:text-primary transition-colors text-sm font-semibold text-slate-700 flex items-center justify-between group/item"
                                                            onClick={() => {
                                                                setFormData({ ...formData, primaryHospital: hosp });
                                                                setIsHospitalListOpen(false);
                                                            }}
                                                        >
                                                            {hosp}
                                                            <span className="material-symbols-outlined text-lg opacity-0 group-hover/item:opacity-100 transition-opacity">add_circle</span>
                                                        </button>
                                                    ))}
                                                    {(formData.primaryHospital.length > 0 && !hospitals.some(h => h.toLowerCase() === formData.primaryHospital.toLowerCase())) && (
                                                        <div className="p-2 pt-1 border-t border-slate-50 mt-1">
                                                            <button
                                                                type="button"
                                                                className="w-full text-left px-4 py-3 rounded-xl bg-primary/5 text-primary text-xs font-bold flex items-center gap-2 hover:bg-primary/10 transition-colors"
                                                                onClick={() => setIsHospitalListOpen(false)}
                                                            >
                                                                <span className="material-symbols-outlined text-lg">domain_add</span>
                                                                Add Custom: "{formData.primaryHospital}"
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {/* Click outside listener */}
                                        {isHospitalListOpen && <div className="fixed inset-0 z-[55]" onClick={() => setIsHospitalListOpen(false)}></div>}
                                    </div>
                                </div>
                            </section>

                            {/* Section: Availability Schedule */}
                            {initialData && (
                                <section className="space-y-6">
                                    <div className="flex items-center gap-5">
                                        <div className="size-12 rounded-2xl bg-sky-500 shadow-lg shadow-sky-500/20 flex items-center justify-center text-white shrink-0">
                                            <span className="material-symbols-outlined text-2xl">schedule</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Availability Schedule</h3>
                                            <p className="text-sm text-slate-400 font-medium">Weekly recurring time slots for patient appointments.</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                        {isLoadingAvailabilities ? (
                                            <div className="flex items-center gap-3 text-slate-400 py-4 animate-pulse">
                                                <span className="material-symbols-outlined animate-spin">sync</span>
                                                <span className="font-bold">Fetching schedule...</span>
                                            </div>
                                        ) : availabilities.length > 0 ? (
                                            <div className="grid grid-cols-3 gap-5">
                                                {availabilities.map((slot) => (
                                                    <div key={slot.id} className="group flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] hover:border-primary-light hover:bg-white hover:shadow-md transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all">
                                                                <span className="material-symbols-outlined text-lg">event_available</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-900 group-hover:text-primary transition-colors text-sm">{slot.dayOfWeek}</span>
                                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-0.5">Recurring</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-xs font-extrabold text-slate-900">{slot.startTime}</span>
                                                            <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">to {slot.endTime}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                                                <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">event_busy</span>
                                                <p className="text-sm font-medium text-slate-400 italic">No availability slots defined.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Section: Account Credentials */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-5">
                                    <div className="size-12 rounded-2xl bg-slate-800 shadow-lg shadow-slate-800/20 flex items-center justify-center text-white shrink-0">
                                        <span className="material-symbols-outlined text-2xl">lock</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Account Credentials</h3>
                                        <p className="text-sm text-slate-400 font-medium">Secure credentials for doctor dashboard access.</p>
                                    </div>
                                </div>
                                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-2 gap-x-10 gap-y-7">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2.5">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            className={`w-full px-5 py-3.5 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 transition-all font-medium text-slate-900 bg-slate-50/30 ${errors.email ? 'border-rose-300' : 'border-slate-200'}`}
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                        {errors.email && <p className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 uppercase tracking-tight">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2.5">Access Password</label>
                                        <div className="relative group">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required={!initialData}
                                                placeholder={initialData ? "••••••••" : "Create secure password"}
                                                className={`w-full pl-5 pr-12 py-3.5 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 transition-all font-medium text-slate-900 bg-slate-50/30 ${errors.password ? 'border-rose-300' : 'border-slate-200'}`}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">
                                                    {showPassword ? 'visibility_off' : 'visibility'}
                                                </span>
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 uppercase tracking-tight">{errors.password}</p>}
                                        {initialData && <p className="text-[10px] text-slate-400 font-bold mt-2 ml-1">Leave blank to retain current password</p>}
                                    </div>
                                </div>
                            </section>

                            {/* Bottom CTA Button */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    className="w-full py-5 bg-primary text-white text-base font-black uppercase tracking-widest rounded-3xl hover:bg-primary-dark shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-4"
                                >
                                    <span className="material-symbols-outlined text-2xl">{initialData ? 'save_as' : 'person_add'}</span>
                                    {initialData ? 'Update Specialist Profile' : 'Create Doctor Account'}
                                </button>
                                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Safe Data Entry • Automated Synchronization</p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Doctor Account"
                message={`Are you sure you want to delete the account for Dr. ${formData.fullName}? This action is permanent and cannot be undone.`}
                type="danger"
                confirmText="Delete Account"
            />
        </div>
    );
}
