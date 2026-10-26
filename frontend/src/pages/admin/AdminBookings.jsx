import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import AdminShell from './AdminShell.jsx';

const BOOKINGS = [
  { date:'26 Oct', time:'10:00 AM', room:'R-101', course:'CS-201', bookedBy:'Dr. A. Sharma', type:'Admin',    status:'Approved'  },
  { date:'26 Oct', time:'11:30 AM', room:'R-203', course:'CS-305', bookedBy:'Prof. R. Mehta', type:'Faculty',  status:'Approved'  },
  { date:'26 Oct', time:'02:00 PM', room:'Lab-1', course:'Workshop',bookedBy:'Simran Kaur',  type:'Student',  status:'Pending'   },
  { date:'25 Oct', time:'10:00 AM', room:'R-101', course:'CS-335', bookedBy:'Dr. K. Verma',  type:'Faculty',  status:'Approved'  },
  { date:'25 Oct', time:'11:30 AM', room:'R-203', course:'Project', bookedBy:'Rohan Mehta',  type:'Student',  status:'Rejected'  },
  { date:'25 Oct', time:'04:00 PM', room:'R-203', course:'Guest Lecture', bookedBy:'Admin', type:'Admin', status:'Approved'  },
  { date:'24 Oct', time:'02:00 PM', room:'R-203', course:'CS-101', bookedBy:'Neha Gupta',    type:'Student',  status:'Approved'  },
  { date:'24 Oct', time:'11:30 AM', room:'R-101', course:'Seminar', bookedBy:'Prof. S. Gupta',type:'Faculty', status:'Approved'  },
];

const statusBadge = { Approved:'ap-badge-green', Pending:'ap-badge-yellow', Rejected:'ap-badge-red' };
const typeBadge   = { Admin:'ap-badge-yellow', Faculty:'ap-badge-cyan', Student:'ap-badge-blue' };

export default function AdminBookings() {
  const [tab, setTab]    = useState('All Bookings');
  const [search, setSearch] = useState('');
  const [month, setMonth]  = useState('This Month');
  const [status, setStatus] = useState('All Status');
  const tabs = ['All Bookings', 'Pending', 'Approved', 'Rejected'];

  const filtered = BOOKINGS.filter(b => {
    const matchTab    = tab === 'All Bookings' || b.status === tab;
    const matchStatus = status === 'All Status' || b.status === status;
    const matchSearch = b.room.toLowerCase().includes(search.toLowerCase()) ||
                        b.bookedBy.toLowerCase().includes(search.toLowerCase()) ||
                        b.course.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchStatus && matchSearch;
  });

  return (
    <AdminShell>
      <div className="ap-hdr">
        <div>
          <h1>Room Bookings</h1>
          <p className="ap-sub">Manage room bookings and reservations</p>
        </div>
        <button className="ap-btn ap-btn-primary"><Plus size={15} /> New Booking</button>
      </div>

      <div className="ap-card">
        <div className="ap-tabs">
          {tabs.map(t=>(
            <button key={t} className={`ap-tab ${tab===t?'ap-tab-active':''}`} onClick={()=>setTab(t)}>{t}</button>
          ))}
        </div>

        <div className="ap-bar">
          <div className="ap-search">
            <Search size={14} color="#7880a8" />
            <input placeholder="Search bookings..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select className="ap-select" value={month} onChange={e=>setMonth(e.target.value)}>
            <option>This Month</option><option>Last Month</option><option>This Year</option>
          </select>
          <select className="ap-select" value={status} onChange={e=>setStatus(e.target.value)}>
            <option>All Status</option><option>Approved</option><option>Pending</option><option>Rejected</option>
          </select>
        </div>

        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr><th>Date</th><th>Time</th><th>Room</th><th>Purpose</th><th>Booked By</th><th>Type</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map((b,i)=>(
                <tr key={i}>
                  <td style={{ color:'#c5caf0' }}>{b.date}</td>
                  <td style={{ color:'#c5caf0' }}>{b.time}</td>
                  <td><span className="ap-badge ap-badge-blue">{b.room}</span></td>
                  <td style={{ color:'#eceefb' }}>{b.course}</td>
                  <td style={{ color:'#c5caf0' }}>{b.bookedBy}</td>
                  <td><span className={`ap-badge ${typeBadge[b.type]}`}>{b.type}</span></td>
                  <td><span className={`ap-badge ${statusBadge[b.status]}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ap-pages">
          <span className="ap-page-info">Showing 1–{filtered.length} of 28 bookings</span>
          {[1,2,3,4,'...'].map((p,i)=><button key={i} className={`ap-page ${p===1?'ap-page-active':''}`}>{p}</button>)}
        </div>
      </div>
    </AdminShell>
  );
}
