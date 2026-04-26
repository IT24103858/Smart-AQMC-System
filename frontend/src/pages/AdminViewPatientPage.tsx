import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

export default function AdminViewPatientPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showNotification } = useNotification();
    const [isLoading, setIsLoading] = useState(true);
    const [patient, setPatient] = useState<any>(null);

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const response = await fetch(`/api/users/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setPatient(data);
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

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!patient) return <div className="flex h-screen items-center justify-center">Patient not found</div>;

    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-white relative custom-scrollbar text-slate-900 border-l border-slate-100">
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-slate-800">Patient Management Module</h1>
                    <p className="text-sm text-slate-400 mt-1">Viewing patient profile.</p>
                </div>

                <div className="flex-1 overflow-y-auto px-10 py-5 bg-slate-50/50">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white">
                                <h3 className="text-xl font-bold text-slate-800">Patient Details</h3>
                                <span className={`px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                    patient.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                }`}>
                                    {patient.status}
                                </span>
                            </div>

                            <div className="p-10 flex flex-col gap-8">
                                {/* Top Info Section */}
                                <div className="flex items-center gap-6 pb-8 border-b border-slate-50">
                                    <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-4xl">person</span>
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-extrabold text-slate-900">{patient.name}</h2>
                                        <p className="text-slate-400 font-medium flex items-center gap-2 mt-1">
                                            <span className="material-symbols-outlined text-sm">mail</span>
                                            {patient.email}
                                        </p>
                                    </div>
                                </div>

                                {/* Information Grid */}
                                <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                                    <DetailBox label="NIC Number" value={patient.nic} />
                                    <DetailBox label="Date of Birth" value={patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'} />
                                    <DetailBox label="Phone Number" value={patient.phone} />
                                    <DetailBox label="Emergency Contact" value={patient.emergencyContact || 'N/A'} />
                                    <DetailBox label="Gender" value={patient.gender} />
                                    <DetailBox label="Blood Group" value={patient.bloodGroup || 'Not specified'} />
                                    <div className="col-span-2">
                                        <DetailBox label="Address" value={patient.address || 'N/A'} />
                                    </div>
                                    <div className="col-span-2">
                                        <DetailBox label="Medical History" value={patient.medicalHistory || 'No previous medical history recorded.'} isTextArea />
                                    </div>
                                </div>

                                {/* Bottom Buttons */}
                                <div className="flex items-center gap-3 mt-6 pt-8 border-t border-slate-50">
                                    <button
                                        onClick={() => navigate(`/admin/patients/${id}/edit`)}
                                        className="flex-1 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                                    >
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={() => navigate('/admin/patients')}
                                        className="flex-1 bg-slate-100 text-slate-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                                    >
                                        Back to List
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function DetailBox({ label, value, isTextArea = false }: { label: string, value: string, isTextArea?: boolean }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <div className={`w-full px-5 py-3 ${isTextArea ? 'bg-slate-50' : 'bg-slate-50/50'} border border-slate-100 rounded-2xl text-slate-700 font-semibold ${isTextArea ? 'min-h-[100px]' : ''}`}>
                {value}
            </div>
        </div>
    );
}
