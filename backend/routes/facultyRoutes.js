/**
 * Faculty routes — all endpoints require authenticate + faculty role.
 *
 * All routes are mounted under /api/v1/faculty
 */

import { Router } from 'express';
import * as c from '../controllers/facultyController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const r = Router();

r.use(authenticate, requireRole('faculty'));

/* ── Courses ── */
r.get('/courses',                          c.getCourses);
r.get('/courses/:courseId/students',       c.getCourseStudents);

/* ── Schedule ── */
r.get('/schedule',                         c.getSchedule);

/* ── Students ── */
r.get('/students',                         c.getAllStudents);

/* ── Attendance ── */
r.get('/attendance/summary',               c.getAttendanceSummary);
r.get('/attendance/course/:courseId',      c.getCourseAttendance);
r.post('/attendance/session/:sessionId',    c.markAttendance);

/* ── Assignments ── */
r.get('/assignments',                      c.getAssignments);
r.get('/assignments/:assignmentId',        c.getOneAssignment);
r.post('/assignments',                     c.createAssignment);
r.patch('/assignments/:assignmentId',      c.updateAssignment);
r.delete('/assignments/:assignmentId',     c.deleteAssignment);
r.get('/assignments/:assignmentId/roster', c.getAssignmentRoster);
r.patch('/assignments/:assignmentId/grade', c.gradeSubmission);

/* ── Announcements (owned) ── */
r.get('/announcements',                    c.getFacultyAnnouncements);
r.patch('/announcements/:id',              c.updateOwnAnnouncement);
r.delete('/announcements/:id',             c.deleteOwnAnnouncement);

export default r;
