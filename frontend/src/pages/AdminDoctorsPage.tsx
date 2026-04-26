import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DoctorDirectory from '../components/DoctorDirectory';
import AddDoctorModal from '../components/AddDoctorModal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDoctorsPage() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleOpenAddModal = () => {
        setSelectedDoctor(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (doctor: any) => {
        setSelectedDoctor(doctor);
        setIsModalOpen(true);
    };

    const handleAddSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleViewProfile = (id: string) => {
        navigate(`/admin/doctors/${id}/view`);
    };

    return (
        <div className="flex h-screen bg-slate-50 font-['Inter']">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light relative custom-scrollbar">
                <Header title="Doctors Management" />
                <div className="flex-1 overflow-y-auto p-10">
                    <div className="max-w-7xl mx-auto flex flex-col gap-10">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Doctor Management</h3>
                            <p className="text-text-secondary font-medium flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">stethoscope</span>
                                View, add, edit or remove doctors from the system.
                            </p>
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
                            <DoctorDirectory
                                onEditDoctor={handleOpenEditModal}
                                onViewProfile={handleViewProfile}
                                onAddDoctorClick={handleOpenAddModal}
                                refreshTrigger={refreshTrigger}
                            />
                        </div>
                    </div>
                </div>
                <AddDoctorModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAdd={handleAddSuccess}
                    initialData={selectedDoctor}
                />
            </main>
        </div>
    );
}
