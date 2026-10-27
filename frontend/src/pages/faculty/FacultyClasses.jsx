/**
 * FacultyClasses — /faculty/classes
 * Cards with a slide-in detail drawer showing students, actions.
 */
import { useState } from 'react';
import { BookOpen, Users, Clock, MapPin, Search, FileText, BarChart2, X, ClipboardList, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { facultyClasses, myStudents } from '../../data/mockFaculty.js';

const css = `
  .fc { background:#0d1117; min-height:100vh; color:#c5caf0; font-family:inherit; padding:28px 32px; }
  .fc h1 { font-size:1.4rem; font-weight:700; color:#eceefb; margin:0 0 4px; }
  .fc .sub { font-size:.88rem; color:#7880a8; margin:0 0 22px; }
  .fc-bar { display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-bottom:22px; }
  .fc-search { display:flex; align-items:center; gap:8px; background:#161b2e; border:1.5px solid rgba(255,255,255,.08); border-radius:10px; padding:0 12px; flex:1; min-width:180px; max-width:320px; transition:border-color .18s; }
  .fc-search:focus-within { border-color:#4338ca; }
  .fc-search input { border:0; background:none; min-height:38px; font:inherit; color:#eceefb; width:100%; outline:none; font-size:.88rem; }
  .fc-search input::placeholder { color:#7880a8; }
  .fc-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
  .fc-card { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:20px; cursor:pointer; transition:transform .18s,box-shadow .18s,border-color .18s; display:flex; flex-direction:column; gap:14px; position:relative; overflow:hidden; }
  .fc-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--cc-accent,linear-gradient(90deg,#4338ca,#818cf8)); border-radius:14px 14px 0 0; }
  .fc-card:hover { transform:translateY(-3px); box-shadow:0 12px 40px rgba(0,0,0,.5); border-color:rgba(99,102,241,.3); }
  .fc-code { font-size:.75rem; font-weight:700; padding:3px 10px; border-radius:6px; background:rgba(99,102,241,.18); color:#818cf8; display:inline-block; }
  .fc-name { font-size:1rem; font-weight:700; color:#eceefb; margin:6px 0 2px; }
  .fc-meta { display:grid; gap:7px; }
  .fc-meta-row { display:flex; align-items:center; gap:8px; font-size:.79rem; color:#7880a8; }
  .status-badge { font-size:.72rem; font-weight:700; padding:3px 9px; border-radius:6px; }
  .status-completed { background:rgba(52,211,153,.13); color:#34d399; }
  .status-progress  { background:rgba(251,191,36,.13); color:#fbbf24; }
  .status-upcoming  { background:rgba(99,102,241,.13); color:#818cf8; }
  .fc-att-bar { height:4px; background:rgba(255,255,255,.06); border-radius:99px; overflow:hidden; margin-top:4px; }
  .fc-att-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,#4338ca,#818cf8); }
  .fc-empty { text-align:center; padding:48px 20px; color:#7880a8; }

  /* Drawer */
  .fc-overlay { position:fixed; inset:0; background:rgba(0,0,0,.65); z-index:9990; backdrop-filter:blur(3px); }
  .fc-drawer { position:fixed; right:0; top:0; bottom:0; width:min(600px,100vw); background:#0f1320; border-left:1px solid rgba(255,255,255,.08); z-index:9991; overflow-y:auto; display:flex; flex-direction:column; animation:fcSI .22s cubic-bezier(.34,1.1,.64,1); }
  @keyframes fcSI { from{transform:translateX(100%);opacity:0;}to{transform:none;opacity:1;} }
  .fc-drawer-head { padding:20px 24px; border-bottom:1px solid rgba(255,255,255,.07); display:flex; justify-content:space-between; align-items:flex-start; gap:12px; position:sticky; top:0; background:#0f1320; z-index:2; }
  .fc-drawer-body { padding:22px 24px; display:grid; gap:16px; }
  .fc-close { border:0; background:rgba(255,255,255,.06); color:#7880a8; border-radius:8px; width:34px; height:34px; cursor:pointer; display:grid; place-items:center; transition:background .15s,color .15s; flex-shrink:0; }
  .fc-close:hover { background:rgba(255,255,255,.12); color:#eceefb; }
  .fc-d-card { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:12px; padding:16px 18px; }
  .fc-d-card h3 { font-size:.86rem; font-weight:600; color:#eceefb; margin:0 0 12px; display:flex; align-items:center; gap:8px; }
  .fc-d-stat-row { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .fc-d-stat { background:#0d1117; border-radius:9px; padding:12px; text-align:center; }
  .fc-d-stat__val { font-size:1.3rem; font-weight:800; color:#eceefb; line-height:1; }
  .fc-d-stat__lbl { font-size:.7rem; color:#7880a8; margin-top:4px; }
  .fc-d-table { width:100%; border-collapse:collapse; font-size:.83rem; }
  .fc-d-table th { text-align:left; padding:7px 8px; color:#7880a8; font-size:.68rem; font-weight:600; text-transform:uppercase; letter-spacing:.04em; border-bottom:1px solid rgba(255,255,255,.07); }
  .fc-d-table td { padding:9px 8px; border-bottom:1px solid rgba(255,255,255,.04); color:#c5caf0; vertical-align:middle; background:#161b2e; }
  .fc-d-table tr:last-child td { border:0; }
  .fc-d-table tr:hover td { background:#1a2035 !important; }
  .fc-av { width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,#4338ca,#818cf8); display:inline-grid; place-items:center; font-size:.68rem; font-weight:700; color:#fff; flex-shrink:0; }
  .fc-grade-a { background:rgba(52,211,153,.13); color:#34d399; font-size:.7rem; font-weight:700; padding:2px 7px; border-radius:5px; }
  .fc-grade-b { background:rgba(96,165,250,.13); color:#60a5fa; font-size:.7rem; font-weight:700; padding:2px 7px; border-radius:5px; }
  .fc-grade-c { background:rgba(251,191,36,.13);  color:#fbbf24; font-size:.7rem; font-weight:700; padding:2px 7px; border-radius:5px; }
  .fc-mini-bar { height:4px; background:rgba(255,255,255,.06); border-radius:99px; overflow:hidden; width:48px; display:inline-block; vertical-align:middle; margin-right:5px; }
  .fc-mini-fill { height:100%; border-radius:99px; }

  @media(max-width:480px){.fc-grid{grid-template-columns:1fr;}.fc{padding:16px;}}
`;

const ACCENTS = [
  'linear-gradient(90deg,#4338ca,#818cf8)',
  'linear-gradient(90deg,#0ea5e9,#22d3ee)',
  'linear-gradient(90deg,#059669,#34d399)',
  'linear-gradient(90deg,#7c3aed,#c4b5fd)',
];

const SUBJECT_MAP = {
  'Data Structures':      'Data Structures',
  'Algorithms':           'Algorithms',
  'Theory of Computation':'Theory of Comp.',
};

function statusClass(s) {
  if (s === 'Completed') return 'status-badge status-completed';
  if (s === 'In progress') return 'status-badge status-progress';
  return 'status-badge status-upcoming';
}

function attColor(att) {
  if (att >= 85) return 'linear-gradient(90deg,#059669,#34d399)';
  if (att >= 75) return 'linear-gradient(90deg,#d97706,#fbbf24)';
  return 'linear-gradient(90deg,#dc2626,#f87171)';
}

function gradeClass(g) {
  if (!g) return 'fc-grade-b';
  if (g.startsWith('A')) return 'fc-grade-a';
  if (g.startsWith('B')) return 'fc-grade-b';
  return 'fc-grade-c';
}

function initials(name) { return name.split(' ').map(p => p[0]).slice(0, 2).join(''); }

function ClassDrawer({ cls, onClose }) {
  const mapped = SUBJECT_MAP[cls.subject] ?? cls.subject;
  const students = myStudents.filter(s => s.subject === cls.subject || s.subject === mapped);
  const attPct = cls.enrolled > 0 ? Math.round((cls.present / cls.enrolled) * 100) : 0;

  return (
    <>
      <div className="fc-overlay" onClick={onClose} aria-hidden="true" />
      <aside className="fc-drawer" role="dialog" aria-modal="true">
        <div className="fc-drawer-head">
          <div>
            <span className="fc-code" style={{ marginBottom:6, display:'inline-block' }}>{cls.room}</span>
            <h2 style={{ margin:'4px 0 0', fontSize:'1.1rem', fontWeight:700, color:'#eceefb' }}>{cls.subject}</h2>
            <p style={{ margin:'4px 0 0', fontSize:'.78rem', color:'#7880a8' }}>{cls.time}</p>
          </div>
          <button className="fc-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <div className="fc-drawer-body">
          {/* Stats */}
          <div className="fc-d-stat-row">
            <div className="fc-d-stat">
              <div className="fc-d-stat__val">{cls.enrolled}</div>
              <div className="fc-d-stat__lbl">Enrolled</div>
            </div>
            <div className="fc-d-stat">
              <div className="fc-d-stat__val" style={{ color: cls.status==='Completed'?'#34d399':cls.status==='In progress'?'#fbbf24':'#818cf8' }}>{cls.present}</div>
              <div className="fc-d-stat__lbl">Present</div>
            </div>
            <div className="fc-d-stat">
              <div className="fc-d-stat__val">{attPct}%</div>
              <div className="fc-d-stat__lbl">Attendance</div>
            </div>
          </div>

          {/* Status + room */}
          <div className="fc-d-card">
            <h3><MapPin size={14} color="#818cf8" /> Class Details</h3>
            <div style={{ display:'grid', gap:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:'.84rem' }}>
                <Clock size={13} color="#555a7a" />
                <span style={{ color:'#c5caf0' }}>{cls.time}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:'.84rem' }}>
                <MapPin size={13} color="#555a7a" />
                <span style={{ color:'#c5caf0' }}>{cls.room}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:'.84rem' }}>
                <span style={{ color:'#7880a8' }}>Status:</span>
                <span className={statusClass(cls.status)}>{cls.status}</span>
              </div>
            </div>
          </div>

          {/* Students */}
          {students.length > 0 && (
            <div className="fc-d-card">
              <h3><Users size={14} color="#22d3ee" /> Students ({students.length})</h3>
              <table className="fc-d-table">
                <thead>
                  <tr><th>Name</th><th>ID</th><th>Attendance</th><th>Grade</th></tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                          <div className="fc-av">{initials(s.name)}</div>
                          <span style={{ color:'#eceefb', fontWeight:500 }}>{s.name}</span>
                        </div>
                      </td>
                      <td style={{ color:'#7880a8', fontSize:'.74rem' }}>{s.id}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                          <div className="fc-mini-bar">
                            <div className="fc-mini-fill" style={{ width:`${s.attendance}%`, background:attColor(s.attendance) }} />
                          </div>
                          <span style={{ fontSize:'.78rem' }}>{s.attendance}%</span>
                        </div>
                      </td>
                      <td><span className={gradeClass(s.grade)}>{s.grade}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Quick actions */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <Link
              to="/faculty/attendance"
              style={{ flex:1, minWidth:130, padding:'11px 14px', borderRadius:10, background:'rgba(99,102,241,.18)', color:'#818cf8', textDecoration:'none', fontSize:'.85rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:7, border:'1px solid rgba(99,102,241,.3)', transition:'all .15s' }}
              onClick={onClose}
            >
              <ClipboardList size={14} /> Take Attendance
            </Link>
            <Link
              to="/faculty/assignments"
              style={{ flex:1, minWidth:130, padding:'11px 14px', borderRadius:10, background:'rgba(251,191,36,.12)', color:'#fbbf24', textDecoration:'none', fontSize:'.85rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:7, border:'1px solid rgba(251,191,36,.25)', transition:'all .15s' }}
              onClick={onClose}
            >
              <FileText size={14} /> Assignments
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function FacultyClasses() {
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = facultyClasses.filter(c =>
    `${c.subject} ${c.room}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{css}</style>
      <div className="fc">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:22 }}>
          <div>
            <h1>My Classes</h1>
            <p className="sub">{facultyClasses.length} classes scheduled today — click a card for details</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <Link to="/faculty/assignments" style={{ padding:'8px 16px', borderRadius:9, background:'rgba(99,102,241,.18)', color:'#818cf8', textDecoration:'none', fontSize:'.84rem', fontWeight:600, border:'1px solid rgba(99,102,241,.25)', display:'flex', alignItems:'center', gap:6 }}>
              <FileText size={14} /> Assignments
            </Link>
            <Link to="/faculty/announcements" style={{ padding:'8px 16px', borderRadius:9, background:'rgba(52,211,153,.12)', color:'#34d399', textDecoration:'none', fontSize:'.84rem', fontWeight:600, border:'1px solid rgba(52,211,153,.2)', display:'flex', alignItems:'center', gap:6 }}>
              <BarChart2 size={14} /> Announcements
            </Link>
          </div>
        </div>

        <div className="fc-bar">
          <div className="fc-search">
            <Search size={14} color="#7880a8" />
            <input type="search" placeholder="Search classes…" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search classes" />
          </div>
          <span style={{ fontSize:'.82rem', color:'#7880a8' }}>{filtered.length} of {facultyClasses.length}</span>
        </div>

        {filtered.length > 0 ? (
          <div className="fc-grid">
            {filtered.map((c, i) => {
              const attPct = c.enrolled > 0 ? Math.round((c.present / c.enrolled) * 100) : 0;
              return (
                <article
                  key={c.id}
                  className="fc-card"
                  style={{ '--cc-accent': ACCENTS[i % ACCENTS.length] }}
                  onClick={() => setSelected(c)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${c.subject} details`}
                  onKeyDown={e => e.key === 'Enter' && setSelected(c)}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <p className="fc-name">{c.subject}</p>
                      <span className="fc-code">{c.room}</span>
                    </div>
                    <span className={statusClass(c.status)}>{c.status}</span>
                  </div>
                  <div className="fc-meta">
                    <div className="fc-meta-row"><Clock size={13} /><span>{c.time}</span></div>
                    <div className="fc-meta-row"><MapPin size={13} /><span>{c.room}</span></div>
                    <div className="fc-meta-row"><Users size={13} /><span>{c.present} / {c.enrolled} present</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize:'.73rem', color:'#7880a8', marginBottom:3 }}>Attendance: {attPct}%</div>
                    <div className="fc-att-bar">
                      <div className="fc-att-fill" style={{ width:`${attPct}%`, background: attColor(attPct) }} />
                    </div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:4, borderTop:'1px solid rgba(255,255,255,.05)' }}>
                    <span style={{ fontSize:'.78rem', color:'#818cf8' }}>View details</span>
                    <ChevronRight size={15} color="#555a7a" />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="fc-empty"><BookOpen size={40} color="rgba(255,255,255,.1)" /><p>No classes match your search.</p></div>
        )}

        {selected && <ClassDrawer cls={selected} onClose={() => setSelected(null)} />}
      </div>
    </>
  );
}
