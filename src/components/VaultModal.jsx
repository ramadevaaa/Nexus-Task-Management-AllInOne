import { useState, useRef, useEffect } from 'react';
import { X, StickyNote, Lightbulb, Library, Image, Link, Upload, Loader2, Pencil, Trash2 } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export default function VaultModal({ isOpen, onClose, onSave, activity = null }) {
  const [type, setType] = useState('note'); // note, idea, learning
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (activity) {
        setType(activity.vaultType || 'note');
        setTitle(activity.title || '');
        setContent(activity.content || '');
        setUrl(activity.url || '');
        setCurrentImageUrl(activity.imageUrl || '');
        setPreview(activity.imageUrl || null);
        setImage(null);
      } else {
        reset();
      }
    }
  }, [isOpen, activity]);

  if (!isOpen) return null;

  const reset = () => {
    setTitle('');
    setContent('');
    setUrl('');
    setImage(null);
    if (preview && !currentImageUrl) URL.revokeObjectURL(preview);
    setPreview(null);
    setType('note');
    setCurrentImageUrl('');
    setProgress(0);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 500KB Limit for Base64 efficiency
      if (file.size > 0.5 * 1024 * 1024) {
        alert("File terlalu besar untuk Database. Maksimal 500KB (Gunakan screenshot atau file kompres).");
        e.target.value = "";
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // This is the Base64 string
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    setUploading(true);
    setProgress(50); // Simulative progress for Base64

    try {
      // Image is already in Base64 format if selected
      const finalImageUrl = image || currentImageUrl;

      onSave({
        type: 'vault',
        vaultType: type,
        title,
        content,
        url,
        imageUrl: finalImageUrl,
      }, activity?.id);

      setProgress(100);
      onClose();
    } catch (error) {
      console.error("Vault operation failed:", error);
      alert(`Gagal menyimpan: ${error.message}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const typeConfig = {
    note: { label: 'Quick Note', icon: <StickyNote className="w-4 h-4" />, color: '#3b82f6' },
    idea: { label: 'Idea Spark', icon: <Lightbulb className="w-4 h-4" />, color: '#eab308' },
    learning: { label: 'Learning Media', icon: <Library className="w-4 h-4" />, color: '#a855f7' },
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="p-2 bg-indigo-500/20 rounded-xl text-indigo-500">
                {activity ? <Pencil size={20} /> : typeConfig[type].icon}
              </span>
              {activity ? 'Edit Vault Item' : 'Add to Nexus Vault'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {activity ? 'Update your captured thoughts.' : 'Capture your thoughts, ideas, and resources.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* Type Selector (Only for new items or if allows type change) */}
          <div className="flex gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800">
            {Object.entries(typeConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setType(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  type === key ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {config.icon}
                {config.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Title / Label</label>
            <input
              type="text"
              placeholder="Give it a name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Details / Notes</label>
            <textarea
              placeholder="What's this about? Write it down here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
            />
          </div>

          {type === 'learning' && (
            <div className="space-y-2 animate-slide-up">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                <Link size={12} /> External Link (YouTube, Blog, etc.)
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-xs"
              />
            </div>
          )}

          {/* Media Section */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Media</label>
            
            {!preview ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-slate-500"
              >
                <div className="p-3 bg-slate-900 rounded-full">
                  <Upload size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-300">Upload Image</p>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tight">Maksimal 500KB (Base64 Mode)</p>
                </div>
              </button>
            ) : (
              <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 cursor-zoom-in">
                <img 
                  src={preview} 
                  alt="Upload Preview" 
                  className="w-full h-48 object-cover opacity-80" 
                  onClick={() => setIsZoomed(true)}
                />
                <div className="absolute top-2 right-2 flex gap-2">
                   <button 
                     onClick={() => setIsZoomed(true)}
                     className="p-2 bg-black/60 rounded-lg text-white hover:bg-black/80 transition-colors"
                   >
                     <Upload size={14} className="rotate-45" />
                   </button>
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                   <p className="text-[10px] font-bold text-white uppercase tracking-widest">Click to Zoom</p>
                </div>
                <div className="p-3 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent">
                  <button 
                    onClick={() => { setPreview(null); setImage(null); setCurrentImageUrl(''); }} 
                    className="flex items-center gap-1.5 text-red-400 text-[10px] font-black uppercase tracking-wider"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
        </div>

        {/* Full Screen Zoom Overlay */}
        {isZoomed && (
          <div 
            className="fixed inset-0 z-[1100] bg-black/95 flex items-center justify-center p-4 lg:p-12 animate-fade-in cursor-zoom-out"
            onClick={() => setIsZoomed(false)}
          >
            <img 
              src={preview} 
              alt="Full Preview" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scale-up" 
            />
            <button className="absolute top-10 right-10 p-3 bg-white/10 rounded-full text-white">
              <X size={24} />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 bg-slate-900/80 border-t border-slate-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-400 hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={uploading || !title.trim()}
            className="flex-[2] py-4 px-6 rounded-2xl font-bold text-white shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)'
            }}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-1 w-full">
                <div className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm font-bold">{progress < 100 ? `Uploading ${progress}%` : 'Finalizing...'}</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                   <div className="h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              <>{activity ? 'Update Item' : 'Save to Vault'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
