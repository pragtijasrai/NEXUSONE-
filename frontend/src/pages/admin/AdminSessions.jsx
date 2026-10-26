import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import AdminShell from './AdminShell.jsx';

const SESSIONS = [
  { date:'26 Oct', time:'10:00 AM', course:'CS-201', faculty:'Dr. A. Sharma',  room:'B-101', status:'Scheduled' },
  { date:'26 Oct', time:'11:30 AM', course:'CS-301', faculty:'Prof. R. Mehta', room:'B-203', status:'Scheduled' },
  { date:'26 Oct', time:'02:00 PM', course:'CS-135', faculty:'Dr. K. Verma',  room:'B-105', status:'Scheduled' },
  { date:'26 Oct', time:'10:00 AM', course:'CS-421', faculty:'Prof. S. Gupta', room:'Lab-1', status:'Scheduled' },
  { date:'27 Oct', time:'11:30 AM', course:'CS-335', faculty:'Dr. K. Verma',  room:'B-101', status:'Scheduled' },
  { date:'27 Oct', time:'02:00 PM', course:'CS-201', faculty:'Dr. A. Sharma',  room:'B-203', status:'Scheduled' },
  { date:'27 Oct', time:'04:00 PM', course:'CS-421', faculty:'Prof. R. Mehta', room:'B-101', status:'Scheduled' },
  { date:'27 Oct', time:'10:00 AM', course:'CS-335', faculty:'Prof. S. Gupta', room:'B-203', status:'Scheduled' },
];

export default function AdminSessions() {
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('All Courses');
  const [week, setWeek] = useState('This Week');

  const filtered = SESSIONS.filter(s =>
    (s.course.toLowerCase().includes(search.toLowerCase()) || s.faculty.toLowerCase().includes(search.toLowerCase())) &&
    (course === 'All Courses' || s.course === course)
  );

  return (
    <AdminShell>
      <div className="ap-hdr">
        <div>
          <h1>Class Sessions</h1>
          <p className="ap-sub">Manage scheduled classes and lectures</p>
        </div>
        <button className="ap-btn ap-btn-primary"><Plus size={15} /> Add Session</button>
      </div>

      <div className="ap-card">
        <div className="ap-bar">
          <div className="ap-search">
            <Search size={14} color="#7880a8" />
            <input placeholder="Search sessions..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select className="ap-select" value={course} onChange={e=>setCourse(e.target.value)}>
            <option>All Courses</option>
            {[...new Set(SESSIONS.map(s=>s.course))].map(c=><option key={c}>{c}</option>)}
          </select>
          <select className="ap-select" value={week} onChange={e=>setWeek(e.target.value)}>
            <option>This Week</option><option>Next Week</option><option>This Month</option>
          </select>
        </div>

        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr><th>Date</th><th>Time</th><th>Course</th><th>Faculty</th><th>Room</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((s,i)=>(
                <tr key={i}>
                  <td style={{ color:'#c5caf0' }}>{s.date}</td>
                  <td style={{ color:'#c5caf0' }}>{s.time}</td>
                  <td><span className="ap-badge ap-badge-blue">{s.course}</span></td>
                  <td style={{ color:'#eceefb', fontWeight:500 }}>{s.faculty}</td>
                  <td style={{ color:'#c5caf0' }}>{s.room}</td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="ap-btn ap-btn-ghost ap-btn-sm">Edit</button>
                      <button className="ap-btn ap-btn-danger ap-btn-sm">Cancel</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ap-pages">
          <span className="ap-page-info">Showing 1–{filtered.length} of 56 sessions</span>
          {[1,2,3,4,'...'].map((p,i)=><button key={i} className={`ap-page ${p===1?'ap-page-active':''}`}>{p}</button>)}
        </div>
      </div>
    </AdminShell>
  );
}
