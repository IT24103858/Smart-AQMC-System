import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useEffect, useState } from 'react';
import EditPatientProfileModal from '../components/EditPatientProfileModal';
import AddMedicalRecordModal from '../components/AddMedicalRecordModal';

export default function PatientProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
    const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
    const [recordsLoading, setRecordsLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const localUser = JSON.parse(savedUser);
            try {
                const response = await fetch(`/api/users/${localUser.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                    fetchMedicalRecords(localUser.id);
                    return data;
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            } finally {
                setLoading(false);
            }
        }
        return null;
    };

    const fetchMedicalRecords = async (patientId: string) => {
        try {
            const response = await fetch(`/api/medical-records/patient/${patientId}`);
            if (response.ok) {
                const data = await response.json();
                setMedicalRecords(data);
            }
        } catch (error) {
            console.error('Error fetching medical records:', error);
        } finally {
            setRecordsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-slate-50 items-center justify-center">
                <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light relative custom-scrollbar text-slate-900">
                <Header title="My Profile" />
                <div className="flex-1 overflow-y-auto p-10">
                    <div className="max-w-4xl mx-auto flex flex-col gap-8">

                        {/* Profile Header Card */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                            <div className="px-10 pb-10">
                                <div className="relative -mt-16 mb-6 flex items-end gap-6">
                                    <div className="size-32 rounded-3xl bg-white p-1 shadow-xl shadow-slate-200/50">
                                        <div className="size-full rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                                            <span className="material-symbols-outlined text-6xl">person</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 mb-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{user?.name}</h2>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-primary font-bold">Patient Account</p>
                                                    <span className="size-1 rounded-full bg-slate-300"></span>
                                                    <p className="text-slate-500 font-medium">{user?.gender}, {user?.age} Years</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setIsEditModalOpen(true)}
                                                className="px-6 py-2.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm"
                                            >
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                                Edit Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Phone Number</span>
                                        <span className="text-lg font-bold text-slate-800">{user?.phone}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Email Address</span>
                                        <span className="text-lg font-bold text-slate-800">{user?.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                            {/* Personal Info */}
                            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/20 transition-all">
                                <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary p-2 bg-primary/5 rounded-xl">contact_mail</span>
                                    Personal Information
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <span className="material-symbols-outlined text-xl">id_card</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">NIC Number</p>
                                                <p className="font-bold text-slate-700">{user?.nic}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <span className="material-symbols-outlined text-xl">bloodtype</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Blood Group</p>
                                                <p className="font-bold text-rose-600">{user?.bloodGroup || 'Not Set'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                        <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                            <span className="material-symbols-outlined text-xl">home</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Residential Address</p>
                                            <p className="font-bold text-slate-700 leading-tight">{user?.address || 'Address not provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Emergency & Health Brief */}
                            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/20 transition-all">
                                <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-emerald-500 p-2 bg-emerald-50 rounded-xl">emergency_home</span>
                                    Emergency & Health
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                            <span className="material-symbols-outlined text-xl">contact_emergency</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Emergency Contact</p>
                                            <p className="font-bold text-slate-700">{user?.emergencyContact || 'None'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-5 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm shadow-blue-500/5">
                                        <div className="size-10 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                                            <span className="material-symbols-outlined text-xl">medical_information</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none mb-2 mt-1">Health Summary</p>
                                            <p className="text-xs font-bold text-blue-900 leading-relaxed italic">
                                                {user?.medicalHistory || 'No medical history recorded. Update your profile to add important health information.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Medical History Section */}
                        <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 italic uppercase">
                                        <span className="material-symbols-outlined text-primary text-3xl">history_edu</span>
                                        Medical History
                                    </h3>
                                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1 ml-1">Archive of all your consultations and reports</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setIsAddRecordModalOpen(true)}
                                        className="px-6 py-2.5 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        Add New Record
                                    </button>
                                    <span className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        {medicalRecords.length} Records Found
                                    </span>
                                </div>
                            </div>

                            {recordsLoading ? (
                                <div className="py-12 flex items-center justify-center gap-3 text-slate-300">
                                    <span className="material-symbols-outlined animate-spin">sync</span>
                                    <span className="font-black uppercase tracking-widest text-[10px]">Loading History...</span>
                                </div>
                            ) : medicalRecords.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[32px]">
                                    <span className="material-symbols-outlined text-5xl mb-3">folder_off</span>
                                    <p className="font-black uppercase tracking-widest text-[10px]">No medical records available</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {medicalRecords.map((record, i) => (
                                        <div key={record.id || i} className="group bg-slate-50/50 hover:bg-white p-6 rounded-3xl border border-transparent hover:border-slate-200 transition-all duration-300 flex items-center gap-6">
                                            {/* Date Badge */}
                                            <div className="flex flex-col items-center justify-center size-16 rounded-2xl bg-white border border-slate-100 shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                    {new Date(record.date).toLocaleString('default', { month: 'short' })}
                                                </span>
                                                <span className="text-xl font-black text-slate-900 leading-none">
                                                    {new Date(record.date).getDate()}
                                                </span>
                                            </div>

                                            {/* Main Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                        record.recordType === 'PRESCRIPTION' 
                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                                        : 'bg-primary/5 text-primary border border-primary/10'
                                                    }`}>
                                                        {record.recordType.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 italic">
                                                        Added {new Date(record.date).getFullYear()}
                                                    </span>
                                                </div>
                                                <h4 className="font-black text-slate-900 text-lg leading-tight truncate">{record.title}</h4>
                                                <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-1">{record.description}</p>
                                            </div>

                                            {/* Action Link */}
                                            {record.filePath ? (
                                                <a 
                                                    href={`/api/${record.filePath.replace(/\\/g, '/')}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 transition-all shrink-0"
                                                    title="View Document"
                                                >
                                                    <span className="material-symbols-outlined text-2xl">description</span>
                                                </a>
                                            ) : (
                                                <button 
                                                    className="size-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-110 transition-all shrink-0"
                                                    title="Prescription Details"
                                                >
                                                    <span className="material-symbols-outlined text-2xl">prescriptions</span>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <EditPatientProfileModal
                            isOpen={isEditModalOpen}
                            onClose={() => setIsEditModalOpen(false)}
                            onUpdate={(updatedData) => {
                                setUser(updatedData);
                                // Refresh localStorage with updated data for sidebar/header
                                const savedUser = localStorage.getItem('user');
                                if (savedUser && updatedData) {
                                    const localUser = JSON.parse(savedUser);
                                    const updatedLocalUser = { ...localUser, ...updatedData };
                                    localStorage.setItem('user', JSON.stringify(updatedLocalUser));
                                    // Optionally refresh profile view without full reload if possible, 
                                    // but reload ensures consistency across the whole app UI (sidebar etc)
                                    window.location.reload();
                                }
                                setIsEditModalOpen(false);
                            }}
                            initialData={user}
                        />

                        <AddMedicalRecordModal
                            isOpen={isAddRecordModalOpen}
                            onClose={() => setIsAddRecordModalOpen(false)}
                            onAdd={() => {
                                if (user?.id) fetchMedicalRecords(user.id);
                            }}
                            patientId={user?.id}
                        />

                    </div>
                </div>
            </main>
        </div>
    );
}
