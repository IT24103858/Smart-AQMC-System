import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nic: '',
    password: '',
    role: 'patient',
    age: '',
    gender: ''
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (name: string, value: string) => {
    let errorMsg = '';
    switch (name) {
      case 'name':
        if (!value.trim()) errorMsg = 'Full Name is required';
        else if (value.trim().length < 3) errorMsg = 'Name must be at least 3 characters';
        break;
      case 'email':
        if (!value.trim()) errorMsg = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = 'Please enter a valid email address';
        break;
      case 'phone':
        if (!value.trim()) errorMsg = 'Phone is required';
        else if (!/^\d{10}$/.test(value.replace(/[-()\s]/g, ''))) errorMsg = 'Please enter a valid 10-digit phone number';
        break;
      case 'nic':
        if (!value.trim()) errorMsg = 'NIC is required';
        else if (!/^[0-9]{9}[vVxX]$|^[0-9]{12}$/.test(value.replace(/\s/g, ''))) errorMsg = 'Please enter a valid NIC';
        break;
      case 'age':
        if (!value) errorMsg = 'Age is required';
        else if (parseInt(value) < 0 || parseInt(value) > 120) errorMsg = 'Please enter a valid age between 0-120';
        break;
      case 'password':
        if (!value) errorMsg = 'Password is required';
        else if (value.length < 6) errorMsg = 'Password must be at least 6 characters';
        break;
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
    return errorMsg;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasErrors = false;
    Object.keys(formData).forEach((key) => {
        if (key !== 'role' && key !== 'gender') {
            const error = validateField(key, formData[key as keyof typeof formData]);
            if (error) hasErrors = true;
        }
    });

    if (hasErrors) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login', { state: { successMessage: 'Registration successful! Please log in.' } });
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl relative">
        <Link
          to="/"
          className="absolute -top-12 left-0 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Home
        </Link>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create an Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-sky-600 hover:text-sky-500">
              Log in here
            </Link>
          </p>
        </div>
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-100 border border-red-200 rounded">
            {error}
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              onBlur={(e) => validateField('name', e.target.value)}
              autoComplete="name"
              required
              className={`block w-full px-3 py-2 mt-1 placeholder-gray-400 border rounded-md shadow-sm appearance-none focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${
                errors.name ? 'border-red-300 ring-1 ring-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="absolute -bottom-5 left-1 text-xs font-bold text-red-500 animate-in slide-in-from-top-1">{errors.name}</p>}
          </div>
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={(e) => validateField('email', e.target.value)}
              autoComplete="email"
              required
              className={`block w-full px-3 py-2 mt-1 placeholder-gray-400 border rounded-md shadow-sm appearance-none focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${
                errors.email ? 'border-red-300 ring-1 ring-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="absolute -bottom-5 left-1 text-xs font-bold text-red-500 animate-in slide-in-from-top-1">{errors.email}</p>}
          </div>
          <div className="relative">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              onBlur={(e) => validateField('phone', e.target.value)}
              autoComplete="tel"
              required
              className={`block w-full px-3 py-2 mt-1 placeholder-gray-400 border rounded-md shadow-sm appearance-none focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${
                errors.phone ? 'border-red-300 ring-1 ring-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phone && <p className="absolute -bottom-5 left-1 text-xs font-bold text-red-500 animate-in slide-in-from-top-1">{errors.phone}</p>}
          </div>
          <div className="relative">
            <label htmlFor="nic" className="block text-sm font-medium text-gray-700">NIC (National Identity Card)</label>
            <input
              id="nic"
              name="nic"
              type="text"
              value={formData.nic}
              onChange={handleChange}
              onBlur={(e) => validateField('nic', e.target.value)}
              required
              className={`block w-full px-3 py-2 mt-1 placeholder-gray-400 border rounded-md shadow-sm appearance-none focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${
                errors.nic ? 'border-red-300 ring-1 ring-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {errors.nic && <p className="absolute -bottom-5 left-1 text-xs font-bold text-red-500 animate-in slide-in-from-top-1">{errors.nic}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
              <input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                onBlur={(e) => validateField('age', e.target.value)}
                required
                className={`block w-full px-3 py-2 mt-1 placeholder-gray-400 border rounded-md shadow-sm appearance-none focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${
                  errors.age ? 'border-red-300 ring-1 ring-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
              />
              {errors.age && <p className="absolute -bottom-5 left-1 text-xs font-bold text-red-500 animate-in slide-in-from-top-1">{errors.age}</p>}
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              onBlur={(e) => validateField('password', e.target.value)}
              autoComplete="new-password"
              required
              className={`block w-full px-3 py-2 pr-10 mt-1 placeholder-gray-400 border rounded-md shadow-sm appearance-none focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${
                errors.password ? 'border-red-300 ring-1 ring-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[30px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
            {errors.password && <p className="absolute -bottom-5 left-1 text-xs font-bold text-red-500 animate-in slide-in-from-top-1">{errors.password}</p>}
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}