import { useState, useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import ActivityModal from '../components/ActivityModal';
import {
  ChevronLeft, ChevronRight, X, CalendarDays, Clock, Plus,
  Video, Users, MoreHorizontal, CheckCircle2
} from 'lucide-react';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAY_LABELS_FULL = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { activities, addActivity } = useTasks();

  const calendarItems = useMemo(() => {
    return (activities || []).filter(a =>
      !a.isCompleted && (a.type === 'event' || a.type === 'task')
    ).map(a => ({
      ...a,
      normalizedDate: a.type === 'event' ? a.date : a.deadlineDate,
      normalizedTime: a.type === 'event' ? a.time : a.deadlineTime
    })).filter(a => a.normalizedDate);
  }, [activities]);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const daysGrid = useMemo(() => {
    const blanks = Array.from({ length: firstDayOfMonth }, () => null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return [...blanks, ...days];
  }, [daysInMonth, firstDayOfMonth]);

  const selectedDateEvents = useMemo(() => {
    return calendarItems.filter(e => e.normalizedDate === selectedDateStr);
  }, [calendarItems, selectedDateStr]);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToday = () => {
    const d = new Date();
    setCurrentDate(d);
    setSelectedDateStr(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-[1440px] mx-auto">
      {/* ── TOP HEADER & MONTH NAVIGATION ── */}
      <div className="bento-card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#121620]">
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-0.5">
            Mission Schedule
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h1>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={goToday}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextMonth}
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all ml-auto sm:ml-2"
          >
            <Plus size={15} />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* ── 2-COLUMN BENTO GRID: CALENDAR + AGENDA DETAIL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 bento-card p-6 bg-white dark:bg-[#121620]">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center">
            {DAY_LABELS_FULL.map((d, i) => (
              <span key={d} className={`text-xs font-bold ${i === 0 || i === 6 ? 'text-amber-500' : 'text-slate-400'}`}>
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {daysGrid.map((day, idx) => {
              if (!day) {
                return <div key={`blank-${idx}`} className="h-20 sm:h-24 rounded-2xl bg-transparent" />;
              }

              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDateStr;
              const dayEvents = calendarItems.filter(e => e.normalizedDate === dateStr);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => setSelectedDateStr(dateStr)}
                  aria-label={`${new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { dateStyle: 'long' })}, ${dayEvents.length} items`}
                  aria-pressed={isSelected}
                  className={`h-14 sm:h-24 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border text-left transition-colors flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/5 ring-2 ring-blue-500/20'
                      : isToday
                      ? 'border-blue-400/50 bg-slate-50 dark:bg-slate-800/40'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 hover:bg-slate-100/60 dark:bg-slate-800/20 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        isToday
                          ? 'bg-blue-600 text-white'
                          : isSelected
                          ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {day}
                    </span>
                  </div>

                  <div className="flex gap-1 sm:hidden" aria-hidden="true">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <span key={ev.id} className={`h-1.5 w-1.5 rounded-full ${ev.type === 'event' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                    ))}
                  </div>
                  <div className="hidden sm:block space-y-1 overflow-hidden" aria-hidden="true">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-xs font-semibold px-1.5 py-0.5 rounded truncate ${
                          ev.type === 'event'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-xs font-semibold text-slate-400 block text-right">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Day Detail (4 cols) */}
        <div className="lg:col-span-4 bento-card p-6 flex flex-col justify-between bg-white dark:bg-[#121620]">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-400 block">
                  Daily Schedule
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedDateStr}
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {selectedDateEvents.length} items
              </span>
            </div>

            {/* Events for this day */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {selectedDateEvents.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <CalendarDays size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-medium">No events scheduled for this day</p>
                </div>
              ) : (
                selectedDateEvents.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {item.title}
                      </h4>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          item.type === 'event'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>
                    {item.normalizedTime && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-1">
                        <Clock size={10} />
                        <span>{item.normalizedTime}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus size={14} />
            <span>Add to this day</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ActivityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={addActivity}
          defaultType="event"
          defaultDate={selectedDateStr}
        />
      )}
    </div>
  );
}
