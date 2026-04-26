import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  icon: string;
  children: ReactNode;
  isActive?: boolean;
}

const NavLink = ({ to, icon, children, isActive = false }: NavLinkProps) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2 rounded-xl font-medium group transition-all duration-200 ${isActive
      ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5'
      : 'text-text-secondary hover:bg-slate-50 hover:text-slate-900'
      }`}>
    <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:scale-110 ${isActive ? 'fill-1' : ''}`}>
      {icon}
    </span>
    <span className="text-sm">{children}</span>
  </Link>
);

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const userRole = user?.role?.toLowerCase() || 'patient';
  const roleLabel = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isPathActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="size-11 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-2xl">local_hospital</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight tracking-tight">MediCare</h1>
          <p className="text-xs text-primary font-bold uppercase tracking-widest mt-0.5">{roleLabel} Portal</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-1 custom-scrollbar">
        <div className="px-3 mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Main Menu</div>
        <NavLink to={userRole === 'admin' ? '/admin' : userRole === 'doctor' ? '/doctor' : userRole === 'staff' ? '/staff' : '/patient'} icon="dashboard" isActive={isPathActive('/admin') || isPathActive('/doctor') || isPathActive('/staff') || isPathActive('/patient')}>Dashboard</NavLink>

        {userRole === 'admin' && (
          <>
            <NavLink to="/admin/doctors" icon="stethoscope" isActive={isPathActive('/admin/doctors')}>Doctors</NavLink>
            <NavLink to="/admin/patients" icon="group" isActive={isPathActive('/admin/patients')}>Patient Management</NavLink>
            <NavLink to="/admin/users" icon="admin_panel_settings" isActive={isPathActive('/admin/users')}>Staff Management</NavLink>
            <NavLink to="/admin/rooms" icon="meeting_room" isActive={isPathActive('/admin/rooms')}>Room Management</NavLink>
            <NavLink to="/admin/scheduling" icon="calendar_clock" isActive={isPathActive('/admin/scheduling')}>Scheduling</NavLink>
            <NavLink to="/admin/appointments" icon="event_note" isActive={isPathActive('/admin/appointments')}>Appointment Management</NavLink>
            <NavLink to="/admin/staff-calendar" icon="calendar_month" isActive={isPathActive('/admin/staff-calendar')}>Staff Calendar</NavLink>
            <NavLink to="/admin/weekly-schedule" icon="assignment" isActive={isPathActive('/admin/weekly-schedule')}>Hospital Timetable</NavLink>
            <NavLink to="/admin/queue" icon="queue" isActive={isPathActive('/admin/queue')}>Queue Management</NavLink>

          </>
        )}

        {userRole === 'doctor' && (
          <>
            <NavLink to="/doctor/availability" icon="calendar_clock" isActive={isPathActive('/doctor/availability')}>Availability</NavLink>
            <NavLink to="/doctor/profile" icon="person" isActive={isPathActive('/doctor/profile')}>Profile</NavLink>
            <NavLink to="/doctor/sessions" icon="calendar_month" isActive={isPathActive('/doctor/sessions')}>My sessions</NavLink>

          </>
        )}

        {userRole === 'staff' && (
          <>
            <NavLink to="#" icon="calendar_month">Appointments</NavLink>
            <NavLink to="/admin/patients" icon="group" isActive={isPathActive('/admin/patients')}>Patients</NavLink>
          </>
        )}

        {userRole === 'patient' && (
          <>
            <NavLink to="/patient/profile" icon="person" isActive={isPathActive('/patient/profile')}>Profile</NavLink>
            <NavLink to="/patient/booking" icon="add_circle" isActive={isPathActive('/patient/booking')}>Book Now</NavLink>
            <NavLink to="/patient/appointments" icon="calendar_month" isActive={isPathActive('/patient/appointments')}>My Appointments</NavLink>
            <NavLink to="/patient/prescriptions" icon="pill" isActive={isPathActive('/patient/prescriptions')}>Prescription</NavLink>
            <NavLink to="/patient/live-queue" icon="slow_motion_video" isActive={isPathActive('/patient/live-queue')}>Live Queue Tracker</NavLink>
          </>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
          {user?.email && (
            <div className="px-3 mb-1">
              <p className="text-[10px] font-medium text-slate-400 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-rose-500 hover:bg-rose-50 transition-all duration-200 group"
          >
            <span className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:scale-110">
              logout
            </span>
            <span className="text-sm">Log Out</span>
          </button>
        </div>

      </nav>

    </aside>
  );
}
