/**
 * FacultyTimetable — /faculty/timetable
 */
import { CalendarRange, Clock, MapPin, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { facultyClasses } from '../../data/mockFaculty.js';

const css = `
  .ft { background:#0d1117; min-height:100vh; color:#c5caf0; font-family:inherit; padding:28px 32px; }
  .ft h1 { font-size:1.4rem; font-weight:700; color:#eceefb; margin:0 0 4px; }
  .ft-sub { font-size:.88rem; color:#7880a8; margin:0 0 24px; }
  .ft-back { display:inline-flex; align-items:center; gap:6px; color:#7880a8; font-size:.83rem; text-decoration:none; margin-bottom:16px; transition:color .15s; }
  .ft-back:hover { color:#818cf8; }
  .ft-table-wrap { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:14px; overflow:hidden; }
  .ft-table { width:100%; border-collapse:collapse; }
  .ft-table th { text-align:left; padding:12px 18px; color:#7880a8; font-size:.72rem; font-weight:600; text-transform:uppercase; letter-spacing:.05em; border-bottom:1px solid rgba(255,255,255,.07); background:#0f1320; }
  .ft-table td { padding:14px 18px; border-bottom:1px solid rgba(255,255,255,.04); vertical-align:middle; background:#161b2e; }
  .ft-table tr:last-child td { border:0; }
  .ft-table tr:hover td { background:#1a2035 !important; }
  .status-badge { font-size:.72rem; font-weight:700; padding:3px 9px; border-radius:6px; }
  .status-completed { background:rgba(52,211,153,.13); color:#34d399; }
  .status-progress  { background:rgba(251,191,36,.13); color:#fbbf24; }
  .status-upcoming  { background:rgba(99,102,241,.13); color:#818cf8; }
  @media(max-width:640px){.ft{padding:16px;}}
`;

function statusClass(s) {
  if (s === 'Completed') return 'status-badge status-completed';
  if (s === 'In progress') return 'status-badge status-progress';
  return 'status-badge status-upcoming';
}

export default function FacultyTimetable() {
  return (
    <>
      <style>{css}</style>
      <div className="ft">
        <Link to="/faculty/dashboard" className="ft-back">← Back to Dashboard</Link>
        <h1>Timetable</h1>
        <p className="ft-sub">Today's schedule — {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}</p>
        <div className="ft-table-wrap">
          <table className="ft-table" aria-label="Timetable">
            <thead>
              <tr>
                <th>Time</th>
                <th>Subject</th>
                <th>Room</th>
                <th>Attendance</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {facultyClasses.map(c => (
                <tr key={c.id}>
                  <td><div style={{ display:'flex', alignItems:'center', gap:7 }}><Clock size={14} color="#7880a8" /><span style={{ color:'#eceefb', fontWeight:600 }}>{c.time}</span></div></td>
                  <td><span style={{ color:'#eceefb', fontWeight:600 }}>{c.subject}</span></td>
                  <td><div style={{ display:'flex', alignItems:'center', gap:6, color:'#7880a8', fontSize:'.84rem' }}><MapPin size={13} />{c.room}</div></td>
                  <td><span style={{ color:'#c5caf0' }}>{c.present}/{c.enrolled}</span></td>
                  <td><span className={statusClass(c.status)}>{c.status}</span></td>
                  <td>
                    <Link to="/faculty/attendance" style={{ fontSize:'.78rem', color:'#818cf8', textDecoration:'none', padding:'4px 10px', borderRadius:6, border:'1px solid rgba(99,102,241,.3)', background:'rgba(99,102,241,.1)' }}>
                      Attendance
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
