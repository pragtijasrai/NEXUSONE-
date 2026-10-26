import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute   from './ProtectedRoute.jsx';
import DashboardLayout  from '../layouts/DashboardLayout.jsx';

// Public
import Landing          from '../pages/public/Landing.jsx';
import Login            from '../pages/public/Login.jsx';
import NotFound         from '../pages/NotFound.jsx';
import ComingSoon       from '../pages/ComingSoon.jsx';

// Student
import StudentDashboard from '../pages/student/StudentDashboard.jsx';
import RoomBooking      from '../pages/student/RoomBooking.jsx';
import CampusEvents     from '../pages/student/CampusEvents.jsx';
import AIAssistant      from '../pages/student/AIAssistant.jsx';
import CampusMap        from '../pages/student/CampusMap.jsx';

// Faculty
import FacultyDashboard from '../pages/faculty/FacultyDashboard.jsx';

// Admin
import AdminDashboard   from '../pages/admin/AdminDashboard.jsx';
import AdminUsers       from '../pages/admin/AdminUsers.jsx';
import AdminCourses     from '../pages/admin/AdminCourses.jsx';
import AdminRooms       from '../pages/admin/AdminRooms.jsx';
import AdminSessions    from '../pages/admin/AdminSessions.jsx';
import AdminAttendance  from '../pages/admin/AdminAttendance.jsx';
import AdminBookings    from '../pages/admin/AdminBookings.jsx';
import AdminReports     from '../pages/admin/AdminReports.jsx';
import AdminSettings    from '../pages/admin/AdminSettings.jsx';

// Maintenance
import MaintenanceDashboard from '../pages/maintenance/MaintenanceDashboard.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"      element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Student portal */}
      <Route path="/student" element={<ProtectedRoute role="student" />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"    element={<StudentDashboard />} />
          <Route path="rooms"        element={<RoomBooking />} />
          <Route path="events"       element={<CampusEvents />} />
          <Route path="assistant"    element={<AIAssistant />} />
          <Route path="transport"    element={<CampusMap />} />
          <Route path="schedule"     element={<ComingSoon />} />
          <Route path="maintenance"  element={<ComingSoon />} />
          <Route path="lost-found"   element={<ComingSoon />} />
          <Route path="announcements" element={<ComingSoon />} />
        </Route>
      </Route>

      {/* Faculty portal */}
      <Route path="/faculty" element={<ProtectedRoute role="faculty" />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"    element={<FacultyDashboard />} />
          <Route path="schedule"     element={<ComingSoon />} />
          <Route path="students"     element={<ComingSoon />} />
          <Route path="assignments"  element={<ComingSoon />} />
          <Route path="announcements" element={<ComingSoon />} />
          <Route path="events"       element={<ComingSoon />} />
          <Route path="rooms"        element={<RoomBooking />} />
        </Route>
      </Route>

      {/* Admin portal */}
      <Route path="/admin" element={<ProtectedRoute role="admin" />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"    element={<AdminDashboard />} />
          <Route path="users"        element={<AdminUsers />} />
          <Route path="courses"      element={<AdminCourses />} />
          <Route path="rooms"        element={<AdminRooms />} />
          <Route path="sessions"     element={<AdminSessions />} />
          <Route path="attendance"   element={<AdminAttendance />} />
          <Route path="bookings"     element={<AdminBookings />} />
          <Route path="events"       element={<CampusEvents />} />
          <Route path="announcements" element={<ComingSoon />} />
          <Route path="maintenance"  element={<ComingSoon />} />
          <Route path="reports"      element={<AdminReports />} />
          <Route path="settings"     element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Maintenance portal */}
      <Route path="/maintenance" element={<ProtectedRoute role="maintenance" />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MaintenanceDashboard />} />
          <Route path="tickets"   element={<ComingSoon />} />
          <Route path="schedule"  element={<ComingSoon />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
