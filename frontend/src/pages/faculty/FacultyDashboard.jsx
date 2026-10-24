import { Link } from 'react-router-dom';
import { BookOpen, Users, FileText, Megaphone, ArrowRight, TrendingUp, CheckCircle2 } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  facultyClasses, facultyAssignments, myStudents,
  attendanceSummary, weeklyAttendance, facultyAnnouncements,
} from '../../data/mockFaculty.js';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
};

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card">
      <div className="stat">
        <span className="stat__icon" style={{ background: `${color}18`, color }}>
          <Icon size={20} aria-hidden="true" />
        </span>
        <div>
          <p className="stat__label muted small" style={{ margin: '0 0 2px' }}>{label}</p>
          <p className="stat__value">{value}</p>
          {sub && <p className="muted small" style={{ margin: '2px 0 0' }}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export default function FacultyDashboard() {
  const { user } = useAuth();
  const firstName = user.name.split(' ')[0];
  const totalStudents = myStudents.length;
  const pending = facultyAssignments.reduce((s, a) => s + (a.submitted - a.graded), 0);

  return (
    <div className="stack">
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1>{greeting()}, {firstName}! 👋</h1>
          <p className="muted">Here's an overview of your teaching activities.</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Link className="btn btn--ghost btn--sm" to="/faculty/announcements">Post Announcement</Link>
          <Link className="btn btn--primary btn--sm" to="/faculty/assignments">Manage Assignments</Link>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid--4">
        <StatCard icon={BookOpen}   label="My Classes"          value={facultyClasses.length}  sub="Today's sessions"       color="#4338ca" />
        <StatCard icon={Users}      label="Total Students"      value={totalStudents}           sub="Across all courses"     color="#0ea5e9" />
        <StatCard icon={FileText}   label="Pending to Grade"    value={pending}                sub="Submissions"            color="#f59e0b" />
        <StatCard icon={Megaphone}  label="Announcements"       value={facultyAnnouncements.length} sub="2 published"      color="#7c3aed" />
      </div>

      <div className="grid grid--2">
        {/* Today's classes */}
        <section className="card" aria-labelledby="fc">
          <div className="section-header">
            <h2 id="fc">Today's Classes</h2>
            <Link className="btn btn--ghost btn--sm" to="/faculty/schedule">Full Schedule <ArrowRight size={13} /></Link>
          </div>
          <ul className="list">
            {facultyClasses.map(c => (
              <li key={c.id} className="row">
                <div style={{ display:'flex', gap:10, alignItems:'center', flex:1 }}>
                  <div style={{ width:3, height:44, borderRadius:3, background: c.status==='Completed'?'var(--ok)':c.status==='In progress'?'var(--primary)':'var(--border)', flexShrink:0 }} />
                  <div>
                    <strong style={{ fontSize:'.9rem' }}>{c.subject}</strong>
                    <p className="muted small" style={{ margin:'2px 0 0' }}>{c.time} · {c.room}</p>
                    {c.status !== 'Upcoming' && (
                      <p className="muted small">{c.present}/{c.enrolled} present</p>
                    )}
                  </div>
                </div>
                <span className={`badge badge--${c.status==='In progress'?'live':c.status==='Completed'?'done':'next'}`}>{c.status}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Student attendance summary */}
        <section className="card" aria-labelledby="sa">
          <div className="section-header">
            <h2 id="sa">Student Attendance</h2>
            <span className="badge badge--done" style={{ display:'flex', alignItems:'center', gap:4 }}>
              <TrendingUp size={12} />Today
            </span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, alignItems:'center' }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={attendanceSummary} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" strokeWidth={0}>
                  {attendanceSummary.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:'grid', gap:10 }}>
              {attendanceSummary.map(s => (
                <div key={s.name} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:s.color, flexShrink:0 }} />
                  <span className="muted small">{s.name}</span>
                  <strong style={{ marginLeft:'auto', fontSize:'.88rem' }}>{s.value}</strong>
                </div>
              ))}
              <div style={{ borderTop:'1px solid var(--border)', paddingTop:8 }}>
                <strong style={{ fontSize:'.9rem' }}>Total: {attendanceSummary.reduce((s,d)=>s+d.value,0)}</strong>
              </div>
            </div>
          </div>
          <div style={{ marginTop:16 }}>
            <p className="muted small" style={{ marginBottom:8 }}>Weekly attendance rate</p>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={weeklyAttendance} margin={{ top:0, right:0, bottom:0, left:-30 }}>
                <XAxis dataKey="day" tick={{ fontSize:10, fill:'var(--muted)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[60,100]} tick={{ fontSize:10, fill:'var(--muted)' }} axisLine={false} tickLine={false} />
                <Bar dataKey="rate" fill="#4338ca" radius={[4,4,0,0]} />
                <Tooltip contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }} formatter={v=>[`${v}%`, 'Rate']} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid grid--2">
        {/* Assignments */}
        <section className="card" aria-labelledby="fa">
          <div className="section-header">
            <h2 id="fa">Assignments</h2>
            <Link className="btn btn--ghost btn--sm" to="/faculty/assignments">Manage <ArrowRight size={13} /></Link>
          </div>
          <ul className="list">
            {facultyAssignments.map(a => (
              <li key={a.id} className="row">
                <div style={{ flex:1, minWidth:0 }}>
                  <strong style={{ fontSize:'.88rem' }}>{a.title}</strong>
                  <p className="muted small" style={{ margin:'2px 0' }}>{a.subject} · Due {a.due}</p>
                  <div style={{ display:'flex', gap:12, marginTop:4 }}>
                    <span style={{ fontSize:'.75rem', color:'var(--ok)' }}>{a.submitted}/{a.total} submitted</span>
                    <span style={{ fontSize:'.75rem', color:'var(--primary)' }}>{a.graded} graded</span>
                  </div>
                  <div className="progress" style={{ marginTop:6 }}>
                    <div className="progress__fill" style={{ width:`${(a.submitted/a.total)*100}%` }} />
                  </div>
                </div>
                {a.submitted - a.graded > 0 && (
                  <span className="badge badge--warn" style={{ flexShrink:0 }}>{a.submitted - a.graded} to grade</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* My students */}
        <section className="card" aria-labelledby="ms">
          <div className="section-header">
            <h2 id="ms">My Students</h2>
            <Link className="btn btn--ghost btn--sm" to="/faculty/students">View All <ArrowRight size={13} /></Link>
          </div>
          <div className="table-wrap">
            <table>
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
                        <div className="avatar avatar--sm">{s.name.split(' ').map(n=>n[0]).join('')}</div>
                        <div>
                          <div style={{ fontSize:'.85rem', fontWeight:600 }}>{s.name}</div>
                          <div style={{ fontSize:'.75rem', color:'var(--muted)' }}>{s.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div className="progress" style={{ width:60 }}>
                          <div className={`progress__fill progress__fill--${s.attendance>=85?'ok':s.attendance>=75?'warn':'danger'}`} style={{ width:`${s.attendance}%` }} />
                        </div>
                        <span style={{ fontSize:'.8rem' }}>{s.attendance}%</span>
                      </div>
                    </td>
                    <td><span className={`badge badge--${s.grade.startsWith('A')?'done':s.grade.startsWith('B')?'primary':'warn'}`}>{s.grade}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Announcements */}
      <section className="card" aria-labelledby="fan">
        <div className="section-header">
          <h2 id="fan">My Announcements</h2>
          <Link className="btn btn--primary btn--sm" to="/faculty/announcements">+ New Announcement</Link>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {facultyAnnouncements.map(a => (
            <div key={a.id} className="card" style={{ margin:0, padding:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span className={`badge badge--${a.status==='published'?'done':'next'}`}>{a.status}</span>
                <span className="muted small">{a.date}</span>
              </div>
              <p style={{ margin:0, fontSize:'.88rem', fontWeight:600 }}>{a.title}</p>
              <p className="muted small" style={{ margin:'4px 0 0' }}>To: {a.audience}</p>
            </div>
          ))}
          <div className="card card--hover" style={{ margin:0, padding:14, border:'2px dashed var(--border)', display:'grid', placeItems:'center', minHeight:80 }}>
            <Link to="/faculty/announcements" style={{ color:'var(--muted)', textDecoration:'none', fontSize:'.88rem', textAlign:'center' }}>
              <div style={{ fontSize:'1.5rem', marginBottom:4 }}>+</div>
              Create announcement
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
