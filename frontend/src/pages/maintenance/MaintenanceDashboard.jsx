import { Link } from 'react-router-dom';
import { Wrench, Clock, CheckCircle2, ClipboardList, CalendarClock, ArrowRight, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApi } from '../../hooks/useApi.js';
import { getMaintenanceDashboard } from '../../services/dashboardService.js';
import { LoadingSpinner, ErrorState } from '../../components/common/ApiStates.jsx';
import { css, C } from './mStyles.js';

const statusCls = { Pending:'mp-badge mp-pending', pending:'mp-badge mp-pending', 'In Progress':'mp-badge mp-inprogress', in_progress:'mp-badge mp-inprogress', Completed:'mp-badge mp-completed', resolved:'mp-badge mp-completed', closed:'mp-badge mp-completed' };

export default function MaintenanceDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Sam';
  const today = new Date().toLocaleDateString('en-US',{weekday:'short',day:'2-digit',month:'short',year:'numeric'});

  const { data, loading, error, refetch } = useApi(getMaintenanceDashboard);

  if (loading) return (
    <><style>{css}</style>
    <div className="mp" style={{ display:'grid', placeItems:'center', minHeight:300 }}>
      <div style={{ textAlign:'center', display:'grid', gap:14 }}>
        <div style={{ width:36, height:36, border:`3px solid ${C.border}`, borderTopColor:C.primary, borderRadius:'50%', animation:'nexus-spin .7s linear infinite', margin:'0 auto' }}/>
        <span style={{ color:C.muted }}>Loading dashboard…</span>
        <style>{`@keyframes nexus-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div></>
  );

  if (error) return (
    <><style>{css}</style>
    <div className="mp" style={{ display:'grid', placeItems:'center', minHeight:300 }}>
      <div style={{ textAlign:'center', color:C.muted }}>
        <p style={{ color:'#f87171' }}>{error.message}</p>
        <button onClick={refetch} className="mp-btn mp-btn-primary mp-btn-sm">Retry</button>
      </div>
    </div></>
  );

  const d        = data ?? {};
  const stats    = d.stats ?? {};
  const myTix    = d.myTickets ?? [];
  const openQ    = d.openQueue ?? [];

  const counts = {
    total:  Number(stats.total_active ?? openQ.length + myTix.length),
    pending: Number(stats.open_tickets ?? openQ.length),
    inProg:  Number(stats.in_progress  ?? myTix.filter(t=>t.status==='in_progress').length),
    done:    Number(stats.resolved_today ?? 0),
  };

  const catCount = [...myTix, ...openQ].reduce((acc,t) => {
    acc[t.category] = (acc[t.category]||0) + 1;
    return acc;
  }, {});

  return (
    <>
      <style>{css}</style>
      <div className="mp">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1>Dashboard</h1>
            <p className="mp-sub">Welcome back, {firstName}! Here's your maintenance overview.</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:'.82rem', color:C.muted }}>{today}</span>
            <button onClick={refetch} className="mp-btn mp-btn-ghost mp-btn-sm"><RefreshCw size={13}/> Refresh</button>
          </div>
        </div>

        {/* Stats */}
        <div className="mp-stats">
          {[
            {icon:ClipboardList, label:'Total Active',  val:counts.total,  bg:'rgba(99,102,241,.2)',  color:'#818cf8'},
            {icon:Clock,         label:'Open',           val:counts.pending,bg:'rgba(245,158,11,.2)', color:'#fbbf24'},
            {icon:Wrench,        label:'In Progress',    val:counts.inProg, bg:'rgba(59,130,246,.2)', color:'#60a5fa'},
            {icon:CheckCircle2,  label:'Resolved Today', val:counts.done,   bg:'rgba(52,211,153,.2)', color:'#34d399'},
          ].map(s=>(
            <div key={s.label} className="mp-stat">
              <div className="mp-stat-icon" style={{background:s.bg}}><s.icon size={20} color={s.color}/></div>
              <div><div className="mp-stat-val">{s.val}</div><div className="mp-stat-lbl">{s.label}</div></div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:16, marginTop:16 }}>
          {/* My assigned tickets */}
          <div className="mp-card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <h2 style={{ margin:0 }}>My Assigned Tickets</h2>
              <Link to="/maintenance/tickets" style={{ fontSize:'.8rem', color:'#818cf8', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                View All <ArrowRight size={12}/>
              </Link>
            </div>
            {(myTix.length === 0 ? openQ : myTix).slice(0,5).map(t => (
              <div key={t.id} style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:14, alignItems:'center', padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontWeight:500, color:'#e2e8f0', fontSize:'.88rem' }}>{t.issue ?? t.title}</div>
                  <div style={{ fontSize:'.76rem', color:C.muted, marginTop:2 }}>{t.location} · {t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}</div>
                </div>
                <span className={statusCls[t.status] ?? 'mp-badge mp-pending'}>{t.status}</span>
              </div>
            ))}
            {myTix.length === 0 && openQ.length === 0 && <p style={{ color:C.muted, fontSize:'.86rem' }}>No active tickets.</p>}
          </div>

          {/* Category breakdown + Quick actions */}
          <div style={{ display:'grid', gap:14 }}>
            {Object.keys(catCount).length > 0 && (
              <div className="mp-card">
                <h2>By Category</h2>
                <div style={{ display:'grid', gap:7 }}>
                  {Object.entries(catCount).map(([cat,cnt],i)=>{
                    const colors=['#818cf8','#34d399','#fbbf24','#60a5fa'];
                    return (
                      <div key={cat} style={{ display:'flex', justifyContent:'space-between', fontSize:'.82rem' }}>
                        <span style={{ display:'flex', alignItems:'center', gap:7 }}>
                          <span style={{ width:10, height:10, borderRadius:3, background:colors[i%colors.length], flexShrink:0 }}/>
                          <span style={{ color:C.muted }}>{cat}</span>
                        </span>
                        <span style={{ color:'#e2e8f0', fontWeight:600 }}>{cnt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="mp-card">
              <h2>Quick Actions</h2>
              <div style={{ display:'flex', gap:10 }}>
                <Link to="/maintenance/tickets" className="mp-btn mp-btn-primary" style={{ flex:1, justifyContent:'center', textDecoration:'none' }}>
                  <Plus size={14}/> New Request
                </Link>
                <Link to="/maintenance/schedule" className="mp-btn mp-btn-ghost" style={{ flex:1, justifyContent:'center', textDecoration:'none' }}>
                  <CalendarClock size={14}/> Schedule
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
