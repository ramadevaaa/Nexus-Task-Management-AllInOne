import { useState, useMemo, lazy, Suspense, useEffect, useRef } from 'react';
import { useTasks } from '../hooks/useTasks';
import {
  Plus, Trash2, ExternalLink, X, Pencil,
  StickyNote, Lightbulb, Library, Search, Play, Pause
} from 'lucide-react';

// Lazy load modals
const VaultModal = lazy(() => import('../components/VaultModal'));

const VAULT_TABS = [
  { key: 'all', label: 'All Items' },
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

const VaultCard = ({ item, openEditModal, deleteTask }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const isYellowNote = item.vaultType === 'note';

  return (
    <div
      className={`p-6 rounded-3xl transition-all duration-200 group relative flex flex-col justify-between ${
        isYellowNote
          ? 'bento-card-yellow'
          : 'bento-card bg-white dark:bg-[#121620]'
      }`}
    >
      {/* Actions Overlay */}
      <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <button
          onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
          className="p-2 rounded-xl bg-black/10 hover:bg-black/20 text-slate-800 dark:text-slate-200 transition-all backdrop-blur-sm"
          title="Edit"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); deleteTask(item.id); }}
          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-all backdrop-blur-sm"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div>
        {/* Top Tag & Icon */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-black/10 flex items-center justify-center shrink-0">
            {item.vaultType === 'idea' ? (
              <Lightbulb size={16} />
            ) : item.vaultType === 'learning' ? (
              <Library size={16} />
            ) : (
              <StickyNote size={16} />
            )}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider opacity-70">
            {item.vaultType || 'Note'}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-base mb-2 leading-tight">
          {item.title}
        </h3>

        {/* Image Preview */}
        {item.imageUrl && (
          <div
            className="h-36 rounded-2xl overflow-hidden mb-3 cursor-zoom-in relative"
            onClick={() => setIsZoomed(true)}
          >
            <img
              src={item.imageUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        {/* Text Content */}
        <div className="text-xs leading-relaxed opacity-90 whitespace-pre-wrap font-medium">
          <p className={isExpanded ? '' : 'line-clamp-4'}>
            {renderTextWithLinks(item.content)}
          </p>
          {item.content && item.content.length > 120 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-[11px] font-bold underline opacity-80 hover:opacity-100"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      </div>

      {/* Footer Resource Link */}
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-xl bg-black/5 hover:bg-black/10 text-[11px] font-bold transition-all w-fit"
        >
          <span>Open Resource</span>
          <ExternalLink size={11} />
        </a>
      )}

      {/* Fullscreen Zoom */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <img
            src={item.imageUrl}
            alt="Full Preview"
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
          />
          <button className="absolute top-6 right-6 p-3 rounded-full bg-white/20 text-white">
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default function VaultPage() {
  const { activities, loading, addActivity, updateActivity, deleteTask } = useTasks();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const vaultItems = useMemo(() => {
    return (activities || []).filter(a => a.type === 'vault');
  }, [activities]);

  const filteredItems = useMemo(() => {
    let list = vaultItems;
    if (activeTab !== 'all') {
      list = list.filter(i => i.vaultType === activeTab);
    }
    if (search) {
      list = list.filter(i =>
        i.title?.toLowerCase().includes(search.toLowerCase()) ||
        i.content?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  }, [vaultItems, activeTab, search]);

  const handleSave = async (data, id) => {
    data.type = 'vault';
    if (id) {
      await updateActivity(id, data);
    } else {
      await addActivity(data);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-[1440px] mx-auto">
      {/* ── TOP HEADER ── */}
      <div className="bento-card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#121620]">
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-0.5">
            Knowledge Vault & Sticky Notes
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Vault
          </h1>
        </div>

        <button
          onClick={() => { setEditTarget(null); setIsModalOpen(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Plus size={15} />
          <span>New Note / Idea</span>
        </button>
      </div>

      {/* ── FILTER TABS & SEARCH ── */}
      <div className="bento-card p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-[#121620]">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
          {VAULT_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search vault..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>
      </div>

      {/* ── BENTO MASONRY GRID ── */}
      {filteredItems.length === 0 ? (
        <div className="bento-card p-12 text-center bg-white dark:bg-[#121620]">
          <span className="text-4xl block mb-2">💡</span>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
            Vault is empty
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Capture thoughts, ideas, voice notes, and learning resources.
          </p>
          <button
            onClick={() => { setEditTarget(null); setIsModalOpen(true); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500 text-white text-xs font-bold"
          >
            <Plus size={14} />
            <span>Create First Note</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <VaultCard
              key={item.id}
              item={item}
              openEditModal={(target) => { setEditTarget(target); setIsModalOpen(true); }}
              deleteTask={deleteTask}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Suspense fallback={null}>
        {isModalOpen && (
          <VaultModal
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); setEditTarget(null); }}
            onSave={handleSave}
            initialData={editTarget}
          />
        )}
      </Suspense>
    </div>
  );
}
