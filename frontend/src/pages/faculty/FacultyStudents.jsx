/**
 * FacultyStudents — /faculty/students
 * Real API: /faculty/students
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ChevronLeft, X, Users,
  GraduationCap, AlertTriangle, CheckCircle2,
  ClipboardList, FileText, ChevronRight,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import { getFacultyStudents } from '../../services/facultyService.js';

const css = `
  .fs{background:#0d1117;min-height:100vh;color:#c5caf0;font-family:inherit;padding:28px 32px;}
  .fs h1{font-size:1.4rem;font-weight:700;color:#eceefb;margin:0 0 4px;}
  .fs-sub{font-size:.88rem;color:#7880a8;margin:0;}
  .fs-back{display:inline-flex;align-items:center;gap:6px;color:#7880a8;font-size:.83rem;text-decoration:none;margin-bottom:16px;transition:color .15s;}
  .fs-back:hover{color:#818cf8;}
  .fs-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;}
  .fs-stat{background:#161b2e;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:16px 18px;display:flex;align-items:center;gap:14px;}
  .fs-stat-icon{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;flex-shrink:0;}
  .fs-stat-val{font-size:1.5rem;font-weight:800;color:#eceefb;line-height:1;}
  .fs-stat-lbl{font-size:.72rem;color:#7880a8;margin-top:3px;}
  .fs-bar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:18px;}
  .fs-search{display:flex;align-items:center;gap:8px;background:#161b2e;border:1.5px solid rgba(255,255,255,.08);border-radius:10px;padding:0 12px;flex:1;min-width:200px;max-width:360px;transition:border-color .18s;}
  .fs-search:focus-within{border-color:#4338ca;}
  .fs-search input{border:0;background:none;min-height:40px;font:inherit;color:#eceefb;width:100%;outline:none;font-size:.88rem;}
  .fs-search input::placeholder{color:#7880a8;}
  .fs-pill{padding:7px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.08);background:#161b2e;color:#7880a8;font:inherit;font-size:.8rem;cursor:pointer;transition:all .15s;white-space:nowrap;}
  .fs-pill:hover{border-color:#4338ca;color:#818cf8;}
  .fs-pill--active{border-color:#4338ca;color:#818cf8;background:rgba(99,102,241,.12);}
  .fs-table-wrap{background:#161b2e;border:1px solid rgba(255,255,255,.07);border-radius:14px;overflow:hidden;}
  .fs-table{width:100%;border-collapse:collapse;}
  .fs-table th{text-align:left;padding:11px 16px;color:#7880a8;font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid rgba(255,255,255,.06);background:#0f1320;}
  .fs-table td{padding:13px 16px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle;background:#161b2e;}
  .fs-table tr:last-child td{border:0;}
  .fs-table tr:hover td{background:#1a2035!important;cursor:pointer;}
  .fs-av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#4338ca,#818cf8);display:inline-grid;place-items:center;font-size:.76rem;font-weight:700;color:#fff;flex-shrink:0;}
  .fs-mini-bar{height:4px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;width:56px;display:inline-block;vertical-align:middle;margin-right:5px;}
  .fs-mini-fill{height:100%;border-radius:99px;}
  .fs-risk-badge{font-size:.7rem;font-weight:700;padding:2px 8px;border-radius:6px;white-space:nowrap;}
  .fs-risk-good{background:rgba(52,211,153,.13);color:#34d399;}
  .fs-risk-warn{background:rgba(251,191,36,.13);color:#fbbf24;}
  .fs-risk-bad{background:rgba(248,113,113,.13);color:#f87171;}
  .fs-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9990;backdrop-filter:blur(3px);}
  .fs-drawer{position:fixed;right:0;top:0;bottom:0;width:min(500px,100vw);background:#0f1320;border-left:1px solid rgba(255,255,255,.08);z-index:9991;overflow-y:auto;animation:fsDI .22s cubic-bezier(.34,1.1,.64,1);}
  @keyframes fsDI{from{transform:translateX(100%);opacity:0;}to{transform:none;opacity:1;}}
  .fs-dhead{padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;justify-content:space-between;align-items:flex-start;gap:12px;position:sticky;top:0;background:#0f1320;z-index:2;}
  .fs-dbody{padding:22px 24px;display:grid;gap:16px;}
  .fs-close{border:0;background:rgba(255,255,255,.06);color:#7880a8;border-radius:8px;width:34px;height:34px;cursor:pointer;display:grid;place-items:center;transition:background .15s,color .15s;flex-shrink:0;}
  .fs-close:hover{background:rgba(255,255,255,.12);color:#eceefb;}
  @media(max-width:1024px){.fs-stats{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:640px){.fs{padding:16px;}}
`;

function initials(n) { return n.split(' ').map(p => p[0]).slice(0, 2).join(''); }
function attColor(p) {
  if (p >= 85) return 'linear-gradient(90deg,#059669,#34d399)';
  if (p >= 75) return 'linear-gradient(90deg,#d97706,#fbbf24)';
  return 'linear-gradient(90deg,#dc2626,#f87171)';
}
function riskInfo(p) {
  if (p >= 85) return { cls: 'fs-risk-badge fs-risk-good', label: 'Good' };
  if (p >= 75) return { cls: 'fs-risk-badge fs-risk-warn', label: 'Warning' };
  return { cls: 'fs-risk-badge fs-risk-bad', label: 'At Risk' };
}

function StudentDrawer({ student, onClose }) {
  const pct = student.total_attendance > 0
    ? Math.round((student.present_count / student.total_attendance) * 100) : 0;
  const risk = riskInfo(pct);

  return (
    <>
      <div className="fs-overlay" onClick={onClose} aria-hidden="true" />
      <aside className="fs-drawer" role="dialog" aria-modal="true">
        <div className="fs-dhead">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="fs-av" style={{ width: 48, height: 48, fontSize: '.9rem' }}>{initials(student.name)}</div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#eceefb' }}>{student.name}</h2>
              <p style={{ margin: '3px 0 0', fontSize: '.78rem', color: '#7880a8' }}>{student.roll_number} · {student.email}</p>
            </div>
          </div>
          <button className="fs-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <div className="fs-dbody">
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { label: 'Attendance', value: `${pct}%`, color: pct >= 75 ? '#34d399' : '#f87171' },
              { label: 'Present', value: student.present_count, color: '#818cf8' },
              { label: 'Total', value: student.total_attendance, color: '#7880a8' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: '#161b2e', border: '1px solid rgba(255,255,255,.07)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '.7rem', color: '#7880a8', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Course */}
          <div style={{ background: '#161b2e', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: '.74rem', color: '#7880a8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>Course</div>
            <div style={{ fontWeight: 600, color: '#eceefb' }}>{student.course_name}</div>
            <div style={{ fontSize: '.78rem', color: '#818cf8', marginTop: 2 }}>{student.course_code}</div>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: attColor(pct), borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: '.78rem', fontWeight: 600, color: pct >= 75 ? '#34d399' : '#f87171' }}>{pct}%</span>
              </div>
              <span className={risk.cls} style={{ marginTop: 6, display: 'inline-block' }}>{risk.label}</span>
            </div>
          </div>

          {/* Quick links */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/faculty/attendance" onClick={onClose}
              style={{ flex: 1, minWidth: 130, padding: '11px 14px', borderRadius: 10, background: 'rgba(52,211,153,.13)', color: '#34d399', textDecoration: 'none', fontSize: '.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: '1px solid rgba(52,211,153,.25)' }}>
              <ClipboardList size={14} /> Attendance
            </Link>
            <Link to="/faculty/assignments" onClick={onClose}
              style={{ flex: 1, minWidth: 130, padding: '11px 14px', borderRadius: 10, background: 'rgba(251,191,36,.12)', color: '#fbbf24', textDecoration: 'none', fontSize: '.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: '1px solid rgba(251,191,36,.25)' }}>
              <FileText size={14} /> Assignments
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function FacultyStudents() {
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('All');
  const [selected, setSelected] = useState(null);

  const { data, loading, error, refetch } = useApi(getFacultyStudents);
  const students = Array.isArray(data) ? data : [];

  const enriched = useMemo(() => students.map(s => ({
    ...s,
    pct: s.total_attendance > 0 ? Math.round((s.present_count / s.total_attendance) * 100) : 0,
  })), [students]);

  const filtered = useMemo(() => enriched.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.roll_number?.toLowerCase().includes(q) || s.course_code?.toLowerCase().includes(q);
    if (filterRisk === 'good')    return matchQ && s.pct >= 85;
    if (filterRisk === 'warning') return matchQ && s.pct >= 75 && s.pct < 85;
    if (filterRisk === 'risk')    return matchQ && s.pct < 75;
    return matchQ;
  }), [enriched, search, filterRisk]);

  const good    = enriched.filter(s => s.pct >= 85).length;
  const warning = enriched.filter(s => s.pct >= 75 && s.pct < 85).length;
  const atRisk  = enriched.filter(s => s.pct < 75).length;

  if (loading) return <><style>{css}</style><div className="fs"><LoadingSpinner message="Loading students…" /></div></>;
  if (error)   return <><style>{css}</style><div className="fs"><ErrorState error={error} onRetry={refetch} /></div></>;

  return (
    <>
      <style>{css}</style>
      <div className="fs">
        <Link to="/faculty/dashboard" className="fs-back"><ChevronLeft size={15} /> Back to Dashboard</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
          <div>
            <h1>My Students</h1>
            <p className="fs-sub">{students.length} student{students.length !== 1 ? 's' : ''} across your courses this semester</p>
          </div>
          <Link to="/faculty/attendance" style={{ padding: '8px 16px', borderRadius: 9, background: 'rgba(52,211,153,.12)', color: '#34d399', textDecoration: 'none', fontSize: '.84rem', fontWeight: 600, border: '1px solid rgba(52,211,153,.2)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ClipboardList size={14} /> Take Attendance
          </Link>
        </div>

        <div className="fs-stats">
          {[
            { icon: Users, label: 'Total Students', value: students.length, bg: 'rgba(99,102,241,.18)', color: '#818cf8' },
            { icon: CheckCircle2, label: 'Good (≥85%)', value: good, bg: 'rgba(52,211,153,.15)', color: '#34d399' },
            { icon: AlertTriangle, label: 'Warning (75–84%)', value: warning, bg: 'rgba(251,191,36,.15)', color: '#fbbf24' },
            { icon: AlertTriangle, label: 'At Risk (<75%)', value: atRisk, bg: 'rgba(248,113,113,.15)', color: '#f87171' },
          ].map(({ icon: Icon, label, value, bg, color }) => (
            <div key={label} className="fs-stat">
              <div className="fs-stat-icon" style={{ background: bg }}><Icon size={18} color={color} /></div>
              <div><div className="fs-stat-val">{value}</div><div className="fs-stat-lbl">{label}</div></div>
            </div>
          ))}
        </div>

        <div className="fs-bar">
          <div className="fs-search">
            <Search size={14} color="#7880a8" />
            <input type="search" placeholder="Search by name, roll no., course…" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search students" />
          </div>
          {['All', 'good', 'warning', 'risk'].map(r => (
            <button key={r} className={`fs-pill${filterRisk === r ? ' fs-pill--active' : ''}`} onClick={() => setFilterRisk(r)}>
              {r === 'All' ? 'All' : r === 'good' ? '≥85% Good' : r === 'warning' ? '75–84% Warning' : '<75% At Risk'}
            </button>
          ))}
          <span style={{ fontSize: '.82rem', color: '#7880a8', marginLeft: 'auto' }}>{filtered.length} of {students.length}</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="👨‍🎓" title="No students found" description={search ? `No students match "${search}"` : 'No students match the current filter.'} />
        ) : (
          <div className="fs-table-wrap">
            <table className="fs-table" aria-label="Students list">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Attendance</th>
                  <th>Semester</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const risk = riskInfo(s.pct);
                  return (
                    <tr key={s.student_id} onClick={() => setSelected(s)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="fs-av">{initials(s.name)}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#eceefb', fontSize: '.9rem' }}>{s.name}</div>
                            <div style={{ fontSize: '.74rem', color: '#7880a8' }}>{s.roll_number}</div>
                          </div>
                        </div>
                      </td>
                      <td><span style={{ fontSize: '.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 5, background: 'rgba(99,102,241,.15)', color: '#818cf8' }}>{s.course_code}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div className="fs-mini-bar"><div className="fs-mini-fill" style={{ width: `${s.pct}%`, background: attColor(s.pct) }} /></div>
                          <span style={{ fontSize: '.82rem' }}>{s.pct}%</span>
                        </div>
                      </td>
                      <td style={{ color: '#7880a8', fontSize: '.83rem' }}>{s.semester ? `Sem ${s.semester}` : '—'}</td>
                      <td><span className={risk.cls}>{risk.label}</span></td>
                      <td onClick={e => e.stopPropagation()}>
                        <button style={{ padding: '5px 11px', borderRadius: 7, border: '1px solid rgba(255,255,255,.09)', background: 'transparent', color: '#7880a8', font: 'inherit', fontSize: '.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                          onClick={() => setSelected(s)}>
                          <ChevronRight size={13} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {selected && <StudentDrawer student={selected} onClose={() => setSelected(null)} />}
      </div>
    </>
  );
}
