/**
 * FacultyNotifications — /faculty/notifications
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Bell, CheckCheck, Users, FileText, Megaphone, BarChart2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';

const css = `
  .fn { background:#0d1117; min-height:100vh; color:#c5caf0; font-family:inherit; padding:28px 32px; }
  .fn h1 { font-size:1.4rem; font-weight:700; color:#eceefb; margin:0 0 4px; }
  .fn-sub { font-size:.88rem; color:#7880a8; margin:0 0 24px; }
  .fn-back { display:inline-flex; align-items:center; gap:6px; color:#7880a8; font-size:.83rem; text-decoration:none; margin-bottom:16px; transition:color .15s; }
  .fn-back:hover { color:#818cf8; }
  .fn-list { display:grid; gap:8px; }
  .fn-item { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:12px; padding:16px 18px; display:flex; align-items:flex-start; gap:12px; cursor:pointer; transition:border-color .18s; }
  .fn-item:hover { border-color:rgba(99,102,241,.25); }
  .fn-item--unread { border-left:3px solid #818cf8; }
  .fn-icon { width:36px; height:36px; border-radius:10px; display:grid; place-items:center; flex-shrink:0; }
  .fn-title { font-size:.9rem; font-weight:600; color:#eceefb; margin:0 0 3px; }
  .fn-body  { font-size:.82rem; color:#7880a8; margin:0 0 4px; }
  .fn-time  { font-size:.72rem; color:#555a7a; }
  .fn-unread-dot { width:7px; height:7px; border-radius:50%; background:#818cf8; flex-shrink:0; margin-top:6px; }
  .fn-mark-btn { display:inline-flex; align-items:center; gap:6px; padding:'8px 14px'; border-radius:8px; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.05); color:#7880a8; font:inherit; font-size:.82rem; cursor:pointer; transition:all .15s; padding:7px 14px; }
  .fn-mark-btn:hover { color:#818cf8; border-color:#818cf8; }
  @media(max-width:640px){.fn{padding:16px;}}
`;

const initialNotifs = [
  { id:1, type:'assignment', title:'New Submission', body:'Riya Patel submitted Binary Tree Implementation', time:'2h ago', read:false },
  { id:2, type:'attendance', title:'Low Attendance Alert', body:'Sara Williams attendance dropped below 75%', time:'4h ago', read:false },
  { id:3, type:'grade',      title:'Grade Pending',  body:'5 submissions await grading — Graph Traversal', time:'Yesterday', read:false },
  { id:4, type:'announcement', title:'Announcement Sent', body:'Midterm schedule released to all students', time:'Oct 22', read:true },
  { id:5, type:'assignment', title:'Submission Deadline', body:'Turing Machine Design due in 2 days', time:'Oct 24', read:true },
  { id:6, type:'attendance', title:'Attendance Submitted', body:'Attendance recorded for Algorithms — 35/38', time:'Oct 22', read:true },
  { id:7, type:'grade', title:'All Graded', body:'Binary Tree Implementation — all submissions graded', time:'Oct 21', read:true },
];

const ICON_MAP = { assignment: { Icon: FileText, bg:'rgba(99,102,241,.18)', col:'#818cf8' }, attendance: { Icon: Users, bg:'rgba(52,211,153,.15)', col:'#34d399' }, grade: { Icon: BarChart2, bg:'rgba(251,191,36,.15)', col:'#fbbf24' }, announcement: { Icon: Megaphone, bg:'rgba(236,72,153,.15)', col:'#f472b6' } };

export default function FacultyNotifications() {
  const { notify } = useToast();
  const [notifs, setNotifs] = useState(initialNotifs);

  const unreadCount = notifs.filter(n => !n.read).length;

  function markAll() {
    setNotifs(n => n.map(x => ({ ...x, read:true })));
    notify('All notifications marked as read', 'success');
  }

  function markOne(id) {
    setNotifs(n => n.map(x => x.id===id ? { ...x, read:true } : x));
  }

  return (
    <>
      <style>{css}</style>
      <div className="fn">
        <Link to="/faculty/dashboard" className="fn-back"><ChevronLeft size={15} /> Back to Dashboard</Link>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:22 }}>
          <div>
            <h1>Notifications</h1>
            <p className="fn-sub">{unreadCount} unread · {notifs.length} total</p>
          </div>
          {unreadCount > 0 && (
            <button className="fn-mark-btn" onClick={markAll}>
              <CheckCheck size={15} /> Mark all read
            </button>
          )}
        </div>
        <div className="fn-list">
          {notifs.map(n => {
            const { Icon, bg, col } = ICON_MAP[n.type] || { Icon: Bell, bg:'rgba(99,102,241,.18)', col:'#818cf8' };
            return (
              <div key={n.id} className={`fn-item${!n.read?' fn-item--unread':''}`} onClick={() => markOne(n.id)}>
                <div className="fn-icon" style={{ background:bg }}><Icon size={16} color={col} /></div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p className="fn-title">{n.title}</p>
                  <p className="fn-body">{n.body}</p>
                  <p className="fn-time">{n.time}</p>
                </div>
                {!n.read && <div className="fn-unread-dot" />}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
