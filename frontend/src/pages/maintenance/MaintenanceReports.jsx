import { ClipboardList, Clock, Wrench, CheckCircle2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { css, C } from './mStyles.js';
import { TICKETS } from './mData.js';

const catData = Object.entries(
  TICKETS.reduce((acc,t)=>{ acc[t.category]=(acc[t.category]||0)+1; return acc; },{})
).map(([name,value])=>({name,value}));

const statusData = [
  { name:'Pending',     value:TICKETS.filter(t=>t.status==='Pending').length,     color:'#fbbf24' },
  { name:'In Progress', value:TICKETS.filter(t=>t.status==='In Progress').length, color:'#818cf8' },
  { name:'Completed',   value:TICKETS.filter(t=>t.status==='Completed').length,   color:'#34d399' },
];

const BAR_COLORS = ['#818cf8','#34d399','#fbbf24','#60a5fa','#f87171'];

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'#1e2d4a',border:`1px solid ${C.border}`,borderRadius:8,padding:'8px 14px',fontSize:'.82rem',color:C.text}}>
      <strong>{label}</strong>
      {payload.map((p,i)=><div key={i} style={{color:p.fill||p.color}}>{p.name||'Count'}: {p.value}</div>)}
    </div>
  );
}

export default function MaintenanceReports() {
  const counts = {
    total:  TICKETS.length,
    pending: TICKETS.filter(t=>t.status==='Pending').length,
    inProg:  TICKETS.filter(t=>t.status==='In Progress').length,
    done:    TICKETS.filter(t=>t.status==='Completed').length,
  };

  return (
    <>
      <style>{css}</style>
      <div className="mp">
        <div style={{fontSize:'.78rem',color:C.muted,marginBottom:14}}>Home &rsaquo; <span style={{color:C.text}}>Reports</span></div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12,marginBottom:20}}>
          <div>
            <h1>Maintenance Reports</h1>
            <p className="mp-sub">View maintenance statistics and generate reports.</p>
          </div>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <div style={{background:'rgba(255,255,255,.06)',border:`1px solid ${C.border}`,borderRadius:8,padding:'6px 14px',fontSize:'.82rem',color:C.muted}}>
              📅 1 Oct 2026 – 31 Oct 2026
            </div>
            <button className="mp-btn mp-btn-primary mp-btn-sm">Generate Report</button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mp-stats" style={{marginBottom:18}}>
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

        {/* Charts row */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>

          {/* Bar chart — Requests by Category */}
          <div className="mp-card">
            <h2 style={{marginBottom:16}}>Requests by Category</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catData} margin={{top:4,right:4,left:-24,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false}/>
                <XAxis dataKey="name" tick={{fontSize:11,fill:C.muted}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:C.muted}} axisLine={false} tickLine={false}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Bar dataKey="value" radius={[5,5,0,0]}>
                  {catData.map((_,i)=><Cell key={i} fill={BAR_COLORS[i%BAR_COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut chart — Request Status */}
          <div className="mp-card">
            <h2 style={{marginBottom:16}}>Request Status</h2>
            <div style={{display:'flex',alignItems:'center',gap:20}}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" strokeWidth={0}>
                    {statusData.map((s,i)=><Cell key={i} fill={s.color}/>)}
                  </Pie>
                  <text x="50%" y="48%" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fff">{counts.total}</text>
                  <text x="50%" y="58%" textAnchor="middle" fontSize="10" fill={C.muted}>Requests</text>
                </PieChart>
              </ResponsiveContainer>
              <div style={{display:'grid',gap:12}}>
                {statusData.map(s=>(
                  <div key={s.name} style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:10,height:10,borderRadius:3,background:s.color,flexShrink:0}}/>
                    <span style={{fontSize:'.84rem',color:C.muted,flex:1}}>{s.name}</span>
                    <span style={{fontSize:'.9rem',fontWeight:700,color:'#e2e8f0'}}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent tickets summary */}
        <div className="mp-card" style={{marginTop:16}}>
          <h2 style={{marginBottom:14}}>Recent Requests</h2>
          <div style={{overflowX:'auto'}}>
            <table className="mp-tbl">
              <thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Location</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {TICKETS.map(t=>(
                  <tr key={t.id}>
                    <td style={{color:'#818cf8',fontFamily:'monospace',fontSize:'.8rem',fontWeight:700}}>{t.id}</td>
                    <td style={{color:'#e2e8f0',fontWeight:500}}>{t.title}</td>
                    <td style={{color:C.muted}}>{t.category}</td>
                    <td style={{color:C.muted}}>{t.location}</td>
                    <td style={{color:C.muted,fontSize:'.8rem'}}>{t.date}</td>
                    <td>
                      <span className={`mp-badge ${t.status==='Pending'?'mp-pending':t.status==='In Progress'?'mp-inprogress':'mp-completed'}`}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
