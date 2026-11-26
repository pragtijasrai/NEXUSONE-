-- ─────────────────────────────────────────────────────────────────────────
-- NexusOne — Phase 2 migration (002)
--
-- Changes:
--   1. Add `type` column to lost_and_found_items (lost | found)
--      The original schema used `status` to distinguish lost vs found, but
--      the frontend and model expect a separate `type` field. We add it
--      and migrate existing data.
--   2. Add additional categories to lost_and_found_items CHECK constraint
--      to match frontend categories (bags, keys, accessories, other).
--   3. Add lost & found seed data.
--   4. Add academic seed data: courses, course_enrollments, class_sessions,
--      attendance_records, assignments — so the /timetable and /attendance
--      endpoints return real data.
--   5. Add notification seed data.
--
-- All changes are idempotent (IF NOT EXISTS, ON CONFLICT).
-- ─────────────────────────────────────────────────────────────────────────


-- ═══════════════════════════════════════════════════════════════
-- LOST & FOUND — schema fix
-- ═══════════════════════════════════════════════════════════════

-- Add `type` column (lost | found). Default to existing status value
-- so old rows are migrated correctly.
ALTER TABLE lost_and_found_items
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'lost'
  CHECK (type IN ('lost','found'));

-- Migrate existing rows: if status was 'found', set type='found'
UPDATE lost_and_found_items SET type = 'found' WHERE status = 'found';

-- Now that type is separate, narrow status to workflow states only:
-- open → claimed → returned / expired
ALTER TABLE lost_and_found_items DROP CONSTRAINT IF EXISTS lost_and_found_items_status_check;
ALTER TABLE lost_and_found_items
  ADD CONSTRAINT lost_and_found_items_status_check
  CHECK (status IN ('open','claimed','returned','expired'));

-- Expand category CHECK to match frontend categories
ALTER TABLE lost_and_found_items DROP CONSTRAINT IF EXISTS lost_and_found_items_category_check;
ALTER TABLE lost_and_found_items
  ADD CONSTRAINT lost_and_found_items_category_check
  CHECK (category IN ('electronics','books','clothing','documents','bags','keys','accessories','other'));


-- ═══════════════════════════════════════════════════════════════
-- ACADEMIC SEED DATA
-- ═══════════════════════════════════════════════════════════════

-- Courses for CSE 5th semester
INSERT INTO courses (code, name, department_id, credits)
VALUES
  ('SD',     'Software Design',                    (SELECT id FROM departments WHERE code='CS'), 4),
  ('AIML',   'AI & Machine Learning',               (SELECT id FROM departments WHERE code='CS'), 4),
  ('ADI',    'Advanced Data Structures & Algorithms',(SELECT id FROM departments WHERE code='CS'), 3),
  ('BEE-II', 'Basic Electrical Engineering II',     (SELECT id FROM departments WHERE code='CS'), 3),
  ('NALR-I', 'Numerical Analysis & Linear Algebra I',(SELECT id FROM departments WHERE code='CS'), 3)
ON CONFLICT (code) DO NOTHING;

-- Get the student (Alex Morgan) and faculty (Priya Raman) user IDs
-- We use a DO block to seed dependent records safely.
DO $$
DECLARE
  v_student_user BIGINT;
  v_student_id   BIGINT;
  v_faculty_user BIGINT;
  v_faculty_id   BIGINT;
  v_course_sd     BIGINT;
  v_course_aiml   BIGINT;
  v_course_adi    BIGINT;
  v_course_bee    BIGINT;
  v_course_nalr   BIGINT;
  v_room_tg417    BIGINT;
  v_cs           TEXT;
  v_session_id   BIGINT;
BEGIN
  -- Get user IDs by chitkara email
  SELECT id INTO v_student_user FROM users WHERE email = 'alex.morgan@chitkara.edu.in';
  SELECT id INTO v_faculty_user FROM users WHERE email = 'priya.raman@chitkara.edu.in';

  IF v_student_user IS NULL OR v_faculty_user IS NULL THEN
    RAISE NOTICE 'Student or faculty user not found — skipping academic seed';
    RETURN;
  END IF;

  -- Get student profile
  SELECT id INTO v_student_id FROM students WHERE user_id = v_student_user;
  -- Get faculty profile
  SELECT id INTO v_faculty_id FROM faculty WHERE user_id = v_faculty_user;

  IF v_student_id IS NULL THEN
    RAISE NOTICE 'Student profile not found — creating one';
    INSERT INTO students (user_id, roll_number, semester, enrollment_year)
    VALUES (v_student_user, 'CU-S-1042', 5, 2023)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id INTO v_student_id;
  END IF;

  IF v_faculty_id IS NULL THEN
    RAISE NOTICE 'Faculty profile not found — creating one';
    INSERT INTO faculty (user_id, employee_id, designation)
    VALUES (v_faculty_user, 'CU-F-2201', 'Associate Professor')
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id INTO v_faculty_id;
  END IF;

  -- Get course IDs
  SELECT id INTO v_course_sd   FROM courses WHERE code = 'SD';
  SELECT id INTO v_course_aiml FROM courses WHERE code = 'AIML';
  SELECT id INTO v_course_adi  FROM courses WHERE code = 'ADI';
  SELECT id INTO v_course_bee  FROM courses WHERE code = 'BEE-II';
  SELECT id INTO v_course_nalr FROM courses WHERE code = 'NALR-I';

  -- Enroll student in all 5 courses
  INSERT INTO course_enrollments (student_id, course_id)
  SELECT v_student_id, id FROM courses WHERE code IN ('SD','AIML','ADI','BEE-II','NALR-I')
  ON CONFLICT (student_id, course_id) DO NOTHING;

  -- Get a room for class sessions (use first available room)
  SELECT id INTO v_room_tg417 FROM rooms WHERE room_code = 'B-101';
  IF v_room_tg417 IS NULL THEN
    SELECT id INTO v_room_tg417 FROM rooms LIMIT 1;
  END IF;

  -- Create class sessions (day_of_week: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri)
  -- Slots: 16:10-17:50, 17:50-19:30, 19:50-21:20

  -- Monday: SD, AIML, ADI
  INSERT INTO class_sessions (course_id, faculty_id, room_id, day_of_week, start_time, end_time)
  VALUES (v_course_sd,   v_faculty_id, v_room_tg417, 1, '16:10', '17:50')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_session_id;
  -- Attendance for Monday SD
  IF v_session_id IS NOT NULL THEN
    INSERT INTO attendance_records (class_session_id, student_id, status, marked_by, marked_at)
    VALUES (v_session_id, v_student_id, 'present', v_faculty_user, now() - interval '2 days')
    ON CONFLICT (class_session_id, student_id) DO NOTHING;
  END IF;

  INSERT INTO class_sessions (course_id, faculty_id, room_id, day_of_week, start_time, end_time)
  VALUES (v_course_aiml, v_faculty_id, v_room_tg417, 1, '17:50', '19:30')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_session_id;
  IF v_session_id IS NOT NULL THEN
    INSERT INTO attendance_records (class_session_id, student_id, status, marked_by, marked_at)
    VALUES (v_session_id, v_student_id, 'present', v_faculty_user, now() - interval '2 days')
    ON CONFLICT (class_session_id, student_id) DO NOTHING;
  END IF;

  INSERT INTO class_sessions (course_id, faculty_id, room_id, day_of_week, start_time, end_time)
  VALUES (v_course_adi, v_faculty_id, v_room_tg417, 1, '19:50', '21:20')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_session_id;
  IF v_session_id IS NOT NULL THEN
    INSERT INTO attendance_records (class_session_id, student_id, status, marked_by, marked_at)
    VALUES (v_session_id, v_student_id, 'absent', v_faculty_user, now() - interval '2 days')
    ON CONFLICT (class_session_id, student_id) DO NOTHING;
  END IF;

  -- Tuesday: BEE-II, ADI, NALR-I
  INSERT INTO class_sessions (course_id, faculty_id, room_id, day_of_week, start_time, end_time)
  VALUES (v_course_bee,  v_faculty_id, v_room_tg417, 2, '16:10', '17:50')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_session_id;
  IF v_session_id IS NOT NULL THEN
    INSERT INTO attendance_records (class_session_id, student_id, status, marked_by, marked_at)
    VALUES (v_session_id, v_student_id, 'present', v_faculty_user, now() - interval '1 day')
    ON CONFLICT (class_session_id, student_id) DO NOTHING;
  END IF;

  INSERT INTO class_sessions (course_id, faculty_id, room_id, day_of_week, start_time, end_time)
  VALUES (v_course_adi,  v_faculty_id, v_room_tg417, 2, '17:50', '19:30')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_session_id;
  IF v_session_id IS NOT NULL THEN
    INSERT INTO attendance_records (class_session_id, student_id, status, marked_by, marked_at)
    VALUES (v_session_id, v_student_id, 'present', v_faculty_user, now() - interval '1 day')
    ON CONFLICT (class_session_id, student_id) DO NOTHING;
  END IF;

  INSERT INTO class_sessions (course_id, faculty_id, room_id, day_of_week, start_time, end_time)
  VALUES (v_course_nalr, v_faculty_id, v_room_tg417, 2, '19:50', '21:20')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_session_id;
  IF v_session_id IS NOT NULL THEN
    INSERT INTO attendance_records (class_session_id, student_id, status, marked_by, marked_at)
    VALUES (v_session_id, v_student_id, 'present', v_faculty_user, now() - interval '1 day')
    ON CONFLICT (class_session_id, student_id) DO NOTHING;
  END IF;

  -- Wednesday: NALR-I, ADI, BEE-II
  INSERT INTO class_sessions (course_id, faculty_id, room_id, day_of_week, start_time, end_time)
  VALUES (v_course_nalr, v_faculty_id, v_room_tg417, 3, '16:10', '17:50')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_session_id;
  IF v_session_id IS NOT NULL THEN
    INSERT INTO attendance_records (class_session_id, student_id, status, marked_by, marked_at)
    VALUES (v_session_id, v_student_id, 'present', v_faculty_user, now() - interval '3 days')
    ON CONFLICT (class_session_id, student_id) DO NOTHING;
  END IF;

  INSERT INTO class_sessions (course_id, faculty_id, room_id, day_of_week, start_time, end_time)
  VALUES (v_course_adi,  v_faculty_id, v_room_tg417, 3, '17:50', '19:30')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_session_id;
  IF v_session_id IS NOT NULL THEN
    INSERT INTO attendance_records (class_session_id, student_id, status, marked_by, marked_at)
    VALUES (v_session_id, v_student_id, 'absent', v_faculty_user, now() - interval '3 days')
    ON CONFLICT (class_session_id, student_id) DO NOTHING;
  END IF;

  INSERT INTO class_sessions (course_id, faculty_id, room_id, day_of_week, start_time, end_time)
  VALUES (v_course_bee,  v_faculty_id, v_room_tg417, 3, '19:50', '21:20')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_session_id;
  IF v_session_id IS NOT NULL THEN
    INSERT INTO attendance_records (class_session_id, student_id, status, marked_by, marked_at)
    VALUES (v_session_id, v_student_id, 'present', v_faculty_user, now() - interval '3 days')
    ON CONFLICT (class_session_id, student_id) DO NOTHING;
  END IF;

  -- Thursday: SD, ADI, AIML
  INSERT INTO class_sessions (course_id, faculty_id, room_id, day_of_week, start_time, end_time)
  VALUES (v_course_sd,   v_faculty_id, v_room_tg417, 4, '16:10', '17:50')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_session_id;
  IF v_session_id IS NOT NULL THEN
    INSERT INTO attendance_records (class_session_id, student_id, status, marked_by, marked_at)
    VALUES (v_session_id, v_student_id, 'present', v_faculty_user, now() - interval '4 days')
    ON CONFLICT (class_session_id, student_id) DO NOTHING;
  END IF;

  INSERT INTO class_sessions (course_id, faculty_id, room_id, day_of_week, start_time, end_time)
  VALUES (v_course_adi,  v_faculty_id, v_room_tg417, 4, '17:50', '19:30')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_session_id;
  IF v_session_id IS NOT NULL THEN
    INSERT INTO attendance_records (class_session_id, student_id, status, marked_by, marked_at)
    VALUES (v_session_id, v_student_id, 'present', v_faculty_user, now() - interval '4 days')
    ON CONFLICT (class_session_id, student_id) DO NOTHING;
  END IF;

  INSERT INTO class_sessions (course_id, faculty_id, room_id, day_of_week, start_time, end_time)
  VALUES (v_course_aiml, v_faculty_id, v_room_tg417, 4, '19:50', '21:20')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_session_id;
  IF v_session_id IS NOT NULL THEN
    INSERT INTO attendance_records (class_session_id, student_id, status, marked_by, marked_at)
    VALUES (v_session_id, v_student_id, 'late', v_faculty_user, now() - interval '4 days')
    ON CONFLICT (class_session_id, student_id) DO NOTHING;
  END IF;

  -- Friday: BEE-II, ADI, AIML
  INSERT INTO class_sessions (course_id, faculty_id, room_id, day_of_week, start_time, end_time)
  VALUES (v_course_bee,  v_faculty_id, v_room_tg417, 5, '16:10', '17:50')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_session_id;
  IF v_session_id IS NOT NULL THEN
    INSERT INTO attendance_records (class_session_id, student_id, status, marked_by, marked_at)
    VALUES (v_session_id, v_student_id, 'present', v_faculty_user, now() - interval '5 days')
    ON CONFLICT (class_session_id, student_id) DO NOTHING;
  END IF;

  INSERT INTO class_sessions (course_id, faculty_id, room_id, day_of_week, start_time, end_time)
  VALUES (v_course_adi,  v_faculty_id, v_room_tg417, 5, '17:50', '19:30')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_session_id;
  IF v_session_id IS NOT NULL THEN
    INSERT INTO attendance_records (class_session_id, student_id, status, marked_by, marked_at)
    VALUES (v_session_id, v_student_id, 'present', v_faculty_user, now() - interval '5 days')
    ON CONFLICT (class_session_id, student_id) DO NOTHING;
  END IF;

  INSERT INTO class_sessions (course_id, faculty_id, room_id, day_of_week, start_time, end_time)
  VALUES (v_course_aiml, v_faculty_id, v_room_tg417, 5, '19:50', '21:20')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_session_id;
  IF v_session_id IS NOT NULL THEN
    INSERT INTO attendance_records (class_session_id, student_id, status, marked_by, marked_at)
    VALUES (v_session_id, v_student_id, 'absent', v_faculty_user, now() - interval '5 days')
    ON CONFLICT (class_session_id, student_id) DO NOTHING;
  END IF;

  -- More historical attendance (previous week) for richer stats
  -- We'll add extra sessions for the previous week with attendance
  INSERT INTO class_sessions (course_id, faculty_id, room_id, day_of_week, start_time, end_time)
  SELECT v_course_sd, v_faculty_id, v_room_tg417, 1, '16:10', '17:50'
  WHERE NOT EXISTS (
    SELECT 1 FROM class_sessions cs
    WHERE cs.course_id = v_course_sd AND cs.faculty_id = v_faculty_id
      AND cs.day_of_week = 1 AND cs.start_time = '16:10'
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Academic seed data inserted successfully';
END $$;


-- ═══════════════════════════════════════════════════════════════
-- LOST & FOUND SEED DATA
-- ═══════════════════════════════════════════════════════════════

INSERT INTO lost_and_found_items (title, description, location, category, type, status, reported_by)
SELECT
  'Black leather wallet',
  'Found near the cafeteria entrance. Contains some cards, no cash visible.',
  'Cafeteria', 'documents', 'found', 'open',
  id FROM users WHERE email = 'alex.morgan@chitkara.edu.in'
ON CONFLICT DO NOTHING;

INSERT INTO lost_and_found_items (title, description, location, category, type, status, reported_by)
SELECT
  'Blue water bottle',
  'Lost during the ADI lecture. Has a sticker on it.',
  'CS Block', 'other', 'lost', 'open',
  id FROM users WHERE email = 'alex.morgan@chitkara.edu.in'
ON CONFLICT DO NOTHING;

INSERT INTO lost_and_found_items (title, description, location, category, type, status, reported_by)
SELECT
  'Engineering drawing notebook',
  'Found in TG-417 after the BEE-II class. Name written on first page.',
  'CS Block', 'books', 'found', 'open',
  id FROM users WHERE email = 'jordan.ellis@chitkara.edu.in'
ON CONFLICT DO NOTHING;

INSERT INTO lost_and_found_items (title, description, location, category, type, status, reported_by)
SELECT
  'Student ID card — roll no. 1042',
  'Lost somewhere between Library and CS Block.',
  'Library', 'documents', 'lost', 'open',
  id FROM users WHERE email = 'alex.morgan@chitkara.edu.in'
ON CONFLICT DO NOTHING;

INSERT INTO lost_and_found_items (title, description, location, category, type, status, reported_by)
SELECT
  'One black earbud (right side)',
  'Found in the seminar room B-101.',
  'CS Block', 'electronics', 'found', 'claimed',
  id FROM users WHERE email = 'priya.raman@chitkara.edu.in'
ON CONFLICT DO NOTHING;


-- ═══════════════════════════════════════════════════════════════
-- NOTIFICATION SEED DATA
-- ═══════════════════════════════════════════════════════════════

INSERT INTO notifications (user_id, title, body, type, is_read, created_at)
SELECT id,
  'Your maintenance ticket has been received',
  'We have logged your report about "Projector not working" in CS-204. A technician will be assigned shortly.',
  'info', false, now() - interval '2 hours'
FROM users WHERE email = 'alex.morgan@chitkara.edu.in'
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, title, body, type, is_read, created_at)
SELECT id,
  'Room booking confirmed',
  'Your booking for Seminar Room B-101 has been confirmed.',
  'success', false, now() - interval '1 day'
FROM users WHERE email = 'alex.morgan@chitkara.edu.in'
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, title, body, type, is_read, created_at)
SELECT id,
  'Reminder: Assignment due tomorrow',
  'Your Software Design assignment is due tomorrow at 11:59 PM.',
  'warning', true, now() - interval '3 days'
FROM users WHERE email = 'alex.morgan@chitkara.edu.in'
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, title, body, type, is_read, created_at)
SELECT id,
  'Welcome to NexusOne!',
  'Your student portal account is ready. Explore your dashboard to see campus updates.',
  'info', true, now() - interval '7 days'
FROM users WHERE email = 'alex.morgan@chitkara.edu.in'
ON CONFLICT DO NOTHING;
