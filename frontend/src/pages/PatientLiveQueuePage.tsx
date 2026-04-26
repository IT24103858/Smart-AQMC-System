import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface QueueItem {
  _id: string;
  tokenId: string;
  severity: string;
  status: string;
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
  const prevCalledId = useRef<string | null>(null);

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
  }, []);

  useEffect(() => {
    fetchQueueState();
    const interval = setInterval(fetchQueueState, 5000);
    return () => clearInterval(interval);
  }, [fetchQueueState]);

  const myEntry = user && queue.find(item => item.registeredPatientId?.nic === user.nic);
  const myPosition = myEntry ? queue.indexOf(myEntry) + 1 : null;
  const peopleAhead = myPosition ? myPosition - 1 : 0;
  const isCurrentlyMyTurn = currentlyCalled && user && currentlyCalled.registeredPatientId?.nic === user.nic;

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
            <div className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 rounded-xl border border-sky-100 shadow-sm">
              <div className="size-2 bg-sky-500 rounded-full animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest">Status: Connected</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-3 bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-200 text-xs">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Log Out
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="max-w-4xl mx-auto py-10">
            
            {/* The Main Queue Card */}
            <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden text-center flex flex-col">
              
              <div className="pt-16 pb-10 flex flex-col items-center space-y-6">
                <div className="size-24 bg-sky-50 rounded-full flex items-center justify-center text-[#02AAE5] shadow-inner">
                  <span className="material-symbols-outlined text-5xl">person_check</span>
                </div>
                <div>
                   <h2 className="text-3xl font-black text-slate-800 tracking-tight">Live Queue Status</h2>
                   <div className="mt-2 inline-block px-4 py-1.5 bg-amber-500 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-200">
                     {myEntry ? myEntry.tokenId : currentlyCalled ? currentlyCalled.tokenId : '---'}
                   </div>
                </div>
              </div>

              {/* Position Area */}
              <div className="px-16 space-y-10">
                
                <div className="bg-amber-50 rounded-[2.5rem] p-12 relative group border border-amber-100/50">
                   <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                      <span className="material-symbols-outlined text-[140px] text-amber-600">hourglass_top</span>
                   </div>
                   <p className="text-8xl font-black text-amber-500 tracking-tighter mb-2">
                     {isCurrentlyMyTurn ? 'NOW' : myPosition || '-'}
                   </p>
                   <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Your Position in OPD Queue</p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
                      <p className="text-4xl font-black text-slate-800 tracking-tighter mb-2">{peopleAhead}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">People Ahead</p>
                   </div>
                   <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
                      <p className="text-lg font-black text-emerald-500 tracking-tight uppercase mb-2">
                         {isCurrentlyMyTurn ? 'IT\'S YOU!' : 'Currently Being Seen'}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">NOW</p>
                   </div>
                </div>

                {/* Info Pills */}
                <div className="flex gap-4 justify-center">
                   <div className="px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority Score:</p>
                      <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-xs font-black">{myEntry?.priorityScore || '0'} pts</span>
                   </div>
                   <div className="px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">({myEntry?.severity} — {myEntry?.severity === 'Urgent' ? '30' : '10'} base pts)</p>
                   </div>
                </div>

              </div>

              {/* Action Area */}
              <div className="p-16 space-y-6">
                 <button className="w-full py-6 rounded-[2rem] border-2 border-rose-100 text-rose-500 font-black text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-3 hover:bg-rose-50 transition-all active:scale-95">
                    <span className="material-symbols-outlined text-[20px]">cancel</span>
                    Cancel My Appointment
                 </button>
                 <Link to="/patient" className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-[#02AAE5] transition-colors text-xs uppercase tracking-widest">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Back to Main Portal
                 </Link>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
