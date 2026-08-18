import { useState, useMemo, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTasks } from '../hooks/useTasks';
import { useTimer } from '../hooks/useTimer';
import {
  Plus, Trash2, ExternalLink, ChevronLeft, ChevronRight,
  CheckCircle2, Circle, Clock, BarChart3,
  Link2, CalendarDays, RotateCcw, Play, Pause, X, Pencil,
  StickyNote, Lightbulb, Library, Search, Folder,
  ArrowRight, ArrowLeft, Volume2, CornerDownLeft
} from 'lucide-react';
import NexusAIWidget from '../components/NexusAIWidget';

// Lazy loaded modals & Spotify
const SpotifyPlayer = lazy(() => import('../components/SpotifyPlayer'));
const ActivityModal = lazy(() => import('../components/ActivityModal'));
const AddHubModal = lazy(() => import('../components/AddHubModal'));
const VaultModal = lazy(() => import('../components/VaultModal'));

/* ─── Priority Config ─── */
const priorityConfig = {
  high: { label: 'High', dot: 'bg-red-500', text: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/40' },
  mid: { label: 'Mid', dot: 'bg-amber-500', text: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40' },
  low: { label: 'Low', dot: 'bg-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40' },
};

const VAULT_TABS = [
  { key: 'all', label: 'All' },
  { key: 'note', label: 'Notes' },
  { key: 'idea', label: 'Ideas' },
  { key: 'learning', label: 'Learning' },
];

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ─── Natural Human Date Helper ─── */
const formatNaturalDate = (dateStr, timeStr) => {
  if (!dateStr) return timeStr ? { label: timeStr, isOverdue: false, isToday: false } : null;
  
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let dayLabel = '';
  let isOverdue = false;
  let isToday = false;

  if (diffDays < 0) {
    dayLabel = `${Math.abs(diffDays)}d ago (overdue)`;
    isOverdue = true;
  } else if (diffDays === 0) {
    dayLabel = 'Today';
    isToday = true;
  } else if (diffDays === 1) {
    dayLabel = 'Tomorrow';
  } else if (diffDays < 7) {
    dayLabel = target.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    dayLabel = target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return {
    label: timeStr ? `${dayLabel} at ${timeStr}` : dayLabel,
    isOverdue,
    isToday,
  };
};

const renderTextWithLinks = (text) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 underline underline-offset-2 break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

/* ─── Vault Card Component ─── */
const BentoVaultCard = ({ item, openEditModal, deleteTask }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const isYellow = item.vaultType === 'note' || !item.vaultType;

  return (
    <div
      className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl transition-all duration-200 group relative flex flex-col justify-between ${
        isYellow ? 'bento-card-yellow' : 'bento-card bg-white dark:bg-[#121620]'
      }`}
    >
      {/* Actions Overlay */}
      <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
          className="p-1.5 rounded-lg bg-black/10 hover:bg-black/20 text-slate-800 dark:text-slate-200 transition-colors backdrop-blur-sm"
          title="Edit Note"
        >
          <Pencil size={11} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); deleteTask(item.id); }}
          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-colors backdrop-blur-sm"
          title="Delete Note"
        >
          <Trash2 size={11} />
        </button>
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-black/10 flex items-center justify-center shrink-0">
            {item.vaultType === 'idea' ? <Lightbulb size={11} /> : item.vaultType === 'learning' ? <Library size={11} /> : <StickyNote size={11} />}
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-70 truncate">
            {item.vaultType || 'Note'}
          </span>
        </div>

        <h4 className="font-bold text-xs sm:text-sm mb-1 leading-tight line-clamp-1">{item.title}</h4>

        {item.audioUrl && (
          <div className="my-1.5 p-1.5 rounded-xl bg-black/10 border border-black/10 flex items-center gap-1.5">
            <Volume2 size={12} className="text-[#483707] dark:text-amber-400 shrink-0" />
            <audio controls src={item.audioUrl} className="h-6 w-full rounded-md" />
          </div>
        )}

        {item.imageUrl && (
          <div
            className="h-20 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden mb-2 cursor-zoom-in relative"
            onClick={() => setIsZoomed(true)}
          >
            <img src={item.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}

        <div className="text-[11px] sm:text-xs leading-relaxed opacity-90 whitespace-pre-wrap font-medium">
          <p className={isExpanded ? '' : 'line-clamp-2 sm:line-clamp-3'}>
            {renderTextWithLinks(item.content)}
          </p>
          {item.content && item.content.length > 70 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 text-[9px] sm:text-[10px] font-bold underline opacity-80 hover:opacity-100"
            >
              {isExpanded ? 'Less' : 'More'}
            </button>
          )}
        </div>
      </div>

      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-lg bg-black/5 hover:bg-black/10 text-[9px] sm:text-[10px] font-bold transition-all w-fit"
        >
          <span className="truncate max-w-[90px]">Link</span>
          <ExternalLink size={9} />
        </a>
      )}

      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <img src={item.imageUrl} alt="Full Preview" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
          <button className="absolute top-6 right-6 p-3 rounded-full bg-white/20 text-white"><X size={20} /></button>
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { operatorName, focusDuration, setFocusDuration } = useSettings();
  const { activities, loading, addActivity, updateActivity, toggleTask, deleteTask, purgeCompleted } = useTasks();

  const [activeTab, setActiveTab] = useState('all');
  const [vaultActiveTab, setVaultActiveTab] = useState('all');
  const [taskSearch, setTaskSearch] = useState('');
  const [vaultSearch, setVaultSearch] = useState('');
  const [quickInput, setQuickInput] = useState('');
  const [currentFolder, setCurrentFolder] = useState(null);
  const [selectedCalendarFilter, setSelectedCalendarFilter] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHubModalOpen, setIsHubModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [portalEditTarget, setPortalEditTarget] = useState(null);
  const [isGithubDismissed, setIsGithubDismissed] = useState(() => localStorage.getItem('nexus_dismiss_github') === 'true');

  // Mini Calendar Date
  const [calDate, setCalDate] = useState(new Date());
  const today = new Date();
  const calDaysInMonth = new Date(calDate.getFullYear(), calDate.getMonth() + 1, 0).getDate();
  const calFirstDay = new Date(calDate.getFullYear(), calDate.getMonth(), 1).getDay();

  const spotifyRef = useRef(null);

  // Timer complete hook
  const handleTimerComplete = () => {
    spotifyRef.current?.pause();
    window.dispatchEvent(new CustomEvent('nexus:trigger-alarm', {
      detail: {
        id: 'pomo-' + Date.now(),
        title: 'Focus Session Complete!',
        type: 'pomodoro',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    }));
  };

  const timer = useTimer(handleTimerComplete);
  const { mode: timerMode, switchMode, isActive: isTimerActive, toggleTimer, resetTimer, formatTime, progressPct } = timer;

  const openCreateModal = useCallback(() => {
    setEditTarget(null);
    setIsModalOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener('nexus:open-create', openCreateModal);
    return () => window.removeEventListener('nexus:open-create', openCreateModal);
  }, [openCreateModal]);

  /* ── Filtered Tasks & Folders ── */
  const queueItems = useMemo(() => {
    const allQueue = (activities || []).filter(a => a.type === 'task' || a.type === 'event' || a.type === 'folder');
    if (currentFolder) {
      return allQueue.filter(a => a.folderId === currentFolder.id);
    } else {
      return allQueue.filter(a => a.type === 'folder' || !a.folderId);
    }
  }, [activities, currentFolder]);

  // Tab counts for badges
  const tabCounts = useMemo(() => {
    return {
      all: queueItems.length,
      task: queueItems.filter(t => t.type === 'task').length,
      event: queueItems.filter(t => t.type === 'event').length,
      folder: queueItems.filter(t => t.type === 'folder').length,
      active: queueItems.filter(t => !t.isCompleted).length,
      done: queueItems.filter(t => t.isCompleted).length,
      high: queueItems.filter(t => t.priority === 'high' && !t.isCompleted).length,
    };
  }, [queueItems]);

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

    if (selectedCalendarFilter) {
      items = items.filter(t => (t.date === selectedCalendarFilter || t.deadlineDate === selectedCalendarFilter));
    }

    if (!taskSearch) return items;
    return items.filter(t =>
      t.title?.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.detail?.toLowerCase().includes(taskSearch.toLowerCase())
    );
  }, [queueItems, activeTab, taskSearch, selectedCalendarFilter]);

  /* ── Portals ── */
  const portals = useMemo(() => {
    const list = (activities || []).filter(a => a.type === 'portal');
    const hasGithub = list.some(p => p.title?.toLowerCase() === 'github');

    if (!hasGithub && !isGithubDismissed) {
      return [{
        id: 'default_github',
        title: 'Github',
        url: 'https://github.com',
        icon: '🚀',
        isDefault: true,
      }, ...list];
    }
    return list;
  }, [activities, isGithubDismissed]);

  /* ── Vault Notes ── */
  const vaultItems = useMemo(() => {
    return (activities || []).filter(a => a.type === 'vault');
  }, [activities]);

  const filteredVault = useMemo(() => {
    let list = vaultItems;
    if (vaultActiveTab !== 'all') {
      list = list.filter(v => v.vaultType === vaultActiveTab);
    }
    if (vaultSearch) {
      list = list.filter(v =>
        v.title?.toLowerCase().includes(vaultSearch.toLowerCase()) ||
        v.content?.toLowerCase().includes(vaultSearch.toLowerCase())
      );
    }
    return list;
  }, [vaultItems, vaultActiveTab, vaultSearch]);

  /* ── Live Stats ── */
  const stats = useMemo(() => {
    const missions = (activities || []).filter(a => a.type === 'task' || a.type === 'event');
    const total = missions.length;
    const completed = missions.filter(t => t.isCompleted).length;
    const pendingTasks = (activities || []).filter(a => a.type === 'task' && !a.isCompleted).length;
    const eventsCount = (activities || []).filter(a => a.type === 'event').length;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, pendingTasks, eventsCount, rate };
  }, [activities]);

  const now = new Date();
  const dayProgressPct = Math.round(((now.getHours() * 60 + now.getMinutes()) / (24 * 60)) * 100);

  /* ── Quick Inline Add Task ── */
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const newTask = {
      type: 'task',
      title: quickInput.trim(),
      priority: 'mid',
      deadlineDate: todayStr,
      deadlineTime: '23:59',
      folderId: currentFolder ? currentFolder.id : null,
      isCompleted: false,
    };

    await addActivity(newTask);
    setQuickInput('');
  };

  /* ── Save handlers ── */
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

  const handleSavePortal = async (data, id) => {
    data.type = 'portal';
    if (id) {
      await updateActivity(id, data);
    } else {
      await addActivity(data);
    }
  };

  const handleDeletePortal = (id) => {
    if (id === 'default_github') {
      setIsGithubDismissed(true);
      localStorage.setItem('nexus_dismiss_github', 'true');
    } else {
      deleteTask(id);
    }
  };

  const timerDisplay = typeof formatTime === 'function' ? formatTime() : (formatTime || '25:00');
  const focusPresets = [15, 25, 45, 60];

  const TABS_WITH_COUNTS = [
    { key: 'all', label: 'All', count: tabCounts.all },
    { key: 'task', label: 'Tasks', count: tabCounts.task },
    { key: 'event', label: 'Events', count: tabCounts.event },
    { key: 'folder', label: 'Folders', count: tabCounts.folder },
    { key: 'active', label: 'Active', count: tabCounts.active },
    { key: 'done', label: 'Done', count: tabCounts.done },
    { key: 'high', label: '🔥 Priority', count: tabCounts.high },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 lg:pb-12 animate-fade-in max-w-[1440px] mx-auto">
      
      {/* ── 1. NATIVE-LIKE HERO APP BAR (HIGH CONTRAST & READABLE) ── */}
      <div className="dashboard-hero p-4 sm:p-6 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl">👋</span>
            <h1 className="text-base sm:text-xl font-bold tracking-tight !text-white">
              {now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'}, {operatorName || currentUser?.displayName?.split(' ')[0] || 'Commander'}
            </h1>
          </div>
          <p className="text-xs !text-slate-300 font-normal">
            {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • <span className="font-semibold !text-white">{stats.pendingTasks} tasks open</span> ({stats.rate}% done)
          </p>

          {/* Day Progress Meter */}
          <div className="pt-1 flex items-center gap-2.5">
            <div className="w-28 sm:w-40 h-1.5 rounded-full bg-black/40 overflow-hidden shadow-inner">
              <div
                style={{ width: `${dayProgressPct}%` }}
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-500"
              />
            </div>
            <span className="text-[10px] font-mono font-medium !text-slate-300">
              Cycle {dayProgressPct}%
            </span>
          </div>
        </div>

        {/* Quick CTA Buttons */}
        <div className="relative z-10 flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => { setEditTarget(null); setIsModalOpen(true); }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-500 !text-white text-xs font-bold shadow-md shadow-blue-500/25 active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>New Mission</span>
          </button>

          <button
            onClick={() => { setEditTarget(null); setIsVaultModalOpen(true); }}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/15 !text-white text-xs font-bold border border-white/20 active:scale-95 transition-all"
          >
            <Library size={14} />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* ── 2. NATIVE MOBILE APP DUAL MATRIX (ON MOBILE: TIMER + STATS SIDE-BY-SIDE) ── */}
      <div className="grid grid-cols-2 gap-3 lg:hidden">
        
        {/* MOBILE FOCUS TIMER TILE */}
        <div className="bento-card p-3.5 bg-white dark:bg-[#121620] border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 capitalize">
              ⏳ {timerMode}
            </span>
            <button
              onClick={() => switchMode(timerMode === 'focus' ? 'break' : 'focus')}
              className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              Mode
            </button>
          </div>

          <div className="py-1 text-center">
            <span className="text-2xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white block">
              {timerDisplay}
            </span>
          </div>

          <div className="flex items-center gap-1 pt-1">
            <button
              onClick={toggleTimer}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 text-[10px] font-bold !text-white shadow-sm active:scale-95 ${
                isTimerActive ? 'bg-amber-500' : 'bg-blue-600'
              }`}
            >
              {isTimerActive ? <Pause size={11} /> : <Play size={11} />}
              <span>{isTimerActive ? 'Pause' : 'Start'}</span>
            </button>
            <button
              onClick={resetTimer}
              className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <RotateCcw size={11} />
            </button>
          </div>
        </div>

        {/* MOBILE VELOCITY STATS TILE (OBSIDIAN DARK) */}
        <div className="dashboard-analytics p-3.5 !text-white flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">
              Velocity
            </span>
            <BarChart3 size={12} className="text-cyan-400" />
          </div>

          <div className="grid grid-cols-2 gap-1 py-1 text-center">
            <div>
              <span className="text-lg font-black font-mono !text-white block leading-none">{stats.total}</span>
              <span className="text-[8px] font-bold !text-slate-400 uppercase">Assigned</span>
            </div>
            <div>
              <span className="text-lg font-black font-mono !text-emerald-400 block leading-none">{stats.completed}</span>
              <span className="text-[8px] font-bold !text-slate-400 uppercase">Done</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[9px] font-bold !text-slate-300 mb-0.5">
              <span>Rate</span>
              <span className="text-cyan-400">{stats.rate}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-black/40 overflow-hidden">
              <div style={{ width: `${stats.rate}%` }} className="h-full striped-cyan" />
            </div>
          </div>
        </div>

      </div>

      {/* ── 3. NATIVE MOBILE SHORTCUTS DOCK (4 COLUMNS) ── */}
      <div className="bento-card p-3 sm:p-4 bg-white dark:bg-[#121620] border border-slate-200/70 dark:border-slate-800 lg:hidden">
        <div className="flex justify-between items-center mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Link2 size={12} className="text-blue-500" />
            <span className="text-[10px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Shortcuts
            </span>
          </div>
          <button
            onClick={() => { setPortalEditTarget(null); setIsHubModalOpen(true); }}
            className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-0.5"
          >
            <Plus size={11} />
            <span>Add</span>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <NavLink
            to="/calendar"
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 transition-all text-center"
          >
            <CalendarDays size={18} className="text-blue-500" />
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1 truncate w-full">Calendar</span>
          </NavLink>

          {portals.slice(0, 3).map((p) => (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 transition-all text-center"
            >
              <span className="text-base">{p.icon || '🔗'}</span>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1 truncate w-full">
                {p.title}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* ── 4. TWO-COLUMN RESPONSIVE BENTO GRID (DESKTOP 8-COL / 4-COL) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        
        {/* ────────────────────────────────────────────────
            LEFT MAIN COLUMN (8 Cols on Desktop): Focus + Tasks + Vault
        ──────────────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          
          {/* A. DESKTOP FOCUS ENGINE (HIDDEN ON MOBILE, USES TOP DUAL TILE) */}
          <div className="hidden lg:block bento-card p-6 bg-white dark:bg-[#121620] border border-slate-200/70 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm">
                  ⏳
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                    Focus Engine & Timer
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Pomodoro Interval Tracker
                  </span>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <button
                  onClick={() => switchMode('focus')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    timerMode === 'focus'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Focus Mode
                </button>
                <button
                  onClick={() => switchMode('break')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    timerMode === 'break'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Break Time
                </button>
              </div>
            </div>

            {/* Countdown & Preset Chips */}
            <div className="flex items-center justify-between gap-4 py-2">
              <div>
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                  {timerDisplay}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    isTimerActive ? 'text-emerald-500 animate-pulse' : 'text-slate-400'
                  }`}>
                    {isTimerActive ? `● ${timerMode} running` : `Standby (${timerMode})`}
                  </span>
                  
                  {/* Presets */}
                  <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-700">
                    {focusPresets.map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setFocusDuration(mins)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                          focusDuration === mins
                            ? 'bg-blue-600 !text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title={`Set focus to ${mins} mins`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTimer}
                  className={`px-6 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold !text-white shadow-md transition-all active:scale-95 ${
                    isTimerActive
                      ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
                      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25'
                  }`}
                >
                  {isTimerActive ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                  <span>{isTimerActive ? 'Pause Timer' : 'Start Focus'}</span>
                </button>

                <button
                  onClick={resetTimer}
                  className="w-11 h-11 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Progress Meter */}
            <div className="mt-4">
              <div className="h-3 rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 overflow-hidden">
                <div
                  style={{ width: `${Math.max(8, progressPct || 0)}%` }}
                  className={`h-full rounded-lg transition-all duration-300 ${
                    timerMode === 'focus' ? 'striped-emerald' : 'striped-orange'
                  }`}
                />
              </div>
            </div>

            {/* Embedded Spotify Mini Player */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Suspense fallback={null}>
                <SpotifyPlayer ref={spotifyRef} />
              </Suspense>
            </div>
          </div>

          {/* B. LIVE MISSIONS QUEUE (RESPONSIVE FOR ALL SCREEN SIZES) */}
          <div className="bento-card p-4 sm:p-6 bg-white dark:bg-[#121620] border border-slate-200/70 dark:border-slate-800">
            {/* Header & Breadcrumb */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Live Mission Queue
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {filteredQueue.length} items
                  </span>
                  {selectedCalendarFilter && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      📅 Date: {selectedCalendarFilter}
                      <button onClick={() => setSelectedCalendarFilter(null)} className="ml-0.5 hover:text-black">✕</button>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">Manage tasks, events, and folders</p>
              </div>

              {currentFolder ? (
                <button
                  onClick={() => setCurrentFolder(null)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                >
                  <ArrowLeft size={12} />
                  <span>Exit {currentFolder.title}</span>
                </button>
              ) : (
                <button
                  onClick={() => { setEditTarget(null); setIsModalOpen(true); }}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>Detailed Mission</span>
                </button>
              )}
            </div>

            {/* INLINE QUICK-ADD INPUT */}
            <form onSubmit={handleQuickAdd} className="mb-3 sm:mb-4">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="⚡ Quick Add: Type mission & press Enter..."
                  className="w-full h-10 sm:h-11 pl-3.5 sm:pl-4 pr-10 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-sm"
                />
                <button
                  type="submit"
                  disabled={!quickInput.trim()}
                  className="absolute right-1.5 p-1.5 rounded-lg sm:rounded-xl bg-blue-600 !text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-blue-500 active:scale-95 transition-all shadow-sm"
                  title="Add Task"
                >
                  <CornerDownLeft size={13} />
                </button>
              </div>
            </form>

            {/* Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
                {TABS_WITH_COUNTS.map((tab) => {
                  const isSelected = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-white !text-white dark:!text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-white/20 dark:bg-slate-900/20 !text-white dark:!text-slate-900'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full sm:w-56">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter missions..."
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  className="w-full h-8 sm:h-9 pl-8 pr-3 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            </div>

            {/* Task Items List */}
            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
              {filteredQueue.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <span className="text-2xl sm:text-3xl block mb-1.5">🎉</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">No active items in queue</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Use the quick add bar above to create a task in 1 second!</p>
                </div>
              ) : (
                filteredQueue.map((item) => {
                  const isFolder = item.type === 'folder';
                  const pConf = priorityConfig[item.priority] || priorityConfig.low;
                  const dateInfo = formatNaturalDate(item.date || item.deadlineDate, item.time || item.deadlineTime);

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      key={item.id}
                      onClick={() => isFolder && setCurrentFolder(item)}
                      className={`dashboard-task-row p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-2 sm:gap-3 group cursor-pointer ${
                        item.isCompleted
                          ? 'bg-slate-50/50 dark:bg-slate-800/20 border-transparent opacity-60'
                          : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/50 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      {/* Left: Checkbox + Title */}
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        {!isFolder ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleTask(item.id); }}
                            className="shrink-0 transition-transform active:scale-75"
                            title={item.isCompleted ? 'Mark uncompleted' : 'Mark completed'}
                          >
                            {item.isCompleted ? (
                              <CheckCircle2 size={18} className="text-emerald-500 fill-emerald-500/20" />
                            ) : (
                              <Circle size={18} className="text-slate-300 dark:text-slate-600 hover:text-blue-500" />
                            )}
                          </button>
                        ) : (
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <Folder size={13} />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <h4 className={`text-xs sm:text-sm font-semibold truncate text-slate-800 dark:text-slate-100 ${
                              item.isCompleted ? 'line-through text-slate-400' : ''
                            }`}>
                              {item.title}
                            </h4>
                            {item.priority && item.priority !== 'low' && !item.isCompleted && (
                              <span className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded border ${pConf.bg} ${pConf.text}`}>
                                {pConf.label}
                              </span>
                            )}
                          </div>
                          
                          {/* Date & Time Badge */}
                          {dateInfo && (
                            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] mt-0.5 font-medium">
                              <span className={`flex items-center gap-1 ${
                                dateInfo.isOverdue && !item.isCompleted
                                  ? 'text-red-500 font-bold'
                                  : dateInfo.isToday
                                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                                  : 'text-slate-400 font-mono'
                              }`}>
                                <Clock size={9} />
                                {dateInfo.label}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions on Hover */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditTarget(item); setIsModalOpen(true); }}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={11} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteTask(item.id); }}
                          className="p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Clear Completed Footer */}
            {stats.completed > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium text-[11px]">{stats.completed} finished</span>
                <button onClick={purgeCompleted} className="text-red-500 hover:underline font-bold text-[11px]">
                  Clear Done
                </button>
              </div>
            )}
          </div>

          {/* C. KNOWLEDGE VAULT & STICKY NOTES STREAM */}
          <div className="bento-card p-4 sm:p-6 bg-white dark:bg-[#121620] border border-slate-200/70 dark:border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Knowledge Vault
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-400">Notes, ideas, and audio memos</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { setEditTarget(null); setIsVaultModalOpen(true); }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg sm:rounded-xl bg-amber-500 !text-white text-[11px] sm:text-xs font-bold hover:bg-amber-600 transition-colors shadow-sm"
                >
                  <Plus size={12} />
                  <span>Note</span>
                </button>
                <NavLink to="/vault" className="text-[11px] sm:text-xs font-bold text-blue-500 hover:underline">
                  All ↗
                </NavLink>
              </div>
            </div>

            {/* Vault Tabs */}
            <div className="flex items-center gap-1 pb-2 mb-3 border-b border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-hide">
              {VAULT_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setVaultActiveTab(tab.key)}
                  className={`px-2.5 py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all ${
                    vaultActiveTab === tab.key
                      ? 'bg-amber-400 text-slate-900 font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 2-Column Responsive Notes Matrix */}
            {filteredVault.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                <p className="text-xs">No notes found in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredVault.slice(0, 4).map((item) => (
                  <BentoVaultCard
                    key={item.id}
                    item={item}
                    openEditModal={(target) => { setEditTarget(target); setIsVaultModalOpen(true); }}
                    deleteTask={deleteTask}
                  />
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ────────────────────────────────────────────────
            RIGHT SIDEBAR COLUMN (4 Cols on Desktop): Portals + Velocity + AI + Mini Calendar
        ──────────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          
          {/* A. DESKTOP QUICK PORTALS (HIDDEN ON MOBILE, SHOWN ON DESKTOP) */}
          <div className="hidden lg:block bento-card p-5 sm:p-6 bg-white dark:bg-[#121620] border border-slate-200/70 dark:border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Link2 size={15} className="text-blue-500" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Quick Portals
                </h3>
              </div>
              <button
                onClick={() => { setPortalEditTarget(null); setIsHubModalOpen(true); }}
                className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-0.5"
              >
                <Plus size={12} />
                <span>Add Hub</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <NavLink
                to="/calendar"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/60 transition-all group text-center"
              >
                <CalendarDays size={20} className="text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1.5 truncate w-full">Calendar</span>
              </NavLink>

              {portals.slice(0, 5).map((p) => (
                <div key={p.id} className="relative group">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/60 transition-all h-full text-center"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{p.icon || '🔗'}</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1.5 truncate w-full">
                      {p.title}
                    </span>
                  </a>
                  {!p.isDefault && (
                    <button
                      onClick={() => handleDeletePortal(p.id)}
                      className="absolute -top-1 -right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* B. DESKTOP MISSION ANALYSIS (HIDDEN ON MOBILE, SHOWN ON DESKTOP) */}
          <div className="hidden lg:block dashboard-analytics p-5 sm:p-6 !text-white">
            <div className="flex justify-between items-center mb-3.5">
              <div>
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block">
                  ANALYSIS
                </span>
                <h3 className="text-sm sm:text-base font-bold !text-white leading-none">
                  Mission Velocity
                </h3>
              </div>
              <BarChart3 size={16} className="text-cyan-400" />
            </div>

            {/* Dual Counters */}
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xl sm:text-2xl font-black font-mono !text-white block">{stats.total}</span>
                <span className="text-[9px] font-bold !text-slate-400 uppercase">Assigned</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xl sm:text-2xl font-black font-mono !text-emerald-400 block">{stats.completed}</span>
                <span className="text-[9px] font-bold !text-slate-400 uppercase">Completed</span>
              </div>
            </div>

            {/* Success Rate Meter */}
            <div className="p-3 rounded-2xl bg-[#12151f] border border-white/5 mb-3">
              <div className="flex justify-between text-xs font-bold !text-slate-300 mb-1.5">
                <span>Completion Rate</span>
                <span className="text-cyan-400">{stats.rate}%</span>
              </div>
              <div className="h-2 rounded-full bg-black/40 overflow-hidden">
                <div style={{ width: `${stats.rate}%` }} className="h-full striped-cyan transition-all duration-700" />
              </div>
            </div>

            {/* Segmented Cyan Equalizer Bars */}
            <div className="rounded-2xl bg-[#11141c] p-3 border border-white/[0.04] mb-3">
              <div className="flex items-end justify-between h-14 gap-1 px-1">
                {[12, 9, 6, 8, 4].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col-reverse gap-1 items-center h-full justify-start">
                    {Array.from({ length: 6 }).map((_, blockIdx) => (
                      <div
                        key={blockIdx}
                        className={`w-full h-1.5 rounded-xs ${
                          blockIdx < Math.ceil((h / 12) * 6)
                            ? 'bg-[#00d4ff] shadow-[0_0_6px_rgba(0,212,255,0.4)]'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <NavLink
              to="/tasks"
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-center text-xs font-bold !text-slate-300 hover:!text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore All Missions</span>
              <ArrowRight size={13} />
            </NavLink>
          </div>

          {/* C. NEXUS AI ASSISTANT WIDGET */}
          <NexusAIWidget />

          {/* D. INTERACTIVE MINI CALENDAR BENTO CARD */}
          <div className="bento-card p-4 sm:p-6 bg-white dark:bg-[#121620] border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-none">Calendar Filter</h4>
                <span className="text-[9px] sm:text-[10px] text-slate-400">Click date to filter</span>
              </div>
              <NavLink to="/calendar" className="text-xs font-bold text-blue-500 hover:underline">
                Full View ↗
              </NavLink>
            </div>

            <div className="flex items-center justify-between mb-2.5">
              <button
                onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1))}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {monthNames[calDate.getMonth()]} {calDate.getFullYear()}
              </span>
              <button
                onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1))}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1.5 text-center text-[9px] sm:text-[10px] font-bold text-slate-400">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <span key={`${d}-${i}`}>{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: calFirstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: calDaysInMonth }).map((_, i) => {
                const d = i + 1;
                const dateStr = `${calDate.getFullYear()}-${String(calDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const isToday =
                  d === today.getDate() &&
                  calDate.getMonth() === today.getMonth() &&
                  calDate.getFullYear() === today.getFullYear();
                const isSelected = selectedCalendarFilter === dateStr;

                return (
                  <div
                    key={d}
                    onClick={() => {
                      setSelectedCalendarFilter(isSelected ? null : dateStr);
                    }}
                    className={`flex items-center justify-center aspect-square rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-900 font-extrabold shadow-md scale-105'
                        : isToday
                        ? 'bg-blue-600 !text-white font-bold shadow-md shadow-blue-500/25'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={isSelected ? 'Clear filter' : `Filter by ${dateStr}`}
                  >
                    {d}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* ── MODALS ── */}
      <Suspense fallback={null}>
        {isModalOpen && (
          <ActivityModal
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); setEditTarget(null); }}
            onSave={handleSaveActivity}
            activity={editTarget}
          />
        )}

        {isHubModalOpen && (
          <AddHubModal
            isOpen={isHubModalOpen}
            onClose={() => setIsHubModalOpen(false)}
            onSave={handleSavePortal}
            portal={portalEditTarget}
          />
        )}

        {isVaultModalOpen && (
          <VaultModal
            isOpen={isVaultModalOpen}
            onClose={() => { setIsVaultModalOpen(false); setEditTarget(null); }}
            onSave={handleSaveActivity}
            initialData={editTarget}
          />
        )}
      </Suspense>
    </div>
  );
}
