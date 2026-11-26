import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  CalendarClock, GraduationCap, MapPin, User, Clock, X,
  AlertTriangle, CheckCircle2, XCircle, MinusCircle, Info,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import * as tt from '../../services/timetableService.js';

/* ───────── constants ───────── */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_MAP = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri' };
const ATTENDANCE_TARGET = 75;

const subjectColors = {
  'SD':     '#4338ca',
  'AIML':   '#8b5cf6',
  'ADI':    '#0ea5e9',
  'BEE-II': '#10b981',
  'NALR-I': '#f59e0b',
};
const getColor = (code) => subjectColors[code] ?? '#6366f1';

/* ───────── helpers ───────── */
const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const fmt = (t) => {
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${ap}`;
};
const dayIndexToLabel = (d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d];

function classStatus(cls, isToday, nowMin, nextId) {
  if (!isToday) return 'scheduled';
  if (nowMin >= toMin(cls.end)) return 'completed';
  if (nowMin >= toMin(cls.start)) return 'live';
  return cls.session_id === nextId ? 'next' : 'upcoming';
}

const statusBadge = {
  completed: ['badge badge--done', 'Completed'],
  live:      ['badge badge--live', 'In progress'],
  next:      ['badge badge--primary', 'Up next'],
  upcoming:  ['badge badge--next', 'Upcoming'],
  scheduled: ['badge badge--next', 'Scheduled'],
};

const attStatus = {
  present:  { icon: CheckCircle2, color: 'var(--ok)',     label: 'Present' },
  absent:   { icon: XCircle,      color: 'var(--danger)', label: 'Absent'  },
  late:     { icon: Clock,        color: 'var(--warn)',   label: 'Late'    },
  on_leave: { icon: MinusCircle,  color: 'var(--warn)',   label: 'On leave'},
};

const pct = (present, total) => (total ? Math.round((present / total) * 1000) / 10 : 0);
const pctClass = (p) => (p >= ATTENDANCE_TARGET ? 'ok' : p >= ATTENDANCE_TARGET - 10 ? 'warn' : 'danger');

/* ───────── page ───────── */
export default function MyClasses() {
  const [tab, setTab] = useState('timetable');
  const [now, setNow] = useState(() => new Date());
  const todayLabel = dayIndexToLabel(now.getDay());
  const [day, setDay] = useState(DAYS.includes(todayLabel) ? todayLabel : 'Mon');
  const [selected, setSelected] = useState(null);

  /* Fetch timetable + attendance in parallel */
  const { data: ttData, loading: ttLoading, error: ttError, refetch: ttRefetch } = useApi(tt.getTimetable);
  const { data: attData, loading: attLoading, error: attError, refetch: attRefetch } = useApi(tt.getAttendance);

  /* Build timetable grouped by day from API sessions */
  const timetable = useMemo(() => {
    const map = {};
    DAYS.forEach((d) => (map[d] = []));
    (ttData?.sessions ?? []).forEach((s) => {
      const dayLabel = DAY_MAP[s.day_of_week];
      if (dayLabel && map[dayLabel]) {
        map[dayLabel].push({
          id: s.session_id,
          session_id: s.session_id,
          subject: s.course_code,
          subjectName: s.course_name,
          start: s.start_time,
          end: s.end_time,
          faculty: s.faculty_name ?? 'TBA',
          room: s.room_name ?? s.room_code ?? 'TBA',
          type: 'Lecture',
        });
      }
    });
    return map;
  }, [ttData]);

  const attendanceSummary = useMemo(() => (attData?.summary ?? []).map((s) => ({
    subject: s.course_code,
    subjectName: s.course_name,
    present: s.present,
    absent: s.absent,
    late: s.late,
    total: s.total_classes,
  })), [attData]);

  const attendanceHistory = useMemo(() => (attData?.history ?? []).map((h) => ({
    id: h.record_id,
    subject: h.course_code,
    subjectName: h.course_name,
    status: h.status,
    date: h.marked_at ? new Date(h.marked_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : '',
    time: h.start_time,
    faculty: h.faculty_name,
    room: h.room_name,
  })), [attData]);

  /* Auto-refresh clock for live status */
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const isToday = day === todayLabel;
  const classes = timetable[day] ?? [];

  const nextId = useMemo(() => {
    if (!isToday) return null;
    return classes.find((x) => toMin(x.start) > nowMin)?.session_id ?? null;
  }, [classes, isToday, nowMin]);

  const todayClasses = timetable[todayLabel] ?? [];
  const liveOrNext =
    todayClasses.find((x) => nowMin >= toMin(x.start) && nowMin < toMin(x.end)) ??
    todayClasses.find((x) => toMin(x.start) > nowMin);

  /* Attendance stats */
  const totals = attendanceSummary.reduce(
    (a, s) => ({ p: a.p + s.present, t: a.t + s.total }),
    { p: 0, t: 0 },
  );
  const overall = pct(totals.p, totals.t);
  const lowSubjects = attendanceSummary.filter((s) => pct(s.present, s.total) < ATTENDANCE_TARGET);

  if (ttLoading && !ttData) return <LoadingSpinner message="Loading timetable…" />;
  if (ttError) return <ErrorState error={ttError} onRetry={ttRefetch} message="Could not load your timetable." />;

  return (
    <div className="stack">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>My Classes</h1>
          <p className="muted">Your weekly timetable and attendance in one place.</p>
        </div>
        {liveOrNext && (
          <div className="card" style={{ padding: '10px 16px', display: 'flex', gap: 12, alignItems: 'center', borderLeft: `4px solid ${getColor(liveOrNext.subject)}` }}>
            <Clock size={18} style={{ color: 'var(--primary)' }} aria-hidden="true" />
            <div>
              <div className="muted small" style={{ lineHeight: 1.2 }}>
                {nowMin >= toMin(liveOrNext.start) ? 'Happening now' : 'Next class'}
              </div>
              <strong style={{ fontSize: '.92rem' }}>
                {liveOrNext.subject} · {fmt(liveOrNext.start)} · {liveOrNext.room}
              </strong>
            </div>
          </div>
        )}
      </header>

      <div className="tabs" role="tablist" style={{ marginBottom: 0 }}>
        {[['timetable', 'Timetable', CalendarClock], ['attendance', 'Attendance', GraduationCap]].map(([k, label, Icon]) => (
          <button
            key={k} role="tab" aria-selected={tab === k}
            className={`tab ${tab === k ? 'tab--active' : ''}`}
            onClick={() => setTab(k)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Icon size={16} aria-hidden="true" /> {label}
            {k === 'attendance' && lowSubjects.length > 0 && (
              <span className="badge badge--warn" style={{ padding: '1px 7px' }}>{lowSubjects.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'timetable' ? (
        <section className="stack" aria-label="Weekly timetable">
          {/* Day selector */}
          <div role="group" aria-label="Select day" style={{ display: 'grid', gridTemplateColumns: `repeat(${DAYS.length}, minmax(0,1fr))`, gap: 8 }}>
            {DAYS.map((d) => {
              const active = d === day;
              const n = (timetable[d] ?? []).length;
              return (
                <button
                  key={d} onClick={() => { setDay(d); setSelected(null); }}
                  aria-pressed={active}
                  className="card card--hover"
                  style={{
                    padding: '12px 8px', textAlign: 'center', font: 'inherit',
                    background: active ? 'var(--primary)' : 'var(--surface)',
                    color: active ? 'var(--primary-ink)' : 'var(--text)',
                    borderColor: active ? 'var(--primary)' : 'var(--border)',
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{d}</div>
                  <div style={{ fontSize: '.72rem', opacity: .8 }}>
                    {d === todayLabel ? 'Today · ' : ''}{n} {n === 1 ? 'class' : 'classes'}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: selected ? 'minmax(0,1.6fr) minmax(0,1fr)' : 'minmax(0,1fr)', gap: 16, alignItems: 'start' }} className="classes-grid">
            {/* Class list */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {classes.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem' }}>🎉</div>
                  <h3 style={{ margin: '8px 0 4px' }}>No classes on {day}</h3>
                  <p className="muted small" style={{ margin: 0 }}>Enjoy the free day — or book a study room.</p>
                </div>
              ) : classes.map((cls, i) => {
                const st = classStatus(cls, isToday, nowMin, nextId);
                const [bc, bl] = statusBadge[st];
                const color = getColor(cls.subject);
                const active = selected?.session_id === cls.session_id;
                return (
                  <button
                    key={cls.session_id} onClick={() => setSelected(active ? null : cls)}
                    aria-pressed={active}
                    className="class-row"
                    style={{
                      display: 'grid', gap: 16, alignItems: 'center',
                      width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer',
                      padding: '16px 20px', border: 0,
                      borderTop: i ? '1px solid var(--border)' : 0,
                      borderLeft: `4px solid ${color}`,
                      background: active ? 'var(--bg2)' : st === 'live' ? 'var(--info-bg)' : 'transparent',
                      opacity: st === 'completed' ? .65 : 1,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{fmt(cls.start)}</div>
                      <div className="muted small">{fmt(cls.end)}</div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>
                        {st === 'live' && <span className="dot" aria-hidden="true" />}
                        {cls.subject}
                      </div>
                      <div className="muted small" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 2 }}>
                        <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}><User size={12} aria-hidden="true" />{cls.faculty}</span>
                        <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}><MapPin size={12} aria-hidden="true" />{cls.room}</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: 4, justifyItems: 'end' }}>
                      <span className={bc}>{bl}</span>
                      <span className="muted" style={{ fontSize: '.72rem' }}>{cls.type}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Detail panel */}
            {selected && (
              <aside className="card" aria-label="Class details" style={{ borderTop: `4px solid ${getColor(selected.subject)}` }}>
                <div className="section-header">
                  <h2 style={{ fontSize: '1.1rem' }}>{selected.subject}</h2>
                  <button className="icon-btn" onClick={() => setSelected(null)} aria-label="Close details"><X size={18} /></button>
                </div>
                <dl className="facts">
                  <div><dt>Day</dt><dd>{day}</dd></div>
                  <div><dt>Time</dt><dd>{fmt(selected.start)} – {fmt(selected.end)}</dd></div>
                  <div><dt>Subject</dt><dd>{selected.subjectName}</dd></div>
                  <div><dt>Faculty</dt><dd>{selected.faculty}</dd></div>
                  <div><dt>Room</dt><dd>{selected.room}</dd></div>
                  <div><dt>Type</dt><dd>{selected.type}</dd></div>
                  {(() => {
                    const a = attendanceSummary.find((s) => s.subject === selected.subject);
                    if (!a) return null;
                    const p = pct(a.present, a.total);
                    return <div><dt>Your attendance</dt><dd style={{ color: `var(--${pctClass(p)})` }}>{p}%</dd></div>;
                  })()}
                </dl>
              </aside>
            )}
          </div>
        </section>
      ) : (
        /* ── Attendance tab ── */
        <section className="stack" aria-label="Attendance">
          {attLoading && !attData ? (
            <LoadingSpinner message="Loading attendance…" />
          ) : attError ? (
            <ErrorState error={attError} onRetry={attRefetch} message="Could not load attendance data." />
          ) : attendanceSummary.length === 0 ? (
            <EmptyState icon="📋" title="No attendance records" description="Your attendance will appear here once your faculty marks it." />
          ) : (
            <>
              {lowSubjects.length > 0 && (
                <div role="alert" style={{ display: 'flex', gap: 12, padding: '14px 18px', borderRadius: 'var(--r)', background: 'var(--warn-bg)', color: 'var(--warn)', alignItems: 'flex-start' }}>
                  <AlertTriangle size={20} style={{ flexShrink: 0 }} aria-hidden="true" />
                  <div style={{ fontSize: '.9rem' }}>
                    <strong>Below the {ATTENDANCE_TARGET}% target: </strong>
                    {lowSubjects.map((s) => `${s.subject} (${pct(s.present, s.total)}%)`).join(', ')}.
                    <div style={{ opacity: .85, marginTop: 2 }}>Check your university's attendance policy for what this means.</div>
                  </div>
                </div>
              )}

              <div className="grid att-grid" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)' }}>
                {/* Overall */}
                <div className="card" style={{ display: 'grid', placeItems: 'center', textAlign: 'center', gap: 6 }}>
                  <div className="muted small">Overall attendance</div>
                  <div style={{ position: 'relative', width: 140, height: 140 }}>
                    <svg viewBox="0 0 120 120" width="140" height="140" role="img" aria-label={`Overall attendance ${overall} percent`}>
                      <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bg2)" strokeWidth="10" />
                      <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" strokeLinecap="round"
                        stroke={`var(--${pctClass(overall)}`}
                        strokeDasharray={`${(overall / 100) * 326.7} 326.7`}
                        transform="rotate(-90 60 60)" style={{ transition: 'stroke-dasharray .6s ease' }} />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                      <span className="stat__value">{overall}%</span>
                    </div>
                  </div>
                  <div className="muted small">{totals.p} of {totals.t} classes attended</div>
                  <span className="badge badge--primary">Target {ATTENDANCE_TARGET}%</span>
                </div>

                {/* Subject-wise */}
                <div className="card" style={{ padding: 0 }}>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr><th>Subject</th><th>Attended</th><th>Total</th><th>Absent</th><th style={{ width: '30%' }}>Attendance</th></tr>
                      </thead>
                      <tbody>
                        {attendanceSummary.map((s) => {
                          const p = pct(s.present, s.total);
                          const k = pctClass(p);
                          return (
                            <tr key={s.subject}>
                              <td>
                                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, marginRight: 8, background: getColor(s.subject) }} aria-hidden="true" />
                                <strong>{s.subject}</strong>
                                <div className="muted" style={{ fontSize: '.72rem' }}>{s.subjectName}</div>
                              </td>
                              <td>{s.present}</td>
                              <td>{s.total}</td>
                              <td style={{ color: s.absent > 0 ? 'var(--danger)' : 'var(--muted)' }}>{s.absent}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div className="progress" style={{ flex: 1 }} role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
                                    <div className={`progress__fill progress__fill--${k}`} style={{ width: `${p}%` }} />
                                  </div>
                                  <strong style={{ width: 52, textAlign: 'right', color: `var(--${k})` }}>{p}%</strong>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* History */}
              <div className="card">
                <div className="section-header"><h2 style={{ fontSize: '1.1rem' }}>Recent history</h2></div>
                {attendanceHistory.length === 0 ? (
                  <p className="muted small">No attendance records yet.</p>
                ) : (
                  <div className="list">
                    {attendanceHistory.map((h, i) => {
                      const s = attStatus[h.status] ?? attStatus.present;
                      const Icon = s.icon;
                      return (
                        <div className="row" key={h.id ?? i} style={{ alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <Icon size={18} style={{ color: s.color }} aria-hidden="true" />
                            <div>
                              <strong>{h.subject}</strong>
                              <div className="muted small">
                                {h.date} · {h.time ? fmt(h.time) : ''} · {h.room ?? ''}
                              </div>
                            </div>
                          </div>
                          <span style={{ color: s.color, fontWeight: 600, fontSize: '.85rem' }}>{s.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      )}

      <style>{`@media (max-width: 860px){ .classes-grid, .att-grid{ grid-template-columns: 1fr !important; } }
        .class-row{ grid-template-columns: 112px 1fr auto; }
        @media (max-width: 520px){ .class-row{ grid-template-columns: 76px 1fr !important; gap: 12px !important; padding: 14px 12px !important; } .class-row > :last-child{ grid-column: 2; justify-items: start !important; grid-auto-flow: column; gap: 8px !important; } }`}</style>
    </div>
  );
}
