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
  const { messages, loading, error, sendMessage, clearHistory } = useNexusAI(currentUser);
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
        const { id, type: actionType, ...updates } = data;
        const finalUpdates = { ...updates };
        if (data.type && data.type !== 'edit') finalUpdates.type = data.type;
        
        await updateActivity(data.id, finalUpdates);
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
          detail: data.detail || '',
          location: data.location || '',
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
      const cleanText = text.replace(/\[JSON_START\][\s\S]*?\[JSON_END\]/g, '').trim();
      let actionRaw = jsonMatch[1].trim();
      if (actionRaw.startsWith('```')) {
        actionRaw = actionRaw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
      }
      return { text: cleanText, action: actionRaw };
    }
    return { text, action: null };
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent relative overflow-hidden pb-24 lg:pb-0">
      
      {/* Header - Theme-aware styling */}
      <header className="w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-[#121620]/80 backdrop-blur-md shrink-0 shadow-xs">
        <div className="max-w-5xl mx-auto p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 group flex items-center gap-1.5 transition-all"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider">Back</span>
            </button>
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-md shadow-blue-500/20 text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Nexus AI Hub</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Neural Link Active</span>
              </div>
            </div>
          </div>
          <button
            onClick={clearHistory}
            className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-xl transition-all"
            title="Clear Chat"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
        <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-5">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20">
              <div className="p-5 bg-blue-500/10 rounded-full text-blue-600 dark:text-blue-400">
                <Bot size={40} />
              </div>
              <div className="max-w-xs">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Salutations, {currentUser?.displayName?.split(' ')[0] || 'User'}
                </p>
                <p className="text-xs mt-1 text-slate-400 leading-relaxed">
                  I am your Nexus Intelligence. Ask me to summarize your vault, check your deadlines, or schedule a new mission.
                </p>
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
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${isAI ? 'justify-start' : 'justify-end'} items-start gap-2.5`}
                >
                  {isAI && (
                    <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shrink-0 mt-1 shadow-sm text-white">
                      <Bot size={14} />
                    </div>
                  )}
                  <div className={`max-w-[88%] lg:max-w-[78%] space-y-1.5`}>
                    <div className={`p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                      isAI
                        ? 'bg-white dark:bg-[#121620] text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-tl-none'
                        : 'bg-blue-600 text-white rounded-tr-none font-medium shadow-md shadow-blue-500/20'
                    }`}>
                      <div className={`prose prose-xs max-w-none prose-p:leading-relaxed ${
                        isAI
                          ? 'dark:prose-invert prose-headings:text-slate-900 dark:prose-headings:text-white prose-strong:text-slate-900 dark:prose-strong:text-white'
                          : 'text-white prose-headings:text-white prose-strong:text-white'
                      }`}>
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
                            colorClass: isVault ? 'text-purple-600 dark:text-purple-400' : isDelete ? 'text-red-600 dark:text-red-400' : isEdit ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400',
                            bgClass: isVault ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/40' : isDelete ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/40' : isEdit ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40' : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/40',
                            btnClass: isVault ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20' : isDelete ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' : isEdit ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20',
                            btnText: isVault ? '✦ Capture to Vault' : isDelete ? '⚠ Confirm Purge' : isEdit ? '✎ Apply Changes' : '✓ Confirm Mission',
                            titleText: isVault ? `Archive this ${actionData.vaultType || 'note'}?` : isDelete ? `Permanently delete: ${actionData.title}?` : isEdit ? `Apply modifications to: ${actionData.title}?` : `Authorize Mission: ${actionData.title}?`
                          };

                          return (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`mt-3 p-3.5 border rounded-xl space-y-2.5 ${config.bgClass}`}
                            >
                              <div className={`flex items-center gap-1.5 ${config.colorClass}`}>
                                <span className="text-[10px] font-bold uppercase tracking-wider">{config.label}</span>
                              </div>
                              <p className="font-bold text-xs text-slate-900 dark:text-white">{config.titleText}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2">
                                {isDelete ? 'Warning: This action cannot be reversed.' : isEdit ? 'Reviewing suggested parameter adjustments...' : isVault ? actionData.title : actionData.detail || 'New objective identified.'}
                              </p>
                              <button
                                onClick={() => handleAction(action)}
                                className={`w-full py-2 !text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${config.btnClass}`}
                              >
                                {config.btnText}
                              </button>
                            </motion.div>
                          );
                        } catch (err) {
                          console.error("Failed to parse AI action JSON:", err);
                          return null;
                        }
                      })()}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase px-1">
                      {m.createdAt?.seconds ? new Date(m.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                  </div>
                  {!isAI && (
                    <div className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl shrink-0 mt-1">
                      <User size={14} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl animate-pulse">
                <Bot size={14} />
              </div>
              <div className="bg-white dark:bg-[#121620] p-3.5 rounded-2xl rounded-tl-none border border-slate-200/80 dark:border-slate-800">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <div className="max-w-5xl mx-auto w-full relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute bottom-4 left-4 right-4 p-3.5 bg-red-500/10 border border-red-500/20 backdrop-blur-xl rounded-2xl flex items-center gap-3 z-50 shadow-xl"
            >
              <div className="p-2 bg-red-500 rounded-lg text-white">
                 <Trash2 size={15} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-red-500 uppercase tracking-wider leading-none mb-0.5">Error Detected</p>
                 <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{error}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="w-full p-4 sm:p-5 bg-white/90 dark:bg-[#121620]/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 shrink-0 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Relay message to AI..."
              className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl py-3.5 pl-4 pr-12 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-1.5 p-2.5 bg-blue-600 !text-white rounded-xl shadow-md shadow-blue-500/25 hover:bg-blue-500 active:scale-95 disabled:opacity-40 disabled:active:scale-100 transition-all"
            >
              <Send size={16} />
            </button>
          </form>
          <p className="text-[9px] text-center text-slate-400 mt-2.5 font-medium uppercase tracking-wider">
            Nexus Neural Interface v1.0 • Gemini 3.0 Flash Powered
          </p>
        </div>
      </div>

    </div>
  );
}
