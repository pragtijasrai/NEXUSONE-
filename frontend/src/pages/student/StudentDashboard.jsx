import { Link } from 'react-router-dom';
import {
  CalendarClock, GraduationCap, FileText, Megaphone,
  DoorOpen, Wrench, PackageSearch, Bus, Bot, CalendarDays,
  MapPin, ArrowRight, TrendingUp, Clock, RefreshCw,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApi } from '../../hooks/useApi.js';
import { getStudentDashboard } from '../../services/dashboardService.js';
import { LoadingSpinner, ErrorState } from '../../components/common/ApiStates.jsx';

/* Quick actions — static, no API needed */
const qactions = [
  { label:'Book Room',    icon:DoorOpen,      to:'/student/rooms',       color:'#4338ca', bg:'rgba(67,56,202,.1)'  },
  { label:'Report Issue', icon:Wrench,        to:'/student/maintenance', color:'#f59e0b', bg:'rgba(245,158,11,.1)' },
  { label:'Lost & Found', icon:PackageSearch, to:'/student/lost-found',  color:'#ec4899', bg:'rgba(236,72,153,.1)' },
  { label:'Shuttle Map',  icon:Bus,           to:'/student/transport',   color:'#10b981', bg:'rgba(16,185,129,.1)' },
  { label:'Ask AI',       icon:Bot,           to:'/student/assistant',   color:'#22d3ee', bg:'rgba(34,211,238,.1)' },
  { label:'Events',       icon:CalendarDays,  to:'/student/events',      color:'#8b5cf6', bg:'rgba(139,92,246,.1)' },
];

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
};

function StatCard({ icon: Icon, label, value, note, iconClass }) {
  return (
    <div className="card">
      <div className="stat">
        <span className={`stat__icon ${iconClass || ''}`}><Icon size={20}/></span>
        <div style={{ flex:1 }}>
          <p className="stat__label muted small" style={{ margin:'0 0 2px' }}>{label}</p>
          <p className="stat__value">{value}</p>
          {note && <p className="muted small" style={{ margin:'2px 0 0' }}>{note}</p>}
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Student';

  const { data, loading, error, refetch } = useApi(getStudentDashboard);

  if (loading) return <LoadingSpinner message="Loading dashboard…" />;
  if (error)   return <ErrorState error={error} onRetry={refetch} message="Could not load dashboard data." />;

  const d = data ?? {};
  const bookings   = d.upcomingBookings   ?? [];
  const tickets    = d.openTickets        ?? [];
  const events     = d.upcomingEvents     ?? [];
  const anns       = d.announcements      ?? [];
  const rooms      = d.availableRooms     ?? 0;

  /* Attendance chart — from dashboard data or fallback */
  const attendanceChart = d.attendanceChart ?? [];
  const avgAtt = attendanceChart.length
    ? Math.round(attendanceChart.reduce((s, x) => s + (x.pct ?? 0), 0) / attendanceChart.length)
    : 0;

  const unread    = anns.filter(a => a.unread ?? !a.created_at).length;
  const pendingTx = tickets.filter(t => t.status === 'open' || t.status === 'assigned').length;

  return (
    <div className="stack">
      {/* Header */}
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1>{greeting()}, {firstName}! 👋</h1>
          <p className="muted">Here's what's happening on your campus today.</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn--ghost btn--sm" onClick={refetch} aria-label="Refresh">
            <RefreshCw size={14}/> Refresh
          </button>
          <Link className="btn btn--ghost btn--sm" to="/student/events">Browse Events</Link>
          <Link className="btn btn--primary btn--sm" to="/student/rooms">Book a Room</Link>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid--4">
        <StatCard icon={CalendarClock}  label="Upcoming bookings"      value={bookings.length} note="Confirmed rooms"           iconClass="" />
        <StatCard icon={GraduationCap}  label="Avg. attendance"        value={avgAtt > 0 ? `${avgAtt}%` : '—'} note="Across subjects" iconClass={avgAtt >= 85 ? 'stat__icon--ok' : avgAtt > 0 ? 'stat__icon--warn' : ''} />
        <StatCard icon={FileText}       label="Open maintenance tickets" value={pendingTx}       note="Awaiting resolution"       iconClass="stat__icon--warn" />
        <StatCard icon={Megaphone}      label="Announcements"           value={anns.length}     note={unread > 0 ? `${unread} new` : 'All read'} iconClass={unread > 0 ? 'stat__icon--danger' : ''} />
      </div>

      {/* Quick actions */}
      <section>
        <h2 style={{ margin:'0 0 12px' }}>Quick Actions</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12 }}>
          {qactions.map(({ label, icon: Icon, to, color, bg }) => (
            <Link key={label} to={to} className="qaction" style={{ textDecoration:'none' }}>
              <div className="qaction__icon" style={{ background:bg, color }}>
                <Icon size={20}/>
              </div>
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming bookings + Announcements */}
      <div className="grid grid--2">
        <section className="card" aria-labelledby="bk">
          <div className="section-header">
            <h2 id="bk">Upcoming Room Bookings</h2>
            <Link className="btn btn--ghost btn--sm" to="/student/rooms">All Bookings <ArrowRight size={13}/></Link>
          </div>
          {bookings.length === 0
            ? <p className="muted small">No upcoming bookings. <Link to="/student/rooms">Book a room</Link></p>
            : <ul className="list">
              {bookings.slice(0,4).map(b => (
                <li key={b.id} className="row">
                  <div>
                    <strong style={{ fontSize:'.9rem' }}>{b.room_name ?? b.room_code}</strong>
                    <p className="muted small" style={{ margin:'2px 0 0' }}>
                      {b.building} · {b.purpose ?? '—'}
                    </p>
                    <p className="muted small" style={{ margin:'2px 0 0' }}>
                      {new Date(b.start_time).toLocaleString([], { dateStyle:'medium', timeStyle:'short' })}
                    </p>
                  </div>
                  <span className="badge badge--done">Confirmed</span>
                </li>
              ))}
            </ul>
          }
        </section>

        <section className="card" aria-labelledby="ann">
          <div className="section-header">
            <h2 id="ann">Recent Announcements</h2>
            {unread > 0 && <span className="badge badge--primary">{unread} new</span>}
          </div>
          {anns.length === 0
            ? <p className="muted small">No announcements yet.</p>
            : <ul className="list">
              {anns.slice(0,4).map((a,i) => (
                <li key={a.id ?? i} className="row">
                  <div style={{ flex:1, minWidth:0 }}>
                    <strong style={{ fontSize:'.88rem' }}>{a.title}</strong>
                    <p className="muted small truncate" style={{ margin:'2px 0' }}>{a.body ?? a.message}</p>
                    <span className="muted small">{a.category} · {a.created_at ? new Date(a.created_at).toLocaleDateString() : a.date}</span>
                  </div>
                  {a.priority === 'urgent' && <span className="badge badge--urgent" style={{ flexShrink:0 }}>Urgent</span>}
                </li>
              ))}
            </ul>
          }
        </section>
      </div>

      {/* Events + Campus overview */}
      <div className="grid grid--2">
        <section className="card" aria-labelledby="evt">
          <div className="section-header">
            <h2 id="evt">Upcoming Events</h2>
            <Link className="btn btn--ghost btn--sm" to="/student/events">See All <ArrowRight size={13}/></Link>
          </div>
          {events.length === 0
            ? <p className="muted small">No upcoming events. <Link to="/student/events">Browse events</Link></p>
            : <ul className="list">
              {events.slice(0,4).map(e => (
                <li key={e.id} className="row">
                  <div style={{ display:'flex', gap:10, alignItems:'center', flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'1.3rem', lineHeight:1 }}>
                      {e.category === 'technical' ? '🚀' : e.category === 'career' ? '💼' : e.category === 'cultural' ? '🎭' : '📅'}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <strong style={{ fontSize:'.88rem', display:'block' }} className="truncate">{e.title}</strong>
                      <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'.78rem', color:'var(--muted)' }}>
                        <MapPin size={11}/> {e.location} · {e.event_date ? new Date(e.event_date).toLocaleDateString() : e.date}
                      </span>
                    </div>
                  </div>
                  <span className={`badge ${e.registered ? 'badge--done' : 'badge--next'}`}>{e.registered ? 'Registered' : 'Open'}</span>
                </li>
              ))}
            </ul>
          }
        </section>

        <section className="card" aria-labelledby="ov">
          <h2 id="ov">Campus Overview</h2>
          <dl className="facts">
            <div><dt>Study rooms available</dt><dd style={{ color:'var(--ok)' }}>{rooms > 0 ? `${rooms} rooms` : '—'}</dd></div>
            <div><dt>Open maintenance tickets</dt><dd>{pendingTx}</dd></div>
            <div><dt>Next shuttle (Route A)</dt><dd style={{ color:'var(--primary)' }}>6 min</dd></div>
            <div><dt>Library hours today</dt><dd>Until midnight</dd></div>
          </dl>
          <div style={{ marginTop:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <Link className="btn btn--ghost btn--sm" to="/student/transport" style={{ justifyContent:'center' }}>
                <Bus size={14}/> Shuttle Map
              </Link>
              <Link className="btn btn--ghost btn--sm" to="/student/assistant" style={{ justifyContent:'center' }}>
                <Bot size={14}/> Ask AI
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
