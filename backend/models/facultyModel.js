/**
 * Faculty model — SQL queries scoped to a faculty member.
 *
 * All queries filter by faculty_id which is resolved from the authenticated
 * user's ID via the faculty table.
 *
 * Tables used: courses, class_sessions, course_enrollments, students, users,
 *              attendance_records, assignments, assignment_submissions,
 *              announcements, rooms
 */

import { query } from '../config/db.js';

/* ── Resolve faculty profile ID from user ID ── */
export const getFacultyId = async (userId) => {
  const row = (await query(`SELECT id, employee_id, designation FROM faculty WHERE user_id = $1`, [userId])).rows[0];
  return row ?? null;
};

/* ── Get faculty's assigned courses with enrollment counts ── */
export const getFacultyCourses = async (facultyId) => {
  const { rows } = await query(
    `SELECT DISTINCT
       c.id, c.code, c.name, c.credits,
       (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.course_id = c.id) AS enrolled_count,
       (SELECT COUNT(*) FROM class_sessions cs WHERE cs.course_id = c.id AND cs.faculty_id = $1) AS session_count
     FROM courses c
     JOIN class_sessions cs ON cs.course_id = c.id
     WHERE cs.faculty_id = $1
     ORDER BY c.code`,
    [facultyId],
  );
  return rows.map((r) => ({ ...r, enrolled_count: Number(r.enrolled_count), session_count: Number(r.session_count) }));
};

/* ── Get faculty's weekly schedule (class_sessions grouped by day) ── */
export const getFacultySchedule = async (facultyId) => {
  const { rows } = await query(
    `SELECT
       cs.id           AS session_id,
       cs.day_of_week,
       to_char(cs.start_time, 'HH24:MI') AS start_time,
       to_char(cs.end_time,   'HH24:MI') AS end_time,
       c.id             AS course_id,
       c.code           AS course_code,
       c.name           AS course_name,
       r.name           AS room_name,
       r.room_code,
       (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.course_id = c.id) AS enrolled_count
     FROM class_sessions cs
     JOIN courses c ON c.id = cs.course_id
     LEFT JOIN rooms r ON r.id = cs.room_id
     WHERE cs.faculty_id = $1
     ORDER BY cs.day_of_week, cs.start_time`,
    [facultyId],
  );
  return rows.map((r) => ({ ...r, day_of_week: Number(r.day_of_week), enrolled_count: Number(r.enrolled_count) }));
};

/* ── Get enrolled students for a specific course ── */
export const getCourseStudents = async (courseId) => {
  const { rows } = await query(
    `SELECT
       s.id           AS student_id,
       u.id           AS user_id,
       u.name,
       u.email,
       s.roll_number,
       s.semester,
       (SELECT COUNT(*) FROM attendance_records ar
        JOIN class_sessions cs ON cs.id = ar.class_session_id
        WHERE cs.course_id = $1 AND ar.student_id = s.id
        AND ar.status = 'present') AS present_count,
       (SELECT COUNT(*) FROM attendance_records ar
        JOIN class_sessions cs ON cs.id = ar.class_session_id
        WHERE cs.course_id = $1 AND ar.student_id = s.id) AS total_attendance
     FROM course_enrollments ce
     JOIN students s ON s.id = ce.student_id
     JOIN users u ON u.id = s.user_id
     WHERE ce.course_id = $1
     ORDER BY u.name`,
    [courseId],
  );
  return rows.map((r) => ({
    ...r,
    present_count: Number(r.present_count),
    total_attendance: Number(r.total_attendance),
  }));
};

/* ── Get all students across faculty's courses (for student directory) ── */
export const getAllFacultyStudents = async (facultyId) => {
  const { rows } = await query(
    `SELECT DISTINCT ON (s.id)
       s.id           AS student_id,
       u.id           AS user_id,
       u.name,
       u.email,
       s.roll_number,
       s.semester,
       c.code           AS course_code,
       c.name           AS course_name,
       (SELECT COUNT(*) FROM attendance_records ar
        JOIN class_sessions cs ON cs.id = ar.class_session_id
        WHERE cs.course_id = c.id AND ar.student_id = s.id
        AND ar.status = 'present') AS present_count,
       (SELECT COUNT(*) FROM attendance_records ar
        JOIN class_sessions cs ON cs.id = ar.class_session_id
        WHERE cs.course_id = c.id AND ar.student_id = s.id) AS total_attendance
     FROM course_enrollments ce
     JOIN students s ON s.id = ce.student_id
     JOIN users u ON u.id = s.user_id
     JOIN courses c ON c.id = ce.course_id
     JOIN class_sessions cs ON cs.course_id = c.id AND cs.faculty_id = $1
     ORDER BY s.id, u.name`,
    [facultyId],
  );
  return rows.map((r) => ({
    ...r,
    present_count: Number(r.present_count),
    total_attendance: Number(r.total_attendance),
  }));
};

/* ── Get attendance summary per course (for faculty overview) ── */
export const getFacultyAttendanceSummary = async (facultyId) => {
  const { rows } = await query(
    `SELECT
       c.id       AS course_id,
       c.code     AS course_code,
       c.name     AS course_name,
       COUNT(DISTINCT ar.id) AS total_records,
       COUNT(*) FILTER (WHERE ar.status = 'present') AS present,
       COUNT(*) FILTER (WHERE ar.status = 'absent')  AS absent,
       COUNT(*) FILTER (WHERE ar.status = 'late')    AS late,
       COUNT(*) FILTER (WHERE ar.status = 'on_leave') AS on_leave
     FROM class_sessions cs
     JOIN courses c ON c.id = cs.course_id
     JOIN attendance_records ar ON ar.class_session_id = cs.id
     WHERE cs.faculty_id = $1
     GROUP BY c.id, c.code, c.name
     ORDER BY c.code`,
    [facultyId],
  );
  return rows.map((r) => ({
    ...r,
    total_records: Number(r.total_records),
    present: Number(r.present),
    absent: Number(r.absent),
    late: Number(r.late),
    on_leave: Number(r.on_leave),
  }));
};

/* ── Get attendance history for a specific course (recent sessions) ── */
export const getCourseAttendanceHistory = async (courseId, limit = 20) => {
  const { rows } = await query(
    `SELECT
       ar.id           AS record_id,
       ar.status,
       ar.marked_at,
       cs.id           AS session_id,
       cs.day_of_week,
       to_char(cs.start_time, 'HH24:MI') AS start_time,
       u.name          AS student_name,
       s.roll_number   AS student_roll,
       u.id            AS student_user_id
     FROM attendance_records ar
     JOIN class_sessions cs ON cs.id = ar.class_session_id
     JOIN courses c ON c.id = cs.course_id
     JOIN students s ON s.id = ar.student_id
     JOIN users u ON u.id = s.user_id
     WHERE c.id = $1
     ORDER BY ar.marked_at DESC
     LIMIT $2`,
    [courseId, limit],
  );
  return rows.map((r) => ({ ...r, day_of_week: Number(r.day_of_week) }));
};

/* ── Mark attendance for a class session ── */
export const markAttendance = async (sessionId, records, facultyProfileId, markedByUserId) => {
  const { rows } = await query(
    `SELECT course_id FROM class_sessions WHERE id = $1`, [sessionId],
  );
  if (!rows[0]) return null;
  const courseId = rows[0].course_id;

  /* Verify faculty owns this session (by faculty profile id) */
  const owns = (await query(`SELECT 1 FROM class_sessions WHERE id = $1 AND faculty_id = $2`,
    [sessionId, facultyProfileId])).rows[0];
  if (!owns) return null;

  /* Upsert attendance records — marked_by uses users.id */
  let inserted = 0;
  for (const r of records) {
    const res = await query(
      `INSERT INTO attendance_records (class_session_id, student_id, status, marked_by, marked_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (class_session_id, student_id)
       DO UPDATE SET status = EXCLUDED.status, marked_by = EXCLUDED.marked_by, marked_at = now()
       RETURNING id`,
      [sessionId, r.student_id, r.status, markedByUserId],
    );
    if (res.rows[0]) inserted++;
  }
  return { courseId, marked: inserted };
};

/* ── Get faculty's announcements (owned) ── */
export const getFacultyAnnouncements = async (userId) => {
  const { rows } = await query(
    `SELECT a.*, u.name AS author_name
     FROM announcements a
     JOIN users u ON u.id = a.created_by
     WHERE a.created_by = $1
     ORDER BY a.created_at DESC`,
    [userId],
  );
  return rows;
};

/* ── Verify ownership of an announcement ── */
export const ownsAnnouncement = async (announcementId, userId) => {
  const row = (await query(`SELECT 1 FROM announcements WHERE id = $1 AND created_by = $2`,
    [announcementId, userId])).rows[0];
  return !!row;
};

/* ── Assignments ── */

export const getFacultyAssignments = async (facultyId) => {
  const { rows } = await query(
    `SELECT
       a.id, a.title, a.description, a.due_date, a.max_marks, a.created_at,
       c.id   AS course_id,
       c.code AS course_code,
       c.name AS course_name,
       (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.course_id = c.id) AS total_students,
       (SELECT COUNT(*) FROM assignment_submissions sub WHERE sub.assignment_id = a.id) AS submitted_count,
       (SELECT COUNT(*) FROM assignment_submissions sub WHERE sub.assignment_id = a.id AND sub.grade IS NOT NULL) AS graded_count
     FROM assignments a
     JOIN courses c ON c.id = a.course_id
     WHERE a.faculty_id = $1
     ORDER BY a.due_date DESC`,
    [facultyId],
  );
  return rows.map((r) => ({
    ...r,
    total_students: Number(r.total_students),
    submitted_count: Number(r.submitted_count),
    graded_count: Number(r.graded_count),
  }));
};

export const getAssignmentById = async (assignmentId) => {
  const row = (await query(
    `SELECT
       a.id, a.title, a.description, a.due_date, a.max_marks, a.created_at,
       c.id   AS course_id,
       c.code AS course_code,
       c.name AS course_name,
       a.faculty_id
     FROM assignments a
     JOIN courses c ON c.id = a.course_id
     WHERE a.id = $1`,
    [assignmentId],
  )).rows[0];
  return row;
};

export const createAssignment = async ({ facultyId, courseId, title, description, dueDate, maxMarks }) => {
  const { rows } = await query(
    `INSERT INTO assignments (course_id, faculty_id, title, description, due_date, max_marks)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [courseId, facultyId, title, description ?? null, dueDate, maxMarks ?? 100],
  );
  return rows[0];
};

export const updateAssignment = async (assignmentId, { title, description, dueDate, maxMarks }) => {
  const { rows } = await query(
    `UPDATE assignments SET
       title       = COALESCE($2, title),
       description = COALESCE($3, description),
       due_date    = COALESCE($4, due_date),
       max_marks   = COALESCE($5, max_marks)
     WHERE id = $1 RETURNING *`,
    [assignmentId, title, description, dueDate, maxMarks],
  );
  return rows[0];
};

export const deleteAssignment = async (assignmentId) => {
  await query(`DELETE FROM assignments WHERE id = $1`, [assignmentId]);
  return true;
};

export const getAssignmentSubmissions = async (assignmentId) => {
  const { rows } = await query(
    `SELECT
       sub.id, sub.assignment_id, sub.student_id,
       sub.file_url, sub.submitted_at, sub.grade, sub.graded_at, sub.graded_by,
       u.name  AS student_name,
       s.roll_number AS student_roll,
       u.email AS student_email
     FROM assignment_submissions sub
     JOIN students s ON s.id = sub.student_id
     JOIN users u ON u.id = s.user_id
     WHERE sub.assignment_id = $1
     ORDER BY sub.submitted_at DESC`,
    [assignmentId],
  );
  return rows;
};

/* ── Get all enrolled students for an assignment (including non-submitters) ── */
export const getAssignmentRoster = async (assignmentId) => {
  const { rows } = await query(
    `SELECT
       s.id    AS student_id,
       u.name  AS student_name,
       u.email AS student_email,
       s.roll_number AS student_roll,
       sub.id  AS submission_id,
       sub.file_url,
       sub.submitted_at,
       sub.grade,
       sub.graded_at,
       sub.graded_by,
       gu.name AS graded_by_name
     FROM assignments a
     JOIN courses c ON c.id = a.course_id
     JOIN course_enrollments ce ON ce.course_id = c.id
     JOIN students s ON s.id = ce.student_id
     JOIN users u ON u.id = s.user_id
     LEFT JOIN assignment_submissions sub ON sub.assignment_id = a.id AND sub.student_id = s.id
     LEFT JOIN users gu ON gu.id = sub.graded_by
     WHERE a.id = $1
     ORDER BY u.name`,
    [assignmentId],
  );
  return rows;
};

/* ── Grade a submission (upsert: create if not exists, update grade if exists) ── */
export const gradeSubmission = async (assignmentId, studentId, grade, gradedBy) => {
  const { rows } = await query(
    `INSERT INTO assignment_submissions (assignment_id, student_id, grade, graded_at, graded_by, submitted_at)
     VALUES ($1, $2, $3, now(), $4, now())
     ON CONFLICT (assignment_id, student_id)
     DO UPDATE SET grade = EXCLUDED.grade, graded_at = now(), graded_by = EXCLUDED.graded_by
     RETURNING *`,
    [assignmentId, studentId, grade, gradedBy],
  );
  return rows[0];
};
