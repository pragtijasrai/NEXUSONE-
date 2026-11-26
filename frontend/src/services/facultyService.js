/**
 * Faculty service — API calls for faculty-specific endpoints.
 *
 * All endpoints are under /faculty/* and require faculty role.
 */

import { api } from './apiClient.js';

/* ── Courses ── */
export const getFacultyCourses  = () => api('/faculty/courses').then(r => r.data);
export const getCourseStudents  = (courseId) => api(`/faculty/courses/${courseId}/students`).then(r => r.data.students);

/* ── Schedule ── */
export const getFacultySchedule = () => api('/faculty/schedule').then(r => r.data);

/* ── Students ── */
export const getFacultyStudents = () => api('/faculty/students').then(r => r.data.students);

/* ── Attendance ── */
export const getAttendanceSummary    = () => api('/faculty/attendance/summary').then(r => r.data.summary);
export const getCourseAttendance      = (courseId) => api(`/faculty/attendance/course/${courseId}`).then(r => r.data.history);
export const markAttendance           = (sessionId, records) => api(`/faculty/attendance/session/${sessionId}`, { method: 'POST', body: { records } }).then(r => r.data);

/* ── Assignments ── */
export const getAssignments           = () => api('/faculty/assignments').then(r => r.data.assignments);
export const getAssignment             = (id) => api(`/faculty/assignments/${id}`).then(r => r.data);
export const createAssignment          = (body) => api('/faculty/assignments', { method: 'POST', body }).then(r => r.data.assignment);
export const updateAssignment          = (id, body) => api(`/faculty/assignments/${id}`, { method: 'PATCH', body }).then(r => r.data.assignment);
export const deleteAssignment          = (id) => api(`/faculty/assignments/${id}`, { method: 'DELETE' });
export const getAssignmentRoster       = (id) => api(`/faculty/assignments/${id}/roster`).then(r => r.data);
export const gradeStudent              = (assignmentId, studentId, grade) =>
  api(`/faculty/assignments/${assignmentId}/grade`, { method: 'PATCH', body: { studentId, grade } }).then(r => r.data);

/* ── Announcements (owned) ── */
export const getFacultyAnnouncements  = () => api('/faculty/announcements').then(r => r.data.announcements);
export const updateOwnAnnouncement      = (id, body) => api(`/faculty/announcements/${id}`, { method: 'PATCH', body }).then(r => r.data.announcement);
export const deleteOwnAnnouncement       = (id) => api(`/faculty/announcements/${id}`, { method: 'DELETE' });
