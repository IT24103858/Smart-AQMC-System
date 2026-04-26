import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';

export default function AdminDashboardPage() {
    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <Dashboard />
        </div>
    );
}
