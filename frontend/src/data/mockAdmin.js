export const adminStats = {
  totalUsers:   1234,
  students:     858,
  faculty:      120,
  admins:       88,
  maintenance:  20,
  roomsTotal:   96,
  roomsBooked:  56,
  openTickets:  18,
  upcomingEvents: 5,
};

export const userDistribution = [
  { name: 'Students',    value: 858,  color: '#4338ca' },
  { name: 'Faculty',     value: 120,  color: '#0ea5e9' },
  { name: 'Admin',       value: 88,   color: '#7c3aed' },
  { name: 'Maintenance', value: 20,   color: '#f59e0b' },
];

export const roomUtilisation = [
  { day: 'Mon', pct: 72 },
  { day: 'Tue', pct: 85 },
  { day: 'Wed', pct: 91 },
  { day: 'Thu', pct: 78 },
  { day: 'Fri', pct: 65 },
  { day: 'Sat', pct: 30 },
  { day: 'Sun', pct: 15 },
];

export const systemMetrics = [
  { label: 'User Growth',       value: '+12%', delta: 'up',   note: 'vs last month'   },
  { label: 'User Satisfaction', value: '+25%', delta: 'up',   note: 'survey score'    },
  { label: 'Maintenance SLA',   value: '-18%', delta: 'down', note: 'open > 48 h'     },
  { label: 'Event Participation',value: '+40%',delta: 'up',   note: 'registered seats' },
];

export const recentActivity = [
  { user: 'Alex Morgan',    action: 'New user registered',       time: '10 min ago',  type: 'user'    },
  { user: 'Sam Okafor',     action: 'Room B-101 booking approved',time: '1 hour ago', type: 'room'    },
  { user: 'System',         action: 'Backup completed',          time: '2 hours ago', type: 'system'  },
  { user: 'Jordan Ellis',   action: 'New event created — Tech Fest',time: '3 hours ago',type: 'event' },
  { user: 'Dr. Priya Raman',action: 'Announcement published',    time: '5 hours ago', type: 'announce'},
];

export const allUsers = [
  { id: 'NB-S-1042', name: 'Alex Morgan',     email: 'alex.morgan@northbridge.edu',   role: 'student',     status: 'active',   joined: 'Aug 2024' },
  { id: 'NB-F-2201', name: 'Dr. Priya Raman', email: 'priya.raman@northbridge.edu',   role: 'faculty',     status: 'active',   joined: 'Jan 2022' },
  { id: 'NB-A-3005', name: 'Jordan Ellis',    email: 'jordan.ellis@northbridge.edu',  role: 'admin',       status: 'active',   joined: 'Mar 2021' },
  { id: 'NB-M-4110', name: 'Sam Okafor',      email: 'sam.okafor@northbridge.edu',    role: 'maintenance', status: 'active',   joined: 'Jun 2023' },
  { id: 'NB-S-1043', name: 'Priya Singh',     email: 'priya.singh@northbridge.edu',   role: 'student',     status: 'active',   joined: 'Aug 2024' },
  { id: 'NB-S-1044', name: 'Carlos Mendez',   email: 'carlos.mendez@northbridge.edu', role: 'student',     status: 'inactive', joined: 'Aug 2023' },
];
