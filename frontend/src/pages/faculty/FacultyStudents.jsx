/**
 * FacultyStudents — /faculty/students
 * Directory of all students across faculty's courses with search, filter, and detail drawer.
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ChevronLeft, X, Mail, BookOpen,
  GraduationCap, AlertTriangle, CheckCircle2,
  ClipboardList, FileText, Users, TrendingUp, ChevronRight,
} from 'lucide-react';
import { myStudents } from '../../data/mockFaculty.js';

const css = `
  .fs { background:#0d1117; min-height:100vh; color:#c5caf0; font-family:inherit; padding:28px 32px; }
  .fs h1 { font-size:1.4rem; font-weight:700; color:#eceefb; margin:0 0 4px; }
  .fs-sub { font-size:.88rem; color:#7880a8; margin:0; }
  .fs-back { display:inline-flex; align-items:center; gap:6px; color:#7880a8; font-size:.83rem; text-decoration:none; margin-bottom:16px; transition:color .15s; }
  .fs-back:hover { color:#818cf8; }
  .fs-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
  .fs-stat { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:12px; padding:16px 18px; display:flex; align-items:center; gap:14px; }
  .fs-stat-icon { width:38px; height:38px; border-radius:10px; display:grid; place-items:center; flex-shrink:0; }
  .fs-stat-val { font-size:1.5rem; font-weight:800; color:#eceefb; line-height:1; }
  .fs-stat-lbl { font-size:.72rem; color:#7880a8; margin-top:3px; }
  .fs-bar { display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-bottom:18px; }
  .fs-search { display:flex; align-items:center; gap:8px; background:#161b2e; border:1.5px solid rgba(255,255,255,.08); border-radius:10px; padding:0 12px; flex:1; min-width:200px; max-width:360px; transition:border-color .18s; }
  .fs-search:focus-within { border-color:#4338ca; }
  .fs-search input { border:0; background:none; min-height:40px; font:inherit; color:#eceefb; width:100%; outline:none; font-size:.88rem; }
  .fs-search input::placeholder { color:#7880a8; }
  .fs-pill { padding:7px 14px; border-radius:8px; border:1px solid rgba(255,255,255,.08); background:#161b2e; color:#7880a8; font:inherit; font-size:.8rem; cursor:pointer; transition:all .15s; white-space:nowrap; }
  .fs-pill:hover { border-color:#4338ca; color:#818cf8; }
  .fs-pill--active { border-color:#4338ca; color:#818cf8; background:rgba(99,102,241,.12); }
  .fs-table-wrap { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:14px; overflow:hidden; }
  .fs-table { width:100%; border-collapse:collapse; }
  .fs-table th { text-align:left; padding:11px 16px; color:#7880a8; font-size:.7rem; font-weight:600; text-transform:uppercase; letter-spacing:.05em; border-bottom:1px solid rgba(255,255,255,.06); background:#0f1320; }
  .fs-table td { padding:13px 16px; border-bottom:1px solid rgba(255,255,255,.04); vertical-align:middle; background:#161b2e; }
  .fs-table tr:last-child td { border:0; }
  .fs-table tr:hover td { background:#1a2035 !important; cursor:pointer; }
  .fs-av { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#4338ca,#818cf8); display:inline-grid; place-items:center; font-size:.76rem; font-weight:700; color:#fff; flex-shrink:0; }
  .fs-name { font-weight:600; color:#eceefb; font-size:.9rem; }
  .fs-id { font-size:.74rem; color:#7880a8; margin-top:1px; }
  .fs-subject-tag { font-size:.72rem; font-weight:600; padding:2px 8px; border-radius:5px; background:rgba(99,102,241,.15); color:#818cf8; }
  .fs-grade-badge { font-size:.72rem; font-weight:700; padding:2px 9px; border-radius:6px; }
  .fs-grade-a { background:rgba(52,211,153,.15); color:#34d399; }
  .fs-grade-b { background:rgba(96,165,250,.15); color:#60a5fa; }
  .fs-grade-c { background:rgba(251,191,36,.15); color:#fbbf24; }
  .fs-risk-badge { font-size:.7rem; font-weight:700; padding:2px 8px; border-radius:6px; white-space:nowrap; }
  .fs-risk-good { background:rgba(52,211,153,.13); color:#34d399; }
  .fs-risk-warn { background:rgba(251,191,36,.13); color:#fbbf24; }
  .fs-risk-bad  { background:rgba(248,113,113,.13); color:#f87171; }
  .fs-mini-bar { height:4px; background:rgba(255,255,255,.06); border-radius:99px; overflow:hidden; width:56px; display:inline-block; vertical-align:middle; margin-right:5px; }
  .fs-mini-fill { height:100%; border-radius:99px; }
  .fs-action-btn { padding:5px 11px; border-radius:7px; border:1px solid rgba(255,255,255,.09); background:transparent; color:#7880a8; font:inherit; font-size:.75rem; cursor:pointer; transition:all .15s; display:inline-flex; align-items:center; gap:5px; }
  .fs-action-btn:hover { border-color:#818cf8; color:#818cf8; background:rgba(99,102,241,.1); }
  .fs-empty { padding:56px; text-align:center; color:#7880a8; }
  .fs-empty p { margin-top:10px; font-size:.88rem; }
  .fs-overlay { position:fixed; inset:0; background:rgba(0,0,0,.65); z-index:9990; backdrop-filter:blur(3px); }
  .fs-drawer { position:fixed; right:0; top:0; bottom:0; width:min(580px,100vw); background:#0f1320; border-left:1px solid rgba(255,255,255,.08); z-index:9991; overflow-y:auto; display:flex; flex-direction:column; animation:fsSI .22s cubic-bezier(.34,1.1,.64,1); }
  @keyframes fsSI { from{transform:translateX(100%);opacity:0;}to{transform:none;opacity:1;} }
  .fs-drawer-head { padding:20px 24px; border-bottom:1px solid rgba(255,255,255,.07); display:flex; justify-content:space-between; align-items:flex-start; gap:12px; position:sticky; top:0; background:#0f1320; z-index:2; }
  .fs-drawer-body { padding:22px 24px; display:grid; gap:16px; }
  .fs-close { border:0; background:rgba(255,255,255,.06); color:#7880a8; border-radius:8px; width:34px; height:34px; cursor:pointer; display:grid; place-items:center; transition:background .15s,color .15s; flex-shrink:0; }
  .fs-close:hover { background:rgba(255,255,255,.12); color:#eceefb; }
  .fs-d-card { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:12px; padding:18px; }
  .fs-d-card h3 { font-size:.88rem; font-weight:600; color:#eceefb; margin:0 0 12px; display:flex; align-items:center; gap:8px; }
  .fs-d-stat-row { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .fs-d-stat { background:#0d1117; border-radius:9px; padding:12px; text-align:center; }
  .fs-d-stat__val { font-size:1.3rem; font-weight:800; color:#eceefb; line-height:1; }
  .fs-d-stat__lbl { font-size:.7rem; color:#7880a8; margin-top:4px; }
  @media(max-width:1024px){.fs-stats{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:768px){.fs{padding:16px;}.fs-stats{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:480px){.fs-stats{grid-template-columns:1fr 1fr;}}
`;

function initials(name) { return name.split(' ').map(p=>p[0]).slice(0,2).join(''); }
function gradeClass(g) {
  if (!g) return 'fs-grade-badge fs-grade-b';
  if (g.startsWith('A')) return 'fs-grade-badge fs-grade-a';
  if (g.startsWith('B')) return 'fs-grade-badge fs-grade-b';
  return 'fs-grade-badge fs-grade-c';
}
function riskInfo(att) {
  if (att >= 85) return { cls:'fs-risk-badge fs-risk-good', label:'Good' };
  if (att >= 75) return { cls:'fs-risk-badge fs-risk-warn', label:'Warning' };
  return { cls:'fs-risk-badge fs-risk-bad', label:'At Risk' };
}
function attColor(att) {
  if (att >= 85) return 'linear-gradient(90deg,#059669,#34d399)';
  if (att >= 75) return 'linear-gradient(90deg,#d97706,#fbbf24)';
  return 'linear-gradient(90deg,#dc2626,#f87171)';
}

function StudentDrawer({ student, onClose }) {
  return (
    <>
      <div className="fs-overlay" onClick={onClose} aria-hidden="true" />
      <aside className="fs-drawer" role="dialog" aria-modal="true">
        <div className="fs-drawer-head">
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div className="fs-av" style={{ width:48, height:48, fontSize:'.9rem' }}>{initials(student.name)}</div>
            <div>
              <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700, color:'#eceefb' }}>{student.name}</h2>
              <p style={{ margin:'3px 0 0', fontSize:'.78rem', color:'#7880a8' }}>{student.id}</p>
            </div>
          </div>
          <button className="fs-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div className="fs-drawer-body">
          <div className="fs-d-stat-row">
            <div className="fs-d-stat">
              <div className="fs-d-stat__val" style={{ color: student.attendance >= 85 ? '#34d399' : student.attendance >= 75 ? '#fbbf24' : '#f87171' }}>{student.attendance}%</div>
              <div className="fs-d-stat__lbl">Attendance</div>
            </div>
            <div className="fs-d-stat">
              <div className="fs-d-stat__val">{student.grade}</div>
              <div className="fs-d-stat__lbl">Grade</div>
            </div>
            <div className="fs-d-stat">
              <div className="fs-d-stat__val" style={{ color: riskInfo(student.attendance).cls.includes('good') ? '#34d399' : riskInfo(student.attendance).cls.includes('warn') ? '#fbbf24' : '#f87171', fontSize:'.9rem' }}>
                {riskInfo(student.attendance).label}
              </div>
              <div className="fs-d-stat__lbl">Status</div>
            </div>
          </div>
          <div className="fs-d-card">
            <h3><BookOpen size={15} color="#818cf8" /> Enrolled Course</h3>
            <div style={{ background:'#0d1117', borderRadius:9, padding:'12px 14px' }}>
              <div style={{ fontWeight:600, color:'#eceefb', fontSize:'.88rem' }}>{student.subject}</div>
              <div style={{ fontSize:'.76rem', color:'#7880a8', marginTop:4 }}>
                Attendance: {student.attendance}%
                <span style={{ marginLeft:8 }}>·</span>
                <span style={{ marginLeft:8 }}>Grade: {student.grade}</span>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <Link to="/faculty/attendance" style={{ flex:1, minWidth:130, padding:'11px 14px', borderRadius:10, background:'rgba(52,211,153,.13)', color:'#34d399', textDecoration:'none', fontSize:'.85rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:7, border:'1px solid rgba(52,211,153,.25)' }}>
              <ClipboardList size={14} /> Attendance
            </Link>
            <Link to="/faculty/assignments" style={{ flex:1, minWidth:130, padding:'11px 14px', borderRadius:10, background:'rgba(251,191,36,.12)', color:'#fbbf24', textDecoration:'none', fontSize:'.85rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:7, border:'1px solid rgba(251,191,36,.25)' }}>
              <FileText size={14} /> Assignments
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function FacultyStudents() {
  const [search,     setSearch]     = useState('');
  const [filterRisk, setFilterRisk] = useState('All');
  const [selected,   setSelected]   = useState(null);

  const filtered = useMemo(() => myStudents.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.subject.toLowerCase().includes(q);
    let matchR = true;
    if (filterRisk === 'good')    matchR = s.attendance >= 85;
    if (filterRisk === 'warning') matchR = s.attendance >= 75 && s.attendance < 85;
    if (filterRisk === 'risk')    matchR = s.attendance < 75;
    return matchQ && matchR;
  }), [search, filterRisk]);

  const atRisk   = myStudents.filter(s => s.attendance < 75).length;
  const warning  = myStudents.filter(s => s.attendance >= 75 && s.attendance < 85).length;
  const good     = myStudents.filter(s => s.attendance >= 85).length;

  return (
    <>
      <style>{css}</style>
      <div className="fs">
        <Link to="/faculty/dashboard" className="fs-back"><ChevronLeft size={15} /> Back to Dashboard</Link>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:22 }}>
          <div>
            <h1>My Students</h1>
            <p className="fs-sub">{myStudents.length} students across your courses this semester</p>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <Link to="/faculty/attendance" style={{ padding:'8px 16px', borderRadius:9, background:'rgba(52,211,153,.12)', color:'#34d399', textDecoration:'none', fontSize:'.84rem', fontWeight:600, border:'1px solid rgba(52,211,153,.2)', display:'flex', alignItems:'center', gap:6 }}>
              <ClipboardList size={14} /> Take Attendance
            </Link>
          </div>
        </div>

        <div className="fs-stats">
          <div className="fs-stat">
            <div className="fs-stat-icon" style={{ background:'rgba(99,102,241,.18)' }}><Users size={18} color="#818cf8" /></div>
            <div><div className="fs-stat-val">{myStudents.length}</div><div className="fs-stat-lbl">Total Students</div></div>
          </div>
          <div className="fs-stat">
            <div className="fs-stat-icon" style={{ background:'rgba(52,211,153,.15)' }}><CheckCircle2 size={18} color="#34d399" /></div>
            <div><div className="fs-stat-val">{good}</div><div className="fs-stat-lbl">Good (≥85%)</div></div>
          </div>
          <div className="fs-stat">
            <div className="fs-stat-icon" style={{ background:'rgba(251,191,36,.15)' }}><AlertTriangle size={18} color="#fbbf24" /></div>
            <div><div className="fs-stat-val">{warning}</div><div className="fs-stat-lbl">Warning (&lt;85%)</div></div>
          </div>
          <div className="fs-stat">
            <div className="fs-stat-icon" style={{ background:'rgba(248,113,113,.15)' }}><AlertTriangle size={18} color="#f87171" /></div>
            <div><div className="fs-stat-val">{atRisk}</div><div className="fs-stat-lbl">At Risk (&lt;75%)</div></div>
          </div>
        </div>

        <div className="fs-bar">
          <div className="fs-search">
            <Search size={14} color="#7880a8" />
            <input type="search" placeholder="Search by name, ID or subject…" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search students" />
          </div>
          {['All','good','warning','risk'].map(r => (
            <button key={r} className={`fs-pill${filterRisk===r?' fs-pill--active':''}`} onClick={() => setFilterRisk(r)}>
              {r==='All'?'All':r==='good'?'≥85% Good':r==='warning'?'75–84% Warning':'<75% At Risk'}
            </button>
          ))}
          <span style={{ fontSize:'.82rem', color:'#7880a8', marginLeft:'auto' }}>{filtered.length} of {myStudents.length}</span>
        </div>

        <div className="fs-table-wrap">
          {filtered.length > 0 ? (
            <table className="fs-table" aria-label="Students list">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Attendance</th>
                  <th>Grade</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const risk = riskInfo(s.attendance);
                  return (
                    <tr key={s.id} onClick={() => setSelected(s)}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div className="fs-av">{initials(s.name)}</div>
                          <div><div className="fs-name">{s.name}</div><div className="fs-id">{s.id}</div></div>
                        </div>
                      </td>
                      <td><span className="fs-subject-tag">{s.subject}</span></td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <div className="fs-mini-bar"><div className="fs-mini-fill" style={{ width:`${s.attendance}%`, background:attColor(s.attendance) }} /></div>
                          <span style={{ fontSize:'.82rem' }}>{s.attendance}%</span>
                        </div>
                      </td>
                      <td><span className={gradeClass(s.grade)}>{s.grade}</span></td>
                      <td><span className={risk.cls}>{risk.label}</span></td>
                      <td onClick={e => e.stopPropagation()}>
                        <button className="fs-action-btn" onClick={() => setSelected(s)}><ChevronRight size={13} /> View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="fs-empty">
              <GraduationCap size={42} color="rgba(255,255,255,.1)" />
              <p>{search ? `No students match "${search}".` : 'No students match the current filters.'}</p>
            </div>
          )}
        </div>

        {selected && <StudentDrawer student={selected} onClose={() => setSelected(null)} />}
      </div>
    </>
  );
}
