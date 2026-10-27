import { useMemo, useState } from 'react';
import {
  Search, Paperclip, CheckCheck, AlertTriangle, GraduationCap, FileText,
  CalendarDays, Bus, Building2, ChevronDown, User, Calendar, Megaphone,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { CATEGORIES, initialAnnouncements } from '../../data/mockAnnouncements.js';

/* ───────── helpers ───────── */
const catIcon = {
  'Academic': GraduationCap, 'Examination': FileText, 'Events': CalendarDays,
  'Campus Notices': Building2, 'Transport': Bus, 'Emergency': AlertTriangle,
};
const catColor = {
  'Academic': '#4338ca', 'Examination': '#8b5cf6', 'Events': '#ec4899',
  'Campus Notices': '#0ea5e9', 'Transport': '#10b981', 'Emergency': '#dc2626',
};
const prioBadge = {
  Normal: null,
  Important: ['badge badge--warn', 'Important'],
  Urgent: ['badge badge--urgent', 'Urgent'],
};
const READ_FILTERS = ['All', 'Unread'];

/* ───────── page ───────── */
export default function Announcements() {
  const { notify } = useToast();
  const [items, setItems] = useState(initialAnnouncements);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [readFilter, setReadFilter] = useState('All');
  const [openId, setOpenId] = useState(null);

  const unreadCount = items.filter((a) => a.unread).length;

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((a) =>
      (cat === 'All' || a.category === cat) &&
      (readFilter === 'All' || a.unread) &&
      (!term || [a.title, a.message, a.author, a.category].some((s) => s.toLowerCase().includes(term))),
    );
  }, [items, q, cat, readFilter]);

  const toggleOpen = (id) => {
    const closing = openId === id;
    setOpenId(closing ? null : id);
    if (!closing) {
      // opening an announcement marks it as read
      setItems((p) => p.map((a) => (a.id === id ? { ...a, unread: false } : a)));
    }
  };

  const markAllRead = () => {
    if (unreadCount === 0) return;
    setItems((p) => p.map((a) => ({ ...a, unread: false })));
    notify('All announcements marked as read.', 'info');
  };

  return (
    <div className="stack">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Announcements</h1>
          <p className="muted">
            Campus and academic updates in one place.{' '}
            {unreadCount > 0 ? <strong>{unreadCount} unread</strong> : 'You are all caught up.'}
          </p>
        </div>
        <button className="btn btn--ghost" onClick={markAllRead} disabled={unreadCount === 0}>
          <CheckCheck size={16} aria-hidden="true" /> Mark all as read
        </button>
      </header>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: 14, top: 13, color: 'var(--muted)' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search announcements"
            placeholder="Search by title, author or keyword…"
            style={{ width: '100%', minHeight: 42, padding: '0 14px 0 38px', border: '1.5px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--surface)', color: 'var(--text)', font: 'inherit' }} />
        </div>
        <div role="group" aria-label="Read status" style={{ display: 'flex', gap: 6 }}>
          {READ_FILTERS.map((f) => (
            <button key={f} aria-pressed={readFilter === f} onClick={() => setReadFilter(f)}
              className={`btn btn--sm ${readFilter === f ? 'btn--primary' : 'btn--ghost'}`} style={{ minHeight: 42 }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Category chips */}
      <div role="group" aria-label="Filter by category" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
              }}>
              {c}
            </button>
          );
        })}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '2rem' }}>📭</div>
          <h3 style={{ margin: '8px 0 4px' }}>No announcements found</h3>
          <p className="muted small" style={{ margin: 0 }}>Try a different search or filter.</p>
        </div>
      ) : (
        <div className="stack">
          {visible.map((a) => {
            const Icon = catIcon[a.category] ?? Megaphone;
            const color = catColor[a.category] ?? 'var(--primary)';
            const open = openId === a.id;
            const pb = prioBadge[a.priority];
            return (
              <article key={a.id} className="card"
                style={{ padding: 0, overflow: 'hidden', borderLeft: `4px solid ${a.priority === 'Urgent' ? 'var(--danger)' : color}` }}>
                <button onClick={() => toggleOpen(a.id)} aria-expanded={open}
                  style={{ all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer', display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 14, alignItems: 'center', padding: '16px 20px' }}>
                  <span className="stat__icon" style={{ background: `${color}1a`, color }}><Icon size={20} aria-hidden="true" /></span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {a.unread && <span aria-label="Unread" title="Unread" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />}
                      <span style={{ fontWeight: a.unread ? 700 : 500 }}>{a.title}</span>
                    </div>
                    <div className="muted small" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 2 }}>
                      <span style={{ color, fontWeight: 600 }}>{a.category}</span>
                      <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}><User size={12} aria-hidden="true" />{a.author}</span>
                      <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}><Calendar size={12} aria-hidden="true" />{a.date}</span>
                      {a.attachments.length > 0 && (
                        <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}><Paperclip size={12} aria-hidden="true" />{a.attachments.length}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {pb && <span className={pb[0]}>{pb[1]}</span>}
                    <ChevronDown size={18} aria-hidden="true"
                      style={{ color: 'var(--muted)', transition: 'transform var(--t)', transform: open ? 'rotate(180deg)' : 'none' }} />
                  </div>
                </button>

                {open && (
                  <div style={{ padding: '4px 20px 20px 78px', borderTop: '1px solid var(--border)', background: 'var(--surface2)' }}>
                    <p style={{ whiteSpace: 'pre-line', margin: '16px 0 0', fontSize: '.92rem', lineHeight: 1.6 }}>{a.message}</p>
                    {a.attachments.length > 0 && (
                      <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {a.attachments.map((f) => (
                          <button key={f.name} className="btn btn--ghost btn--sm"
                            onClick={() => notify('Downloads work once the backend is connected.', 'info')}>
                            <Paperclip size={14} aria-hidden="true" /> {f.name} <span className="muted">({f.size})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
      <style>{`@media (max-width: 560px){ article > div[style*="padding: 4px 20px 20px 78px"]{ padding-left: 20px !important; } }`}</style>
    </div>
  );
}