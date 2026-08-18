import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ChevronLeft, Sun, Moon, User, Clock, Timer, LogOut,
  Sparkles, Check, ShieldCheck
} from 'lucide-react';

export default function SettingsPage() {
  const {
    operatorName, theme, toggleTheme, focusDuration, breakDuration,
    setOperatorName, setFocusDuration, setBreakDuration
  } = useSettings();
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const [draft, setDraft] = useState({
    operatorName: operatorName || '',
    focusDuration: focusDuration || 25,
    breakDuration: breakDuration || 5,
  });
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = () => {
    setOperatorName(draft.operatorName);
    setFocusDuration(draft.focusDuration);
    setBreakDuration(draft.breakDuration);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      navigate('/');
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* Top Header */}
      <div className="bento-card p-6 flex items-center justify-between bg-white dark:bg-[#121620]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Settings & Preferences
            </h1>
            <p className="text-xs text-slate-400">
              Customize your workspace, timer durations, and theme
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
        >
          {savedToast ? <Check size={15} /> : <Sparkles size={15} />}
          <span>{savedToast ? 'Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      {/* ── PROFILE & OPERATOR CARD ── */}
      <div className="bento-card p-6 bg-white dark:bg-[#121620] space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <User size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Operator Profile</h3>
            <p className="text-xs text-slate-400">Your callsign and workspace identity</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
            Operator Name
          </label>
          <input
            type="text"
            value={draft.operatorName}
            onChange={(e) => setDraft({ ...draft, operatorName: e.target.value })}
            placeholder="e.g. Commander Shepard"
            className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
      </div>

      {/* ── POMODORO / FOCUS TIMER CARD ── */}
      <div className="bento-card p-6 bg-white dark:bg-[#121620] space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Timer size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Focus Timer Durations</h3>
            <p className="text-xs text-slate-400">Configure Pomodoro intervals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Focus Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={draft.focusDuration}
              onChange={(e) => setDraft({ ...draft, focusDuration: Number(e.target.value) })}
              className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Break Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={draft.breakDuration}
              onChange={(e) => setDraft({ ...draft, breakDuration: Number(e.target.value) })}
              className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
        </div>
      </div>

      {/* ── APPEARANCE CARD ── */}
      <div className="bento-card p-6 bg-white dark:bg-[#121620] space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Appearance & Theme</h3>
            <p className="text-xs text-slate-400">Switch between Bento Light and Obsidian Dark</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Current Theme: {theme === 'dark' ? 'Obsidian Dark' : 'Outcrowd Bento Light'}
          </span>
          <button
            onClick={toggleTheme}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-bold text-slate-800 dark:text-white transition-colors"
          >
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      {/* ── ACCOUNT / LOGOUT CARD ── */}
      {currentUser && (
        <div className="bento-card p-6 bg-white dark:bg-[#121620] flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Logged in as</h4>
            <p className="text-xs text-slate-400">{currentUser.email}</p>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
