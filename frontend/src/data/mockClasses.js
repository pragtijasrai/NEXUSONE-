// Fictional demo data for the Student "My Classes" page (timetable + attendance).
// Replace with API calls (GET /api/student/timetable, /api/student/attendance) later.

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// Attendance target. In production this comes from university policy / backend config.
export const ATTENDANCE_TARGET = 75;

export const subjectColors = {
  'SD':     '#4338ca',
  'AIML':   '#8b5cf6',
  'ADI':    '#0ea5e9',
  'BEE-II': '#10b981',
  'NALR-I': '#f59e0b',
};

const c = (id, subject, start, end, faculty, room, type = 'Lecture', note) =>
  ({ id, subject, start, end, faculty, room, type, note });

// Timetable: CSE 5 G26, Chitkara University (generated 24-09-2026). Room: TG-417.
// Slots: 1-2 = 4:10-5:50 PM, 3-4 = 5:50-7:30 PM, Break 7:30-7:50 PM, 5-6 = 7:50-9:20 PM.
const S12 = ['16:10', '17:50'];
const S34 = ['17:50', '19:30'];
const S56 = ['19:50', '21:20'];
const TBA = 'To be announced';
const ROOM = 'TG-417';

export const timetable = {
  Mon: [
    c(1,  'SD',     ...S12, 'Mr Reshab Kumar', ROOM),
    c(2,  'AIML',   ...S34, TBA,               ROOM),
    c(3,  'ADI',    ...S56, TBA,               ROOM),
  ],
  Tue: [
    c(4,  'BEE-II', ...S12, 'Mr Nurul',        ROOM),
    c(5,  'ADI',    ...S34, TBA,               ROOM),
    c(6,  'NALR-I', ...S56, 'Mr Suresh',       ROOM),
  ],
  Wed: [
    c(7,  'NALR-I', ...S12, 'Mr Suresh',       ROOM),
    c(8,  'ADI',    ...S34, TBA,               ROOM),
    c(9,  'BEE-II', ...S56, 'Mr Nurul',        ROOM),
  ],
  Thu: [
    c(10, 'SD',     ...S12, 'Mr Reshab Kumar', ROOM),
    c(11, 'ADI',    ...S34, TBA,               ROOM),
    c(12, 'AIML',   ...S56, TBA,               ROOM),
  ],
  Fri: [
    c(13, 'BEE-II', ...S12, 'Mr Nurul',        ROOM),
    c(14, 'ADI',    ...S34, TBA,               ROOM),
    c(15, 'AIML',   ...S56, TBA,               ROOM),
  ],
};

// Most recent first. status: present | absent | excused
export const attendanceHistory = [
  { id: 1,  date: 'Oct 26', subject: 'SD',     status: 'present' },
  { id: 2,  date: 'Oct 26', subject: 'AIML',   status: 'present' },
  { id: 3,  date: 'Oct 26', subject: 'ADI',    status: 'absent'  },
  { id: 4,  date: 'Oct 23', subject: 'BEE-II', status: 'present' },
  { id: 5,  date: 'Oct 23', subject: 'ADI',    status: 'present' },
  { id: 6,  date: 'Oct 23', subject: 'AIML',   status: 'absent'  },
  { id: 7,  date: 'Oct 22', subject: 'SD',     status: 'present' },
  { id: 8,  date: 'Oct 22', subject: 'ADI',    status: 'present' },
  { id: 9,  date: 'Oct 22', subject: 'AIML',   status: 'excused' },
  { id: 10, date: 'Oct 21', subject: 'NALR-I', status: 'present' },
  { id: 11, date: 'Oct 21', subject: 'ADI',    status: 'absent'  },
  { id: 12, date: 'Oct 21', subject: 'BEE-II', status: 'present' },
];

// Month shown in the per-subject mini calendars (month is 0-based: 9 = October).
export const CALENDAR_MONTH = { year: 2026, month: 9 };

// Last teaching day of the semester. Classes are counted from today up to this date.
export const SEMESTER_END = '2026-12-31';

// Holidays (shown in blue on every subject calendar, and skipped when counting remaining classes).
// Use from/to as YYYY-MM-DD (same day for a single holiday). Replace with real data from the backend.
export const holidays = [
  { from: '2026-10-20', to: '2026-10-20', name: 'Dussehra' },
  { from: '2026-11-05', to: '2026-11-11', name: 'Holiday' },
];