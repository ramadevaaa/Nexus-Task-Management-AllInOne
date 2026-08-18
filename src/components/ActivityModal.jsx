import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarDays, Folder, CheckCircle2, MapPin } from 'lucide-react';

export default function ActivityModal({ isOpen, onClose, onSave, activity = null, defaultType = 'task', defaultDate = '' }) {
  const titleInputRef = useRef(null);
  const [type, setType] = useState(defaultType);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDetail, setTaskDetail] = useState('');
  const [taskPriority, setTaskPriority] = useState('mid');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDate, setEventDate] = useState(defaultDate);
  const [eventTime, setEventTime] = useState('');
  const [folderTitle, setFolderTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (activity) {
        setType(activity.type || 'task');
        if (activity.type === 'task') {
          setTaskTitle(activity.title || '');
          setTaskDetail(activity.detail || '');
          setTaskPriority(activity.priority || 'mid');
          setDeadlineDate(activity.deadlineDate || '');
          setDeadlineTime(activity.deadlineTime || '');
        } else if (activity.type === 'event') {
          setEventTitle(activity.title || '');
          setEventLocation(activity.location || '');
          setEventDate(activity.date || '');
          setEventTime(activity.time || '');
        } else if (activity.type === 'folder') {
          setFolderTitle(activity.title || '');
        }
      } else {
        setType(defaultType);
        setTaskTitle('');
        setTaskDetail('');
        setTaskPriority('mid');
        setDeadlineDate('');
        setDeadlineTime('');
        setEventTitle('');
        setEventLocation('');
        setEventDate(defaultDate || '');
        setEventTime('');
        setFolderTitle('');
      }
    }
  }, [isOpen, activity, defaultType, defaultDate]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousFocus = document.activeElement;
    const focusTimer = window.setTimeout(() => titleInputRef.current?.focus(), 0);
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  function reset() {
    setTaskTitle('');
    setTaskDetail('');
    setTaskPriority('mid');
    setDeadlineDate('');
    setDeadlineTime('');
    setEventTitle('');
    setEventLocation('');
    setEventDate('');
    setEventTime('');
    setFolderTitle('');
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const data =
      type === 'task'
        ? {
            type: 'task',
            title: taskTitle.trim(),
            detail: taskDetail.trim(),
            priority: taskPriority,
            deadlineDate: deadlineDate || null,
            deadlineTime: deadlineTime || null,
          }
        : type === 'event'
        ? {
            type: 'event',
            title: eventTitle.trim(),
            location: eventLocation.trim(),
            date: eventDate,
            time: eventTime,
          }
        : {
            type: 'folder',
            title: folderTitle.trim(),
          };

    if (type === 'task' && !taskTitle.trim()) return;
    if (type === 'event' && (!eventTitle.trim() || !eventDate || !eventTime)) return;
    if (type === 'folder' && !folderTitle.trim()) return;

    onSave(data, activity?.id);
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="activity-modal-title"
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="relative z-50 w-full max-w-lg rounded-2xl bg-white dark:bg-[#121620] p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {activity ? 'Editing' : 'New item'}
                </span>
                <h2 id="activity-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                  {type === 'task' ? (activity ? 'Edit task' : 'Add task') : type === 'event' ? (activity ? 'Edit event' : 'Add event') : (activity ? 'Edit folder' : 'Add folder')}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Type Switcher Pills */}
            {!activity && (
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 mb-5">
                {[
                  { key: 'task', label: 'Mission / Task', icon: CheckCircle2 },
                  { key: 'event', label: 'Event / Meeting', icon: CalendarDays },
                  { key: 'folder', label: 'Folder', icon: Folder },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isSel = type === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setType(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSel
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Task Form */}
              {type === 'task' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Task Title *
                    </label>
                    <input
                       ref={titleInputRef}
                      type="text"
                      required
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="e.g. Design BrandBook Layout"
                      className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Task Description
                    </label>
                    <textarea
                      rows={3}
                      value={taskDetail}
                      onChange={(e) => setTaskDetail(e.target.value)}
                      placeholder="Add subtasks, notes, or details..."
                      className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Due date
                      </label>
                      <input
                        type="date"
                        value={deadlineDate}
                        onChange={(e) => setDeadlineDate(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Due time
                      </label>
                      <input
                        type="time"
                        value={deadlineTime}
                        onChange={(e) => setDeadlineTime(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Priority Level
                    </label>
                    <div className="flex gap-2">
                      {[
                        { key: 'low', label: 'Low', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
                        { key: 'mid', label: 'Medium', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
                        { key: 'high', label: 'High 🔥', color: 'text-red-600 bg-red-50 dark:bg-red-950/40' },
                      ].map((p) => (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => setTaskPriority(p.key)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                            taskPriority === p.key
                              ? `${p.color} border-current shadow-sm`
                              : 'border-slate-200 dark:border-slate-700 text-slate-400'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Event Form */}
              {type === 'event' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Event / Meeting Title *
                    </label>
                    <input
                       ref={titleInputRef}
                      type="text"
                      required
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="e.g. Meeting with marketing team"
                      className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Location or Video Link
                    </label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        placeholder="Google Meet, Zoom, or Office Room 3"
                        className="w-full h-11 pl-9 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Event Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Event Time *
                      </label>
                      <input
                        type="time"
                        required
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Folder Form */}
              {type === 'folder' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Folder Name *
                  </label>
                  <input
                    ref={titleInputRef}
                    type="text"
                    required
                    value={folderTitle}
                    onChange={(e) => setFolderTitle(e.target.value)}
                    placeholder="e.g. Project Phoenix"
                    className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                   <span>{activity ? 'Save changes' : 'Add item'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
