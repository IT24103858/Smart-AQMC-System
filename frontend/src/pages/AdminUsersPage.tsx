import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddUserModal from '../components/AddUserModal';
import { useNotification } from '../context/NotificationContext';

export default function AdminUsersPage() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [users, setUsers] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Staff');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/users');
            if (response.ok) {
                const data = await response.json();
                // Filter out PATIENT and DOCTOR roles for Staff Management
                const staffUsers = data.filter((u: any) => u.role !== 'PATIENT' && u.role !== 'DOCTOR');
                setUsers(staffUsers);
                setFilteredUsers(staffUsers);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            showNotification('Failed to load registered users', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = () => {
        let filtered = users;

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(u => 
                u.name.toLowerCase().includes(lowerSearch) ||
                u.nic?.toLowerCase().includes(lowerSearch) ||
                u.email?.toLowerCase().includes(lowerSearch) ||
                u.phone?.toLowerCase().includes(lowerSearch)
            );
        }

        if (roleFilter !== 'All Staff') {
            filtered = filtered.filter(u => u.role === roleFilter);
        }

        setFilteredUsers(filtered);
    };

    useEffect(() => {
        handleSearch();
    }, [roleFilter, searchTerm, users]);

    const handleAction = (user: any, action: 'view' | 'edit') => {
        if (user.role === 'DOCTOR') {
            if (action === 'view') {
                navigate(`/admin/doctors/${user.id}/view`);
            } else {
                // Navigate to view profile but with edit state
                navigate(`/admin/doctors/${user.id}/view`, { state: { openEdit: true } });
            }
        } else {
            setSelectedUser(user);
            setIsModalOpen(true);
        }
    };

    const handleToggleStatus = async (user: any) => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                showNotification(`User account ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`, 'success');
                fetchUsers();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showNotification('Failed to update account status', 'error');
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-white relative custom-scrollbar text-slate-900 border-l border-slate-100">
                {/* Module Header */}
                <div className="p-8 pb-4">
                    <h1 className="text-2xl font-bold text-slate-800">Staff Management Module</h1>
                    <p className="text-sm text-slate-400 mt-1">Manage system administrators, receptionists, and other registered administrative staff.</p>
                </div>

                <div className="flex-1 overflow-y-auto px-10 py-5 bg-slate-50/50">
                    <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-10">
                        {/* Internal Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Registered Users</h2>
                                <p className="text-sm text-slate-400 mt-1">Search staff by name, NIC, or email. Filter by specific roles.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
                                    className="bg-primary text-white px-5 py-2 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">person_add</span>
                                    Add New Staff
                                </button>
                                <button
                                    onClick={fetchUsers}
                                    className="bg-white border border-slate-200 text-slate-600 px-5 py-2 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-lg">refresh</span>
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {/* Search Bar and Filter */}
                        <div className="flex items-center gap-3 mb-10">
                            <div className="flex-1 max-w-md flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Search by name / NIC / email"
                                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all text-sm placeholder:text-slate-300 font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button
                                    onClick={handleSearch}
                                    className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20"
                                >
                                    Search
                                </button>
                            </div>
                            <select
                                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all text-sm text-slate-600 font-bold"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option>All Staff</option>
                                <option>ADMIN</option>
                                <option>RECEPTIONIST</option>
                                <option>LAB_ASSISTANT</option>
                                <option>NURSE</option>
                                <option>ATTENDANT</option>
                            </select>
                        </div>

                        {/* Cards List */}
                        <div className="flex flex-col gap-6">
                            {isLoading ? (
                                <div className="text-center py-20 text-slate-400 font-medium italic">Loading users...</div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-20 text-slate-400 font-medium italic">No registered users found.</div>
                            ) : (
                                filteredUsers.map((user: any) => (
                                    <div key={user.id} className="bg-white border border-slate-100 rounded-2xl p-8 flex justify-between items-center hover:shadow-md hover:border-slate-200 transition-all duration-300">
                                        {/* User Info */}
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-extrabold text-slate-800">{user.name}</h3>
                                                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 
                                                    user.role === 'DOCTOR' ? 'bg-sky-100 text-sky-600' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                            <div className="flex flex-col text-sm text-slate-500 font-bold gap-0.5 mt-1">
                                                <p><span className="text-slate-300">NIC:</span> {user.nic}</p>
                                                <p><span className="text-slate-300">Email:</span> {user.email}</p>
                                                <p><span className="text-slate-300">Phone:</span> {user.phone}</p>
                                                <p><span className="text-slate-300">Age:</span> {user.age || 'N/A'} years</p>
                                            </div>
                                        </div>

                                        {/* Actions and Status Badge */}
                                        <div className="flex flex-col items-end gap-6">
                                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${
                                                user.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                            }`}>
                                                {user.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                            
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    className="px-6 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-100 transition-all shadow-sm"
                                                    onClick={() => handleAction(user, 'view')}
                                                >
                                                    View
                                                </button>
                                                
                                                {/* Protect System Admin from being edited or deactivated by other admins */}
                                                {!(user.role === 'ADMIN' && user.email === 'admin@medicare.com') && (
                                                    <>
                                                        <button 
                                                            className="px-6 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-100 transition-all shadow-sm"
                                                            onClick={() => handleAction(user, 'edit')}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button 
                                                            className={`px-6 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-md ${
                                                                user.status === 'active' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                                                            }`}
                                                            onClick={() => handleToggleStatus(user)}
                                                        >
                                                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                    </>
                                                )}

                                                {/* If it IS the system admin, show a badge or message indicating it's protected */}
                                                {(user.role === 'ADMIN' && user.email === 'admin@medicare.com') && (
                                                    <span className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200 italic">
                                                        Protected Account
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <AddUserModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAdd={(msg) => { showNotification(msg, 'success'); fetchUsers(); }}
                    initialData={selectedUser}
                />
            </main>
        </div>
    );
}
