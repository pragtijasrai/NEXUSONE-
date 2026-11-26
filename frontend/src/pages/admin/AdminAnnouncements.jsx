/**
 * AdminAnnouncements — /admin/announcements
 * Admin can create, publish/draft, edit, and delete any announcement.
 *
 * APIs used:
 *   GET  /announcements          — list all (admin sees all)
 *   POST /announcements          — create
 *   PATCH /announcements/:id     — update
 *   DELETE /announcements/:id    — delete
 */
import { useState, useCallback } from 'react';
import {
  Plus, Search, Send, FileText, Edit2, Trash2,
  Eye, EyeOff, X, RefreshCw, Users, Calendar,
  Megaphone, AlertTriangle, Filter,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../../services/announcementService.js';
import AdminShell from './AdminShell.jsx';

/* ── constants ─────────────────────────────────────────────────── */
const AUDIENCES = [
  { value: 'all',      label: 'All (everyone)'         },
  { value: 'students', label: 'Students only'           },
  { value: 'faculty',  label: 'Faculty only'            },
];
const CATEGORIES = ['general', 'academic', 'events', 'transport', 'urgent'];
const EMPTY_FORM = {
  title: '', body: '', audience: 'all',
  category: 'general', priority: 'normal',
};

const catColor = {
  academic: '#818cf8', general: '#22d3ee', events: '#34d399',
  transport: '#fbbf24', urgent: '#f87171',
};

/* ── modal ──────────────────────────────────────────────────────── */
function AnnouncementModal({ initial, onClose, onDone, busy }) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState(
    isEdit
      ? { title: initial.title, body: initial.body ?? '', audience: initial.audience, category: initial.category, priority: initial.priority }
      : { ...EMPTY_FORM }
  );
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.title.trim().length >= 3;

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.72)', zIndex:9999, backdropFilter:'blur(4px)', display:'grid', placeItems:'center', padding:16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background:'#131628', border:'1px solid rgba(255,255,255,.1)', borderRadius:16, padding:26, width:'min(560px,100%)', maxHeight:'90vh', overflowY:'auto', animation:'aaIn .2s cubic-bezier(.34,1.1,.64,1)' }}
        role="dialog" aria-modal="true">
        <style>{`@keyframes aaIn{from{opacity:0;transform:scale(.95) translateY(10px)}}`}</style>

        {/* header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <h3 style={{ margin:0, fontSize:'1.05rem', fontWeight:700, color:'#eceefb', display:'flex', alignItems:'center', gap:9 }}>
            <Megaphone size={17} color="#818cf8" />
            {isEdit ? 'Edit Announcement' : 'New Announcement'}
          </h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#7880a8', cursor:'pointer', display:'grid', placeItems:'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* title */}
        <div style={{ marginBottom:14 }}>
          <label className="ap-modal-lbl">Title *</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="e.g. Campus closed on Monday"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            autoFocus
          />
        </div>

        {/* audience + category */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
          <div>
            <label className="ap-modal-lbl">Audience</label>
            <select style={inputStyle} value={form.audience} onChange={e => set('audience', e.target.value)}>
              {AUDIENCES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
          <div>
            <label className="ap-modal-lbl">Category</label>
            <select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
        </div>

        {/* priority */}
        <div style={{ marginBottom:14 }}>
          <label className="ap-modal-lbl">Priority</label>
          <select style={inputStyle} value={form.priority} onChange={e => set('priority', e.target.value)}>
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* body */}
        <div style={{ marginBottom:20 }}>
          <label className="ap-modal-lbl">Message</label>
          <textarea
            style={{ ...inputStyle, resize:'vertical', minHeight:110, paddingTop:10 }}
            placeholder="Write the announcement body here…"
            value={form.body}
            onChange={e => set('body', e.target.value)}
          />
        </div>

        {/* footer */}
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', flexWrap:'wrap' }}>
          <button className="ap-btn ap-btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button
            className="ap-btn"
            style={{ background:'rgba(251,191,36,.12)', color:'#fbbf24', border:'1px solid rgba(251,191,36,.28)' }}
            disabled={!valid || busy}
            onClick={() => onDone({ ...form, status:'draft' })}
          >
            <FileText size={14} /> {busy ? '…' : 'Save Draft'}
          </button>
          <button
            className="ap-btn ap-btn-primary"
            disabled={!valid || busy}
            onClick={() => onDone({ ...form, status:'published' })}
          >
            <Send size={14} /> {busy ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width:'100%', padding:'9px 12px', borderRadius:9, boxSizing:'border-box',
  background:'#0d1117', border:'1.5px solid rgba(255,255,255,.1)',
  color:'#eceefb', font:'inherit', fontSize:'.88rem', outline:'none',
  appearance:'none',
};

/* ── main page ──────────────────────────────────────────────────── */
export default function AdminAnnouncements() {
  const { notify } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [busy, setBusy]           = useState(false);
  const [q, setQ]                 = useState('');
  const [filterStatus, setFilterStatus] = useState('all');  // all | published | draft
  const [filterCat, setFilterCat] = useState('all');

  /* fetch all announcements */
  const { data, loading, error, refetch } = useApi(getAnnouncements);
  const list = data?.rows ?? [];

  /* derived counts */
  const published = list.filter(a => a.status === 'published').length;
  const drafts    = list.filter(a => a.status === 'draft').length;
  const urgent    = list.filter(a => a.priority === 'urgent').length;

  /* filtered view */
  const visible = list.filter(a => {
    const term = q.trim().toLowerCase();
    const matchTerm   = !term || [a.title, a.body, a.category, a.audience].some(s => s?.toLowerCase().includes(term));
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchCat    = filterCat === 'all' || a.category === filterCat;
    return matchTerm && matchStatus && matchCat;
  });

  /* open modal helpers */
  const openCreate = () => { setEditing(null); setShowModal(true); };
  const openEdit   = (a) => { setEditing(a);   setShowModal(true); };
  const closeModal = useCallback(() => { setShowModal(false); setEditing(null); }, []);

  /* save (create or update) */
  async function handleSave(form) {
    setBusy(true);
    try {
      if (editing?.id) {
        await updateAnnouncement(editing.id, form);
        notify(`"${form.title}" updated.`, 'success');
      } else {
        await createAnnouncement(form);
        notify(
          form.status === 'published'
            ? `"${form.title}" published to ${form.audience}.`
            : `"${form.title}" saved as draft.`,
          'success'
        );
      }
      closeModal();
      refetch();
    } catch (e) {
      notify(e.message || 'Failed to save announcement.', 'error');
    } finally {
      setBusy(false);
    }
  }

  /* toggle published ↔ draft */
  async function handleToggle(a) {
    const next = a.status === 'published' ? 'draft' : 'published';
    try {
      await updateAnnouncement(a.id, { status: next });
      notify(next === 'published' ? `"${a.title}" published.` : `"${a.title}" moved to drafts.`, 'success');
      refetch();
    } catch (e) {
      notify(e.message || 'Failed to update status.', 'error');
    }
  }

  /* delete */
  async function handleDelete(a) {
    if (!confirm(`Permanently delete "${a.title}"?`)) return;
    try {
      await deleteAnnouncement(a.id);
      notify(`"${a.title}" deleted.`, 'info');
      refetch();
    } catch (e) {
      notify(e.message || 'Failed to delete.', 'error');
    }
  }

  /* render */
  if (loading) return <AdminShell><LoadingSpinner message="Loading announcements…" /></AdminShell>;
  if (error)   return <AdminShell><ErrorState error={error} onRetry={refetch} /></AdminShell>;

  return (
    <AdminShell>
      <style>{`
        .ap-modal-lbl{display:block;font-size:.74rem;font-weight:600;color:#7880a8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;}
        .aa-card{background:#161b2e;border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:18px 20px;display:flex;justify-content:space-between;align-items:flex-start;gap:14px;transition:border-color .18s;}
        .aa-card:hover{border-color:rgba(99,102,241,.22);}
        .aa-card--published{border-left:3px solid #34d399;}
        .aa-card--draft{border-left:3px solid #fbbf24;}
      `}</style>

      {/* header */}
      <div className="ap-hdr">
        <div>
          <h1>Announcements</h1>
          <p className="ap-sub">{published} published · {drafts} draft{drafts !== 1 ? 's' : ''}{urgent ? ` · ${urgent} urgent` : ''}</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={refetch}><RefreshCw size={13} /> Refresh</button>
          <button className="ap-btn ap-btn-primary" onClick={openCreate}><Plus size={15} /> New Announcement</button>
        </div>
      </div>

      {/* stat strip */}
      <div className="ap-g4" style={{ marginBottom:18 }}>
        {[
          { label:'Total',     val: list.length, color:'#818cf8', bg:'rgba(99,102,241,.15)'  },
          { label:'Published', val: published,   color:'#34d399', bg:'rgba(52,211,153,.15)'  },
          { label:'Drafts',    val: drafts,      color:'#fbbf24', bg:'rgba(251,191,36,.15)'  },
          { label:'Urgent',    val: urgent,      color:'#f87171', bg:'rgba(248,113,113,.15)' },
        ].map(s => (
          <div key={s.label} className="ap-card" style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:'grid', placeItems:'center', fontSize:'1.1rem', fontWeight:800, color:s.color }}>
              {s.val}
            </div>
            <span style={{ fontSize:'.84rem', color:'#7880a8' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* filters */}
      <div className="ap-bar" style={{ marginBottom:18 }}>
        <div className="ap-search" style={{ maxWidth:340 }}>
          <Search size={15} color="#7880a8" />
          <input
            placeholder="Search announcements…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>

        {/* status filter */}
        <div style={{ display:'flex', gap:4 }}>
          {['all','published','draft'].map(s => (
            <button
              key={s}
              className={`ap-btn ap-btn-sm ${filterStatus === s ? 'ap-btn-primary' : 'ap-btn-ghost'}`}
              onClick={() => setFilterStatus(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* category filter */}
        <select className="ap-select" value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ minHeight:36, paddingLeft:10, paddingRight:10 }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      {/* list */}
      {visible.length === 0 ? (
        <EmptyState
          icon="📢"
          title={list.length === 0 ? 'No announcements yet' : 'No results'}
          description={list.length === 0 ? 'Create the first campus-wide announcement.' : 'Try adjusting your search or filters.'}
          action={list.length === 0 && (
            <button className="ap-btn ap-btn-primary" style={{ margin:'0 auto' }} onClick={openCreate}>
              <Plus size={15} /> New Announcement
            </button>
          )}
        />
      ) : (
        <div style={{ display:'grid', gap:10 }}>
          {visible.map(a => {
            const color = catColor[a.category] ?? '#818cf8';
            return (
              <div key={a.id} className={`aa-card aa-card--${a.status}`}>
                <div style={{ flex:1, minWidth:0 }}>
                  {/* title + badges */}
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, flexWrap:'wrap' }}>
                    <span style={{ fontWeight:700, color:'#eceefb', fontSize:'.95rem' }}>{a.title}</span>
                    <span className={`ap-badge ${a.status === 'published' ? 'ap-badge-green' : 'ap-badge-yellow'}`}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                    {a.priority === 'urgent' && (
                      <span className="ap-badge ap-badge-red" style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                        <AlertTriangle size={10} /> Urgent
                      </span>
                    )}
                  </div>

                  {/* body preview */}
                  {a.body && (
                    <p style={{ fontSize:'.83rem', color:'#7880a8', margin:'0 0 8px', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                      {a.body}
                    </p>
                  )}

                  {/* meta */}
                  <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:'.76rem', color }}>
                      <Megaphone size={11} /> {a.category}
                    </span>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:'.76rem', color:'#7880a8' }}>
                      <Users size={11} /> {AUDIENCES.find(x => x.value === a.audience)?.label ?? a.audience}
                    </span>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:'.76rem', color:'#7880a8' }}>
                      <Calendar size={11} />
                      {a.created_at ? new Date(a.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—'}
                    </span>
                    {a.author_name && (
                      <span style={{ fontSize:'.76rem', color:'#7880a8' }}>by {a.author_name}</span>
                    )}
                  </div>
                </div>

                {/* actions */}
                <div style={{ display:'flex', gap:6, flexShrink:0, alignItems:'flex-start' }}>
                  <button
                    title={a.status === 'published' ? 'Move to Draft' : 'Publish'}
                    onClick={() => handleToggle(a)}
                    style={{ width:30, height:30, borderRadius:7, border:'1px solid rgba(255,255,255,.09)', background:'transparent', color:'#7880a8', display:'grid', placeItems:'center', cursor:'pointer' }}
                  >
                    {a.status === 'published' ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    title="Edit"
                    onClick={() => openEdit(a)}
                    style={{ width:30, height:30, borderRadius:7, border:'1px solid rgba(255,255,255,.09)', background:'transparent', color:'#7880a8', display:'grid', placeItems:'center', cursor:'pointer' }}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => handleDelete(a)}
                    style={{ width:30, height:30, borderRadius:7, border:'1px solid rgba(248,113,113,.25)', background:'rgba(248,113,113,.08)', color:'#f87171', display:'grid', placeItems:'center', cursor:'pointer' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <AnnouncementModal
          initial={editing}
          onClose={closeModal}
          onDone={handleSave}
          busy={busy}
        />
      )}
    </AdminShell>
  );
}
