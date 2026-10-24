import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Landing from '../pages/public/Landing.jsx';
import Login from '../pages/public/Login.jsx';
import NotFound from '../pages/NotFound.jsx';
import StudentDashboard from '../pages/student/StudentDashboard.jsx';
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/student" element={<ProtectedRoute role="student" />}>
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
