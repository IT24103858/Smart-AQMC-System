import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface Prescription {
    id: string;
    doctor: {
        user: {
            name: string;
        };
    };
    diagnosis: string;
    medications: string;
    instructions: string;
    followUp: string;
    date: string;
}

export default function MyPrescriptionsPage() {
    const [user, setUser] = useState<any>(null);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            fetchPrescriptions(parsedUser.id);
        }
    }, []);

    const fetchPrescriptions = async (patientId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/prescriptions/patient/${patientId}`);
            if (response.ok) {
                const data = await response.json();
                const sortedPrescs = data.sort((a: Prescription, b: Prescription) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                setPrescriptions(sortedPrescs);
            }
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                <Header title="My Prescriptions" />
                <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
                    <div className="max-w-7xl mx-auto flex flex-col gap-10">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Prescription History</h1>
                            <p className="text-slate-500 font-medium flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-xl">pill</span>
                                Access your medical prescriptions and doctor's instructions.
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-separate border-spacing-0">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                                                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Diagnosis</th>
                                                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Prescribed By</th>
                                                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Medications</th>
                                                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {prescriptions.length > 0 ? (
                                                prescriptions.map((prx) => (
                                                    <tr key={prx.id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                                                        <td className="px-8 py-6 whitespace-nowrap">
                                                            <div className="text-sm font-bold text-slate-900">
                                                                {new Date(prx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-tight">
                                                                {prx.diagnosis}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6 whitespace-nowrap">
                                                            <div className="text-sm font-bold text-slate-700">Dr. {prx.doctor.user.name}</div>
                                                        </td>
                                                        <td className="px-8 py-6 max-w-xs transition-all">
                                                            <div className="text-sm text-slate-500 font-medium italic">"{prx.medications}"</div>
                                                            {prx.instructions && (
                                                                <p className="text-[10px] text-slate-400 mt-1 font-medium">{prx.instructions}</p>
                                                            )}
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <button className="p-2 rounded-xl text-slate-400 hover:text-primary transition-all">
                                                                <span className="material-symbols-outlined">download</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400">
                                                        <p className="font-bold">No prescriptions recorded yet</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
