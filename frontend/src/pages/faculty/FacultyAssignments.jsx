/**
 * FacultyAssignments — /faculty/assignments
 * Real API: GET/POST/PATCH/DELETE /faculty/assignments + roster + grading
 */
import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, FileText, Users, Clock, CheckCircle2,
  Plus, X, Save, Search, Eye, Trash2, Edit3, AlertTriangle,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import {
  getAssignments, getFacultyCourses, createAssignment, updateAssignment,
  deleteAssignment, getAssignmentRoster, gradeStudent,
} from '../../services/facultyService.js';

const css = `
  .fa{background:#0d1117;min-height:100vh;color:#c5caf0;font-family:inherit;padding:28px 32px;}
  .fa h1{font-size:1.4rem;font-weight:700;color:#eceefb;margin:0 0 4px;}
  .fa-sub{font-size:.88rem;color:#7880a8;margin:0;}
  .fa-back{display:inline-flex;align-items:center;gap:6px;color:#7880a8;font-size:.83rem;text-decoration:none;margin-bottom:16px;transition:color .15s;}
  .fa-back:hover{color:#818cf8;}
  .fa-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;}
  .fa-card{background:#161b2e;border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:12px;transition:border-color .18s,transform .18s;}
  .fa-card:hover{border-color:rgba(99,102,241,.3);transform:translateY(-2px);}
  .fa-course-tag{font-size:.76rem;color:#818cf8;font-weight:700;text-transform:uppercase;letter-spacing:.04em;}
  .fa-title{font-size:1rem;font-weight:700;color:#eceefb;margin:2px 0 0;}
  .fa-meta{display:flex;flex-wrap:wrap;gap:12px;}
  .fa-meta-item{display:flex;align-items:center;gap:5px;font-size:.79rem;color:#7880a8;}
  .fa-progress{height:5px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;}
  .fa-progress-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#4338ca,#818cf8);transition:width .4s;}
  .fa-create-btn{display:inline-flex;align-items:center;gap:7px;padding:10px 22px;border-radius:10px;border:0;font:inherit;font-size:.9rem;font-weight:600;cursor:pointer;transition:all .18s;background:linear-gradient(135deg,#4338ca,#6366f1);color:#fff;}
  .fa-create-btn:hover{filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 6px 20px rgba(67,56,202,.35);}
  .fa-view-btn{width:100%;padding:10px;border-radius:10px;border:1px solid rgba(99,102,241,.3);font:inherit;font-size:.88rem;font-weight:700;cursor:pointer;transition:all .18s;background:rgba(99,102,241,.2);color:#818cf8;display:flex;align-items:center;justify-content:center;gap:7px;margin-top:auto;}
  .fa-view-btn:hover{background:rgba(99,102,241,.35);}
  .fa-card-actions{display:flex;gap:6px;justify-content:flex-end;}
  .fa-icon-btn{width:28px;height:28px;border-radius:7px;border:1px solid rgba(255,255,255,.09);background:transparent;color:#7880a8;display:grid;place-items:center;cursor:pointer;transition:all .15s;}
  .fa-icon-btn:hover{color:#eceefb;background:rgba(255,255,255,.08);}
  .fa-icon-btn--red:hover{color:#f87171;border-color:rgba(248,113,113,.3);background:rgba(248,113,113,.08);}
  /* Drawer */
  .fa-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9990;backdrop-filter:blur(3px);}
  .fa-drawer{position:fixed;right:0;top:0;bottom:0;width:min(720px,100vw);background:#0f1320;border-left:1px solid rgba(255,255,255,.08);z-index:9991;overflow-y:auto;display:flex;flex-direction:column;animation:faSI .22s cubic-bezier(.34,1.1,.64,1);}
  @keyframes faSI{from{transform:translateX(100%);opacity:0;}to{transform:none;opacity:1;}}
  .fa-dhead{padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;justify-content:space-between;align-items:flex-start;gap:12px;position:sticky;top:0;background:#0f1320;z-index:2;}
  .fa-dbody{padding:20px 24px;display:grid;gap:16px;}
  .fa-close{border:0;background:rgba(255,255,255,.06);color:#7880a8;border-radius:8px;width:34px;height:34px;cursor:pointer;display:grid;place-items:center;transition:background .15s,color .15s;flex-shrink:0;}
  .fa-close:hover{background:rgba(255,255,255,.12);color:#eceefb;}
  .fa-sub-search{display:flex;align-items:center;gap:8px;background:#161b2e;border:1.5px solid rgba(255,255,255,.08);border-radius:9px;padding:0 11px;flex:1;min-width:160px;transition:border-color .18s;}
  .fa-sub-search:focus-within{border-color:#4338ca;}
  .fa-sub-search input{border:0;background:none;min-height:36px;font:inherit;color:#eceefb;width:100%;outline:none;font-size:.85rem;}
  .fa-sub-search input::placeholder{color:#7880a8;}
  .fa-sub-table{width:100%;border-collapse:collapse;font-size:.83rem;}
  .fa-sub-table th{text-align:left;padding:9px 12px;color:#7880a8;font-size:.69rem;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid rgba(255,255,255,.07);background:#0a0e1a;}
  .fa-sub-table td{padding:11px 12px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle;background:#161b2e;}
  .fa-sub-table tr:last-child td{border:0;}
  .fa-sub-table tr:hover td{background:#1a2035!important;}
  .fa-av{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#4338ca,#818cf8);display:inline-grid;place-items:center;font-size:.7rem;font-weight:700;color:#fff;flex-shrink:0;}
  .fa-sub-status{font-size:.69rem;font-weight:700;padding:2px 8px;border-radius:5px;}
  .fa-sub-submitted{background:rgba(52,211,153,.13);color:#34d399;}
  .fa-sub-graded{background:rgba(99,102,241,.15);color:#818cf8;}
  .fa-sub-missing{background:rgba(248,113,113,.13);color:#f87171;}
  .fa-grade-input{width:60px;padding:4px 8px;border-radius:6px;background:#0d1117;border:1.5px solid rgba(255,255,255,.1);color:#eceefb;font:inherit;font-size:.83rem;text-align:center;transition:border-color .15s;}
  .fa-grade-input:focus{outline:none;border-color:#4338ca;}
  .fa-save-grade-btn{padding:4px 10px;border-radius:6px;border:0;background:linear-gradient(135deg,#4338ca,#6366f1);color:#fff;font:inherit;font-size:.75rem;font-weight:600;cursor:pointer;transition:all .15s;}
  .fa-save-grade-btn:hover{filter:brightness(1.1);}
  /* Modal */
  .fa-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:9999;backdrop-filter:blur(4px);display:grid;place-items:center;padding:16px;}
  .fa-modal{background:#131628;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:26px;width:min(560px,100%);max-height:90vh;overflow-y:auto;animation:faIn .2s cubic-bezier(.34,1.1,.64,1);}
  @keyframes faIn{from{opacity:0;transform:scale(.95) translateY(10px);}}
  .fa-modal h3{font-size:1.05rem;font-weight:700;color:#eceefb;margin:0 0 20px;display:flex;align-items:center;gap:9px;}
  .fa-field{margin-bottom:14px;}
  .fa-field label{display:block;font-size:.75rem;font-weight:600;color:#7880a8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;}
  .fa-field input,.fa-field select,.fa-field textarea{width:100%;padding:10px 13px;border-radius:9px;box-sizing:border-box;background:#0d1117;border:1.5px solid rgba(255,255,255,.1);color:#eceefb;font:inherit;font-size:.88rem;transition:border-color .18s;}
  .fa-field select{appearance:none;cursor:pointer;}
  .fa-field textarea{resize:vertical;min-height:80px;}
  .fa-field input:focus,.fa-field select:focus,.fa-field textarea:focus{outline:none;border-color:#4338ca;}
  .fa-field-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .fa-modal-footer{display:flex;gap:10px;justify-content:flex-end;margin-top:6px;}
  .fa-btn-ghost{display:inline-flex;align-items:center;gap:7px;padding:10px 20px;border-radius:10px;background:rgba(255,255,255,.06);color:#c5caf0;border:1px solid rgba(255,255,255,.1);font:inherit;font-size:.88rem;font-weight:600;cursor:pointer;transition:all .18s;}
  .fa-btn-ghost:hover{background:rgba(255,255,255,.1);}
  .fa-btn-primary{display:inline-flex;align-items:center;gap:7px;padding:10px 22px;border-radius:10px;background:linear-gradient(135deg,#4338ca,#6366f1);color:#fff;border:0;font:inherit;font-size:.88rem;font-weight:600;cursor:pointer;transition:all .18s;}
  .fa-btn-primary:hover{filter:brightness(1.1);}
  .fa-btn-primary:disabled{opacity:.5;cursor:not-allowed;filter:none;}
  @media(max-width:640px){.fa{padding:16px;}.fa-grid{grid-template-columns:1fr;}.fa-field-row{grid-template-columns:1fr;}}
`;

function initials(n) { return n.split(' ').map(p => p[0]).slice(0, 2).join(''); }

function SubmissionsDrawer({ assignment, onClose, onGradeUpdate }) {
  const { notify } = useToast();
  const [search, setSearch] = useState('');
  const [grades, setGrades] = useState({});
  const [saving, setSaving] = useState({});
  const { data, loading, error } = useApi(
    useCallback(() => getAssignmentRoster(assignment.id), [assignment.id]),
    [assignment.id]
  );

  const roster = data?.roster ?? [];
  const a = data?.assignment ?? assignment;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return roster.filter(r => !q || r.student_name.toLowerCase().includes(q) || r.student_roll?.toLowerCase().includes(q));
  }, [roster, search]);

  const counts = useMemo(() => ({
    submitted: roster.filter(r => r.submission_id && r.grade == null).length,
    graded:    roster.filter(r => r.grade != null).length,
    missing:   roster.filter(r => !r.submission_id).length,
  }), [roster]);

  async function saveGrade(studentId, maxMarks) {
    const val = parseFloat(grades[studentId]);
    if (isNaN(val) || val < 0) { notify('Enter a valid grade', 'error'); return; }
    if (maxMarks && val > maxMarks) { notify(`Max marks is ${maxMarks}`, 'error'); return; }
    setSaving(p => ({ ...p, [studentId]: true }));
    try {
      await gradeStudent(assignment.id, studentId, val);
      notify(`Grade saved: ${val}/${maxMarks ?? '?'}`, 'success');
      onGradeUpdate?.();
    } catch (e) { notify(e.message || 'Failed to save grade', 'error'); }
    finally { setSaving(p => ({ ...p, [studentId]: false })); }
  }

  return (
    <>
      <div className="fa-overlay" onClick={onClose} aria-hidden="true" />
      <aside className="fa-drawer" role="dialog" aria-modal="true">
        <div className="fa-dhead">
          <div>
            <p style={{ fontSize: '.74rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', margin: '0 0 4px' }}>{assignment.course_code}</p>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#eceefb' }}>{assignment.title}</h2>
            <p style={{ margin: '4px 0 0', fontSize: '.78rem', color: '#7880a8' }}>
              Due {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'} · Max {assignment.max_marks} marks
            </p>
          </div>
          <button className="fa-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <div className="fa-dbody">
          {/* Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { label: 'Submitted', value: counts.submitted, color: '#818cf8' },
              { label: 'Graded', value: counts.graded, color: '#34d399' },
              { label: 'Missing', value: counts.missing, color: '#f87171' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: '#161b2e', border: '1px solid rgba(255,255,255,.07)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '.7rem', color: '#7880a8', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          <div className="fa-sub-search" style={{ maxWidth: '100%' }}>
            <Search size={13} color="#7880a8" />
            <input placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search submissions" />
          </div>

          {loading ? <LoadingSpinner message="Loading roster…" />
          : error ? <ErrorState error={error} />
          : (
            <div style={{ background: '#161b2e', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, overflow: 'hidden' }}>
              <table className="fa-sub-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Grade / {a.max_marks}</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: '#7880a8', padding: 24, fontSize: '.85rem' }}>No students found.</td></tr>
                  ) : filtered.map(r => {
                    const statusKey = r.grade != null ? 'graded' : r.submission_id ? 'submitted' : 'missing';
                    const statusLabel = r.grade != null ? 'Graded' : r.submission_id ? 'Submitted' : 'Missing';
                    return (
                      <tr key={r.student_id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="fa-av">{initials(r.student_name)}</div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#eceefb', fontSize: '.85rem' }}>{r.student_name}</div>
                              <div style={{ fontSize: '.72rem', color: '#7880a8' }}>{r.student_roll}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className={`fa-sub-status fa-sub-${statusKey}`}>{statusLabel}</span></td>
                        <td style={{ fontSize: '.78rem', color: r.submitted_at ? '#c5caf0' : '#f87171' }}>
                          {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        </td>
                        <td>
                          {r.submission_id || r.grade != null ? (
                            <input
                              className="fa-grade-input"
                              type="number"
                              min={0}
                              max={a.max_marks}
                              placeholder={r.grade != null ? String(r.grade) : '—'}
                              value={grades[r.student_id] ?? (r.grade != null ? r.grade : '')}
                              onChange={e => setGrades(g => ({ ...g, [r.student_id]: e.target.value }))}
                              aria-label={`Marks for ${r.student_name}`}
                            />
                          ) : <span style={{ color: '#555a7a', fontSize: '.78rem' }}>Not submitted</span>}
                        </td>
                        <td>
                          {(r.submission_id || r.grade != null) && (
                            <button className="fa-save-grade-btn" disabled={saving[r.student_id]}
                              onClick={() => saveGrade(r.student_id, a.max_marks)}>
                              {saving[r.student_id] ? '…' : <><Save size={11} style={{ display: 'inline', marginRight: 3 }} />Save</>}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {assignment.description && (
            <div style={{ background: '#161b2e', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: '14px 16px' }}>
              <h3 style={{ fontSize: '.86rem', fontWeight: 600, color: '#eceefb', margin: '0 0 8px' }}>Description</h3>
              <p style={{ fontSize: '.84rem', color: '#7880a8', lineHeight: 1.6, margin: 0 }}>{assignment.description}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function AssignmentModal({ courses, initial, onClose, onSave }) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    courseId: initial?.course_id ?? courses[0]?.id ?? '',
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    dueDate: initial?.due_date ? initial.due_date.split('T')[0] : '',
    maxMarks: initial?.max_marks ?? 100,
  });
  const [busy, setBusy] = useState(false);
  const { notify } = useToast();
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.title.trim() && form.dueDate && form.courseId;

  async function submit(e) {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    try {
      const payload = { courseId: form.courseId, title: form.title.trim(), description: form.description.trim() || null, dueDate: form.dueDate, maxMarks: Number(form.maxMarks) };
      let result;
      if (isEdit) result = await updateAssignment(initial.id, payload);
      else result = await createAssignment(payload);
      onSave(result, isEdit);
    } catch (err) { notify(err.message || 'Failed to save', 'error'); }
    finally { setBusy(false); }
  }

  return (
    <div className="fa-modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fa-modal" role="dialog" aria-modal="true">
        <h3><FileText size={17} color="#818cf8" /> {isEdit ? 'Edit' : 'Create'} Assignment</h3>
        <form onSubmit={submit}>
          <div className="fa-field">
            <label>Course *</label>
            <select value={form.courseId} onChange={e => set('courseId', e.target.value)} disabled={isEdit}>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
          </div>
          <div className="fa-field">
            <label>Title *</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Assignment title" required />
          </div>
          <div className="fa-field-row">
            <div className="fa-field">
              <label>Due Date *</label>
              <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} required />
            </div>
            <div className="fa-field">
              <label>Max Marks</label>
              <input type="number" min={1} value={form.maxMarks} onChange={e => set('maxMarks', e.target.value)} />
            </div>
          </div>
          <div className="fa-field">
            <label>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the assignment…" />
          </div>
          <div className="fa-modal-footer">
            <button type="button" className="fa-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="fa-btn-primary" disabled={!valid || busy}>
              <Save size={15} /> {busy ? 'Saving…' : isEdit ? 'Update' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FacultyAssignments() {
  const { notify } = useToast();
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: assignData, loading: aLoading, error: aError, refetch } = useApi(getAssignments);
  const { data: coursesData, loading: cLoading } = useApi(getFacultyCourses);

  const assignments = Array.isArray(assignData) ? assignData : [];
  const courses = coursesData?.courses ?? [];

  async function handleDelete(a) {
    if (!confirm(`Delete "${a.title}"? This cannot be undone.`)) return;
    try {
      await deleteAssignment(a.id);
      notify(`"${a.title}" deleted.`, 'info');
      refetch();
    } catch (e) { notify(e.message || 'Delete failed', 'error'); }
  }

  function handleSaved(_result, isEdit) {
    setShowModal(false); setEditing(null);
    notify(isEdit ? 'Assignment updated!' : 'Assignment published!', 'success');
    refetch();
  }

  if (aLoading || cLoading) return <><style>{css}</style><div className="fa"><LoadingSpinner message="Loading assignments…" /></div></>;
  if (aError) return <><style>{css}</style><div className="fa"><ErrorState error={aError} onRetry={refetch} /></div></>;

  return (
    <>
      <style>{css}</style>
      <div className="fa">
        <Link to="/faculty/dashboard" className="fa-back"><ChevronLeft size={15} /> Back to Dashboard</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
          <div>
            <h1>Assignments</h1>
            <p className="fa-sub">{assignments.length} assignment{assignments.length !== 1 ? 's' : ''} across your courses</p>
          </div>
          <button className="fa-create-btn" onClick={() => { setEditing(null); setShowModal(true); }}>
            <Plus size={15} /> Create Assignment
          </button>
        </div>

        {assignments.length === 0 ? (
          <EmptyState icon="📝" title="No assignments yet"
            description="Create your first assignment and track submissions here."
            action={<button className="fa-create-btn" style={{ margin: '0 auto' }} onClick={() => setShowModal(true)}><Plus size={15} /> Create Assignment</button>} />
        ) : (
          <div className="fa-grid">
            {assignments.map(a => {
              const pct = a.total_students > 0 ? Math.round((a.submitted_count / a.total_students) * 100) : 0;
              const pending = a.submitted_count - a.graded_count;
              const overdue = new Date(a.due_date) < new Date();
              return (
                <div key={a.id} className="fa-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p className="fa-course-tag">{a.course_code}</p>
                      <p className="fa-title">{a.title}</p>
                    </div>
                    <div className="fa-card-actions">
                      <button className="fa-icon-btn" title="Edit" onClick={() => { setEditing(a); setShowModal(true); }}><Edit3 size={13} /></button>
                      <button className="fa-icon-btn fa-icon-btn--red" title="Delete" onClick={() => handleDelete(a)}><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <div className="fa-meta">
                    <div className="fa-meta-item">
                      <Clock size={13} />
                      <span style={{ color: overdue ? '#f87171' : 'inherit' }}>
                        {overdue ? 'Overdue · ' : 'Due '}{new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="fa-meta-item"><Users size={13} />{a.total_students} students</div>
                  </div>
                  <div>
                    <div className="fa-progress"><div className="fa-progress-fill" style={{ width: `${pct}%` }} /></div>
                    <p style={{ fontSize: '.73rem', color: '#7880a8', marginTop: 4 }}>{a.submitted_count}/{a.total_students} submitted ({pct}%)</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '.74rem', fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: 'rgba(99,102,241,.15)', color: '#818cf8' }}>{a.submitted_count} submitted</span>
                    <span style={{ fontSize: '.74rem', fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: 'rgba(52,211,153,.13)', color: '#34d399' }}>{a.graded_count} graded</span>
                    {pending > 0 && <span style={{ fontSize: '.74rem', fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: 'rgba(251,191,36,.13)', color: '#fbbf24' }}>{pending} to grade</span>}
                  </div>
                  <button className="fa-view-btn" onClick={() => setSelected(a)}>
                    <Eye size={14} /> View Submissions
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {selected && (
          <SubmissionsDrawer
            assignment={selected}
            onClose={() => setSelected(null)}
            onGradeUpdate={refetch}
          />
        )}

        {showModal && (
          <AssignmentModal
            courses={courses}
            initial={editing}
            onClose={() => { setShowModal(false); setEditing(null); }}
            onSave={handleSaved}
          />
        )}
      </div>
    </>
  );
}
