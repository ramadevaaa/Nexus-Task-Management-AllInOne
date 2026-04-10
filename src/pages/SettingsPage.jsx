import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeft, Sun, Moon, User, Clock, Timer, LogOut } from 'lucide-react';

const inputBase = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 500,
  outline: 'none',
  fontFamily: 'inherit',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--bg-deep)',
  color: 'var(--text-main)',
  transition: 'border-color 0.2s',
};

// ── FIXED: Moved components OUTSIDE to prevent focus loss during renders ──
const Section = ({ icon: Icon, title, children }) => (
  <div style={{
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-card)',
  }}>
    <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} style={{ color: 'var(--accent)' }} />
      </div>
      <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{title}</p>
    </div>
    <div style={{ padding: '20px 24px' }}>{children}</div>
  </div>
);

const Label = ({ children }) => (
  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.02em' }}>
    {children}
  </p>
);

export default function SettingsPage() {
  const { operatorName, theme, toggleTheme, focusDuration, breakDuration,
          setOperatorName, setFocusDuration, setBreakDuration } = useSettings();
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  // Initialize draft only once
  const [draft, setDraft] = useState({ 
    operatorName: operatorName || '', 
    focusDuration: focusDuration || 25, 
    breakDuration: breakDuration || 5 
  });

  // Handle save
  const handleSave = () => {
    setOperatorName(draft.operatorName);
    setFocusDuration(draft.focusDuration);
    setBreakDuration(draft.breakDuration);
    navigate('/');
  };

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', paddingBottom: '100px' }} className="lg:pb-8 animate-fade-in text-main">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 mb-6 transition-colors group"
        style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Back
      </button>

      {/* Page title */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', marginBottom: '6px', tracking: '0.1em', uppercase: 'true' }}>
          CONFIGURATION
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Settings</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── Account ── */}
        <Section icon={User} title="Account">
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
              ) : (
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                  {currentUser.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>{currentUser.displayName || 'User'}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{currentUser.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
                style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', cursor: 'pointer', fontFamily: 'inherit' }}>
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </Section>

        {/* ── Display Name ── */}
        <Section icon={User} title="Greeting Name">
          <Label>What should Nexus call you?</Label>
          <input
            type="text"
            value={draft.operatorName}
            onChange={e => setDraft(d => ({ ...d, operatorName: e.target.value }))}
            placeholder="Name or Alias..."
            style={inputBase}
            autoFocus
          />
        </Section>

        {/* ── Appearance ── */}
        <Section icon={theme === 'dark' ? Moon : Sun} title="Theme Mode">
          <div style={{ display: 'flex', gap: '10px' }}>
            {['dark', 'light'].map(t => (
              <button key={t}
                onClick={() => t !== theme && toggleTheme()}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '14px',
                  border: theme === t ? '2px solid var(--accent)' : '1px solid var(--border)',
                  backgroundColor: theme === t ? 'rgba(59,130,246,0.1)' : 'var(--bg-deep)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}>
                <span style={{ fontSize: '16px' }}>{t === 'dark' ? '🌙' : '☀️'}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: theme === t ? 'var(--accent)' : 'var(--text-muted)', textTransform: 'capitalize' }}>{t}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* ── Timer ── */}
        <Section icon={Timer} title="Timer Config">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <Label>Focus (min)</Label>
              <input
                type="number"
                value={draft.focusDuration}
                onChange={e => setDraft(d => ({ ...d, focusDuration: Number(e.target.value) }))}
                style={{ ...inputBase, textAlign: 'center', fontSize: '18px', fontWeight: 700 }}
              />
            </div>
            <div>
              <Label>Break (min)</Label>
              <input
                type="number"
                value={draft.breakDuration}
                onChange={e => setDraft(d => ({ ...d, breakDuration: Number(e.target.value) }))}
                style={{ ...inputBase, textAlign: 'center', fontSize: '18px', fontWeight: 700 }}
              />
            </div>
          </div>
        </Section>

        {/* ── Save Button ── */}
        <button
          onClick={handleSave}
          className="hover-lift"
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}>
          Save & Update Dashboard
        </button>

      </div>
    </div>
  );
}
