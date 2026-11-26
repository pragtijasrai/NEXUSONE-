/**
 * Faculty controller — thin HTTP layer over facultyModel.
 *
 * Every endpoint enforces faculty ownership:
 *   1. authenticate middleware verifies the JWT
 *   2. requireRole('faculty') middleware checks role
 *   3. Controller resolves faculty_id from user_id and passes to model
 *   4. For updates/deletes, ownership is verified before proceeding
 *
 * Endpoints:
 *   GET    /faculty/courses                        — assigned courses
 *   GET    /faculty/schedule                       — weekly class schedule
 *   GET    /faculty/courses/:courseId/students      — enrolled students for a course
 *   GET    /faculty/students                       — all students across courses
 *   GET    /faculty/attendance/summary              — per-course attendance summary
 *   GET    /faculty/attendance/course/:courseId     — attendance history for a course
 *   POST   /faculty/attendance/session/:sessionId   — mark attendance
 *   GET    /faculty/assignments                     — all assignments
 *   GET    /faculty/assignments/:assignmentId       — single assignment + submissions
 *   POST   /faculty/assignments                     — create assignment
 *   PATCH  /faculty/assignments/:assignmentId       — update assignment
 *   DELETE /faculty/assignments/:assignmentId       — delete assignment
 *   GET    /faculty/assignments/:assignmentId/roster — full roster (submitters + non-submitters)
 *   PATCH  /faculty/assignments/:assignmentId/grade — grade a student's submission
 *   GET    /faculty/announcements                   — announcements created by this faculty
 */

import * as fm from '../models/facultyModel.js';
import * as am from '../models/announcementModel.js';
import { AppError, asyncHandler } from '../utils/AppError.js';

/* ── Helper: resolve faculty profile or 403 ── */
async function requireFacultyProfile(userId) {
  const fac = await fm.getFacultyId(userId);
  if (!fac) throw new AppError(403, 'Faculty profile not found', 'NO_FACULTY_PROFILE');
  return fac;
}

/* ── Courses ── */
export const getCourses = asyncHandler(async (req, res) => {
  const fac = await requireFacultyProfile(req.user.sub);
  const courses = await fm.getFacultyCourses(fac.id);
  res.json({ success: true, message: 'Courses retrieved', data: { courses, profile: fac } });
});

/* ── Schedule ── */
export const getSchedule = asyncHandler(async (req, res) => {
  const fac = await requireFacultyProfile(req.user.sub);
  const sessions = await fm.getFacultySchedule(fac.id);
  res.json({ success: true, message: 'Schedule retrieved', data: { sessions } });
});

/* ── Course students ── */
export const getCourseStudents = asyncHandler(async (req, res) => {
  const fac = await requireFacultyProfile(req.user.sub);
  /* Verify faculty teaches this course */
  const courses = await fm.getFacultyCourses(fac.id);
  if (!courses.some((c) => String(c.id) === String(req.params.courseId))) {
    throw new AppError(403, 'You do not teach this course', 'FORBIDDEN');
  }
  const students = await fm.getCourseStudents(req.params.courseId);
  res.json({ success: true, message: 'Students retrieved', data: { students } });
});

/* ── All faculty students ── */
export const getAllStudents = asyncHandler(async (req, res) => {
  const fac = await requireFacultyProfile(req.user.sub);
  const students = await fm.getAllFacultyStudents(fac.id);
  res.json({ success: true, message: 'Students retrieved', data: { students } });
});

/* ── Attendance summary ── */
export const getAttendanceSummary = asyncHandler(async (req, res) => {
  const fac = await requireFacultyProfile(req.user.sub);
  const summary = await fm.getFacultyAttendanceSummary(fac.id);
  res.json({ success: true, message: 'Attendance summary retrieved', data: { summary } });
});

/* ── Course attendance history ── */
export const getCourseAttendance = asyncHandler(async (req, res) => {
  const fac = await requireFacultyProfile(req.user.sub);
  const courses = await fm.getFacultyCourses(fac.id);
  if (!courses.some((c) => String(c.id) === String(req.params.courseId))) {
    throw new AppError(403, 'You do not teach this course', 'FORBIDDEN');
  }
  const history = await fm.getCourseAttendanceHistory(req.params.courseId, 50);
  res.json({ success: true, message: 'Attendance history retrieved', data: { history } });
});

/* ── Mark attendance ── */
export const markAttendance = asyncHandler(async (req, res) => {
  const fac = await requireFacultyProfile(req.user.sub);
  const { records } = req.body;
  if (!Array.isArray(records) || records.length === 0) {
    throw new AppError(400, 'records array is required', 'VALIDATION');
  }
  /* Validate each record */
  for (const r of records) {
    if (!r.student_id || !r.status || !['present','absent','late','on_leave'].includes(r.status)) {
      throw new AppError(400, 'Each record needs student_id and valid status', 'VALIDATION');
    }
  }
  const result = await fm.markAttendance(req.params.sessionId, records, fac.id, req.user.sub);
  if (!result) throw new AppError(404, 'Class session not found or not owned by you', 'NOT_FOUND');
  res.json({ success: true, message: `Attendance saved for ${result.marked} students`, data: result });
});

/* ── Assignments ── */
export const getAssignments = asyncHandler(async (req, res) => {
  const fac = await requireFacultyProfile(req.user.sub);
  const assignments = await fm.getFacultyAssignments(fac.id);
  res.json({ success: true, message: 'Assignments retrieved', data: { assignments } });
});

export const getOneAssignment = asyncHandler(async (req, res) => {
  const fac = await requireFacultyProfile(req.user.sub);
  const assignment = await fm.getAssignmentById(req.params.assignmentId);
  if (!assignment) throw new AppError(404, 'Assignment not found', 'NOT_FOUND');
  if (assignment.faculty_id !== fac.id) throw new AppError(403, 'You do not own this assignment', 'FORBIDDEN');
  const submissions = await fm.getAssignmentSubmissions(req.params.assignmentId);
  res.json({ success: true, message: 'Assignment retrieved', data: { assignment, submissions } });
});

export const createAssignment = asyncHandler(async (req, res) => {
  const fac = await requireFacultyProfile(req.user.sub);
  const { courseId, title, description, dueDate, maxMarks } = req.body;
  if (!courseId || !title || !dueDate) {
    throw new AppError(400, 'courseId, title, and dueDate are required', 'VALIDATION');
  }
  /* Verify faculty teaches this course */
  const courses = await fm.getFacultyCourses(fac.id);
  if (!courses.some((c) => String(c.id) === String(courseId))) {
    throw new AppError(403, 'You do not teach this course', 'FORBIDDEN');
  }
  const assignment = await fm.createAssignment({
    facultyId: fac.id,
    courseId: Number(courseId),
    title: title.trim(),
    description: description?.trim() || null,
    dueDate,
    maxMarks: maxMarks ? Number(maxMarks) : 100,
  });
  res.status(201).json({ success: true, message: 'Assignment created', data: { assignment } });
});

export const updateAssignment = asyncHandler(async (req, res) => {
  const fac = await requireFacultyProfile(req.user.sub);
  const existing = await fm.getAssignmentById(req.params.assignmentId);
  if (!existing) throw new AppError(404, 'Assignment not found', 'NOT_FOUND');
  if (existing.faculty_id !== fac.id) throw new AppError(403, 'You do not own this assignment', 'FORBIDDEN');
  const { title, description, dueDate, maxMarks } = req.body;
  const updated = await fm.updateAssignment(req.params.assignmentId, {
    title: title?.trim(), description: description?.trim(),
    dueDate, maxMarks: maxMarks ? Number(maxMarks) : undefined,
  });
  res.json({ success: true, message: 'Assignment updated', data: { assignment: updated } });
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  const fac = await requireFacultyProfile(req.user.sub);
  const existing = await fm.getAssignmentById(req.params.assignmentId);
  if (!existing) throw new AppError(404, 'Assignment not found', 'NOT_FOUND');
  if (existing.faculty_id !== fac.id) throw new AppError(403, 'You do not own this assignment', 'FORBIDDEN');
  await fm.deleteAssignment(req.params.assignmentId);
  res.status(204).send();
});

/* ── Assignment roster (submitters + non-submitters) ── */
export const getAssignmentRoster = asyncHandler(async (req, res) => {
  const fac = await requireFacultyProfile(req.user.sub);
  const assignment = await fm.getAssignmentById(req.params.assignmentId);
  if (!assignment) throw new AppError(404, 'Assignment not found', 'NOT_FOUND');
  if (assignment.faculty_id !== fac.id) throw new AppError(403, 'You do not own this assignment', 'FORBIDDEN');
  const roster = await fm.getAssignmentRoster(req.params.assignmentId);
  res.json({ success: true, message: 'Roster retrieved', data: { assignment, roster } });
});

/* ── Grade a submission ── */
export const gradeSubmission = asyncHandler(async (req, res) => {
  const fac = await requireFacultyProfile(req.user.sub);
  const { studentId, grade } = req.body;
  if (!studentId || grade === undefined || grade === null) {
    throw new AppError(400, 'studentId and grade are required', 'VALIDATION');
  }
  const assignment = await fm.getAssignmentById(req.params.assignmentId);
  if (!assignment) throw new AppError(404, 'Assignment not found', 'NOT_FOUND');
  if (assignment.faculty_id !== fac.id) throw new AppError(403, 'You do not own this assignment', 'FORBIDDEN');

  const numGrade = Number(grade);
  if (isNaN(numGrade) || numGrade < 0) {
    throw new AppError(400, 'Grade must be a non-negative number', 'VALIDATION');
  }
  if (assignment.max_marks && numGrade > assignment.max_marks) {
    throw new AppError(400, `Grade cannot exceed max marks (${assignment.max_marks})`, 'VALIDATION');
  }

  const sub = await fm.gradeSubmission(req.params.assignmentId, studentId, numGrade, req.user.sub);
  res.json({ success: true, message: 'Grade saved', data: { submission: sub } });
});

/* ── Faculty announcements (owned) ── */
export const getFacultyAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await fm.getFacultyAnnouncements(req.user.sub);
  res.json({ success: true, message: 'Announcements retrieved', data: { announcements } });
});

/* ── Delete own announcement (with ownership check) ── */
export const deleteOwnAnnouncement = asyncHandler(async (req, res) => {
  const owns = await fm.ownsAnnouncement(req.params.id, req.user.sub);
  if (!owns) throw new AppError(403, 'You can only delete your own announcements', 'FORBIDDEN');
  await am.remove(req.params.id);
  res.status(204).send();
});

/* ── Update own announcement (with ownership check) ── */
export const updateOwnAnnouncement = asyncHandler(async (req, res) => {
  const owns = await fm.ownsAnnouncement(req.params.id, req.user.sub);
  if (!owns) throw new AppError(403, 'You can only edit your own announcements', 'FORBIDDEN');
  const updated = await am.update(req.params.id, req.body);
  if (!updated) throw new AppError(404, 'Announcement not found', 'NOT_FOUND');
  res.json({ success: true, message: 'Announcement updated', data: { announcement: updated } });
});
