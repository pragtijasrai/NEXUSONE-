/**
 * FacultyTimetable — /faculty/timetable (alias: /faculty/schedule)
 * Real API: /faculty/schedule
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Clock, MapPin, Users, CalendarClock } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import { getFacultySchedule } from '../../services/facultyService.js';

const css = `
  .ft{background:#0d1117;min-height:100vh;color:#c5caf0;font-family:inherit;padding:28px 32px;}
  .ft h1{font-size:1.4rem;font-weight:700;color:#eceefb;margin:0 0 4px;}
  .ft-sub{font-size:.88rem;color:#7880a8;margin:0 0 22px;}
  .ft-back{display:inline-flex;align-items:center;gap:6px;color:#7880a8;font-size:.83rem;text-decoration:none;margin-bottom:16px;transition:color .15s;}
  .ft-back:hover{color:#818cf8;}
  .ft-day-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;}
  .ft-day-btn{padding:8px 16px;border-radius:9px;border:1px solid rgba(255,255,255,.08);background:#161b2e;color:#7880a8;font:inherit;font-size:.84rem;font-weight:500;cursor:pointer;transition:all .15s;white-space:nowrap;}
  .ft-day-btn:hover{border-color:rgba(99,102,241,.3);color:#818cf8;}
  .ft-day-btn--active{border-color:#4338ca;background:rgba(67,56,202,.2);color:#818cf8;font-weight:700;}
  .ft-table-wrap{background:#161b2e;border:1px solid rgba(255,255,255,.07);border-radius:14px;overflow:hidden;}
  .ft-table{width:100%;border-collapse:collapse;}
  .ft-table th{text-align:left;padding:12px 18px;color:#7880a8;font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid rgba(255,255,255,.07);background:#0f1320;}
  .ft-table td{padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle;background:#161b2e;}
  .ft-table tr:last-child td{border:0;}
  .ft-table tr:hover td{background:#1a2035!important;}
  .ft-week{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;}
  .ft-col{background:#161b2e;border:1px solid rgba(255,255,255,.07);border-radius:12px;overflow:hidden;}
  .ft-col-head{padding:10px 14px;background:#0f1320;border-bottom:1px solid rgba(255,255,255,.07);font-size:.8rem;font-weight:700;color:#eceefb;text-align:center;}
  .ft-col-head.today{color:#818cf8;}
  .ft-session-card{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.04);}
  .ft-session-card:last-child{border:0;}
  .ft-session-card:hover{background:#1a2035;}
  .ft-code{font-size:.72rem;font-weight:700;padding:2px 7px;border-radius:5px;background:rgba(99,102,241,.18);color:#818cf8;display:inline-block;margin-bottom:4px;}
  .ft-name{font-size:.85rem;font-weight:600;color:#eceefb;margin:0 0 4px;}
  .ft-sess-meta{font-size:.74rem;color:#7880a8;display:flex;flex-direction:column;gap:3px;}
  @media(max-width:1024px){.ft-week{grid-template-columns:repeat(3,1fr);}}
  @media(max-width:640px){.ft-week{grid-template-columns:1fr 1fr;}.ft{padding:16px;}}
`;

const DAYS = ['Mon','Tue','Wed','Thu','Fri'];
const DAY_OF_WEEK_LABEL = { 1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',0:'Sun',6:'Sat' };
const TODAY_DOW = new Date().getDay(); // 0=Sun, 1=Mon...

function fmt12(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2,'0')} ${ap}`;
}

export default function FacultyTimetable() {
  const [view, setView] = useState('week'); // 'week' | 'day'
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = TODAY_DOW;
    return d >= 1 && d <= 5 ? d : 1;
  });

  const { data, loading, error, refetch } = useApi(getFacultySchedule);
  const sessions = data?.sessions ?? [];

  const byDay = useMemo(() => {
    const map = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    sessions.forEach(s => {
      const d = s.day_of_week;
      if (map[d]) map[d].push(s);
    });
    return map;
  }, [sessions]);

  const todayLabel = DAY_OF_WEEK_LABEL[TODAY_DOW] ?? 'Mon';
  const todayNum = TODAY_DOW >= 1 && TODAY_DOW <= 5 ? TODAY_DOW : 1;
  const daySessions = byDay[selectedDay] ?? [];

  if (loading) return <><style>{css}</style><div className="ft"><LoadingSpinner message="Loading schedule…" /></div></>;
  if (error)   return <><style>{css}</style><div className="ft"><ErrorState error={error} onRetry={refetch} /></div></>;

  return (
    <>
      <style>{css}</style>
      <div className="ft">
        <Link to="/faculty/dashboard" className="ft-back"><ChevronLeft size={15} /> Back to Dashboard</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <h1>Timetable</h1>
            <p className="ft-sub">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {' · '}{sessions.length} session{sessions.length !== 1 ? 's' : ''} this week
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`ft-day-btn${view === 'week' ? ' ft-day-btn--active' : ''}`} onClick={() => setView('week')}>Week view</button>
            <button className={`ft-day-btn${view === 'day' ? ' ft-day-btn--active' : ''}`} onClick={() => setView('day')}>Day view</button>
          </div>
        </div>

        {sessions.length === 0 ? (
          <EmptyState icon="📅" title="No sessions found" description="Your class sessions will appear here once assigned." />
        ) : view === 'week' ? (
          /* ── Week view ── */
          <div className="ft-week">
            {[1,2,3,4,5].map(d => {
              const dayLabel = DAY_OF_WEEK_LABEL[d];
              const isToday = d === todayNum;
              const daySess = byDay[d] ?? [];
              return (
                <div key={d} className="ft-col">
                  <div className={`ft-col-head${isToday ? ' today' : ''}`}>
                    {dayLabel}{isToday ? ' (Today)' : ''}
                    <span style={{ display: 'block', fontSize: '.66rem', fontWeight: 400, color: '#7880a8', marginTop: 2 }}>
                      {daySess.length} session{daySess.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {daySess.length === 0 ? (
                    <div style={{ padding: '20px 14px', textAlign: 'center', color: '#555a7a', fontSize: '.78rem' }}>Free</div>
                  ) : daySess.map(s => (
                    <div key={s.session_id} className="ft-session-card">
                      <span className="ft-code">{s.course_code}</span>
                      <p className="ft-name">{s.course_name}</p>
                      <div className="ft-sess-meta">
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />{fmt12(s.start_time)}–{fmt12(s.end_time)}</span>
                        {(s.room_name ?? s.room_code) && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{s.room_name ?? s.room_code}</span>}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={11} />{s.enrolled_count} enrolled</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Day view ── */
          <>
            <div className="ft-day-tabs">
              {DAYS.map((label, i) => {
                const d = i + 1;
                const isToday = d === todayNum;
                return (
                  <button
                    key={d}
                    className={`ft-day-btn${selectedDay === d ? ' ft-day-btn--active' : ''}`}
                    onClick={() => setSelectedDay(d)}
                  >
                    {label}{isToday ? ' · Today' : ''} ({byDay[d]?.length ?? 0})
                  </button>
                );
              })}
            </div>

            {daySessions.length === 0 ? (
              <EmptyState icon="🎉" title={`No classes on ${DAY_OF_WEEK_LABEL[selectedDay]}`} description="Enjoy the free day." />
            ) : (
              <div className="ft-table-wrap">
                <table className="ft-table" aria-label="Day timetable">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Course</th>
                      <th>Room</th>
                      <th>Enrolled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daySessions.map(s => (
                      <tr key={s.session_id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <Clock size={14} color="#7880a8" />
                            <span style={{ color: '#eceefb', fontWeight: 600 }}>{fmt12(s.start_time)}</span>
                          </div>
                          <div style={{ fontSize: '.74rem', color: '#555a7a', marginTop: 2, paddingLeft: 21 }}>to {fmt12(s.end_time)}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '.74rem', fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: 'rgba(99,102,241,.18)', color: '#818cf8', display: 'inline-block', marginBottom: 4 }}>
                            {s.course_code}
                          </span>
                          <div style={{ color: '#eceefb', fontWeight: 600, fontSize: '.88rem' }}>{s.course_name}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#7880a8', fontSize: '.84rem' }}>
                            <MapPin size={13} />{s.room_name ?? s.room_code ?? '—'}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#c5caf0', fontSize: '.84rem' }}>
                            <Users size={13} color="#7880a8" />{s.enrolled_count}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
