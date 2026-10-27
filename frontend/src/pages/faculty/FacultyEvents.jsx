/**
 * FacultyEvents — /faculty/events
 * Browse campus events, RSVP, and create new events.
 */
import { useState, useMemo } from 'react';
import {
  Calendar, MapPin, Users, Search, Plus, X,
  CheckCircle2, Tag, BookOpen, ChevronLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.jsx';
import { campusEvents as initialEvents, eventCategories } from '../../data/mockEvents.js';

const css = `
  .fe { background:#0d1117; min-height:100vh; color:#c5caf0; font-family:inherit; padding:28px 32px; }
  .fe h1 { font-size:1.4rem; font-weight:700; color:#eceefb; margin:0 0 4px; }
  .fe-sub { font-size:.88rem; color:#7880a8; margin:0; }
  .fe-back { display:inline-flex; align-items:center; gap:6px; color:#7880a8; font-size:.83rem; text-decoration:none; margin-bottom:16px; transition:color .15s; }
  .fe-back:hover { color:#818cf8; }
  .fe-tabs { display:flex; gap:0; border-bottom:2px solid rgba(255,255,255,.07); margin-bottom:22px; }
  .fe-tab { padding:10px 22px; border:0; background:none; font:inherit; font-size:.88rem; font-weight:500; color:#7880a8; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; transition:all .15s; display:flex; align-items:center; gap:7px; }
  .fe-tab:hover { color:#c5caf0; }
  .fe-tab--active { color:#818cf8; border-bottom-color:#818cf8; font-weight:700; }
  .fe-bar { display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:20px; }
  .fe-search { display:flex; align-items:center; gap:8px; background:#161b2e; border:1.5px solid rgba(255,255,255,.08); border-radius:10px; padding:0 12px; flex:1; min-width:200px; max-width:340px; transition:border-color .18s; }
  .fe-search:focus-within { border-color:#4338ca; }
  .fe-search input { border:0; background:none; min-height:40px; font:inherit; color:#eceefb; width:100%; outline:none; font-size:.88rem; }
  .fe-search input::placeholder { color:#7880a8; }
  .fe-pill { padding:7px 14px; border-radius:8px; border:1px solid rgba(255,255,255,.08); background:#161b2e; color:#7880a8; font:inherit; font-size:.8rem; cursor:pointer; transition:all .15s; white-space:nowrap; }
  .fe-pill:hover { border-color:#4338ca; color:#818cf8; }
  .fe-pill--active { border-color:#4338ca; color:#818cf8; background:rgba(99,102,241,.12); }
  .fe-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:22px; }
  .fe-stat { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:12px; padding:16px 18px; display:flex; align-items:center; gap:14px; }
  .fe-stat-icon { width:38px; height:38px; border-radius:10px; display:grid; place-items:center; flex-shrink:0; }
  .fe-stat-val { font-size:1.45rem; font-weight:800; color:#eceefb; line-height:1; }
  .fe-stat-lbl { font-size:.72rem; color:#7880a8; margin-top:3px; }
  .fe-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:16px; }
  .fe-card { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:14px; overflow:hidden; display:flex; flex-direction:column; transition:transform .18s,box-shadow .18s,border-color .18s; }
  .fe-card:hover { transform:translateY(-3px); box-shadow:0 12px 40px rgba(0,0,0,.45); border-color:rgba(99,102,241,.2); }
  .fe-card-banner { padding:26px 20px 18px; position:relative; display:flex; flex-direction:column; gap:8px; }
  .fe-card-emoji { font-size:2.2rem; line-height:1; }
  .fe-cat-tag { font-size:.7rem; font-weight:700; padding:3px 9px; border-radius:6px; display:inline-block; width:fit-content; }
  .fe-card-title { font-size:1rem; font-weight:700; color:#eceefb; margin:4px 0 0; line-height:1.3; }
  .fe-card-body { padding:14px 20px 18px; display:flex; flex-direction:column; gap:10px; flex:1; }
  .fe-meta-row { display:flex; align-items:center; gap:8px; font-size:.8rem; color:#7880a8; }
  .fe-meta-row svg { flex-shrink:0; color:#555a7a; }
  .fe-progress { height:5px; background:rgba(255,255,255,.06); border-radius:99px; overflow:hidden; margin-top:2px; }
  .fe-progress-fill { height:100%; border-radius:99px; transition:width .4s; }
  .fe-seats-txt { font-size:.73rem; color:#7880a8; margin-top:3px; }
  .fe-rsvp-btn { width:100%; padding:10px; border-radius:10px; border:0; font:inherit; font-size:.88rem; font-weight:700; cursor:pointer; transition:all .18s; display:flex; align-items:center; justify-content:center; gap:7px; margin-top:auto; }
  .fe-rsvp-btn--on  { background:rgba(99,102,241,.22); color:#818cf8; border:1px solid rgba(99,102,241,.35); }
  .fe-rsvp-btn--on:hover { background:rgba(99,102,241,.35); }
  .fe-rsvp-btn--off { color:#fff; border:0; }
  .fe-rsvp-btn--off:hover { filter:brightness(1.1); transform:translateY(-1px); }
  .fe-host-badge { font-size:.68rem; font-weight:700; padding:2px 7px; border-radius:5px; background:rgba(34,211,238,.15); color:#22d3ee; position:absolute; top:12px; right:12px; }
  .fe-empty { text-align:center; padding:60px 20px; color:#7880a8; }
  .fe-empty p { margin-top:10px; font-size:.88rem; }
  .fe-modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.72); z-index:9999; backdrop-filter:blur(4px); display:grid; place-items:center; padding:16px; }
  .fe-modal { background:#131628; border:1px solid rgba(255,255,255,.1); border-radius:16px; padding:26px; width:min(520px,100%); max-height:90vh; overflow-y:auto; animation:feIn .2s cubic-bezier(.34,1.1,.64,1); }
  @keyframes feIn { from{opacity:0;transform:scale(.95) translateY(10px);} }
  .fe-modal h3 { font-size:1.05rem; font-weight:700; color:#eceefb; margin:0 0 18px; display:flex; align-items:center; gap:9px; }
  .fe-field { margin-bottom:14px; }
  .fe-field label { display:block; font-size:.76rem; font-weight:600; color:#7880a8; text-transform:uppercase; letter-spacing:.05em; margin-bottom:5px; }
  .fe-field input, .fe-field select, .fe-field textarea { width:100%; padding:10px 13px; border-radius:9px; box-sizing:border-box; background:#0d1117; border:1.5px solid rgba(255,255,255,.1); color:#eceefb; font:inherit; font-size:.88rem; transition:border-color .18s; }
  .fe-field select { appearance:none; cursor:pointer; }
  .fe-field textarea { resize:vertical; min-height:80px; }
  .fe-field input:focus, .fe-field select:focus, .fe-field textarea:focus { outline:none; border-color:#4338ca; }
  .fe-field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .fe-modal-footer { display:flex; gap:10px; justify-content:flex-end; margin-top:6px; }
  .fe-btn { display:inline-flex; align-items:center; gap:7px; padding:10px 22px; border-radius:10px; border:0; font:inherit; font-size:.9rem; font-weight:600; cursor:pointer; transition:all .18s; }
  .fe-btn--primary { background:linear-gradient(135deg,#4338ca,#6366f1); color:#fff; }
  .fe-btn--primary:hover { filter:brightness(1.1); }
  .fe-btn--primary:disabled { opacity:.5; cursor:not-allowed; filter:none; }
  .fe-btn--ghost { background:rgba(255,255,255,.06); color:#c5caf0; border:1px solid rgba(255,255,255,.1); }
  .fe-btn--ghost:hover { background:rgba(255,255,255,.1); }
  @media(max-width:768px){.fe{padding:16px;}.fe-stats{grid-template-columns:1fr 1fr;}}
  @media(max-width:480px){.fe-grid{grid-template-columns:1fr;}.fe-field-row{grid-template-columns:1fr;}}
`;

const CAT_COLOR = {
  Technical:'#4338ca', Cultural:'#ec4899', Career:'#0ea5e9',
  Hobby:'#10b981', Sports:'#f59e0b', Department:'#818cf8',
};
const EMOJIS = { Technical:'🚀', Cultural:'🎭', Career:'💼', Hobby:'📸', Sports:'🏅', Department:'📋' };

function EventCard({ ev, onToggleRsvp }) {
  const color   = CAT_COLOR[ev.category] || '#818cf8';
  const fillPct = Math.round((ev.seats / ev.capacity) * 100);
  return (
    <div className="fe-card">
      <div className="fe-card-banner" style={{ background:`linear-gradient(135deg,${color}22,${color}08)`, borderBottom:`3px solid ${color}` }}>
        {ev.isOwn && <span className="fe-host-badge">You're hosting</span>}
        <span className="fe-card-emoji">{ev.image || EMOJIS[ev.category] || '📅'}</span>
        <span className="fe-cat-tag" style={{ background:`${color}20`, color }}>{ev.category}</span>
        <p className="fe-card-title">{ev.title}</p>
      </div>
      <div className="fe-card-body">
        <div className="fe-meta-row"><Calendar size={13} /> {ev.date} at {ev.time}</div>
        <div className="fe-meta-row"><MapPin size={13} /> {ev.location}</div>
        <div className="fe-meta-row"><Users size={13} /> {ev.seats} / {ev.capacity} attending</div>
        <div className="fe-meta-row"><Tag size={13} /> By {ev.organizer}</div>
        <div className="fe-progress"><div className="fe-progress-fill" style={{ width:`${fillPct}%`, background:color }} /></div>
        <p className="fe-seats-txt">{ev.capacity - ev.seats} seats remaining</p>
        <button
          className={`fe-rsvp-btn ${ev.registered ? 'fe-rsvp-btn--on' : 'fe-rsvp-btn--off'}`}
          style={!ev.registered ? { background:`linear-gradient(135deg,${color},${color}cc)` } : {}}
          onClick={() => onToggleRsvp(ev.id)}
          aria-pressed={ev.registered}
        >
          {ev.registered ? <><CheckCircle2 size={15} /> RSVP'd — Cancel</> : <><Calendar size={15} /> RSVP for Event</>}
        </button>
      </div>
    </div>
  );
}

function CreateEventModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ title:'', date:'', time:'', location:'', category:'Department', capacity:'', description:'' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.title && form.date && form.time && form.location && form.capacity;
  return (
    <div className="fe-modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fe-modal" role="dialog" aria-modal="true">
        <h3><Plus size={17} color="#818cf8" /> Create Campus Event</h3>
        <form onSubmit={e => { e.preventDefault(); if (valid) onSubmit(form); }}>
          <div className="fe-field">
            <label>Event Title *</label>
            <input type="text" placeholder="e.g. Guest Lecture on AI" value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>
          <div className="fe-field-row">
            <div className="fe-field"><label>Date *</label><input type="date" value={form.date} onChange={e => set('date', e.target.value)} required /></div>
            <div className="fe-field"><label>Time *</label><input type="time" value={form.time} onChange={e => set('time', e.target.value)} required /></div>
          </div>
          <div className="fe-field">
            <label>Location *</label>
            <input type="text" placeholder="e.g. CS Seminar Hall" value={form.location} onChange={e => set('location', e.target.value)} required />
          </div>
          <div className="fe-field-row">
            <div className="fe-field">
              <label>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {Object.keys(CAT_COLOR).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="fe-field">
              <label>Capacity *</label>
              <input type="number" placeholder="e.g. 60" min="1" value={form.capacity} onChange={e => set('capacity', e.target.value)} required />
            </div>
          </div>
          <div className="fe-field">
            <label>Description</label>
            <textarea placeholder="Briefly describe the event…" value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="fe-modal-footer">
            <button type="button" className="fe-btn fe-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="fe-btn fe-btn--primary" disabled={!valid}><Plus size={15} /> Create Event</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FacultyEvents() {
  const { notify } = useToast();
  const [tab,        setTab]        = useState('all');
  const [search,     setSearch]     = useState('');
  const [cat,        setCat]        = useState('All Events');
  const [showCreate, setShowCreate] = useState(false);
  const [events,     setEvents]     = useState(() =>
    initialEvents.map((e, i) => ({ ...e, registered: i === 0 || i === 3, isOwn: false }))
  );

  function toggleRsvp(id) {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    const next = !ev.registered;
    notify(next ? `RSVP'd for "${ev.title}" ✅` : `Cancelled RSVP for "${ev.title}"`, next ? 'success' : 'info');
    setEvents(prev => prev.map(e => e.id === id ? { ...e, registered: next } : e));
  }

  function handleCreate(form) {
    const newEvent = {
      id: Date.now(),
      title:       form.title,
      date:        new Date(form.date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }),
      time:        form.time,
      location:    form.location,
      category:    form.category,
      capacity:    Number(form.capacity),
      seats:       0,
      image:       EMOJIS[form.category] || '📅',
      organizer:   'Dr. Priya Raman',
      registered:  true,
      isOwn:       true,
      description: form.description,
    };
    setEvents(prev => [newEvent, ...prev]);
    setShowCreate(false);
    notify(`Event "${form.title}" created! 🎉`, 'success');
  }

  const allCatPills = ['All Events', ...Object.keys(CAT_COLOR)];
  const filtered = useMemo(() => events.filter(e => {
    const inTab   = tab === 'all' || (tab === 'mine' && (e.registered || e.isOwn));
    const inCat   = cat === 'All Events' || e.category === cat;
    const q       = search.toLowerCase();
    const inSearch = !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q) || e.organizer.toLowerCase().includes(q);
    return inTab && inCat && inSearch;
  }), [events, tab, cat, search]);

  const rsvpCount = events.filter(e => e.registered).length;
  const ownCount  = events.filter(e => e.isOwn).length;

  return (
    <>
      <style>{css}</style>
      <div className="fe">
        <Link to="/faculty/dashboard" className="fe-back"><ChevronLeft size={15} /> Back to Dashboard</Link>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:22 }}>
          <div><h1>Campus Events</h1><p className="fe-sub">Browse, RSVP and create events for the campus community</p></div>
          <button className="fe-btn fe-btn--primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Create Event</button>
        </div>

        <div className="fe-stats">
          <div className="fe-stat">
            <div className="fe-stat-icon" style={{ background:'rgba(99,102,241,.18)' }}><Calendar size={18} color="#818cf8" /></div>
            <div><div className="fe-stat-val">{events.length}</div><div className="fe-stat-lbl">Total Events</div></div>
          </div>
          <div className="fe-stat">
            <div className="fe-stat-icon" style={{ background:'rgba(52,211,153,.15)' }}><CheckCircle2 size={18} color="#34d399" /></div>
            <div><div className="fe-stat-val">{rsvpCount}</div><div className="fe-stat-lbl">RSVP'd</div></div>
          </div>
          <div className="fe-stat">
            <div className="fe-stat-icon" style={{ background:'rgba(34,211,238,.15)' }}><BookOpen size={18} color="#22d3ee" /></div>
            <div><div className="fe-stat-val">{ownCount}</div><div className="fe-stat-lbl">Hosting</div></div>
          </div>
        </div>

        <div className="fe-tabs">
          <button className={`fe-tab${tab==='all'?' fe-tab--active':''}`} onClick={() => setTab('all')}>
            <Calendar size={14} /> All Events <span style={{ fontSize:'.72rem', color:'#7880a8', fontWeight:400 }}>({events.length})</span>
          </button>
          <button className={`fe-tab${tab==='mine'?' fe-tab--active':''}`} onClick={() => setTab('mine')}>
            <CheckCircle2 size={14} /> My Events <span style={{ fontSize:'.72rem', color:'#7880a8', fontWeight:400 }}>({rsvpCount})</span>
          </button>
        </div>

        <div className="fe-bar">
          <div className="fe-search">
            <Search size={14} color="#7880a8" />
            <input type="search" placeholder="Search events, locations, organizers…" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search events" />
          </div>
          {allCatPills.map(c => (
            <button key={c} className={`fe-pill${cat===c?' fe-pill--active':''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="fe-grid">
            {filtered.map(ev => <EventCard key={ev.id} ev={ev} onToggleRsvp={toggleRsvp} />)}
          </div>
        ) : (
          <div className="fe-empty">
            <Calendar size={44} color="rgba(255,255,255,.1)" />
            <p>{tab==='mine' ? "You haven't RSVP'd to any events yet." : search ? `No events match "${search}".` : 'No events in this category.'}</p>
            {tab === 'mine' && <button className="fe-btn fe-btn--primary" style={{ margin:'16px auto 0', display:'inline-flex' }} onClick={() => setTab('all')}>Browse All Events</button>}
          </div>
        )}

        {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} onSubmit={handleCreate} />}
      </div>
    </>
  );
}
