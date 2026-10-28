import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { roleHome } from '../data/mockUsers.js';

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();

  /* Show a minimal spinner while auth is resolving (e.g. on slow first load) */
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: 'var(--bg)', color: 'var(--muted)', fontSize: '.9rem',
      }}>
        <div style={{ textAlign: 'center', display: 'grid', gap: 14 }}>
          <div style={{
            width: 36, height: 36, border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)', borderRadius: '50%',
            animation: 'spin 0.7s linear infinite', margin: '0 auto',
          }} />
          <span>Loading…</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={roleHome[user.role]} replace />;
  return <Outlet />;
}
