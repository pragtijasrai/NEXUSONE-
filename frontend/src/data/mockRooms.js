export const rooms = [
  { id: 'B-101', name: 'Seminar Room B-101', building: 'Block B', capacity: 30,  type: 'Seminar',  amenities: ['Projector','Whiteboard','AC'],          available: true,  nextFree: null         },
  { id: 'C-105', name: 'Computer Lab C-105', building: 'Block C', capacity: 40,  type: 'Lab',      amenities: ['Computers','Projector','AC'],            available: false, nextFree: '14:00'      },
  { id: 'A-301', name: 'Lecture Hall A-301', building: 'Block A', capacity: 120, type: 'Lecture',  amenities: ['Mic system','Projector','AC','Recording'],available: true,  nextFree: null         },
  { id: 'D-202', name: 'Study Room D-202',   building: 'Block D', capacity: 8,   type: 'Study',    amenities: ['Whiteboard','TV Screen'],                available: true,  nextFree: null         },
  { id: 'B-205', name: 'Conference B-205',   building: 'Block B', capacity: 15,  type: 'Conf.',    amenities: ['Video conf.','Whiteboard','AC'],          available: false, nextFree: '16:30'      },
  { id: 'CS-204',name: 'CS Lab CS-204',      building: 'CS Block',capacity: 35,  type: 'Lab',      amenities: ['Computers','Projector','AC','Printer'],   available: true,  nextFree: null         },
  { id: 'ENG-301',name: 'Engineering Hall',  building: 'Eng Block',capacity: 80, type: 'Lecture',  amenities: ['Smart Board','AC','Recording'],           available: false, nextFree: '15:30'      },
  { id: 'D-110', name: 'Discussion Room',    building: 'Block D', capacity: 6,   type: 'Study',    amenities: ['Whiteboard'],                             available: true,  nextFree: null         },
];

export const myBookings = [
  { id: 1, room: 'B-101', date: 'Oct 25, 2026', time: '10:00 – 12:00', purpose: 'Group Study', status: 'confirmed' },
  { id: 2, room: 'D-202', date: 'Oct 26, 2026', time: '14:00 – 16:00', purpose: 'Project work', status: 'confirmed' },
  { id: 3, room: 'CS-204',date: 'Oct 28, 2026', time: '09:00 – 11:00', purpose: 'Hackathon prep', status: 'pending' },
];
