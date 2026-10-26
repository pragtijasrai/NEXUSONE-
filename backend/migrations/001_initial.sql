-- ─────────────────────────────────────────────────────────────────────────
-- NexusOne — Initial schema migration (001)
--
-- Table creation order follows the dependency graph so every referenced
-- table exists before any foreign key points to it:
--
--   departments
--   users            → departments
--   students         → users
--   faculty          → users
--   maintenance_staff → users
--   refresh_tokens   → users
--   password_reset_tokens → users
--   audit_logs       → users
--   courses          → departments
--   rooms            (no FK deps — moved up from CAMPUS SERVICES so
--                    class_sessions can reference it)
--   course_enrollments → students, courses
--   class_sessions   → courses, faculty, rooms
--   attendance_records → class_sessions, students, users
--   assignments      → courses, faculty
--   assignment_submissions → assignments, students, users
--   room_bookings    → rooms, users
--   maintenance_tickets → users, maintenance_staff
--   maintenance_ticket_history → maintenance_tickets, users
--   events           → users
--   event_registrations → events, users
--   announcements    → users
--   lost_and_found_items → users
--   notifications    → users
--
-- The btree_gist extension is enabled before room_bookings so the EXCLUDE
-- constraint can use the gist index method.
--
-- All tables use CREATE TABLE IF NOT EXISTS so the migration is safe to
-- re-run if it was partially applied and then rolled back.
--
-- Conventions:
--   • Primary keys:  BIGSERIAL (bigint auto-increment)
--   • Timestamps:    TIMESTAMPTZ (always UTC in the DB)
--   • FKs use ON DELETE CASCADE or SET NULL explicitly
--   • Enum-like columns use CHECK constraints
--
-- Syllabus: PostgreSQL Database Design (Syllabus E)
-- ─────────────────────────────────────────────────────────────────────────


-- ═══════════════════════════════════════════════════════════════
-- EXTENSIONS
-- Must come first. btree_gist is needed by the EXCLUDE constraint
-- on room_bookings. CREATE EXTENSION IF NOT EXISTS is idempotent.
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS btree_gist;


-- ═══════════════════════════════════════════════════════════════
-- IDENTITY & ACCESS
-- ═══════════════════════════════════════════════════════════════

-- Departments — referenced by users, courses
CREATE TABLE IF NOT EXISTS departments (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  code        TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users — central auth table, one row per person regardless of role
CREATE TABLE IF NOT EXISTS users (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('student','faculty','admin','maintenance')),
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','inactive','suspended')),
  department_id   BIGINT REFERENCES departments(id) ON DELETE SET NULL,
  phone           TEXT,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Role-specific profiles (1:1 with users)
CREATE TABLE IF NOT EXISTS students (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  roll_number     TEXT NOT NULL UNIQUE,
  semester        SMALLINT CHECK (semester BETWEEN 1 AND 12),
  enrollment_year INT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS faculty (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  employee_id     TEXT NOT NULL UNIQUE,
  designation     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maintenance_staff (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  employee_id     TEXT NOT NULL UNIQUE,
  specialization  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Refresh tokens for JWT rotation (Phase 2)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Password reset tokens (Phase 2)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit log — tracks privileged administrative actions (Phase 8)
CREATE TABLE IF NOT EXISTS audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  actor_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   BIGINT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════
-- ACADEMIC
-- ═══════════════════════════════════════════════════════════════

-- Courses — owned by a department
CREATE TABLE IF NOT EXISTS courses (
  id              BIGSERIAL PRIMARY KEY,
  code            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  department_id   BIGINT REFERENCES departments(id) ON DELETE SET NULL,
  credits         SMALLINT DEFAULT 4,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════
-- ROOMS — moved before class_sessions which reference rooms(id)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS rooms (
  id          BIGSERIAL PRIMARY KEY,
  room_code   TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  building    TEXT NOT NULL,
  capacity    INT NOT NULL CHECK (capacity > 0),
  type        TEXT NOT NULL CHECK (type IN ('seminar','lab','lecture','study','conference','other')),
  amenities   TEXT[],
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════
-- ACADEMIC (continued) — tables that depend on both courses and rooms
-- ═══════════════════════════════════════════════════════════════

-- Enrollments — which student is in which course
CREATE TABLE IF NOT EXISTS course_enrollments (
  id          BIGSERIAL PRIMARY KEY,
  student_id  BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id   BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);

-- Class sessions — a scheduled meeting of a course in a room
-- room_id references rooms(id) — rooms must exist before this table
CREATE TABLE IF NOT EXISTS class_sessions (
  id          BIGSERIAL PRIMARY KEY,
  course_id   BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  faculty_id  BIGINT NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  room_id     BIGINT REFERENCES rooms(id) ON DELETE SET NULL,
  day_of_week SMALLINT CHECK (day_of_week BETWEEN 0 AND 6),
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Attendance records — one per student per class session
-- marked_by is nullable (ON DELETE SET NULL) — cannot be NOT NULL
CREATE TABLE IF NOT EXISTS attendance_records (
  id               BIGSERIAL PRIMARY KEY,
  class_session_id BIGINT NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  student_id       BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status           TEXT NOT NULL DEFAULT 'present'
                   CHECK (status IN ('present','absent','late','on_leave')),
  marked_by        BIGINT REFERENCES users(id) ON DELETE SET NULL,
  marked_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_session_id, student_id)
);

-- Assignments — created by faculty for a course
CREATE TABLE IF NOT EXISTS assignments (
  id          BIGSERIAL PRIMARY KEY,
  course_id   BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  faculty_id  BIGINT NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  due_date    DATE NOT NULL,
  max_marks   INT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Submissions — one per student per assignment
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id            BIGSERIAL PRIMARY KEY,
  assignment_id BIGINT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id    BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  file_url      TEXT,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  grade         DECIMAL(5,2),
  graded_at     TIMESTAMPTZ,
  graded_by     BIGINT REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (assignment_id, student_id)
);


-- ═══════════════════════════════════════════════════════════════
-- CAMPUS SERVICES
-- ═══════════════════════════════════════════════════════════════

-- Room bookings — with EXCLUDE constraint to prevent overlapping reservations.
-- btree_gist extension (enabled at top) is required for the EXCLUDE constraint.
-- The EXCLUDE uses tstzrange so two bookings for the same room cannot overlap
-- in time — this is enforced at the DB level, even under concurrent requests.
CREATE TABLE IF NOT EXISTS room_bookings (
  id          BIGSERIAL PRIMARY KEY,
  room_id     BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ NOT NULL,
  purpose     TEXT,
  status      TEXT NOT NULL DEFAULT 'confirmed'
              CHECK (status IN ('pending','confirmed','cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT booking_end_after_start CHECK (end_time > start_time),
  CONSTRAINT no_overlapping_bookings EXCLUDE USING gist (
    room_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (status IN ('pending', 'confirmed'))
);

-- Maintenance tickets — fault reports created by any user
CREATE TABLE IF NOT EXISTS maintenance_tickets (
  id           BIGSERIAL PRIMARY KEY,
  created_by   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_to  BIGINT REFERENCES maintenance_staff(id) ON DELETE SET NULL,
  location     TEXT NOT NULL,
  issue        TEXT NOT NULL,
  priority     TEXT NOT NULL DEFAULT 'medium'
               CHECK (priority IN ('low','medium','high','urgent')),
  status       TEXT NOT NULL DEFAULT 'open'
               CHECK (status IN ('open','assigned','in_progress','resolved','closed')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at  TIMESTAMPTZ
);

-- Ticket history — every status change is recorded
CREATE TABLE IF NOT EXISTS maintenance_ticket_history (
  id          BIGSERIAL PRIMARY KEY,
  ticket_id   BIGINT NOT NULL REFERENCES maintenance_tickets(id) ON DELETE CASCADE,
  changed_by  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  old_status  TEXT,
  new_status  TEXT NOT NULL,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Events — campus events that users can register for
CREATE TABLE IF NOT EXISTS events (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  event_date  TIMESTAMPTZ NOT NULL,
  location    TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'general'
              CHECK (category IN ('technical','cultural','career','hobby','sports','general')),
  organizer   TEXT,
  capacity    INT NOT NULL DEFAULT 100 CHECK (capacity > 0),
  created_by  BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Event registrations — one per user per event
CREATE TABLE IF NOT EXISTS event_registrations (
  id            BIGSERIAL PRIMARY KEY,
  event_id      BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

-- Announcements — posted by faculty/admin, targeted by role
CREATE TABLE IF NOT EXISTS announcements (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'general'
              CHECK (category IN ('general','academic','events','transport','urgent')),
  priority    TEXT NOT NULL DEFAULT 'normal'
              CHECK (priority IN ('normal','urgent')),
  audience    TEXT NOT NULL DEFAULT 'all'
              CHECK (audience IN ('all','students','faculty','maintenance')),
  created_by  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'published'
              CHECK (status IN ('draft','published')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lost & found items
CREATE TABLE IF NOT EXISTS lost_and_found_items (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  location    TEXT,
  category    TEXT NOT NULL DEFAULT 'general'
              CHECK (category IN ('electronics','books','clothing','documents','general')),
  status      TEXT NOT NULL DEFAULT 'lost'
              CHECK (status IN ('lost','found','claimed','expired')),
  reported_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notifications (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT,
  type        TEXT NOT NULL DEFAULT 'info'
              CHECK (type IN ('info','success','warning','error')),
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_users_email             ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role              ON users (role);
CREATE INDEX IF NOT EXISTS idx_bookings_room_time      ON room_bookings (room_id, start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user           ON room_bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status          ON maintenance_tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by      ON maintenance_tickets (created_by);
CREATE INDEX IF NOT EXISTS idx_events_date             ON events (event_date);
CREATE INDEX IF NOT EXISTS idx_announcements_audience  ON announcements (audience);
CREATE INDEX IF NOT EXISTS idx_notifications_user      ON notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_attendance_session      ON attendance_records (class_session_id);
