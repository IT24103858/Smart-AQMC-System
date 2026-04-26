import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const STEPS = [
    { title: 'Specialization', icon: 'stethoscope' },
    { title: 'Doctor', icon: 'person' },
    { title: 'Slot', icon: 'schedule' },
    { title: 'Details', icon: 'list_alt' },
    { title: 'Confirmed', icon: 'task_alt' }
];

export default function BookingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    const [specializations, setSpecializations] = useState<string[]>(['Cardiology', 'Pediatrics', 'Neurology', 'Dental', 'Oncology']);
    const [selectedSpec, setSelectedSpec] = useState('');
    
    const [doctors, setDoctors] = useState<any[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSessions, setAvailableSessions] = useState<any[]>([]);
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [medicalReport, setMedicalReport] = useState<File | null>(null);
    const [illnessDescription, setIllnessDescription] = useState('');
    
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) return;
        setUser(JSON.parse(savedUser));
        fetchSpecializations();

        if (location.state?.doctor && location.state?.specialization) {
            setSelectedSpec(location.state.specialization);
            setSelectedDoctor(location.state.doctor);
            setCurrentStep(3);
        }
    }, [location.state]);

    const isRescheduling = !!location.state?.oldSessionId;
    const oldSession = location.state?.oldSessionDetails;

    const fetchSpecializations = async () => {
        const res = await fetch('/api/schedule/specializations');
        if (res.ok) setSpecializations(await res.json());
    };

    const fetchDoctorsBySpec = async (spec: string) => {
        setLoading(true);
        const res = await fetch(`/api/doctors/specialization/${spec}`);
        if (res.ok) setDoctors(await res.json());
        setLoading(false);
    };

    const fetchAvailableSessions = async (dateOverride?: string) => {
        setLoading(true);
        const dateToUse = dateOverride !== undefined ? dateOverride : selectedDate;
        const doctorId = selectedDoctor?.id || selectedDoctor?._id;
        
        try {
            const res = await fetch(`/api/schedule/available?doctorId=${doctorId}&date=${dateToUse}`);
            if (res.ok) {
                const data = await res.json();
                setAvailableSessions(data.sessions || []);
                setAvailableDates(data.availableDates || []);
                
                // If we just entered step 3 and have no date selected, auto-select the first available date
                if (!dateToUse && data.availableDates?.length > 0) {
                    const firstDate = data.availableDates[0];
                    setSelectedDate(firstDate);
                    // Fetch again for that specific date
                    const res2 = await fetch(`/api/schedule/available?doctorId=${doctorId}&date=${firstDate}`);
                    if (res2.ok) {
                        const data2 = await res2.json();
                        setAvailableSessions(data2.sessions || []);
                    }
                }
            }
        } catch (err) {
            console.error('Fetch sessions error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedSpec) fetchDoctorsBySpec(selectedSpec);
    }, [selectedSpec]);

    useEffect(() => {
        if (selectedDoctor && currentStep === 3) {
            fetchAvailableSessions();
        }
    }, [selectedDoctor, selectedDate, currentStep]);

    const handleBooking = async () => {
        setLoading(true);
        try {
            if (isRescheduling && user) {
                await fetch(`/api/schedule/${location.state.oldSessionId}/unenroll`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ patientId: user.id })
                });
            }

            const sessId = selectedSession.id || selectedSession._id;
            
            // Create FormData to handle file upload
            const formData = new FormData();
            formData.append('patientId', user.id);
            formData.append('illnessDescription', illnessDescription);
            if (medicalReport) {
                formData.append('medicalReport', medicalReport);
            }

            const res = await fetch(`/api/schedule/${sessId}/enroll`, {
                method: 'POST',
                // Note: Don't set Content-Type header when sending FormData, 
                // the browser will set it automatically with the correct boundary
                body: formData
            });

            if (res.ok) setCurrentStep(5);
        } catch (error) {
            console.error('Booking error:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextDays = useMemo(() => getNext7Days(), []);
    const appointmentCode = useMemo(() => `APT-${Math.floor(Math.random()*90000 + 10000)}`, [currentStep]);

    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                <Header title="Patient Portal" />
                <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
                    <div className="max-w-4xl mx-auto flex flex-col gap-8">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Book Appointment</h1>
                            <p className="text-slate-500 font-medium">MediCare Specialist Booking</p>
                        </div>

                        <div className="flex items-center justify-between w-full relative px-2 mb-4">
                            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200 -translate-y-[20px] -z-10 px-10">
                                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(currentStep - 1) * 25}%` }}></div>
                            </div>
                            {STEPS.map((step, idx) => (
                                <div key={step.title} className="flex flex-col items-center gap-3">
                                    <div className={`size-10 rounded-full flex items-center justify-center transition-all duration-300 font-bold border-2 ${
                                        currentStep > idx + 1 ? 'bg-primary border-primary text-white' :
                                        currentStep === idx + 1 ? 'bg-white border-primary text-primary' :
                                        'bg-white border-slate-200 text-slate-400'
                                    }`}>
                                        {currentStep > idx + 1 ? <span className="material-symbols-outlined text-sm">check</span> : (idx + 1)}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${currentStep >= idx+1 ? 'text-slate-900':'text-slate-400'}`}>{step.title}</span>
                                </div>
                            ))}
                        </div>

                        {isRescheduling && currentStep < 5 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-center gap-6 animate-in slide-in-from-top-4 duration-500">
                                <div className="size-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-3xl">edit_calendar</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Rescheduling Appointment</p>
                                    <p className="text-sm font-bold text-slate-900">Changing session with Dr. {oldSession?.doctor?.user?.name} ({oldSession?.date} • {oldSession?.timeBlock})</p>
                                </div>
                                <button onClick={() => navigate('/patient/appointments')} className="text-amber-500 font-black text-[10px] uppercase tracking-widest hover:underline px-4">Keep Original</button>
                            </div>
                        )}

                        <div className="bg-white rounded-[40px] p-12 border border-slate-200 shadow-2xl shadow-slate-200/50 min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
                            
                            {currentStep === 1 && (
                                <div className="flex flex-col gap-10">
                                    <h2 className="text-2xl font-black text-slate-900">1. Select Specialization</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                        {specializations.map(spec => (
                                            <button 
                                                key={spec} 
                                                onClick={() => { setSelectedSpec(spec); setCurrentStep(2); }}
                                                className="p-8 rounded-[32px] border-2 border-slate-50 bg-slate-50/50 hover:border-primary/20 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all text-center flex flex-col items-center gap-4 group"
                                            >
                                                <div className="size-16 rounded-3xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                                    <span className="material-symbols-outlined text-3xl">{getSpecIcon(spec)}</span>
                                                </div>
                                                <span className="font-extrabold text-sm uppercase tracking-widest text-slate-500 group-hover:text-primary transition-all">{spec}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="flex flex-col gap-10">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-black text-slate-900">2. Choose Your Specialist</h2>
                                        <button onClick={() => setCurrentStep(1)} className="text-primary font-bold text-sm bg-primary/5 px-4 py-2 rounded-full hover:bg-primary/10 transition-all flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                                            Change Dept
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {doctors.map(dr => (
                                            <div key={dr.id || dr._id} className="bg-slate-50/50 rounded-[40px] p-8 border border-slate-100 flex flex-col gap-6 group hover:border-primary/20 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className="size-20 rounded-3xl bg-white flex items-center justify-center border border-slate-100 shadow-inner">
                                                        <span className="material-symbols-outlined text-4xl text-slate-300">person</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-slate-900">Dr. {dr.user.name}</h3>
                                                        <p className="text-primary font-bold text-xs uppercase tracking-[0.2em]">{dr.specialization}</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 border-t border-slate-200/50 pt-6">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</span>
                                                        <span className="font-bold text-slate-700 text-sm">{dr.experienceYears}+ Years</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hospital</span>
                                                        <span className="font-bold text-slate-700 text-sm truncate">{dr.primaryHospital}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee</span>
                                                        <span className="font-black text-emerald-600 text-sm">LKR {dr.consultantFee}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</span>
                                                        <span className="font-bold text-slate-700 text-sm">Selectable</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => { setSelectedDoctor(dr); setSelectedDate(''); setCurrentStep(3); }} className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all">
                                                    Select Doctor
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="flex flex-col gap-10">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-black text-slate-900">3. Select Appointment Slot</h2>
                                        <button onClick={() => setCurrentStep(2)} className="text-primary font-bold text-sm bg-primary/5 px-4 py-2 rounded-full hover:bg-primary/10 transition-all flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                                            Back
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-8">
                                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                            {nextDays.map(d => {
                                                const hasSession = availableDates.includes(d.id);
                                                return (
                                                    <button 
                                                        key={d.id} 
                                                        onClick={() => setSelectedDate(d.id)} 
                                                        className={`px-8 py-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-1 shrink-0 relative ${
                                                            selectedDate === d.id ? 'border-primary bg-primary/5 text-primary' : 
                                                            'border-slate-100 bg-white hover:border-slate-200'
                                                        }`}
                                                    >
                                                        {hasSession && <div className="absolute top-2 right-2 size-2 bg-emerald-500 rounded-full animate-pulse"></div>}
                                                        <span className="text-[11px] font-black uppercase tracking-widest opacity-60">{d.dayShort}</span>
                                                        <span className="text-2xl font-black">{d.dateNum}</span>
                                                        <span className="text-[11px] font-bold uppercase tracking-tighter">{d.month}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        
                                        <div className="grid grid-cols-1 gap-4">
                                            {loading ? (
                                                <div className="py-20 flex justify-center"><div className="animate-spin size-10 border-4 border-primary border-t-transparent rounded-full"></div></div>
                                            ) : selectedDate ? (
                                                availableSessions.length > 0 ? availableSessions.map(sess => (
                                                    <button key={sess.id || sess._id} onClick={() => { setSelectedSession(sess); setCurrentStep(4); }} className="p-8 rounded-[32px] border-2 border-slate-50 bg-slate-50/50 hover:border-primary/20 hover:bg-white transition-all flex items-center justify-between group">
                                                        <div className="flex items-center gap-8">
                                                            <div className="size-14 rounded-2xl bg-white shadow-inner flex items-center justify-center text-primary font-black">
                                                                {sess.startTime}
                                                            </div>
                                                            <div className="text-left">
                                                                <h4 className="font-extrabold text-slate-900">{sess.timeBlock}</h4>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{sess.room?.name || 'Main Hall'} • {sess.room?.location || 'Floor 1'}</p>
                                                                    <span className="size-1 rounded-full bg-slate-200"></span>
                                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                                                        <span className="material-symbols-outlined text-[14px]">group</span>
                                                                        <span className="text-[10px] font-black uppercase tracking-tight">{(sess.enrolledPatients?.length || 0)} / {(sess.room?.capacity || 20)} Enrolled</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1">arrow_forward</span>
                                                    </button>
                                                )) : (
                                                    <div className="py-24 text-center border-4 border-dashed border-slate-50 rounded-[60px] bg-slate-50/20 relative overflow-hidden group">
                                                        <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white/60 pointer-events-none"></div>
                                                        <div className="relative z-10 flex flex-col items-center gap-6">
                                                            <div className="size-20 rounded-full bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-slate-200 group-hover:text-primary/20 transition-all duration-700">
                                                                <span className="material-symbols-outlined text-5xl">calendar_today</span>
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <h3 className="text-xl font-black text-slate-900 tracking-tight">No Sessions Available</h3>
                                                                <p className="text-sm font-medium text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                                                                    Dr. {selectedDoctor?.user.name} is not scheduled for <span className="text-primary font-bold">{selectedDate}</span>.
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-col items-center gap-4 mt-2">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">
                                                                    Pro Tip
                                                                </p>
                                                                <p className="text-xs font-bold text-slate-400">
                                                                    Look for days with a <span className="text-emerald-500 inline-flex items-center gap-1"><span className="size-2 bg-emerald-500 rounded-full"></span> green dot</span> for active sessions
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="py-20 text-center text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-[32px]">Please select a date first.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="flex flex-col gap-10">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-black text-slate-900">4. Review & Confirm</h2>
                                        <button onClick={() => setCurrentStep(3)} className="text-primary font-bold text-sm bg-primary/5 px-4 py-2 rounded-full hover:bg-primary/10 transition-all flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                                            Back
                                        </button>
                                    </div>
                                    <div className="bg-slate-50/50 rounded-[40px] border border-slate-200 overflow-hidden">
                                        <div className="bg-white px-10 py-8 border-b border-slate-200 flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Appointment Code</p>
                                                <p className="text-xl font-black text-primary">{appointmentCode}</p>
                                            </div>
                                            <div className="size-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                                                <span className="material-symbols-outlined text-3xl font-black">verified_user</span>
                                            </div>
                                        </div>
                                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="flex flex-col gap-12">
                                                <div>
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Patient Details</p>
                                                    <p className="text-xl font-black text-slate-900">{user?.name}</p>
                                                    <p className="text-sm font-medium text-slate-500 mt-1">{user?.nic} • {user?.phone}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Doctor Details</p>
                                                    <p className="text-xl font-black text-slate-900">Dr. {selectedDoctor?.user.name}</p>
                                                    <p className="text-sm font-medium text-slate-500 mt-1">{selectedSpec} Specialist • {selectedDoctor?.experienceYears}+ Yrs Exp</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-12">
                                                <div>
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Appointment Session</p>
                                                    <p className="text-xl font-black text-slate-900">{selectedSession?.date}</p>
                                                    <p className="text-sm font-medium text-slate-500 mt-1">{selectedSession?.timeBlock} • {selectedSession?.dayOfWeek}</p>
                                                </div>
                                                <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-inner">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-bold text-slate-400">Consultation Fee</span>
                                                        <span className="font-black text-slate-900">LKR {selectedDoctor?.consultantFee}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                                        <span className="text-xs font-black text-slate-900 uppercase">Total Payable</span>
                                                        <span className="text-2xl font-black text-primary">LKR {selectedDoctor?.consultantFee}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Illness Description Section */}
                                    <div className="bg-white border border-slate-200 rounded-[40px] p-8 mt-2 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <span className="material-symbols-outlined text-xl">description</span>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Reason for Visit</h3>
                                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Please provide a brief description of your symptoms</p>
                                            </div>
                                        </div>
                                        <textarea 
                                            value={illnessDescription}
                                            onChange={(e) => setIllnessDescription(e.target.value)}
                                            placeholder="Example: Severe headache for 2 days, fever, and body aches..."
                                            className="w-full min-h-[120px] bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-primary/30 transition-all resize-none"
                                        />
                                    </div>

                                    {/* Medical Report Upload Section */}
                                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-8 mt-2 group hover:border-primary/50 transition-all">
                                        <div className="flex flex-col items-center gap-4 text-center">
                                            <div className="size-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                <span className="material-symbols-outlined text-3xl">upload_file</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900">Upload Medical Reports</h3>
                                                <p className="text-sm font-medium text-slate-500 mt-1 italic">Optional: Provide previous reports for doctor's review</p>
                                            </div>
                                            
                                            <input 
                                                type="file" 
                                                id="medical-report" 
                                                className="hidden" 
                                                onChange={(e) => setMedicalReport(e.target.files?.[0] || null)}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                            />
                                            
                                            {medicalReport ? (
                                                <div className="flex items-center gap-4 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 animate-in zoom-in duration-300">
                                                    <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                                                    <span className="text-sm font-bold text-emerald-700 truncate max-w-[200px]">{medicalReport.name}</span>
                                                    <button onClick={() => setMedicalReport(null)} className="size-6 rounded-full hover:bg-emerald-200 flex items-center justify-center transition-colors">
                                                        <span className="material-symbols-outlined text-xs">close</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <label htmlFor="medical-report" className="cursor-pointer bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-lg shadow-slate-900/20">
                                                    Select File
                                                </label>
                                            )}
                                            <p className="text-[10px] font-bold text-slate-400">Supported: PDF, JPG, PNG (Max 5MB)</p>
                                        </div>
                                    </div>

                                    <button onClick={handleBooking} disabled={loading} className="w-full py-6 bg-slate-900 text-white rounded-[40px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-slate-900/10 hover:bg-slate-800 transition-all hover:scale-[1.01] flex items-center justify-center gap-3">
                                        {loading ? (
                                            <div className="animate-spin size-5 border-3 border-white border-t-transparent rounded-full"></div>
                                        ) : (
                                            isRescheduling ? 'Reschedule Appointment' : 'Confirm Appointment'
                                        )}
                                    </button>
                                </div>
                            )}

                            {currentStep === 5 && (
                                <div className="flex flex-col h-full bg-white animate-in zoom-in duration-500">
                                    <div className="relative isolate pt-14 pb-14 text-center border-[12px] border-slate-50 rounded-[60px] flex-1 flex flex-col items-center justify-center bg-blue-50/20">
                                        <div className="size-28 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-200 mb-8 animate-bounce-slow">
                                            <span className="material-symbols-outlined text-6xl">check</span>
                                        </div>
                                        
                                        <h2 className="text-4xl font-black text-slate-900 mb-4">{isRescheduling ? 'Rescheduled!' : 'Appointment Booked!'}</h2>
                                        <p className="text-slate-500 font-medium max-w-sm mb-12">
                                            Your session with the {selectedSpec} department is confirmed.
                                        </p>

                                        <div className="bg-white/80 backdrop-blur px-8 py-4 rounded-3xl border border-white text-slate-300 font-black tracking-widest text-xl mb-12 shadow-sm uppercase">
                                            {appointmentCode}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                                            <div className="bg-white p-6 rounded-3xl border border-slate-100 text-left">
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">SERVICE</p>
                                                <p className="font-black text-slate-900">{selectedSpec}</p>
                                            </div>
                                            <div className="bg-white p-6 rounded-3xl border border-slate-100 text-left">
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">DOCTOR</p>
                                                <p className="font-black text-slate-900">Dr. {selectedDoctor?.user.name.toLowerCase()}</p>
                                            </div>
                                            <div className="bg-white p-6 rounded-3xl border border-slate-100 text-left">
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">DATE</p>
                                                <p className="font-black text-slate-900">{selectedSession?.date}</p>
                                            </div>
                                            <div className="bg-white p-6 rounded-3xl border border-slate-100 text-left">
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">TIME</p>
                                                <p className="font-black text-slate-900">{selectedSession?.timeBlock}</p>
                                            </div>
                                            <div className="col-span-2 bg-white p-6 rounded-3xl border border-slate-100 text-left flex justify-between items-center">
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">STATUS</p>
                                                <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-black text-[10px] uppercase tracking-widest border border-emerald-100">CONFIRMED</span>
                                            </div>
                                        </div>

                                        <div className="mt-16 flex gap-4 w-full max-w-2xl">
                                            <button onClick={() => navigate('/patient/appointments')} className="flex-1 py-5 rounded-3xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:-translate-y-1 transition-all">My Schedule</button>
                                            <button onClick={() => navigate('/patient')} className="flex-1 py-5 rounded-3xl bg-slate-100 text-slate-500 font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">Go Home</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function getSpecIcon(spec: string) {
    const icons: any = {
        'CARDIOLOGY': 'monitor_heart',
        'PEDIATRICS': 'child_care',
        'ONCOLOGY': 'medical_information',
        'NEUROLOGY': 'neurology',
        'DENTISTRY': 'dentistry',
        'DENTAL': 'dentistry',
        'SURGERY': 'surgical',
        'GENERAL': 'medical_services',
        'LABORATORY': 'biotech',
        'PHARMACY': 'pill',
        'EMERGENCY': 'emergency'
    };
    return icons[spec.toUpperCase()] || 'medical_services';
}

function getNext7Days() {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        days.push({
            id: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
            dayShort: d.toLocaleString('default', { weekday: 'short' }),
            dateNum: d.getDate(),
            month: d.toLocaleString('default', { month: 'short' })
        });
    }
    return days;
}
