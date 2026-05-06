import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useNotification } from '../context/NotificationContext';

export default function AdminMedicalRecordsPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const { showNotification } = useNotification();

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/medical-records');
            if (response.ok) {
                const data = await response.json();
                setRecords(data);
            }
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) return;

        try {
            const response = await fetch(`/api/medical-records/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showNotification('Record deleted successfully');
                setRecords(records.filter(r => r.id !== id));
            }
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    };

    const filteredRecords = records.filter(record => {
        // Only show Patient Uploads (PAST_REPORT) and Prescriptions
        const isAllowedType = record.recordType === 'PAST_REPORT' || record.recordType === 'PRESCRIPTION';
        if (!isAllowedType) return false;

        const matchesSearch = 
            record.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.patient?.nic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.title?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filterType === 'ALL' || record.recordType === filterType;
        
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
                <Header title="Medical Records Management" />
                
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
                        {/* Title & Filters */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex flex-col gap-2">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Medical Records</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-[12px] font-black text-slate-400 tracking-[0.2em] uppercase">Clinic Archive</span>
                                    <div className="size-1.5 rounded-full bg-slate-300" />
                                    <span className="text-[12px] font-black text-primary tracking-[0.2em] uppercase">{records.length} TOTAL RECORDS</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                {/* Search */}
                                <div className="relative min-w-[300px]">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                                    <input 
                                        type="text"
                                        placeholder="Search by Patient Name, NIC or Title..."
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-[13px] text-slate-700"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {/* Filter */}
                                <div className="relative min-w-[180px]">
                                    <select 
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-black text-[11px] text-slate-500 uppercase tracking-widest appearance-none cursor-pointer"
                                    >
                                        <option value="ALL">All Record Types</option>
                                        <option value="PRESCRIPTION">Prescriptions</option>
                                        <option value="PAST_REPORT">Past Reports</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-[18px]">expand_more</span>
                                </div>
                            </div>
                        </div>

                        {/* Records Table */}
                        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden ring-1 ring-slate-100/50">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                                            <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient Details</th>
                                            <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Medical Staff</th>
                                            <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Record Info</th>
                                            <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={5} className="py-20 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Loading Archive...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredRecords.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest opacity-50">
                                                    No records found matching your search.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredRecords.map((record) => (
                                                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-[13px] font-black text-slate-900 tracking-tight">
                                                                {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                                                                {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-[14px] font-black text-slate-900 tracking-tight leading-none mb-1.5 uppercase">{record.patient?.name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black tracking-widest">{record.patient?.nic}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        {record.doctor ? (
                                                            <div className="flex flex-col">
                                                                <span className="text-[13px] font-black text-primary leading-none mb-1 uppercase">DR. {record.doctor.user?.name.split(' ').pop()}</span>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attending Physician</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Patient Upload</span>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                                                                    record.recordType === 'PRESCRIPTION' 
                                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                                                    : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                                                }`}>
                                                                    {record.recordType.replace('_', ' ')}
                                                                </span>
                                                                <span className="text-[13px] font-black text-slate-700 truncate max-w-[200px] tracking-tight">{record.title}</span>
                                                            </div>
                                                            {record.session && (
                                                                <div className="flex items-center gap-1 opacity-60">
                                                                    <span className="material-symbols-outlined text-[14px] text-slate-400">timer</span>
                                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{record.session.timeBlock}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {record.filePath && (
                                                                <a 
                                                                    href={`/${record.filePath}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="size-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-primary/10 hover:text-primary transition-all border border-slate-100 hover:border-primary/20"
                                                                    title="View Document"
                                                                >
                                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                                </a>
                                                            )}
                                                            <button 
                                                                onClick={() => handleDelete(record.id)}
                                                                className="size-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100 hover:border-rose-200"
                                                                title="Delete Record"
                                                            >
                                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
