/**
 * MaintenanceSchedule — /maintenance/schedule
 * Real API: GET /maintenance (shows assigned tickets as schedule)
 */
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarClock, Clock, MapPin } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import { getTickets } from '../../services/maintenanceService.js';
import { css, C } from './mStyles.js';

const DAYS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const HOURS = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];
const PAL   = ['#818cf8','#34d399','#fbbf24','#60a5fa','#f87171','#a78bfa','#fb923c'];

const statusCls = {
  open:'mp-badge mp-pending', assigned:'mp-badge mp-inprogress',
  in_progress:'mp-badge mp-inprogress', resolved:'mp-badge mp-completed', closed:'mp-badge mp-completed',
};

function CalEvent({ ev, color }) {
  return (
    <div style={{ background:`${color}22`, border:`1px solid ${color}55`, borderRadius:8, padding:'5px 8px', margin:'3px 2px', cursor:'default' }}>
      <div style={{ fontSize:'.72rem', fontWeight:700, color }}>{ev.issue?.slice(0,22) ?? 'Issue'}</div>
      <div style={{ fontSize:'.66rem', color:C.muted }}>{ev.location?.split(' - ')[0]}</div>
    </div>
  );
}

export default function MaintenanceSchedule() {
  const [view, setView] = useState('week');
  const [weekOffset, setWeekOffset] = useState(0);

  const { data, loading, error, refetch } = useApi(getTickets);
  const tickets = data?.rows ?? [];

  /* Map open/assigned/in-progress tickets onto the weekly grid by creation date */
  const activeTickets = useMemo(() =>
    tickets.filter(t => !['resolved','closed'].includes(t.status)),
  [tickets]);

  /* Compute the week start for the current offset */
  const today = new Date();
  const weekStart = new Date(today);
  const dow = today.getDay();
  weekStart.setDate(today.getDate() - dow + (weekOffset * 7));

  const weekLabel = (() => {
    const end = new Date(weekStart); end.setDate(weekStart.getDate() + 6);
    const fmtOpts = { month:'short', day:'numeric' };
    return `${weekStart.toLocaleDateString('en-US', fmtOpts)} – ${end.toLocaleDateString('en-US', { ...fmtOpts, year:'numeric' })}`;
  })();

  /* Assign tickets to days based on their creation date */
  const ticketsByDay = useMemo(() => {
    const map = {};
    DAYS.forEach((_, i) => { map[i] = []; });
    activeTickets.forEach((t, idx) => {
      const created = t.created_at ? new Date(t.created_at) : null;
      const dayIdx = created ? created.getDay() : (idx % 7);
      map[dayIdx] = [...(map[dayIdx] ?? []), { ...t, _color: PAL[idx % PAL.length] }];
    });
    return map;
  }, [activeTickets]);

  if (loading) return <><style>{css}</style><div className="mp"><LoadingSpinner message="Loading schedule…"/></div></>;
  if (error)   return <><style>{css}</style><div className="mp"><ErrorState error={error} onRetry={refetch}/></div></>;

  return (
    <>
      <style>{css}</style>
      <div className="mp">
        <div style={{ fontSize:'.78rem', color:C.muted, marginBottom:14 }}>
          Home &rsaquo; <span style={{ color:C.text }}>Schedule</span>
        </div>
        <div style={{ marginBottom:20 }}>
          <h1>Maintenance Schedule</h1>
          <p className="mp-sub">View assigned tickets and upcoming maintenance activities.</p>
        </div>

        <div className="mp-card">
          {/* Toolbar */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, marginBottom:18 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <button className="mp-btn mp-btn-ghost mp-btn-sm" style={{ padding:'0 8px' }} onClick={() => setWeekOffset(w=>w-1)}>
                <ChevronLeft size={15}/>
              </button>
              <span style={{ fontSize:'.9rem', fontWeight:600, color:'#e2e8f0', minWidth:200, textAlign:'center' }}>{weekLabel}</span>
              <button className="mp-btn mp-btn-ghost mp-btn-sm" style={{ padding:'0 8px' }} onClick={() => setWeekOffset(w=>w+1)}>
                <ChevronRight size={15}/>
              </button>
              <button className="mp-btn mp-btn-ghost mp-btn-sm" onClick={() => setWeekOffset(0)}>Today</button>
            </div>
            <div className="mp-tabs">
              {['week','list'].map(v => (
                <button key={v} className={`mp-tab ${view===v?'mp-tab-active':''}`} onClick={() => setView(v)}>
                  {v === 'week' ? 'Week' : 'List'}
                </button>
              ))}
            </div>
          </div>

          {view === 'week' ? (
            <div style={{ overflowX:'auto' }}>
              <div style={{ display:'grid', gridTemplateColumns:`80px repeat(7,1fr)`, minWidth:700 }}>
                {/* Header */}
                <div style={{ padding:'8px 0', borderBottom:`1px solid ${C.border}` }}/>
                {DAYS.map((d, i) => {
                  const dt = new Date(weekStart); dt.setDate(weekStart.getDate() + i);
                  const isToday = dt.toDateString() === today.toDateString();
                  return (
                    <div key={d} style={{ padding:'8px 10px', borderBottom:`1px solid ${C.border}`, textAlign:'center' }}>
                      <div style={{ fontSize:'.78rem', color:isToday ? C.primary : C.muted, fontWeight:600 }}>{d}</div>
                      <div style={{ fontSize:'.9rem', color:isToday ? '#fff' : '#e2e8f0', fontWeight:isToday?700:400, marginTop:2 }}>
                        {dt.getDate()}
                      </div>
                    </div>
                  );
                })}
                {/* Body rows */}
                {HOURS.map(hour => (
                  <div key={hour} style={{ display:'contents' }}>
                    <div style={{ padding:'10px 8px', borderBottom:`1px solid rgba(255,255,255,.03)`, borderRight:`1px solid ${C.border}`, fontSize:'.72rem', color:C.muted, textAlign:'right', whiteSpace:'nowrap' }}>
                      {hour}
                    </div>
                    {DAYS.map((_, dayIdx) => (
                      <div key={dayIdx} style={{ borderBottom:`1px solid rgba(255,255,255,.03)`, borderRight:`1px solid rgba(255,255,255,.03)`, minHeight:52, padding:'2px 2px' }}>
                        {/* Show first ticket of the day in the 9AM slot only */}
                        {hour === '9:00 AM' && (ticketsByDay[dayIdx] ?? []).map((ev, j) => (
                          <CalEvent key={j} ev={ev} color={ev._color}/>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Upcoming tickets list */}
        <div className="mp-card" style={{ marginTop:16 }}>
          <h2 style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <CalendarClock size={18} color={C.primary}/> Active Tickets ({activeTickets.length})
          </h2>
          {activeTickets.length === 0 ? (
            <EmptyState icon="✅" title="No active tickets" description="All tickets have been resolved." />
          ) : (
            <div style={{ display:'grid', gap:10 }}>
              {activeTickets.map((t, i) => (
                <div key={t.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 14px', background:'rgba(255,255,255,.03)', borderRadius:10, borderLeft:`3px solid ${PAL[i%PAL.length]}` }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, color:'#e2e8f0', fontSize:'.9rem', marginBottom:2 }}>{t.issue ?? t.title}</div>
                    <div style={{ fontSize:'.76rem', color:C.muted, display:'flex', gap:14, flexWrap:'wrap' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:4 }}><MapPin size={11}/>{t.location}</span>
                      <span style={{ display:'flex', alignItems:'center', gap:4 }}><Clock size={11}/>{t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <span className={statusCls[t.status] ?? 'mp-badge mp-pending'} style={{ marginBottom:4, display:'block' }}>{t.status}</span>
                    <span style={{ fontSize:'.72rem', color:t.priority==='urgent'||t.priority==='high'?'#f87171':C.muted }}>{t.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
