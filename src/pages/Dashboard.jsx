import { useState, useMemo, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTasks } from '../hooks/useTasks';
import { useTimer } from '../hooks/useTimer';
import {
  Plus, Trash2, ExternalLink, ChevronLeft, ChevronRight,
  CheckCircle2, Circle, Flame, Clock, Coffee, BarChart3,
  Link2, CalendarDays, RotateCcw, Play, Pause, X, Pencil,
  StickyNote, Lightbulb, Library, Image as ImageIcon, Search, Folder
} from 'lucide-react';

// Lazy load heavy components
const SpotifyPlayer = lazy(() => import('../components/SpotifyPlayer'));
const ActivityModal = lazy(() => import('../components/ActivityModal'));
const AddHubModal = lazy(() => import('../components/AddHubModal'));
const VaultModal = lazy(() => import('../components/VaultModal'));
import NexusAIWidget from '../components/NexusAIWidget';

const TaskIcon = ({ size = 16, className = "" }) => (
  <img
    src="/task.svg"
    alt="Task"
    style={{ width: size, height: size }}
    className={`invert brightness-0 invert-[1] ${className}`}
  />
);

/* ─── tiny helpers ─── */
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

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

const VAULT_TABS = [
  { key: 'all', label: 'All' },
  { key: 'note', label: 'Notes' },
  { key: 'idea', label: 'Ideas' },
  { key: 'learning', label: 'Learning' },
];

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ─── Link Detection Helper ─── */
const renderTextWithLinks = (text) => {
  if (!text) return null;
  // Simple regex to catch common http/https links
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
          className="text-blue-400 hover:text-blue-300 underline underline-offset-2 break-all decoration-blue-500/30"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

/* ─── VaultCard Component for Expandable Text ─── */
const VaultCard = ({ item, openEditModal, deleteTask }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const textRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      const check = () => {
        if (textRef.current) {
          setIsTruncated(textRef.current.scrollHeight > textRef.current.clientHeight);
        }
      };
      check();
      window.addEventListener('resize', check);
      return () => window.removeEventListener('resize', check);
    }
  }, [item.content]);

  return (
    <div className="group relative bg-[var(--bg-deep)] border border-[var(--border-soft)] rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all h-fit">

      {/* Actions Overlay */}
      <div className="absolute top-3 right-3 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <button
          onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
          className="p-2 bg-white/10 backdrop-blur-md border border-white/20 text-blue-400 hover:bg-blue-400 hover:text-white rounded-xl transition-all shadow-lg"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); deleteTask(item.id); }}
          className="p-2 bg-white/10 backdrop-blur-md border border-white/20 text-red-400 hover:bg-red-400 hover:text-white rounded-xl transition-all shadow-lg"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {item.imageUrl && (
        <div className="h-40 overflow-hidden cursor-zoom-in" onClick={() => setIsZoomed(true)}>
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl flex-shrink-0">
              {item.vaultType === 'idea' ? <Lightbulb size={16} /> : item.vaultType === 'learning' ? <Library size={16} /> : <StickyNote size={16} />}
            </span>
            <h4 className="font-bold text-sm break-all text-[var(--text-main)] leading-tight flex-1">{item.title}</h4>
          </div>
        </div>

        <div className="relative">
          <p
            ref={textRef}
            className={`text-xs text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap transition-all duration-300 ${isExpanded ? '' : 'line-clamp-3'}`}
          >
            {renderTextWithLinks(item.content)}
          </p>
          {(isTruncated || isExpanded) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2.5 px-3 py-1 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-lg text-[10px] font-bold text-indigo-400 transition-all border border-indigo-500/10"
            >
              {isExpanded ? 'Show Less ↑' : 'Read More ↓'}
            </button>
          )}
        </div>

        {item.url && (
          <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 bg-slate-800/50 rounded-lg text-[10px] font-bold text-indigo-400 hover:bg-slate-800 transition-all border border-slate-700/50">
            Open Resource <ExternalLink size={10} />
          </a>
        )}
      </div>

      {/* Full Screen Zoom Overlay */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-[1200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 lg:p-12 animate-fade-in cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <img
            src={item.imageUrl}
            alt="Full Preview"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scale-up"
          />
          <button className="absolute top-10 right-10 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all">
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { operatorName } = useSettings();
  const { activities, loading, addActivity, updateActivity, toggleTask, deleteTask, purgeCompleted, addPortal } = useTasks();

  const [activeTab, setActiveTab] = useState('all');
  const [vaultActiveTab, setVaultActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHubModalOpen, setIsHubModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [portalEditTarget, setPortalEditTarget] = useState(null);
  const [isGithubDismissed, setIsGithubDismissed] = useState(() => localStorage.getItem('nexus_dismiss_github') === 'true');
  const [vaultSearch, setVaultSearch] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const [currentFolder, setCurrentFolder] = useState(null);
  const spotifyRef = useRef(null);

  // Mini Calendar
  const [calDate, setCalDate] = useState(new Date());
  const today = new Date();
  const calDaysInMonth = new Date(calDate.getFullYear(), calDate.getMonth() + 1, 0).getDate();
  const calFirstDay = new Date(calDate.getFullYear(), calDate.getMonth(), 1).getDay();

  // Listen to FAB event from RootLayout
  const openModal = useCallback(() => {
    setEditTarget(null);
    setIsModalOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener('nexus:open-create', openModal);
    return () => window.removeEventListener('nexus:open-create', openModal);
  }, [openModal]);

  const handleTimerComplete = () => {
    spotifyRef.current?.pause();
    window.dispatchEvent(new CustomEvent('nexus:trigger-alarm', {
      detail: {
        id: 'pomo-' + Date.now(),
        title: timerMode === 'focus' ? 'Focus Session Complete!' : 'Break Time Over!',
        type: 'pomodoro',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    }));
  };

  const { mode: timerMode, switchMode, isActive, toggleTimer, resetTimer, formatTime, progressPct } =
    useTimer(handleTimerComplete);

  const queueItems = useMemo(() => {
    const allQueue = (activities || []).filter(a => a.type === 'task' || a.type === 'event' || a.type === 'folder');
    
    if (currentFolder) {
      // Inside a folder: show only items belonging to this folder
      return allQueue.filter(a => a.folderId === currentFolder.id);
    } else {
      // Root level: show folders and tasks that ARE NOT inside any folder
      return allQueue.filter(a => a.type === 'folder' || !a.folderId);
    }
  }, [activities, currentFolder]);
  const portals = useMemo(() => {
    const list = (activities || []).filter(a => a.type === 'portal');
    const hasGithub = list.some(p => p.title?.toLowerCase() === 'github');

    if (!hasGithub && !isGithubDismissed) {
      return [{
        id: 'default_github',
        title: 'Github',
        url: 'https://github.com',
        icon: '/github.svg',
        type: 'portal',
        isDefault: true
      }, ...list];
    }
    return list;
  }, [activities, isGithubDismissed]);
  const vaultItems = useMemo(() =>
    (activities || []).filter(a => a.type === 'vault'),
    [activities]
  );

  const dashboardVault = useMemo(() => {
    return [...vaultItems].reverse().slice(0, 4);
  }, [vaultItems]);

  const upcomingMissions = useMemo(() => {
    return (activities || [])
      .filter(m => !m.isCompleted && (m.type === 'task' || m.type === 'event'))
      .sort((a, b) => {
        const dateA = a.deadlineDate || a.date || '2099-12-31';
        const dateB = b.deadlineDate || b.date || '2099-12-31';
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        const timeA = a.deadlineTime || a.time || '23:59';
        const timeB = b.deadlineTime || b.time || '23:59';
        return timeA.localeCompare(timeB);
      })
      .slice(0, 5);
  }, [activities]);

  const stats = useMemo(() => {
    const missions = queueItems.filter(a => a.type === 'task' || a.type === 'event');
    const total = missions.length;
    const completed = missions.filter(t => t.isCompleted).length;

    // Breakdown
    const tasks = missions.filter(m => m.type === 'task');
    const events = missions.filter(m => m.type === 'event');
    const pendingTasks = tasks.filter(t => !t.isCompleted).length;
    const completedTasks = tasks.filter(t => t.isCompleted).length;

    return {
      total,
      completed,
      pending: total - completed,
      rate: total === 0 ? 0 : Math.round((completed / total) * 100),
      tasksCount: tasks.length,
      eventsCount: events.length,
      pendingTasks,
      completedTasks
    };
  }, [queueItems]);



  const dayPct = Math.round((today.getHours() / 24) * 100);
  const displayName = operatorName || currentUser?.displayName || 'there';

  const handleSaveActivity = async (data, id) => {
    if (id) {
      await updateActivity(id, data);
    } else {
      // If we are inside a folder, attach the folderId to the new activity
      if (currentFolder) {
        data.folderId = currentFolder.id;
      }
      await addActivity(data);
    }
  };

  const handleSavePortal = async (data, id) => {
    if (id === 'default_github') {
      // Promoting default to real entry
      await addPortal(data);
      localStorage.setItem('nexus_dismiss_github', 'true');
      setIsGithubDismissed(true);
    } else if (id) {
      await updateActivity(id, data);
    } else {
      await addPortal(data);
    }
  };

  const handleDeletePortal = async (id) => {
    if (id === 'default_github') {
      localStorage.setItem('nexus_dismiss_github', 'true');
      setIsGithubDismissed(true);
    } else {
      await deleteTask(id);
    }
  };

  const openEditModal = (item) => {
    setEditTarget(item);
    if (item.type === 'vault') {
      setIsVaultModalOpen(true);
    } else if (item.type === 'portal') {
      setPortalEditTarget(item);
      setIsHubModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const card = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '18px', boxShadow: 'var(--shadow-card)' };
  const cardDeep = { backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border-soft)', borderRadius: '12px' };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-28 lg:pb-4 animate-fade-in">

      {/* ════════════════ LEFT COL ════════════════ */}
      <section className="lg:col-span-3 space-y-4">

        {/* ── Greeting Hero Card (Restored Blue) ── */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: '18px',
          boxShadow: '0 8px 32px rgba(59,130,246,0.35)',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>{greeting()},</p>
          <h2 className="truncate" style={{ color: '#fff', fontSize: '26px', fontWeight: 800, lineHeight: 1.2, marginBottom: '4px' }}>{displayName} 👋</h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', marginBottom: '16px' }}>What's on the menu today?</p>

          {/* ── TODAY'S OUTLOOK (Inline) ── */}
          <div className="flex flex-col gap-2 mb-6">
            {upcomingMissions.length > 0 ? (
              upcomingMissions.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 w-full animate-fade-in shadow-sm" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${m.type === 'event' ? 'bg-indigo-400/30' : 'bg-blue-400/30'}`}>
                    {m.type === 'event' ? <CalendarDays size={14} className="text-white" /> : <TaskIcon size={14} className="brightness-200" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-white break-all leading-tight mb-1">{m.title}</p>
                    <p className="text-[9px] font-medium text-white/50 truncate flex items-center gap-1">
                      <CalendarDays size={8} /> {m.deadlineDate || m.date || 'Today'} • <Clock size={8} /> {m.deadlineTime || m.time || 'Anytime'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl border border-white/10 opacity-60 w-fit">
                <CheckCircle2 size={12} className="text-white" />
                <p className="text-[10px] font-bold text-white uppercase tracking-wider">All missions cleared</p>
              </div>
            )}
          </div>

          <p style={{ color: '#fff', fontSize: '34px', fontWeight: 300, fontFamily: '"Space Mono", monospace', letterSpacing: '0.05em', marginBottom: '16px' }}>
            {today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <div>
            <div style={{ height: '5px', borderRadius: '99px', background: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${dayPct}%`, background: '#fff', borderRadius: '99px', transition: 'width 1s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px', fontWeight: 500 }}>Day progress</span>
              <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>{dayPct}%</span>
            </div>
          </div>
        </div>

        {/* ── Focus Timer ── */}
        <div style={card} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '14px' }}>Focus Timer</p>
            <Clock size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="flex gap-1.5 mb-5 p-1 rounded-xl" style={cardDeep}>
            {['focus', 'break'].map(m => (
              <button key={m} onClick={() => switchMode(m)} className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all capitalize"
                style={timerMode === m ? { background: '#3b82f6', color: '#fff' } : { color: 'var(--text-muted)' }}>{m}</button>
            ))}
          </div>

          <div className="flex justify-center mb-5">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="72" cy="72" r="64" fill="none" strokeWidth="6" style={{ stroke: 'var(--border)' }} />
                <circle cx="72" cy="72" r="64" fill="none" strokeWidth="6" stroke="#3b82f6" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 64}
                  strokeDashoffset={2 * Math.PI * 64 * (1 - progressPct / 100)}
                  className="transition-all duration-1000"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.6))' }}
                />
              </svg>
              <div className="text-center z-10">
                <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '30px', fontWeight: 300, color: 'var(--text-main)', letterSpacing: '0.05em' }}>{formatTime}</p>
                <p className="text-xs font-semibold mt-1" style={{ color: isActive ? '#ef4444' : '#22c55e' }}>{isActive ? '● Active' : '○ Standby'}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={toggleTimer} className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={{ background: isActive ? 'rgba(239,68,68,0.12)' : '#3b82f6', color: isActive ? '#ef4444' : '#fff' }}>
              {isActive ? 'Pause' : 'Start'}
            </button>
            <button onClick={resetTimer} className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] bg-[var(--bg-deep)] transition-all">
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Audio */}
        <div style={card} className="p-4">
          <p style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>Nexus Music Player</p>
          <Suspense fallback={<div className="h-[152px] animate-pulse bg-white/5 rounded-xl" />}>
            <SpotifyPlayer ref={spotifyRef} />
          </Suspense>
        </div>

        {/* ── MOBILE ONLY: Portals & Stats (Interactive) ── */}
        <div className={`lg:hidden flex ${isStatsExpanded ? 'flex-col' : 'flex-row'} gap-3 px-1 transition-all duration-300`}>
          {/* Quick Portals Minimal */}
          <div style={card} className={`p-3.5 flex flex-col transition-all duration-300 ${isStatsExpanded ? 'w-full' : 'w-1/2'}`}>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-bold text-[var(--text-main)] uppercase tracking-wider">Portals</p>
              <Link2 size={12} className="text-[var(--text-muted)]" />
            </div>
            <div className={`grid ${isStatsExpanded ? 'grid-cols-4' : 'grid-cols-2'} gap-2`}>
              <NavLink to="/calendar" className="flex flex-col items-center justify-center p-2 bg-[var(--bg-deep)] border border-[var(--border-soft)] rounded-xl">
                <CalendarDays size={16} className="text-[var(--text-muted)]" />
                <span className="text-[8px] font-bold mt-1 text-[var(--text-muted)]">Cal</span>
              </NavLink>
              {portals.slice(0, isStatsExpanded ? 6 : 2).map(p => (
                <div key={p.id} className="relative group">
                  <a href={p.url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-2 bg-[var(--bg-deep)] border border-[var(--border-soft)] rounded-xl h-full">
                    {p.icon?.includes('/') ? <img src={p.icon} className="w-4 h-4 object-contain invert" /> : <span className="text-sm">{p.icon || '🔗'}</span>}
                    <span className="text-[8px] font-bold truncate mt-1 w-full text-center">{p.title || 'Link'}</span>
                  </a>
                  <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(p)} className="bg-blue-500 text-white rounded-full p-1 shadow-md"><Pencil size={8} /></button>
                    <button onClick={() => handleDeletePortal(p.id)} className="bg-red-500 text-white rounded-full p-1 shadow-md"><X size={8} /></button>
                  </div>
                </div>
              ))}
              <button onClick={() => { setPortalEditTarget(null); setIsHubModalOpen(true); }} className="flex flex-col items-center justify-center p-2 bg-[var(--bg-deep)] border border-dashed border-[var(--border)] rounded-xl">
                <Plus size={16} className="text-[var(--text-faint)]" />
              </button>
            </div>
          </div>

          {/* Mission Stats Minimal (Expandable) */}
          <div
            style={card}
            className={`p-3.5 flex flex-col transition-all duration-500 overflow-hidden ${isStatsExpanded ? 'w-full' : 'w-1/2'}`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-bold text-[var(--text-main)] uppercase tracking-wider">Missions</p>
              <button onClick={() => setIsStatsExpanded(!isStatsExpanded)} className="p-1 hover:bg-white/5 rounded-md transition-colors text-blue-500">
                {isStatsExpanded ? <div className="text-[9px] font-bold">Collapse ↑</div> : <BarChart3 size={12} />}
              </button>
            </div>

            {!isStatsExpanded ? (
              <div className="flex flex-col gap-2 animate-fade-in" onClick={() => setIsStatsExpanded(true)}>
                <div className="flex gap-2">
                  <div className="flex-1 p-2 bg-[var(--bg-deep)] border border-[var(--border-soft)] rounded-xl text-center">
                    <p className="text-sm font-black text-[var(--text-main)]">{stats.total}</p>
                    <p className="text-[7px] font-bold text-[var(--text-faint)] uppercase tracking-tighter">Total</p>
                  </div>
                  <div className="flex-1 p-2 bg-[var(--bg-deep)] border border-[var(--border-soft)] rounded-xl text-center">
                    <p className="text-sm font-black text-green-500">{stats.completed}</p>
                    <p className="text-[7px] font-bold text-[var(--text-faint)] uppercase tracking-tighter">Done</p>
                  </div>
                </div>
                <div className="h-1 bg-[var(--bg-deep)] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${stats.rate}%` }} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 animate-fade-in-up py-1">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <p className="text-2xl font-black text-blue-500 tracking-tighter">{stats.rate}%</p>
                    <p className="text-[9px] font-bold opacity-40 uppercase">Efficiency</p>
                  </div>
                  <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${stats.rate}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-2 text-[8px] font-bold text-[var(--text-faint)]">
                    <span className="flex items-center gap-1">● {stats.pending} Pending</span>
                    <span className="flex items-center gap-1 text-green-500">✔ {stats.completed} Done</span>
                  </div>
                </div>
                <div className="bg-[var(--bg-deep)] rounded-2xl p-3 border border-[var(--border-soft)] flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-bold uppercase text-[var(--text-muted)]">Breakdown</span>
                    <TaskIcon size={10} className="opacity-50" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-[var(--text-muted)]">Tasks</span>
                      <span className="text-[var(--text-main)]">{stats.tasksCount}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-[var(--text-muted)]">Events</span>
                      <span className="text-[var(--text-main)]">{stats.eventsCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </section>

      {/* ════════════════ CENTER COL ════════════════ */}
      <section className="lg:col-span-6 space-y-5 flex flex-col">

        {/* ── Missions Snapshot (Center Column) ── */}
        <div style={{ ...card, padding: '24px', display: 'flex', flexDirection: 'column' }} className="flex-1">
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-[var(--border)]">
            <div>
              <h2 style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '16px' }}>Upcoming Missions</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                Your top {upcomingMissions.length} priority objectives
              </p>
            </div>
            <NavLink 
              to="/tasks" 
              className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl text-xs font-bold transition-all border border-blue-500/20"
            >
              Full View ↗
            </NavLink>
          </div>

          <div className="flex-1 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
              </div>
            ) : upcomingMissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm font-medium">All objectives secured.</p>
              </div>
            ) : (
              upcomingMissions.map(item => {
                const p = item.type === 'task' ? (priorityConfig[item.priority] || priorityConfig.mid) : null;
                return (
                  <div key={item.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--bg-deep)] border border-[var(--border-soft)] group transition-all">
                    <button 
                      onClick={() => toggleTask(item.id, item.isCompleted)} 
                      className="mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center bg-transparent flex-shrink-0"
                      style={{ borderColor: p?.dot === 'bg-red-500' ? '#ef4444' : 'var(--border)' }}
                    >
                      {item.isCompleted && <div className="w-2 h-2 rounded-full bg-green-500" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold break-all text-[var(--text-main)] leading-tight">
                          {item.title}
                        </p>
                        {item.type === 'task' && p && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider"
                            style={{ background: item.priority === 'high' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)', color: item.priority === 'high' ? '#ef4444' : '#22c55e' }}>
                            {p.label}
                          </span>
                        )}
                      </div>
                      {item.detail && <p className="text-[10px] text-[var(--text-muted)] truncate mt-1">{item.detail}</p>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Nexus Vault Snapshot ── */}
        <div style={{ ...card, padding: '24px', display: 'flex', flexDirection: 'column' }} className="flex-1">
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-[var(--border)]">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Recent Vault Captures
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">Your latest deposits</p>
            </div>
            <NavLink 
              to="/vault" 
              className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold transition-all border border-indigo-500/20"
            >
              Full View ↗
            </NavLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto">
            {loading ? (
              <div className="col-span-2 flex items-center justify-center h-32">
                <div className="w-6 h-6 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
              </div>
            ) : dashboardVault.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center opacity-40 border border-dashed border-[var(--border)] rounded-xl">
                <p className="text-xs font-bold">Vault is empty</p>
              </div>
            ) : (
              dashboardVault.map(item => (
                <div key={item.id} className="p-3.5 bg-[var(--bg-deep)] border border-[var(--border-soft)] rounded-xl hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg flex-shrink-0">
                      {item.vaultType === 'idea' ? <Lightbulb size={12} /> : item.vaultType === 'learning' ? <Library size={12} /> : <StickyNote size={12} />}
                    </span>
                    <h4 className="font-bold text-xs truncate text-[var(--text-main)] flex-1">{item.title}</h4>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">{item.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ════════════════ RIGHT COL ════════════════ */}
      <section className="lg:col-span-3 space-y-4">

        {/* ── DESKTOP ONLY: Standard Portals & Stats (Above Calendar) ── */}
        <div className="hidden lg:flex flex-col gap-4">

          {/* Quick Portals Standard */}
          <div style={card} className="p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">Quick Portals</p>
              <Link2 size={16} className="text-[var(--text-muted)]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NavLink to="/calendar" className="flex flex-col items-center justify-center p-3.5 bg-[var(--bg-deep)] border border-[var(--border-soft)] rounded-xl group hover:border-blue-500/30 transition-all">
                <CalendarDays size={20} className="text-[var(--text-muted)] group-hover:text-blue-500" />
                <span className="text-xs font-bold mt-2 text-[var(--text-muted)]">Calendar</span>
              </NavLink>
              {portals.map(p => (
                <div key={p.id} className="relative group">
                  <a href={p.url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-3.5 bg-[var(--bg-deep)] border border-[var(--border-soft)] rounded-xl h-full hover:border-blue-500/30 transition-all">
                    {p.icon?.includes('/') ? <img src={p.icon} className="w-5 h-5 object-contain" /> : <span className="text-lg">{p.icon || '🔗'}</span>}
                    <span className="text-xs font-bold truncate mt-2 w-full text-center">{p.title || 'Link'}</span>
                  </a>
                  <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(p)} className="bg-blue-500 text-white rounded-full p-1.5 shadow-md transition-transform hover:scale-110"><Pencil size={12} /></button>
                    <button onClick={() => handleDeletePortal(p.id)} className="bg-red-500 text-white rounded-full p-1.5 shadow-md transition-transform hover:scale-110"><X size={12} /></button>
                  </div>
                </div>
              ))}
              <button onClick={() => { setPortalEditTarget(null); setIsHubModalOpen(true); }} className="flex flex-col items-center justify-center p-3.5 bg-[var(--bg-deep)] border border-dashed border-[var(--border)] rounded-xl hover:border-blue-500/30 transition-all">
                <Plus size={20} className="text-[var(--text-muted)]" />
                <span className="text-xs font-bold mt-2 text-[var(--text-faint)]">Add Hub</span>
              </button>
            </div>
          </div>

          {/* NEXUS AI WIDGET */}
          <NexusAIWidget />

          {/* Mission Stats Standard */}
          <div style={card} className="p-5 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">Mission Analysis</p>
                <p className="text-[10px] text-[var(--text-muted)] font-medium">Performance tracking</p>
              </div>
              <BarChart3 size={18} className="text-blue-500" />
            </div>

            <div className="space-y-5">
              {/* Primary Counter */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-[var(--bg-deep)] border border-[var(--border-soft)] rounded-2xl">
                  <p className="text-2xl font-black text-[var(--text-main)] tracking-tight">{stats.total}</p>
                  <p className="text-[10px] font-bold text-[var(--text-faint)] uppercase mt-0.5">Assigned</p>
                </div>
                <div className="p-4 bg-[var(--bg-deep)] border border-[var(--border-soft)] rounded-2xl">
                  <p className="text-2xl font-black text-green-500 tracking-tight">{stats.completed}</p>
                  <p className="text-[10px] font-bold text-[var(--text-faint)] uppercase mt-0.5">Successful</p>
                </div>
              </div>

              {/* Progress Detail */}
              <div className="bg-[var(--bg-deep)] p-4 rounded-2xl border border-[var(--border-soft)]">
                <div className="flex justify-between text-[11px] font-bold text-[var(--text-muted)] mb-2.5 uppercase tracking-wide">
                  <span>Completion Rate</span>
                  <span className="text-blue-500">{stats.rate}%</span>
                </div>
                <div className="h-2 bg-black/20 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000" style={{ width: `${stats.rate}%` }} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold text-[var(--text-muted)]">{stats.pendingTasks} Tasks Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-bold text-[var(--text-muted)]">{stats.eventsCount} Events Total</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Mini Calendar */}
        <div style={card} className="p-5 hidden lg:block">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-bold text-[var(--text-main)]">Calendar</p>
            <NavLink to="/calendar" className="text-[11px] font-bold text-blue-500 hover:underline">Full View ↗</NavLink>
          </div>
          <div className="flex items-center justify-between mb-3 px-1">
            <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1))} className="p-1 hover:bg-[var(--bg-deep)] rounded-md"><ChevronLeft size={14} /></button>
            <p className="text-[12px] font-bold">{monthNames[calDate.getMonth()]} {calDate.getFullYear()}</p>
            <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1))} className="p-1 hover:bg-[var(--bg-deep)] rounded-md"><ChevronRight size={14} /></button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={`${d}-${i}`} className="text-center text-[9px] font-bold text-[var(--text-faint)]">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: calFirstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: calDaysInMonth }).map((_, i) => {
              const d = i + 1;
              const isToday = d === today.getDate() && calDate.getMonth() === today.getMonth() && calDate.getFullYear() === today.getFullYear();
              return (
                <div key={d} className={`flex items-center justify-center aspect-square rounded-full text-[10px] ${isToday ? 'bg-blue-500 text-white font-bold shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--bg-deep)]'}`}>
                  {d}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modals - Lazy Loaded for Memory Efficiency */}
      <Suspense fallback={null}>
        {isModalOpen && (
          <ActivityModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
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
            onClose={() => setIsVaultModalOpen(false)}
            onSave={handleSaveActivity}
            activity={editTarget}
          />
        )}
      </Suspense>
    </div>
  );
}
