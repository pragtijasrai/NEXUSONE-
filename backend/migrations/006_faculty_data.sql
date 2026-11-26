-- ─────────────────────────────────────────────────────────────────────────
-- NexusOne — Migration 006: Faculty profile auto-fix
--
-- Creates faculty/student profile rows for any users who are missing them.
-- This handles users registered via the API who skipped profile creation.
-- Safe to re-run (ON CONFLICT DO NOTHING).
-- ─────────────────────────────────────────────────────────────────────────

/* Create faculty profiles for any faculty user missing one */
INSERT INTO faculty (user_id, employee_id, designation)
SELECT
  u.id,
  'CU-F-AUTO-' || u.id,
  'Faculty'
FROM users u
LEFT JOIN faculty f ON f.user_id = u.id
WHERE u.role = 'faculty' AND f.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

/* Create student profiles for any student user missing one */
INSERT INTO students (user_id, roll_number, semester, enrollment_year)
SELECT
  u.id,
  'CU-S-AUTO-' || u.id,
  5,
  2023
FROM users u
LEFT JOIN students s ON s.user_id = u.id
WHERE u.role = 'student' AND s.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

/* Create maintenance_staff profiles for any maintenance user missing one */
INSERT INTO maintenance_staff (user_id, employee_id, specialization)
SELECT
  u.id,
  'CU-M-AUTO-' || u.id,
  'General'
FROM users u
LEFT JOIN maintenance_staff ms ON ms.user_id = u.id
WHERE u.role = 'maintenance' AND ms.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

/* Enroll any un-enrolled students in all existing courses */
INSERT INTO course_enrollments (student_id, course_id)
SELECT s.id, c.id
FROM students s
JOIN users u ON u.id = s.user_id
CROSS JOIN courses c
WHERE u.role = 'student' AND u.status = 'active'
ON CONFLICT (student_id, course_id) DO NOTHING;

/* Create class sessions for Priyanka Garg (CU-F-AUTO-11) if she has none */
DO $$
DECLARE
  v_faculty_id  BIGINT;
  v_room_id     BIGINT;
  v_course_ids  BIGINT[];
BEGIN
  SELECT f.id INTO v_faculty_id FROM faculty f
  JOIN users u ON u.id = f.user_id
  WHERE u.email = 'priyanka@chitkara.edu.in';

  IF v_faculty_id IS NULL THEN
    RAISE NOTICE 'Priyanka Garg faculty profile not found — skipping session creation';
    RETURN;
  END IF;

  /* Check if she already has sessions */
  IF EXISTS (SELECT 1 FROM class_sessions WHERE faculty_id = v_faculty_id LIMIT 1) THEN
    RAISE NOTICE 'Priyanka Garg already has class sessions — skipping';
    RETURN;
  END IF;

  SELECT id INTO v_room_id FROM rooms LIMIT 1;

  SELECT array_agg(id ORDER BY code) INTO v_course_ids
  FROM courses WHERE code IN ('SD','AIML','ADI','BEE-II','NALR-I');

  IF v_course_ids IS NULL OR array_length(v_course_ids, 1) = 0 THEN
    RAISE NOTICE 'No courses found — skipping session creation';
    RETURN;
  END IF;

  /* Create sessions on Monday, Tuesday, Wednesday for Priyanka */
  INSERT INTO class_sessions (course_id, faculty_id, room_id, day_of_week, start_time, end_time)
  VALUES
    (v_course_ids[1], v_faculty_id, v_room_id, 1, '09:00', '10:30'),
    (v_course_ids[2], v_faculty_id, v_room_id, 1, '11:00', '12:30'),
    (v_course_ids[3], v_faculty_id, v_room_id, 2, '09:00', '10:30'),
    (v_course_ids[4], v_faculty_id, v_room_id, 2, '11:00', '12:30'),
    (v_course_ids[5], v_faculty_id, v_room_id, 3, '09:00', '10:30')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Created 5 class sessions for Priyanka Garg';
END $$;
