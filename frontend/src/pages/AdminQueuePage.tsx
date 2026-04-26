import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface QueueItem {
  _id: string;
  tokenId: string;
  severity: string;
  status: string;
  checkInTime: string;
  priorityScore: number;
  registeredPatientId: {
    _id: string;
    name: string;
    nic: string;
  };
}

interface BookedPatient {
  id: string;
  name: string;
  nic: string;
  timeBlock: string;
  status: string;
}

interface PatientLookup {
  _id: string;
  name: string;
  nic: string;
}

export default function AdminQueuePage() {
  const [activeTab, setActiveTab] = useState('OPD'); // 'Booked', 'OPD', 'Critical'
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [bookedPatients, setBookedPatients] = useState<BookedPatient[]>([]);
  const [bookedCount, setBookedCount] = useState(0);
  const [currentlyCalled, setCurrentlyCalled] = useState<QueueItem | null>(null);
  const [patientsList, setPatientsList] = useState<PatientLookup[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedNic, setSelectedNic] = useState('');
  const [severity, setSeverity] = useState('Normal');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchQueueState = useCallback(async () => {
    try {
      const res = await fetch('/api/queue/state');
      const data = await res.json();
      if (res.ok) {
        setQueue(data.queue);
        setCurrentlyCalled(data.currentlyCalled);
        setBookedPatients(data.bookedPatients || []);
        setBookedCount(data.bookedCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch queue state', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPatientsList = useCallback(async () => {
    try {
      const res = await fetch('/api/queue/patients-list');
      const data = await res.json();
      if (res.ok) {
        setPatientsList(data);
      }
    } catch (err) {
      console.error('Failed to fetch patients list', err);
    }
  }, []);

  useEffect(() => {
    fetchQueueState();
    fetchPatientsList();
    const interval = setInterval(fetchQueueState, 5000);
    return () => clearInterval(interval);
  }, [fetchQueueState, fetchPatientsList]);

  const handleCheckIn = async (e?: React.FormEvent, manualNic?: string) => {
    if (e) e.preventDefault();
    const nicToUse = manualNic || selectedNic;
    if (!nicToUse) return;

    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/queue/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nic: nicToUse, severity })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Token ${data.tokenId} generated!`);
        setSelectedNic('');
        fetchQueueState();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const handleCallNext = async () => {
    try {
      const res = await fetch('/api/queue/call-next', { method: 'PATCH' });
      const data = await res.json();
      if (res.ok) {
        fetchQueueState();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Call next failed', err);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/queue/update-status/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchQueueState();
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  return (
    <div className="flex h-screen bg-[#F5F8FA] font-['Inter']">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md px-10 py-6 flex justify-between items-center border-b border-slate-100 mt-1 mx-4 rounded-3xl z-10 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Administrative Control Center</h1>
            <p className="text-slate-400 font-bold text-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 rounded-xl border border-sky-100 shadow-sm">
              <div className="size-2 bg-sky-500 rounded-full animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest">Status: Connected</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-3 bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-200 text-xs hover:bg-rose-600 transition-all">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Log Out
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto space-y-12">
            
            {/* Top Stat Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Stat Card: Booked */}
              <button 
                onClick={() => setActiveTab('Booked')}
                className={`p-8 bg-white rounded-[2.5rem] border transition-all flex items-center gap-6 group hover:shadow-xl ${activeTab === 'Booked' ? 'border-[#02AAE5] shadow-lg shadow-sky-100' : 'border-slate-100'}`}
              >
                <div className="size-20 rounded-3xl bg-sky-50 flex items-center justify-center text-[#02AAE5] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl">calendar_month</span>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Booked</p>
                  <p className="text-4xl font-black text-slate-800 tracking-tighter">{bookedCount}</p>
                </div>
              </button>

              {/* Stat Card: OPD Waiting */}
              <button 
                onClick={() => setActiveTab('OPD')}
                className={`p-8 bg-white rounded-[2.5rem] border transition-all flex items-center gap-6 group hover:shadow-xl ${activeTab === 'OPD' ? 'border-[#02AAE5] shadow-lg shadow-sky-100' : 'border-slate-100'}`}
              >
                <div className="size-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl">local_hospital</span>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">OPD (Waiting)</p>
                  <p className="text-4xl font-black text-slate-800 tracking-tighter">{queue.filter(q => q.severity === 'Normal').length}</p>
                </div>
              </button>

              {/* Stat Card: Trauma/Critical */}
              <button 
                onClick={() => setActiveTab('Critical')}
                className={`p-8 bg-white rounded-[2.5rem] border transition-all flex items-center gap-6 group hover:shadow-xl ${activeTab === 'Critical' ? 'border-rose-500 shadow-lg shadow-rose-100' : 'border-slate-100'}`}
              >
                <div className="size-20 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl">vital_signs</span>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Trauma</p>
                  <p className="text-4xl font-black text-slate-800 tracking-tighter">{queue.filter(q => q.severity === 'Urgent').length}</p>
                </div>
              </button>

              {/* Check-In Form Card */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-sky-500 text-sm">verified_user</span>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Register Check-In</h3>
                </div>
                <form onSubmit={handleCheckIn} className="space-y-4">
                  <div className="relative">
                    <select 
                      value={selectedNic}
                      onChange={(e) => setSelectedNic(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-bold text-slate-700 appearance-none"
                    >
                      <option value="">-- Select Patient --</option>
                      {patientsList.map(p => (
                        <option key={p._id} value={p.nic}>{p.name} ({p.nic})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <select 
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="flex-1 px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-bold text-slate-700 appearance-none"
                    >
                      <option value="Normal">OPD - Normal</option>
                      <option value="Urgent">OPD - Urgent</option>
                    </select>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 bg-[#02AAE5] text-white rounded-2xl font-black text-[13px] uppercase tracking-widest shadow-lg shadow-sky-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Verify & Generate Token
                  </button>
                  {error && <p className="text-[10px] text-rose-500 font-bold text-center mt-2">{error}</p>}
                  {success && <p className="text-[10px] text-emerald-500 font-bold text-center mt-2">{success}</p>}
                </form>
              </div>

            </div>

            {/* Main Table Section */}
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
              
              {/* Section Header */}
              <div className={`px-12 py-8 flex justify-between items-center ${activeTab === 'Critical' ? 'bg-rose-50/50' : activeTab === 'OPD' ? 'bg-emerald-50/50' : 'bg-sky-50/50'}`}>
                <div className="flex items-center gap-4">
                  <div className={`size-10 rounded-2xl flex items-center justify-center ${activeTab === 'Critical' ? 'bg-rose-500 text-white' : activeTab === 'OPD' ? 'bg-emerald-500 text-white' : 'bg-sky-500 text-white'}`}>
                    <span className="material-symbols-outlined text-2xl">
                      {activeTab === 'Critical' ? 'vital_signs' : activeTab === 'OPD' ? 'groups' : 'calendar_month'}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">
                    {activeTab === 'Critical' ? 'Critical Patient Unit' : activeTab === 'OPD' ? 'OPD Queue Management' : 'Booked Patients'}
                  </h2>
                </div>
                
                <button 
                   onClick={handleCallNext}
                   className={`${activeTab === 'Critical' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-[#02AAE5] hover:bg-sky-600'} text-white px-8 py-4 rounded-[1.5rem] flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-opacity-20 active:scale-95`}
                >
                  <span className="material-symbols-outlined">campaign</span>
                  Call Next {activeTab} Patient
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Token</th>
                      <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient Name</th>
                      <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {activeTab === 'OPD' ? 'Joined At' : 'Timeslot'}
                      </th>
                      <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {activeTab === 'OPD' || activeTab === 'Critical' ? 'Score' : 'Status'}
                      </th>
                      <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status / Reason</th>
                      <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr><td colSpan={6} className="px-12 py-20 text-center font-bold text-slate-300">Syncing with hospital data...</td></tr>
                    ) : activeTab === 'Booked' ? (
                      bookedPatients.length === 0 ? (
                        <tr><td colSpan={6} className="px-12 py-20 text-center font-bold text-slate-300">No bookings for today.</td></tr>
                      ) : bookedPatients.map(patient => (
                        <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="px-12 py-6">
                            <span className="px-4 py-2 rounded-full font-black text-[11px] text-white bg-slate-300">
                               BOOK
                            </span>
                          </td>
                          <td className="px-12 py-6">
                             <span className="font-extrabold text-slate-700 tracking-tight">{patient.name}</span>
                          </td>
                          <td className="px-12 py-6">
                            <span className="text-xs font-bold text-slate-400">{patient.timeBlock}</span>
                          </td>
                          <td className="px-12 py-6">
                             <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-[10px] font-black uppercase">Confirmed</span>
                          </td>
                          <td className="px-12 py-6">
                             <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">In Schedule</span>
                          </td>
                          <td className="px-12 py-6 text-right">
                             <button 
                                onClick={() => handleCheckIn(undefined, patient.nic)}
                                className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-emerald-100"
                             >
                               Check In
                             </button>
                          </td>
                        </tr>
                      ))
                    ) : queue.filter(q => activeTab === 'Critical' ? q.severity === 'Urgent' : q.severity === 'Normal').length === 0 ? (
                      <tr><td colSpan={6} className="px-12 py-20 text-center font-bold text-slate-300">No active records in this unit.</td></tr>
                    ) : queue.filter(q => activeTab === 'Critical' ? q.severity === 'Urgent' : q.severity === 'Normal').map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-12 py-6">
                          <span className={`px-4 py-2 rounded-full font-black text-[11px] text-white ${item.severity === 'Urgent' ? 'bg-rose-500' : 'bg-[#02AAE5]'}`}>
                            {item.tokenId}
                          </span>
                        </td>
                        <td className="px-12 py-6">
                           <span className="font-extrabold text-slate-700 tracking-tight">{item.registeredPatientId?.name}</span>
                        </td>
                        <td className="px-12 py-6">
                          <span className="text-xs font-bold text-slate-400">
                             {new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-12 py-6">
                           <div className="size-12 rounded-2xl bg-white border border-slate-100 flex flex-col items-center justify-center shadow-sm">
                              <span className="text-[13px] font-black text-slate-600">{item.priorityScore}</span>
                           </div>
                        </td>
                        <td className="px-12 py-6">
                           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">In Queue</span>
                        </td>
                        <td className="px-12 py-6 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleUpdateStatus(item._id, 'called')}
                              className="size-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[18px]">done_all</span>
                            </button>
                            <button className="size-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-[#02AAE5] hover:text-white transition-all shadow-sm">
                              <span className="material-symbols-outlined text-[18px]">more_vert</span>
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(item._id, 'removed')}
                              className="size-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[18px]">person_remove</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
