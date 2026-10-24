import { Link } from 'react-router-dom';
import {
  CalendarClock, GraduationCap, FileText, Megaphone,
  DoorOpen, Wrench, PackageSearch, Bus, Bot, CalendarDays,
  MapPin, ArrowRight, TrendingUp, Clock,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  todaysClasses, announcements, events, attendanceChart,
  attendanceData, assignments,
} from '../../data/mockStudent.js';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
};

const qactions = [
  { label: 'Book Room',     icon: DoorOpen,      to: '/student/rooms',       color: '#4338ca', bg: 'rgba(67,56,202,.1)'  },
  { label: 'Report Issue',  icon: Wrench,        to: '/student/maintenance', color: '#f59e0b', bg: 'rgba(245,158,11,.1)' },
  { label: 'Lost & Found',  icon: PackageSearch, to: '/student/lost-found',  color: '#ec4899', bg: 'rgba(236,72,153,.1)' },
  { label: 'Track Shuttle', icon: Bus,           to: '/student/transport',   color: '#10b981', bg: 'rgba(16,185,129,.1)' },
  { label: 'Ask AI',        icon: Bot,           to: '/student/assistant',   color: '#22d3ee', bg: 'rgba(34,211,238,.1)' },
  { label: 'Events',        icon: CalendarDays,  to: '/student/events',      color: '#8b5cf6', bg: 'rgba(139,92,246,.1)' },
];

function StatCard({ icon: Icon, label, value, note, iconClass }) {
  return (
    <div className="card">
      <div className="stat">
        <span className={`stat__icon ${iconClass || ''}`}>
          <Icon size={20} aria-hidden="true" />
        </span>
        <div style={{ flex: 1 }}>
          <p className="stat__label muted small" style={{ margin: '0 0 2px' }}>{label}</p>
          <p className="stat__value">{value}</p>
          {note && <p className="muted small" style={{ margin: '2px 0 0' }}>{note}</p>}
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const firstName = user.name.split(' ')[0];
  const unread = announcements.filter(a => a.unread).length;
  const pending = assignments.filter(a => a.status === 'pending').length;
  const avgAtt = Math.round(attendanceData.reduce((s, d) => s + d.pct, 0) / attendanceData.length);

  return (
    <div className="stack">
      {/* Greeting */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>{greeting()}, {firstName}! 👋</h1>
          <p className="muted">Here's what's happening on your campus today.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link className="btn btn--ghost btn--sm" to="/student/events">Browse Events</Link>
          <Link className="btn btn--primary btn--sm" to="/student/rooms">Book a Room</Link>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid--4">
        <StatCard icon={CalendarClock} label="Today's classes"       value={todaysClasses.length} note={`Next: ${todaysClasses.find(c => c.status === 'Upcoming')?.subject ?? 'None'}`}  iconClass="" />
        <StatCard icon={GraduationCap} label="Avg. attendance"       value={`${avgAtt}%`}  note="Across all subjects"          iconClass={avgAtt >= 85 ? 'stat__icon--ok' : 'stat__icon--warn'} />
        <StatCard icon={FileText}      label="Pending assignments"    value={pending}       note="Nearest due in 2 days"        iconClass="stat__icon--warn" />
        <StatCard icon={Megaphone}     label="Unread announcements"   value={unread}        note={`${announcements.filter(a => a.priority === 'Urgent' && a.unread).length} urgent`} iconClass="stat__icon--danger" />
      </div>

      {/* Quick actions */}
      <section>
        <h2 style={{ margin: '0 0 12px' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12 }}>
          {qactions.map(({ label, icon: Icon, to, color, bg }) => (
            <Link key={label} to={to} className="qaction" style={{ textDecoration: 'none' }}>
              <div className="qaction__icon" style={{ background: bg, color }}>
                <Icon size={20} aria-hidden="true" />
              </div>
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Schedule + Announcements */}
      <div className="grid grid--2">
        {/* Today's Schedule */}
        <section className="card" aria-labelledby="sched">
          <div className="section-header">
            <h2 id="sched">Today's Timetable</h2>
            <Link className="btn btn--ghost btn--sm" to="/student/schedule">Full Schedule <ArrowRight size={13} /></Link>
          </div>
          <ul className="list">
            {todaysClasses.map(c => (
              <li key={c.id} className="row">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 3, height: 40, borderRadius: 3, background: c.status === 'Completed' ? 'var(--ok)' : c.status === 'In progress' ? 'var(--primary)' : 'var(--border)', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '.9rem' }}>{c.subject}</strong>
                    <p className="muted small" style={{ margin: '2px 0 0' }}>{c.time} · {c.faculty} · {c.room}</p>
                  </div>
                </div>
                <span className={`badge badge--${c.status === 'In progress' ? 'live' : c.status === 'Completed' ? 'done' : 'next'}`}>
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Announcements */}
        <section className="card" aria-labelledby="ann">
          <div className="section-header">
            <h2 id="ann">Announcements</h2>
            {unread > 0 && <span className="badge badge--primary">{unread} new</span>}
          </div>
          <ul className="list">
            {announcements.map(a => (
              <li key={a.id} className="row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: '.88rem', display: 'flex', alignItems: 'center' }}>
                    {a.unread && <span className="dot" aria-label="Unread" />}
                    <span className="truncate">{a.title}</span>
                  </strong>
                  <p className="muted small truncate" style={{ margin: '2px 0' }}>{a.body}</p>
                  <span className="muted small">{a.category} · {a.date}</span>
                </div>
                {a.priority === 'Urgent' && <span className="badge badge--urgent" style={{ flexShrink:0 }}>Urgent</span>}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Attendance chart + Assignments */}
      <div className="grid grid--2">
        {/* Attendance trend */}
        <section className="card" aria-labelledby="att">
          <div className="section-header">
            <h2 id="att">Attendance Trend</h2>
            <span className="badge badge--done" style={{ display:'flex', alignItems:'center', gap:4 }}>
              <TrendingUp size={12} />{avgAtt}% avg
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={attendanceChart} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4338ca" stopOpacity=".25" />
                  <stop offset="95%" stopColor="#4338ca" stopOpacity="0"   />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }} formatter={v => [`${v}%`, 'Attendance']} />
              <Area type="monotone" dataKey="pct" stroke="#4338ca" strokeWidth={2.5} fill="url(#attGrad)" dot={{ r: 4, fill: '#4338ca', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display:'grid', gap:8, marginTop:16 }}>
            {attendanceData.map(d => (
              <div key={d.subject} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ width:120, fontSize:'.78rem', color:'var(--muted)', flexShrink:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.subject}</span>
                <div className="progress" style={{ flex:1 }}>
                  <div className={`progress__fill progress__fill--${d.pct >= 85 ? 'ok' : d.pct >= 75 ? 'warn' : 'danger'}`} style={{ width:`${d.pct}%` }} />
                </div>
                <span style={{ width:36, textAlign:'right', fontSize:'.8rem', fontWeight:600 }}>{d.pct}%</span>
              </div>
            ))}
          </div>
        </section>

        {/* Assignments */}
        <section className="card" aria-labelledby="asn">
          <div className="section-header">
            <h2 id="asn">Assignments</h2>
            <span className="badge badge--warn">{pending} pending</span>
          </div>
          <ul className="list">
            {assignments.map(a => (
              <li key={a.id} className="row">
                <div style={{ flex:1, minWidth:0 }}>
                  <strong style={{ fontSize:'.88rem', display:'block' }} className="truncate">{a.title}</strong>
                  <p className="muted small" style={{ margin:'2px 0' }}>{a.subject}</p>
                  <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'.78rem', color:'var(--muted)' }}>
                    <Clock size={11} /> Due {a.due}
                  </span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                  <span className={`badge badge--${a.status === 'submitted' ? 'done' : a.priority === 'high' ? 'urgent' : 'next'}`}>
                    {a.status === 'submitted' ? 'Submitted' : a.priority === 'high' ? 'High priority' : 'Pending'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Events + Campus Overview */}
      <div className="grid grid--2">
        <section className="card" aria-labelledby="evt">
          <div className="section-header">
            <h2 id="evt">Upcoming Events</h2>
            <Link className="btn btn--ghost btn--sm" to="/student/events">See All <ArrowRight size={13} /></Link>
          </div>
          <ul className="list">
            {events.map(e => (
              <li key={e.id} className="row">
                <div style={{ display:'flex', gap:10, alignItems:'center', flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'1.3rem', lineHeight:1 }}>{
                    e.category === 'Technical' ? '🚀' : e.category === 'Career' ? '💼' : e.category === 'Cultural' ? '🎭' : '📅'
                  }</div>
                  <div style={{ minWidth:0 }}>
                    <strong style={{ fontSize:'.88rem', display:'block' }} className="truncate">{e.title}</strong>
                    <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'.78rem', color:'var(--muted)' }}>
                      <MapPin size={11} /> {e.location} · {e.date}
                    </span>
                  </div>
                </div>
                <span className={`badge badge--${e.registered ? 'done' : 'next'}`}>{e.registered ? 'Registered' : 'Open'}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card" aria-labelledby="ov">
          <h2 id="ov">Campus Overview</h2>
          <dl className="facts">
            <div><dt>Study rooms available</dt><dd style={{ color:'var(--ok)' }}>7 rooms</dd></div>
            <div><dt>Open maintenance tickets</dt><dd>2</dd></div>
            <div><dt>Next shuttle (Route A)</dt><dd style={{ color:'var(--primary)' }}>6 min</dd></div>
            <div><dt>Library hours today</dt><dd>Until midnight</dd></div>
          </dl>
          <div style={{ marginTop:16 }}>
            <p className="muted small" style={{ marginBottom:8 }}>Explore campus</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <Link className="btn btn--ghost btn--sm" to="/student/transport" style={{ justifyContent:'center' }}>
                <Bus size={14} /> Shuttle Map
              </Link>
              <Link className="btn btn--ghost btn--sm" to="/student/assistant" style={{ justifyContent:'center' }}>
                <Bot size={14} /> Ask AI
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
