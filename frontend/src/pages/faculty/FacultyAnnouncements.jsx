/**
 * FacultyAnnouncements — /faculty/announcements
 * Real API: GET /faculty/announcements (owned)
 *           POST /announcements (create via shared endpoint)
 *           PATCH /faculty/announcements/:id (own update)
 *           DELETE /faculty/announcements/:id (own delete)
 */
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Plus, Users, Calendar, X,
  Edit2, Trash2, Send, FileText, Eye, EyeOff,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import {
  getFacultyAnnouncements, updateOwnAnnouncement, deleteOwnAnnouncement,
} from '../../services/facultyService.js';
import { createAnnouncement, updateAnnouncement } from '../../services/announcementService.js';

const css = `
  .fan{background:#0d1117;min-height:100vh;color:#c5caf0;font-family:inherit;padding:28px 32px;}
  .fan h1{font-size:1.4rem;font-weight:700;color:#eceefb;margin:0 0 4px;}
  .fan-sub{font-size:.88rem;color:#7880a8;margin:0;}
  .fan-back{display:inline-flex;align-items:center;gap:6px;color:#7880a8;font-size:.83rem;text-decoration:none;margin-bottom:16px;transition:color .15s;}
  .fan-back:hover{color:#818cf8;}
  .fan-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:22px;}
  .fan-stat{background:#161b2e;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:14px 18px;display:flex;align-items:center;gap:12px;}
  .fan-stat-icon{width:36px;height:36px;border-radius:9px;display:grid;place-items:center;flex-shrink:0;}
  .fan-stat-val{font-size:1.4rem;font-weight:800;color:#eceefb;line-height:1;}
  .fan-stat-lbl{font-size:.72rem;color:#7880a8;margin-top:2px;}
  .fan-list{display:grid;gap:10px;}
  .fan-card{background:#161b2e;border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:18px 20px;display:flex;justify-content:space-between;align-items:flex-start;gap:14px;transition:border-color .18s;}
  .fan-card:hover{border-color:rgba(99,102,241,.25);}
  .fan-card--draft{border-left:3px solid #fbbf24;}
  .fan-card--published{border-left:3px solid #34d399;}
  .fan-title{font-size:.96rem;font-weight:700;color:#eceefb;margin:0 0 5px;}
  .fan-body{font-size:.82rem;color:#7880a8;margin:0 0 8px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
  .fan-meta{display:flex;gap:14px;flex-wrap:wrap;}
  .fan-meta-item{display:flex;align-items:center;gap:5px;font-size:.76rem;color:#7880a8;}
  .fan-badge{font-size:.7rem;font-weight:700;padding:3px 10px;border-radius:6px;white-space:nowrap;}
  .fan-published{background:rgba(52,211,153,.13);color:#34d399;}
  .fan-draft{background:rgba(251,191,36,.13);color:#fbbf24;}
  .fan-actions{display:flex;gap:6px;flex-shrink:0;}
  .fan-icon-btn{width:30px;height:30px;border-radius:7px;border:1px solid rgba(255,255,255,.09);background:transparent;color:#7880a8;display:grid;place-items:center;cursor:pointer;transition:all .15s;}
  .fan-icon-btn:hover{color:#eceefb;background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2);}
  .fan-icon-btn--red:hover{color:#f87171;border-color:rgba(248,113,113,.3);background:rgba(248,113,113,.08);}
  .fan-icon-btn--green:hover{color:#34d399;border-color:rgba(52,211,153,.3);background:rgba(52,211,153,.08);}
  .fan-create-btn{display:inline-flex;align-items:center;gap:7px;padding:10px 20px;border-radius:10px;border:0;font:inherit;font-size:.88rem;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#4338ca,#6366f1);color:#fff;transition:all .18s;text-decoration:none;}
  .fan-create-btn:hover{filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 6px 20px rgba(67,56,202,.35);}
  .fan-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:9999;backdrop-filter:blur(4px);display:grid;place-items:center;padding:16px;}
  .fan-modal{background:#131628;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:26px;width:min(540px,100%);max-height:90vh;overflow-y:auto;animation:fanIn .2s cubic-bezier(.34,1.1,.64,1);}
  @keyframes fanIn{from{opacity:0;transform:scale(.95) translateY(10px);}}
  .fan-modal h3{font-size:1.05rem;font-weight:700;color:#eceefb;margin:0 0 20px;display:flex;align-items:center;gap:9px;}
  .fan-field{margin-bottom:14px;}
  .fan-field label{display:block;font-size:.75rem;font-weight:600;color:#7880a8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;}
  .fan-field input,.fan-field select,.fan-field textarea{width:100%;padding:10px 13px;border-radius:9px;box-sizing:border-box;background:#0d1117;border:1.5px solid rgba(255,255,255,.1);color:#eceefb;font:inherit;font-size:.88rem;transition:border-color .18s;}
  .fan-field select{appearance:none;cursor:pointer;}
  .fan-field textarea{resize:vertical;min-height:100px;}
  .fan-field input:focus,.fan-field select:focus,.fan-field textarea:focus{outline:none;border-color:#4338ca;}
  .fan-modal-footer{display:flex;gap:8px;justify-content:flex-end;margin-top:6px;flex-wrap:wrap;}
  .fan-btn-ghost{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:9px;background:rgba(255,255,255,.06);color:#c5caf0;border:1px solid rgba(255,255,255,.1);font:inherit;font-size:.86rem;font-weight:600;cursor:pointer;transition:all .18s;}
  .fan-btn-ghost:hover{background:rgba(255,255,255,.1);}
  .fan-btn-draft{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:9px;background:rgba(251,191,36,.12);color:#fbbf24;border:1px solid rgba(251,191,36,.28);font:inherit;font-size:.86rem;font-weight:600;cursor:pointer;transition:all .18s;}
  .fan-btn-draft:hover{background:rgba(251,191,36,.22);}
  .fan-btn-publish{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:9px;background:linear-gradient(135deg,#4338ca,#6366f1);color:#fff;border:0;font:inherit;font-size:.86rem;font-weight:600;cursor:pointer;transition:all .18s;}
  .fan-btn-publish:hover{filter:brightness(1.1);}
  .fan-btn-publish:disabled,.fan-btn-draft:disabled{opacity:.45;cursor:not-allowed;filter:none;}
  @media(max-width:640px){.fan{padding:16px;}.fan-stats{grid-template-columns:1fr 1fr;}}
`;

const AUDIENCES = [
  { value: 'all', label: 'All (students + faculty)' },
  { value: 'students', label: 'Students only' },
  { value: 'faculty', label: 'Faculty only' },
];
const CATEGORIES = ['general', 'academic', 'events', 'transport', 'urgent'];

const EMPTY_FORM = { title: '', body: '', audience: 'students', category: 'academic', priority: 'normal' };

function AnnouncementModal({ initial, onClose, onDone, busy }) {
  const [form, setForm] = useState(initial
    ? { title: initial.title, body: initial.body ?? '', audience: initial.audience, category: initial.category, priority: initial.priority }
    : { ...EMPTY_FORM });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.title.trim().length >= 3;
  const isEdit = !!initial?.id;

  return (
    <div className="fan-modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fan-modal" role="dialog" aria-modal="true">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0 }}>
            <FileText size={17} color="#818cf8" />
            {isEdit ? 'Edit Announcement' : 'New Announcement'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#7880a8', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <div className="fan-field">
          <label>Title *</label>
          <input type="text" placeholder="e.g. Midterm exam rescheduled" value={form.title} onChange={e => set('title', e.target.value)} autoFocus />
        </div>

        <div className="fan-field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label>Audience</label>
            <select value={form.audience} onChange={e => set('audience', e.target.value)}>
              {AUDIENCES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
          <div>
            <label>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
        </div>

        <div className="fan-field">
          <label>Priority</label>
          <select value={form.priority} onChange={e => set('priority', e.target.value)}>
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="fan-field">
          <label>Message</label>
          <textarea placeholder="Write your announcement here…" value={form.body} onChange={e => set('body', e.target.value)} />
        </div>

        <div className="fan-modal-footer">
          <button className="fan-btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="fan-btn-draft" disabled={!valid || busy}
            onClick={() => onDone({ ...form, status: 'draft' })}>
            <FileText size={14} /> {busy ? '…' : 'Save Draft'}
          </button>
          <button className="fan-btn-publish" disabled={!valid || busy}
            onClick={() => onDone({ ...form, status: 'published' })}>
            <Send size={14} /> {busy ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FacultyAnnouncements() {
  const { notify } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const { data, loading, error, refetch } = useApi(getFacultyAnnouncements);
  const list = Array.isArray(data) ? data : [];

  const published = list.filter(a => a.status === 'published').length;
  const drafts = list.filter(a => a.status === 'draft').length;

  async function handleSave(form) {
    setBusy(true);
    try {
      if (editing?.id) {
        await updateOwnAnnouncement(editing.id, form);
        notify(`"${form.title}" updated.`, 'success');
      } else {
        await createAnnouncement(form);
        notify(form.status === 'published' ? `"${form.title}" published!` : `"${form.title}" saved as draft.`, 'success');
      }
      setShowModal(false);
      setEditing(null);
      refetch();
    } catch (e) { notify(e.message || 'Failed to save', 'error'); }
    finally { setBusy(false); }
  }

  async function handleToggle(a) {
    const newStatus = a.status === 'published' ? 'draft' : 'published';
    try {
      await updateOwnAnnouncement(a.id, { status: newStatus });
      notify(newStatus === 'published' ? `"${a.title}" published!` : `"${a.title}" moved to drafts.`, 'success');
      refetch();
    } catch (e) { notify(e.message || 'Failed to update', 'error'); }
  }

  async function handleDelete(a) {
    if (!confirm(`Delete "${a.title}"?`)) return;
    try {
      await deleteOwnAnnouncement(a.id);
      notify(`"${a.title}" deleted.`, 'info');
      refetch();
    } catch (e) { notify(e.message || 'Failed to delete', 'error'); }
  }

  if (loading) return <><style>{css}</style><div className="fan"><LoadingSpinner message="Loading announcements…" /></div></>;
  if (error) return <><style>{css}</style><div className="fan"><ErrorState error={error} onRetry={refetch} /></div></>;

  return (
    <>
      <style>{css}</style>
      <div className="fan">
        <Link to="/faculty/dashboard" className="fan-back"><ChevronLeft size={15} /> Back to Dashboard</Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
          <div>
            <h1>Announcements</h1>
            <p className="fan-sub">{published} published · {drafts} draft{drafts !== 1 ? 's' : ''}</p>
          </div>
          <button className="fan-create-btn" onClick={() => { setEditing(null); setShowModal(true); }}>
            <Plus size={15} /> New Announcement
          </button>
        </div>

        <div className="fan-stats">
          {[
            { icon: FileText, label: 'Total', value: list.length, bg: 'rgba(99,102,241,.18)', color: '#818cf8' },
            { icon: Send, label: 'Published', value: published, bg: 'rgba(52,211,153,.15)', color: '#34d399' },
            { icon: FileText, label: 'Drafts', value: drafts, bg: 'rgba(251,191,36,.15)', color: '#fbbf24' },
          ].map(({ icon: Icon, label, value, bg, color }) => (
            <div key={label} className="fan-stat">
              <div className="fan-stat-icon" style={{ background: bg }}><Icon size={17} color={color} /></div>
              <div><div className="fan-stat-val">{value}</div><div className="fan-stat-lbl">{label}</div></div>
            </div>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState icon="📢" title="No announcements yet"
            description="Create your first announcement for students or faculty."
            action={<button className="fan-create-btn" style={{ margin: '0 auto' }} onClick={() => setShowModal(true)}><Plus size={15} /> Create</button>} />
        ) : (
          <div className="fan-list">
            {list.map(a => (
              <div key={a.id} className={`fan-card fan-card--${a.status}`}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="fan-title">{a.title}</p>
                  {a.body && <p className="fan-body">{a.body}</p>}
                  <div className="fan-meta">
                    <div className="fan-meta-item"><Users size={12} />{AUDIENCES.find(x => x.value === a.audience)?.label ?? a.audience}</div>
                    <div className="fan-meta-item"><Calendar size={12} />{a.created_at ? new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</div>
                    <div className="fan-meta-item" style={{ color: a.priority === 'urgent' ? '#f87171' : '#7880a8' }}>{a.category}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  <span className={`fan-badge fan-${a.status}`}>{a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span>
                  <div className="fan-actions">
                    <button className="fan-icon-btn fan-icon-btn--green" title={a.status === 'published' ? 'Move to Draft' : 'Publish'} onClick={() => handleToggle(a)}>
                      {a.status === 'published' ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button className="fan-icon-btn" title="Edit" onClick={() => { setEditing(a); setShowModal(true); }}><Edit2 size={13} /></button>
                    <button className="fan-icon-btn fan-icon-btn--red" title="Delete" onClick={() => handleDelete(a)}><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <AnnouncementModal
            initial={editing}
            onClose={() => { setShowModal(false); setEditing(null); }}
            onDone={handleSave}
            busy={busy}
          />
        )}
      </div>
    </>
  );
}
