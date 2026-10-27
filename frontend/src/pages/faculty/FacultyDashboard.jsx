/**
 * FacultyDashboard — /faculty/dashboard
 * Full dark-blue themed dashboard matching the NexusOne faculty portal design.
 */
import { Link } from 'react-router-dom';
import {
  BookOpen, Users, FileText, Megaphone, ArrowRight,
  TrendingUp, ClipboardList, Plus, UserCheck, DoorOpen,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from 'recharts';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  facultyClasses, facultyAssignments, myStudents,
  attendanceSummary, weeklyAttendance, facultyAnnouncements,
} from '../../data/mockFaculty.js';

/* ─── CSS ─── */
const css = `
  .fd { background:#0d1117; min-height:100vh; color:#c5caf0; font-family:inherit; padding:28px 32px; }

  /* header */
  .fd-header { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:14px; margin-bottom:26px; }
  .fd-header h1 { font-size:1.5rem; font-weight:800; color:#eceefb; margin:0 0 4px; }
  .fd-header p { font-size:.9rem; color:#7880a8; margin:0; }
  .fd-header-actions { display:flex; gap:8px; flex-wrap:wrap; }
  .fd-btn { display:inline-flex; align-items:center; gap:7px; padding:9px 18px; border-radius:10px; border:0; font:inherit; font-size:.85rem; font-weight:600; cursor:pointer; text-decoration:none; transition:all .18s; }
  .fd-btn--primary { background:linear-gradient(135deg,#4338ca,#6366f1); color:#fff; }
  .fd-btn--primary:hover { filter:brightness(1.1); transform:translateY(-1px); box-shadow:0 6px 20px rgba(67,56,202,.35); }
  .fd-btn--ghost { background:rgba(255,255,255,.07); color:#c5caf0; border:1px solid rgba(255,255,255,.12); }
  .fd-btn--ghost:hover { background:rgba(255,255,255,.12); }

  /* stat cards */
  .fd-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; }
  .fd-stat { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:18px 20px; display:flex; align-items:center; gap:14px; }
  .fd-stat-icon { width:44px; height:44px; border-radius:12px; display:grid; place-items:center; flex-shrink:0; }
  .fd-stat-val { font-size:1.8rem; font-weight:800; color:#eceefb; line-height:1; letter-spacing:-.02em; }
  .fd-stat-lbl { font-size:.78rem; color:#7880a8; margin-bottom:2px; }
  .fd-stat-sub { font-size:.72rem; color:#555a7a; margin-top:3px; }

  /* 2-col grid */
  .fd-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:18px; }

  /* cards */
  .fd-card { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:20px; }
  .fd-card-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
  .fd-card-head h2 { font-size:1rem; font-weight:700; color:#eceefb; margin:0; }
  .fd-link { display:inline-flex; align-items:center; gap:5px; font-size:.8rem; color:#818cf8; text-decoration:none; padding:5px 10px; border-radius:7px; border:1px solid rgba(99,102,241,.3); background:rgba(99,102,241,.1); transition:all .15s; font-weight:600; }
  .fd-link:hover { background:rgba(99,102,241,.2); }

  /* class rows */
  .fd-class-row { display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid rgba(255,255,255,.04); gap:10px; }
  .fd-class-row:last-child { border:0; padding-bottom:0; }
  .fd-class-bar { width:3px; height:44px; border-radius:3px; flex-shrink:0; }
  .fd-class-name { font-size:.9rem; font-weight:600; color:#eceefb; }
  .fd-class-meta { font-size:.76rem; color:#7880a8; margin-top:2px; }
  .fd-status { font-size:.7rem; font-weight:700; padding:3px 10px; border-radius:99px; white-space:nowrap; }
  .fd-status--done     { background:rgba(52,211,153,.13); color:#34d399; }
  .fd-status--progress { background:rgba(99,102,241,.18); color:#818cf8; }
  .fd-status--upcoming { background:rgba(255,255,255,.06); color:#7880a8; }

  /* assignment rows */
  .fd-asgn-row { display:flex; justify-content:space-between; align-items:flex-start; padding:12px 0; border-bottom:1px solid rgba(255,255,255,.04); gap:10px; }
  .fd-asgn-row:last-child { border:0; padding-bottom:0; }
  .fd-asgn-title { font-size:.88rem; font-weight:600; color:#eceefb; }
  .fd-asgn-meta  { font-size:.75rem; color:#7880a8; margin-top:2px; }
  .fd-progress { height:4px; background:rgba(255,255,255,.06); border-radius:99px; overflow:hidden; margin-top:6px; width:100%; }
  .fd-progress-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,#4338ca,#818cf8); }
  .fd-badge { font-size:.7rem; font-weight:700; padding:3px 9px; border-radius:6px; white-space:nowrap; flex-shrink:0; }
  .fd-badge--warn { background:rgba(251,191,36,.13); color:#fbbf24; }
  .fd-badge--ok   { background:rgba(52,211,153,.13);  color:#34d399; }

  /* student table */
  .fd-table { width:100%; border-collapse:collapse; font-size:.84rem; }
  .fd-table th { text-align:left; padding:8px 10px; color:#7880a8; font-size:.7rem; font-weight:600; text-transform:uppercase; letter-spacing:.04em; border-bottom:1px solid rgba(255,255,255,.06); }
  .fd-table td { padding:11px 10px; border-bottom:1px solid rgba(255,255,255,.04); vertical-align:middle; background:#161b2e; }
  .fd-table tr:last-child td { border:0; }
  .fd-table tr:hover td { background:#1a2035 !important; }
  .fd-av { width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,#4338ca,#818cf8); display:inline-grid; place-items:center; font-size:.72rem; font-weight:700; color:#fff; flex-shrink:0; }
  .fd-mini-bar { height:4px; background:rgba(255,255,255,.06); border-radius:99px; overflow:hidden; width:52px; display:inline-block; vertical-align:middle; margin-right:5px; }
  .fd-mini-fill { height:100%; border-radius:99px; }
  .fd-grade { font-size:.7rem; font-weight:700; padding:2px 8px; border-radius:5px; }
  .fd-grade-a { background:rgba(52,211,153,.13); color:#34d399; }
  .fd-grade-b { background:rgba(96,165,250,.13); color:#60a5fa; }
  .fd-grade-c { background:rgba(251,191,36,.13); color:#fbbf24; }

  /* quick actions */
  .fd-actions { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:18px; }
  .fd-action-btn { display:flex; align-items:center; gap:10px; padding:14px 16px; border-radius:12px; border:1px solid rgba(255,255,255,.08); background:#161b2e; color:#c5caf0; text-decoration:none; font:inherit; font-size:.85rem; font-weight:600; cursor:pointer; transition:all .18s; }
  .fd-action-btn:hover { border-color:rgba(99,102,241,.4); background:rgba(99,102,241,.1); color:#eceefb; transform:translateY(-1px); }
  .fd-action-icon { width:36px; height:36px; border-radius:9px; display:grid; place-items:center; flex-shrink:0; }

  /* announcements */
  .fd-ann-row { display:flex; justify-content:space-between; align-items:center; padding:11px 0; border-bottom:1px solid rgba(255,255,255,.04); gap:10px; }
  .fd-ann-row:last-child { border:0; padding-bottom:0; }
  .fd-ann-title { font-size:.87rem; font-weight:600; color:#eceefb; }
  .fd-ann-meta  { font-size:.74rem; color:#7880a8; margin-top:2px; }
  .fd-ann-badge { font-size:.68rem; font-weight:700; padding:2px 8px; border-radius:5px; }
  .fd-ann-published { background:rgba(52,211,153,.13); color:#34d399; }
  .fd-ann-draft     { background:rgba(251,191,36,.13); color:#fbbf24; }

  /* recharts overrides for dark bg */
  .fd-chart .recharts-cartesian-axis-tick text { fill:#7880a8 !important; }
  .fd-chart .recharts-tooltip-wrapper { z-index:10; }

  @media(max-width:1100px){.fd-stats{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:800px){.fd-grid{grid-template-columns:1fr;}.fd-actions{grid-template-columns:1fr;}.fd{padding:16px;}}
  @media(max-width:480px){.fd-stats{grid-template-columns:1fr 1fr;}}
`;

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
};

function attColor(att) {
  if (att >= 85) return 'linear-gradient(90deg,#059669,#34d399)';
  if (att >= 75) return 'linear-gradient(90deg,#d97706,#fbbf24)';
  return 'linear-gradient(90deg,#dc2626,#f87171)';
}

function gradeClass(g) {
  if (g.startsWith('A')) return 'fd-grade fd-grade-a';
  if (g.startsWith('B')) return 'fd-grade fd-grade-b';
  return 'fd-grade fd-grade-c';
}

function initials(name) { return name.split(' ').map(p => p[0]).slice(0, 2).join(''); }

const TOOLTIP_STYLE = {
  background: '#161b2e',
  border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 8,
  fontSize: 12,
  color: '#c5caf0',
};

export default function FacultyDashboard() {
  const { user } = useAuth();
  const firstName   = user.name.split(' ').filter(p => !p.endsWith('.')).find(Boolean) ?? user.name.split(' ')[0];
  const totalStudents = myStudents.length;
  const pending       = facultyAssignments.reduce((s, a) => s + (a.submitted - a.graded), 0);
  const totalAttend   = attendanceSummary.reduce((s, d) => s + d.value, 0);

  return (
    <>
      <style>{css}</style>
      <div className="fd">

        {/* Header */}
        <div className="fd-header">
          <div>
            <h1>{greeting()}, {firstName}! 👋</h1>
            <p>Here's an overview of your teaching activities.</p>
          </div>
          <div className="fd-header-actions">
            <Link className="fd-btn fd-btn--ghost" to="/faculty/announcements">Post Announcement</Link>
            <Link className="fd-btn fd-btn--primary" to="/faculty/assignments">Manage Assignments</Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="fd-stats">
          {[
            { icon: BookOpen,  label:'My Classes',       value: facultyClasses.length,       sub:"Today's sessions",    color:'#4338ca', bg:'rgba(67,56,202,.2)'  },
            { icon: Users,     label:'Total Students',   value: totalStudents,                sub:'Across all courses',  color:'#0ea5e9', bg:'rgba(14,165,233,.18)' },
            { icon: FileText,  label:'Pending to Grade', value: pending,                      sub:'Submissions',         color:'#f59e0b', bg:'rgba(245,158,11,.18)' },
            { icon: Megaphone, label:'Announcements',    value: facultyAnnouncements.length,  sub:'2 published',         color:'#7c3aed', bg:'rgba(124,58,237,.18)' },
          ].map(({ icon: Icon, label, value, sub, color, bg }) => (
            <div key={label} className="fd-stat">
              <div className="fd-stat-icon" style={{ background: bg }}><Icon size={20} color={color} /></div>
              <div>
                <div className="fd-stat-lbl">{label}</div>
                <div className="fd-stat-val">{value}</div>
                <div className="fd-stat-sub">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="fd-actions">
          {[
            { icon: ClipboardList, label:'Take Attendance',   to:'/faculty/attendance',   color:'#818cf8', bg:'rgba(99,102,241,.2)'  },
            { icon: Plus,          label:'Create Assignment',  to:'/faculty/assignments',  color:'#22d3ee', bg:'rgba(34,211,238,.18)' },
            { icon: Megaphone,     label:'Post Announcement', to:'/faculty/announcements', color:'#34d399', bg:'rgba(52,211,153,.18)' },
            { icon: DoorOpen,      label:'Book a Room',        to:'/faculty/rooms',        color:'#fbbf24', bg:'rgba(251,191,36,.18)' },
          ].map(({ icon: Icon, label, to, color, bg }) => (
            <Link key={label} to={to} className="fd-action-btn">
              <div className="fd-action-icon" style={{ background: bg }}><Icon size={18} color={color} /></div>
              {label}
            </Link>
          ))}
        </div>

        {/* Row 1: Today's Classes + Attendance */}
        <div className="fd-grid">

          {/* Today's Classes */}
          <div className="fd-card">
            <div className="fd-card-head">
              <h2>Today's Classes</h2>
              <Link className="fd-link" to="/faculty/timetable">Full Schedule <ArrowRight size={12} /></Link>
            </div>
            {facultyClasses.map(c => (
              <div key={c.id} className="fd-class-row">
                <div style={{ display:'flex', gap:10, alignItems:'center', flex:1, minWidth:0 }}>
                  <div className="fd-class-bar" style={{ background: c.status==='Completed'?'#34d399': c.status==='In progress'?'#818cf8':'rgba(255,255,255,.12)' }} />
                  <div>
                    <div className="fd-class-name">{c.subject}</div>
                    <div className="fd-class-meta">{c.time} · {c.room}</div>
                    {c.status !== 'Upcoming' && <div className="fd-class-meta">{c.present}/{c.enrolled} present</div>}
                  </div>
                </div>
                <span className={`fd-status fd-status--${c.status==='Completed'?'done':c.status==='In progress'?'progress':'upcoming'}`}>{c.status}</span>
              </div>
            ))}
          </div>

          {/* Student Attendance */}
          <div className="fd-card">
            <div className="fd-card-head">
              <h2>Student Attendance</h2>
              <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'.75rem', color:'#34d399', background:'rgba(52,211,153,.1)', padding:'4px 10px', borderRadius:6, fontWeight:600 }}>
                <TrendingUp size={12} /> Today
              </span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, alignItems:'center' }}>
              <div className="fd-chart">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={attendanceSummary} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value" strokeWidth={0}>
                      {attendanceSummary.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, n) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display:'grid', gap:10 }}>
                {attendanceSummary.map(s => (
                  <div key={s.name} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:9, height:9, borderRadius:'50%', background:s.color, flexShrink:0 }} />
                    <span style={{ fontSize:'.8rem', color:'#7880a8' }}>{s.name}</span>
                    <strong style={{ marginLeft:'auto', fontSize:'.88rem', color:'#eceefb' }}>{s.value}</strong>
                  </div>
                ))}
                <div style={{ borderTop:'1px solid rgba(255,255,255,.06)', paddingTop:8 }}>
                  <strong style={{ fontSize:'.88rem', color:'#eceefb' }}>Total: {totalAttend}</strong>
                </div>
              </div>
            </div>
            <div style={{ marginTop:14 }}>
              <p style={{ fontSize:'.74rem', color:'#7880a8', marginBottom:8 }}>Weekly attendance rate</p>
              <div className="fd-chart">
                <ResponsiveContainer width="100%" height={70}>
                  <BarChart data={weeklyAttendance} margin={{ top:0, right:0, bottom:0, left:-30 }}>
                    <XAxis dataKey="day" tick={{ fontSize:10, fill:'#7880a8' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[60,100]} tick={{ fontSize:10, fill:'#7880a8' }} axisLine={false} tickLine={false} />
                    <Bar dataKey="rate" fill="#4338ca" radius={[4,4,0,0]} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v}%`, 'Rate']} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Assignments + My Students */}
        <div className="fd-grid">

          {/* Assignments */}
          <div className="fd-card">
            <div className="fd-card-head">
              <h2>Assignments</h2>
              <Link className="fd-link" to="/faculty/assignments">Manage <ArrowRight size={12} /></Link>
            </div>
            {facultyAssignments.map(a => {
              const pct     = Math.round((a.submitted / a.total) * 100);
              const toGrade = a.submitted - a.graded;
              return (
                <div key={a.id} className="fd-asgn-row">
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="fd-asgn-title">{a.title}</div>
                    <div className="fd-asgn-meta">{a.subject} · Due {a.due}</div>
                    <div style={{ display:'flex', gap:12, marginTop:4 }}>
                      <span style={{ fontSize:'.74rem', color:'#34d399' }}>{a.submitted}/{a.total} submitted</span>
                      <span style={{ fontSize:'.74rem', color:'#818cf8' }}>{a.graded} graded</span>
                    </div>
                    <div className="fd-progress">
                      <div className="fd-progress-fill" style={{ width:`${pct}%` }} />
                    </div>
                  </div>
                  {toGrade > 0
                    ? <span className="fd-badge fd-badge--warn">{toGrade} to grade</span>
                    : <span className="fd-badge fd-badge--ok">All graded</span>
                  }
                </div>
              );
            })}
          </div>

          {/* My Students */}
          <div className="fd-card">
            <div className="fd-card-head">
              <h2>My Students</h2>
              <Link className="fd-link" to="/faculty/students">View All <ArrowRight size={12} /></Link>
            </div>
            <table className="fd-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Attendance</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {myStudents.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <div className="fd-av">{initials(s.name)}</div>
                        <div>
                          <div style={{ fontSize:'.85rem', fontWeight:600, color:'#eceefb' }}>{s.name}</div>
                          <div style={{ fontSize:'.72rem', color:'#7880a8' }}>{s.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div className="fd-mini-bar">
                          <div className="fd-mini-fill" style={{ width:`${s.attendance}%`, background:attColor(s.attendance) }} />
                        </div>
                        <span style={{ fontSize:'.8rem' }}>{s.attendance}%</span>
                      </div>
                    </td>
                    <td><span className={gradeClass(s.grade)}>{s.grade}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Announcements */}
        <div className="fd-card">
          <div className="fd-card-head">
            <h2>My Announcements</h2>
            <Link className="fd-btn fd-btn--primary" to="/faculty/announcements" style={{ padding:'7px 14px', fontSize:'.82rem' }}>
              <Plus size={14} /> New Announcement
            </Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12 }}>
            {facultyAnnouncements.map(a => (
              <div key={a.id} style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,.07)', borderRadius:10, padding:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span className={`fd-ann-badge fd-ann-${a.status}`}>{a.status}</span>
                  <span style={{ fontSize:'.72rem', color:'#555a7a' }}>{a.date}</span>
                </div>
                <p style={{ margin:'0 0 4px', fontSize:'.87rem', fontWeight:600, color:'#eceefb' }}>{a.title}</p>
                <p style={{ margin:0, fontSize:'.74rem', color:'#7880a8' }}>To: {a.audience}</p>
              </div>
            ))}
            <Link to="/faculty/announcements" style={{ background:'transparent', border:'2px dashed rgba(255,255,255,.1)', borderRadius:10, padding:14, display:'grid', placeItems:'center', textDecoration:'none', color:'#7880a8', fontSize:'.85rem', minHeight:80, transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#818cf8'; e.currentTarget.style.color='#818cf8'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.1)'; e.currentTarget.style.color='#7880a8'; }}
            >
              <div style={{ textAlign:'center' }}><div style={{ fontSize:'1.3rem', marginBottom:4 }}>+</div>Create announcement</div>
            </Link>
          </div>
        </div>

      </div>
    </>
  );
}
