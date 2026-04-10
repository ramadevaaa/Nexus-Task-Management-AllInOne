import { useState, useEffect } from 'react';
import { X, CalendarDays, Pencil, Zap } from 'lucide-react';

export default function ActivityModal({ isOpen, onClose, onSave, activity = null, defaultType = 'task', defaultDate = '' }) {
  const [type, setType]             = useState(defaultType);
  const [taskTitle, setTaskTitle]   = useState('');
  const [taskDetail, setTaskDetail] = useState('');
  const [taskPriority, setTaskPriority] = useState('mid');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [eventTitle, setEventTitle]     = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDate, setEventDate]   = useState(defaultDate);
  const [eventTime, setEventTime]   = useState('');

  // Handle Edit Mode: Populate state if an activity is provided
  useEffect(() => {
    if (isOpen) {
      if (activity) {
        setType(activity.type);
        if (activity.type === 'task') {
          setTaskTitle(activity.title || '');
          setTaskDetail(activity.detail || '');
          setTaskPriority(activity.priority || 'mid');
          setDeadlineDate(activity.deadlineDate || '');
          setDeadlineTime(activity.deadlineTime || '');
        } else {
          setEventTitle(activity.title || '');
          setEventLocation(activity.location || '');
          setEventDate(activity.date || '');
          setEventTime(activity.time || '');
        }
      } else {
        // Reset or set defaults for new item
        setType(defaultType);
        setEventDate(defaultDate || '');
        reset();
      }
    }
  }, [isOpen, activity, defaultType, defaultDate]);

  if (!isOpen) return null;

  function reset() {
    setTaskTitle(''); setTaskDetail(''); setTaskPriority('mid');
    setDeadlineDate(''); setDeadlineTime('');
    setEventTitle(''); setEventLocation(''); setEventDate(''); setEventTime('');
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = type === 'task' ? { 
      type: 'task', 
      title: taskTitle.trim(), 
      detail: taskDetail.trim(), 
      priority: taskPriority, 
      deadlineDate: deadlineDate || null, 
      deadlineTime: deadlineTime || null 
    } : { 
      type: 'event', 
      title: eventTitle.trim(), 
      location: eventLocation.trim(), 
      date: eventDate, 
      time: eventTime 
    };

    if (type === 'task' && (!taskTitle.trim() || !deadlineDate || !deadlineTime)) return;
    if (type === 'event' && (!eventTitle.trim() || !eventDate || !eventTime)) return;

    onSave(data, activity?.id); // Pass ID if editing
    reset();
    onClose();
  };

  const handleClose = () => { reset(); onClose(); };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 500,
    outline: 'none',
    fontFamily: 'inherit',
    border: '1px solid #2a3347',
    backgroundColor: '#0d1117',
    color: '#f1f5f9',
    transition: 'border-color 0.2s',
  };

  const priorities = [
    { value: 'high', label: '🔥 High',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   active: 'rgba(239,68,68,0.2)' },
    { value: 'mid',  label: '⚡ Mid',    color: '#eab308', bg: 'rgba(234,179,8,0.12)',   active: 'rgba(234,179,8,0.2)' },
    { value: 'low',  label: '🌿 Low',    color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   active: 'rgba(34,197,94,0.2)' },
  ];

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={handleClose}>
      <div
        style={{ backgroundColor: '#161b27', border: '1px solid #252f42', borderRadius: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #252f42', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {activity ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', fontWeight: 800 }}>
                <Pencil size={18} />
                <span>Edit {activity.type === 'task' ? 'Task' : 'Event'}</span>
              </div>
            ) : (
              ['task', 'event'].map(t => (
                <button key={t}
                  type="button"
                  onClick={() => setType(t)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
                    border: type === t ? '1px solid rgba(59,130,246,0.5)' : '1px solid #252f42',
                    backgroundColor: type === t ? 'rgba(59,130,246,0.15)' : 'transparent',
                    color: type === t ? '#60a5fa' : '#8b9ab5',
                    cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                  }}>
                  <div className={`p-1.5 rounded-lg ${type === t ? (t === 'event' ? 'bg-indigo-500/20' : 'bg-blue-500/20') : 'bg-white/5'}`}>
                    {t === 'task' ? <Zap size={14} /> : <CalendarDays size={14} />}
                  </div>
                  <span>{t.toUpperCase()}</span>
                </button>
              ))
             )}
          </div>
          <button
            onClick={handleClose}
            style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#8b9ab5', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {type === 'task' ? (<>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8b9ab5', marginBottom: '8px', textTransform: 'uppercase' }}>Task title</label>
                <input
                  autoFocus type="text" value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)} required
                  style={inputStyle} placeholder="e.g. Finish the design mockup"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8b9ab5', marginBottom: '8px', textTransform: 'uppercase' }}>Details (optional)</label>
                <textarea
                  value={taskDetail} onChange={e => setTaskDetail(e.target.value)}
                  style={{ ...inputStyle, height: '88px', resize: 'none' }}
                  placeholder="Add notes, links, or context..."
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8b9ab5', marginBottom: '8px', textTransform: 'uppercase' }}>Priority</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {priorities.map(p => (
                    <button key={p.value} type="button"
                      onClick={() => setTaskPriority(p.value)}
                      style={{
                        flex: 1, padding: '10px 4px', borderRadius: '12px', fontSize: '12px', fontWeight: 700,
                        border: taskPriority === p.value ? `1px solid ${p.color}` : '1px solid #2a3347',
                        backgroundColor: taskPriority === p.value ? p.active : p.bg,
                        color: p.color, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                      }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8b9ab5', marginBottom: '8px', textTransform: 'uppercase' }}>Date (Optional)</label>
                  <input
                    type="date" value={deadlineDate}
                    onChange={e => setDeadlineDate(e.target.value)}
                    required
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8b9ab5', marginBottom: '8px', textTransform: 'uppercase' }}>Time</label>
                  <input
                    type="time" value={deadlineTime}
                    onChange={e => setDeadlineTime(e.target.value)}
                    required
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                  />
                </div>
              </div>
            </>) : (<>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8b9ab5', marginBottom: '8px', textTransform: 'uppercase' }}>Event title</label>
                <input
                  autoFocus type="text" value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)} required
                  style={inputStyle} placeholder="e.g. Team sync meeting"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8b9ab5', marginBottom: '8px', textTransform: 'uppercase' }}>Location / Link</label>
                <input
                  type="text" value={eventLocation}
                  onChange={e => setEventLocation(e.target.value)}
                  style={inputStyle} placeholder="Zoom link, room, address..."
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8b9ab5', marginBottom: '8px', textTransform: 'uppercase' }}>Date</label>
                  <input
                    type="date" value={eventDate}
                    onChange={e => setEventDate(e.target.value)} required
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8b9ab5', marginBottom: '8px', textTransform: 'uppercase' }}>Time</label>
                  <input
                    type="time" value={eventTime}
                    onChange={e => setEventTime(e.target.value)} required
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                  />
                </div>
              </div>
            </>)}

          </div>

          {/* Footer */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid #252f42', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={handleClose}
              style={{ padding: '12px 24px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, border: '1px solid #252f42', backgroundColor: 'transparent', color: '#8b9ab5', cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancel
            </button>
            <button type="submit"
              style={{ padding: '12px 28px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 15px rgba(59,130,246,0.4)' }}>
              {activity ? 'Save Changes' : '+ Add Mission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
