import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState(location.state?.successMessage || '');

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (location.state?.successMessage) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const validateField = (name: string, value: string) => {
    let errorMsg = '';
    if (name === 'email') {
      if (!value.trim()) errorMsg = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = 'Please enter a valid email address';
    } else if (name === 'password') {
      if (!value) errorMsg = 'Password is required';
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
    return errorMsg;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate fields
    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);
    if (emailError || passwordError) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user info in localStorage (simple session management)
        localStorage.setItem('user', JSON.stringify(data));

        // Redirect based on role: Admin goes to dashboard, others go to Home
        const role = data.role?.toUpperCase();
        if (role === 'ADMIN') {
          navigate('/admin');
        } else if (role === 'DOCTOR') {
          navigate('/doctor');
        } else if (role === 'PATIENT') {
          navigate('/patient');
        } else if (role === 'STAFF' || role === 'NURSE' || role === 'ATTENDANT') {
          navigate('/staff');
        } else {
          navigate('/');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 relative">
      {toastMessage && (
        <div className="absolute top-8 right-8 z-[100] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-right-8 duration-500">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="font-bold text-sm tracking-wide">{toastMessage}</span>
        </div>
      )}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl relative">
        <Link
          to="/"
          className="absolute -top-12 left-0 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Home
        </Link>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Log In</h1>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-sky-600 hover:text-sky-500">
              Register here
            </Link>
          </p>
        </div>
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-100 border border-red-200 rounded">
            {error}
          </div>
        )}
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateField('email', e.target.value);
              }}
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validateField('password', e.target.value);
              }}
              onBlur={(e) => validateField('password', e.target.value)}
              autoComplete="current-password"
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
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}