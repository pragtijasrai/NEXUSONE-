import { useMemo, useState } from 'react';
import {
  Plus, X, MapPin, User, Calendar, Wrench, Zap, Droplets, Armchair,
  MonitorPlay, Wifi, Sparkles, HelpCircle, CheckCircle2, RotateCcw, Camera,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  STATUSES, CATEGORIES, PRIORITIES, BUILDINGS, initialTickets,
} from '../../data/mockMaintenance.js';

/* ───────── helpers ───────── */
const catIcon = {
  'Electrical': Zap, 'Plumbing': Droplets, 'Furniture': Armchair,
  'Projector / Computer': MonitorPlay, 'Internet': Wifi,
  'Cleanliness': Sparkles, 'Other': HelpCircle,
};
const prioBadge = {
  Low: 'badge badge--next', Medium: 'badge badge--primary',
  High: 'badge badge--warn', Urgent: 'badge badge--urgent',
};
const statusBadge = {
  'Open': 'badge badge--warn', 'Assigned': 'badge badge--primary',
  'In Progress': 'badge badge--live', 'Resolved': 'badge badge--done',
  'Closed': 'badge badge--next',
};
const FILTERS = ['All', 'Open', 'In Progress', 'Resolved'];
const matchesFilter = (t, f) =>
  f === 'All' ? true
  : f === 'Open' ? ['Open', 'Assigned'].includes(t.status)
  : f === 'In Progress' ? t.status === 'In Progress'
  : ['Resolved', 'Closed'].includes(t.status);

const today = () =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

const emptyForm = {
  category: '', title: '', description: '', building: '', room: '', priority: 'Medium', photo: null,
};

/* ───────── status tracker ───────── */
function Tracker({ status }) {
  const idx = STATUSES.indexOf(status);
  return (
    <ol aria-label="Ticket progress" style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, gap: 0 }}>
      {STATUSES.map((s, i) => {
        const done = i <= idx;
        return (
          <li key={s} style={{ flex: 1, textAlign: 'center', position: 'relative', fontSize: '.68rem', color: done ? 'var(--primary)' : 'var(--muted)', fontWeight: done ? 700 : 500 }}>
            {i > 0 && (
              <span aria-hidden="true" style={{ position: 'absolute', top: 7, right: '50%', width: '100%', height: 2, background: i <= idx ? 'var(--primary)' : 'var(--border)' }} />
            )}
            <span aria-hidden="true" style={{
              position: 'relative', display: 'block', margin: '0 auto 4px', width: 16, height: 16, borderRadius: '50%',
              background: done ? 'var(--primary)' : 'var(--surface)', border: `2px solid ${done ? 'var(--primary)' : 'var(--border)'}`,
            }} />
            {s}
          </li>
        );
      })}
    </ol>
  );
}

/* ───────── create-ticket modal ───────── */
function TicketModal({ onClose, onSubmit }) {
  const [f, setF] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!f.category) err.category = 'Choose a category.';
    if (f.title.trim().length < 5) err.title = 'Enter a short title (at least 5 characters).';
    if (f.description.trim().length < 10) err.description = 'Describe the problem (at least 10 characters).';
    if (!f.building) err.building = 'Choose a building.';
    if (!f.room.trim()) err.room = 'Enter the room or area.';
    setErrors(err);
    if (Object.keys(err).length === 0) onSubmit(f);
  };

  const Err = ({ k }) => errors[k] ? <span className="field__error" role="alert">{errors[k]}</span> : null;

  return (
    <div
      role="dialog" aria-modal="true" aria-labelledby="new-ticket-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,12,26,.55)', display: 'grid', placeItems: 'center', zIndex: 60, padding: 16, overflowY: 'auto' }}
    >
      <form className="card" onSubmit={submit} noValidate style={{ width: 'min(560px, 100%)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="section-header">
          <h2 id="new-ticket-title" style={{ fontSize: '1.2rem' }}>Report an issue</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px', alignItems: 'start' }} className="form-2col">
          <label className="field">Issue category
            <select value={f.category} onChange={set('category')} aria-invalid={!!errors.category}>
              <option value="">Select…</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <Err k="category" />
          </label>
          <label className="field">Priority
            <select value={f.priority} onChange={set('priority')}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
        </div>

        <label className="field">Issue title
          <input value={f.title} onChange={set('title')} placeholder="e.g. Projector not turning on" aria-invalid={!!errors.title} maxLength={80} />
          <Err k="title" />
        </label>

        <label className="field">Detailed description
          <textarea value={f.description} onChange={set('description')} rows={3} maxLength={500}
            placeholder="What's wrong, and since when?"
            style={{ padding: '10px 14px', minHeight: 84, resize: 'vertical' }} aria-invalid={!!errors.description} />
          <Err k="description" />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px', alignItems: 'start' }} className="form-2col">
          <label className="field">Building
            <select value={f.building} onChange={set('building')} aria-invalid={!!errors.building}>
              <option value="">Select…</option>
              {BUILDINGS.map((b) => <option key={b}>{b}</option>)}
            </select>
            <Err k="building" />
          </label>
          <label className="field">Room / area
            <input value={f.room} onChange={set('room')} placeholder="e.g. CS-110" aria-invalid={!!errors.room} />
            <Err k="room" />
          </label>
        </div>

        <label className="field">Photo (optional)
          <input type="file" accept="image/png,image/jpeg"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && file.size > 2 * 1024 * 1024) { setErrors((p) => ({ ...p, photo: 'Photo must be under 2 MB.' })); e.target.value = ''; return; }
              setErrors((p) => ({ ...p, photo: undefined }));
              setF((p) => ({ ...p, photo: file ?? null }));
            }}
            style={{ padding: '8px 14px' }} />
          <span className="field__hint">PNG or JPG, up to 2 MB. (Stored only when the backend is connected.)</span>
          <Err k="photo" />
        </label>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--primary"><Wrench size={16} aria-hidden="true" /> Submit ticket</button>
        </div>
      </form>
    </div>
  );
}

/* ───────── page ───────── */
export default function Maintenance() {
  const { user } = useAuth();
  const { notify } = useToast();
  const [tickets, setTickets] = useState(initialTickets);
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [openId, setOpenId] = useState(null);

  const counts = useMemo(() => ({
    open: tickets.filter((t) => ['Open', 'Assigned'].includes(t.status)).length,
    progress: tickets.filter((t) => t.status === 'In Progress').length,
    done: tickets.filter((t) => ['Resolved', 'Closed'].includes(t.status)).length,
  }), [tickets]);

  const visible = tickets.filter((t) => matchesFilter(t, filter));

  const create = (f) => {
    const id = `MT-${1043 + tickets.length - initialTickets.length}`;
    const ticket = {
      id, title: f.title.trim(), category: f.category, description: f.description.trim(),
      building: f.building, room: f.room.trim(), priority: f.priority, status: 'Open',
      assignedTo: null, created: today(), resolution: null, hasPhoto: !!f.photo,
    };
    setTickets((p) => [ticket, ...p]);
    setShowForm(false);
    setFilter('All');
    setOpenId(id);
    notify(`Ticket ${id} submitted. An administrator will review it.`, 'success');
  };

  const reopen = (id) => {
    setTickets((p) => p.map((t) => t.id === id ? { ...t, status: 'Open', assignedTo: null, resolution: null } : t));
    notify('Ticket reopened for review.', 'info');
  };

  return (
    <div className="stack">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Maintenance</h1>
          <p className="muted">Report problems on campus and follow their progress, {user.name.split(' ')[0]}.</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowForm(true)}>
          <Plus size={16} aria-hidden="true" /> Create Ticket
        </button>
      </header>

      {/* Summary */}
      <div className="grid grid--3">
        {[
          ['Open / assigned', counts.open, Wrench, 'stat__icon--warn'],
          ['In progress', counts.progress, RotateCcw, ''],
          ['Resolved / closed', counts.done, CheckCircle2, 'stat__icon--ok'],
        ].map(([label, value, Icon, cls]) => (
          <div className="card" key={label}>
            <div className="stat">
              <span className={`stat__icon ${cls}`}><Icon size={20} aria-hidden="true" /></span>
              <div><p className="stat__label">{label}</p><p className="stat__value">{value}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="tabs" role="tablist" style={{ marginBottom: 0 }}>
        {FILTERS.map((f) => (
          <button key={f} role="tab" aria-selected={filter === f}
            className={`tab ${filter === f ? 'tab--active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'Open' ? 'Open / Assigned' : f === 'Resolved' ? 'Resolved / Closed' : f}
          </button>
        ))}
      </div>

      {/* Ticket list */}
      {visible.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '2rem' }}>🛠️</div>
          <h3 style={{ margin: '8px 0 4px' }}>No tickets here</h3>
          <p className="muted small" style={{ margin: 0 }}>Nothing matches this filter. Spotted a problem? Create a ticket.</p>
        </div>
      ) : (
        <div className="stack">
          {visible.map((t) => {
            const Icon = catIcon[t.category] ?? HelpCircle;
            const expanded = openId === t.id;
            return (
              <article key={t.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenId(expanded ? null : t.id)} aria-expanded={expanded}
                  style={{ all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer', display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 14, alignItems: 'center', padding: '16px 20px' }}
                >
                  <span className="stat__icon"><Icon size={20} aria-hidden="true" /></span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{t.title}</div>
                    <div className="muted small" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 2 }}>
                      <span>{t.id}</span>
                      <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}><MapPin size={12} aria-hidden="true" />{t.building}, {t.room}</span>
                      <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}><Calendar size={12} aria-hidden="true" />{t.created}</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: 4, justifyItems: 'end' }}>
                    <span className={statusBadge[t.status]}>{t.status}</span>
                    <span className={prioBadge[t.priority]}>{t.priority}</span>
                  </div>
                </button>

                {expanded && (
                  <div style={{ padding: '4px 20px 20px', borderTop: '1px solid var(--border)', background: 'var(--surface2)' }}>
                    <div style={{ padding: '18px 0 14px' }}><Tracker status={t.status} /></div>
                    <p style={{ margin: '0 0 12px', fontSize: '.9rem' }}>{t.description}</p>
                    <dl className="facts">
                      <div><dt>Category</dt><dd>{t.category}</dd></div>
                      <div><dt>Assigned to</dt>
                        <dd style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                          <User size={14} aria-hidden="true" />{t.assignedTo ?? 'Not assigned yet'}
                        </dd>
                      </div>
                      {t.hasPhoto && <div><dt>Photo</dt><dd style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Camera size={14} aria-hidden="true" />Attached</dd></div>}
                    </dl>
                    {t.resolution && (
                      <div style={{ marginTop: 12, padding: 12, borderRadius: 'var(--r)', background: 'var(--ok-bg)', color: 'var(--ok)', fontSize: '.88rem', display: 'flex', gap: 8 }}>
                        <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                        <span><strong>Resolution: </strong>{t.resolution}</span>
                      </div>
                    )}
                    {t.status === 'Resolved' && (
                      <button className="btn btn--ghost btn--sm" style={{ marginTop: 12 }} onClick={() => reopen(t.id)}>
                        <RotateCcw size={14} aria-hidden="true" /> Issue persists? Reopen
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {showForm && <TicketModal onClose={() => setShowForm(false)} onSubmit={create} />}
      <style>{`@media (max-width: 560px){ .form-2col{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}