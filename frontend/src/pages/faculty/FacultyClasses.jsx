/**
 * FacultyClasses — /faculty/classes
 * Real API: /faculty/courses + /faculty/courses/:id/students
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Users, ChevronLeft, Search, X,
  ClipboardList, FileText, ChevronRight, Layers,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import { getFacultyCourses, getCourseStudents } from '../../services/facultyService.js';

const css = `
  .fc{background:#0d1117;min-height:100vh;color:#c5caf0;font-family:inherit;padding:28px 32px;}
  .fc h1{font-size:1.4rem;font-weight:700;color:#eceefb;margin:0 0 4px;}
  .fc-sub{font-size:.88rem;color:#7880a8;margin:0 0 20px;}
  .fc-back{display:inline-flex;align-items:center;gap:6px;color:#7880a8;font-size:.83rem;text-decoration:none;margin-bottom:16px;transition:color .15s;}
  .fc-back:hover{color:#818cf8;}
  .fc-bar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:20px;}
  .fc-search{display:flex;align-items:center;gap:8px;background:#161b2e;border:1.5px solid rgba(255,255,255,.08);border-radius:10px;padding:0 12px;flex:1;min-width:180px;max-width:320px;transition:border-color .18s;}
  .fc-search:focus-within{border-color:#4338ca;}
  .fc-search input{border:0;background:none;min-height:38px;font:inherit;color:#eceefb;width:100%;outline:none;font-size:.88rem;}
  .fc-search input::placeholder{color:#7880a8;}
  .fc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;}
  .fc-card{background:#161b2e;border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:20px;cursor:pointer;transition:transform .18s,box-shadow .18s,border-color .18s;display:flex;flex-direction:column;gap:14px;position:relative;overflow:hidden;}
  .fc-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--accent,linear-gradient(90deg,#4338ca,#818cf8));border-radius:14px 14px 0 0;}
  .fc-card:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,.5);border-color:rgba(99,102,241,.3);}
  .fc-code{font-size:.75rem;font-weight:700;padding:3px 10px;border-radius:6px;background:rgba(99,102,241,.18);color:#818cf8;display:inline-block;}
  .fc-name{font-size:1rem;font-weight:700;color:#eceefb;margin:4px 0 0;}
  .fc-meta{display:grid;gap:7px;}
  .fc-meta-row{display:flex;align-items:center;gap:8px;font-size:.8rem;color:#7880a8;}
  .fc-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9990;backdrop-filter:blur(3px);}
  .fc-drawer{position:fixed;right:0;top:0;bottom:0;width:min(600px,100vw);background:#0f1320;border-left:1px solid rgba(255,255,255,.08);z-index:9991;overflow-y:auto;display:flex;flex-direction:column;animation:fcSI .22s cubic-bezier(.34,1.1,.64,1);}
  @keyframes fcSI{from{transform:translateX(100%);opacity:0;}to{transform:none;opacity:1;}}
  .fc-dhead{padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;justify-content:space-between;align-items:flex-start;gap:12px;position:sticky;top:0;background:#0f1320;z-index:2;}
  .fc-dbody{padding:22px 24px;display:grid;gap:16px;}
  .fc-close{border:0;background:rgba(255,255,255,.06);color:#7880a8;border-radius:8px;width:34px;height:34px;cursor:pointer;display:grid;place-items:center;transition:background .15s,color .15s;flex-shrink:0;}
  .fc-close:hover{background:rgba(255,255,255,.12);color:#eceefb;}
  .fc-dcard{background:#161b2e;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:16px 18px;}
  .fc-dcard h3{font-size:.86rem;font-weight:600;color:#eceefb;margin:0 0 12px;display:flex;align-items:center;gap:8px;}
  .fc-stu-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.04);}
  .fc-stu-row:last-child{border:0;}
  .fc-av{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#4338ca,#818cf8);display:inline-grid;place-items:center;font-size:.7rem;font-weight:700;color:#fff;flex-shrink:0;}
  .fc-minibar{height:4px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;width:50px;display:inline-block;vertical-align:middle;margin-right:4px;}
  .fc-minifill{height:100%;border-radius:99px;}
  @media(max-width:480px){.fc{padding:16px;}.fc-grid{grid-template-columns:1fr;}}
`;

const ACCENTS = [
  'linear-gradient(90deg,#4338ca,#818cf8)',
  'linear-gradient(90deg,#0ea5e9,#22d3ee)',
  'linear-gradient(90deg,#059669,#34d399)',
  'linear-gradient(90deg,#7c3aed,#c4b5fd)',
  'linear-gradient(90deg,#f59e0b,#fbbf24)',
];

function attColor(pct) {
  if (pct >= 85) return 'linear-gradient(90deg,#059669,#34d399)';
  if (pct >= 75) return 'linear-gradient(90deg,#d97706,#fbbf24)';
  return 'linear-gradient(90deg,#dc2626,#f87171)';
}
function initials(n) { return n.split(' ').map(p => p[0]).slice(0, 2).join(''); }

function CourseDrawer({ course, onClose }) {
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCourseStudents(course.id)
      .then(setStudents)
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, [course.id]);

  return (
    <>
      <div className="fc-overlay" onClick={onClose} aria-hidden="true" />
      <aside className="fc-drawer" role="dialog" aria-modal="true" aria-label={course.course_name || course.name}>
        <div className="fc-dhead">
          <div>
            <span className="fc-code">{course.course_code || course.code}</span>
            <h2 style={{ margin: '6px 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#eceefb' }}>
              {course.course_name || course.name}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '.78rem', color: '#7880a8' }}>
              {course.credits} credits · {course.enrolled_count} enrolled
            </p>
          </div>
          <button className="fc-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <div className="fc-dbody">
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { label: 'Enrolled', value: course.enrolled_count, color: '#818cf8' },
              { label: 'Sessions/wk', value: course.session_count, color: '#22d3ee' },
              { label: 'Credits', value: course.credits, color: '#34d399' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: '#0d1117', borderRadius: 10, padding: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,.06)' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '.7rem', color: '#7880a8', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Students */}
          <div className="fc-dcard">
            <h3><Users size={14} color="#22d3ee" /> Enrolled Students</h3>
            {loading ? (
              <p style={{ color: '#7880a8', fontSize: '.83rem', textAlign: 'center', padding: '12px 0' }}>Loading…</p>
            ) : students && students.length > 0 ? (
              <div>
                {students.map((s) => {
                  const pct = s.total_attendance > 0
                    ? Math.round((s.present_count / s.total_attendance) * 100)
                    : 0;
                  return (
                    <div key={s.student_id} className="fc-stu-row">
                      <div className="fc-av">{initials(s.name)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#eceefb', fontSize: '.85rem' }}>{s.name}</div>
                        <div style={{ fontSize: '.72rem', color: '#7880a8' }}>{s.roll_number}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.78rem' }}>
                        <div className="fc-minibar">
                          <div className="fc-minifill" style={{ width: `${pct}%`, background: attColor(pct) }} />
                        </div>
                        <span style={{ color: pct >= 75 ? '#34d399' : '#f87171' }}>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: '#7880a8', fontSize: '.83rem', textAlign: 'center', padding: '8px 0' }}>No students enrolled yet.</p>
            )}
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/faculty/attendance" onClick={onClose}
              style={{ flex: 1, minWidth: 130, padding: '11px 14px', borderRadius: 10, background: 'rgba(99,102,241,.18)', color: '#818cf8', textDecoration: 'none', fontSize: '.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: '1px solid rgba(99,102,241,.3)' }}>
              <ClipboardList size={14} /> Take Attendance
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

export default function FacultyClasses() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const { data, loading, error, refetch } = useApi(getFacultyCourses);

  const courses = data?.courses ?? [];
  const filtered = courses.filter(c =>
    `${c.code} ${c.name}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <><style>{css}</style><div className="fc"><LoadingSpinner message="Loading courses…" /></div></>;
  if (error)   return <><style>{css}</style><div className="fc"><ErrorState error={error} onRetry={refetch} /></div></>;

  return (
    <>
      <style>{css}</style>
      <div className="fc">
        <Link to="/faculty/dashboard" className="fc-back"><ChevronLeft size={15} /> Back to Dashboard</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <h1>My Classes</h1>
            <p className="fc-sub">{courses.length} course{courses.length !== 1 ? 's' : ''} this semester — click a card for details</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/faculty/assignments" style={{ padding: '8px 16px', borderRadius: 9, background: 'rgba(99,102,241,.18)', color: '#818cf8', textDecoration: 'none', fontSize: '.84rem', fontWeight: 600, border: '1px solid rgba(99,102,241,.25)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={14} /> Assignments
            </Link>
            <Link to="/faculty/attendance" style={{ padding: '8px 16px', borderRadius: 9, background: 'rgba(52,211,153,.12)', color: '#34d399', textDecoration: 'none', fontSize: '.84rem', fontWeight: 600, border: '1px solid rgba(52,211,153,.2)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ClipboardList size={14} /> Attendance
            </Link>
          </div>
        </div>

        <div className="fc-bar">
          <div className="fc-search">
            <Search size={14} color="#7880a8" />
            <input type="search" placeholder="Search courses…" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search courses" />
          </div>
          <span style={{ fontSize: '.82rem', color: '#7880a8' }}>{filtered.length} of {courses.length}</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="📚" title="No courses found" description={search ? `No courses match "${search}"` : 'No courses assigned this semester.'} />
        ) : (
          <div className="fc-grid">
            {filtered.map((c, i) => (
              <article
                key={c.id}
                className="fc-card"
                style={{ '--accent': ACCENTS[i % ACCENTS.length] }}
                onClick={() => setSelected(c)}
                role="button"
                tabIndex={0}
                aria-label={`Open ${c.name} details`}
                onKeyDown={e => e.key === 'Enter' && setSelected(c)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="fc-code">{c.code}</span>
                    <p className="fc-name">{c.name}</p>
                  </div>
                  <span style={{ fontSize: '.72rem', fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: 'rgba(52,211,153,.13)', color: '#34d399' }}>
                    {c.credits} cr
                  </span>
                </div>
                <div className="fc-meta">
                  <div className="fc-meta-row"><Users size={13} />{c.enrolled_count} students enrolled</div>
                  <div className="fc-meta-row"><Layers size={13} />{c.session_count} session{c.session_count !== 1 ? 's' : ''} per week</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4, borderTop: '1px solid rgba(255,255,255,.05)' }}>
                  <span style={{ fontSize: '.78rem', color: '#818cf8' }}>View details</span>
                  <ChevronRight size={15} color="#555a7a" />
                </div>
              </article>
            ))}
          </div>
        )}

        {selected && <CourseDrawer course={selected} onClose={() => setSelected(null)} />}
      </div>
    </>
  );
}
