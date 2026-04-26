import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useTasks } from '../hooks/useTasks';
import {
  Plus, Trash2, ExternalLink, ChevronLeft, CheckCircle2, 
  CalendarDays, Clock, X, Pencil, Folder, Search
} from 'lucide-react';

// Lazy load modals
const ActivityModal = lazy(() => import('../components/ActivityModal'));

const priorityConfig = {
  high: { label: 'High', dot: 'bg-red-500', text: 'text-red-500', ring: 'border-red-500/40', bg: 'bg-red-500/8' },
  mid: { label: 'Mid', dot: 'bg-yellow-500', text: 'text-yellow-500', ring: 'border-yellow-500/40', bg: 'bg-yellow-500/8' },
  low: { label: 'Low', dot: 'bg-green-500', text: 'text-green-500', ring: 'border-green-500/40', bg: 'bg-green-500/8' },
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'task', label: 'Tasks' },
  { key: 'event', label: 'Events' },
  { key: 'folder', label: 'Folders' },
  { key: 'active', label: 'Active' },
  { key: 'done', label: 'Done' },
  { key: 'high', label: '🔥 Priority' },
];

const TaskIcon = ({ size = 16, className = "" }) => (
  <img
    src="/task.svg"
    alt="Task"
    style={{ width: size, height: size }}
    className={`invert brightness-0 invert-[1] ${className}`}
  />
);

export default function TasksPage() {
  const { activities, loading, addActivity, updateActivity, toggleTask, deleteTask, purgeCompleted } = useTasks();
  const [activeTab, setActiveTab] = useState('all');
  const [taskSearch, setTaskSearch] = useState('');
  const [currentFolder, setCurrentFolder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const queueItems = useMemo(() => {
    const allQueue = (activities || []).filter(a => a.type === 'task' || a.type === 'event' || a.type === 'folder');
    
    if (currentFolder) {
      return allQueue.filter(a => a.folderId === currentFolder.id);
    } else {
      return allQueue.filter(a => a.type === 'folder' || !a.folderId);
    }
  }, [activities, currentFolder]);

  const filteredQueue = useMemo(() => {
    let items = [];
    switch (activeTab) {
      case 'active': items = queueItems.filter(t => !t.isCompleted); break;
      case 'done': items = queueItems.filter(t => t.isCompleted); break;
      case 'high': items = queueItems.filter(t => t.priority === 'high' && !t.isCompleted); break;
      case 'task': items = queueItems.filter(t => t.type === 'task'); break;
      case 'event': items = queueItems.filter(t => t.type === 'event'); break;
      case 'folder': items = queueItems.filter(t => t.type === 'folder'); break;
      default: items = queueItems;
    }

    if (!taskSearch) return items;
    return items.filter(t =>
      t.title?.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.detail?.toLowerCase().includes(taskSearch.toLowerCase())
    );
  }, [queueItems, activeTab, taskSearch]);

  const stats = useMemo(() => {
    const missions = queueItems.filter(a => a.type === 'task' || a.type === 'event');
    const total = missions.length;
    const completed = missions.filter(t => t.isCompleted).length;

    return {
      total,
      completed,
      rate: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }, [queueItems]);

  const handleSaveActivity = async (data, id) => {
    if (id) {
      await updateActivity(id, data);
    } else {
      if (currentFolder) {
        data.folderId = currentFolder.id;
      }
      await addActivity(data);
    }
  };

  const openEditModal = (item) => {
    setEditTarget(item);
    setIsModalOpen(true);
  };

  const card = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '18px', boxShadow: 'var(--shadow-card)' };

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in p-2 sm:p-4">
      <div style={{ ...card, padding: '24px', minHeight: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2">
              {currentFolder && (
                 <button 
                   onClick={() => setCurrentFolder(null)}
                   className="p-1.5 hover:bg-white/5 rounded-lg text-blue-500 transition-colors"
                 >
                   <ChevronLeft size={18} />
                 </button>
              )}
              <h1 style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px' }}>
                {currentFolder ? currentFolder.title : 'Missions & Tasks'}
              </h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              {currentFolder ? 'Folder Content' : `${stats.completed} of ${stats.total} objectives completed`}
            </p>
          </div>
          <button 
            onClick={() => { setEditTarget(null); setIsModalOpen(true); }} 
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all"
          >
            Create Mission
          </button>
        </div>

        {/* Task Search Bar */}
        <div className="relative mb-5 flex-shrink-0">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search tasks, events, or folders..."
            value={taskSearch}
            onChange={(e) => setTaskSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-[var(--bg-deep)] text-[var(--text-main)] placeholder-[var(--text-faint)] border border-[var(--border-soft)] focus:outline-none focus:border-blue-500/50 text-sm transition-all"
          />
          {taskSearch && (
            <button 
              onClick={() => setTaskSearch('')}
              className="absolute inset-y-0 right-3.5 flex items-center text-[var(--text-faint)] hover:text-[var(--text-muted)]"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {TABS.map(tab => (
            <button 
              key={tab.key} 
              onClick={() => setActiveTab(tab.key)} 
              className="whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all border"
              style={activeTab === tab.key 
                ? { background: 'rgba(59,130,246,0.15)', color: '#3b82f6', borderColor: 'rgba(59,130,246,0.3)' } 
                : { color: 'var(--text-muted)', borderColor: 'transparent' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List View */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-60 gap-3">
              <div className="w-9 h-9 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
              <span className="text-xs text-[var(--text-muted)]">Loading Missions...</span>
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-[var(--border-soft)] rounded-2xl opacity-60">
              <div className="text-4xl mb-3">🎯</div>
              <p className="text-sm font-bold text-[var(--text-main)]">No objectives found</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Ready to take on something new?</p>
            </div>
          ) : (
            filteredQueue.map(item => {
              const p = item.type === 'task' ? (priorityConfig[item.priority] || priorityConfig.mid) : null;
              return (
                <div 
                  key={item.id} 
                  className={`flex items-start gap-3 p-4 rounded-2xl bg-[var(--bg-deep)] border border-[var(--border-soft)] group transition-all ${item.type === 'folder' ? 'cursor-pointer hover:border-amber-500/30' : ''}`}
                  style={{ opacity: item.isCompleted ? 0.65 : 1 }}
                  onClick={() => {
                    if (item.type === 'folder') setCurrentFolder(item);
                  }}
                >
                  {item.type !== 'folder' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleTask(item.id, item.isCompleted); }} 
                      className="mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all bg-transparent flex-shrink-0"
                      style={{ borderColor: item.isCompleted ? '#22c55e' : (p?.dot === 'bg-red-500' ? '#ef4444' : 'var(--border)') }}
                    >
                      {item.isCompleted && <CheckCircle2 size={16} className="text-green-500" />}
                    </button>
                  )}
                  <div className="flex-1 min-w-0 flex items-start gap-3">
                    {/* Icon */}
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${item.type === 'event' ? 'bg-indigo-500/10 text-indigo-500' : item.type === 'folder' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {item.type === 'event' ? <CalendarDays size={16} /> : item.type === 'folder' ? <Folder size={16} /> : <TaskIcon size={16} className="opacity-90" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-bold break-words leading-tight ${item.isCompleted ? 'line-through opacity-50' : 'text-[var(--text-main)]'}`}>
                          {item.title}
                        </p>
                        {item.type === 'task' && !item.isCompleted && p && (
                          <span className="flex-shrink-0 flex items-center px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider"
                            style={{ background: item.priority === 'high' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)', color: item.priority === 'high' ? '#ef4444' : '#22c55e' }}>
                            {p.label}
                          </span>
                        )}
                      </div>

                      {item.type === 'folder' && (
                        <p className="text-[10px] font-bold text-amber-500/60 uppercase tracking-wider">
                          {(() => {
                            const count = (activities || []).filter(a => a.folderId === item.id).length;
                            return count === 0 ? 'Empty Folder' : `${count} ${count === 1 ? 'Item' : 'Items'} Inside`;
                          })()}
                        </p>
                      )}

                      {item.detail && <p className="text-xs text-[var(--text-muted)] break-words leading-relaxed">{item.detail}</p>}
                      {item.location && <p className="text-[10px] font-bold text-blue-500 flex items-center gap-1"><ExternalLink size={11} /> {item.location}</p>}

                      {/* Deadline badges */}
                      {!item.isCompleted && (item.deadlineDate || item.deadlineTime || item.date || item.time) && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {(item.deadlineDate || item.date) && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 flex items-center gap-1">
                              <CalendarDays size={11} /> {item.deadlineDate || item.date}
                            </span>
                          )}
                          {(item.deadlineTime || item.time) && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 flex items-center gap-1">
                              <Clock size={11} /> {item.deadlineTime || item.time}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 self-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openEditModal(item); }} 
                      className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteTask(item.id); }} 
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {stats.completed > 0 && (
          <button 
            onClick={purgeCompleted} 
            className="mt-4 w-full py-3 rounded-xl text-xs font-bold border border-[var(--border)] text-[var(--text-muted)] hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/30 transition-all flex-shrink-0"
          >
            Purge {stats.completed} Completed Missions
          </button>
        )}

      </div>

      {/* Modals */}
      <Suspense fallback={null}>
        {isModalOpen && (
          <ActivityModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveActivity}
            activity={editTarget}
          />
        )}
      </Suspense>
    </div>
  );
}
