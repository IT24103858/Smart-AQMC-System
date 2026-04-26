import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

export default function AdminPatientsPage() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [patients, setPatients] = useState<any[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Patients');
    const [isLoading, setIsLoading] = useState(true);

    const fetchPatients = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/users');
            if (response.ok) {
                const data = await response.json();
                const onlyPatients = data.filter((u: any) => u.role === 'PATIENT');
                setPatients(onlyPatients);
                setFilteredPatients(onlyPatients);
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
            showNotification('Failed to load patients', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleSearch = () => {
        let filtered = patients;

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(lowerSearch) ||
                p.nic?.toLowerCase().includes(lowerSearch) ||
                p.email?.toLowerCase().includes(lowerSearch) ||
                p.phone?.toLowerCase().includes(lowerSearch)
            );
        }

        if (statusFilter !== 'All Patients') {
            const targetStatus = statusFilter.toLowerCase();
            filtered = filtered.filter(p => p.status === targetStatus);
        }

        setFilteredPatients(filtered);
    };

    // Auto-search on filter change
    useEffect(() => {
        handleSearch();
    }, [statusFilter, patients]);

    const handleToggleStatus = async (patient: any) => {
        const newStatus = patient.status === 'active' ? 'inactive' : 'active';
        try {
            const response = await fetch(`/api/users/${patient.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                showNotification(`Patient ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`, 'success');
                fetchPatients();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showNotification('Failed to update status', 'error');
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-white relative custom-scrollbar text-slate-900 border-l border-slate-100">
                {/* Module Header */}
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-slate-800">Patient Management Module</h1>
                    <p className="text-sm text-slate-400 mt-1">Admin can add, edit, search, filter and upload medical record files.</p>
                </div>

                <div className="flex-1 overflow-y-auto px-10 py-5 bg-slate-50/50">
                    <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-10">
                        {/* Internal Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Patients</h2>
                                <p className="text-sm text-slate-400 mt-1">Search by name, NIC, email or phone number. Filter active/inactive patients.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate('/admin/patients/add')}
                                    className="bg-primary text-white px-5 py-2 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">add</span>
                                    Add New Patient
                                </button>
                                <button
                                    onClick={fetchPatients}
                                    className="bg-white border border-slate-200 text-slate-600 px-5 py-2 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">refresh</span>
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {/* Search and Filter Bar */}
                        <div className="flex items-center gap-3 mb-10">
                            <div className="flex-1 max-w-md flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Search by name / NIC / email / phone"
                                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all text-sm placeholder:text-slate-300"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <button
                                    onClick={handleSearch}
                                    className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-sm"
                                >
                                    Search
                                </button>
                            </div>
                            <select
                                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all text-sm text-slate-600 font-medium"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option>All Patients</option>
                                <option>Active</option>
                                <option>Inactive</option>
                            </select>
                        </div>

                        {/* Patient List */}
                        <div className="flex flex-col gap-6">
                            {isLoading ? (
                                <div className="text-center py-20 text-slate-400 font-medium italic">Loading patients...</div>
                            ) : filteredPatients.length === 0 ? (
                                <div className="text-center py-20 text-slate-400 font-medium italic">No patients found matches your search.</div>
                            ) : (
                                filteredPatients.map((patient: any) => (
                                    <div key={patient.id} className="bg-white border border-slate-100 rounded-2xl p-8 flex justify-between items-center hover:shadow-md hover:border-slate-200 transition-all duration-300 group">
                                        {/* Patient Info */}
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-xl font-bold text-slate-800">{patient.name}</h3>
                                            <div className="flex flex-col text-sm text-slate-500 font-medium gap-0.5">
                                                <p><span className="text-slate-400">NIC:</span> {patient.nic}</p>
                                                <p><span className="text-slate-400">Email:</span> {patient.email}</p>
                                                <p><span className="text-slate-400">Phone:</span> {patient.phone}</p>
                                                <p><span className="text-slate-400">Age:</span> {patient.age || 'N/A'} years</p>
                                            </div>
                                        </div>

                                        {/* Actions and Status */}
                                        <div className="flex flex-col items-end gap-6">
                                            <span className={`px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                                patient.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                            }`}>
                                                {patient.status}
                                            </span>
                                            
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    className="px-6 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-100 transition-all shadow-sm"
                                                    onClick={() => navigate(`/admin/patients/${patient.id}/view`)}
                                                >
                                                    View
                                                </button>
                                                <button 
                                                    className="px-6 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-100 transition-all shadow-sm"
                                                    onClick={() => navigate(`/admin/patients/${patient.id}/edit`)}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className={`px-6 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-md ${
                                                        patient.status === 'active' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                                                    }`}
                                                    onClick={() => handleToggleStatus(patient)}
                                                >
                                                    {patient.status === 'active' ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
