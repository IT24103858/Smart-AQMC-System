import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminDoctorsPage from './pages/AdminDoctorsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminRoomsPage from './pages/AdminRoomsPage';
import AdminSchedulingPage from './pages/AdminSchedulingPage';
import AdminStaffCalendarPage from './pages/AdminStaffCalendarPage';
import AdminPatientsPage from './pages/AdminPatientsPage';
import AdminAddPatientPage from './pages/AdminAddPatientPage';
import AdminEditPatientPage from './pages/AdminEditPatientPage';
import AdminViewPatientPage from './pages/AdminViewPatientPage';
import AdminViewDoctorPage from './pages/AdminViewDoctorPage';
import AdminWeeklySchedulePage from './pages/AdminWeeklySchedulePage';
import AdminQueuePage from './pages/AdminQueuePage';
import AdminAppointmentsPage from './pages/AdminAppointmentsPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import DoctorAvailabilityPage from './pages/DoctorAvailabilityPage';
import DoctorProfilePage from './pages/DoctorProfilePage';
import DoctorSessionsPage from './pages/DoctorSessionsPage';
import DoctorSessionDetailPage from './pages/DoctorSessionDetailPage';


import StaffDashboardPage from './pages/StaffDashboardPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import PatientProfilePage from './pages/PatientProfilePage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import MyPrescriptionsPage from './pages/MyPrescriptionsPage';
import BookingPage from './pages/BookingPage';
import PatientLiveQueuePage from './pages/PatientLiveQueuePage';

import { NotificationProvider } from './context/NotificationContext';

export default function App() {
  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/doctors" element={<AdminDoctorsPage />} />
        <Route path="/admin/patients" element={<AdminPatientsPage />} />
        <Route path="/admin/patients/add" element={<AdminAddPatientPage />} />
        <Route path="/admin/patients/:id/edit" element={<AdminEditPatientPage />} />
        <Route path="/admin/patients/:id/view" element={<AdminViewPatientPage />} />
        <Route path="/admin/doctors/:id/view" element={<AdminViewDoctorPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/rooms" element={<AdminRoomsPage />} />
        <Route path="/admin/scheduling" element={<AdminSchedulingPage />} />
        <Route path="/admin/staff-calendar" element={<AdminStaffCalendarPage />} />
        <Route path="/admin/weekly-schedule" element={<AdminWeeklySchedulePage />} />
        <Route path="/admin/queue" element={<AdminQueuePage />} />
        <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
        <Route path="/doctor" element={<DoctorDashboardPage />} />
        <Route path="/doctor/availability" element={<DoctorAvailabilityPage />} />
        <Route path="/doctor/profile" element={<DoctorProfilePage />} />
        <Route path="/doctor/sessions" element={<DoctorSessionsPage />} />
        <Route path="/doctor/sessions/:id" element={<DoctorSessionDetailPage />} />


        <Route path="/staff" element={<StaffDashboardPage />} />
        <Route path="/patient" element={<PatientDashboardPage />} />
        <Route path="/patient/profile" element={<PatientProfilePage />} />
        <Route path="/patient/appointments" element={<MyAppointmentsPage />} />
        <Route path="/patient/prescriptions" element={<MyPrescriptionsPage />} />
        <Route path="/patient/booking" element={<BookingPage />} />
        <Route path="/patient/live-queue" element={<PatientLiveQueuePage />} />
      </Routes>
    </NotificationProvider>
  );
}
