import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute   from './ProtectedRoute.jsx';
import DashboardLayout  from '../layouts/DashboardLayout.jsx';

// Public
import Landing          from '../pages/public/Landing.jsx';
import Login            from '../pages/public/Login.jsx';
import Register         from '../pages/public/Register.jsx';
import NotFound         from '../pages/NotFound.jsx';
import ComingSoon       from '../pages/ComingSoon.jsx';

// Student
import StudentDashboard from '../pages/student/StudentDashboard.jsx';
import RoomBooking      from '../pages/student/RoomBooking.jsx';
import CampusEvents     from '../pages/student/CampusEvents.jsx';
import AIAssistant      from '../pages/student/AIAssistant.jsx';
import CampusMap        from '../pages/student/CampusMap.jsx';
import MyClasses from '../pages/student/MyClasses.jsx';
import Maintenance      from '../pages/student/Maintenance.jsx';
import LostFound        from '../pages/student/LostFound.jsx';
import Announcements    from '../pages/student/Announcements.jsx';
import Notifications    from '../pages/student/Notifications.jsx';
import Profile          from '../pages/student/Profile.jsx';

// Faculty
import FacultyDashboard            from '../pages/faculty/FacultyDashboard.jsx';
import FacultyClasses               from '../pages/faculty/FacultyClasses.jsx';
import FacultyTimetable             from '../pages/faculty/FacultyTimetable.jsx';
import FacultyAttendance            from '../pages/faculty/FacultyAttendance.jsx';
import FacultyStudents              from '../pages/faculty/FacultyStudents.jsx';
import FacultyAssignments           from '../pages/faculty/FacultyAssignments.jsx';
import FacultyAnnouncements         from '../pages/faculty/FacultyAnnouncements.jsx';
import FacultyNotifications         from '../pages/faculty/FacultyNotifications.jsx';
import FacultyEvents                from '../pages/faculty/FacultyEvents.jsx';
import FacultyRoomBooking           from '../pages/faculty/FacultyRoomBooking.jsx';
import FacultyProfile               from '../pages/faculty/FacultyProfile.jsx';

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
import MaintenanceDashboard  from '../pages/maintenance/MaintenanceDashboard.jsx';
import MaintenanceTickets    from '../pages/maintenance/MaintenanceTickets.jsx';
import MaintenanceSchedule   from '../pages/maintenance/MaintenanceSchedule.jsx';
import MaintenanceReports    from '../pages/maintenance/MaintenanceReports.jsx';
import MaintenanceSettings   from '../pages/maintenance/MaintenanceSettings.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Landing />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student portal */}
      <Route path="/student" element={<ProtectedRoute role="student" />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"    element={<StudentDashboard />} />
          <Route path="rooms"        element={<RoomBooking />} />
          <Route path="events"       element={<CampusEvents />} />
          <Route path="assistant"    element={<AIAssistant />} />
          <Route path="transport"    element={<CampusMap />} />
          <Route path="schedule" element={<MyClasses />} />
          <Route path="maintenance"  element={<Maintenance />} />
          <Route path="lost-found"   element={<LostFound />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile"       element={<Profile />} />
        </Route>
      </Route>

      {/* Faculty portal */}
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
          <Route path="tickets"   element={<MaintenanceTickets />} />
          <Route path="schedule"  element={<MaintenanceSchedule />} />
          <Route path="reports"   element={<MaintenanceReports />} />
          <Route path="settings"  element={<MaintenanceSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
