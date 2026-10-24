import { CalendarClock, GraduationCap, FileText, Megaphone, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { todaysClasses, announcements, events, campusOverview } from '../../data/mockStudent.js';
const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
function Stat({ icon: Icon, label, value, note }) {
  return (<div className="card stat"><span className="stat__icon"><Icon size={18} aria-hidden="true" /></span><div><p className="muted">{label}</p><p className="stat__value">{value}</p><p className="muted small">{note}</p></div></div>);
}
export default function StudentDashboard() {
  const { user } = useAuth();
  const unread = announcements.filter((a) => a.unread).length;
  return (
    <div className="stack">
      <header><h1>{greeting()}, {user.name.split(' ')[0]}!</h1><p className="muted">Here's what's happening on your campus today.</p></header>
      <section className="grid grid--4" aria-label="Summary">
        <Stat icon={CalendarClock} label="Today's classes" value={todaysClasses.length} note="Next: Software Engineering, 14:00" />
        <Stat icon={GraduationCap} label="Overall attendance" value="91%" note="Sample data, not an official record" />
        <Stat icon={FileText} label="Pending assignments" value="3" note="Nearest due in 2 days" />
        <Stat icon={Megaphone} label="Unread announcements" value={unread} note="1 marked urgent" />
      </section>
      <div className="grid grid--2">
        <section className="card" aria-labelledby="sched"><h2 id="sched">Today's schedule</h2>
          <ul className="list">{todaysClasses.map((c) => (<li key={c.id} className="row">
            <div><strong>{c.subject}</strong><p className="muted small">{c.time} · {c.faculty} · {c.room}</p></div>
            <span className={`badge badge--${c.status === 'In progress' ? 'live' : c.status === 'Completed' ? 'done' : 'next'}`}>{c.status}</span></li>))}</ul></section>
        <section className="card" aria-labelledby="ann"><h2 id="ann">Campus announcements</h2>
          <ul className="list">{announcements.map((a) => (<li key={a.id} className="row"><div>
            <strong>{a.unread && <span className="dot" aria-label="Unread" />}{a.title}</strong><p className="muted small">{a.body}</p><p className="muted small">{a.category} · {a.date}</p></div>
            {a.priority === 'Urgent' && <span className="badge badge--urgent">Urgent</span>}</li>))}</ul></section>
      </div>
      <div className="grid grid--2">
        <section className="card" aria-labelledby="evt"><h2 id="evt">Upcoming events</h2>
          <ul className="list">{events.map((e) => (<li key={e.id} className="row"><div><strong>{e.title}</strong>
            <p className="muted small"><MapPin size={12} aria-hidden="true" /> {e.location} · {e.date}</p></div>
            <span className={`badge badge--${e.registered ? 'done' : 'next'}`}>{e.registered ? 'Registered' : 'Open'}</span></li>))}</ul></section>
        <section className="card" aria-labelledby="ov"><h2 id="ov">Campus overview</h2>
          <dl className="facts"><div><dt>Study rooms available</dt><dd>{campusOverview.studyRoomsAvailable}</dd></div>
            <div><dt>Open maintenance tickets</dt><dd>{campusOverview.openTickets}</dd></div>
            <div><dt>Next shuttle (simulated)</dt><dd>{campusOverview.nextShuttle}</dd></div></dl>
          <p className="muted small">Quick actions for rooms, issues, lost items, shuttles and the assistant are added with their pages.</p></section>
      </div>
    </div>
  );
}
