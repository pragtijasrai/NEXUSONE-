/**
 * AppRoutes — React Router v6 with route-level lazy loading.
 *
 * Every portal (student/faculty/admin/maintenance) is code-split with
 * React.lazy() so the initial bundle only contains the public pages.
 * Each portal chunk is loaded on demand when the user navigates there.
 *
 * React.Suspense with a minimal spinner handles the brief load delay.
 */
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute  from './ProtectedRoute.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';

/* ── Public pages (always in main bundle — small, needed immediately) ── */
import Landing        from '../pages/public/Landing.jsx';
import Login          from '../pages/public/Login.jsx';
import Register       from '../pages/public/Register.jsx';
import ForgotPassword from '../pages/public/ForgotPassword.jsx';
import ResetPassword  from '../pages/public/ResetPassword.jsx';
import NotFound       from '../pages/NotFound.jsx';
import ComingSoon     from '../pages/ComingSoon.jsx';

/* ── Student portal — lazy chunk ── */
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard.jsx'));
const RoomBooking      = lazy(() => import('../pages/student/RoomBooking.jsx'));
const CampusEvents     = lazy(() => import('../pages/student/CampusEvents.jsx'));
const AIAssistant      = lazy(() => import('../pages/student/AIAssistant.jsx'));
const CampusMap        = lazy(() => import('../pages/student/CampusMap.jsx'));
const MyClasses        = lazy(() => import('../pages/student/MyClasses.jsx'));
const Maintenance      = lazy(() => import('../pages/student/Maintenance.jsx'));
const LostFound        = lazy(() => import('../pages/student/LostFound.jsx'));
const Announcements    = lazy(() => import('../pages/student/Announcements.jsx'));
const Notifications    = lazy(() => import('../pages/student/Notifications.jsx'));
const Profile          = lazy(() => import('../pages/student/Profile.jsx'));

/* ── Faculty portal — lazy chunk ── */
const FacultyDashboard      = lazy(() => import('../pages/faculty/FacultyDashboard.jsx'));
const FacultyClasses        = lazy(() => import('../pages/faculty/FacultyClasses.jsx'));
const FacultyTimetable      = lazy(() => import('../pages/faculty/FacultyTimetable.jsx'));
const FacultyAttendance     = lazy(() => import('../pages/faculty/FacultyAttendance.jsx'));
const FacultyStudents       = lazy(() => import('../pages/faculty/FacultyStudents.jsx'));
const FacultyAssignments    = lazy(() => import('../pages/faculty/FacultyAssignments.jsx'));
const FacultyAnnouncements  = lazy(() => import('../pages/faculty/FacultyAnnouncements.jsx'));
const FacultyNotifications  = lazy(() => import('../pages/faculty/FacultyNotifications.jsx'));
const FacultyEvents         = lazy(() => import('../pages/faculty/FacultyEvents.jsx'));
const FacultyRoomBooking    = lazy(() => import('../pages/faculty/FacultyRoomBooking.jsx'));
const FacultyProfile        = lazy(() => import('../pages/faculty/FacultyProfile.jsx'));

/* ── Admin portal — lazy chunk ── */
const AdminDashboard     = lazy(() => import('../pages/admin/AdminDashboard.jsx'));
const AdminUsers         = lazy(() => import('../pages/admin/AdminUsers.jsx'));
const AdminCourses       = lazy(() => import('../pages/admin/AdminCourses.jsx'));
const AdminRooms         = lazy(() => import('../pages/admin/AdminRooms.jsx'));
const AdminSessions      = lazy(() => import('../pages/admin/AdminSessions.jsx'));
const AdminAttendance    = lazy(() => import('../pages/admin/AdminAttendance.jsx'));
const AdminBookings      = lazy(() => import('../pages/admin/AdminBookings.jsx'));
const AdminReports       = lazy(() => import('../pages/admin/AdminReports.jsx'));
const AdminSettings      = lazy(() => import('../pages/admin/AdminSettings.jsx'));
const AdminMaintenance   = lazy(() => import('../pages/admin/AdminMaintenance.jsx'));
const AdminAnnouncements = lazy(() => import('../pages/admin/AdminAnnouncements.jsx'));

/* ── Maintenance portal — lazy chunk ── */
const MaintenanceDashboard = lazy(() => import('../pages/maintenance/MaintenanceDashboard.jsx'));
const MaintenanceTickets   = lazy(() => import('../pages/maintenance/MaintenanceTickets.jsx'));
const MaintenanceSchedule  = lazy(() => import('../pages/maintenance/MaintenanceSchedule.jsx'));
const MaintenanceReports   = lazy(() => import('../pages/maintenance/MaintenanceReports.jsx'));
const MaintenanceSettings  = lazy(() => import('../pages/maintenance/MaintenanceSettings.jsx'));

/* ── Minimal fallback spinner shown during lazy-load ── */
function PageLoader() {
  return (
    <div style={{
      minHeight: '60vh', display: 'grid', placeItems: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{ textAlign: 'center', display: 'grid', gap: 14, color: 'var(--muted)' }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid var(--border)', borderTopColor: 'var(--primary)',
          borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto',
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public ── */}
        <Route path="/"                element={<Landing />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* ── Student portal ── */}
        <Route path="/student" element={<ProtectedRoute role="student" />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<StudentDashboard />} />
            <Route path="rooms"         element={<RoomBooking />} />
            <Route path="events"        element={<CampusEvents />} />
            <Route path="assistant"     element={<AIAssistant />} />
            <Route path="transport"     element={<CampusMap />} />
            <Route path="schedule"      element={<MyClasses />} />
            <Route path="maintenance"   element={<Maintenance />} />
            <Route path="lost-found"    element={<LostFound />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile"       element={<Profile />} />
          </Route>
        </Route>

        {/* ── Faculty portal ── */}
        <Route path="/faculty" element={<ProtectedRoute role="faculty" />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<FacultyDashboard />} />
            <Route path="classes"       element={<FacultyClasses />} />
            <Route path="schedule"      element={<FacultyClasses />} />
            <Route path="timetable"     element={<FacultyTimetable />} />
            <Route path="attendance"    element={<FacultyAttendance />} />
            <Route path="students"      element={<FacultyStudents />} />
            <Route path="assignments"   element={<FacultyAssignments />} />
            <Route path="submissions"   element={<FacultyAssignments />} />
            <Route path="announcements" element={<FacultyAnnouncements />} />
            <Route path="notifications" element={<FacultyNotifications />} />
            <Route path="events"        element={<FacultyEvents />} />
            <Route path="rooms"         element={<FacultyRoomBooking />} />
            <Route path="room-booking"  element={<FacultyRoomBooking />} />
            <Route path="profile"       element={<FacultyProfile />} />
          </Route>
        </Route>

        {/* ── Admin portal ── */}
        <Route path="/admin" element={<ProtectedRoute role="admin" />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<AdminDashboard />} />
            <Route path="users"         element={<AdminUsers />} />
            <Route path="courses"       element={<AdminCourses />} />
            <Route path="rooms"         element={<AdminRooms />} />
            <Route path="sessions"      element={<AdminSessions />} />
            <Route path="attendance"    element={<AdminAttendance />} />
            <Route path="bookings"      element={<AdminBookings />} />
            <Route path="events"        element={<CampusEvents />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="maintenance"   element={<AdminMaintenance />} />
            <Route path="reports"       element={<AdminReports />} />
            <Route path="settings"      element={<AdminSettings />} />
          </Route>
        </Route>

        {/* ── Maintenance portal ── */}
        <Route path="/maintenance" element={<ProtectedRoute role="maintenance" />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<MaintenanceDashboard />} />
            <Route path="tickets"   element={<MaintenanceTickets />} />
            <Route path="schedule"  element={<MaintenanceSchedule />} />
            <Route path="reports"   element={<MaintenanceReports />} />
            <Route path="settings"  element={<MaintenanceSettings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
