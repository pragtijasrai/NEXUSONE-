import {
  LayoutDashboard, CalendarClock, DoorOpen, Wrench, PackageSearch,
  CalendarDays, Bus, Bot, Megaphone, Users, BookOpen, BarChart3,
  Settings, FileText, Shield, MapPin,
} from 'lucide-react';

export const navByRole = {
  student: [
    { to: '/student/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
    { to: '/student/schedule',     label: 'My Classes',   icon: CalendarClock   },
    { to: '/student/rooms',        label: 'Room Booking', icon: DoorOpen        },
    { to: '/student/events',       label: 'Campus Events',icon: CalendarDays    },
    { to: '/student/transport',    label: 'Campus Map',   icon: MapPin          },
    { to: '/student/assistant',    label: 'AI Assistant', icon: Bot             },
    { to: '/student/maintenance',  label: 'Maintenance',  icon: Wrench          },
    { to: '/student/lost-found',   label: 'Lost & Found', icon: PackageSearch   },
    { to: '/student/announcements',label: 'Announcements',icon: Megaphone, badge: 3 },
  ],
  faculty: [
    { to: '/faculty/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
    { to: '/faculty/schedule',     label: 'My Classes',   icon: CalendarClock   },
    { to: '/faculty/students',     label: 'Students',     icon: Users           },
    { to: '/faculty/assignments',  label: 'Assignments',  icon: FileText        },
    { to: '/faculty/announcements',label: 'Announcements',icon: Megaphone       },
    { to: '/faculty/events',       label: 'Events',       icon: CalendarDays    },
    { to: '/faculty/rooms',        label: 'Room Booking', icon: DoorOpen        },
  ],
  admin: [
    { to: '/admin/dashboard',      label: 'Dashboard',    icon: LayoutDashboard },
    { to: '/admin/users',          label: 'User Management',icon: Users         },
    { to: '/admin/rooms',          label: 'Rooms',        icon: DoorOpen        },
    { to: '/admin/events',         label: 'Events',       icon: CalendarDays    },
    { to: '/admin/announcements',  label: 'Announcements',icon: Megaphone       },
    { to: '/admin/maintenance',    label: 'Maintenance',  icon: Wrench          },
    { to: '/admin/reports',        label: 'Analytics',    icon: BarChart3       },
    { to: '/admin/settings',       label: 'Settings',     icon: Settings        },
  ],
  maintenance: [
    { to: '/maintenance/dashboard',label: 'Dashboard',    icon: LayoutDashboard },
    { to: '/maintenance/tickets',  label: 'Tickets',      icon: Wrench          },
    { to: '/maintenance/schedule', label: 'Schedule',     icon: CalendarClock   },
  ],
};
