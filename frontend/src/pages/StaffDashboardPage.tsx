import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function StaffDashboardPage() {
    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8">
                    <h1 className="text-2xl font-bold text-gray-800">Staff Dashboard</h1>
                    <p className="mt-4 text-gray-600">Welcome to your dashboard, Staff member.</p>
                </main>
            </div>
        </div>
    );
}
