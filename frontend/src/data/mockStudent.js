export const todaysClasses = [
  { id: 1, time: '09:00 – 10:30', subject: 'Data Structures',      faculty: 'Dr. Priya Raman',  room: 'CS-204', status: 'Completed',   attendance: true  },
  { id: 2, time: '11:00 – 12:30', subject: 'Database Systems',     faculty: 'Prof. Marcus Hale', room: 'CS-110', status: 'In progress', attendance: true  },
  { id: 3, time: '14:00 – 15:30', subject: 'Software Engineering', faculty: 'Dr. Lena Fischer',  room: 'ENG-301',status: 'Upcoming',   attendance: false },
  { id: 4, time: '16:00 – 17:00', subject: 'Web Development',      faculty: 'Mr. Raj Patel',     room: 'CS-108', status: 'Upcoming',   attendance: false },
];

export const weekSchedule = [
  { day: 'Mon', classes: ['Data Structures 09:00','Database Systems 14:00'] },
  { day: 'Tue', classes: ['Software Engineering 10:00','Web Dev 15:00'] },
  { day: 'Wed', classes: ['Data Structures 09:00','Algorithms 11:00'] },
  { day: 'Thu', classes: ['Database Systems 14:00','OS 09:00'] },
  { day: 'Fri', classes: ['Web Dev 10:00'] },
];

export const assignments = [
  { id: 1, title: 'Binary Tree Implementation', subject: 'Data Structures', due: 'Oct 26, 2026', status: 'pending',   priority: 'high'   },
  { id: 2, title: 'ER Diagram for E-Commerce', subject: 'Database Systems', due: 'Oct 28, 2026', status: 'pending',   priority: 'medium' },
  { id: 3, title: 'UML Class Diagrams',         subject: 'Soft. Engineering',due: 'Nov 02, 2026', status: 'submitted', priority: 'low'   },
  { id: 4, title: 'REST API Design',             subject: 'Web Development',  due: 'Nov 05, 2026', status: 'pending',   priority: 'medium' },
];

export const announcements = [
  { id: 1, title: 'Library extends hours for midterms',      body: 'The main library stays open until midnight from Monday.',          category: 'General',  priority: 'Normal', date: 'Oct 22', unread: true  },
  { id: 2, title: 'Database Systems lab moved to CS-110',    body: 'This week only. Bring your lab notebook.',                         category: 'Academic', priority: 'Urgent', date: 'Oct 23', unread: true  },
  { id: 3, title: 'Hack Night registration is open',         body: 'Teams of up to four. Pizza provided at the Innovation Hub.',       category: 'Events',   priority: 'Normal', date: 'Oct 20', unread: false },
  { id: 4, title: 'Campus Shuttle Route C suspended',        body: 'Route C is suspended until Nov 1 due to road maintenance.',        category: 'Transport','priority': 'Urgent', date: 'Oct 24', unread: true },
];

export const events = [
  { id: 1, title: 'Tech Fest 2026',          date: 'Oct 28, 18:00', location: 'Innovation Hub',    category: 'Technical', registered: true  },
  { id: 2, title: 'Career Fair 2026',        date: 'Nov 03, 10:00', location: 'Main Auditorium',   category: 'Career',    registered: false },
  { id: 3, title: 'Cultural Night',          date: 'Nov 08, 19:00', location: 'Open Amphitheatre', category: 'Cultural',  registered: false },
  { id: 4, title: 'Hackathon — 24hr Sprint', date: 'Nov 15, 09:00', location: 'CS Lab Block',      category: 'Technical', registered: true  },
];

export const attendanceData = [
  { subject: 'Data Structures',      present: 22, absent: 2, total: 24, pct: 92 },
  { subject: 'Database Systems',     present: 19, absent: 3, total: 22, pct: 86 },
  { subject: 'Software Engineering', present: 20, absent: 1, total: 21, pct: 95 },
  { subject: 'Web Development',      present: 16, absent: 4, total: 20, pct: 80 },
];

export const attendanceChart = [
  { week: 'Wk 1', pct: 100 },
  { week: 'Wk 2', pct: 92  },
  { week: 'Wk 3', pct: 88  },
  { week: 'Wk 4', pct: 95  },
  { week: 'Wk 5', pct: 83  },
  { week: 'Wk 6', pct: 90  },
  { week: 'Wk 7', pct: 91  },
];

export const campusOverview = {
  studyRoomsAvailable: 7,
  openTickets: 2,
  nextShuttle: 'Route A in 6 min',
};

export const quickActions = [
  { label: 'Book Room',      icon: 'DoorOpen',     to: '/student/rooms'    },
  { label: 'Report Issue',   icon: 'Wrench',       to: '/student/maintenance' },
  { label: 'Lost & Found',   icon: 'PackageSearch',to: '/student/lost-found'  },
  { label: 'Track Shuttle',  icon: 'Bus',          to: '/student/transport'   },
  { label: 'Ask AI',         icon: 'Bot',          to: '/student/assistant'   },
  { label: 'Browse Events',  icon: 'CalendarDays', to: '/student/events'      },
];
