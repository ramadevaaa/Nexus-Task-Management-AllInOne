import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Calendar, Settings, Plus, ClipboardList, Library,
  Sparkles, Moon, Sun, Search, Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import NotificationManager from '../components/NotificationManager';

export default function RootLayout() {
  const [time, setTime] = useState('');
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const handleFAB = () => {
    window.dispatchEvent(new CustomEvent('nexus:open-create'));
  };

  const navItems = [
    { to: '/', label: 'Today', icon: Home, exact: true },
    { to: '/tasks', label: 'Tasks', icon: ClipboardList },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/vault', label: 'Vault', icon: Library },
    { to: '/ai', label: 'Assistant', icon: Sparkles, highlight: true },
  ];

  return (
    <div
      className="flex flex-col h-screen overflow-hidden font-sans"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
    >
      {/* ── TOP BAR (OUTCROWD BENTO STYLE) ── */}
      <header className="flex justify-between items-center px-6 py-3.5 z-20 shrink-0 bg-white/80 dark:bg-[#121620]/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3.5">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <img
                src="/nexus_tanpa_tulisan.png"
                alt="Nexus Logo"
                className="w-full h-full object-contain filter brightness-0 invert"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  Nexus
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 -mt-0.5">
                Mission Control
              </span>
            </div>
          </NavLink>
        </div>

        {/* Center: Desktop Navigation Pills */}
        <nav className="hidden lg:flex items-center p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 shadow-inner gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? item.highlight
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                        : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`
                }
              >
                <Icon size={14} className={item.highlight ? 'text-amber-300' : ''} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Actions, Live Clock & Profile */}
        <div className="flex items-center gap-3">
          {/* Live Clock Pill */}
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {time}
          </span>

          {/* Theme Toggle Button */}
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}

          {/* Settings / Avatar Button */}
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 group p-0.5 rounded-full hover:ring-2 hover:ring-blue-500/40 transition-all"
            title="Settings & Profile"
          >
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
              />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md">
                {currentUser?.email?.charAt(0).toUpperCase() || 'N'}
              </div>
            )}
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT (DOT GRID CANVAS) ── */}
      <main
        className={`flex-1 overflow-y-auto bg-dot-pattern ${
          location.pathname === '/ai'
            ? ''
            : 'px-4 py-6 pb-28 lg:pb-10 lg:px-8 max-w-[1600px] mx-auto w-full'
        }`}
      >
        <Outlet />
      </main>

      {/* ── MOBILE FLOATING BOTTOM NAV ── */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-50 p-2 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/50'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium'
                  }`
                }
              >
                <Icon size={18} />
                <span className="text-[10px]">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>



      {/* ── GLOBAL ALARMS & NOTIFICATIONS ── */}
      <NotificationManager />
    </div>
  );
}
