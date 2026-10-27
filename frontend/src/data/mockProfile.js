// Fictional demo data for the Student "Profile" page.
// Official academic details are controlled by administrators (read-only for students).
// Replace with API calls (GET /api/student/profile, PATCH /api/student/profile) later.

// Keyed by the user's id from mockUsers.js
export const academicByUser = {
  'u-stu-1': {
    course: 'B.Tech Computer Science & Engineering',
    semester: '5th Semester',
    section: 'CSE-B',
    batch: '2023 – 2027',
    advisor: 'Dr. Priya Raman',
  },
};

export const fallbackAcademic = {
  course: 'Not assigned yet',
  semester: '—',
  section: '—',
  batch: '—',
  advisor: '—',
};

// Fields the student may edit. Saved per user in localStorage until a backend exists.
export const defaultEditable = {
  phone: '',
  preferredContact: 'Email',
  notifyAnnouncements: true,
  notifyBookings: true,
  notifyAssignments: true,
  notifyEvents: true,
  notifyMaintenance: true,
  notifyTransport: false,
};

export const CONTACT_METHODS = ['Email', 'Phone call', 'In-app only'];

export const NOTIFY_OPTIONS = [
  ['notifyAnnouncements', 'Announcements'],
  ['notifyBookings',      'Room bookings'],
  ['notifyAssignments',   'Assignment deadlines'],
  ['notifyEvents',        'Events'],
  ['notifyMaintenance',   'Maintenance updates'],
  ['notifyTransport',     'Transport notices'],
];