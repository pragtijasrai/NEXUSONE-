// Fictional demo data for the Student "Announcements" page.
// Replace with API calls (GET /api/student/announcements, PATCH .../read) later.

export const CATEGORIES = [
  'Academic', 'Examination', 'Events', 'Campus Notices', 'Transport', 'Emergency',
];

// priority: 'Normal' | 'Important' | 'Urgent'
export const initialAnnouncements = [
  {
    id: 1, category: 'Emergency', priority: 'Urgent', unread: true,
    title: 'Water supply interruption in Hostel A',
    message: 'Water supply to Hostel A will be interrupted today from 2:00 PM to 6:00 PM due to pipeline repair work.\n\nPlease store water in advance. Tankers will be placed near the hostel entrance. Report any emergency to the hostel warden.',
    author: 'Estates Office', date: 'Oct 27, 2026', attachments: [],
  },
  {
    id: 2, category: 'Academic', priority: 'Urgent', unread: true,
    title: 'Database Systems lab moved to CS-110',
    message: 'This week only, the Database Systems lab session moves from CS-105 to CS-110.\n\nThe timing stays the same. Please bring your lab notebook.',
    author: 'Prof. Marcus Hale', date: 'Oct 26, 2026', attachments: [],
  },
  {
    id: 3, category: 'Examination', priority: 'Important', unread: true,
    title: 'Mid-semester examination schedule released',
    message: 'The mid-semester examination schedule is now available. Exams begin on Nov 10 and run for five working days.\n\nCheck your seating plan one day before each exam. Carry your university ID card; entry is not permitted without it.',
    author: 'Examination Cell', date: 'Oct 25, 2026', attachments: [{ name: 'midsem-schedule.pdf', size: '186 KB' }],
  },
  {
    id: 4, category: 'Transport', priority: 'Important', unread: true,
    title: 'Campus Shuttle Route C suspended',
    message: 'Route C is suspended until Nov 1 due to road maintenance.\n\nStudents can use Route A and walk from the Library stop. Normal service resumes after the work is completed.',
    author: 'Transport Office', date: 'Oct 24, 2026', attachments: [],
  },
  {
    id: 5, category: 'Events', priority: 'Normal', unread: false,
    title: 'Hack Night registration is open',
    message: 'Teams of up to four can register for Hack Night at the Innovation Hub. Pizza will be provided.\n\nRegister from the Campus Events page before Oct 30.',
    author: 'Innovation Cell', date: 'Oct 22, 2026', attachments: [],
  },
  {
    id: 6, category: 'Campus Notices', priority: 'Normal', unread: false,
    title: 'Library extends hours for midterms',
    message: 'The main library stays open until midnight from Monday through the end of the examination period.\n\nSilent study zones on the second floor remain reserved for exam preparation.',
    author: 'Central Library', date: 'Oct 21, 2026', attachments: [],
  },
  {
    id: 7, category: 'Academic', priority: 'Normal', unread: false,
    title: 'Assignment submission guidelines updated',
    message: 'All assignments must now be submitted as a single PDF file named with your roll number and subject code. Submissions in other formats may not be graded.',
    author: 'Dr. Priya Raman', date: 'Oct 18, 2026', attachments: [{ name: 'submission-guidelines.pdf', size: '92 KB' }],
  },
];