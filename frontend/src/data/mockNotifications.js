// Fictional demo data for the Student "Notifications" page.
// Replace with API calls (GET /api/student/notifications, PATCH .../read) later.
// Real-time delivery can be added later with WebSockets (see backend/sockets).

// category -> where clicking the notification should take the student
export const CATEGORY_ROUTES = {
  Announcements: '/student/announcements',
  Bookings:      '/student/rooms',
  Assignments:   '/student/dashboard',
  Events:        '/student/events',
  Maintenance:   '/student/maintenance',
  Transport:     '/student/transport',
};

export const CATEGORIES = Object.keys(CATEGORY_ROUTES);

// `ago` is minutes before "now" so the demo timestamps always look fresh.
export const initialNotifications = [
  { id: 1,  category: 'Maintenance',   title: 'Ticket MT-1042 is now In Progress',          message: 'Ravi Kumar has started work on "Projector not turning on".',              ago: 12,    unread: true  },
  { id: 2,  category: 'Announcements', title: 'New urgent announcement',                    message: 'Water supply interruption in Hostel A today from 2:00 PM to 6:00 PM.',   ago: 45,    unread: true  },
  { id: 3,  category: 'Assignments',   title: 'Assignment due today',                       message: 'Binary Tree Implementation (Data Structures) is due today.',            ago: 120,   unread: true  },
  { id: 4,  category: 'Bookings',      title: 'Room booking confirmed',                     message: 'Study Room 3 is booked for tomorrow, 2:00 PM – 3:00 PM.',               ago: 300,   unread: false },
  { id: 5,  category: 'Transport',     title: 'Shuttle Route C suspended',                  message: 'Route C is suspended until Nov 1. Use Route A from the Library stop.',   ago: 1500,  unread: true  },
  { id: 6,  category: 'Events',        title: 'Registration confirmed: Tech Fest 2026',     message: 'You are registered for Tech Fest 2026 on Oct 28 at the Innovation Hub.', ago: 1700,  unread: false },
  { id: 7,  category: 'Assignments',   title: 'Assignment due in 2 days',                   message: 'ER Diagram for E-Commerce (Database Systems) is due on Oct 28.',        ago: 1800,  unread: false },
  { id: 8,  category: 'Bookings',      title: 'Room booking cancelled',                     message: 'Seminar Hall A booking for Oct 22 was cancelled as requested.',          ago: 5400,  unread: false },
  { id: 9,  category: 'Maintenance',   title: 'Ticket MT-1019 resolved',                    message: 'Your "Broken desk" ticket was resolved. Reopen it if the issue persists.', ago: 11000, unread: false },
];