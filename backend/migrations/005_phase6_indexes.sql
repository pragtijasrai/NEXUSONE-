-- ─────────────────────────────────────────────────────────────────────────
-- NexusOne — Phase 6 performance indexes (005)
--
-- Adds indexes for the most frequently-queried columns that are not yet
-- indexed. All are CREATE INDEX IF NOT EXISTS so safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────

-- Lost & found — status and type are both filtered in list queries
CREATE INDEX IF NOT EXISTS idx_lf_type_status
  ON lost_and_found_items (type, status);

CREATE INDEX IF NOT EXISTS idx_lf_reported_by
  ON lost_and_found_items (reported_by);

-- Refresh tokens — common lookup by token_hash
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash
  ON refresh_tokens (token_hash);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user
  ON refresh_tokens (user_id, revoked_at);

-- Password reset tokens
CREATE INDEX IF NOT EXISTS idx_prt_hash
  ON password_reset_tokens (token_hash);

CREATE INDEX IF NOT EXISTS idx_prt_user
  ON password_reset_tokens (user_id, used_at);

-- Assignments — faculty queries by faculty_id
CREATE INDEX IF NOT EXISTS idx_assignments_faculty
  ON assignments (faculty_id);

CREATE INDEX IF NOT EXISTS idx_assignments_course
  ON assignments (course_id);

-- Assignment submissions — lookup by assignment
CREATE INDEX IF NOT EXISTS idx_submissions_assignment
  ON assignment_submissions (assignment_id);

CREATE INDEX IF NOT EXISTS idx_submissions_student
  ON assignment_submissions (student_id);

-- Attendance records — the most queried join (student + session)
CREATE INDEX IF NOT EXISTS idx_attendance_student
  ON attendance_records (student_id);

-- Course enrollments — faculty scoped student queries
CREATE INDEX IF NOT EXISTS idx_enrollments_course
  ON course_enrollments (course_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_student
  ON course_enrollments (student_id);

-- Class sessions — faculty schedule queries
CREATE INDEX IF NOT EXISTS idx_sessions_faculty
  ON class_sessions (faculty_id);

CREATE INDEX IF NOT EXISTS idx_sessions_course
  ON class_sessions (course_id);

-- Events — queries by created_by for faculty-owned events
CREATE INDEX IF NOT EXISTS idx_events_created_by
  ON events (created_by);

-- Event registrations — user event queries
CREATE INDEX IF NOT EXISTS idx_event_reg_user
  ON event_registrations (user_id);

-- Announcements — created_by for faculty-owned list
CREATE INDEX IF NOT EXISTS idx_announcements_created_by
  ON announcements (created_by);

-- Maintenance tickets — updated_at for ordering
CREATE INDEX IF NOT EXISTS idx_tickets_updated_at
  ON maintenance_tickets (updated_at DESC);

-- Ticket history — ordered queries per ticket
CREATE INDEX IF NOT EXISTS idx_ticket_history_ticket
  ON maintenance_ticket_history (ticket_id, created_at);
