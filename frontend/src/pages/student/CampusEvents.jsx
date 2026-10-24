import { useState } from 'react';
import { MapPin, Users, Calendar, ArrowRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { campusEvents, eventCategories } from '../../data/mockEvents.js';

const catColors = {
  Technical: '#4338ca', Cultural: '#ec4899', Career: '#0ea5e9',
  Hobby: '#10b981', Sports: '#f59e0b',
};

export default function CampusEvents() {
  const { notify } = useToast();
  const [cat, setCat] = useState('All Events');
  const [events, setEvents] = useState(campusEvents);

  const filtered = cat === 'All Events' ? events : events.filter(e => e.category === cat);

  const toggle = (id) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, registered: !e.registered } : e));
    const ev = events.find(e => e.id === id);
    if (!ev.registered) {
      notify(`Registered for ${ev.title}! 🎉`, 'success');
    } else {
      notify(`Cancelled registration for ${ev.title}.`, 'info');
    }
  };

  return (
    <div className="stack">
      <header>
        <h1>Campus Events</h1>
        <p className="muted">Discover and register for events happening on campus.</p>
      </header>

      {/* Category filter */}
      <div className="tabs" style={{ marginBottom:0 }}>
        {eventCategories.map(c => (
          <button key={c} className={`tab ${cat===c?'tab--active':''}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {/* Events grid */}
      <div className="grid grid--3">
        {filtered.map(ev => {
          const color = catColors[ev.category] || '#4338ca';
          const fillPct = Math.round(((ev.capacity - ev.seats) / ev.capacity) * 100);
          return (
            <div key={ev.id} className="card card--hover" style={{ padding:0, overflow:'hidden' }}>
              {/* Card header banner */}
              <div style={{
                background: `linear-gradient(135deg, ${color}22, ${color}08)`,
                borderBottom: `3px solid ${color}`,
                padding: '28px 20px 20px',
                position: 'relative',
              }}>
                <div style={{ fontSize:'2.5rem', marginBottom:8 }}>{ev.image}</div>
                <span className="badge" style={{ background:`${color}18`, color, marginBottom:8 }}>{ev.category}</span>
                <h3 style={{ margin:'8px 0 0', fontSize:'1rem' }}>{ev.title}</h3>
              </div>

              <div style={{ padding:'16px 20px 20px' }}>
                <div style={{ display:'grid', gap:6, marginBottom:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'.82rem', color:'var(--muted)' }}>
                    <Calendar size={13} />
                    {ev.date} at {ev.time}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'.82rem', color:'var(--muted)' }}>
                    <MapPin size={13} />
                    {ev.location}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'.82rem', color:'var(--muted)' }}>
                    <Users size={13} />
                    {ev.seats} / {ev.capacity} seats filled
                  </div>
                </div>

                <div className="progress" style={{ marginBottom:6 }}>
                  <div className="progress__fill" style={{ width:`${fillPct}%`, background: color }} />
                </div>
                <p style={{ fontSize:'.75rem', color:'var(--muted)', marginBottom:14 }}>
                  {ev.capacity - ev.seats} seats remaining · By {ev.organizer}
                </p>

                <button
                  className={`btn btn--block btn--sm ${ev.registered ? 'btn--ghost' : 'btn--primary'}`}
                  style={!ev.registered ? { background:`linear-gradient(135deg,${color},${color}cc)`, border:0 } : {}}
                  onClick={() => toggle(ev.id)}
                >
                  {ev.registered ? 'Cancel Registration' : 'Register Now'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
