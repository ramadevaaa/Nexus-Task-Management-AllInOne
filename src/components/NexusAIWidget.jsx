import { Sparkles, ArrowRight, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';

export default function NexusAIWidget() {
  const navigate = useNavigate();
  const { activities } = useTasks();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Morning brief' : hour < 17 ? 'Afternoon brief' : 'Evening review';

  // Briefing Logic
  const pendingMissions = activities.filter(a => !a.isCompleted).length;
  const briefing = pendingMissions > 0
    ? `${pendingMissions} items are still open. Ask Nexus to prioritize them or build a focused plan.`
    : `Everything is complete. Ask Nexus to plan what comes next.`;

  return (
    <div className="dashboard-ai-card p-5 flex flex-col gap-4 relative overflow-hidden group animate-fade-in">
      {/* Background Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20">
            <Brain size={16} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{greeting}</p>
            <p className="text-sm font-bold text-white">Nexus Assistant</p>
          </div>
        </div>
        <Sparkles size={16} className="text-slate-600 group-hover:text-indigo-400 transition-colors animate-pulse" />
      </div>

      <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
        <p className="text-[11px] text-slate-300 leading-relaxed italic">
          "{briefing}"
        </p>
      </div>

      <button
        onClick={() => navigate('/ai')}
        className="w-full flex items-center justify-between p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-lg shadow-indigo-500/20 group/btn"
      >
         <span className="text-xs font-bold ml-1">Open assistant</span>
        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
      </button>


    </div>
  );
}
