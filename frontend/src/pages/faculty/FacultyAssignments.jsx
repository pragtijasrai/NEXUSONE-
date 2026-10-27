/**
 * FacultyAssignments — /faculty/assignments
 * - View Submissions drawer with grading
 * - Create Assignment modal
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, FileText, Users, Clock, CheckCircle2,
  Plus, X, Save, Search, Download, Eye, Edit3,
  AlertTriangle, BookOpen,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { facultyAssignments as initialAssignments, assignmentSubmissions as initialSubs, myStudents, facultyClasses } from '../../data/mockFaculty.js';

/* ─── CSS ─── */
const css = `
  .fa { background:#0d1117; min-height:100vh; color:#c5caf0; font-family:inherit; padding:28px 32px; }
  .fa h1 { font-size:1.4rem; font-weight:700; color:#eceefb; margin:0 0 4px; }
  .fa-sub { font-size:.88rem; color:#7880a8; margin:0; }
  .fa-back { display:inline-flex; align-items:center; gap:6px; color:#7880a8; font-size:.83rem; text-decoration:none; margin-bottom:16px; transition:color .15s; }
  .fa-back:hover { color:#818cf8; }

  /* grid */
  .fa-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
  .fa-card { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:20px; display:flex; flex-direction:column; gap:12px; transition:border-color .18s,transform .18s; }
  .fa-card:hover { border-color:rgba(99,102,241,.3); transform:translateY(-2px); }
  .fa-subject { font-size:.76rem; color:#818cf8; font-weight:700; text-transform:uppercase; letter-spacing:.04em; }
  .fa-title { font-size:1rem; font-weight:700; color:#eceefb; margin:2px 0 0; }
  .fa-meta { display:flex; flex-wrap:wrap; gap:12px; }
  .fa-meta-item { display:flex; align-items:center; gap:5px; font-size:.79rem; color:#7880a8; }
  .fa-progress { height:5px; background:rgba(255,255,255,.06); border-radius:99px; overflow:hidden; }
  .fa-progress-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,#4338ca,#818cf8); transition:width .4s; }
  .fa-stats { display:flex; gap:8px; flex-wrap:wrap; }
  .fa-stat { font-size:.74rem; font-weight:700; padding:3px 9px; border-radius:6px; }
  .fa-stat-s { background:rgba(99,102,241,.15); color:#818cf8; }
  .fa-stat-g { background:rgba(52,211,153,.13);  color:#34d399; }
  .fa-stat-p { background:rgba(251,191,36,.13);  color:#fbbf24; }
  .fa-view-btn { width:100%; padding:10px; border-radius:10px; border:0; font:inherit; font-size:.88rem; font-weight:700; cursor:pointer; transition:all .18s; background:rgba(99,102,241,.2); color:#818cf8; border:1px solid rgba(99,102,241,.3); display:flex; align-items:center; justify-content:center; gap:7px; margin-top:auto; }
  .fa-view-btn:hover { background:rgba(99,102,241,.35); color:#a5b4fc; }
  .fa-create-btn { display:inline-flex; align-items:center; gap:7px; padding:10px 22px; border-radius:10px; border:0; font:inherit; font-size:.9rem; font-weight:600; cursor:pointer; transition:all .18s; background:linear-gradient(135deg,#4338ca,#6366f1); color:#fff; }
  .fa-create-btn:hover { filter:brightness(1.1); transform:translateY(-1px); box-shadow:0 6px 20px rgba(67,56,202,.35); }

  /* ── Submissions Drawer ── */
  .fa-overlay { position:fixed; inset:0; background:rgba(0,0,0,.65); z-index:9990; backdrop-filter:blur(3px); }
  .fa-drawer { position:fixed; right:0; top:0; bottom:0; width:min(720px,100vw); background:#0f1320; border-left:1px solid rgba(255,255,255,.08); z-index:9991; overflow-y:auto; display:flex; flex-direction:column; animation:faSI .22s cubic-bezier(.34,1.1,.64,1); }
  @keyframes faSI { from{transform:translateX(100%);opacity:0;}to{transform:none;opacity:1;} }
  .fa-drawer-head { padding:20px 24px; border-bottom:1px solid rgba(255,255,255,.07); display:flex; justify-content:space-between; align-items:flex-start; gap:12px; position:sticky; top:0; background:#0f1320; z-index:2; }
  .fa-drawer-body { padding:20px 24px; display:grid; gap:16px; }
  .fa-close { border:0; background:rgba(255,255,255,.06); color:#7880a8; border-radius:8px; width:34px; height:34px; cursor:pointer; display:grid; place-items:center; transition:background .15s,color .15s; flex-shrink:0; }
  .fa-close:hover { background:rgba(255,255,255,.12); color:#eceefb; }

  /* submission search bar */
  .fa-sub-bar { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
  .fa-sub-search { display:flex; align-items:center; gap:8px; background:#161b2e; border:1.5px solid rgba(255,255,255,.08); border-radius:9px; padding:0 11px; flex:1; min-width:160px; transition:border-color .18s; }
  .fa-sub-search:focus-within { border-color:#4338ca; }
  .fa-sub-search input { border:0; background:none; min-height:36px; font:inherit; color:#eceefb; width:100%; outline:none; font-size:.85rem; }
  .fa-sub-search input::placeholder { color:#7880a8; }
  .fa-filter-pill { padding:5px 12px; border-radius:7px; border:1px solid rgba(255,255,255,.08); background:transparent; color:#7880a8; font:inherit; font-size:.76rem; cursor:pointer; transition:all .15s; }
  .fa-filter-pill:hover { border-color:#4338ca; color:#818cf8; }
  .fa-filter-pill--active { border-color:#4338ca; color:#818cf8; background:rgba(99,102,241,.12); }

  /* submission table */
  .fa-sub-table { width:100%; border-collapse:collapse; font-size:.83rem; }
  .fa-sub-table th { text-align:left; padding:9px 12px; color:#7880a8; font-size:.69rem; font-weight:600; text-transform:uppercase; letter-spacing:.04em; border-bottom:1px solid rgba(255,255,255,.07); background:#0a0e1a; }
  .fa-sub-table td { padding:11px 12px; border-bottom:1px solid rgba(255,255,255,.04); vertical-align:middle; background:#161b2e; }
  .fa-sub-table tr:last-child td { border:0; }
  .fa-sub-table tr:hover td { background:#1a2035 !important; }
  .fa-av { width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,#4338ca,#818cf8); display:inline-grid; place-items:center; font-size:.7rem; font-weight:700; color:#fff; flex-shrink:0; }
  .fa-sub-status { font-size:.69rem; font-weight:700; padding:2px 8px; border-radius:5px; }
  .fa-sub-submitted { background:rgba(52,211,153,.13); color:#34d399; }
  .fa-sub-late      { background:rgba(251,191,36,.13); color:#fbbf24; }
  .fa-sub-missing   { background:rgba(248,113,113,.13); color:#f87171; }
  .fa-sub-graded    { background:rgba(99,102,241,.15); color:#818cf8; }

  /* inline grade input */
  .fa-grade-input { width:60px; padding:4px 8px; border-radius:6px; background:#0d1117; border:1.5px solid rgba(255,255,255,.1); color:#eceefb; font:inherit; font-size:.83rem; text-align:center; transition:border-color .15s; }
  .fa-grade-input:focus { outline:none; border-color:#4338ca; }
  .fa-save-grade-btn { padding:4px 10px; border-radius:6px; border:0; background:linear-gradient(135deg,#4338ca,#6366f1); color:#fff; font:inherit; font-size:.75rem; font-weight:600; cursor:pointer; transition:all .15s; }
  .fa-save-grade-btn:hover { filter:brightness(1.1); }

  /* info card */
  .fa-info-card { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:12px; padding:16px 18px; }
  .fa-info-card h3 { font-size:.86rem; font-weight:600; color:#eceefb; margin:0 0 10px; }
  .fa-info-row { display:flex; justify-content:space-between; align-items:center; padding:7px 0; border-bottom:1px solid rgba(255,255,255,.04); font-size:.82rem; }
  .fa-info-row:last-child { border:0; }
  .fa-info-label { color:#7880a8; }
  .fa-info-val   { color:#eceefb; font-weight:500; }

  /* ── Create Modal ── */
  .fa-modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.72); z-index:9999; backdrop-filter:blur(4px); display:grid; place-items:center; padding:16px; }
  .fa-modal { background:#131628; border:1px solid rgba(255,255,255,.1); border-radius:16px; padding:26px; width:min(560px,100%); max-height:90vh; overflow-y:auto; animation:faIn .2s cubic-bezier(.34,1.1,.64,1); }
  @keyframes faIn { from{opacity:0;transform:scale(.95) translateY(10px);} }
  .fa-modal h3 { font-size:1.05rem; font-weight:700; color:#eceefb; margin:0 0 20px; display:flex; align-items:center; gap:9px; }
  .fa-field { margin-bottom:14px; }
  .fa-field label { display:block; font-size:.75rem; font-weight:600; color:#7880a8; text-transform:uppercase; letter-spacing:.05em; margin-bottom:5px; }
  .fa-field input, .fa-field select, .fa-field textarea { width:100%; padding:10px 13px; border-radius:9px; box-sizing:border-box; background:#0d1117; border:1.5px solid rgba(255,255,255,.1); color:#eceefb; font:inherit; font-size:.88rem; transition:border-color .18s; }
  .fa-field select { appearance:none; cursor:pointer; }
  .fa-field textarea { resize:vertical; min-height:80px; }
  .fa-field input:focus, .fa-field select:focus, .fa-field textarea:focus { outline:none; border-color:#4338ca; }
  .fa-field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .fa-modal-footer { display:flex; gap:10px; justify-content:flex-end; margin-top:6px; }
  .fa-btn-ghost { display:inline-flex; align-items:center; gap:7px; padding:10px 20px; border-radius:10px; background:rgba(255,255,255,.06); color:#c5caf0; border:1px solid rgba(255,255,255,.1); font:inherit; font-size:.88rem; font-weight:600; cursor:pointer; transition:all .18s; }
  .fa-btn-ghost:hover { background:rgba(255,255,255,.1); }
  .fa-btn-primary { display:inline-flex; align-items:center; gap:7px; padding:10px 22px; border-radius:10px; background:linear-gradient(135deg,#4338ca,#6366f1); color:#fff; border:0; font:inherit; font-size:.88rem; font-weight:600; cursor:pointer; transition:all .18s; }
  .fa-btn-primary:hover { filter:brightness(1.1); }
  .fa-btn-primary:disabled { opacity:.5; cursor:not-allowed; filter:none; }

  @media(max-width:640px){.fa{padding:16px;}.fa-grid{grid-template-columns:1fr;}.fa-field-row{grid-template-columns:1fr;}}
`;

/* ─── Helpers ─── */
function initials(name) { return name.split(' ').map(p => p[0]).slice(0, 2).join(''); }

/* ─── Submissions Drawer ─── */
function SubmissionsDrawer({ assignment, subs, onClose, onGrade }) {
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('All');
  const [grades,    setGrades]    = useState(
    () => Object.fromEntries(subs.map(s => [s.id, s.marks != null ? String(s.marks) : '']))
  );
  const [feedbacks, setFeedbacks] = useState(
    () => Object.fromEntries(subs.map(s => [s.id, s.feedback || '']))
  );
  const { notify } = useToast();

  const filtered = useMemo(() => subs.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q);
    const matchF = filter === 'All' || s.status === filter.toLowerCase() || (filter === 'Graded' && s.marks != null) || (filter === 'Pending' && s.status !== 'missing' && s.marks == null);
    return matchQ && matchF;
  }), [subs, search, filter]);

  function saveGrade(sub) {
    const val = parseFloat(grades[sub.id]);
    if (isNaN(val) || val < 0 || val > assignment.maxMarks) {
      notify(`Marks must be between 0 and ${assignment.maxMarks}`, 'error');
      return;
    }
    onGrade(assignment.id, sub.id, val, feedbacks[sub.id]);
    notify(`Grade saved for ${sub.name}: ${val}/${assignment.maxMarks}`, 'success');
  }

  const counts = { submitted: subs.filter(s=>s.status==='submitted').length, late: subs.filter(s=>s.status==='late').length, missing: subs.filter(s=>s.status==='missing').length, graded: subs.filter(s=>s.marks!=null).length };

  return (
    <>
      <div className="fa-overlay" onClick={onClose} aria-hidden="true" />
      <aside className="fa-drawer" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="fa-drawer-head">
          <div>
            <p style={{ fontSize:'.74rem', color:'#818cf8', fontWeight:700, textTransform:'uppercase', letterSpacing:'.04em', margin:'0 0 4px' }}>{assignment.subject}</p>
            <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700, color:'#eceefb' }}>{assignment.title}</h2>
            <p style={{ margin:'4px 0 0', fontSize:'.78rem', color:'#7880a8' }}>Due {assignment.due} · Max {assignment.maxMarks} marks</p>
          </div>
          <button className="fa-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <div className="fa-drawer-body">
          {/* Summary stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
            {[
              { label:'Submitted', val:counts.submitted, col:'#818cf8' },
              { label:'Late',      val:counts.late,      col:'#fbbf24' },
              { label:'Missing',   val:counts.missing,   col:'#f87171' },
              { label:'Graded',    val:counts.graded,    col:'#34d399' },
            ].map(({ label, val, col }) => (
              <div key={label} style={{ background:'#161b2e', border:'1px solid rgba(255,255,255,.07)', borderRadius:10, padding:'12px 14px', textAlign:'center' }}>
                <div style={{ fontSize:'1.3rem', fontWeight:800, color:col, lineHeight:1 }}>{val}</div>
                <div style={{ fontSize:'.7rem', color:'#7880a8', marginTop:4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Search + filter */}
          <div className="fa-sub-bar">
            <div className="fa-sub-search">
              <Search size={13} color="#7880a8" />
              <input placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search submissions" />
            </div>
            {['All','Submitted','Late','Missing','Graded','Pending'].map(f => (
              <button key={f} className={`fa-filter-pill${filter===f?' fa-filter-pill--active':''}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>

          {/* Submission table */}
          <div style={{ background:'#161b2e', border:'1px solid rgba(255,255,255,.07)', borderRadius:12, overflow:'hidden' }}>
            <table className="fa-sub-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Marks / {assignment.maxMarks}</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign:'center', color:'#7880a8', padding:'28px', fontSize:'.85rem' }}>No submissions match the filter.</td></tr>
                ) : filtered.map(sub => (
                  <tr key={sub.id}>
                    {/* Student */}
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div className="fa-av">{initials(sub.name)}</div>
                        <div>
                          <div style={{ fontWeight:600, color:'#eceefb', fontSize:'.85rem' }}>{sub.name}</div>
                          <div style={{ fontSize:'.72rem', color:'#7880a8' }}>{sub.studentId}</div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`fa-sub-status fa-sub-${sub.marks!=null ? 'graded' : sub.status}`}>
                        {sub.marks != null ? 'Graded' : sub.status.charAt(0).toUpperCase()+sub.status.slice(1)}
                      </span>
                    </td>

                    {/* Submitted at */}
                    <td style={{ fontSize:'.78rem', color: sub.submittedAt ? '#c5caf0' : '#f87171' }}>
                      {sub.submittedAt ?? '—'}
                    </td>

                    {/* Grade input */}
                    <td>
                      {sub.status !== 'missing' ? (
                        <input
                          className="fa-grade-input"
                          type="number"
                          min={0}
                          max={assignment.maxMarks}
                          placeholder="—"
                          value={grades[sub.id]}
                          onChange={e => setGrades(g => ({ ...g, [sub.id]: e.target.value }))}
                          aria-label={`Marks for ${sub.name}`}
                        />
                      ) : (
                        <span style={{ color:'#555a7a', fontSize:'.78rem' }}>Not submitted</span>
                      )}
                    </td>

                    {/* Save */}
                    <td>
                      {sub.status !== 'missing' && (
                        <button className="fa-save-grade-btn" onClick={() => saveGrade(sub)}>
                          <Save size={11} style={{ display:'inline', marginRight:3 }} />Save
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Assignment description */}
          {assignment.description && (
            <div className="fa-info-card">
              <h3><BookOpen size={14} color="#818cf8" style={{ marginRight:4 }} />Assignment Details</h3>
              <p style={{ fontSize:'.84rem', color:'#7880a8', lineHeight:1.6, margin:0 }}>{assignment.description}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

/* ─── Create Assignment Modal ─── */
function CreateAssignmentModal({ onClose, onSubmit }) {
  const subjects = facultyClasses.map(c => c.subject);
  const [form, setForm] = useState({
    title: '', subject: subjects[0] || '', due: '', dueTime: '23:59',
    maxMarks: '100', description: '', instructions: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.title.trim() && form.due && form.maxMarks;

  return (
    <div className="fa-modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fa-modal" role="dialog" aria-modal="true">
        <h3><FileText size={17} color="#818cf8" /> Create Assignment</h3>

        <form onSubmit={e => { e.preventDefault(); if (valid) onSubmit(form); }}>
          <div className="fa-field">
            <label>Assignment Title *</label>
            <input type="text" placeholder="e.g. Linked List Implementation" value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>

          <div className="fa-field">
            <label>Course / Subject *</label>
            <select value={form.subject} onChange={e => set('subject', e.target.value)}>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="fa-field-row">
            <div className="fa-field">
              <label>Due Date *</label>
              <input type="date" value={form.due} onChange={e => set('due', e.target.value)} required />
            </div>
            <div className="fa-field">
              <label>Due Time</label>
              <input type="time" value={form.dueTime} onChange={e => set('dueTime', e.target.value)} />
            </div>
          </div>

          <div className="fa-field">
            <label>Max Marks *</label>
            <input type="number" min="1" placeholder="100" value={form.maxMarks} onChange={e => set('maxMarks', e.target.value)} required />
          </div>

          <div className="fa-field">
            <label>Description</label>
            <textarea placeholder="Describe the assignment objective…" value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div className="fa-field">
            <label>Instructions</label>
            <textarea placeholder="Step-by-step instructions for students…" value={form.instructions} onChange={e => set('instructions', e.target.value)} style={{ minHeight:64 }} />
          </div>

          <div className="fa-modal-footer">
            <button type="button" className="fa-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="fa-btn-primary" disabled={!valid}>
              <Plus size={15} /> Publish Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function FacultyAssignments() {
  const { notify } = useToast();
  const [assignments, setAssignments] = useState(initialAssignments);
  const [subs,        setSubs]        = useState(initialSubs ?? {});
  const [selected,    setSelected]    = useState(null); // assignment being viewed
  const [showCreate,  setShowCreate]  = useState(false);

  function handleGrade(assignmentId, subId, marks, feedback) {
    setSubs(prev => ({
      ...prev,
      [assignmentId]: (prev[assignmentId] ?? []).map(s =>
        s.id === subId ? { ...s, marks, feedback, status:'submitted' } : s
      ),
    }));
    // update graded count on assignment
    setAssignments(prev => prev.map(a => {
      if (a.id !== assignmentId) return a;
      const gradedCount = ((subs[assignmentId] ?? []).filter(s => s.marks != null).length) + 1;
      return { ...a, graded: Math.min(gradedCount, a.submitted) };
    }));
  }

  function handleCreate(form) {
    const students = facultyClasses.find(c => c.subject === form.subject);
    const total    = students ? students.enrolled : 0;
    const newId    = Date.now();
    const newAssignment = {
      id:          newId,
      title:       form.title,
      subject:     form.subject,
      due:         new Date(form.due).toLocaleDateString('en-US', { month:'short', day:'numeric' }),
      submitted:   0,
      total,
      graded:      0,
      maxMarks:    Number(form.maxMarks),
      description: form.description,
    };
    setAssignments(prev => [newAssignment, ...prev]);
    setSubs(prev => ({ ...prev, [newId]: [] }));
    setShowCreate(false);
    notify(`Assignment "${form.title}" published to ${form.subject}!`, 'success');
  }

  return (
    <>
      <style>{css}</style>
      <div className="fa">
        <Link to="/faculty/dashboard" className="fa-back"><ChevronLeft size={15} /> Back to Dashboard</Link>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:22 }}>
          <div>
            <h1>Assignments</h1>
            <p className="fa-sub">{assignments.length} active assignments across your courses</p>
          </div>
          <button className="fa-create-btn" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> Create Assignment
          </button>
        </div>

        {/* Assignment cards */}
        <div className="fa-grid">
          {assignments.map(a => {
            const pending = a.submitted - a.graded;
            const pct     = a.total > 0 ? Math.round((a.submitted / a.total) * 100) : 0;
            const subList = subs[a.id] ?? [];
            return (
              <div key={a.id} className="fa-card">
                <div>
                  <p className="fa-subject">{a.subject}</p>
                  <p className="fa-title">{a.title}</p>
                </div>
                <div className="fa-meta">
                  <div className="fa-meta-item"><Clock size={13} /> Due {a.due}</div>
                  <div className="fa-meta-item"><Users size={13} /> {a.total} students</div>
                </div>
                <div>
                  <div className="fa-progress">
                    <div className="fa-progress-fill" style={{ width:`${pct}%` }} />
                  </div>
                  <p style={{ fontSize:'.73rem', color:'#7880a8', marginTop:4 }}>{a.submitted}/{a.total} submitted ({pct}%)</p>
                </div>
                <div className="fa-stats">
                  <span className="fa-stat fa-stat-s">{a.submitted} submitted</span>
                  <span className="fa-stat fa-stat-g">{a.graded} graded</span>
                  {pending > 0 && <span className="fa-stat fa-stat-p">{pending} to grade</span>}
                  {pending === 0 && a.graded > 0 && <span className="fa-stat fa-stat-g"><CheckCircle2 size={11} style={{ display:'inline', marginRight:3 }} />All graded</span>}
                </div>
                <button className="fa-view-btn" onClick={() => setSelected(a)}>
                  <Eye size={14} /> View Submissions
                </button>
              </div>
            );
          })}
        </div>

        {/* Submissions drawer */}
        {selected && (
          <SubmissionsDrawer
            assignment={selected}
            subs={subs[selected.id] ?? []}
            onClose={() => setSelected(null)}
            onGrade={handleGrade}
          />
        )}

        {/* Create assignment modal */}
        {showCreate && (
          <CreateAssignmentModal
            onClose={() => setShowCreate(false)}
            onSubmit={handleCreate}
          />
        )}
      </div>
    </>
  );
}
