import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCheck, Megaphone, DoorOpen, FileText, CalendarDays, Wrench, Bus,
  Trash2, ArrowRight,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import {
  CATEGORIES, CATEGORY_ROUTES, initialNotifications,
} from '../../data/mockNotifications.js';

/* ───────── helpers ───────── */
const catIcon = {
  Announcements: Megaphone, Bookings: DoorOpen, Assignments: FileText,
  Events: CalendarDays, Maintenance: Wrench, Transport: Bus,
};
const catColor = {
  Announcements: '#dc2626', Bookings: '#4338ca', Assignments: '#f59e0b',
  Events: '#ec4899', Maintenance: '#0ea5e9', Transport: '#10b981',
};

function timeAgo(mins) {
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'Yesterday' : `${d} days ago`;
}

/* ───────── page ───────── */
export default function Notifications() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [items, setItems] = useState(initialNotifications);
  const [cat, setCat] = useState('All');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const unreadCount = items.filter((n) => n.unread).length;

  const visible = useMemo(
    () => items.filter((n) => (cat === 'All' || n.category === cat) && (!unreadOnly || n.unread)),
    [items, cat, unreadOnly],
  );

  // group into Today (< 24h) and Earlier
  const today = visible.filter((n) => n.ago < 1440);
  const earlier = visible.filter((n) => n.ago >= 1440);

  const open = (n) => {
    setItems((p) => p.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));
    navigate(CATEGORY_ROUTES[n.category]);
  };

  const toggleRead = (id) =>
    setItems((p) => p.map((x) => (x.id === id ? { ...x, unread: !x.unread } : x)));

  const markAll = () => {
    if (!unreadCount) return;
    setItems((p) => p.map((x) => ({ ...x, unread: false })));
    notify('All notifications marked as read.', 'info');
  };

  const clearRead = () => {
    const n = items.filter((x) => !x.unread).length;
    if (!n) return;
    setItems((p) => p.filter((x) => x.unread));
    notify(`Cleared ${n} read notification${n > 1 ? 's' : ''}.`, 'info');
  };

  const renderGroup = (label, list) => list.length > 0 && (
    <section key={label} aria-label={label}>
      <h2 style={{ fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)', margin: '0 0 8px' }}>{label}</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {list.map((n, i) => {
          const Icon = catIcon[n.category] ?? Bell;
          const color = catColor[n.category] ?? 'var(--primary)';
          return (
            <div key={n.id}
              style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', borderTop: i ? '1px solid var(--border)' : 0, background: n.unread ? 'rgba(99,102,241,.06)' : 'transparent' }}>
              <button onClick={() => open(n)} aria-label={`${n.title}. Open ${n.category}`}
                style={{ all: 'unset', boxSizing: 'border-box', cursor: 'pointer', display: 'grid', gridTemplateColumns: '44px 1fr', gap: 14, alignItems: 'center', padding: '14px 16px 14px 20px', minWidth: 0 }}>
                <span className="stat__icon" style={{ background: `${color}1a`, color }}><Icon size={20} aria-hidden="true" /></span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {n.unread && <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />}
                    <span style={{ fontWeight: n.unread ? 700 : 500 }}>{n.title}</span>
                  </div>
                  <div className="muted small" style={{ marginTop: 2 }}>{n.message}</div>
                  <div className="muted" style={{ fontSize: '.72rem', marginTop: 4, display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ color, fontWeight: 600 }}>{n.category}</span>
                    <span>{timeAgo(n.ago)}</span>
                    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>Open <ArrowRight size={11} aria-hidden="true" /></span>
                  </div>
                </div>
              </button>
              <button className="btn btn--ghost btn--sm" style={{ margin: '0 16px' }} onClick={() => toggleRead(n.id)}>
                {n.unread ? 'Mark read' : 'Mark unread'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="stack">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Notifications</h1>
          <p className="muted">
            Updates that need your attention.{' '}
            {unreadCount > 0 ? <strong>{unreadCount} unread</strong> : 'You are all caught up.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn--ghost" onClick={clearRead} disabled={items.every((n) => n.unread)}>
            <Trash2 size={16} aria-hidden="true" /> Clear read
          </button>
          <button className="btn btn--primary" onClick={markAll} disabled={unreadCount === 0}>
            <CheckCheck size={16} aria-hidden="true" /> Mark all as read
          </button>
        </div>
      </header>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div role="group" aria-label="Filter by category" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          {['All', ...CATEGORIES].map((c) => {
            const active = cat === c;
            const color = catColor[c] ?? 'var(--primary)';
            return (
              <button key={c} aria-pressed={active} onClick={() => setCat(c)}
                style={{
                  font: 'inherit', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer',
                  padding: '6px 14px', borderRadius: 99,
                  border: `1.5px solid ${active ? color : 'var(--border)'}`,
                  background: active ? color : 'var(--surface)',
                  color: active ? '#fff' : 'var(--text2)',
                }}>{c}</button>
            );
          })}
        </div>
        <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontSize: '.85rem', fontWeight: 500, cursor: 'pointer' }}>
          <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
          Unread only
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '2rem' }}>🔔</div>
          <h3 style={{ margin: '8px 0 4px' }}>No notifications</h3>
          <p className="muted small" style={{ margin: 0 }}>
            {unreadOnly ? 'No unread notifications in this view.' : 'Nothing here yet. New updates will appear in this list.'}
          </p>
        </div>
      ) : (
        <>
          {renderGroup('Today', today)}
          {renderGroup('Earlier', earlier)}
        </>
      )}

      <style>{`@media (max-width: 560px){ section[aria-label] .card > div{ grid-template-columns: 1fr !important; } section[aria-label] .card > div > .btn{ margin: 0 20px 12px !important; justify-self: start; } }`}</style>
    </div>
  );
}