import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTasks } from '../hooks/useTasks';
import { useTimer } from '../hooks/useTimer';
import SpotifyPlayer from '../components/SpotifyPlayer';
import ActivityModal from '../components/ActivityModal';
import AddHubModal from '../components/AddHubModal';
import VaultModal from '../components/VaultModal';
import {
  Plus, Trash2, ExternalLink, ChevronLeft, ChevronRight,
  CheckCircle2, Circle, Flame, Clock, Coffee, BarChart3,
  Link2, CalendarDays, RotateCcw, Play, Pause, X, Pencil,
  StickyNote, Lightbulb, Library, Image as ImageIcon, Search, Zap
} from 'lucide-react';

/* ─── tiny helpers ─── */
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const priorityConfig = {
  high: { label: 'High',   dot: 'bg-red-500',    text: 'text-red-500',    ring: 'border-red-500/40',  bg: 'bg-red-500/8' },
  mid:  { label: 'Mid',    dot: 'bg-yellow-500', text: 'text-yellow-500', ring: 'border-yellow-500/40',bg: 'bg-yellow-500/8' },
  low:  { label: 'Low',    dot: 'bg-green-500',  text: 'text-green-500',  ring: 'border-green-500/40', bg: 'bg-green-500/8' },
};

const TABS = [
  { key: 'all',    label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'done',   label: 'Done' },
  { key: 'high',   label: '🔥 Priority' },
  { key: 'task',   label: 'Tasks' },
  { key: 'event',  label: 'Events' },
];

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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
  const textRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      // Small delay to ensure browser has rendered the layout
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
      {item.imageUrl && (
        <div className="h-40 overflow-hidden cursor-zoom-in" onClick={() => window.open(item.imageUrl, '_blank')}>
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl flex-shrink-0">
               {item.vaultType === 'idea' ? <Lightbulb size={16} /> : item.vaultType === 'learning' ? <Library size={16} /> : <StickyNote size={16} />}
            </span>
            <h4 className="font-bold text-sm truncate text-[var(--text-main)]">{item.title}</h4>
          </div>
          <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
            <button onClick={() => openEditModal(item)} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"><Pencil size={14} /></button>
            <button onClick={() => deleteTask(item.id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
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
    </div>
  );
};

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { operatorName } = useSettings();
  const { activities, loading, addActivity, updateActivity, toggleTask, deleteTask, purgeCompleted, addPortal } = useTasks();

  const [activeTab, setActiveTab]       = useState('all');
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [isHubModalOpen, setIsHubModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [vaultSearch, setVaultSearch] = useState('');
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

  const queueItems = useMemo(() =>
    (activities || []).filter(a => a.type === 'task' || a.type === 'event'),
    [activities]
  );
  const portals = useMemo(() =>
    (activities || []).filter(a => a.type === 'portal'),
    [activities]
  );
  const vaultItems = useMemo(() =>
    (activities || []).filter(a => a.type === 'vault'),
    [activities]
  );

  const filteredVault = useMemo(() => {
    if (!vaultSearch) return vaultItems;
    return vaultItems.filter(v => 
      v.title.toLowerCase().includes(vaultSearch.toLowerCase()) || 
      v.content?.toLowerCase().includes(vaultSearch.toLowerCase())
    );
  }, [vaultItems, vaultSearch]);

  const filteredQueue = useMemo(() => {
    switch (activeTab) {
      case 'active': return queueItems.filter(t => !t.isCompleted);
      case 'done':   return queueItems.filter(t => t.isCompleted);
      case 'high':   return queueItems.filter(t => t.priority === 'high' && !t.isCompleted);
      case 'task':   return queueItems.filter(t => t.type === 'task');
      case 'event':  return queueItems.filter(t => t.type === 'event');
      default:       return queueItems;
    }
  }, [queueItems, activeTab]);

  const stats = useMemo(() => {
    const missions = queueItems.filter(a => a.type === 'task' || a.type === 'event');
    const total = missions.length;
    const completed = missions.filter(t => t.isCompleted).length;
    return { total, completed, rate: total === 0 ? 0 : Math.round((completed / total) * 100) };
  }, [queueItems]);

  // ── ANALYSIS: NEXUS PULSE (Last 7 Days) ──
  const pulseData = useMemo(() => {
    const days = [6, 5, 4, 3, 2, 1, 0].map(d => {
      const date = new Date();
      date.setDate(date.getDate() - d);
      return date.toDateString();
    });
    
    // Count completions per day
    const completedMissions = queueItems.filter(t => t.isCompleted && (t.deadlineDate || t.date));
    const counts = days.map(d => {
      return completedMissions.filter(m => {
        const mDate = new Date(m.deadlineDate || m.date);
        return mDate.toDateString() === d;
      }).length;
    });

    const max = Math.max(...counts, 1);
    return counts.map(c => Math.round((c / max) * 100));
  }, [queueItems]);

  const dayPct = Math.round((today.getHours() / 24) * 100);
  const displayName = operatorName || currentUser?.displayName || 'there';

  const handleSaveActivity = async (data, id) => {
    if (id) {
      await updateActivity(id, data);
    } else {
      await addActivity(data);
    }
  };

  const openEditModal = (item) => {
    setEditTarget(item);
    if (item.type === 'vault') {
      setIsVaultModalOpen(true);
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
          {/* ── NEXUS PULSE GRAPH (Top Right) ── */}
          <div className="absolute top-5 right-6 flex items-end gap-1.5 h-16 opacity-40">
            {pulseData.map((h, i) => (
              <div 
                key={i} 
                className="w-1.5 bg-white/40 rounded-full transition-all duration-700"
                style={{ 
                  height: `${Math.max(10, h)}%`, 
                  boxShadow: '0 0 10px rgba(255,255,255,0.4)',
                  animation: 'grow 1.5s ease-out'
                }} 
              />
            ))}
          </div>

          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>{greeting()},</p>
          <h2 style={{ color: '#fff', fontSize: '26px', fontWeight: 800, lineHeight: 1.2, marginBottom: '4px' }}>{displayName} 👋</h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', marginBottom: '20px' }}>What's on the menu today?</p>
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
          <p style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>Focus Audio</p>
          <SpotifyPlayer ref={spotifyRef} />
        </div>

        {/* ── MOBILE OPTIMIZED SECTION: Portals & Stats (Always side-by-side) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          
          {/* Minimal Quick Portals */}
          <div style={card} className="p-3.5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-[var(--text-main)] uppercase tracking-wider">Portals</p>
              <Link2 size={12} className="text-[var(--text-muted)]" />
            </div>
            <div className="grid grid-cols-2 gap-2 flex-1">
              <NavLink to="/calendar" className="flex flex-col items-center justify-center p-2 bg-[var(--bg-deep)] border border-[var(--border-soft)] rounded-xl group hover:border-blue-500/30">
                <img src="/calendar.svg" alt="" className="w-5 h-5 opacity-70 group-hover:opacity-100 invert" />
                <span className="text-[8px] font-bold mt-1 text-[var(--text-muted)]">Cal</span>
              </NavLink>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-2 bg-[var(--bg-deep)] border border-[var(--border-soft)] rounded-xl group hover:border-blue-500/30">
                <img src="/github.svg" alt="" className="w-5 h-5 opacity-70 group-hover:opacity-100 invert" />
                <span className="text-[8px] font-bold mt-1 text-[var(--text-muted)]">Git</span>
              </a>
              {portals.slice(0, 1).map(p => (
                <div key={p.id} className="relative group">
                  <a href={p.url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-2 bg-[var(--bg-deep)] border border-[var(--border-soft)] rounded-xl h-full hover:border-blue-500/30">
                    {p.icon?.includes('/') ? <img src={p.icon} className="w-5 h-5 object-contain" /> : <span className="text-base">{p.icon || '🔗'}</span>}
                    <span className="text-[8px] font-bold truncate mt-1 w-full text-center">{p.name || 'Link'}</span>
                  </a>
                  <button onClick={() => deleteTask(p.id)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 shadow-md"><X size={10} /></button>
                </div>
              ))}
              <button onClick={() => setIsHubModalOpen(true)} className="flex flex-col items-center justify-center p-2 bg-[var(--bg-deep)] border border-dashed border-[var(--border)] rounded-xl hover:border-blue-500/30">
                <span className="text-base text-[var(--text-muted)]">+</span>
                <span className="text-[8px] font-bold mt-1 text-[var(--text-faint)]">Add</span>
              </button>
            </div>
          </div>

          {/* Minimal Mission Stats */}
          <div style={card} className="p-3.5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-[var(--text-main)] uppercase tracking-wider">Missions</p>
              <BarChart3 size={12} className="text-[var(--text-muted)]" />
            </div>
            <div className="flex-1 flex flex-col justify-center gap-2">
              <div className="flex gap-2">
                <div className="flex-1 p-2 bg-[var(--bg-deep)] border border-[var(--border-soft)] rounded-xl text-center">
                  <p className="text-sm font-black text-[var(--text-main)]">{stats.total}</p>
                  <p className="text-[7px] font-bold text-[var(--text-faint)] uppercase">Total</p>
                </div>
                <div className="flex-1 p-2 bg-[var(--bg-deep)] border border-[var(--border-soft)] rounded-xl text-center">
                  <p className="text-sm font-black text-green-500">{stats.completed}</p>
                  <p className="text-[7px] font-bold text-[var(--text-faint)] uppercase">Done</p>
                </div>
              </div>
              <div className="mt-1">
                 <div className="flex justify-between text-[8px] font-black text-[var(--text-muted)] mb-1 uppercase tracking-tighter">
                   <span>Progress</span>
                   <span className="text-blue-500">{stats.rate}%</span>
                 </div>
                 <div className="h-1 bg-[var(--bg-deep)] rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${stats.rate}%` }} />
                 </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════ CENTER COL ════════════════ */}
      <section className="lg:col-span-6 space-y-5">
        
        {/* Task Queue Card */}
        <div style={{ ...card, padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '560px' }}>
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-[var(--border)]">
            <div>
              <h2 style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '16px' }}>My Tasks</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>{stats.completed} of {stats.total} completed</p>
            </div>
            <button onClick={() => { setEditTarget(null); setIsModalOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30">Create</button>
          </div>

          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="whitespace-nowrap px-4 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={activeTab === tab.key ? { background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' } : { color: 'var(--text-muted)' }}>{tab.label}</button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
              </div>
            ) : filteredQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm font-medium">All clear for today!</p>
              </div>
            ) : (
              filteredQueue.map(item => {
                const p = item.type === 'task' ? (priorityConfig[item.priority] || priorityConfig.mid) : null;
                return (
                  <div key={item.id} className="flex items-start gap-2 p-4 rounded-2xl bg-[var(--bg-deep)] border border-[var(--border-soft)] group transition-all"
                    style={{ opacity: item.isCompleted ? 0.6 : 1 }}>
                    <button onClick={() => toggleTask(item.id, item.isCompleted)} className="mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all bg-transparent"
                      style={{ borderColor: item.isCompleted ? '#22c55e' : (p?.dot === 'bg-red-500' ? '#ef4444' : 'var(--border)') }}>
                      {item.isCompleted && <CheckCircle2 size={16} className="text-green-500" />}
                    </button>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2.5 flex-wrap">
                         <div className={`p-1.5 rounded-lg flex-shrink-0 ${item.type === 'event' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-blue-500/10 text-blue-500'}`}>
                           {item.type === 'event' ? <CalendarDays size={12} /> : <Zap size={12} />}
                         </div>
                         <p className={`text-sm font-medium ${item.isCompleted ? 'line-through opacity-50' : ''}`}>{item.title}</p>
                         
                         {/* Priority badge */}
                         {item.type === 'task' && !item.isCompleted && p && (
                           <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold"
                             style={{ background: item.priority === 'high' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)', color: item.priority === 'high' ? '#ef4444' : '#22c55e' }}>
                             {p.label}
                           </span>
                         )}
                       </div>
                       
                       {item.detail && <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">{renderTextWithLinks(item.detail)}</p>}
                       {item.location && <p className="text-[10px] font-bold text-blue-500 mt-1 flex items-center gap-1"><ExternalLink size={10} /> {renderTextWithLinks(item.location)}</p>}
                       
                       {/* Deadline badges */}
                       {!item.isCompleted && (item.deadlineDate || item.deadlineTime || item.date || item.time) && (
                         <div className="flex flex-wrap gap-2 mt-2">
                           {(item.deadlineDate || item.date) && (
                             <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 flex items-center gap-1">
                               <CalendarDays size={10} /> {item.deadlineDate || item.date}
                             </span>
                           )}
                           {(item.deadlineTime || item.time) && (
                             <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 flex items-center gap-1">
                               <Clock size={10} /> {item.deadlineTime || item.time}
                             </span>
                           )}
                         </div>
                       )}
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => openEditModal(item)} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg"><Pencil size={14} /></button>
                      <button onClick={() => deleteTask(item.id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {stats.completed > 0 && (
            <button onClick={purgeCompleted} className="mt-4 w-full py-2.5 rounded-xl text-xs font-semibold border border-[var(--border)] text-[var(--text-muted)] hover:bg-red-500/5 hover:text-red-500 transition-all">
              Clear {stats.completed} Completed
            </button>
          )}
        </div>

        {/* ── Nexus Vault Section ── */}
        <div style={{ ...card, padding: '24px' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl"><Library size={18} /></span>
                Nexus Vault
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">Capture ideas, notes, and resources.</p>
            </div>
            <button onClick={() => { setEditTarget(null); setIsVaultModalOpen(true); }} className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 transition-all">Capture</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vaultItems.length === 0 ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-40 border-2 border-dashed border-[var(--border)] rounded-2xl">
                <p className="text-sm font-bold">Vault is empty</p>
                <p className="text-[10px] mt-1">Start capturing your brilliance.</p>
              </div>
            ) : (
              vaultItems.map(item => (
                <VaultCard 
                  key={item.id} 
                  item={item} 
                  openEditModal={openEditModal} 
                  deleteTask={deleteTask} 
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ════════════════ RIGHT COL ════════════════ */}
      <section className="lg:col-span-3 space-y-4">
        
        {/* Quick Mini Calendar */}
        <div style={card} className="p-5 hidden lg:block">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-bold text-[var(--text-main)]">Calendar</p>
            <NavLink to="/calendar" className="text-[11px] font-bold text-blue-500 hover:underline">Full View ↗</NavLink>
          </div>
          <div className="flex items-center justify-between mb-3 px-1">
            <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1))} className="p-1 hover:bg-[var(--bg-deep)] rounded-md"><ChevronLeft size={14}/></button>
            <p className="text-[12px] font-bold">{monthNames[calDate.getMonth()]} {calDate.getFullYear()}</p>
            <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1))} className="p-1 hover:bg-[var(--bg-deep)] rounded-md"><ChevronRight size={14}/></button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {['S','M','T','W','T','F','S'].map((d, i) => (
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

      {/* Modals */}
      <ActivityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveActivity} 
        activity={editTarget}
      />
      <AddHubModal isOpen={isHubModalOpen} onClose={() => setIsHubModalOpen(false)} onSave={addPortal} />
      <VaultModal 
        isOpen={isVaultModalOpen} 
        onClose={() => setIsVaultModalOpen(false)} 
        onSave={handleSaveActivity} 
        activity={editTarget}
      />
    </div>
  );
}
