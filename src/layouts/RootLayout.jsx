import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Settings, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import NotificationManager from '../components/NotificationManager';

export default function RootLayout() {
  const [time, setTime] = useState('');
  const { currentUser } = useAuth();
  const { theme } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const isCalendar = location.pathname.startsWith('/calendar');

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const handleFAB = () => {
    // Dispatch a custom event that Dashboard listens to
    window.dispatchEvent(new CustomEvent('nexus:open-create'));
  };

  const navItemCls = ({ isActive }) =>
    `relative flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all duration-200 ${isActive
      ? 'text-blue-500'
      : 'text-gray-500 hover:text-gray-300'
    }`;

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>

      {/* ── TOP BAR ── */}
      <header style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
        className="flex justify-between items-center px-5 py-3 z-20 shrink-0 shadow-sm">

        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            <span className="text-white font-bold text-sm tracking-tight">N</span>
          </div>
          <div>
            <span className="font-bold text-base tracking-tight" style={{ color: 'var(--text-main)' }}>Nexus</span>
            <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
              style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
              beta
            </span>
          </div>
        </div>

        {/* Right: Clock + Avatar */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm font-mono font-medium px-3 py-1.5 rounded-xl"
            style={{ backgroundColor: 'var(--bg-deep)', color: 'var(--text-muted)' }}>
            {time}
          </span>

          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 group"
            title="Settings">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-500 transition-all"
              />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                {currentUser?.email?.charAt(0).toUpperCase() || 'N'}
              </div>
            )}
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto px-4 py-5 pb-28 lg:pb-8 lg:px-8 max-w-[1600px] mx-auto w-full">
        <Outlet />
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-1.5 pt-1"
        style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
        <div className="flex justify-around items-center max-w-sm mx-auto">

          <NavLink to="/" end className={navItemCls}>
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-blue-500/10' : ''}`}>
                  <Home size={20} />
                </div>
                <span className="text-[9px] font-bold">Home</span>
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-blue-500" />
                )}
              </>
            )}
          </NavLink>

          <NavLink to="/calendar" className={navItemCls}>
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-blue-500/10' : ''}`}>
                  <Calendar size={20} />
                </div>
                <span className="text-[9px] font-bold">Calendar</span>
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-blue-500" />
                )}
              </>
            )}
          </NavLink>

          <NavLink to="/settings" className={navItemCls}>
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-blue-500/10' : ''}`}>
                  <Settings size={20} />
                </div>
                <span className="text-[9px] font-bold">Settings</span>
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-blue-500" />
                )}
              </>
            )}
          </NavLink>

        </div>
      </nav>

      {/* ── FAB (Mobile only) ── */}
      {!isCalendar && (
        <button
          className="fab lg:hidden"
          onClick={handleFAB}
          aria-label="Create task or event">
          <Plus size={24} strokeWidth={2.5} />
        </button>
      )}

      {/* ── GLOBAL ALARM / NOTIFICATIONS ── */}
      <NotificationManager />

    </div>
  );
}
