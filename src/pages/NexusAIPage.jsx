import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Trash2, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNexusAI } from '../hooks/useNexusAI';
import { useTasks } from '../hooks/useTasks';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export default function NexusAIPage() {
  const { currentUser } = useAuth();
  const { messages, loading, error, sendMessage, clearHistory, idMapping } = useNexusAI(currentUser);
  const { addActivity, updateActivity, deleteTask } = useTasks();
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  const handleAction = async (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.type === 'delete') {
        if (!data.id) return;
        await deleteTask(data.id);
        alert(`Mission purged: ${data.title || 'Item deleted'}`);
      } 
      else if (data.type === 'edit') {
        if (!data.id) return;
        const { id, type, ...updates } = data;
        await updateActivity(data.id, updates);
        alert('Neural patterns updated successfully! 💫');
      }
      else if (data.type === 'vault') {
        await addActivity({
          type: 'vault',
          vaultType: data.vaultType || 'note',
          title: data.title,
          content: data.content || '',
          isCompleted: false
        });
        alert('Knowledge captured to Nexus Vault! 📚');
      } else {
        await addActivity({
          type: data.type || 'task',
          title: data.title,
          deadlineDate: data.date,
          deadlineTime: data.time,
          date: data.date,
          time: data.time,
          isCompleted: false
        });
        alert('Mission confirmed and added to your dashboard! 🚀');
      }
    } catch (e) {
      console.error("Action error:", e);
      alert("Neural link sync failed during execution.");
    }
  };

  const parseMessage = (text) => {
    const jsonMatch = text.match(/\[JSON_START\]([\s\S]*?)\[JSON_END\]/);
    if (jsonMatch) {
      const cleanText = text.replace(/\[JSON_START\][\s\S]*?\[JSON_END\]/, '').trim();
      return { text: cleanText, action: jsonMatch[1] };
    }
    return { text, action: null };
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900/40 backdrop-blur-xl relative overflow-hidden pb-24 lg:pb-0">
      
      {/* Header - Centered Content */}
      <header className="w-full border-b border-white/5 bg-white/5 shrink-0">
        <div className="max-w-5xl mx-auto p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-white/5 rounded-xl text-slate-400 group flex items-center gap-2 transition-all">
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden lg:inline text-xs font-bold uppercase tracking-widest">Back</span>
            </button>
            <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Nexus AI Hub</h2>
              <div className="flex items-center gap-1.5 ">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neural Link Active</span>
              </div>
            </div>
          </div>
          <button onClick={clearHistory} className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-xl transition-all" title="Clear Chat">
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      {/* Chat Area - Scrollable with centered column */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
        <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-6">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40 py-20">
              <div className="p-6 bg-white/5 rounded-full">
                <Bot size={48} className="text-indigo-400" />
              </div>
              <div className="max-w-xs">
                <p className="text-sm font-bold text-white">Salutations, {currentUser?.displayName?.split(' ')[0] || 'User'}</p>
                <p className="text-[11px] mt-1 text-slate-400">I am your Nexus Intelligence. Ask me to summarize your vault, check your deadines, or schedule a new mission.</p>
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m, idx) => {
              const { text, action } = parseMessage(m.text);
              const isAI = m.role === 'model';
              
              return (
                <motion.div
                  key={m.id || idx}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${isAI ? 'justify-start' : 'justify-end'} items-start gap-3`}
                >
                  {isAI && (
                    <div className="p-2 bg-indigo-600 rounded-lg shrink-0 mt-1">
                      <Bot size={14} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[85%] lg:max-w-[75%] space-y-2`}>
                    <div className={`p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm ${isAI
                        ? 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
                        : 'bg-indigo-600 text-white rounded-tr-none font-medium'
                      }`}>
                      <div className="prose prose-invert prose-xs max-w-none prose-p:leading-relaxed prose-strong:text-white prose-strong:font-black">
                        <ReactMarkdown>{text}</ReactMarkdown>
                      </div>
                      {action && (() => {
                        try {
                          const actionData = JSON.parse(action);
                          const isVault = actionData.type === 'vault';
                          const isDelete = actionData.type === 'delete';
                          const isEdit = actionData.type === 'edit';
                          
                          const config = {
                            label: isVault ? 'Neural Archive Suggestion' : isDelete ? 'Purge Protocol' : isEdit ? 'Update Protocol' : 'Mission Protocol Suggestion',
                            colorClass: isVault ? 'text-purple-300' : isDelete ? 'text-red-400' : isEdit ? 'text-amber-400' : 'text-indigo-300',
                            bgClass: isVault ? 'bg-purple-500/20 border-purple-500/30' : isDelete ? 'bg-red-500/20 border-red-500/30' : isEdit ? 'bg-amber-500/20 border-amber-500/30' : 'bg-indigo-500/20 border-indigo-500/30',
                            btnClass: isVault ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20' : isDelete ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' : isEdit ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20',
                            btnText: isVault ? '✦ Capture to Vault' : isDelete ? '⚠ Confirm Purge' : isEdit ? '✎ Apply Changes' : '✓ Confirm Mission',
                            titleText: isVault ? `Archive this ${actionData.vaultType || 'note'}?` : isDelete ? `Permanently delete: ${actionData.title}?` : isEdit ? `Apply modifications to: ${actionData.title}?` : `Authorize Mission: ${actionData.title}?`
                          };

                          return (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`mt-4 p-4 border rounded-xl space-y-3 ${config.bgClass}`}
                            >
                              <div className={`flex items-center gap-2 ${config.colorClass}`}>
                                <span className="text-[10px] font-bold uppercase tracking-widest">{config.label}</span>
                              </div>
                              <p className="font-bold text-[13px] text-white">{config.titleText}</p>
                              <p className="text-[11px] text-slate-400 italic line-clamp-2">
                                {isDelete ? 'Warning: This action cannot be reversed.' : isEdit ? 'Reviewing suggested parameter adjustments...' : isVault ? actionData.title : actionData.detail || 'New objective identified.'}
                              </p>
                              <button
                                onClick={() => handleAction(action)}
                                className={`w-full py-2.5 text-white rounded-xl text-[11px] font-bold transition-all shadow-lg active:scale-95 ${config.btnClass}`}
                              >
                                {config.btnText}
                              </button>
                            </motion.div>
                          );
                        } catch (err) {
                          console.error("Failed to parse AI action JSON:", err);
                          return null; // Ignore malformed JSON instead of crashing
                        }
                      })()}
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase px-1">
                      {m.createdAt?.seconds ? new Date(m.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                  </div>
                  {!isAI && (
                    <div className="p-2 bg-slate-700 rounded-lg shrink-0 mt-1">
                      <User size={14} className="text-white" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg animate-pulse">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Error State - Centered */}
      <AnimatePresence>
        {error && (
          <div className="max-w-5xl mx-auto w-full relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute bottom-6 left-6 right-6 p-4 bg-red-500/10 border border-red-500/20 backdrop-blur-xl rounded-2xl flex items-center gap-3 z-50 shadow-2xl"
            >
              <div className="p-2 bg-red-500 rounded-lg shadow-lg shadow-red-500/20">
                 <Trash2 size={16} className="text-white" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none mb-1">Error Detected</p>
                 <p className="text-xs font-bold text-white leading-tight">{error}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Input Area - Centered Column */}
      <div className="w-full p-6 bg-white/5 border-t border-white/5 shrink-0">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSend} className="relative flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Relay message to AI..."
              className="w-full bg-slate-800/50 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-[9px] text-center text-slate-500 mt-4 font-medium uppercase tracking-widest">
            Nexus Neural Interface v1.0 • Gemini 3.0 Flash Preview Powered
          </p>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
