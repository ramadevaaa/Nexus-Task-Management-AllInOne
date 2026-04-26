import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load page components for performance optimization
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const VaultPage = lazy(() => import('./pages/VaultPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NexusAIPage = lazy(() => import('./pages/NexusAIPage'));

const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-main)',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Loading Nexus...</span>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<RootLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="vault" element={<VaultPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="ai" element={<NexusAIPage />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
