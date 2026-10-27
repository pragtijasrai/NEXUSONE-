export const facultyClasses = [
  { id: 1, time: '09:00 – 10:30', subject: 'Data Structures',      room: 'CS-204', enrolled: 42, present: 38, status: 'Completed'   },
  { id: 2, time: '11:00 – 12:30', subject: 'Algorithms',           room: 'CS-106', enrolled: 38, present: 35, status: 'In progress' },
  { id: 3, time: '14:00 – 15:30', subject: 'Theory of Computation',room: 'ENG-203',enrolled: 30, present: 0,  status: 'Upcoming'    },
];

export const facultyAssignments = [
  { id: 1, title: 'Binary Tree Implementation', subject: 'Data Structures', due: 'Oct 26', submitted: 38, total: 42, graded: 20, maxMarks: 100, description: 'Implement a binary search tree with insert, delete, and traversal operations.' },
  { id: 2, title: 'Graph Traversal Report',     subject: 'Algorithms',      due: 'Oct 30', submitted: 25, total: 38, graded: 10, maxMarks: 50,  description: 'Compare BFS and DFS on weighted and unweighted graphs with complexity analysis.' },
  { id: 3, title: 'Turing Machine Design',      subject: 'Theory of Comp.', due: 'Nov 05', submitted: 5,  total: 30, graded: 0,  maxMarks: 75,  description: 'Design a Turing machine that accepts the language {a^n b^n | n >= 1}.' },
];

export const assignmentSubmissions = {
  1: [
    { id:'s1-1', studentId:'NB-S-1042', name:'Alex Morgan',   submittedAt:'Oct 25, 14:32', status:'submitted', fileName:'alex_bst.zip',   marks:88,  feedback:'Excellent implementation. Clean code.' },
    { id:'s1-2', studentId:'NB-S-1043', name:'Priya Singh',   submittedAt:'Oct 26, 09:10', status:'submitted', fileName:'priya_bst.zip',  marks:74,  feedback:'Good work, missing edge cases.' },
    { id:'s1-3', studentId:'NB-S-1044', name:'Carlos Mendez', submittedAt:'Oct 24, 21:05', status:'submitted', fileName:'carlos_bst.zip', marks:95,  feedback:'Outstanding. All edge cases handled.' },
    { id:'s1-4', studentId:'NB-S-1045', name:'Amara Osei',    submittedAt:null,            status:'missing',   fileName:null,             marks:null, feedback:'' },
    { id:'s1-5', studentId:'NB-S-1046', name:'Liam Zhang',    submittedAt:'Oct 26, 22:58', status:'submitted', fileName:'liam_bst.zip',   marks:null, feedback:'' },
  ],
  2: [
    { id:'s2-1', studentId:'NB-S-1042', name:'Alex Morgan',   submittedAt:'Oct 29, 16:20', status:'submitted', fileName:'alex_graph.pdf',   marks:42,  feedback:'Good analysis.' },
    { id:'s2-2', studentId:'NB-S-1043', name:'Priya Singh',   submittedAt:'Oct 28, 11:00', status:'submitted', fileName:'priya_graph.pdf',  marks:48,  feedback:'Excellent comparative study.' },
    { id:'s2-3', studentId:'NB-S-1044', name:'Carlos Mendez', submittedAt:'Oct 30, 08:45', status:'late',       fileName:'carlos_graph.pdf', marks:null, feedback:'' },
    { id:'s2-4', studentId:'NB-S-1045', name:'Amara Osei',    submittedAt:null,            status:'missing',    fileName:null,              marks:null, feedback:'' },
    { id:'s2-5', studentId:'NB-S-1046', name:'Liam Zhang',    submittedAt:null,            status:'missing',    fileName:null,              marks:null, feedback:'' },
  ],
  3: [
    { id:'s3-1', studentId:'NB-S-1042', name:'Alex Morgan',   submittedAt:'Nov 04, 20:00', status:'submitted', fileName:'alex_tm.pdf',  marks:null, feedback:'' },
    { id:'s3-2', studentId:'NB-S-1043', name:'Priya Singh',   submittedAt:'Nov 03, 15:30', status:'submitted', fileName:'priya_tm.pdf', marks:null, feedback:'' },
    { id:'s3-3', studentId:'NB-S-1044', name:'Carlos Mendez', submittedAt:null,            status:'missing',    fileName:null,           marks:null, feedback:'' },
    { id:'s3-4', studentId:'NB-S-1045', name:'Amara Osei',    submittedAt:null,            status:'missing',    fileName:null,           marks:null, feedback:'' },
    { id:'s3-5', studentId:'NB-S-1046', name:'Liam Zhang',    submittedAt:null,            status:'missing',    fileName:null,           marks:null, feedback:'' },
  ],
};

export const myStudents = [
  { id: 'NB-S-1042', name: 'Alex Morgan',    subject: 'Data Structures', attendance: 92, grade: 'A'  },
  { id: 'NB-S-1043', name: 'Priya Singh',    subject: 'Data Structures', attendance: 85, grade: 'B+' },
  { id: 'NB-S-1044', name: 'Carlos Mendez',  subject: 'Algorithms',      attendance: 78, grade: 'B'  },
  { id: 'NB-S-1045', name: 'Amara Osei',     subject: 'Algorithms',      attendance: 95, grade: 'A+' },
  { id: 'NB-S-1046', name: 'Liam Zhang',     subject: 'Theory of Comp.', attendance: 70, grade: 'C+' },
];

export const attendanceSummary = [
  { name: 'Present', value: 128, color: '#059669' },
  { name: 'Absent',  value: 18,  color: '#dc2626' },
  { name: 'On Leave',value: 6,   color: '#d97706' },
];

export const weeklyAttendance = [
  { day: 'Mon', rate: 92 },
  { day: 'Tue', rate: 88 },
  { day: 'Wed', rate: 95 },
  { day: 'Thu', rate: 84 },
  { day: 'Fri', rate: 78 },
];

export const facultyAnnouncements = [
  { id: 1, title: 'Midterm schedule released', audience: 'All students',    date: 'Oct 22', status: 'published' },
  { id: 2, title: 'Lab assignment extended',   audience: 'Data Structures', date: 'Oct 23', status: 'published' },
  { id: 3, title: 'Office hours change',       audience: 'All students',    date: 'Oct 24', status: 'draft'     },
];
