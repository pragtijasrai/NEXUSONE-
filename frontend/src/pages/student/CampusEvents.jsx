import { useState } from 'react';
import { MapPin, Users, Calendar, RefreshCw } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import * as ev from '../../services/eventService.js';

const catColors = { technical:'#4338ca', cultural:'#ec4899', career:'#0ea5e9', hobby:'#10b981', sports:'#f59e0b', general:'#6b7280' };

export default function CampusEvents() {
  const { notify } = useToast();
  const [cat, setCat] = useState('All Events');
  const [busy, setBusy] = useState(null);

  const { data, loading, error, refetch } = useApi(ev.getEvents);

  const events = data?.rows ?? [];
  const categories = ['All Events', ...new Set(events.map(e => e.category))];
  const filtered = cat === 'All Events' ? events : events.filter(e => e.category === cat);

  const toggle = async (event) => {
    setBusy(event.id);
    try {
      if (event.registered) {
        await ev.unregisterEvent(event.id);
        notify(`Cancelled registration for ${event.title}.`, 'info');
      } else {
        await ev.registerEvent(event.id);
        notify(`Registered for ${event.title}! 🎉`, 'success');
      }
      refetch();
    } catch (e) {
      notify(e.message || 'Action failed', 'error');
    } finally { setBusy(null); }
  };

  if (loading) return <LoadingSpinner message="Loading events…" />;
  if (error)   return <ErrorState error={error} onRetry={refetch} />;

  const fmtDate = (e) => {
    if (e.event_date) return new Date(e.event_date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
    return e.date ?? '—';
  };

  return (
    <div className="stack">
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1>Campus Events</h1>
          <p className="muted">Discover and register for events happening on campus.</p>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={refetch}><RefreshCw size={14}/> Refresh</button>
      </header>

      {/* Category filter */}
      <div className="tabs" style={{ marginBottom:0 }}>
        {categories.map(c => (
          <button key={c} className={`tab ${cat===c?'tab--active':''}`} onClick={()=>setCat(c)}>{c}</button>
        ))}
      </div>

      {filtered.length === 0
        ? <EmptyState icon="📅" title="No events found" description="Check back soon for upcoming events." />
        : <div className="grid grid--3">
          {filtered.map(event => {
            const color = catColors[event.category] ?? '#4338ca';
            const filled = event.seats_filled ?? (event.capacity - (event.seats ?? event.capacity));
            const fillPct = event.capacity ? Math.round((filled / event.capacity) * 100) : 0;
            const isBusy = busy === event.id;
            return (
              <div key={event.id} className="card card--hover" style={{ padding:0, overflow:'hidden' }}>
                <div style={{ background:`linear-gradient(135deg,${color}22,${color}08)`, borderBottom:`3px solid ${color}`, padding:'28px 20px 20px', position:'relative' }}>
                  <div style={{ fontSize:'2.5rem', marginBottom:8 }}>{event.image ?? '📅'}</div>
                  <span className="badge" style={{ background:`${color}18`, color, marginBottom:8 }}>{event.category}</span>
                  <h3 style={{ margin:'8px 0 0', fontSize:'1rem' }}>{event.title}</h3>
                </div>
                <div style={{ padding:'16px 20px 20px' }}>
                  <div style={{ display:'grid', gap:6, marginBottom:14 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'.82rem', color:'var(--muted)' }}>
                      <Calendar size={13}/> {fmtDate(event)}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'.82rem', color:'var(--muted)' }}>
                      <MapPin size={13}/> {event.location}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'.82rem', color:'var(--muted)' }}>
                      <Users size={13}/> {event.registrations ?? filled}/{event.capacity} seats
                    </div>
                  </div>
                  <div className="progress" style={{ marginBottom:6 }}>
                    <div className="progress__fill" style={{ width:`${fillPct}%`, background:color }}/>
                  </div>
                  <p style={{ fontSize:'.75rem', color:'var(--muted)', marginBottom:14 }}>
                    {event.capacity - (event.registrations ?? filled)} seats remaining · By {event.organizer}
                  </p>
                  <button
                    className={`btn btn--block btn--sm ${event.registered ? 'btn--ghost' : 'btn--primary'}`}
                    style={!event.registered ? { background:`linear-gradient(135deg,${color},${color}cc)`, border:0 } : {}}
                    onClick={() => toggle(event)}
                    disabled={isBusy}
                  >
                    {isBusy ? 'Processing…' : event.registered ? 'Cancel Registration' : 'Register Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}
