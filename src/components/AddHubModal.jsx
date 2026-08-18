import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Sparkles, Globe } from 'lucide-react';

const EMOJI_OPTIONS = ['🔗', '📋', '🗂️', '🧩', '🛠️', '📊', '🎯', '💡', '📝', '🚀', '🌐', '💼'];

export default function AddHubModal({ isOpen, onClose, onSave, portal = null }) {
  const [title, setTitle] = useState(portal?.title || '');
  const [url, setUrl] = useState(portal?.url || '');
  const [icon, setIcon] = useState(portal?.icon || '🔗');

  useEffect(() => {
    if (portal) {
      setTitle(portal.title || '');
      setUrl(portal.url || '');
      setIcon(portal.icon || '🔗');
    } else {
      setTitle('');
      setUrl('');
      setIcon('🔗');
    }
  }, [portal, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    onSave({ title: title.trim(), url: fullUrl, icon }, portal?.id);
    if (!portal) {
      setTitle('');
      setUrl('');
      setIcon('🔗');
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-50 w-full max-w-md rounded-3xl bg-white dark:bg-[#121620] p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                  Quick Portal
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {portal ? 'Edit Portal' : 'Add Portal Link'}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Emoji Icon Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Choose Icon
                </label>
                <div className="grid grid-cols-6 gap-2 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setIcon(em)}
                      className={`h-9 rounded-xl flex items-center justify-center text-base transition-all ${
                        icon === em
                          ? 'bg-blue-600 text-white scale-110 shadow-sm'
                          : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Portal Name *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Figma Workspace"
                  className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Web URL *
                </label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="figma.com or https://..."
                    className="w-full h-11 pl-9 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

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
                  <Sparkles size={14} />
                  <span>{portal ? 'Update Portal' : 'Save Portal'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
