import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Clock, CheckCircle2, ClipboardList, CalendarClock, ArrowRight, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { css, C } from './mStyles.js';
import { TICKETS } from './mData.js';

const statusCls = { Pending:'mp-badge mp-pending', 'In Progress':'mp-badge mp-inprogress', Completed:'mp-badge mp-completed' };

export default function MaintenanceDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Sam';
  const today = new Date().toLocaleDateString('en-US',{weekday:'short',day:'2-digit',month:'short',year:'numeric'});

  const counts = {
    total:  TICKETS.length,
    pending: TICKETS.filter(t=>t.status==='Pending').length,
    inProg:  TICKETS.filter(t=>t.status==='In Progress').length,
    done:    TICKETS.filter(t=>t.status==='Completed').length,
  };

  const catCount = TICKETS.reduce((acc,t)=>{ acc[t.category]=(acc[t.category]||0)+1; return acc; },{});

  const recent = TICKETS.slice(0,5);

  return (
    <>
      <style>{css}</style>
      <div className="mp">
        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
          <div>
            <h1>Dashboard</h1>
            <p className="mp-sub">Welcome back, {firstName}! Here's an overview of maintenance activities.</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:'.82rem',color:C.muted}}>{today}</span>
            <span style={{fontSize:'1.4rem'}}>🔧</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mp-stats">
          {[
            {icon:ClipboardList, label:'Total Requests', val:counts.total,  bg:'rgba(99,102,241,.2)',  color:'#818cf8'},
            {icon:Clock,         label:'Pending',         val:counts.pending,bg:'rgba(245,158,11,.2)', color:'#fbbf24'},
            {icon:Wrench,        label:'In Progress',     val:counts.inProg, bg:'rgba(59,130,246,.2)', color:'#60a5fa'},
            {icon:CheckCircle2,  label:'Completed',       val:counts.done,   bg:'rgba(52,211,153,.2)', color:'#34d399'},
          ].map(s=>(
            <div key={s.label} className="mp-stat">
              <div className="mp-stat-icon" style={{background:s.bg}}><s.icon size={20} color={s.color}/></div>
              <div><div className="mp-stat-val">{s.val}</div><div className="mp-stat-lbl">{s.label}</div></div>
            </div>
          ))}
        </div>

        {/* Two-column */}
        <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:16,marginTop:16}}>

          {/* Recent requests */}
          <div className="mp-card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <h2 style={{margin:0}}>Recent Maintenance Requests</h2>
              <Link to="/maintenance/tickets" style={{fontSize:'.8rem',color:'#818cf8',textDecoration:'none',display:'flex',alignItems:'center',gap:4}}>
                View All <ArrowRight size={12}/>
              </Link>
            </div>
            <table className="mp-tbl">
              <thead><tr><th>ID</th><th>Title</th><th>Location</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {recent.map(t=>(
                  <tr key={t.id}>
                    <td style={{color:'#818cf8',fontFamily:'monospace',fontSize:'.8rem',fontWeight:700}}>{t.id}</td>
                    <td style={{color:'#e2e8f0',fontWeight:500}}>{t.title}</td>
                    <td style={{color:C.muted,fontSize:'.82rem'}}>{t.location}</td>
                    <td style={{color:C.muted,fontSize:'.8rem'}}>{t.date}</td>
                    <td><span className={statusCls[t.status]}>{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right column */}
          <div style={{display:'grid',gap:14}}>
            {/* Category donut */}
            <div className="mp-card">
              <h2>Maintenance by Category</h2>
              <div style={{display:'flex',alignItems:'center',gap:20}}>
                {/* Simple SVG donut */}
                <div style={{position:'relative',flexShrink:0}}>
                  <svg width="100" height="100" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="5"/>
                    {(() => {
                      const colors=['#818cf8','#34d399','#fbbf24','#60a5fa'];
                      const entries=Object.entries(catCount);
                      const total=entries.reduce((s,[,v])=>s+v,0);
                      let offset=0;
                      return entries.map(([cat,cnt],i)=>{
                        const pct=cnt/total;
                        const dash=pct*94.2;
                        const el=(
                          <circle key={cat} cx="18" cy="18" r="15" fill="none"
                            stroke={colors[i%colors.length]} strokeWidth="5"
                            strokeDasharray={`${dash} ${94.2-dash}`}
                            strokeDashoffset={-offset}
                            transform="rotate(-90 18 18)"/>
                        );
                        offset+=dash;
                        return el;
                      });
                    })()}
                    <text x="18" y="20" textAnchor="middle" fontSize="6" fill="#fff" fontWeight="700">{counts.total}</text>
                    <text x="18" y="25" textAnchor="middle" fontSize="4" fill={C.muted}>Requests</text>
                  </svg>
                </div>
                <div style={{display:'grid',gap:7,flex:1}}>
                  {Object.entries(catCount).map(([cat,cnt],i)=>{
                    const colors=['#818cf8','#34d399','#fbbf24','#60a5fa'];
                    return(
                      <div key={cat} style={{display:'flex',justifyContent:'space-between',fontSize:'.82rem'}}>
                        <span style={{display:'flex',alignItems:'center',gap:7}}>
                          <span style={{width:10,height:10,borderRadius:3,background:colors[i%colors.length],flexShrink:0}}/>
                          <span style={{color:C.muted}}>{cat}</span>
                        </span>
                        <span style={{color:'#e2e8f0',fontWeight:600}}>{cnt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="mp-card">
              <h2>Quick Actions</h2>
              <div style={{display:'flex',gap:10}}>
                <Link to="/maintenance/tickets" className="mp-btn mp-btn-primary" style={{flex:1,justifyContent:'center',textDecoration:'none'}}>
                  <Plus size={14}/> New Request
                </Link>
                <Link to="/maintenance/schedule" className="mp-btn mp-btn-ghost" style={{flex:1,justifyContent:'center',textDecoration:'none'}}>
                  <CalendarClock size={14}/> View Schedule
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
