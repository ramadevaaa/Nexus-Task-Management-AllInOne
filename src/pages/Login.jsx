import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Login() {
  const { currentUser, login } = useAuth();

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>

      {/* Background blobs */}
      <div style={{
        position: 'absolute', top: '-120px', right: '-120px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', left: '-80px',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '48px 40px',
        maxWidth: '380px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}>

        {/* Logo */}
        <div style={{
          width: '64px', height: '64px', borderRadius: '20px',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(59,130,246,0.4)',
          marginBottom: '24px',
          fontSize: '26px', fontWeight: 800, color: '#fff',
          letterSpacing: '-0.5px'
        }}>
          N
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
          Welcome to Nexus
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '36px', lineHeight: 1.6 }}>
          Sign in to access your personal task workspace.
        </p>

        {/* Google Sign In Button */}
        <button
          onClick={login}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '14px 24px',
            borderRadius: '14px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-deep)',
            color: 'var(--text-main)',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.1)';
            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'var(--bg-deep)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Google icon */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.1 0 5.6 1.1 7.6 2.8l5.7-5.7C33.9 3.5 29.3 1.5 24 1.5 14.9 1.5 7.2 7.1 3.9 15l6.7 5.2C12.2 13.5 17.6 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.5 24c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 2.9-2.3 5.4-4.8 7.1l7.3 5.7C43.4 37.3 46.5 31.1 46.5 24z" />
            <path fill="#FBBC05" d="M10.6 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7L3.6 14c-1.4 2.8-2.1 5.9-2.1 9.1 0 3.2.7 6.2 2 8.9l7-5.3z" />
            <path fill="#34A853" d="M24 46.5c5.3 0 9.8-1.7 13.1-4.7l-7.3-5.7c-1.8 1.2-4.1 1.9-5.8 1.9-6.4 0-11.8-4-13.4-9.5l-7 5.4C7.2 41 15 46.5 24 46.5z" />
          </svg>
          Continue with Google
        </button>

        <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '24px' }}>
          Secure, encrypted sign-in
        </p>
      </div>
    </div>
  );
}
