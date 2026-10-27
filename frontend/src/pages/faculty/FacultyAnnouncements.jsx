/**
 * FacultyAnnouncements — /faculty/announcements
 * - New Announcement modal (with title, audience, body, publish/draft)
 * - Edit existing announcements
 * - Publish draft / unpublish
 * - Delete
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Plus, Users, Calendar, X,
  Edit2, Trash2, Send, FileText, Eye, EyeOff,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { facultyAnnouncements } from '../../data/mockFaculty.js';

/* ─── CSS ─── */
const css = `
  .fan { background:#0d1117; min-height:100vh; color:#c5caf0; font-family:inherit; padding:28px 32px; }
  .fan h1 { font-size:1.4rem; font-weight:700; color:#eceefb; margin:0 0 4px; }
  .fan-header-sub { font-size:.88rem; color:#7880a8; margin:0; }
  .fan-back { display:inline-flex; align-items:center; gap:6px; color:#7880a8; font-size:.83rem; text-decoration:none; margin-bottom:16px; transition:color .15s; }
  .fan-back:hover { color:#818cf8; }

  /* stats */
  .fan-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:22px; }
  .fan-stat { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:12px; padding:14px 18px; display:flex; align-items:center; gap:12px; }
  .fan-stat-icon { width:36px; height:36px; border-radius:9px; display:grid; place-items:center; flex-shrink:0; }
  .fan-stat-val { font-size:1.4rem; font-weight:800; color:#eceefb; line-height:1; }
  .fan-stat-lbl { font-size:.72rem; color:#7880a8; margin-top:2px; }

  /* list */
  .fan-list { display:grid; gap:10px; }
  .fan-card { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:18px 20px; display:flex; justify-content:space-between; align-items:flex-start; gap:14px; transition:border-color .18s; }
  .fan-card:hover { border-color:rgba(99,102,241,.25); }
  .fan-card--draft { border-left:3px solid #fbbf24; }
  .fan-card--published { border-left:3px solid #34d399; }
  .fan-title { font-size:.96rem; font-weight:700; color:#eceefb; margin:0 0 5px; }
  .fan-body  { font-size:.82rem; color:#7880a8; margin:0 0 8px; line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .fan-meta  { display:flex; gap:14px; flex-wrap:wrap; }
  .fan-meta-item { display:flex; align-items:center; gap:5px; font-size:.76rem; color:#7880a8; }
  .fan-badge { font-size:.7rem; font-weight:700; padding:3px 10px; border-radius:6px; white-space:nowrap; }
  .fan-published { background:rgba(52,211,153,.13); color:#34d399; }
  .fan-draft     { background:rgba(251,191,36,.13);  color:#fbbf24; }
  .fan-actions { display:flex; gap:6px; flex-shrink:0; }
  .fan-icon-btn { width:30px; height:30px; border-radius:7px; border:1px solid rgba(255,255,255,.09); background:transparent; color:#7880a8; display:grid; place-items:center; cursor:pointer; transition:all .15s; }
  .fan-icon-btn:hover { color:#eceefb; background:rgba(255,255,255,.08); border-color:rgba(255,255,255,.2); }
  .fan-icon-btn--red:hover { color:#f87171; border-color:rgba(248,113,113,.3); background:rgba(248,113,113,.08); }
  .fan-icon-btn--green:hover { color:#34d399; border-color:rgba(52,211,153,.3); background:rgba(52,211,153,.08); }

  /* create button */
  .fan-create-btn { display:inline-flex; align-items:center; gap:7px; padding:10px 20px; border-radius:10px; border:0; font:inherit; font-size:.88rem; font-weight:600; cursor:pointer; background:linear-gradient(135deg,#4338ca,#6366f1); color:#fff; transition:all .18s; text-decoration:none; }
  .fan-create-btn:hover { filter:brightness(1.1); transform:translateY(-1px); box-shadow:0 6px 20px rgba(67,56,202,.35); }

  /* empty */
  .fan-empty { text-align:center; padding:56px 20px; color:#7880a8; }
  .fan-empty p { margin-top:10px; font-size:.88rem; }

  /* ── Modal ── */
  .fan-modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.72); z-index:9999; backdrop-filter:blur(4px); display:grid; place-items:center; padding:16px; }
  .fan-modal { background:#131628; border:1px solid rgba(255,255,255,.1); border-radius:16px; padding:26px; width:min(540px,100%); max-height:90vh; overflow-y:auto; animation:fanIn .2s cubic-bezier(.34,1.1,.64,1); }
  @keyframes fanIn { from{opacity:0;transform:scale(.95) translateY(10px);} }
  .fan-modal h3 { font-size:1.05rem; font-weight:700; color:#eceefb; margin:0 0 20px; display:flex; align-items:center; gap:9px; }
  .fan-field { margin-bottom:14px; }
  .fan-field label { display:block; font-size:.75rem; font-weight:600; color:#7880a8; text-transform:uppercase; letter-spacing:.05em; margin-bottom:5px; }
  .fan-field input, .fan-field select, .fan-field textarea {
    width:100%; padding:10px 13px; border-radius:9px; box-sizing:border-box;
    background:#0d1117; border:1.5px solid rgba(255,255,255,.1);
    color:#eceefb; font:inherit; font-size:.88rem; transition:border-color .18s;
  }
  .fan-field select { appearance:none; cursor:pointer; }
  .fan-field textarea { resize:vertical; min-height:100px; }
  .fan-field input:focus, .fan-field select:focus, .fan-field textarea:focus { outline:none; border-color:#4338ca; }
  .fan-modal-footer { display:flex; gap:8px; justify-content:flex-end; margin-top:6px; flex-wrap:wrap; }
  .fan-btn-ghost { display:inline-flex; align-items:center; gap:7px; padding:9px 18px; border-radius:9px; background:rgba(255,255,255,.06); color:#c5caf0; border:1px solid rgba(255,255,255,.1); font:inherit; font-size:.86rem; font-weight:600; cursor:pointer; transition:all .18s; }
  .fan-btn-ghost:hover { background:rgba(255,255,255,.1); }
  .fan-btn-draft { display:inline-flex; align-items:center; gap:7px; padding:9px 18px; border-radius:9px; background:rgba(251,191,36,.12); color:#fbbf24; border:1px solid rgba(251,191,36,.28); font:inherit; font-size:.86rem; font-weight:600; cursor:pointer; transition:all .18s; }
  .fan-btn-draft:hover { background:rgba(251,191,36,.22); }
  .fan-btn-publish { display:inline-flex; align-items:center; gap:7px; padding:9px 18px; border-radius:9px; background:linear-gradient(135deg,#4338ca,#6366f1); color:#fff; border:0; font:inherit; font-size:.86rem; font-weight:600; cursor:pointer; transition:all .18s; }
  .fan-btn-publish:hover { filter:brightness(1.1); }
  .fan-btn-publish:disabled, .fan-btn-draft:disabled { opacity:.45; cursor:not-allowed; filter:none; }

  @media(max-width:640px){ .fan{padding:16px;} .fan-stats{grid-template-columns:1fr 1fr;} }
`;

const AUDIENCES = ['All Students', 'Data Structures', 'Algorithms', 'Theory of Comp.', 'OOP', 'Faculty Only'];

const EMPTY_FORM = { title:'', audience:'All Students', body:'' };

/* ─── Create / Edit Modal ─── */
function AnnouncementModal({ initial, onClose, onSaveDraft, onPublish }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.title.trim();
  const isEdit = !!initial?.id;

  return (
    <div className="fan-modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fan-modal" role="dialog" aria-modal="true">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ margin:0 }}>
            <FileText size={17} color="#818cf8" />
            {isEdit ? 'Edit Announcement' : 'New Announcement'}
          </h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#7880a8', cursor:'pointer', display:'grid', placeItems:'center' }}>
            <X size={18} />
          </button>
        </div>

        <div className="fan-field">
          <label>Title *</label>
          <input
            type="text"
            placeholder="e.g. Midterm exam rescheduled"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            autoFocus
          />
        </div>

        <div className="fan-field">
          <label>Audience</label>
          <select value={form.audience} onChange={e => set('audience', e.target.value)}>
            {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="fan-field">
          <label>Message</label>
          <textarea
            placeholder="Write your announcement here…"
            value={form.body}
            onChange={e => set('body', e.target.value)}
          />
        </div>

        <div className="fan-modal-footer">
          <button className="fan-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="fan-btn-draft"
            disabled={!valid}
            onClick={() => onSaveDraft(form)}
          >
            <FileText size={14} /> Save as Draft
          </button>
          <button
            className="fan-btn-publish"
            disabled={!valid}
            onClick={() => onPublish(form)}
          >
            <Send size={14} /> Publish
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function FacultyAnnouncements() {
  const { notify } = useToast();

  const [list,       setList]       = useState(() =>
    facultyAnnouncements.map(a => ({ ...a, body: '' }))
  );
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState(null); // announcement being edited

  const published = list.filter(a => a.status === 'published').length;
  const drafts    = list.filter(a => a.status === 'draft').length;

  function today() {
    return new Date().toLocaleDateString('en-US', { month:'short', day:'numeric' });
  }

  function addOrUpdate(form, status) {
    if (editing) {
      setList(l => l.map(a => a.id === editing.id ? { ...a, ...form, status } : a));
      notify(status === 'published' ? `"${form.title}" published!` : `"${form.title}" saved as draft.`, status === 'published' ? 'success' : 'info');
    } else {
      const newAnn = {
        id:       Date.now(),
        title:    form.title,
        audience: form.audience,
        body:     form.body,
        date:     today(),
        status,
      };
      setList(l => [newAnn, ...l]);
      notify(status === 'published' ? `"${form.title}" published!` : `"${form.title}" saved as draft.`, status === 'published' ? 'success' : 'info');
    }
    setShowModal(false);
    setEditing(null);
  }

  function openEdit(a) {
    setEditing(a);
    setShowModal(true);
  }

  function toggleStatus(a) {
    const newStatus = a.status === 'published' ? 'draft' : 'published';
    setList(l => l.map(x => x.id === a.id ? { ...x, status: newStatus } : x));
    notify(newStatus === 'published' ? `"${a.title}" published!` : `"${a.title}" moved to drafts.`, newStatus === 'published' ? 'success' : 'info');
  }

  function remove(id) {
    const a = list.find(x => x.id === id);
    setList(l => l.filter(x => x.id !== id));
    notify(`"${a?.title}" deleted.`, 'info');
  }

  return (
    <>
      <style>{css}</style>
      <div className="fan">
        <Link to="/faculty/dashboard" className="fan-back"><ChevronLeft size={15} /> Back to Dashboard</Link>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:22 }}>
          <div>
            <h1>Announcements</h1>
            <p className="fan-header-sub">{published} published · {drafts} draft{drafts !== 1 ? 's' : ''}</p>
          </div>
          <button className="fan-create-btn" onClick={() => { setEditing(null); setShowModal(true); }}>
            <Plus size={15} /> New Announcement
          </button>
        </div>

        {/* Stats */}
        <div className="fan-stats">
          <div className="fan-stat">
            <div className="fan-stat-icon" style={{ background:'rgba(99,102,241,.18)' }}>
              <FileText size={17} color="#818cf8" />
            </div>
            <div><div className="fan-stat-val">{list.length}</div><div className="fan-stat-lbl">Total</div></div>
          </div>
          <div className="fan-stat">
            <div className="fan-stat-icon" style={{ background:'rgba(52,211,153,.15)' }}>
              <Send size={17} color="#34d399" />
            </div>
            <div><div className="fan-stat-val">{published}</div><div className="fan-stat-lbl">Published</div></div>
          </div>
          <div className="fan-stat">
            <div className="fan-stat-icon" style={{ background:'rgba(251,191,36,.15)' }}>
              <FileText size={17} color="#fbbf24" />
            </div>
            <div><div className="fan-stat-val">{drafts}</div><div className="fan-stat-lbl">Drafts</div></div>
          </div>
        </div>

        {/* List */}
        {list.length === 0 ? (
          <div className="fan-empty">
            <FileText size={44} color="rgba(255,255,255,.1)" />
            <p>No announcements yet. Create your first one!</p>
          </div>
        ) : (
          <div className="fan-list">
            {list.map(a => (
              <div key={a.id} className={`fan-card fan-card--${a.status}`}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p className="fan-title">{a.title}</p>
                  {a.body && <p className="fan-body">{a.body}</p>}
                  <div className="fan-meta">
                    <div className="fan-meta-item"><Users size={12} />{a.audience}</div>
                    <div className="fan-meta-item"><Calendar size={12} />{a.date}</div>
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8, flexShrink:0 }}>
                  <span className={`fan-badge fan-${a.status}`}>
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </span>
                  <div className="fan-actions">
                    {/* Publish / Unpublish toggle */}
                    <button
                      className={`fan-icon-btn fan-icon-btn--green`}
                      title={a.status === 'published' ? 'Move to Draft' : 'Publish'}
                      onClick={() => toggleStatus(a)}
                    >
                      {a.status === 'published' ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    {/* Edit */}
                    <button
                      className="fan-icon-btn"
                      title="Edit"
                      onClick={() => openEdit(a)}
                    >
                      <Edit2 size={13} />
                    </button>
                    {/* Delete */}
                    <button
                      className="fan-icon-btn fan-icon-btn--red"
                      title="Delete"
                      onClick={() => remove(a.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <AnnouncementModal
            initial={editing}
            onClose={() => { setShowModal(false); setEditing(null); }}
            onSaveDraft={form => addOrUpdate(form, 'draft')}
            onPublish={form => addOrUpdate(form, 'published')}
          />
        )}
      </div>
    </>
  );
}
