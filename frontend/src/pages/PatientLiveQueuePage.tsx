import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface QueueItem {
  _id: string;
  tokenId: string;
  severity: string;
  status: string;
  unit: string;
  priorityScore: number;
  registeredPatientId: {
    _id: string;
    name: string;
    nic: string;
  };
}

export default function PatientLiveQueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentlyCalled, setCurrentlyCalled] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isFinished, setIsFinished] = useState(false);
  const prevCalledId = useRef<string | null>(null);
  const wasInQueue = useRef<boolean>(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const fetchQueueState = useCallback(async () => {
    try {
      const res = await fetch('/api/queue/state');
      const data = await res.json();
      if (res.ok) {
        setQueue(data.queue);
        setCurrentlyCalled(data.currentlyCalled);

        // Check if user was in queue but now gone
        if (user) {
          const inQueue = data.queue.some((item: any) => item.registeredPatientId?.nic === user.nic);
          const isBeingCalled = data.currentlyCalled?.registeredPatientId?.nic === user.nic;

          if (wasInQueue.current && !inQueue && !isBeingCalled) {
            setIsFinished(true);
          }

          if (inQueue || isBeingCalled) {
            wasInQueue.current = true;
          }
        }

        if (data.currentlyCalled && data.currentlyCalled._id !== prevCalledId.current) {
          if (prevCalledId.current !== null) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log('Audio play failed', e));
          }
          prevCalledId.current = data.currentlyCalled._id;
        }
      }
    } catch (err) {
      console.error('Failed to fetch queue state', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchQueueState();
    const interval = setInterval(fetchQueueState, 5000);
    return () => clearInterval(interval);
  }, [fetchQueueState]);

  // Find the current user's entry in the queue using multiple identity markers
  const myEntry = user && queue.find(item => {
    // 1. Match by exact ID (Note: User model transforms _id to id in frontend)
    const idMatch = (item.registeredPatientId?._id) === (user.id || user._id);

    // 2. Match by NIC (most reliable for cross-model records)
    const patientNic = item.registeredPatientId?.nic?.toString().trim().toUpperCase();
    const userNic = (user.nic || user.NIC)?.toString().trim().toUpperCase();
    const nicMatch = patientNic && userNic && (patientNic === userNic);

    return idMatch || nicMatch;
  });

  // 1. Calculate Relative Position (Respective to the queue/unit they are in)
  // Use case-insensitive unit matching to prevent "OPD-Normal" vs "OPD-NORMAL" issues
  const myUnitNormalized = myEntry?.unit?.trim().toUpperCase() || '';
  const unitQueue = myEntry ? queue.filter(q => q.unit?.trim().toUpperCase() === myUnitNormalized) : [];

  const myIndex = myEntry ? unitQueue.findIndex(item => item._id === myEntry._id) : -1;
  const myPosition = myIndex !== -1 ? myIndex + 1 : null;
  const peopleAhead = myPosition ? myPosition - 1 : 0;

  // Check if currently my turn
  const isCurrentlyMyTurn = currentlyCalled && user && (
    (currentlyCalled.registeredPatientId?._id) === (user.id || user._id) ||
    (currentlyCalled.registeredPatientId?.nic?.toString().toUpperCase() === (user.nic || user.NIC)?.toString().toUpperCase())
  );

  // 2. Base Theme Colors (By Unit)
  const getUnitTheme = (unit: string) => {
    switch (unit) {
      case 'Booked': return { name: 'Booked Appointment', color: '#3B82F6', bg: 'bg-sky-500', light: 'bg-sky-50', text: 'text-sky-500' };
      case 'OPD-Normal': return { name: 'OPD (Normal)', color: '#10B981', bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-500' };
      case 'OPD-Urgent': return { name: 'OPD (Urgent)', color: '#F59E0B', bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-500' };
      case 'Critical': return { name: 'Critical Unit', color: '#F43F5E', bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-500' };
      default: return { name: 'Queue', color: '#64748b', bg: 'bg-slate-500', light: 'bg-slate-50', text: 'text-slate-500' };
    }
  };

  // 3. Wait Status Colors (By People Ahead)
  const getWaitStyles = (count: number, isTurn: boolean) => {
    if (isTurn) return { bg: 'bg-emerald-500', text: 'text-white', label: 'IT IS YOUR TURN!', icon: 'notifications_active' };
    if (count === 0) return { bg: 'bg-emerald-400', text: 'text-white', label: 'YOU ARE NEXT!', icon: 'bolt' };
    if (count <= 2) return { bg: 'bg-amber-400', text: 'text-white', label: 'SHORT WAIT', icon: 'schedule' };
    return { bg: 'bg-rose-400', text: 'text-white', label: 'LONG WAIT', icon: 'hourglass_empty' };
  };

  const theme = getUnitTheme(myEntry?.unit || '');
  const wait = getWaitStyles(peopleAhead, !!isCurrentlyMyTurn);

  return (
    <div className="flex h-screen bg-[#F5F8FA] font-['Inter']">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md px-10 py-6 flex justify-between items-center border-b border-slate-100 mt-1 mx-4 rounded-3xl z-10 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Live Patient Queue Tracker</h1>
            <p className="text-slate-400 font-bold text-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 px-4 py-2 ${theme.light} ${theme.text} rounded-xl border border-current/10 shadow-sm`}>
              <div className={`size-2 ${theme.bg} rounded-full animate-pulse`} />
              <span className="text-xs font-black uppercase tracking-widest">Status: Connected</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-3 bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-200 text-xs">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Log Out
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="max-w-md mx-auto py-10">

            {/* The Main Queue Card */}
            <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden text-center flex flex-col">

              {isFinished ? (
                <div className="py-24 px-16 flex flex-col items-center animate-in fade-in zoom-in duration-700">
                  <div className="size-32 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-8 shadow-inner">
                    <span className="material-symbols-outlined text-6xl">verified</span>
                  </div>
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4">Session Completed!</h2>
                  <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                    Your consultation has been successfully completed. You can now view your prescriptions and medical reports in your profile.
                  </p>
                  <Link
                    to="/patient"
                    className="mt-12 px-10 py-4 bg-emerald-500 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200"
                  >
                    Return to Portal
                  </Link>
                </div>
              ) : (
                <>
                  <div className="pt-10 pb-6 flex flex-col items-center gap-4">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Live Queue Status</h2>

                    <div className="flex gap-2">
                      <div className={`px-5 py-1 ${theme.bg} text-white rounded-full font-black text-xs shadow-sm`}>
                        {myEntry?.tokenId || 'TOK-000'}
                      </div>
                      <div className={`px-5 py-1 bg-slate-800 text-white rounded-full font-black text-xs shadow-sm flex items-center gap-1`}>
                        <span className="material-symbols-outlined text-[12px]">groups</span>
                        {unitQueue.length} in {theme.name}
                      </div>
                    </div>

                    <div className={`px-6 py-2 ${theme.bg} text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm`}>
                      <span className="material-symbols-outlined text-[14px]">local_hospital</span>
                      {theme.name}
                    </div>
                  </div>

                  <div className="px-8 pb-10 space-y-6">

                    {/* Main Position Box (COLOR CHANGES BASED ON WAIT) */}
                    <div className={`${wait.bg} rounded-2xl p-10 flex flex-col items-center gap-2 shadow-xl shadow-current/20 transition-all duration-700 transform hover:scale-[1.02]`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-white/80">{wait.icon}</span>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
                          {wait.label}
                        </p>
                      </div>
                      <p className={`text-[120px] leading-none font-black ${wait.text} tracking-tighter`}>
                        {isCurrentlyMyTurn ? 'NOW' : (myPosition || '0')}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/60">
                        POSITION IN {theme.name} QUEUE
                      </p>
                    </div>

                    {/* Side-by-Side Status Boxes */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-6 rounded-xl border border-slate-100 flex flex-col items-center gap-1 shadow-sm">
                        <p className="text-4xl font-black text-slate-800 tracking-tighter">{peopleAhead}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">People Ahead</p>
                      </div>
                      <div className="bg-white p-6 rounded-xl border border-slate-100 flex flex-col items-center gap-1 shadow-sm">
                        {isCurrentlyMyTurn ? (
                          <>
                            <span className="text-[#10B981] font-black text-[10px] uppercase tracking-widest animate-pulse">ACTIVE</span>
                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight text-center leading-tight">
                              Being viewed now
                            </p>
                          </>
                        ) : (
                          <>
                            <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">In Queue</span>
                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight text-center leading-tight">
                              Waiting
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Priority Score Bar */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-center gap-3">
                      <p className="text-[10px] font-black uppercase tracking-tight text-slate-600">Priority Score:</p>
                      <span className={`px-3 py-1 ${theme.bg} text-white rounded-md text-[10px] font-black`}>
                        {myEntry?.priorityScore || '0'} pts
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-4 pt-2">
                      {!isCurrentlyMyTurn && myEntry && (
                        <button className="w-full py-4 rounded-xl border-2 border-rose-500 text-rose-500 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-50 transition-all active:scale-95">
                          <span className="material-symbols-outlined text-[16px]">cancel</span>
                          Cancel My Appointment
                        </button>
                      )}
                      <Link to="/patient" className="inline-flex items-center justify-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors text-[10px] uppercase tracking-widest">
                        <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                        Back to Main Portal
                      </Link>
                    </div>

                  </div>
                </>
              )}

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
