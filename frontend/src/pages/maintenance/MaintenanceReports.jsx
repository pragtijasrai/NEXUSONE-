import { ClipboardList, Clock, Wrench, CheckCircle2, RefreshCw } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useApi } from '../../hooks/useApi.js';
import { getMaintenanceDashboard } from '../../services/dashboardService.js';
import { getTickets } from '../../services/maintenanceService.js';
import { css, C } from './mStyles.js';

const BAR_COLORS = ['#818cf8','#34d399','#fbbf24','#60a5fa','#f87171'];

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#1e2d4a', border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 14px', fontSize:'.82rem', color:C.text }}>
      <strong>{label}</strong>
      {payload.map((p,i)=><div key={i} style={{ color:p.fill||p.color }}>{p.name||'Count'}: {p.value}</div>)}
    </div>
  );
}

export default function MaintenanceReports() {
  const { data: dashData, loading: dLoad, error: dErr, refetch } = useApi(getMaintenanceDashboard);
  const { data: ticketData, loading: tLoad } = useApi(getTickets);

  const stats   = dashData?.stats ?? {};
  const tickets = ticketData?.rows ?? [];

  const counts = {
    total:   Number(stats.total_active  ?? tickets.length),
    pending: Number(stats.open_tickets  ?? tickets.filter(t=>['open','pending','assigned'].includes(t.status)).length),
    inProg:  Number(stats.in_progress   ?? tickets.filter(t=>t.status==='in_progress').length),
    done:    Number(stats.resolved_today?? tickets.filter(t=>['resolved','closed'].includes(t.status)).length),
  };

  /* Build category chart from live tickets */
  const catMap = tickets.reduce((acc,t)=>{ acc[t.category]=(acc[t.category]||0)+1; return acc; },{});
  const catData = Object.entries(catMap).map(([name,value])=>({name,value}));

  const statusData = [
    { name:'Open/Assigned',  value: counts.pending, color:'#fbbf24' },
    { name:'In Progress',    value: counts.inProg,  color:'#818cf8' },
    { name:'Done Today',     value: counts.done,    color:'#34d399' },
  ];

  const loading = dLoad || tLoad;

  return (
    <>
      <style>{css}</style>
      <div className="mp">
        <div style={{ fontSize:'.78rem', color:C.muted, marginBottom:14 }}>
          Home &rsaquo; <span style={{ color:C.text }}>Reports</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:20 }}>
          <div>
            <h1>Maintenance Reports</h1>
            <p className="mp-sub">View maintenance statistics and generate reports.</p>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <button className="mp-btn mp-btn-ghost mp-btn-sm" onClick={refetch}><RefreshCw size={13}/> Refresh</button>
            <button className="mp-btn mp-btn-primary mp-btn-sm">Generate Report</button>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign:'center', padding:40, color:C.muted }}>Loading…</div>
        )}

        {!loading && (
          <>
            {/* Stat cards */}
            <div className="mp-stats" style={{ marginBottom:18 }}>
              {[
                { icon:ClipboardList, label:'Total Active',  val:counts.total,  bg:'rgba(99,102,241,.2)',  color:'#818cf8' },
                { icon:Clock,         label:'Open / Pending',val:counts.pending,bg:'rgba(245,158,11,.2)', color:'#fbbf24' },
                { icon:Wrench,        label:'In Progress',   val:counts.inProg, bg:'rgba(59,130,246,.2)', color:'#60a5fa' },
                { icon:CheckCircle2,  label:'Resolved Today',val:counts.done,   bg:'rgba(52,211,153,.2)', color:'#34d399' },
              ].map(s=>(
                <div key={s.label} className="mp-stat">
                  <div className="mp-stat-icon" style={{ background:s.bg }}><s.icon size={20} color={s.color}/></div>
                  <div><div className="mp-stat-val">{s.val}</div><div className="mp-stat-lbl">{s.label}</div></div>
                </div>
              ))}
            </div>

            {/* Charts */}
            {catData.length > 0 ? (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div className="mp-card">
                  <h2 style={{ marginBottom:16 }}>Requests by Category</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={catData} margin={{ top:4, right:4, left:-24, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false}/>
                      <XAxis dataKey="name" tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false}/>
                      <Tooltip content={<DarkTooltip/>}/>
                      <Bar dataKey="value" radius={[4,4,0,0]}>
                        {catData.map((_,i)=><Cell key={i} fill={BAR_COLORS[i%BAR_COLORS.length]}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mp-card">
                  <h2 style={{ marginBottom:16 }}>Request Status</h2>
                  <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" strokeWidth={0}>
                          {statusData.map((s,i)=><Cell key={i} fill={s.color}/>)}
                        </Pie>
                        <text x="50%" y="48%" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fff">{counts.total}</text>
                        <text x="50%" y="58%" textAnchor="middle" fontSize="10" fill={C.muted}>Requests</text>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display:'grid', gap:12 }}>
                      {statusData.map(s=>(
                        <div key={s.name} style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:10, height:10, borderRadius:3, background:s.color, flexShrink:0 }}/>
                          <span style={{ fontSize:'.84rem', color:C.muted, flex:1 }}>{s.name}</span>
                          <span style={{ fontSize:'.9rem', fontWeight:700, color:'#e2e8f0' }}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mp-card" style={{ textAlign:'center', padding:40, marginBottom:16 }}>
                <p style={{ color:C.muted }}>No ticket data available yet. Create tickets to see reports.</p>
              </div>
            )}

            {/* Recent tickets table */}
            <div className="mp-card">
              <h2 style={{ marginBottom:14 }}>Recent Requests</h2>
              {tickets.length === 0 ? (
                <p style={{ color:C.muted, fontSize:'.86rem' }}>No tickets found.</p>
              ) : (
                <div style={{ overflowX:'auto' }}>
                  <table className="mp-tbl">
                    <thead><tr><th>ID</th><th>Issue</th><th>Category</th><th>Location</th><th>Date</th><th>Status</th></tr></thead>
                    <tbody>
                      {tickets.slice(0,10).map(t=>(
                        <tr key={t.id}>
                          <td style={{ color:'#818cf8', fontFamily:'monospace', fontSize:'.8rem', fontWeight:700 }}>#{t.id}</td>
                          <td style={{ color:'#e2e8f0', fontWeight:500 }}>{t.issue ?? t.title}</td>
                          <td style={{ color:C.muted }}>{t.category}</td>
                          <td style={{ color:C.muted }}>{t.location}</td>
                          <td style={{ color:C.muted, fontSize:'.8rem' }}>{t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}</td>
                          <td>
                            <span className={`mp-badge ${['open','pending'].includes(t.status)?'mp-pending':t.status==='in_progress'?'mp-inprogress':'mp-completed'}`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
