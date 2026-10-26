import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { roleHome } from '../data/mockUsers.js';

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();

  /* While session is being restored from storage, don't redirect yet */
  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={roleHome[user.role]} replace />;
  return <Outlet />;
}
