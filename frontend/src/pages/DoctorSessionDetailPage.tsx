import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PrescriptionModal from '../components/PrescriptionModal';

export default function DoctorSessionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Prescription states
    const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [prescriptions, setPrescriptions] = useState<Record<string, any>>({});
    const [isViewOnly, setIsViewOnly] = useState(false);

    useEffect(() => {
        if (id) {
            fetchSession(id);
            fetchPrescriptions(id);
        }
    }, [id]);

    const fetchSession = async (sessionId: string) => {
        try {
            const res = await fetch(`/api/schedule/${sessionId}`);
            if (res.ok) {
                const data = await res.json();
                setSession(data);
            }
        } catch (err) {
            console.error('Failed to fetch session:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPrescriptions = async (sessionId: string) => {
        try {
            const res = await fetch(`/api/prescriptions/session/${sessionId}`);
            if (res.ok) {
                const data = await res.json();
                const mapping: Record<string, any> = {};
                data.forEach((p: any) => {
                    mapping[p.patient._id || p.patient.id || p.patient] = p;
                });
                setPrescriptions(mapping);
            }
        } catch (err) {
            console.error('Failed to fetch prescriptions:', err);
        }
    };

    const handleOpenPrescription = (patient: any) => {
        setSelectedPatient(patient);
        setIsViewOnly(false);
        setIsPrescriptionOpen(true);
    };

    const handleViewPrescription = (patient: any) => {
        setSelectedPatient(patient);
        setIsViewOnly(true);
        setIsPrescriptionOpen(true);
    };

    const handlePrescriptionSuccess = (patientId: string) => {
        // Refresh prescriptions to get the new one
        if (id) fetchPrescriptions(id);
    };

    const enrollments: any[] = session?.enrolledPatients || [];
    const filtered = enrollments.filter((entry: any) => {
        const p = entry.patient;
        if (!p) return false;
        return [p.name, p.email, p.phone, p.nic].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    });

    const capacity = session?.room?.capacity || 20;
    const enrolled = enrollments.length;
    const pct = Math.min((enrolled / capacity) * 100, 100);

    // Locking Logic: Only allow actions DURING the session
    const now = new Date();
    
    const [startH, startM] = (session?.startTime || '00:00').split(':').map(Number);
    const sessionStart = new Date(session?.date + 'T00:00:00');
    sessionStart.setHours(startH, startM, 0, 0);

    const [endH, endM] = (session?.endTime || '00:00').split(':').map(Number);
    const sessionEnd = new Date(session?.date + 'T00:00:00');
    sessionEnd.setHours(endH, endM, 0, 0);

    const isLocked = now > sessionEnd || now < sessionStart;

    const handleMarkComplete = async (patientId: string) => {
        if (isLocked) return;
        try {
            const res = await fetch(`/api/schedule/${id}/patient/${patientId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'COMPLETED' })
            });
            if (res.ok) {
                fetchSession(id!);
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen bg-slate-50 items-center justify-center font-['Inter']">
                <div className="flex flex-col items-center gap-4 text-slate-300">
                    <span className="material-symbols-outlined text-5xl animate-spin">sync</span>
                    <span className="font-black uppercase tracking-[0.2em] text-sm">Loading Session...</span>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex h-screen bg-slate-50 items-center justify-center font-['Inter']">
                <div className="text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-200">error</span>
                    <p className="text-slate-400 font-bold mt-2">Session not found</p>
                    <button onClick={() => navigate('/doctor/sessions')} className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm">← Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-white custom-scrollbar">
                <Header title="Session Dashboard" />

                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/40 space-y-8">

                    {/* Back */}
                    <button
                        onClick={() => navigate('/doctor/sessions')}
                        className="flex items-center gap-2 text-slate-400 hover:text-primary font-bold text-sm transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back to My Sessions
                    </button>

                    {/* Session Overview Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        {/* Header bar */}
                        <div className="h-2 bg-gradient-to-r from-primary to-primary-dark" />
                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Time & Day */}
                            <div className="flex items-start gap-4">
                                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <span className="material-symbols-outlined text-[30px]">schedule</span>
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Time Block</p>
                                    <p className="text-2xl font-black text-slate-900">{session.startTime} – {session.endTime}</p>
                                    <p className="text-sm font-bold text-slate-400 mt-0.5">
                                        {session.dayOfWeek}, {new Date(session.date + 'T12:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            {/* Room */}
                            <div className="flex items-start gap-4">
                                <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                    <span className="material-symbols-outlined text-[30px]">meeting_room</span>
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Clinic Unit</p>
                                    <p className="text-2xl font-black text-slate-900">{session.room?.name}</p>
                                    <span className="inline-block px-3 py-1 bg-slate-100 text-[10px] font-black rounded-lg text-slate-500 uppercase mt-1">
                                        {session.room?.specialization}
                                    </span>
                                </div>
                            </div>

                            {/* Enrollment Progress */}
                            <div className="flex flex-col justify-center gap-3">
                                <div className="flex justify-between items-end">
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Appointments</p>
                                    <p className="text-sm font-black text-primary">{enrolled} / {capacity}</p>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-700"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 font-bold">
                                    {capacity - enrolled} slot{capacity - enrolled !== 1 ? 's' : ''} remaining
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Enrolled Patients Section */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-8 pt-8 pb-5 flex items-center justify-between gap-4 flex-wrap border-b border-slate-100">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Booked Appointments</h3>
                                <p className="text-sm text-slate-400 font-medium mt-0.5">{enrolled} patient{enrolled !== 1 ? 's' : ''} registered for this session</p>
                            </div>
                            {enrolled > 0 && (
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[20px]">search</span>
                                    <input
                                        type="text"
                                        placeholder="Search by name, NIC, phone..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-primary/40 transition-all w-72"
                                    />
                                </div>
                            )}
                        </div>

                        {enrolled === 0 ? (
                            <div className="py-24 flex flex-col items-center justify-center text-slate-300">
                                <span className="material-symbols-outlined text-6xl mb-4">group_off</span>
                                <p className="font-black uppercase tracking-[0.2em] text-sm text-slate-400">No Appointments Booked Yet</p>
                                <p className="text-xs text-slate-300 font-medium mt-1">Patients will appear here once they book this session</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="py-16 flex flex-col items-center justify-center text-slate-300">
                                <span className="material-symbols-outlined text-5xl mb-3">manage_search</span>
                                <p className="font-bold text-slate-400 text-sm">No patients match your search.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {filtered.map((entry: any, i: number) => {
                                    const patient = entry.patient;
                                    if (!patient) return null;
                                    const pID = patient.id || patient._id;
                                    const hasPrescription = !!prescriptions[pID];
                                    
                                    return (
                                        <div
                                            key={pID || i}
                                            className="px-8 py-5 flex items-center gap-5 hover:bg-slate-50/60 transition-colors"
                                        >
                                            {/* Queue number */}
                                            <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black shrink-0">
                                                #{i + 1}
                                            </div>

                                            {/* Avatar */}
                                            <div className="size-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0">
                                                {patient.name ? patient.name.charAt(0).toUpperCase() : '?'}
                                            </div>

                                            {/* Main Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-900 truncate">{patient.name || '—'}</p>
                                                <p className="text-xs text-slate-400 font-medium">{patient.email || '—'}</p>
                                                {entry.illnessDescription && (
                                                    <p className="text-[10px] font-bold text-primary mt-1 italic line-clamp-1">
                                                        <span className="opacity-60 not-italic uppercase tracking-tighter mr-1">Note:</span>
                                                        {entry.illnessDescription}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Metadata chips */}
                                            <div className="hidden md:flex items-center gap-3">
                                                {patient.phone && (
                                                    <span className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 rounded-xl text-[11px] font-bold text-slate-500">
                                                        <span className="material-symbols-outlined text-[14px]">call</span>
                                                        {patient.phone}
                                                    </span>
                                                )}
                                                {(patient.age || patient.gender) && (
                                                    <span className="px-3 py-1.5 bg-slate-100 rounded-xl text-[11px] font-bold text-slate-500">
                                                        {patient.age ? `${patient.age} yrs` : ''}{patient.age && patient.gender ? ' · ' : ''}{patient.gender || ''}
                                                    </span>
                                                )}
                                                {entry.medicalReport && (
                                                    <a 
                                                        href={`/api/${entry.medicalReport.replace(/\\/g, '/')}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-xl text-[11px] font-bold text-primary hover:bg-primary/20 transition-all"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">description</span>
                                                        View Report
                                                    </a>
                                                )}
                                                {entry.status === 'COMPLETED' ? (
                                                    <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[11px] font-black uppercase tracking-tighter border border-emerald-100">
                                                        <span className="material-symbols-outlined text-[14px]">task_alt</span>
                                                        Done
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-500 rounded-xl text-[11px] font-black uppercase tracking-tighter border border-rose-100">
                                                        <span className="material-symbols-outlined text-[14px]">pending</span>
                                                        Incomplete
                                                    </span>
                                                )}
                                            </div>

                                            {/* Action Button */}
                                            <div className="flex items-center gap-2">
                                                {hasPrescription ? (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewPrescription(patient);
                                                        }}
                                                        className="px-4 py-2.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                                                        View Prescription
                                                    </button>
                                                ) : (
                                                    <button 
                                                        disabled={isLocked}
                                                        className={`px-5 py-2.5 bg-sky-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-sky-700 transition-all flex items-center gap-2 ${isLocked ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenPrescription(patient);
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">prescriptions</span>
                                                        Prescription
                                                    </button>
                                                )}

                                                {entry.status !== 'COMPLETED' && (
                                                    <button
                                                        disabled={isLocked}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMarkComplete(pID);
                                                        }}
                                                        className={`px-4 py-2.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2 ${isLocked ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">check</span>
                                                        Complete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Prescription Modal */}
                <PrescriptionModal 
                    isOpen={isPrescriptionOpen}
                    onClose={() => setIsPrescriptionOpen(false)}
                    patientName={selectedPatient?.name || ''}
                    patientID={selectedPatient?.id || selectedPatient?._id || ''}
                    doctorID={session?.doctor?.id || session?.doctor?._id || session?.doctor || ''}
                    sessionId={id || ''}
                    onSuccess={() => handlePrescriptionSuccess(selectedPatient?.id || selectedPatient?._id)}
                    isViewOnly={isViewOnly}
                    existingData={selectedPatient ? prescriptions[selectedPatient.id || selectedPatient._id] : undefined}
                />
            </main>
        </div>
    );
}
