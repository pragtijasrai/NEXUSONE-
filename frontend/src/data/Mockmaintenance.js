// Fictional demo data for the Student "Maintenance" page.
// Replace with API calls (GET/POST /api/student/tickets) later.

export const STATUSES = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

export const CATEGORIES = [
  'Electrical', 'Plumbing', 'Furniture', 'Projector / Computer',
  'Internet', 'Cleanliness', 'Other',
];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export const BUILDINGS = ['CS Block', 'Engineering Block', 'Library', 'Hostel A', 'Innovation Hub', 'Main Auditorium'];

export const initialTickets = [
  {
    id: 'MT-1042', title: 'Projector not turning on', category: 'Projector / Computer',
    description: 'The ceiling projector shows no signal even after restarting the laptop.',
    building: 'CS Block', room: 'CS-110', priority: 'High', status: 'In Progress',
    assignedTo: 'Ravi Kumar', created: 'Oct 24, 2026', resolution: null,
  },
  {
    id: 'MT-1038', title: 'Flickering tube light', category: 'Electrical',
    description: 'Two tube lights in the back row keep flickering during lectures.',
    building: 'Engineering Block', room: 'ENG-301', priority: 'Medium', status: 'Assigned',
    assignedTo: 'Sunil Verma', created: 'Oct 22, 2026', resolution: null,
  },
  {
    id: 'MT-1031', title: 'Wi-Fi drops in reading hall', category: 'Internet',
    description: 'Connection disconnects every few minutes on the second floor.',
    building: 'Library', room: 'Reading Hall 2', priority: 'Medium', status: 'Open',
    assignedTo: null, created: 'Oct 25, 2026', resolution: null,
  },
  {
    id: 'MT-1019', title: 'Broken desk', category: 'Furniture',
    description: 'Front-row desk has a loose leg and wobbles.',
    building: 'CS Block', room: 'CS-204', priority: 'Low', status: 'Resolved',
    assignedTo: 'Ravi Kumar', created: 'Oct 15, 2026', resolution: 'Leg re-fixed with new brackets on Oct 17.',
  },
  {
    id: 'MT-1004', title: 'Water leakage near washbasin', category: 'Plumbing',
    description: 'Tap keeps leaking and the floor stays wet.',
    building: 'Hostel A', room: 'Ground floor', priority: 'Urgent', status: 'Closed',
    assignedTo: 'Imran Sheikh', created: 'Oct 08, 2026', resolution: 'Washer replaced and pipe joint sealed on Oct 09.',
  },
];