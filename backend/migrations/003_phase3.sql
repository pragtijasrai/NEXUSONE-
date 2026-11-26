-- ─────────────────────────────────────────────────────────────────────────
-- NexusOne — Phase 3 migration (003)
--
-- Adds:
--   1. More student users enrolled in courses (so faculty sees a real roster)
--   2. Assignments for each course
--   3. Assignment submissions with grades
--   4. Faculty notifications
--
-- All idempotent (ON CONFLICT DO NOTHING).
-- ─────────────────────────────────────────────────────────────────────────

-- ── Create 4 more student users ──
INSERT INTO users (name, email, password_hash, role, department_id)
SELECT 'Priya Singh', 'priya.singh@chitkara.edu.in', password_hash, 'student', (SELECT id FROM departments WHERE code='CS')
FROM users WHERE email = 'alex.morgan@chitkara.edu.in'
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (user_id, roll_number, semester, enrollment_year)
SELECT u.id, 'CU-S-1043', 5, 2023
FROM users u WHERE u.email = 'priya.singh@chitkara.edu.in'
  AND NOT EXISTS (SELECT 1 FROM students s WHERE s.user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO users (name, email, password_hash, role, department_id)
SELECT 'Carlos Mendez', 'carlos.mendez@chitkara.edu.in', password_hash, 'student', (SELECT id FROM departments WHERE code='CS')
FROM users WHERE email = 'alex.morgan@chitkara.edu.in'
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (user_id, roll_number, semester, enrollment_year)
SELECT u.id, 'CU-S-1044', 5, 2023
FROM users u WHERE u.email = 'carlos.mendez@chitkara.edu.in'
  AND NOT EXISTS (SELECT 1 FROM students s WHERE s.user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO users (name, email, password_hash, role, department_id)
SELECT 'Amara Osei', 'amara.osei@chitkara.edu.in', password_hash, 'student', (SELECT id FROM departments WHERE code='CS')
FROM users WHERE email = 'alex.morgan@chitkara.edu.in'
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (user_id, roll_number, semester, enrollment_year)
SELECT u.id, 'CU-S-1045', 5, 2023
FROM users u WHERE u.email = 'amara.osei@chitkara.edu.in'
  AND NOT EXISTS (SELECT 1 FROM students s WHERE s.user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO users (name, email, password_hash, role, department_id)
SELECT 'Liam Zhang', 'liam.zhang@chitkara.edu.in', password_hash, 'student', (SELECT id FROM departments WHERE code='CS')
FROM users WHERE email = 'alex.morgan@chitkara.edu.in'
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (user_id, roll_number, semester, enrollment_year)
SELECT u.id, 'CU-S-1046', 5, 2023
FROM users u WHERE u.email = 'liam.zhang@chitkara.edu.in'
  AND NOT EXISTS (SELECT 1 FROM students s WHERE s.user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════
-- ENROLL ALL STUDENTS IN ALL COURSES
-- ═══════════════════════════════════════════════════════════════

INSERT INTO course_enrollments (student_id, course_id)
SELECT s.id, c.id
FROM students s
JOIN users u ON u.id = s.user_id
CROSS JOIN courses c
WHERE c.code IN ('SD','AIML','ADI','BEE-II','NALR-I')
  AND u.role = 'student'
  AND u.status = 'active'
ON CONFLICT (student_id, course_id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════
-- CREATE ASSIGNMENTS
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_faculty_id BIGINT;
  v_course_sd   BIGINT;
  v_course_aiml BIGINT;
  v_course_adi  BIGINT;
  v_course_bee  BIGINT;
  v_faculty_uid BIGINT;
  v_aid         BIGINT;
  v_sid         BIGINT;
BEGIN
  SELECT id INTO v_faculty_uid FROM users WHERE email = 'priya.raman@chitkara.edu.in';
  SELECT id INTO v_faculty_id FROM faculty WHERE user_id = v_faculty_uid;

  IF v_faculty_id IS NULL THEN
    RAISE NOTICE 'Faculty profile not found — skipping assignment seed';
    RETURN;
  END IF;

  SELECT id INTO v_course_sd   FROM courses WHERE code = 'SD';
  SELECT id INTO v_course_aiml FROM courses WHERE code = 'AIML';
  SELECT id INTO v_course_adi  FROM courses WHERE code = 'ADI';
  SELECT id INTO v_course_bee  FROM courses WHERE code = 'BEE-II';

  -- SD assignment
  INSERT INTO assignments (course_id, faculty_id, title, description, due_date, max_marks)
  VALUES (v_course_sd, v_faculty_id, 'Software Design Document',
    'Write a detailed SDD for a library management system including use-case diagrams, class diagrams, and sequence diagrams.',
    CURRENT_DATE + 14, 100)
  ON CONFLICT DO NOTHING;

  -- AIML assignment
  INSERT INTO assignments (course_id, faculty_id, title, description, due_date, max_marks)
  VALUES (v_course_aiml, v_faculty_id, 'Neural Network Implementation',
    'Implement a simple feedforward neural network from scratch in Python. Train it on the MNIST dataset and report accuracy.',
    CURRENT_DATE + 21, 100)
  ON CONFLICT DO NOTHING;

  -- ADI assignment
  INSERT INTO assignments (course_id, faculty_id, title, description, due_date, max_marks)
  VALUES (v_course_adi, v_faculty_id, 'Graph Algorithm Analysis',
    'Compare BFS, DFS, Dijkstra and A* on weighted graphs. Include complexity analysis and benchmark results.',
    CURRENT_DATE + 7, 50)
  ON CONFLICT DO NOTHING;

  -- BEE-II assignment
  INSERT INTO assignments (course_id, faculty_id, title, description, due_date, max_marks)
  VALUES (v_course_bee, v_faculty_id, 'Circuit Analysis Lab Report',
    'Complete the lab report for the RC circuit experiment. Include oscilloscope readings and theoretical calculations.',
    CURRENT_DATE + 10, 75)
  ON CONFLICT DO NOTHING;

  -- ── Submissions with grades ──
  SELECT a.id INTO v_aid FROM assignments a
  JOIN courses c ON c.id = a.course_id
  WHERE c.code = 'SD' AND a.faculty_id = v_faculty_id LIMIT 1;

  IF v_aid IS NOT NULL THEN
    -- Alex submitted and graded
    SELECT s.id INTO v_sid FROM students s JOIN users u ON u.id = s.user_id
    WHERE u.email = 'alex.morgan@chitkara.edu.in';
    IF v_sid IS NOT NULL THEN
      INSERT INTO assignment_submissions (assignment_id, student_id, file_url, submitted_at, grade, graded_at, graded_by)
      VALUES (v_aid, v_sid, '/uploads/sdd_alex.pdf', now() - interval '2 days', 88.00, now() - interval '1 day', v_faculty_uid)
      ON CONFLICT (assignment_id, student_id) DO NOTHING;
    END IF;

    -- Priya Singh submitted and graded
    SELECT s.id INTO v_sid FROM students s JOIN users u ON u.id = s.user_id
    WHERE u.email = 'priya.singh@chitkara.edu.in';
    IF v_sid IS NOT NULL THEN
      INSERT INTO assignment_submissions (assignment_id, student_id, file_url, submitted_at, grade, graded_at, graded_by)
      VALUES (v_aid, v_sid, '/uploads/sdd_priya.pdf', now() - interval '1 day', 74.00, now() - interval '12 hours', v_faculty_uid)
      ON CONFLICT (assignment_id, student_id) DO NOTHING;
    END IF;

    -- Carlos submitted but not graded
    SELECT s.id INTO v_sid FROM students s JOIN users u ON u.id = s.user_id
    WHERE u.email = 'carlos.mendez@chitkara.edu.in';
    IF v_sid IS NOT NULL THEN
      INSERT INTO assignment_submissions (assignment_id, student_id, file_url, submitted_at)
      VALUES (v_aid, v_sid, '/uploads/sdd_carlos.pdf', now() - interval '3 days')
      ON CONFLICT (assignment_id, student_id) DO NOTHING;
    END IF;

    -- Amara submitted and graded
    SELECT s.id INTO v_sid FROM students s JOIN users u ON u.id = s.user_id
    WHERE u.email = 'amara.osei@chitkara.edu.in';
    IF v_sid IS NOT NULL THEN
      INSERT INTO assignment_submissions (assignment_id, student_id, file_url, submitted_at, grade, graded_at, graded_by)
      VALUES (v_aid, v_sid, '/uploads/sdd_amara.pdf', now() - interval '2 days', 95.00, now() - interval '18 hours', v_faculty_uid)
      ON CONFLICT (assignment_id, student_id) DO NOTHING;
    END IF;
    -- Liam has no submission (missing)
  END IF;

  RAISE NOTICE 'Phase 3 assignments + submissions seeded';
END $$;


-- ═══════════════════════════════════════════════════════════════
-- ATTENDANCE FOR NEW STUDENTS
-- Add attendance records for new students on existing class sessions
-- ═══════════════════════════════════════════════════════════════

INSERT INTO attendance_records (class_session_id, student_id, status, marked_by, marked_at)
SELECT cs.id, s.id,
  CASE
    WHEN random() < 0.75 THEN 'present'
    WHEN random() < 0.9 THEN 'late'
    ELSE 'absent'
  END,
  (SELECT id FROM users WHERE email = 'priya.raman@chitkara.edu.in'),
  cs.created_at + interval '1 hour'
FROM class_sessions cs
JOIN students s ON s.user_id IN (
  SELECT id FROM users WHERE email IN ('priya.singh@chitkara.edu.in','carlos.mendez@chitkara.edu.in','amara.osei@chitkara.edu.in','liam.zhang@chitkara.edu.in')
)
WHERE NOT EXISTS (
  SELECT 1 FROM attendance_records ar
  WHERE ar.class_session_id = cs.id AND ar.student_id = s.id
)
ON CONFLICT (class_session_id, student_id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════
-- FACULTY NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════

INSERT INTO notifications (user_id, title, body, type, is_read, created_at)
SELECT id, 'New submission received',
  'Carlos Mendez submitted "Software Design Document"',
  'info', false, now() - interval '3 hours'
FROM users WHERE email = 'priya.raman@chitkara.edu.in'
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, title, body, type, is_read, created_at)
SELECT id, 'Assignments pending grading',
  'You have submissions awaiting review across your courses.',
  'warning', false, now() - interval '1 day'
FROM users WHERE email = 'priya.raman@chitkara.edu.in'
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, title, body, type, is_read, created_at)
SELECT id, 'Low attendance alert',
  'Liam Zhang attendance dropped below 75% in Software Design.',
  'warning', true, now() - interval '2 days'
FROM users WHERE email = 'priya.raman@chitkara.edu.in'
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, title, body, type, is_read, created_at)
SELECT id, 'Welcome to NexusOne Faculty Portal',
  'Your faculty account is ready. Manage your classes, attendance, and assignments from the dashboard.',
  'info', true, now() - interval '7 days'
FROM users WHERE email = 'priya.raman@chitkara.edu.in'
ON CONFLICT DO NOTHING;
