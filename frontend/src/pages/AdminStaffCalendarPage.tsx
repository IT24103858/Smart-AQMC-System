import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import CreateMeetingModal from '../components/CreateMeetingModal';

// Comprehensive Sri Lankan Public Holidays for 2026 based on official calendars
const SRI_LANKAN_HOLIDAYS_2026: Record<string, string> = {
  "2026-01-03": "Duruthu Poya Day",
  "2026-01-15": "Thai Pongal Day",
  "2026-02-01": "Navam Poya Day",
  "2026-02-04": "Independence Day",
  "2026-02-15": "Mahasivarathri Day",
  "2026-03-02": "Medin Poya Day",
  "2026-03-21": "Id-Ul-Fitr (Ramazan)",
  "2026-04-01": "Bak Poya Day",
  "2026-04-03": "Good Friday",
  "2026-04-13": "Pre New Year Day",
  "2026-04-14": "Sinhala & Tamil New Year",
  "2026-05-01": "May Day",
  "2026-05-12": "Vesak Poya Day",
  "2026-05-13": "Post Vesak Poya",
  "2026-05-30": "Id-Ul-Allah (Hadji)",
  "2026-06-29": "Poson Poya Day",
  "2026-07-29": "Esala Poya Day",
  "2026-08-26": "Nikini Poya Day",
  "2026-09-25": "Binara Poya Day",
  "2026-10-25": "Vap Poya Day",
  "2026-10-26": "Prophet's Birthday",
  "2026-10-28": "Deepawali Festival",
  "2026-11-23": "Ill Poya Day",
  "2026-12-23": "Unduwap Poya Day",
  "2026-12-25": "Christmas Day"
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function AdminStaffCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date()); // Start at today's month
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);

  React.useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await fetch('/api/meetings');
      if (res.ok) setMeetings(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMeeting = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;

    try {
      const res = await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMeetings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditMeeting = (meeting: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMeeting(meeting);
    setIsMeetingModalOpen(true);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  // Shift Sunday (0) to end of array to match Mon-Sun grid
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const formatKey = (d: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const isToday = (d: number) => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
  };

  return (
    <div className="flex h-screen bg-slate-50 font-['Inter']">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        <Header title="Staff Holiday Calendar" />

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                  {MONTHS[month]} <span className="text-primary/40 ml-1">{year}</span>
                </h2>
                <p className="text-slate-400 text-sm mt-1">Hospital Staff Attendance & Holiday Overview</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMeetingModalOpen(true)}
                  className="px-6 py-3 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Schedule Meeting
                </button>
                <div className="flex items-center gap-3 bg-slate-100/50 p-2 rounded-2xl border border-slate-100">
                  <button
                    onClick={prevMonth}
                    className="size-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-md transition-all text-slate-500 hover:text-primary"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-2 bg-white shadow-sm border border-slate-200 rounded-xl text-xs font-black text-slate-600 uppercase tracking-widest hover:border-primary/30 transition-all active:scale-95"
                  >
                    Today
                  </button>
                  <button
                    onClick={nextMonth}
                    className="size-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-md transition-all text-slate-500 hover:text-primary"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden ring-1 ring-slate-100">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                {DAYS.map((day, idx) => (
                  <div key={day} className={`py-4 text-center text-[11px] font-black uppercase tracking-[0.2em] ${idx >= 5 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7">
                {/* Empty cells for offset */}
                {Array.from({ length: startOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-[200px] bg-slate-50/20 border-r border-b border-slate-50 last:border-r-0" />
                ))}

                {/* Actual Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const d = i + 1;
                  const key = formatKey(d);
                  const isHoliday = SRI_LANKAN_HOLIDAYS_2026[key];
                  const isPoya = isHoliday && isHoliday.toLowerCase().includes('poya');
                  const dayOfWeek = (startOffset + i) % 7;
                  const isWeekend = dayOfWeek >= 5;

                  const dayMeetings = meetings.filter(m => {
                    const mDate = new Date(m.date).toLocaleDateString('en-CA');
                    return mDate === key;
                  });

                  return (
                    <div
                      key={d}
                      className={`h-[200px] p-4 border-r border-b border-slate-100 last:border-r-0 relative group transition-all hover:bg-slate-50/50 ${isPoya ? 'bg-amber-50/60' :
                          isHoliday ? 'bg-rose-50/30' : ''
                        }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xl font-black leading-none ${isToday(d) ? 'size-10 bg-primary text-white flex items-center justify-center rounded-xl shadow-lg shadow-primary/30' :
                            isPoya ? 'text-amber-600' :
                              isHoliday ? 'text-rose-500' :
                                isWeekend ? 'text-slate-400' : 'text-slate-800'
                          }`}>
                          {d}
                        </span>
                        {isHoliday && (
                          <div className={`size-2.5 rounded-full animate-pulse shadow-sm ${isPoya ? 'bg-amber-400 shadow-amber-200' : 'bg-rose-400 shadow-rose-200'
                            }`} />
                        )}
                      </div>

                      {/* Meetings */}
                      <div className="space-y-2 overflow-hidden">
                        {dayMeetings.slice(0, 2).map((m, mi) => (
                          <div key={mi} className="bg-sky-50 border-l-4 border-sky-600 px-3 py-2.5 rounded-r transition-all hover:bg-sky-100/50 group/card shadow-sm border border-sky-100">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-black text-sky-900 leading-tight truncate uppercase tracking-tight">{m.title}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => handleEditMeeting(m, e)}
                                  className="size-5 flex items-center justify-center rounded-md hover:bg-sky-200 text-sky-600 transition-all"
                                >
                                  <span className="material-symbols-outlined text-[14px]">edit</span>
                                </button>
                                <button
                                  onClick={(e) => handleDeleteMeeting(m.id, e)}
                                  className="size-5 flex items-center justify-center rounded-md hover:bg-rose-100 text-rose-500 transition-all"
                                >
                                  <span className="material-symbols-outlined text-[14px]">delete</span>
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-black text-sky-500 uppercase leading-none">{m.startTime}</span>
                              <div className="flex items-center gap-1.5 opacity-80">
                                <span className="material-symbols-outlined text-[14px] text-sky-600">location_on</span>
                                <span className="text-[9px] font-bold text-sky-700 truncate uppercase tracking-wider">{m.location}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 mt-2">
                              {m.participants.slice(0, 3).map((p: string) => (
                                <span key={p} className="px-1.5 py-0.5 bg-white border border-sky-200 text-[8px] font-black text-sky-600 rounded-md uppercase tracking-wider shadow-sm">
                                  {p.replace('ALL_STAFF', 'STAFF').replace('DOCTORS', 'DOCS').replace('NURSES', 'NURSES')}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                        {dayMeetings.length > 2 && (
                          <div className="text-[9px] font-black text-slate-400 uppercase pl-1 bg-slate-50 py-1 rounded text-center border border-slate-100 tracking-widest ">
                            + {dayMeetings.length - 2} More Briefings
                          </div>
                        )}
                      </div>

                      {isHoliday && (
                        <div className="mt-2">
                          <p className={`text-[10px] font-bold leading-tight uppercase tracking-tight ${isPoya ? 'text-amber-600' : 'text-rose-500'
                            }`}>
                            {isHoliday}
                          </p>
                          <p className={`text-[8px] font-bold mt-0.5 uppercase ${isPoya ? 'text-amber-400' : 'text-rose-300'
                            }`}>
                            {isPoya ? 'Religious Holiday' : 'Public Holiday'}
                          </p>
                        </div>
                      )}

                      {/* Subtle hover detail */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Holiday Legend */}
            <div className="mt-8 flex flex-wrap gap-6 items-center justify-center text-[11px] font-bold uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-2">
                <div className="size-3 bg-primary rounded-md shadow-sm" />
                Today / Meetings
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 bg-amber-400 rounded-md shadow-sm" />
                Poya Holiday
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 bg-rose-400 rounded-md shadow-sm" />
                Public Holiday
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 border-2 border-slate-200 rounded-md" />
                Weekend
              </div>
            </div>
          </div>
        </div>

        <CreateMeetingModal
          isOpen={isMeetingModalOpen}
          onClose={() => {
            setIsMeetingModalOpen(false);
            setSelectedMeeting(null);
          }}
          initialData={selectedMeeting}
          onSuccess={fetchMeetings}
        />
      </main>
    </div>
  );
}
