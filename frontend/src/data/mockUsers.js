// Fictional users at the fictional "Northbridge University". Demo password for every account: demo1234
export const DEMO_PASSWORD = 'demo1234';

export const mockUsers = [
  { id: 'u-stu-1', name: 'Alex Morgan',     email: 'alex.morgan@northbridge.edu',   role: 'student',     department: 'Computer Science',   demoId: 'NB-S-1042', status: 'active' },
  { id: 'u-fac-1', name: 'Dr. Priya Raman', email: 'priya.raman@northbridge.edu',   role: 'faculty',     department: 'Computer Science',   demoId: 'NB-F-2201', status: 'active' },
  { id: 'u-adm-1', name: 'Jordan Ellis',    email: 'jordan.ellis@northbridge.edu',  role: 'admin',       department: 'Campus Operations',  demoId: 'NB-A-3005', status: 'active' },
  { id: 'u-mnt-1', name: 'Sam Okafor',      email: 'sam.okafor@northbridge.edu',    role: 'maintenance', department: 'Facilities',         demoId: 'NB-M-4110', status: 'active' },
];

export const roleLabels = {
  student:     'Student',
  faculty:     'Faculty',
  admin:       'Administrator',
  maintenance: 'Maintenance Staff',
};

export const roleHome = {
  student:     '/student/dashboard',
  faculty:     '/faculty/dashboard',
  admin:       '/admin/dashboard',
  maintenance: '/maintenance/dashboard',
};

// All roles are now built (student, faculty, admin). Maintenance is minimal placeholder.
export const builtRoles = ['student', 'faculty', 'admin'];
