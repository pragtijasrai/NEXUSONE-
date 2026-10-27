// Fictional demo data for the Student "Lost & Found" page.
// Replace with API calls (GET/POST /api/lost-found) later.

export const CATEGORIES = [
  'Electronics', 'Books & Notes', 'ID & Cards', 'Bags', 'Keys',
  'Clothing', 'Accessories', 'Other',
];

export const LOCATIONS = [
  'CS Block', 'Engineering Block', 'Library', 'Cafeteria', 'Hostel A',
  'Innovation Hub', 'Main Auditorium', 'Sports Ground', 'Shuttle / Bus Stop',
];

// How the finder / owner can be reached. No phone numbers or student IDs are ever shown publicly.
export const CONTACT_OPTIONS = ['Through NexusOne', 'Campus security desk'];

// type: 'lost' | 'found'   status: 'open' | 'claimed' | 'returned'
// mine: true  -> reported by the demo student (Alex Morgan)
export const initialItems = [
  {
    id: 'LF-301', type: 'lost', name: 'Black wireless earbuds case', category: 'Electronics',
    description: 'Black charging case with a small scratch on the lid. Left earbud inside.',
    location: 'Library', date: 'Oct 25, 2026', contact: 'Through NexusOne',
    status: 'open', mine: true, claims: [],
  },
  {
    id: 'LF-298', type: 'found', name: 'Blue water bottle', category: 'Other',
    description: 'Steel bottle with a sticker on the side. Handed over at the security desk.',
    location: 'Cafeteria', date: 'Oct 24, 2026', contact: 'Campus security desk',
    status: 'open', mine: false, claims: [],
  },
  {
    id: 'LF-295', type: 'lost', name: 'Data Structures notebook', category: 'Books & Notes',
    description: 'Red spiral notebook with handwritten notes and a name written inside the cover.',
    location: 'CS Block', date: 'Oct 23, 2026', contact: 'Through NexusOne',
    status: 'open', mine: false, claims: [],
  },
  {
    id: 'LF-290', type: 'found', name: 'Set of keys with green tag', category: 'Keys',
    description: 'Three keys on a ring with a green plastic tag.',
    location: 'Engineering Block', date: 'Oct 22, 2026', contact: 'Through NexusOne',
    status: 'claimed', mine: false, claims: [{ id: 1, by: 'Another student', detail: 'Keys have a small bottle opener.', status: 'pending' }],
  },
  {
    id: 'LF-284', type: 'found', name: 'Grey backpack', category: 'Bags',
    description: 'Grey backpack found near the auditorium entrance after the evening event.',
    location: 'Main Auditorium', date: 'Oct 20, 2026', contact: 'Campus security desk',
    status: 'returned', mine: false, claims: [],
  },
  {
    id: 'LF-279', type: 'lost', name: 'Silver wrist watch', category: 'Accessories',
    description: 'Analog watch with a brown leather strap.',
    location: 'Sports Ground', date: 'Oct 19, 2026', contact: 'Campus security desk',
    status: 'open', mine: false, claims: [],
  },
];