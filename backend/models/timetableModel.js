/**
 * Timetable model — SQL queries for class_sessions, attendance_records,
 * and course_enrollments.
 *
 * Provides:
 *   - getStudentTimetable(userId)  → weekly class schedule
 *   - getStudentAttendance(userId) → per-subject attendance stats + history
 */

import { query } from '../config/db.js';

/**
 * Get the weekly timetable for a student.
 * Joins class_sessions → courses, faculty→users, rooms.
 * Returns one row per class session, grouped by day_of_week.
 */
export const getStudentTimetable = async (userId) => {
  const { rows } = await query(
    `SELECT
       cs.id           AS session_id,
       cs.day_of_week,
       to_char(cs.start_time, 'HH24:MI') AS start_time,
       to_char(cs.end_time,   'HH24:MI') AS end_time,
       c.code           AS course_code,
       c.name           AS course_name,
       c.id             AS course_id,
       u.name           AS faculty_name,
       r.name           AS room_name,
       r.room_code
     FROM class_sessions cs
     JOIN course_enrollments ce ON ce.course_id = cs.course_id
     JOIN students s ON s.id = ce.student_id
     JOIN courses c ON c.id = cs.course_id
     JOIN faculty f ON f.id = cs.faculty_id
     JOIN users u ON u.id = f.user_id
     LEFT JOIN rooms r ON r.id = cs.room_id
     WHERE s.user_id = $1
     ORDER BY cs.day_of_week, cs.start_time`,
    [userId],
  );
  return rows;
};

/**
 * Get attendance records for a student.
 * Returns both per-subject summary and individual records.
 */
export const getStudentAttendance = async (userId) => {
  /* Per-subject summary: total, present, absent, late, on_leave counts + percentage */
  const summaryRows = await query(
    `SELECT
       c.id             AS course_id,
       c.code           AS course_code,
       c.name           AS course_name,
       COUNT(ar.id)     AS total_classes,
       COUNT(*) FILTER (WHERE ar.status = 'present') AS present,
       COUNT(*) FILTER (WHERE ar.status = 'absent')  AS absent,
       COUNT(*) FILTER (WHERE ar.status = 'late')    AS late,
       COUNT(*) FILTER (WHERE ar.status = 'on_leave') AS on_leave
     FROM course_enrollments ce
     JOIN students s ON s.id = ce.student_id
     JOIN courses c ON c.id = ce.course_id
     JOIN class_sessions cs ON cs.course_id = c.id
     JOIN attendance_records ar ON ar.class_session_id = cs.id AND ar.student_id = s.id
     WHERE s.user_id = $1
     GROUP BY c.id, c.code, c.name
     ORDER BY c.code`,
    [userId],
  );

  /* Individual attendance records with class details */
  const historyRows = await query(
    `SELECT
       ar.id            AS record_id,
       ar.status,
       ar.marked_at,
       c.code           AS course_code,
       c.name           AS course_name,
       cs.day_of_week,
       to_char(cs.start_time, 'HH24:MI') AS start_time,
       u.name           AS faculty_name,
       r.name           AS room_name
     FROM attendance_records ar
     JOIN students s ON s.id = ar.student_id
     JOIN class_sessions cs ON cs.id = ar.class_session_id
     JOIN courses c ON c.id = cs.course_id
     LEFT JOIN faculty f ON f.id = cs.faculty_id
     LEFT JOIN users u ON u.id = f.user_id
     LEFT JOIN rooms r ON r.id = cs.room_id
     WHERE s.user_id = $1
     ORDER BY ar.marked_at DESC
     LIMIT 50`,
    [userId],
  );

  return {
    summary: summaryRows.rows.map((r) => ({
      ...r,
      total_classes: Number(r.total_classes),
      present: Number(r.present),
      absent: Number(r.absent),
      late: Number(r.late),
      on_leave: Number(r.on_leave),
    })),
    history: historyRows.rows.map((r) => ({
      ...r,
      day_of_week: Number(r.day_of_week),
    })),
  };
};

/**
 * Get student's enrolled courses (for subject info display).
 */
export const getStudentCourses = async (userId) => {
  const { rows } = await query(
    `SELECT
       c.id, c.code, c.name, c.credits,
       u.name AS faculty_name,
       f.designation
     FROM course_enrollments ce
     JOIN students s ON s.id = ce.student_id
     JOIN courses c ON c.id = ce.course_id
     LEFT JOIN class_sessions cs ON cs.course_id = c.id
     LEFT JOIN faculty f ON f.id = cs.faculty_id
     LEFT JOIN users u ON u.id = f.user_id
     WHERE s.user_id = $1
     GROUP BY c.id, c.code, c.name, c.credits, u.name, f.designation
     ORDER BY c.code`,
    [userId],
  );
  return rows;
};
