import { useEffect, useMemo, useState } from 'react';
import {
  CalendarClock, GraduationCap, MapPin, User, Clock, X,
  AlertTriangle, CheckCircle2, XCircle, MinusCircle, Info, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { attendanceData } from '../../data/mockStudent.js';
import {
  DAYS, ATTENDANCE_TARGET, subjectColors, timetable, attendanceHistory,
  CALENDAR_MONTH, SEMESTER_END, holidays,
} from '../../data/mockClasses.js';

/* ───────── helpers ───────── */
const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const fmt = (t) => {
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${ap}`;
};
const dayIndexToLabel = (d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d];

/** Status is only meaningful for today's classes; other days are just "scheduled". */
function classStatus(cls, isToday, nowMin, nextId) {
  if (!isToday) return 'scheduled';
  if (nowMin >= toMin(cls.end)) return 'completed';
  if (nowMin >= toMin(cls.start)) return 'live';
  return cls.id === nextId ? 'next' : 'upcoming';
}

const statusBadge = {
  completed: ['badge badge--done', 'Completed'],
  live:      ['badge badge--live', 'In progress'],
  next:      ['badge badge--primary', 'Up next'],
  upcoming:  ['badge badge--next', 'Upcoming'],
  scheduled: ['badge badge--next', 'Scheduled'],
};

const attStatus = {
  present: { icon: CheckCircle2, color: 'var(--ok)',     label: 'Present' },
  absent:  { icon: XCircle,      color: 'var(--danger)', label: 'Absent'  },
  excused: { icon: MinusCircle,  color: 'var(--warn)',   label: 'Excused' },
};

/** Attendance % = attended / total eligible classes × 100 (1 dp). */
const pct = (present, total) => (total ? Math.round((present / total) * 1000) / 10 : 0);
const pctClass = (p) => (p >= ATTENDANCE_TARGET ? 'ok' : p >= ATTENDANCE_TARGET - 10 ? 'warn' : 'danger');

const pad = (n) => String(n).padStart(2, '0');
const isoOf = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const dateISO = (dt) => isoOf(dt.getFullYear(), dt.getMonth(), dt.getDate());
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const histISO = (d) => { const [mo, dd] = d.split(' '); return isoOf(CALENDAR_MONTH.year, MONTHS.indexOf(mo), Number(dd)); };

/** Every holiday date (YYYY-MM-DD) → holiday name, expanded from the from/to ranges. */
const holidayMap = (() => {
  const map = {};
  holidays.forEach((h) => {
    const [fy, fm, fd] = h.from.split('-').map(Number);
    const to = h.to ?? h.from;
    for (let i = 0; i < 400; i++) {
      const dt = new Date(fy, fm - 1, fd + i);
      const k = dateISO(dt);
      if (k > to) break;
      map[k] = h.name;
    }
  });
  return map;
})();

/** Plan to reach the target by the last class day (SEMESTER_END). `rem` = classes still left to be held. */
function attendancePlan(present, total, rem) {
  const finalTotal = total + rem;
  const required = Math.floor((ATTENDANCE_TARGET * finalTotal + 99) / 100); // ceil(target% × finalTotal)
  const need = Math.max(0, required - present);
  return { rem, need, canMiss: Math.max(0, rem - need), possible: need <= rem };
}

const calColors = {
  present: { bg: 'var(--ok)',     label: 'Present' },
  absent:  { bg: 'var(--danger)', label: 'Absent' },
  holiday: { bg: '#2563eb',       label: 'Holiday' },
  excused: { bg: 'var(--warn)',   label: 'Excused' },
};

/** Small month calendar for one subject: green = present, red = absent, blue = holiday. */
function MiniCalendar({ subject, year, month }) {
  const first = new Date(year, month, 1).getDay();
  const daysIn = new Date(year, month + 1, 0).getDate();
  const marks = {};
  Object.entries(holidayMap).forEach(([k, name]) => { marks[k] = { kind: 'holiday', title: name }; });
  attendanceHistory
    .filter((h) => h.subject === subject)
    .forEach((h) => { marks[histISO(h.date)] = { kind: h.status, title: calColors[h.status]?.label }; });

  const cells = [...Array(first).fill(null), ...Array.from({ length: daysIn }, (_, i) => i + 1)];

  return (
    <div className="card" style={{ padding: 12, borderTop: `3px solid ${subjectColors[subject] ?? 'var(--primary)'}` }}>
      <strong style={{ fontSize: '.85rem', display: 'block', marginBottom: 6 }}>{subject}</strong>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, textAlign: 'center' }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="muted" style={{ fontSize: '.62rem', fontWeight: 600 }}>{d}</div>
        ))}
        {cells.map((d, i) => {
          const mk = d && marks[isoOf(year, month, d)];
          return (
            <div
              key={i}
              title={mk ? mk.title : undefined}
              style={{
                fontSize: '.68rem', lineHeight: '22px', height: 22, borderRadius: 5,
                background: mk ? calColors[mk.kind].bg : 'transparent',
                color: mk ? '#fff' : 'var(--text)',
                fontWeight: mk ? 700 : 400,
              }}
            >
              {d ?? ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────── page ───────── */
export default function MyClasses() {
  const [tab, setTab] = useState('timetable');
  const [now, setNow] = useState(() => new Date());
  const todayLabel = dayIndexToLabel(now.getDay());
  const [day, setDay] = useState(DAYS.includes(todayLabel) ? todayLabel : 'Mon');
  const [selected, setSelected] = useState(null);
  const [cal, setCal] = useState({ year: CALENDAR_MONTH.year, month: CALENDAR_MONTH.month });

  // keep the "in progress / up next" indicators fresh
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const isToday = day === todayLabel;
  const classes = timetable[day] ?? [];

  const nextId = useMemo(() => {
    if (!isToday) return null;
    return classes.find((x) => toMin(x.start) > nowMin)?.id ?? null;
  }, [classes, isToday, nowMin]);

  const todayClasses = timetable[todayLabel] ?? [];
  const liveOrNext =
    todayClasses.find((x) => nowMin >= toMin(x.start) && nowMin < toMin(x.end)) ??
    todayClasses.find((x) => toMin(x.start) > nowMin);

  const totals = attendanceData.reduce(
    (a, s) => ({ p: a.p + s.present, t: a.t + s.total }),
    { p: 0, t: 0 },
  );
  const overall = pct(totals.p, totals.t);
  // Classes still to be held from now until SEMESTER_END (weekdays only, holidays skipped), per subject.
  const remaining = useMemo(() => {
    const out = {};
    const t0 = new Date();
    for (let i = 0; i < 400; i++) {
      const dt = new Date(t0.getFullYear(), t0.getMonth(), t0.getDate() + i);
      const k = dateISO(dt);
      if (k > SEMESTER_END) break;
      if (holidayMap[k]) continue;
      (timetable[dayIndexToLabel(dt.getDay())] ?? []).forEach((cl) => {
        if (i === 0 && nowMin >= toMin(cl.end)) return; // already over today
        out[cl.subject] = (out[cl.subject] ?? 0) + 1;
      });
    }
    return out;
  }, [nowMin]);
  const remTotal = Object.values(remaining).reduce((a, b) => a + b, 0);
  const overallPlan = attendancePlan(totals.p, totals.t, remTotal);
  const lowSubjects = attendanceData.filter((s) => pct(s.present, s.total) < ATTENDANCE_TARGET);

  return (
    <div className="stack">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>My Classes</h1>
          <p className="muted">Your weekly timetable and attendance in one place.</p>
        </div>
        {liveOrNext && (
          <div className="card" style={{ padding: '10px 16px', display: 'flex', gap: 12, alignItems: 'center', borderLeft: `4px solid ${subjectColors[liveOrNext.subject]}` }}>
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
                const color = subjectColors[cls.subject] ?? 'var(--primary)';
                const active = selected?.id === cls.id;
                return (
                  <button
                    key={cls.id} onClick={() => setSelected(active ? null : cls)}
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
              <aside className="card" aria-label="Class details" style={{ borderTop: `4px solid ${subjectColors[selected.subject] ?? 'var(--primary)'}` }}>
                <div className="section-header">
                  <h2 style={{ fontSize: '1.1rem' }}>{selected.subject}</h2>
                  <button className="icon-btn" onClick={() => setSelected(null)} aria-label="Close details"><X size={18} /></button>
                </div>
                <dl className="facts">
                  <div><dt>Day</dt><dd>{day}</dd></div>
                  <div><dt>Time</dt><dd>{fmt(selected.start)} – {fmt(selected.end)}</dd></div>
                  <div><dt>Faculty</dt><dd>{selected.faculty}</dd></div>
                  <div><dt>Room</dt><dd>{selected.room}</dd></div>
                  <div><dt>Type</dt><dd>{selected.type}</dd></div>
                  {(() => {
                    const a = attendanceData.find((s) => s.subject === selected.subject);
                    if (!a) return null;
                    const p = pct(a.present, a.total);
                    return <div><dt>Your attendance</dt><dd style={{ color: `var(--${pctClass(p)})` }}>{p}%</dd></div>;
                  })()}
                </dl>
                {selected.note && (
                  <div style={{ marginTop: 14, padding: 12, borderRadius: 'var(--r)', background: 'var(--warn-bg)', color: 'var(--warn)', display: 'flex', gap: 8, fontSize: '.85rem' }}>
                    <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" /> {selected.note}
                  </div>
                )}
              </aside>
            )}
          </div>
        </section>
      ) : (
        <section className="stack" aria-label="Attendance">
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
                    stroke={`var(--${pctClass(overall)})`}
                    strokeDasharray={`${(overall / 100) * 326.7} 326.7`}
                    transform="rotate(-90 60 60)" style={{ transition: 'stroke-dasharray .6s ease' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                  <span className="stat__value">{overall}%</span>
                </div>
              </div>
              <div className="muted small">{totals.p} of {totals.t} classes attended</div>
              <span className="badge badge--primary">Target {ATTENDANCE_TARGET}%</span>
              <div className="small" style={{ color: !overallPlan.possible ? 'var(--danger)' : overallPlan.need > 0 ? 'var(--warn)' : 'var(--ok)', fontWeight: 600 }}>
                {!overallPlan.possible
                  ? `${ATTENDANCE_TARGET}% not reachable by 31 Dec`
                  : overallPlan.need > 0
                    ? `Attend ${overallPlan.need} of ${overallPlan.rem} remaining classes (till 31 Dec) to reach ${ATTENDANCE_TARGET}%`
                    : `${ATTENDANCE_TARGET}% is safe till 31 Dec. You can miss up to ${overallPlan.canMiss} of ${overallPlan.rem} classes`}
              </div>
            </div>

            {/* Subject-wise */}
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Subject</th><th>Attended</th><th>Total</th><th>Need by 31 Dec</th><th style={{ width: '34%' }}>Attendance</th></tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((s) => {
                      const p = pct(s.present, s.total);
                      const k = pctClass(p);
                      const pl = attendancePlan(s.present, s.total, remaining[s.subject] ?? 0);
                      return (
                        <tr key={s.subject}>
                          <td>
                            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, marginRight: 8, background: subjectColors[s.subject] }} aria-hidden="true" />
                            <strong>{s.subject}</strong>
                          </td>
                          <td>{s.present}</td>
                          <td>{s.total}</td>
                          <td>
                            <div style={{ fontWeight: 600, color: !pl.possible ? 'var(--danger)' : pl.need > 0 ? 'var(--warn)' : 'var(--ok)' }}>
                              {!pl.possible ? 'Not reachable' : pl.need > 0 ? `${pl.need} of ${pl.rem}` : 'None needed'}
                            </div>
                            <div className="muted" style={{ fontSize: '.7rem' }}>
                              {pl.possible ? `can miss ${pl.canMiss}` : `only ${pl.rem} left`}
                            </div>
                          </td>
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

          {/* Subject calendars */}
          <div className="card">
            <div className="section-header" style={{ flexWrap: 'wrap', gap: 8 }}>
              <h2 style={{ fontSize: '1.1rem' }}>Subject calendars</h2>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <button className="icon-btn" aria-label="Previous month"
                  disabled={cal.month <= CALENDAR_MONTH.month}
                  onClick={() => setCal((c) => ({ ...c, month: c.month - 1 }))}><ChevronLeft size={18} /></button>
                <strong style={{ minWidth: 110, textAlign: 'center', fontSize: '.9rem' }}>
                  {new Date(cal.year, cal.month, 1).toLocaleString('en', { month: 'long' })} {cal.year}
                </strong>
                <button className="icon-btn" aria-label="Next month"
                  disabled={cal.month >= 11}
                  onClick={() => setCal((c) => ({ ...c, month: c.month + 1 }))}><ChevronRight size={18} /></button>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: '.78rem' }}>
                {['present', 'absent', 'holiday'].map((k) => (
                  <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: calColors[k].bg }} aria-hidden="true" />
                    {calColors[k].label}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {attendanceData.map((s) => <MiniCalendar key={s.subject} subject={s.subject} year={cal.year} month={cal.month} />)}
            </div>
          </div>

          {/* History */}
          <div className="card">
            <div className="section-header"><h2 style={{ fontSize: '1.1rem' }}>Recent history</h2></div>
            <div className="list">
              {attendanceHistory.map((h) => {
                const s = attStatus[h.status];
                const Icon = s.icon;
                return (
                  <div className="row" key={h.id} style={{ alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <Icon size={18} style={{ color: s.color }} aria-hidden="true" />
                      <div>
                        <strong>{h.subject}</strong>
                        <div className="muted small">{h.date}</div>
                      </div>
                    </div>
                    <span style={{ color: s.color, fontWeight: 600, fontSize: '.85rem' }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <style>{`@media (max-width: 860px){ .classes-grid, .att-grid{ grid-template-columns: 1fr !important; } }
        .class-row{ grid-template-columns: 112px 1fr auto; }
        @media (max-width: 520px){ .class-row{ grid-template-columns: 76px 1fr !important; gap: 12px !important; padding: 14px 12px !important; } .class-row > :last-child{ grid-column: 2; justify-items: start !important; grid-auto-flow: column; gap: 8px !important; } }`}</style>
    </div>
  );
}