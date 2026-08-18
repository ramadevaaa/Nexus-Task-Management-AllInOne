import { useState, useMemo, lazy, Suspense } from 'react';
import { useTasks } from '../hooks/useTasks';
import {
  Plus, Trash2, ExternalLink, ChevronLeft, CheckCircle2, Circle,
  CalendarDays, Clock, X, Pencil, Folder, Search, CheckSquare,
  Square, Flame, Check, Sparkles, FolderPlus, ArrowLeft
} from 'lucide-react';

// Lazy load modals
const ActivityModal = lazy(() => import('../components/ActivityModal'));

const priorityConfig = {
  high: { label: 'High', dot: 'bg-red-500', text: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/40' },
  mid: { label: 'Mid', dot: 'bg-amber-500', text: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40' },
  low: { label: 'Low', dot: 'bg-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40' },
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

export default function TasksPage() {
  const { activities, addActivity, updateActivity, toggleTask, deleteTask } = useTasks();
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

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-[1440px] mx-auto">
      {/* ── TOP HEADER & STATS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Stat Card 1: Total Active */}
        <div className="bento-card p-6 flex items-center justify-between bg-white dark:bg-[#121620]">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              Active Missions
            </span>
            <span className="text-3xl font-bold text-slate-900 dark:text-white font-sans">
              {stats.total - stats.completed}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl">
            🎯
          </div>
        </div>

        {/* Stat Card 2: Completion Rate */}
        <div className="bento-card p-6 flex flex-col justify-between bg-white dark:bg-[#121620]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-400">
              Completion Rate
            </span>
            <span className="text-xs font-bold text-emerald-500 font-mono">
              {stats.completed}/{stats.total} ({stats.rate}%)
            </span>
          </div>
          <div className="h-4 rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 overflow-hidden">
            <div
              style={{ width: `${stats.rate}%` }}
              className="h-full rounded-lg striped-emerald transition-all duration-500"
            />
          </div>
        </div>

        {/* Stat Card 3: Quick New Mission */}
        <div className="bento-card p-6 flex items-center justify-between bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
          <div>
            <h3 className="font-bold text-base">Create Mission</h3>
            <p className="text-xs text-blue-100">Add a new task, event, or folder</p>
          </div>
          <button
            onClick={() => { setEditTarget(null); setIsModalOpen(true); }}
            className="w-11 h-11 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
            aria-label="Add Mission"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* ── FILTER TABS & SEARCH BAR ── */}
      <div className="bento-card p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-[#121620]">
        {/* Navigation Breadcrumb / Folder Back Button */}
        {currentFolder ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentFolder(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <span className="text-xs font-bold text-slate-400">/</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Folder size={14} className="text-blue-500" />
              {currentFolder.title}
            </span>
          </div>
        ) : (
          /* Filter Tabs */
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search missions..."
            value={taskSearch}
            onChange={(e) => setTaskSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
      </div>

      {/* ── MISSIONS LIST (BENTO CARDS) ── */}
      <div className="space-y-3">
        {filteredQueue.length === 0 ? (
          <div className="bento-card p-12 text-center bg-white dark:bg-[#121620]">
            <span className="text-4xl block mb-2">🎉</span>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
              No missions found
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              All caught up! Create a new mission to get started.
            </p>
            <button
              onClick={() => { setEditTarget(null); setIsModalOpen(true); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              <Plus size={14} />
              <span>Create Mission</span>
            </button>
          </div>
        ) : (
          filteredQueue.map((item) => {
            const isFolder = item.type === 'folder';
            const pConf = priorityConfig[item.priority] || priorityConfig.low;

            return (
              <div
                key={item.id}
                onClick={() => isFolder && setCurrentFolder(item)}
                className={`bento-card p-4 sm:p-5 flex items-center justify-between gap-4 bg-white dark:bg-[#121620] group cursor-pointer transition-all ${
                  item.isCompleted ? 'opacity-70' : ''
                }`}
              >
                {/* Left: Checkbox + Title + Meta */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Task Checkbox */}
                  {!isFolder ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleTask(item.id); }}
                      className="shrink-0 transition-transform active:scale-90"
                    >
                      {item.isCompleted ? (
                        <CheckCircle2 size={22} className="text-emerald-500 fill-emerald-500/20" />
                      ) : (
                        <Circle size={22} className="text-slate-300 dark:text-slate-600 hover:text-blue-500" />
                      )}
                    </button>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Folder size={18} />
                    </div>
                  )}

                  {/* Title & Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-bold truncate text-slate-800 dark:text-slate-100 ${
                          item.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}
                      >
                        {item.title}
                      </h4>

                      {/* Priority Tag */}
                      {item.priority && item.priority !== 'low' && !item.isCompleted && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${pConf.bg} ${pConf.text}`}>
                          {pConf.label}
                        </span>
                      )}
                    </div>

                    {/* Sub-label details */}
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                      {(item.date || item.deadlineDate) && (
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} />
                          {item.date || item.deadlineDate}
                        </span>
                      )}
                      {(item.time || item.deadlineTime) && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {item.time || item.deadlineTime}
                        </span>
                      )}
                      {item.detail && (
                        <span className="truncate max-w-[200px] hidden md:inline">
                          {item.detail}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                    className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                    aria-label={`Edit ${item.title}`}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteTask(item.id); }}
                    className="w-11 h-11 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-500 flex items-center justify-center transition-colors"
                    aria-label={`Delete ${item.title}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── MODAL ── */}
      <Suspense fallback={null}>
        {isModalOpen && (
          <ActivityModal
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); setEditTarget(null); }}
            onSave={handleSaveActivity}
            activity={editTarget}
          />
        )}
      </Suspense>
    </div>
  );
}
