import { useMemo, useState } from 'react';
import {
  Search, Plus, X, MapPin, Calendar, PackageSearch, PackageCheck, ShieldCheck,
  Laptop, BookOpen, CreditCard, Backpack, KeyRound, Shirt, Watch, HelpCircle, Hand, CheckCircle2,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import {
  CATEGORIES, LOCATIONS, CONTACT_OPTIONS, initialItems,
} from '../../data/mockLostFound.js';

/* ───────── helpers ───────── */
const catIcon = {
  'Electronics': Laptop, 'Books & Notes': BookOpen, 'ID & Cards': CreditCard,
  'Bags': Backpack, 'Keys': KeyRound, 'Clothing': Shirt,
  'Accessories': Watch, 'Other': HelpCircle,
};
const statusBadge = {
  open:     ['badge badge--warn',    'Open'],
  claimed:  ['badge badge--live',    'Claim under review'],
  returned: ['badge badge--done',    'Returned'],
};
const todayStr = () =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
const todayISO = () => new Date().toISOString().slice(0, 10);
const isoToStr = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

/* ───────── report modal (lost or found) ───────── */
function ReportModal({ type, onClose, onSubmit }) {
  const isLost = type === 'lost';
  const [f, setF] = useState({
    name: '', description: '', category: '', location: '',
    date: todayISO(), contact: CONTACT_OPTIONS[0], photo: null,
  });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const Err = ({ k }) => errors[k] ? <span className="field__error" role="alert">{errors[k]}</span> : null;

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (f.name.trim().length < 3) err.name = 'Enter the item name.';
    if (f.description.trim().length < 10) err.description = 'Add a short description (at least 10 characters).';
    if (!f.category) err.category = 'Choose a category.';
    if (!f.location) err.location = isLost ? 'Where did you last see it?' : 'Where did you find it?';
    if (!f.date) err.date = 'Choose a date.';
    else if (f.date > todayISO()) err.date = 'Date cannot be in the future.';
    setErrors(err);
    if (Object.keys(err).length === 0) onSubmit({ ...f, type });
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="lf-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,12,26,.55)', display: 'grid', placeItems: 'center', zIndex: 60, padding: 16, overflowY: 'auto' }}>
      <form className="card" onSubmit={submit} noValidate style={{ width: 'min(560px, 100%)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="section-header">
          <h2 id="lf-modal-title" style={{ fontSize: '1.2rem' }}>{isLost ? 'Report a lost item' : 'Report a found item'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <label className="field">Item name
          <input value={f.name} onChange={set('name')} maxLength={60} placeholder="e.g. Black wallet" aria-invalid={!!errors.name} />
          <Err k="name" />
        </label>

        <label className="field">Description
          <textarea value={f.description} onChange={set('description')} rows={3} maxLength={400}
            placeholder={isLost ? 'Colour, brand, marks, what was inside…' : 'Colour, brand, condition. Keep one identifying detail to yourself so claims can be verified.'}
            style={{ padding: '10px 14px', minHeight: 84, resize: 'vertical' }} aria-invalid={!!errors.description} />
          <Err k="description" />
        </label>

        <div className="lf-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px', alignItems: 'start' }}>
          <label className="field">Category
            <select value={f.category} onChange={set('category')} aria-invalid={!!errors.category}>
              <option value="">Select…</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <Err k="category" />
          </label>
          <label className="field">{isLost ? 'Last seen location' : 'Found location'}
            <select value={f.location} onChange={set('location')} aria-invalid={!!errors.location}>
              <option value="">Select…</option>
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
            <Err k="location" />
          </label>
          <label className="field">Date
            <input type="date" value={f.date} max={todayISO()} onChange={set('date')} aria-invalid={!!errors.date} />
            <Err k="date" />
          </label>
          <label className="field">Contact preference
            <select value={f.contact} onChange={set('contact')}>
              {CONTACT_OPTIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <label className="field">Photo (optional)
          <input type="file" accept="image/png,image/jpeg" style={{ padding: '8px 14px' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && file.size > 2 * 1024 * 1024) { setErrors((p) => ({ ...p, photo: 'Photo must be under 2 MB.' })); e.target.value = ''; return; }
              setErrors((p) => ({ ...p, photo: undefined }));
              setF((p) => ({ ...p, photo: file ?? null }));
            }} />
          <span className="field__hint">PNG or JPG, up to 2 MB. Your phone number and student ID are never shown publicly.</span>
          <Err k="photo" />
        </label>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--primary">Submit report</button>
        </div>
      </form>
    </div>
  );
}

/* ───────── claim modal ───────── */
function ClaimModal({ item, onClose, onSubmit }) {
  const [detail, setDetail] = useState('');
  const [error, setError] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (detail.trim().length < 10) { setError('Describe something only the owner would know (at least 10 characters).'); return; }
    onSubmit(detail.trim());
  };
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="claim-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,12,26,.55)', display: 'grid', placeItems: 'center', zIndex: 60, padding: 16 }}>
      <form className="card" onSubmit={submit} noValidate style={{ width: 'min(480px, 100%)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="section-header">
          <h2 id="claim-title" style={{ fontSize: '1.2rem' }}>{item.type === 'found' ? 'Claim this item' : 'I found this item'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <p className="muted small" style={{ marginTop: 0 }}><strong>{item.name}</strong> · {item.location}</p>
        <label className="field">
          {item.type === 'found' ? 'Proof of ownership' : 'Where and when did you find it?'}
          <textarea value={detail} onChange={(e) => { setDetail(e.target.value); setError(''); }} rows={3} maxLength={300}
            placeholder={item.type === 'found' ? 'A mark, content, or detail that is not in the public listing' : 'Describe where you found it and any detail you can confirm'}
            style={{ padding: '10px 14px', minHeight: 84, resize: 'vertical' }} aria-invalid={!!error} />
          {error && <span className="field__error" role="alert">{error}</span>}
        </label>
        <p className="field__hint" style={{ marginTop: -6 }}>
          The reporter or campus staff will verify this before anything is handed over.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--primary"><ShieldCheck size={16} aria-hidden="true" /> Submit request</button>
        </div>
      </form>
    </div>
  );
}

/* ───────── item card ───────── */
function ItemCard({ item, onClaim, onReturn }) {
  const Icon = catIcon[item.category] ?? HelpCircle;
  const [bc, bl] = statusBadge[item.status];
  const isFound = item.type === 'found';
  const accent = isFound ? 'var(--ok)' : 'var(--warn)';
  return (
    <article className="card" style={{ display: 'grid', gap: 12, borderTop: `3px solid ${accent}`, opacity: item.status === 'returned' ? .7 : 1 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span className="stat__icon" style={{ color: accent }}><Icon size={20} aria-hidden="true" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>{item.name}</h3>
          <div className="muted small">{item.category} · {item.id}</div>
        </div>
        <span className={bc}>{bl}</span>
      </div>
      <p style={{ margin: 0, fontSize: '.88rem' }}>{item.description}</p>
      <div className="muted small" style={{ display: 'grid', gap: 4 }}>
        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><MapPin size={13} aria-hidden="true" />{isFound ? 'Found at' : 'Last seen at'} {item.location}</span>
        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Calendar size={13} aria-hidden="true" />{item.date}</span>
        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><ShieldCheck size={13} aria-hidden="true" />Contact: {item.contact}</span>
      </div>

      {item.mine && item.claims.length > 0 && (
        <div style={{ padding: 10, borderRadius: 'var(--r)', background: 'var(--info-bg)', color: 'var(--info)', fontSize: '.82rem' }}>
          <strong>{item.claims.length} request{item.claims.length > 1 ? 's' : ''} received.</strong> Staff will verify before handover.
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {item.status === 'returned' ? (
          <span className="muted small" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <CheckCircle2 size={14} aria-hidden="true" /> This item has been returned.
          </span>
        ) : item.mine ? (
          <button className="btn btn--ghost btn--sm" onClick={() => onReturn(item.id)}>
            <PackageCheck size={14} aria-hidden="true" /> Mark as {isFound ? 'returned' : 'found'}
          </button>
        ) : item.status === 'open' ? (
          <button className="btn btn--primary btn--sm" onClick={() => onClaim(item)}>
            <Hand size={14} aria-hidden="true" /> {isFound ? 'This is mine' : 'I found this'}
          </button>
        ) : (
          <span className="muted small">A request is already being reviewed.</span>
        )}
      </div>
    </article>
  );
}

/* ───────── page ───────── */
export default function LostFound() {
  const { notify } = useToast();
  const [items, setItems] = useState(initialItems);
  const [tab, setTab] = useState('lost');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [report, setReport] = useState(null);   // 'lost' | 'found' | null
  const [claiming, setClaiming] = useState(null);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((i) =>
      i.type === tab &&
      (cat === 'All' || i.category === cat) &&
      (!term || [i.name, i.description, i.location, i.category].some((s) => s.toLowerCase().includes(term))),
    );
  }, [items, tab, q, cat]);

  const counts = {
    lost: items.filter((i) => i.type === 'lost' && i.status !== 'returned').length,
    found: items.filter((i) => i.type === 'found' && i.status !== 'returned').length,
  };

  const createReport = (f) => {
    const id = `LF-${302 + items.length - initialItems.length}`;
    setItems((p) => [{
      id, type: f.type, name: f.name.trim(), category: f.category, description: f.description.trim(),
      location: f.location, date: isoToStr(f.date), contact: f.contact,
      status: 'open', mine: true, claims: [], hasPhoto: !!f.photo,
    }, ...p]);
    setReport(null); setTab(f.type); setCat('All'); setQ('');
    notify(`Report ${id} submitted.`, 'success');
  };

  const submitClaim = (detail) => {
    setItems((p) => p.map((i) => i.id === claiming.id
      ? { ...i, status: 'claimed', claims: [...i.claims, { id: i.claims.length + 1, by: 'You', detail, status: 'pending', date: todayStr() }] }
      : i));
    setClaiming(null);
    notify('Request sent. It will be verified before any handover.', 'success');
  };

  const markReturned = (id) => {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, status: 'returned' } : i)));
    notify('Marked as resolved. Thank you!', 'info');
  };

  return (
    <div className="stack">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Lost &amp; Found</h1>
          <p className="muted">Report missing items and find things picked up around campus.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn--ghost" onClick={() => setReport('found')}><PackageCheck size={16} aria-hidden="true" /> Report Found Item</button>
          <button className="btn btn--primary" onClick={() => setReport('lost')}><Plus size={16} aria-hidden="true" /> Report Lost Item</button>
        </div>
      </header>

      <div className="tabs" role="tablist" style={{ marginBottom: 0 }}>
        {[['lost', 'Lost Items', PackageSearch], ['found', 'Found Items', PackageCheck]].map(([k, label, Icon]) => (
          <button key={k} role="tab" aria-selected={tab === k}
            className={`tab ${tab === k ? 'tab--active' : ''}`} onClick={() => setTab(k)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Icon size={16} aria-hidden="true" /> {label}
            <span className="badge badge--primary" style={{ padding: '1px 8px' }}>{counts[k]}</span>
          </button>
        ))}
      </div>

      {/* Search + category filter */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: 14, top: 13, color: 'var(--muted)' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by item, place or keyword…"
            aria-label="Search items"
            style={{ width: '100%', minHeight: 42, padding: '0 14px 0 38px', border: '1.5px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--surface)', color: 'var(--text)', font: 'inherit' }} />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category"
          style={{ minHeight: 42, padding: '0 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--surface)', color: 'var(--text)', font: 'inherit' }}>
          <option>All</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '2rem' }}>🔎</div>
          <h3 style={{ margin: '8px 0 4px' }}>No {tab} items found</h3>
          <p className="muted small" style={{ margin: 0 }}>Try a different search or category, or file a new report.</p>
        </div>
      ) : (
        <div className="grid grid--3">
          {visible.map((i) => <ItemCard key={i.id} item={i} onClaim={setClaiming} onReturn={markReturned} />)}
        </div>
      )}

      {report && <ReportModal type={report} onClose={() => setReport(null)} onSubmit={createReport} />}
      {claiming && <ClaimModal item={claiming} onClose={() => setClaiming(null)} onSubmit={submitClaim} />}
      <style>{`@media (max-width: 560px){ .lf-2col{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}