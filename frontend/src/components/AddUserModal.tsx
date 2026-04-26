import React from 'react';

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (message?: string) => void;
    initialData?: any;
    fixedRole?: string;
}

export default function AddUserModal({ isOpen, onClose, onAdd, initialData, fixedRole }: AddUserModalProps) {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        phone: '',
        nic: '',
        password: '',
        role: fixedRole || 'NURSE',
        age: '',
        gender: ''
    });
    
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const validateField = (name: string, value: string) => {
        let error = '';
        switch (name) {
            case 'name':
                if (!value.trim()) error = 'Full Name is required';
                else if (value.trim().length < 3) error = 'Name must be at least 3 characters';
                break;
            case 'phone':
                if (!value.trim()) error = 'Phone is required';
                else if (!/^\d{10}$/.test(value.replace(/[-()\s]/g, ''))) error = 'Please enter a valid 10-digit phone number';
                break;
            case 'email':
                if (!value.trim()) error = 'Email is required';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email address';
                break;
            case 'nic':
                if (!value.trim()) error = 'NIC is required';
                else if (!/^[0-9]{9}[vVxX]$|^[0-9]{12}$/.test(value.replace(/\s/g, ''))) error = 'Please enter a valid NIC';
                break;
            case 'age':
                if (!value) error = 'Age is required';
                else if (parseInt(value) < 0 || parseInt(value) > 120) error = 'Please enter a valid age between 0-120';
                break;
            case 'password':
                if (!initialData && !value) error = 'Password is required for new users';
                else if (value && value.length < 6) error = 'Password must be at least 6 characters';
                break;
        }
        setErrors(prev => ({ ...prev, [name]: error }));
        return error;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    React.useEffect(() => {
        if (initialData && isOpen) {
            setFormData({
                name: initialData.name || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                nic: initialData.nic || '',
                password: initialData.password || '',
                role: initialData.role || 'NURSE',
                age: initialData.age?.toString() || '',
                gender: initialData.gender || ''
            });
        } else if (isOpen) {
            setFormData({
                name: '',
                email: '',
                phone: '',
                nic: '',
                password: '',
                role: fixedRole || 'NURSE',
                age: '',
                gender: ''
            });
        }
        if (isOpen) {
            setErrors({});
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields before submission
        let hasErrors = false;
        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key as keyof typeof formData]);
            if (error) hasErrors = true;
        });

        if (hasErrors) {
            return; // Prevent submission if validation fails
        }

        try {
            const url = initialData?.id ? `/api/users/${initialData.id}` : '/api/users';
            const method = initialData?.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                onAdd(initialData?.id ? 'User profile successfully updated!' : 'New user successfully added!');
                onClose();
            } else {
                const errorData = await response.text();
                alert(`Failed to save user: ${errorData || response.statusText}`);
            }
        } catch (error: any) {
            console.error('Error saving user:', error);
            alert(`Could not connect to server: ${error.message}`);
        }
    };

    const isSystemAdmin = initialData?.email === 'admin@medicare.com';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-slate-900">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col animate-in zoom-in-95 duration-200 h-auto max-h-[90vh]">
                {/* Fixed Header */}
                <div className="px-10 py-6 text-slate-900 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            {isSystemAdmin ? 'System Admin Profile' : (initialData ? 'Edit User Profile' : 'Add New User')}
                        </h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {isSystemAdmin ? 'CORE SYSTEM ACCOUNT (VIEW ONLY)' : 'Identification and Contact Details'}
                        </p>
                    </div>
                    <button onClick={onClose} className="size-10 flex items-center justify-center hover:bg-slate-50 rounded-full transition-all group">
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-900 transition-colors">close</span>
                    </button>
                </div>

                {/* Internal Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-10 pt-8 custom-scrollbar bg-slate-50/10">
                    <form id="user-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-10 gap-y-7">
                        <div className="col-span-2 relative">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                readOnly={isSystemAdmin}
                                placeholder="Enter full legal name"
                                className={`w-full px-5 py-3 border rounded-2xl focus:outline-none focus:ring-4 transition-all font-medium text-slate-900 bg-white ${
                                    isSystemAdmin ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100' :
                                    errors.name ? 'border-red-400 focus:ring-red-500/10 focus:border-red-500' : 'border-slate-200 focus:ring-primary/5 focus:border-primary'
                                }`}
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={(e) => validateField('name', e.target.value)}
                            />
                            {errors.name && <p className="absolute -bottom-5 left-2 text-xs font-bold text-red-500 animate-in slide-in-from-top-1">{errors.name}</p>}
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
                            <input
                                type="text"
                                name="phone"
                                required
                                readOnly={isSystemAdmin}
                                className={`w-full px-5 py-3 border rounded-2xl focus:outline-none focus:ring-4 transition-all font-medium text-slate-900 bg-white ${
                                    isSystemAdmin ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100' :
                                    errors.phone ? 'border-red-400 focus:ring-red-500/10 focus:border-red-500' : 'border-slate-200 focus:ring-primary/5 focus:border-primary'
                                }`}
                                value={formData.phone}
                                onChange={handleChange}
                                onBlur={(e) => validateField('phone', e.target.value)}
                            />
                            {errors.phone && <p className="absolute -bottom-5 left-2 text-xs font-bold text-red-500 animate-in slide-in-from-top-1">{errors.phone}</p>}
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                required
                                readOnly={isSystemAdmin}
                                className={`w-full px-5 py-3 border rounded-2xl focus:outline-none focus:ring-4 transition-all font-medium text-slate-900 bg-white ${
                                    isSystemAdmin ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100' :
                                    errors.email ? 'border-red-400 focus:ring-red-500/10 focus:border-red-500' : 'border-slate-200 focus:ring-primary/5 focus:border-primary'
                                }`}
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={(e) => validateField('email', e.target.value)}
                            />
                            {errors.email && <p className="absolute -bottom-5 left-2 text-xs font-bold text-red-500 animate-in slide-in-from-top-1">{errors.email}</p>}
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-bold text-slate-700 mb-2">NIC Number</label>
                            <input
                                type="text"
                                name="nic"
                                required
                                readOnly={isSystemAdmin}
                                className={`w-full px-5 py-3 border rounded-2xl focus:outline-none focus:ring-4 transition-all font-medium text-slate-900 bg-white ${
                                    isSystemAdmin ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100' :
                                    errors.nic ? 'border-red-400 focus:ring-red-500/10 focus:border-red-500' : 'border-slate-200 focus:ring-primary/5 focus:border-primary'
                                }`}
                                value={formData.nic}
                                onChange={handleChange}
                                onBlur={(e) => validateField('nic', e.target.value)}
                            />
                            {errors.nic && <p className="absolute -bottom-5 left-2 text-xs font-bold text-red-500 animate-in slide-in-from-top-1">{errors.nic}</p>}
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Age</label>
                            <input
                                type="number"
                                name="age"
                                required
                                readOnly={isSystemAdmin}
                                className={`w-full px-5 py-3 border rounded-2xl focus:outline-none focus:ring-4 transition-all font-medium text-slate-900 bg-white ${
                                    isSystemAdmin ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100' :
                                    errors.age ? 'border-red-400 focus:ring-red-500/10 focus:border-red-500' : 'border-slate-200 focus:ring-primary/5 focus:border-primary'
                                }`}
                                value={formData.age}
                                onChange={handleChange}
                                onBlur={(e) => validateField('age', e.target.value)}
                            />
                            {errors.age && <p className="absolute -bottom-5 left-2 text-xs font-bold text-red-500 animate-in slide-in-from-top-1">{errors.age}</p>}
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Gender</label>
                            <select
                                name="gender"
                                required
                                disabled={isSystemAdmin}
                                className={`w-full px-5 py-3 border rounded-2xl focus:outline-none focus:ring-4 transition-all font-medium text-slate-900 bg-white ${
                                    isSystemAdmin ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100' : 'border-slate-200 focus:ring-primary/5 focus:border-primary'
                                }`}
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {!fixedRole && (
                            <div className="relative">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Assigned Role</label>
                                <select
                                    name="role"
                                    required
                                    disabled={isSystemAdmin}
                                    className={`w-full px-5 py-3 border rounded-2xl focus:outline-none focus:ring-4 transition-all font-medium text-slate-900 bg-white ${
                                        isSystemAdmin ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100 font-black' : 'border-slate-200 focus:ring-primary/5 focus:border-primary'
                                    }`}
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="NURSE">Nurse</option>
                                    <option value="RECEPTIONIST">Receptionist</option>
                                    <option value="LAB_ASSISTANT">Lab Assistant</option>
                                    <option value="ATTENDANT">Attendant</option>
                                </select>
                            </div>
                        )}

                        <div className="col-span-2 relative">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Security Password</label>
                            <input
                                type="password"
                                name="password"
                                required={!initialData}
                                readOnly={isSystemAdmin}
                                placeholder={isSystemAdmin ? "•••••••• (PROTECTED)" : (initialData ? "•••••••• (Leave blank to keep current)" : "Create a secure password")}
                                className={`w-full px-5 py-3 border rounded-2xl focus:outline-none focus:ring-4 transition-all font-medium text-slate-900 bg-white ${
                                    isSystemAdmin ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100' :
                                    errors.password ? 'border-red-400 focus:ring-red-500/10 focus:border-red-500' : 'border-slate-200 focus:ring-primary/5 focus:border-primary'
                                }`}
                                value={isSystemAdmin ? '' : formData.password}
                                onChange={handleChange}
                                onBlur={(e) => validateField('password', e.target.value)}
                            />
                            {errors.password && <p className="absolute -bottom-5 left-2 text-xs font-bold text-red-500 animate-in slide-in-from-top-1">{errors.password}</p>}
                        </div>
                    </form>
                </div>

                {/* Fixed Footer */}
                <div className="px-10 py-6 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-white transition-all"
                    >
                        {isSystemAdmin ? 'Close' : 'Cancel'}
                    </button>
                    {!isSystemAdmin && (
                        <button
                            form="user-form"
                            type="submit"
                            className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all"
                        >
                            {initialData ? 'Update Profile' : 'Complete Registration'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
