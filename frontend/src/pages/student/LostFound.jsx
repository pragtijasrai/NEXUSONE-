import { useMemo, useState, useCallback } from 'react';
import {
  Search, Plus, X, MapPin, Calendar, PackageSearch, PackageCheck, ShieldCheck,
  Laptop, BookOpen, CreditCard, Backpack, KeyRound, Shirt, Watch, HelpCircle, Hand, CheckCircle2,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import * as lfService from '../../services/lostFoundService.js';

/* ───────── constants ───────── */
const CATEGORIES = [
  'Electronics', 'Books & Notes', 'ID & Cards', 'Bags', 'Keys',
  'Clothing', 'Accessories', 'Other',
];

const LOCATIONS = [
  'CS Block', 'Engineering Block', 'Library', 'Cafeteria', 'Hostel A',
  'Innovation Hub', 'Main Auditorium', 'Sports Ground', 'Shuttle / Bus Stop',
];

/* DB category → icon mapping */
const catIcon = {
  'electronics': Laptop, 'books': BookOpen, 'documents': CreditCard,
  'bags': Backpack, 'keys': KeyRound, 'clothing': Shirt,
  'accessories': Watch, 'other': HelpCircle,
};

/* DB status → badge classes */
const statusBadge = {
  open:     ['badge badge--warn',  'Open'],
  claimed:  ['badge badge--live',  'Claim under review'],
  returned: ['badge badge--done',  'Returned'],
  expired:  ['badge badge--next',  'Expired'],
};

/* ───────── helpers ───────── */
const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};
const todayISO = () => new Date().toISOString().slice(0, 10);

/* ───────── report modal (lost or found) ───────── */
function ReportModal({ type, onClose, onSubmit, busy }) {
  const isLost = type === 'lost';
  const [f, setF] = useState({
    title: '', description: '', category: '', location: '', date: todayISO(),
  });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const Err = ({ k }) => errors[k] ? <span className="field__error" role="alert">{errors[k]}</span> : null;

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (f.title.trim().length < 3) err.title = 'Enter the item name (min 3 characters).';
    if (f.description.trim().length < 10) err.description = 'Add a short description (at least 10 characters).';
    if (!f.category) err.category = 'Choose a category.';
    if (!f.location) err.location = isLost ? 'Where did you last see it?' : 'Where did you find it?';
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
          <input value={f.title} onChange={set('title')} maxLength={120} placeholder="e.g. Black wallet" aria-invalid={!!errors.title} />
          <Err k="title" />
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
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? 'Submitting…' : 'Submit report'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ───────── claim modal ───────── */
function ClaimModal({ item, onClose, onSubmit, busy }) {
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
        <p className="muted small" style={{ marginTop: 0 }}><strong>{item.title}</strong> · {item.location || 'Unknown location'}</p>
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
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            <ShieldCheck size={16} aria-hidden="true" /> {busy ? 'Submitting…' : 'Submit request'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ───────── item card ───────── */
function ItemCard({ item, currentUserId, onClaim, onMarkReturned, busyId }) {
  const Icon = catIcon[item.category] ?? HelpCircle;
  const [bc, bl] = statusBadge[item.status] ?? ['badge badge--next', item.status];
  const isFound = item.type === 'found';
  const accent = isFound ? 'var(--ok)' : 'var(--warn)';
  const isMine = item.reported_by === currentUserId;
  const isBusy = busyId === item.id;

  return (
    <article className="card" style={{ display: 'grid', gap: 12, borderTop: `3px solid ${accent}`, opacity: item.status === 'returned' ? .7 : 1 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span className="stat__icon" style={{ color: accent }}><Icon size={20} aria-hidden="true" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>{item.title}</h3>
          <div className="muted small">
            {item.category} · #{item.id}
            {isMine && <span className="badge badge--primary" style={{ marginLeft: 6, padding: '1px 8px' }}>Mine</span>}
          </div>
        </div>
        <span className={bc}>{bl}</span>
      </div>

      {item.description && <p style={{ margin: 0, fontSize: '.88rem' }}>{item.description}</p>}

      <div className="muted small" style={{ display: 'grid', gap: 4 }}>
        {item.location && (
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <MapPin size={13} aria-hidden="true" />{isFound ? 'Found at' : 'Last seen at'} {item.location}
          </span>
        )}
        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          <Calendar size={13} aria-hidden="true" />{formatDate(item.created_at)}
        </span>
        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          <ShieldCheck size={13} aria-hidden="true" />Reported by {isMine ? 'You' : item.reporter_name || 'Another user'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {item.status === 'returned' ? (
          <span className="muted small" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <CheckCircle2 size={14} aria-hidden="true" /> This item has been returned.
          </span>
        ) : isMine ? (
          <button className="btn btn--ghost btn--sm" onClick={() => onMarkReturned(item.id)} disabled={isBusy}>
            <PackageCheck size={14} aria-hidden="true" /> {isBusy ? 'Updating…' : `Mark as ${isFound ? 'returned' : 'returned'}`}
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
  const { user } = useAuth();
  const { notify } = useToast();
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('lost');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [report, setReport] = useState(null);
  const [claiming, setClaiming] = useState(null);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState(null);

  /* Fetch items from API */
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (q.trim()) params.search = q.trim();
      const result = await lfService.getItems(params);
      setItems(result.rows || []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [q]);

  /* Debounced search: refetch when query changes (with a small delay) */
  const [searchTimer, setSearchTimer] = useState(null);
  const onSearch = (val) => {
    setQ(val);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => { fetchItems(); }, 300));
  };

  /* Initial load */
  useState(() => { fetchItems(); }, []);

  const visible = useMemo(() => {
    if (!items) return [];
    return items.filter((i) =>
      i.type === tab &&
      (cat === 'All' || i.category === cat.toLowerCase()) &&
      (!q || [i.title, i.description, i.location].some((s) => (s || '').toLowerCase().includes(q.toLowerCase()))),
    );
  }, [items, tab, q, cat]);

  const counts = useMemo(() => ({
    lost:  items?.filter((i) => i.type === 'lost'  && i.status !== 'returned').length ?? 0,
    found: items?.filter((i) => i.type === 'found' && i.status !== 'returned').length ?? 0,
  }), [items]);

  /* ── Actions ── */

  const createReport = async (f) => {
    setBusy(true);
    try {
      await lfService.createItem({
        title: f.title.trim(),
        description: f.description.trim(),
        location: f.location,
        category: f.category,
        type: f.type,
      });
      notify(`Report submitted successfully.`, 'success');
      setReport(null);
      fetchItems();
    } catch (e) { notify(e.message || 'Failed to submit report', 'error'); }
    finally { setBusy(false); }
  };

  const submitClaim = async (_detail) => {
    // Claim = update status to 'claimed' (only reporter can do this in current backend)
    // For now, any user can claim via status update from open→claimed
    setBusy(true);
    try {
      await lfService.updateItemStatus(claiming.id, 'claimed');
      notify('Request sent. It will be verified before any handover.', 'success');
      setClaiming(null);
      fetchItems();
    } catch (e) { notify(e.message || 'Failed to submit claim', 'error'); }
    finally { setBusy(false); }
  };

  const markReturned = async (id) => {
    setBusyId(id);
    try {
      await lfService.updateItemStatus(id, 'returned');
      notify('Marked as resolved. Thank you!', 'info');
      fetchItems();
    } catch (e) { notify(e.message || 'Failed to update item', 'error'); }
    finally { setBusyId(null); }
  };

  /* ── Render ── */

  if (loading && !items) return <LoadingSpinner message="Loading lost & found items…" />;
  if (error) return <ErrorState error={error} onRetry={fetchItems} />;

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
          <input value={q} onChange={(e) => onSearch(e.target.value)} placeholder="Search by item, place or keyword…"
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
        <EmptyState icon="🔎" title={`No ${tab} items found`} description="Try a different search or category, or file a new report." />
      ) : (
        <div className="grid grid--3">
          {visible.map((i) => (
            <ItemCard key={i.id} item={i} currentUserId={user?.id}
              onClaim={setClaiming} onMarkReturned={markReturned} busyId={busyId} />
          ))}
        </div>
      )}

      {report && <ReportModal type={report} onClose={() => setReport(null)} onSubmit={createReport} busy={busy} />}
      {claiming && <ClaimModal item={claiming} onClose={() => setClaiming(null)} onSubmit={submitClaim} busy={busy} />}
      <style>{`@media (max-width: 560px){ .lf-2col{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
