import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import ActivityModal from '../components/ActivityModal';
import { ChevronLeft, ChevronRight, X, CalendarDays, Clock, Plus } from 'lucide-react';

const TaskIcon = ({ size = 16, className = "" }) => (
  <img src="/task.svg" alt="Task" style={{ width: size, height: size }} className={`invert brightness-0 invert-[1] ${className}`} />
);

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAY_LABELS_FULL   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAY_LABELS_SHORT  = ['S','M','T','W','T','F','S'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate]   = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [zoomDate, setZoomDate] = useState(null);
  const navigate = useNavigate();
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

  const today         = new Date();
  const daysInMonth   = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handleDayClick = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setZoomDate(dateStr);
  };

  const daysGrid = useMemo(() => {
    const blanks = Array.from({ length: firstDayOfMonth }, () => null);
    const days   = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return [...blanks, ...days];
  }, [daysInMonth, firstDayOfMonth]);

  const monthEventCount = calendarItems.filter(e => {
    const [y, m] = (e.normalizedDate || '').split('-').map(Number);
    return y === currentDate.getFullYear() && m === currentDate.getMonth() + 1;
  }).length;

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToday   = () => setCurrentDate(new Date());

  /* ── shared button style helpers ── */
  const navBtnStyle = {
    padding: '8px 10px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-main)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.15s',
  };

  return (
    <div className="flex flex-col pb-6 lg:pb-4 animate-fade-in min-h-[calc(100vh-140px)]">

      {/* ── Page Header ── */}
      <div className="mb-4">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 mb-3 transition-colors"
          style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <ChevronLeft size={15} /> Back to Dashboard
        </button>

        {/* Title row — flex wrap so nav buttons drop below on very small screens */}
        <div className="flex flex-wrap items-end gap-3 justify-between">
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '2px' }}>
              My Calendar
            </p>
            <h1 style={{ fontSize: 'clamp(22px, 6vw, 32px)', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h1>
            {monthEventCount > 0 && (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                {monthEventCount} event{monthEventCount > 1 ? 's' : ''} this month
              </p>
            )}
          </div>

          {/* Navigation controls */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
            <button onClick={prevMonth} style={navBtnStyle}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.color = 'var(--text-main)'; }}>
              <ChevronLeft size={15} />
            </button>

            <button onClick={goToday}
              style={{ padding: '8px 16px', borderRadius: '10px', backgroundColor: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 3px 10px rgba(59,130,246,0.35)', whiteSpace: 'nowrap' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Today
            </button>

            <button onClick={nextMonth} style={navBtnStyle}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.color = 'var(--text-main)'; }}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Calendar Card ── */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Day-of-week headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-deep)',
        }}>
          {DAY_LABELS_FULL.map((day, i) => (
            <div key={day} style={{
              padding: '10px 0',
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              {/* Full label on md+, short on mobile */}
              <span className="hidden sm:block">{day}</span>
              <span className="sm:hidden">{DAY_LABELS_SHORT[i]}</span>
            </div>
          ))}
        </div>

        {/* Date cells — auto stretch to fill space */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridAutoRows: '1fr',
          flex: 1,
        }}>
          {daysGrid.map((day, idx) => {
            if (!day) return (
              <div key={`blank-${idx}`} style={{
                borderBottom: '1px solid var(--border-soft)',
                borderRight:  '1px solid var(--border-soft)',
                backgroundColor: 'var(--bg-main)',
                opacity: 0.45,
              }} />
            );

            const cellDateStr   = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const cellEvents    = calendarItems.filter(e => e.normalizedDate === cellDateStr)
              .sort((a,b) => (a.normalizedTime || '23:59').localeCompare(b.normalizedTime || '23:59'));
            const isToday       = day === today.getDate()
              && currentDate.getMonth()    === today.getMonth()
              && currentDate.getFullYear() === today.getFullYear();

            return (
              <div
                key={idx}
                onClick={() => handleDayClick(day)}
                style={{
                  borderBottom: '1px solid var(--border-soft)',
                  borderRight:  '1px solid var(--border-soft)',
                  padding: '5px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                  minWidth: 0,      /* prevent grid blowout */
                  overflow: 'hidden',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {/* Day number */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  /* Scales between 22px (mobile) and 28px (desktop) */
                  width: 'clamp(22px, 5vw, 28px)',
                  height: 'clamp(22px, 5vw, 28px)',
                  borderRadius: '50%',
                  fontSize: 'clamp(10px, 2.5vw, 13px)',
                  fontWeight: isToday ? 700 : 400,
                  backgroundColor: isToday ? 'var(--accent)' : 'transparent',
                  color: isToday ? '#fff' : 'var(--text-muted)',
                  boxShadow: isToday ? '0 2px 8px rgba(59,130,246,0.4)' : 'none',
                  flexShrink: 0,
                  alignSelf: 'center',
                }}>
                  {day}
                </span>

                {/* Events — dots on mobile, text chips on sm+ */}
                {cellEvents.length > 0 && (
                  <>
                    {/* Mobile: coloured dots */}
                    <div className="flex flex-wrap gap-0.5 justify-center mt-1 sm:hidden">
                      {cellEvents.slice(0, 3).map((e, i) => (
                        <span key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#3b82f6', flexShrink: 0 }} />
                      ))}
                    </div>

                    {/* sm+: text chips */}
                    <div className="hidden sm:flex flex-col gap-0.5 mt-1 overflow-hidden">
                      {cellEvents.slice(0, 2).map(e => (
                        <div key={e.id}
                          title={`${e.title}${e.location ? ` @ ${e.location}` : ''}`}
                          style={{
                            fontSize: '10px', fontWeight: 500,
                            padding: '1px 4px', borderRadius: '4px',
                            backgroundColor: e.type === 'event' ? 'rgba(99,102,241,0.15)' : 'rgba(59,130,246,0.15)',
                            color: e.type === 'event' ? '#818cf8' : '#60a5fa',
                            whiteSpace: 'normal',
                            wordBreak: 'break-all',
                            lineHeight: '1.2'
                          }}>
                          {e.normalizedTime && <span style={{ opacity: 0.75, marginRight: '2px' }}>{e.normalizedTime}</span>}
                          {e.title}
                        </div>
                      ))}
                      {cellEvents.length > 2 && (
                        <span style={{ fontSize: '9px', color: 'var(--text-faint)', paddingLeft: '4px' }}>
                          +{cellEvents.length - 2}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <ActivityModal
        isOpen={isAssignOpen}
        onClose={() => { setIsAssignOpen(false); setSelectedDate(null); }}
        onSave={addActivity}
        defaultType="event"
        defaultDate={selectedDate}
      />

      {/* ── Day Zoom Modal ── */}
      {zoomDate && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setZoomDate(null)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh] animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-main)]">Daily Outline</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">{new Date(zoomDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <button onClick={() => setZoomDate(null)} className="p-2 bg-[var(--bg-deep)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors border border-[var(--border-soft)]">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {(() => {
                const dayItems = calendarItems.filter(e => e.normalizedDate === zoomDate).sort((a,b) => (a.normalizedTime || '23:59').localeCompare(b.normalizedTime || '23:59'));
                if (dayItems.length === 0) {
                  return (
                    <div className="py-10 text-center opacity-50 flex flex-col items-center">
                      <CalendarDays size={32} className="mb-3 opacity-50" />
                      <p className="font-bold text-sm">No missions today</p>
                      <p className="text-[10px]">Rest up or get ahead!</p>
                    </div>
                  );
                }
                return dayItems.map(item => (
                  <div key={item.id} className="flex gap-3 bg-[var(--bg-deep)] p-3 rounded-xl border border-[var(--border-soft)] items-start focus:ring-2 ring-blue-500 hover:border-blue-500/30 transition-all">
                     <div className={`p-2 rounded-xl flex-shrink-0 ${item.type === 'event' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-blue-500/10 text-blue-500'}`}>
                       {item.type === 'event' ? <CalendarDays size={16} /> : <TaskIcon size={16} />}
                     </div>
                     <div className="min-w-0 flex-1">
                       <div className="flex justify-between items-start">
                         <p className="text-sm font-bold text-[var(--text-main)] break-all leading-tight flex-1 pr-2">{item.title}</p>
                         {item.type === 'task' && item.priority && (
                           <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 opacity-70 ml-2 flex-shrink-0">{item.priority}</span>
                         )}
                       </div>
                       {item.normalizedTime && (
                         <span className="text-[10px] font-bold text-[var(--text-muted)] flex items-center gap-1 mt-1.5">
                           <Clock size={10} /> {item.normalizedTime}
                         </span>
                       )}
                     </div>
                  </div>
                ));
              })()}
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-deep)] rounded-b-2xl">
              <button onClick={() => { setSelectedDate(zoomDate); setZoomDate(null); setIsAssignOpen(true); }} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20 transition-all">
                <Plus size={16} /> Add Mission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
