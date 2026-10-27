/**
 * FacultyAttendance — /faculty/attendance
 * Students filtered by selected course, save persists locally.
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Save, RotateCcw, Users, History, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { facultyClasses, myStudents } from '../../data/mockFaculty.js';

const css = `
  .att { background:#0d1117; min-height:100vh; color:#c5caf0; font-family:inherit; padding:28px 32px; }
  .att h1 { font-size:1.4rem; font-weight:700; color:#eceefb; margin:0 0 4px; }
  .att-sub { font-size:.88rem; color:#7880a8; margin:0 0 22px; }
  .att-back { display:inline-flex; align-items:center; gap:6px; color:#7880a8; font-size:.83rem; text-decoration:none; margin-bottom:16px; transition:color .15s; }
  .att-back:hover { color:#818cf8; }
  .att-tabs { display:flex; gap:0; border-bottom:2px solid rgba(255,255,255,.07); margin-bottom:22px; }
  .att-tab { padding:10px 22px; border:0; background:none; font:inherit; font-size:.88rem; font-weight:500; color:#7880a8; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; transition:all .15s; display:flex; align-items:center; gap:7px; }
  .att-tab:hover { color:#c5caf0; }
  .att-tab--active { color:#818cf8; border-bottom-color:#818cf8; font-weight:700; }
  .att-sel { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:20px; margin-bottom:20px; }
  .att-sel label { font-size:.74rem; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:#7880a8; display:block; margin-bottom:6px; }
  .att-sel select { width:100%; padding:10px 14px; border-radius:10px; background:#0d1117; border:1.5px solid rgba(255,255,255,.1); color:#eceefb; font:inherit; font-size:.88rem; cursor:pointer; appearance:none; }
  .att-sel select:focus { outline:none; border-color:#4338ca; }
  .att-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
  .att-stat { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:12px; padding:14px 16px; display:flex; align-items:center; gap:12px; }
  .att-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
  .att-val { font-size:1.5rem; font-weight:800; line-height:1; }
  .att-lbl { font-size:.72rem; color:#7880a8; margin-top:2px; }
  .att-card { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:14px; overflow:hidden; }
  .att-card-head { padding:14px 20px; border-bottom:1px solid rgba(255,255,255,.06); display:flex; justify-content:space-between; align-items:center; background:#0f1320; }
  .att-card-head h2 { font-size:.92rem; font-weight:600; color:#eceefb; margin:0; }
  .att-table { width:100%; border-collapse:collapse; }
  .att-table th { text-align:left; padding:10px 20px; color:#7880a8; font-size:.7rem; font-weight:600; text-transform:uppercase; letter-spacing:.05em; border-bottom:1px solid rgba(255,255,255,.05); background:#0f1320; }
  .att-table td { padding:11px 20px; border-bottom:1px solid rgba(255,255,255,.04); vertical-align:middle; background:#161b2e; }
  .att-table tr:last-child td { border:0; }
  .att-table tr:hover td { background:#1a2035 !important; }
  .att-av { width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,#312e81,#4338ca); display:inline-grid; place-items:center; font-size:.76rem; font-weight:700; color:#fff; flex-shrink:0; }
  .att-sg { display:flex; gap:5px; }
  .att-sb { padding:5px 11px; border-radius:7px; border:1px solid rgba(255,255,255,.1); background:transparent; color:#7880a8; font:inherit; font-size:.74rem; font-weight:600; cursor:pointer; transition:all .15s; }
  .att-sb:hover { border-color:rgba(255,255,255,.25); color:#c5caf0; }
  .att-sb--P.att-sb--on { background:rgba(52,211,153,.18); border-color:#34d399; color:#34d399; }
  .att-sb--A.att-sb--on { background:rgba(248,113,113,.18); border-color:#f87171; color:#f87171; }
  .att-sb--L.att-sb--on { background:rgba(251,191,36,.18);  border-color:#fbbf24; color:#fbbf24; }
  .att-footer { display:flex; gap:10px; margin-top:18px; justify-content:flex-end; }
  .att-btn { display:inline-flex; align-items:center; gap:7px; padding:10px 22px; border-radius:10px; border:0; font:inherit; font-size:.9rem; font-weight:600; cursor:pointer; transition:all .18s; }
  .att-btn--primary { background:linear-gradient(135deg,#4338ca,#6366f1); color:#fff; }
  .att-btn--primary:hover { filter:brightness(1.1); transform:translateY(-1px); }
  .att-btn--ghost { background:rgba(255,255,255,.06); color:#c5caf0; border:1px solid rgba(255,255,255,.1); }
  .att-btn--ghost:hover { background:rgba(255,255,255,.1); }
  .att-saved-banner { background:rgba(52,211,153,.1); border:1px solid rgba(52,211,153,.25); border-radius:10px; padding:12px 16px; display:flex; align-items:center; gap:10px; font-size:.86rem; color:#34d399; margin-bottom:16px; }
  .att-hist-card { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:12px; padding:16px 18px; margin-bottom:10px; }
  .att-hist-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
  .att-hist-title { font-size:.9rem; font-weight:600; color:#eceefb; }
  .att-hist-meta  { font-size:.74rem; color:#7880a8; }
  .att-hist-pills { display:flex; gap:6px; flex-wrap:wrap; }
  .att-hist-pill  { font-size:.68rem; font-weight:700; padding:2px 8px; border-radius:5px; }
  .att-empty { text-align:center; padding:48px 20px; color:#7880a8; }
  @media(max-width:900px){.att-stats{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:640px){.att{padding:16px;}.att-sg{flex-wrap:wrap;}}
`;

const SUBJECT_MAP = {
  'Data Structures':      'Data Structures',
  'Algorithms':           'Algorithms',
  'Theory of Computation':'Theory of Comp.',
};

function initials(n) { return n.split(' ').map(p => p[0]).slice(0, 2).join(''); }

export default function FacultyAttendance() {
  const { notify } = useToast();
  const [activeTab,  setActiveTab]  = useState('take');
  const [courseIdx,  setCourseIdx]  = useState(0);
  const [savedSessions, setSavedSessions] = useState([]);

  const course = facultyClasses[courseIdx];

  // Filter students belonging to selected course
  const courseStudents = useMemo(() =>
    myStudents.filter(s => {
      const mapped = SUBJECT_MAP[course.subject] ?? course.subject;
      return s.subject === course.subject || s.subject === mapped;
    }),
    [course]
  );

  const [attendance, setAttendance] = useState(() =>
    Object.fromEntries(myStudents.map(s => [s.id, 'P']))
  );

  // Reset when course changes
  function changeCourse(idx) {
    setCourseIdx(idx);
    setAttendance(Object.fromEntries(myStudents.map(s => [s.id, 'P'])));
  }

  const studentsForCourse = courseStudents.length > 0 ? courseStudents : myStudents;
  const counts = studentsForCourse.reduce((acc, s) => {
    const v = attendance[s.id] ?? 'P';
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, { P: 0, A: 0, L: 0 });

  const mark  = (id, st) => setAttendance(p => ({ ...p, [id]: st }));
  const reset = () => setAttendance(Object.fromEntries(myStudents.map(s => [s.id, 'P'])));

  function save() {
    const session = {
      id:       Date.now(),
      subject:  course.subject,
      time:     course.time,
      date:     new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }),
      present:  counts.P,
      absent:   counts.A,
      late:     counts.L,
      total:    studentsForCourse.length,
      records:  studentsForCourse.map(s => ({ name: s.name, status: attendance[s.id] ?? 'P' })),
    };
    setSavedSessions(prev => [session, ...prev]);
    notify(`Attendance saved for ${course.subject} — ${counts.P}/${studentsForCourse.length} present`, 'success');
  }

  return (
    <>
      <style>{css}</style>
      <div className="att">
        <Link to="/faculty/classes" className="att-back"><ChevronLeft size={15} /> Back to Classes</Link>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10, marginBottom:18 }}>
          <div>
            <h1>Attendance</h1>
            <p className="att-sub">Mark and review student attendance</p>
          </div>
          <Link to="/faculty/students" style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:9, background:'rgba(99,102,241,.18)', color:'#818cf8', textDecoration:'none', fontSize:'.84rem', fontWeight:600, border:'1px solid rgba(99,102,241,.3)' }}>
            <Users size={14} /> Student Overview
          </Link>
        </div>

        {/* Tabs */}
        <div className="att-tabs">
          <button className={`att-tab${activeTab==='take'?' att-tab--active':''}`} onClick={() => setActiveTab('take')}>
            <CheckCircle2 size={14} /> Take Attendance
          </button>
          <button className={`att-tab${activeTab==='history'?' att-tab--active':''}`} onClick={() => setActiveTab('history')}>
            <History size={14} /> History ({savedSessions.length})
          </button>
        </div>

        {activeTab === 'take' && (
          <>
            {/* Course selector */}
            <div className="att-sel">
              <label>Select Course</label>
              <select value={courseIdx} onChange={e => changeCourse(Number(e.target.value))} aria-label="Select course">
                {facultyClasses.map((c, i) => (
                  <option key={c.id} value={i}>{c.subject} — {c.room} — {c.time}</option>
                ))}
              </select>
            </div>

            {/* Stats */}
            <div className="att-stats">
              {[['P','Present','#34d399'],['A','Absent','#f87171'],['L','Late','#fbbf24']].map(([k,lbl,col]) => (
                <div key={k} className="att-stat">
                  <div className="att-dot" style={{ background:col }} />
                  <div><div className="att-val" style={{ color:col }}>{counts[k]||0}</div><div className="att-lbl">{lbl}</div></div>
                </div>
              ))}
              <div className="att-stat">
                <div className="att-dot" style={{ background:'#818cf8' }} />
                <div><div className="att-val" style={{ color:'#818cf8' }}>{studentsForCourse.length}</div><div className="att-lbl">Total</div></div>
              </div>
            </div>

            {/* Roster */}
            <div className="att-card">
              <div className="att-card-head">
                <h2>{course.subject} — {course.time}</h2>
                <span style={{ fontSize:'.78rem', color:'#7880a8' }}>{studentsForCourse.length} students</span>
              </div>
              {studentsForCourse.length === 0 ? (
                <div className="att-empty"><p>No students found for this course.</p></div>
              ) : (
                <table className="att-table">
                  <thead><tr><th>Student</th><th>ID</th><th>Status</th></tr></thead>
                  <tbody>
                    {studentsForCourse.map(s => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div className="att-av">{initials(s.name)}</div>
                            <span style={{ color:'#eceefb', fontWeight:500 }}>{s.name}</span>
                          </div>
                        </td>
                        <td style={{ color:'#7880a8', fontSize:'.78rem' }}>{s.id}</td>
                        <td>
                          <div className="att-sg">
                            {['P','A','L'].map(st => (
                              <button
                                key={st}
                                className={`att-sb att-sb--${st}${(attendance[s.id]??'P')===st?' att-sb--on':''}`}
                                onClick={() => mark(s.id, st)}
                              >
                                {st==='P'?'Present':st==='A'?'Absent':'Late'}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="att-footer">
              <button className="att-btn att-btn--ghost" onClick={reset}><RotateCcw size={14} /> Reset</button>
              <button className="att-btn att-btn--primary" onClick={save}><Save size={14} /> Save Attendance</button>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div>
            {savedSessions.length === 0 ? (
              <div className="att-empty">
                <History size={40} color="rgba(255,255,255,.1)" />
                <p>No saved sessions yet. Mark and save attendance first.</p>
              </div>
            ) : savedSessions.map(s => (
              <div key={s.id} className="att-hist-card">
                <div className="att-hist-head">
                  <div>
                    <p className="att-hist-title">{s.subject}</p>
                    <p className="att-hist-meta">{s.date} · {s.time}</p>
                  </div>
                  <div className="att-hist-pills">
                    <span className="att-hist-pill" style={{ background:'rgba(52,211,153,.13)', color:'#34d399' }}>{s.present} Present</span>
                    {s.absent > 0 && <span className="att-hist-pill" style={{ background:'rgba(248,113,113,.13)', color:'#f87171' }}>{s.absent} Absent</span>}
                    {s.late   > 0 && <span className="att-hist-pill" style={{ background:'rgba(251,191,36,.13)',  color:'#fbbf24' }}>{s.late} Late</span>}
                    <span className="att-hist-pill" style={{ background:'rgba(255,255,255,.06)', color:'#7880a8' }}>{s.total} Total</span>
                  </div>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:8 }}>
                  {s.records.map((r, i) => (
                    <div key={i} style={{ fontSize:'.76rem', padding:'2px 8px', borderRadius:5, background: r.status==='P'?'rgba(52,211,153,.1)':r.status==='A'?'rgba(248,113,113,.1)':'rgba(251,191,36,.1)', color: r.status==='P'?'#34d399':r.status==='A'?'#f87171':'#fbbf24' }}>
                      {r.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
