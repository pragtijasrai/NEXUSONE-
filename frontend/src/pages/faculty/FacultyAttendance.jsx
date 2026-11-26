/**
 * FacultyAttendance — /faculty/attendance
 * Real API: /faculty/attendance/summary + /faculty/courses + /faculty/courses/:id/students
 *           POST /faculty/attendance/session/:sessionId to mark
 */
import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Save, RotateCcw, Users, History,
  CheckCircle2, AlertTriangle, TrendingUp,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import {
  getFacultyCourses, getFacultySchedule, getCourseStudents,
  getAttendanceSummary, markAttendance,
} from '../../services/facultyService.js';

const css = `
  .att{background:#0d1117;min-height:100vh;color:#c5caf0;font-family:inherit;padding:28px 32px;}
  .att h1{font-size:1.4rem;font-weight:700;color:#eceefb;margin:0 0 4px;}
  .att-sub{font-size:.88rem;color:#7880a8;margin:0 0 20px;}
  .att-back{display:inline-flex;align-items:center;gap:6px;color:#7880a8;font-size:.83rem;text-decoration:none;margin-bottom:16px;transition:color .15s;}
  .att-back:hover{color:#818cf8;}
  .att-tabs{display:flex;gap:0;border-bottom:2px solid rgba(255,255,255,.07);margin-bottom:22px;}
  .att-tab{padding:10px 22px;border:0;background:none;font:inherit;font-size:.88rem;font-weight:500;color:#7880a8;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .15s;display:flex;align-items:center;gap:7px;}
  .att-tab:hover{color:#c5caf0;}
  .att-tab--active{color:#818cf8;border-bottom-color:#818cf8;font-weight:700;}
  .att-sel{background:#161b2e;border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:18px 20px;margin-bottom:20px;}
  .att-sel label{font-size:.74rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#7880a8;display:block;margin-bottom:6px;}
  .att-sel select{width:100%;padding:10px 14px;border-radius:10px;background:#0d1117;border:1.5px solid rgba(255,255,255,.1);color:#eceefb;font:inherit;font-size:.88rem;cursor:pointer;appearance:none;}
  .att-sel select:focus{outline:none;border-color:#4338ca;}
  .att-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}
  .att-stat{background:#161b2e;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:12px;}
  .att-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
  .att-val{font-size:1.5rem;font-weight:800;line-height:1;}
  .att-lbl{font-size:.72rem;color:#7880a8;margin-top:2px;}
  .att-card{background:#161b2e;border:1px solid rgba(255,255,255,.07);border-radius:14px;overflow:hidden;}
  .att-card-head{padding:14px 20px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;justify-content:space-between;align-items:center;background:#0f1320;}
  .att-card-head h2{font-size:.92rem;font-weight:600;color:#eceefb;margin:0;}
  .att-table{width:100%;border-collapse:collapse;}
  .att-table th{text-align:left;padding:10px 20px;color:#7880a8;font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid rgba(255,255,255,.05);background:#0f1320;}
  .att-table td{padding:11px 20px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle;background:#161b2e;}
  .att-table tr:last-child td{border:0;}
  .att-table tr:hover td{background:#1a2035!important;}
  .att-av{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#312e81,#4338ca);display:inline-grid;place-items:center;font-size:.76rem;font-weight:700;color:#fff;flex-shrink:0;}
  .att-sg{display:flex;gap:5px;}
  .att-sb{padding:5px 11px;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:transparent;color:#7880a8;font:inherit;font-size:.74rem;font-weight:600;cursor:pointer;transition:all .15s;}
  .att-sb:hover{border-color:rgba(255,255,255,.25);color:#c5caf0;}
  .att-sb--P.att-sb--on{background:rgba(52,211,153,.18);border-color:#34d399;color:#34d399;}
  .att-sb--A.att-sb--on{background:rgba(248,113,113,.18);border-color:#f87171;color:#f87171;}
  .att-sb--L.att-sb--on{background:rgba(251,191,36,.18);border-color:#fbbf24;color:#fbbf24;}
  .att-footer{display:flex;gap:10px;margin-top:18px;justify-content:flex-end;}
  .att-btn{display:inline-flex;align-items:center;gap:7px;padding:10px 22px;border-radius:10px;border:0;font:inherit;font-size:.9rem;font-weight:600;cursor:pointer;transition:all .18s;}
  .att-btn--primary{background:linear-gradient(135deg,#4338ca,#6366f1);color:#fff;}
  .att-btn--primary:hover{filter:brightness(1.1);transform:translateY(-1px);}
  .att-btn--primary:disabled{opacity:.5;cursor:not-allowed;filter:none;transform:none;}
  .att-btn--ghost{background:rgba(255,255,255,.06);color:#c5caf0;border:1px solid rgba(255,255,255,.1);}
  .att-btn--ghost:hover{background:rgba(255,255,255,.1);}
  .att-hist-card{background:#161b2e;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:16px 18px;margin-bottom:10px;}
  .att-hist-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
  .att-hist-title{font-size:.9rem;font-weight:600;color:#eceefb;}
  .att-hist-meta{font-size:.74rem;color:#7880a8;}
  .att-hist-pill{font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:5px;}
  .att-summ-table{width:100%;border-collapse:collapse;font-size:.84rem;}
  .att-summ-table th{text-align:left;padding:9px 14px;color:#7880a8;font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid rgba(255,255,255,.07);background:#0f1320;}
  .att-summ-table td{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle;background:#161b2e;}
  .att-summ-table tr:last-child td{border:0;}
  @media(max-width:900px){.att-stats{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:640px){.att{padding:16px;}.att-sg{flex-wrap:wrap;}}
`;

function initials(n) { return n.split(' ').map(p => p[0]).slice(0, 2).join(''); }
const DAY = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function FacultyAttendance() {
  const { notify } = useToast();
  const [activeTab, setActiveTab] = useState('take');
  const [courseIdx, setCourseIdx] = useState(0);
  const [sessionIdx, setSessionIdx] = useState(0);
  const [studentsMap, setStudentsMap] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedSessions, setSavedSessions] = useState([]);

  const { data: coursesData, loading: cLoading, error: cError, refetch: cRefetch } = useApi(getFacultyCourses);
  const { data: schedData, loading: sLoading } = useApi(getFacultySchedule);
  const { data: summary, loading: sumLoading, error: sumError, refetch: sumRefetch } = useApi(getAttendanceSummary);

  const courses = coursesData?.courses ?? [];
  const sessions = schedData?.sessions ?? [];

  /* Sessions for the selected course */
  const course = courses[courseIdx];
  const courseSessions = useMemo(() =>
    sessions.filter(s => course && String(s.course_id) === String(course.id)),
  [sessions, course]);

  const session = courseSessions[sessionIdx];

  /* Load students when course changes */
  const loadStudents = useCallback(async (courseId) => {
    if (!courseId || studentsMap[courseId]) return;
    setLoadingStudents(true);
    try {
      const sts = await getCourseStudents(courseId);
      setStudentsMap(prev => ({ ...prev, [courseId]: sts }));
      /* Init attendance to present for all */
      const init = {};
      sts.forEach(s => { init[s.student_id] = 'P'; });
      setAttendance(init);
    } catch { /* ignore */ }
    finally { setLoadingStudents(false); }
  }, [studentsMap]);

  /* When course selector changes */
  const changeCourse = (idx) => {
    setCourseIdx(idx);
    setSessionIdx(0);
    setAttendance({});
    if (courses[idx]) loadStudents(courses[idx].id);
  };

  /* Auto-load on mount */
  if (course && !studentsMap[course.id] && !loadingStudents) {
    loadStudents(course.id);
  }

  const students = course ? (studentsMap[course.id] ?? []) : [];

  const counts = useMemo(() => {
    const c = { P: 0, A: 0, L: 0 };
    students.forEach(s => { const v = attendance[s.student_id] ?? 'P'; c[v] = (c[v] || 0) + 1; });
    return c;
  }, [students, attendance]);

  const mark = (id, st) => setAttendance(p => ({ ...p, [id]: st }));
  const reset = () => {
    const init = {};
    students.forEach(s => { init[s.student_id] = 'P'; });
    setAttendance(init);
  };

  const save = async () => {
    if (!session) { notify('Select a class session first', 'error'); return; }
    const records = students.map(s => ({
      student_id: s.student_id,
      status: attendance[s.student_id] === 'P' ? 'present'
            : attendance[s.student_id] === 'A' ? 'absent' : 'late',
    }));
    setSaving(true);
    try {
      await markAttendance(session.session_id, records);
      const saved = {
        id: Date.now(),
        course_code: course.code,
        course_name: course.name,
        session: `${DAY[session.day_of_week]} ${session.start_time}–${session.end_time}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        present: counts.P, absent: counts.A, late: counts.L, total: students.length,
      };
      setSavedSessions(prev => [saved, ...prev]);
      notify(`Attendance saved for ${course.code} — ${counts.P}/${students.length} present`, 'success');
    } catch (e) { notify(e.message || 'Failed to save attendance', 'error'); }
    finally { setSaving(false); }
  };

  if (cLoading) return <><style>{css}</style><div className="att"><LoadingSpinner message="Loading…" /></div></>;
  if (cError)   return <><style>{css}</style><div className="att"><ErrorState error={cError} onRetry={cRefetch} /></div></>;

  return (
    <>
      <style>{css}</style>
      <div className="att">
        <Link to="/faculty/classes" className="att-back"><ChevronLeft size={15} /> Back to Classes</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
          <div>
            <h1>Attendance</h1>
            <p className="att-sub">Mark and review student attendance</p>
          </div>
          <Link to="/faculty/students" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, background: 'rgba(99,102,241,.18)', color: '#818cf8', textDecoration: 'none', fontSize: '.84rem', fontWeight: 600, border: '1px solid rgba(99,102,241,.3)' }}>
            <Users size={14} /> Student Overview
          </Link>
        </div>

        <div className="att-tabs">
          <button className={`att-tab${activeTab === 'take' ? ' att-tab--active' : ''}`} onClick={() => setActiveTab('take')}>
            <CheckCircle2 size={14} /> Take Attendance
          </button>
          <button className={`att-tab${activeTab === 'summary' ? ' att-tab--active' : ''}`} onClick={() => setActiveTab('summary')}>
            <TrendingUp size={14} /> Summary
          </button>
          <button className={`att-tab${activeTab === 'history' ? ' att-tab--active' : ''}`} onClick={() => setActiveTab('history')}>
            <History size={14} /> Saved ({savedSessions.length})
          </button>
        </div>

        {/* ── Take Attendance ── */}
        {activeTab === 'take' && (
          <>
            <div className="att-sel">
              <label>Select Course</label>
              <select value={courseIdx} onChange={e => changeCourse(Number(e.target.value))} aria-label="Select course">
                {courses.map((c, i) => (
                  <option key={c.id} value={i}>{c.code} — {c.name}</option>
                ))}
              </select>
            </div>

            {courseSessions.length > 0 && (
              <div className="att-sel" style={{ marginTop: -10 }}>
                <label>Select Session</label>
                <select value={sessionIdx} onChange={e => setSessionIdx(Number(e.target.value))} aria-label="Select session">
                  {courseSessions.map((s, i) => (
                    <option key={s.session_id} value={i}>
                      {DAY[s.day_of_week]} · {s.start_time}–{s.end_time} · {s.room_name ?? s.room_code ?? 'TBA'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="att-stats">
              {[['P', 'Present', '#34d399'], ['A', 'Absent', '#f87171'], ['L', 'Late', '#fbbf24']].map(([k, lbl, col]) => (
                <div key={k} className="att-stat">
                  <div className="att-dot" style={{ background: col }} />
                  <div><div className="att-val" style={{ color: col }}>{counts[k] || 0}</div><div className="att-lbl">{lbl}</div></div>
                </div>
              ))}
              <div className="att-stat">
                <div className="att-dot" style={{ background: '#818cf8' }} />
                <div><div className="att-val" style={{ color: '#818cf8' }}>{students.length}</div><div className="att-lbl">Total</div></div>
              </div>
            </div>

            <div className="att-card">
              <div className="att-card-head">
                <h2>{course?.code} — {course?.name}</h2>
                <span style={{ fontSize: '.78rem', color: '#7880a8' }}>{students.length} students</span>
              </div>
              {loadingStudents ? (
                <div style={{ padding: 32, textAlign: 'center' }}><LoadingSpinner message="Loading students…" /></div>
              ) : students.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#7880a8' }}>No students enrolled in this course.</div>
              ) : (
                <table className="att-table">
                  <thead><tr><th>Student</th><th>Roll No.</th><th>Status</th></tr></thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.student_id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="att-av">{initials(s.name)}</div>
                            <span style={{ color: '#eceefb', fontWeight: 500 }}>{s.name}</span>
                          </div>
                        </td>
                        <td style={{ color: '#7880a8', fontSize: '.78rem' }}>{s.roll_number}</td>
                        <td>
                          <div className="att-sg">
                            {['P', 'A', 'L'].map(st => (
                              <button
                                key={st}
                                className={`att-sb att-sb--${st}${(attendance[s.student_id] ?? 'P') === st ? ' att-sb--on' : ''}`}
                                onClick={() => mark(s.student_id, st)}
                                aria-label={`Mark ${s.name} as ${st === 'P' ? 'Present' : st === 'A' ? 'Absent' : 'Late'}`}
                              >
                                {st === 'P' ? 'Present' : st === 'A' ? 'Absent' : 'Late'}
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
              <button className="att-btn att-btn--primary" onClick={save} disabled={saving || students.length === 0 || !session}>
                <Save size={14} /> {saving ? 'Saving…' : 'Save Attendance'}
              </button>
            </div>
          </>
        )}

        {/* ── Summary ── */}
        {activeTab === 'summary' && (
          sumLoading ? <LoadingSpinner message="Loading summary…" />
          : sumError ? <ErrorState error={sumError} onRetry={sumRefetch} />
          : !summary || summary.length === 0 ? (
            <EmptyState icon="📋" title="No attendance data yet" description="Mark attendance for your classes to see summaries here." />
          ) : (
            <div style={{ background: '#161b2e', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, overflow: 'hidden' }}>
              <table className="att-summ-table" aria-label="Attendance summary">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Late</th>
                    <th>Total</th>
                    <th>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map(s => {
                    const rate = s.total_records > 0 ? Math.round((s.present / s.total_records) * 100) : 0;
                    return (
                      <tr key={s.course_id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#eceefb' }}>{s.course_code}</div>
                          <div style={{ fontSize: '.74rem', color: '#7880a8' }}>{s.course_name}</div>
                        </td>
                        <td style={{ color: '#34d399', fontWeight: 600 }}>{s.present}</td>
                        <td style={{ color: '#f87171', fontWeight: 600 }}>{s.absent}</td>
                        <td style={{ color: '#fbbf24', fontWeight: 600 }}>{s.late}</td>
                        <td style={{ color: '#7880a8' }}>{s.total_records}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,.06)', borderRadius: 99, overflow: 'hidden', minWidth: 60 }}>
                              <div style={{ width: `${rate}%`, height: '100%', background: rate >= 75 ? 'linear-gradient(90deg,#059669,#34d399)' : 'linear-gradient(90deg,#dc2626,#f87171)', borderRadius: 99 }} />
                            </div>
                            <strong style={{ fontSize: '.84rem', color: rate >= 75 ? '#34d399' : '#f87171' }}>{rate}%</strong>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* ── History ── */}
        {activeTab === 'history' && (
          savedSessions.length === 0 ? (
            <EmptyState icon="📅" title="No saved sessions" description="Mark and save attendance first to see it here." />
          ) : savedSessions.map(s => (
            <div key={s.id} className="att-hist-card">
              <div className="att-hist-head">
                <div>
                  <p className="att-hist-title">{s.course_code} — {s.course_name}</p>
                  <p className="att-hist-meta">{s.date} · {s.session}</p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className="att-hist-pill" style={{ background: 'rgba(52,211,153,.13)', color: '#34d399' }}>{s.present} Present</span>
                  {s.absent > 0 && <span className="att-hist-pill" style={{ background: 'rgba(248,113,113,.13)', color: '#f87171' }}>{s.absent} Absent</span>}
                  {s.late > 0 && <span className="att-hist-pill" style={{ background: 'rgba(251,191,36,.13)', color: '#fbbf24' }}>{s.late} Late</span>}
                  <span className="att-hist-pill" style={{ background: 'rgba(255,255,255,.06)', color: '#7880a8' }}>{s.total} Total</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
