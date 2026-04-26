import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "Dashboard Overview" }: HeaderProps) {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const goToDashboard = () => {
    const role = user?.role?.toLowerCase();
    if (role === 'admin') navigate('/admin');
    else if (role === 'doctor') navigate('/doctor');
    else if (role === 'staff') navigate('/staff');
    else navigate('/patient');
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        <p className="text-xs text-text-secondary font-medium">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-slate-100/50 rounded-xl p-1 border border-slate-200/50">
          <button className="size-9 rounded-lg flex items-center justify-center text-text-secondary hover:bg-white hover:shadow-sm hover:text-primary transition-all duration-200">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
          <button className="size-9 rounded-lg flex items-center justify-center text-text-secondary hover:bg-white hover:shadow-sm hover:text-primary transition-all duration-200 relative">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-slate-100"></span>
          </button>
        </div>

        <div className="w-px h-8 bg-slate-200 mx-2"></div>

        {user && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              Home
            </button>
            {(user?.role?.toUpperCase() === 'DOCTOR' || user?.role?.toUpperCase() === 'PATIENT') && (
              <button
                onClick={() => navigate(user?.role?.toUpperCase() === 'DOCTOR' ? '/doctor/profile' : '/patient/profile')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">account_circle</span>
                Profile
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
