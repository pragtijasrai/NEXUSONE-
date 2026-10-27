import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { css, C } from './mStyles.js';
import { TICKETS } from './mData.js';

const HOURS = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM'];
const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const PALETTE = ['#818cf8','#34d399','#fbbf24','#60a5fa','#f87171','#a78bfa','#fb923c'];

/* Map tickets onto a week grid by date-index */
const WEEK_LABEL = '13 Oct – 19 Oct 2026';
const scheduled = [
  { day:'Mon', hour:'9:00 AM',  title:'AC Repair',       sub:'Room 101',    color:'#818cf8' },
  { day:'Tue', hour:'10:00 AM', title:'Projector',        sub:'Lab 1',       color:'#34d399' },
  { day:'Wed', hour:'11:00 AM', title:'Water Leakage',   sub:'Hostel B',    color:'#fbbf24' },
  { day:'Thu', hour:'10:00 AM', title:'Light Check',     sub:'Library',     color:'#60a5fa' },
  { day:'Sat', hour:'11:00 AM', title:'Door Lock',       sub:'Room 202',    color:'#f87171' },
  { day:'Fri', hour:'1:00 PM',  title:'Furniture Fix',   sub:'Seminar Hall',color:'#a78bfa' },
];

function CalEvent({ ev }) {
  return (
    <div style={{
      background:`${ev.color}22`, border:`1px solid ${ev.color}55`,
      borderRadius:8, padding:'6px 9px', margin:'4px 2px',
    }}>
      <div style={{fontSize:'.76rem',fontWeight:700,color:ev.color}}>{ev.title}</div>
      <div style={{fontSize:'.7rem',color:C.muted}}>{ev.sub}</div>
    </div>
  );
}

export default function MaintenanceSchedule() {
  const [view, setView] = useState('Week');

  return (
    <>
      <style>{css}</style>
      <div className="mp">
        <div style={{fontSize:'.78rem',color:C.muted,marginBottom:14}}>Home &rsaquo; <span style={{color:C.text}}>Schedule</span></div>
        <div style={{marginBottom:20}}>
          <h1>Maintenance Schedule</h1>
          <p className="mp-sub">View your assigned tasks and upcoming maintenance activities.</p>
        </div>

        <div className="mp-card">
          {/* Toolbar */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12,marginBottom:18}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <button className="mp-btn mp-btn-ghost mp-btn-sm" style={{padding:'0 8px'}}><ChevronLeft size={15}/></button>
              <span style={{fontSize:'.9rem',fontWeight:600,color:'#e2e8f0',minWidth:160,textAlign:'center'}}>{WEEK_LABEL}</span>
              <button className="mp-btn mp-btn-ghost mp-btn-sm" style={{padding:'0 8px'}}><ChevronRight size={15}/></button>
              <button className="mp-btn mp-btn-ghost mp-btn-sm">Today</button>
            </div>
            <div className="mp-tabs">
              {['Week','Month','List'].map(v=>(
                <button key={v} className={`mp-tab ${view===v?'mp-tab-active':''}`} onClick={()=>setView(v)}>{v}</button>
              ))}
            </div>
          </div>

          {/* Calendar grid */}
          <div style={{overflowX:'auto'}}>
            <div style={{display:'grid',gridTemplateColumns:`80px repeat(7,1fr)`,minWidth:700}}>
              {/* Header row */}
              <div style={{padding:'8px 0',borderBottom:`1px solid ${C.border}`}}/>
              {DAYS.map((d,i)=>(
                <div key={d} style={{padding:'8px 10px',borderBottom:`1px solid ${C.border}`,textAlign:'center'}}>
                  <div style={{fontSize:'.78rem',color:C.muted,fontWeight:600}}>{d}</div>
                  <div style={{fontSize:'.9rem',color:'#e2e8f0',fontWeight:700,marginTop:2}}>{13+i} Oct</div>
                </div>
              ))}

              {/* Body rows */}
              {HOURS.map(hour=>(
                <>
                  <div key={`h-${hour}`} style={{padding:'10px 8px',borderBottom:`1px solid rgba(255,255,255,.03)`,borderRight:`1px solid ${C.border}`,fontSize:'.75rem',color:C.muted,textAlign:'right',whiteSpace:'nowrap'}}>
                    {hour}
                  </div>
                  {DAYS.map(day=>{
                    const evs = scheduled.filter(e=>e.day===day&&e.hour===hour);
                    return (
                      <div key={`${day}-${hour}`} style={{borderBottom:`1px solid rgba(255,255,255,.03)`,borderRight:`1px solid rgba(255,255,255,.03)`,minHeight:52,padding:'2px 2px'}}>
                        {evs.map((ev,i)=><CalEvent key={i} ev={ev}/>)}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming list */}
        <div className="mp-card" style={{marginTop:16}}>
          <h2>Upcoming Tasks</h2>
          <div style={{display:'grid',gap:10}}>
            {scheduled.map((ev,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'10px 14px',background:'rgba(255,255,255,.03)',borderRadius:10,borderLeft:`3px solid ${ev.color}`}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,color:'#e2e8f0',fontSize:'.9rem'}}>{ev.title}</div>
                  <div style={{fontSize:'.78rem',color:C.muted,marginTop:2}}>{ev.sub} · {ev.day} {ev.hour}</div>
                </div>
                <span className="mp-badge mp-pending">Scheduled</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
