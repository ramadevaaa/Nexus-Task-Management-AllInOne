import { useState, useMemo, lazy, Suspense, useEffect, useRef } from 'react';
import { useTasks } from '../hooks/useTasks';
import {
  Plus, Trash2, ExternalLink, X, Pencil,
  StickyNote, Lightbulb, Library, Search
} from 'lucide-react';

// Lazy load modals
const VaultModal = lazy(() => import('../components/VaultModal'));

const VAULT_TABS = [
  { key: 'all', label: 'All' },
  { key: 'note', label: 'Notes' },
  { key: 'idea', label: 'Ideas' },
  { key: 'learning', label: 'Learning' },
];

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
          className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 break-all decoration-indigo-500/30"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

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

      {/* Actions */}
      <div className="absolute top-3.5 right-3.5 flex gap-2 z-20 sm:opacity-0 group-hover:opacity-100 transition-all duration-300">
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
        <div className="h-48 overflow-hidden cursor-zoom-in" onClick={() => setIsZoomed(true)}>
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all" />
        </div>
      )}

      <div className="p-5">
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl flex-shrink-0">
              {item.vaultType === 'idea' ? <Lightbulb size={18} /> : item.vaultType === 'learning' ? <Library size={18} /> : <StickyNote size={18} />}
            </span>
            <h4 className="font-bold text-base break-words text-[var(--text-main)] leading-tight flex-1">{item.title}</h4>
          </div>
        </div>

        <div className="relative">
          <p
            ref={textRef}
            className={`text-xs text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap transition-all duration-300 ${isExpanded ? '' : 'line-clamp-4'}`}
          >
            {renderTextWithLinks(item.content)}
          </p>
          {(isTruncated || isExpanded) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 px-3.5 py-1.5 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-lg text-[10px] font-extrabold text-indigo-400 transition-all border border-indigo-500/10 uppercase tracking-wide"
            >
              {isExpanded ? 'Show Less ↑' : 'Read More ↓'}
            </button>
          )}
        </div>

        {item.url && (
          <a 
            href={item.url} 
            target="_blank" 
            rel="noreferrer" 
            className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 bg-slate-800/50 rounded-lg text-[10px] font-bold text-indigo-400 hover:bg-slate-800 transition-all border border-slate-700/50"
          >
            Open Resource <ExternalLink size={11} />
          </a>
        )}
      </div>

      {/* Full Screen Image Zoom */}
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

export default function VaultPage() {
  const { activities, loading, addActivity, updateActivity, deleteTask } = useTasks();
  const [vaultActiveTab, setVaultActiveTab] = useState('all');
  const [vaultSearch, setVaultSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const vaultItems = useMemo(() =>
    (activities || []).filter(a => a.type === 'vault'),
    [activities]
  );

  const filteredVault = useMemo(() => {
    let items = vaultItems;
    if (vaultActiveTab !== 'all') {
      items = items.filter(v => v.vaultType === vaultActiveTab);
    }
    if (!vaultSearch) return items;
    return items.filter(v =>
      v.title?.toLowerCase().includes(vaultSearch.toLowerCase()) ||
      v.content?.toLowerCase().includes(vaultSearch.toLowerCase())
    );
  }, [vaultItems, vaultSearch, vaultActiveTab]);

  const handleSaveActivity = async (data, id) => {
    if (id) {
      await updateActivity(id, data);
    } else {
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
            <h1 className="flex items-center gap-2.5 text-[var(--text-main)] font-extrabold text-24px letter-spacing-[-0.5px]">
              <span className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl flex-shrink-0"><Library size={24} /></span>
              Knowledge Vault
            </h1>
            <p className="text-[var(--text-muted)] text-13px mt-1">Capture snippets, research, thoughts, and references.</p>
          </div>
          <button 
            onClick={() => { setEditTarget(null); setIsModalOpen(true); }} 
            className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all"
          >
            New Entry
          </button>
        </div>

        {/* Search bar */}
        <div className="relative mb-5 flex-shrink-0">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search ideas, notes, or resources..."
            value={vaultSearch}
            onChange={(e) => setVaultSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-[var(--bg-deep)] text-[var(--text-main)] placeholder-[var(--text-faint)] border border-[var(--border-soft)] focus:outline-none focus:border-indigo-500/50 text-sm transition-all"
          />
          {vaultSearch && (
            <button 
              onClick={() => setVaultSearch('')}
              className="absolute inset-y-0 right-3.5 flex items-center text-[var(--text-faint)] hover:text-[var(--text-muted)]"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {VAULT_TABS.map(tab => (
            <button 
              key={tab.key} 
              onClick={() => setVaultActiveTab(tab.key)} 
              className="whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all border"
              style={vaultActiveTab === tab.key 
                ? { background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderColor: 'rgba(99,102,241,0.3)' } 
                : { color: 'var(--text-muted)', borderColor: 'transparent' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid container */}
        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-60 gap-3">
              <div className="w-9 h-9 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
              <span className="text-xs text-[var(--text-muted)]">Decrypting Knowledge...</span>
            </div>
          ) : filteredVault.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-[var(--border-soft)] rounded-2xl opacity-60">
              <div className="text-4xl mb-3">🧠</div>
              <p className="text-sm font-bold text-[var(--text-main)]">No records found</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Start depositing your intellectual capital.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
              {filteredVault.map(item => (
                <VaultCard
                  key={item.id}
                  item={item}
                  openEditModal={openEditModal}
                  deleteTask={deleteTask}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      <Suspense fallback={null}>
        {isModalOpen && (
          <VaultModal
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
