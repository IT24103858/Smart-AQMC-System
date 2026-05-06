import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { motion } from 'motion/react';

interface AppointmentDetail {
  sessionId: string;
  date: string;
  timeBlock: string;
  doctorName: string;
  specialization: string;
  patientName: string;
  patientNic: string;
  patientPhone: string;
  illness: string;
  status: string;
}

interface Stats {
  todayCount: number;
  tomorrowCount: number;
  specializationStats: Record<string, number>;
  detailedList: AppointmentDetail[];
}

export default function AdminAppointmentsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/schedule/appointment-stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching appointment stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F8FAFC]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const filteredList = stats?.detailedList.filter(item => 
    item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.patientNic.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Chart Helpers
  const renderPieChart = (count: number, total: number, label: string, color: string) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const percentage = total > 0 ? (count / total) * 100 : 0;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-6 group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</h4>
        <div className="relative size-32">
          <svg className="size-full -rotate-90">
            <circle cx="64" cy="64" r={radius} className="fill-none stroke-slate-50 stroke-[10]" />
            <motion.circle
              cx="64" cy="64" r={radius}
              className={`fill-none ${color} stroke-[10] stroke-linecap-round`}
              initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-slate-800 leading-none">{count}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Patients</span>
          </div>
        </div>
        <div className="text-xs font-bold text-slate-400">Total Capacity Used</div>
      </div>
    );
  };

  const specData = Object.entries(stats?.specializationStats || {});
  const maxSpec = Math.max(...specData.map(([_, count]) => count), 1);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-['Inter']">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Header title="Appointment Management" />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto space-y-10">
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Today Pie */}
              <div className="lg:col-span-3">
                {renderPieChart(stats?.todayCount || 0, 100, "Today's Registrations", "stroke-sky-500")}
              </div>

              {/* Tomorrow Pie */}
              <div className="lg:col-span-3">
                {renderPieChart(stats?.tomorrowCount || 0, 100, "Tomorrow's Registrations", "stroke-indigo-500")}
              </div>

              {/* Specialization Breakdown */}
              <div className="lg:col-span-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Booking by Specialization</h4>
                  <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-full uppercase">All Active Sessions</span>
                </div>
                
                <div className="flex-1 flex flex-col justify-center gap-4 overflow-y-auto max-h-[180px] pr-4 custom-scrollbar">
                  {specData.length === 0 ? (
                    <div className="text-center py-10 text-slate-300 font-bold">No bookings yet</div>
                  ) : (
                    specData.map(([spec, count]) => (
                      <div key={spec} className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
                          <span className="text-slate-600">{spec}</span>
                          <span className="text-slate-400">{count} Patients</span>
                        </div>
                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-sky-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / maxSpec) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Enrolled Patients</h3>
                  <p className="text-sm font-medium text-slate-400">Manage and view detailed doctor-patient assignments</p>
                </div>

                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors">search</span>
                  <input 
                    type="text" 
                    placeholder="Search by patient, doctor, or NIC..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-14 pr-8 py-4 bg-slate-50 rounded-2xl border-none outline-none text-sm font-bold text-slate-700 w-full md:w-[400px] focus:ring-2 focus:ring-sky-500/10 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="p-4 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Time</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor Information</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Information</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">NIC / Phone</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Illness Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-2">
                             <span className="material-symbols-outlined text-4xl text-slate-200">patient_list</span>
                             <span className="text-slate-300 font-bold">No matching appointments found</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-slate-700">{item.date}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-sky-500 uppercase tracking-tighter">{item.timeBlock}</span>
                                {(() => {
                                  const now = new Date();
                                  const endTimeStr = item.timeBlock.split('-')[1]?.trim();
                                  if (endTimeStr) {
                                    const [hours, minutes] = endTimeStr.split(':').map(Number);
                                    const sessionEnd = new Date(item.date);
                                    sessionEnd.setHours(hours, minutes, 0, 0);
                                    
                                    if (now > sessionEnd) {
                                      return (
                                        <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[8px] font-black rounded-md border border-rose-100 uppercase animate-pulse">
                                          Session Ended
                                        </span>
                                      );
                                    }
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-slate-700">{item.doctorName}</span>
                              <span className="text-[10px] font-black text-slate-400 uppercase">{item.specialization}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-extrabold text-slate-700">{item.patientName}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-600 tracking-tight">{item.patientNic}</span>
                              <span className="text-[10px] font-bold text-slate-400">{item.patientPhone}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-slate-400 max-w-xs truncate" title={item.illness}>
                                {item.illness || 'No description provided'}
                              </p>
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ml-4 border ${
                                item.status === 'COMPLETED' 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                  : 'bg-rose-50 text-rose-500 border-rose-100'
                              }`}>
                                {item.status === 'COMPLETED' ? 'Complete' : 'Incomplete'}
                              </span>
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
