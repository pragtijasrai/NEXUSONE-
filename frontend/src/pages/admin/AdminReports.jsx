import { Download, RefreshCw } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts';
import { useApi } from '../../hooks/useApi.js';
import { LoadingSpinner, ErrorState } from '../../components/common/ApiStates.jsx';
import { getAdminDashboard } from '../../services/dashboardService.js';
import AdminShell from './AdminShell.jsx';

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#1e2440', border:'1px solid rgba(255,255,255,.12)', borderRadius:8, padding:'8px 14px', fontSize:'.8rem', color:'#c5caf0' }}>
      <strong>{label}</strong>
      {payload.map((p,i)=><div key={i} style={{ color:p.fill||p.color||'#818cf8' }}>{p.name||'Count'}: {p.value}</div>)}
    </div>
  );
}

const ROLE_COLORS = { student:'#4338ca', faculty:'#0ea5e9', admin:'#7c3aed', maintenance:'#f59e0b' };
const STATUS_COLORS = ['#fbbf24','#818cf8','#34d399','#f87171'];

export default function AdminReports() {
  const { data, loading, error, refetch } = useApi(getAdminDashboard);

  if (loading) return <AdminShell><LoadingSpinner message="Loading reports…" /></AdminShell>;
  if (error)   return <AdminShell><ErrorState error={error} onRetry={refetch} /></AdminShell>;

  const d = data ?? {};
  const stats        = d.stats ?? {};
  const usersByRole  = d.usersByRole ?? [];
  const roomUtil     = d.roomUtilByDay ?? [];
  const recentUsers  = d.recentUsers ?? [];
  const tickets      = d.urgentTickets ?? [];

  /* Build chart data from live DB */
  const userDist = usersByRole.map((r, i) => ({
    name: r.role, value: Number(r.count),
    color: ROLE_COLORS[r.role] ?? '#818cf8',
  }));

  const roomBarData = roomUtil.length > 0
    ? roomUtil.map(r => ({ day: r.day, bookings: Number(r.bookings) }))
    : [{ day:'No data', bookings:0 }];

  const statusData = [
    { name:'Open tickets',    value: Number(stats.open_tickets ?? 0),    color:'#f87171' },
    { name:'Total rooms',     value: Number(stats.total_rooms ?? 0),     color:'#818cf8' },
    { name:'Upcoming events', value: Number(stats.upcoming_events ?? 0), color:'#34d399' },
    { name:'Total users',     value: Number(stats.total_users ?? 0),     color:'#fbbf24' },
  ];

  return (
    <AdminShell>
      <div className="ap-hdr">
        <div>
          <h1>Reports</h1>
          <p className="ap-sub">View analytics and generate reports</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={refetch}><RefreshCw size={13}/> Refresh</button>
          <button className="ap-btn ap-btn-primary"><Download size={15}/> Export</button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="ap-g4" style={{ marginBottom:18 }}>
        {[
          { label:'Total Users',     val: Number(stats.total_users ?? 0),    color:'#818cf8', bg:'rgba(99,102,241,.15)'  },
          { label:'Total Rooms',     val: Number(stats.total_rooms ?? 0),    color:'#22d3ee', bg:'rgba(34,211,238,.15)'  },
          { label:'Open Tickets',    val: Number(stats.open_tickets ?? 0),   color:'#f87171', bg:'rgba(248,113,113,.15)' },
          { label:'Upcoming Events', val: Number(stats.upcoming_events ?? 0),color:'#34d399', bg:'rgba(52,211,153,.15)'  },
        ].map(c=>(
          <div key={c.label} className="ap-card" style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:c.bg, display:'grid', placeItems:'center', fontSize:'1.1rem', fontWeight:700, color:c.color }}>{c.val}</div>
            <span style={{ fontSize:'.84rem', color:'#7880a8' }}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="ap-g2" style={{ marginBottom:16 }}>

        {/* Room usage by day (live) */}
        <div className="ap-card">
          <div className="ap-card-hdr">
            <h2>Room Bookings (Last 7 days)</h2>
            <span className="ap-badge ap-badge-blue">Live</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={roomBarData} margin={{ top:4, right:4, left:-24, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize:11, fill:'#7880a8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#7880a8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="bookings" fill="#4338ca" radius={[4,4,0,0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User distribution (live) */}
        <div className="ap-card">
          <div className="ap-card-hdr"><h2>User Distribution</h2><span className="ap-badge ap-badge-blue">Live</span></div>
          <div style={{ display:'grid', gridTemplateColumns:'160px 1fr', gap:16, alignItems:'center' }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={userDist} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" strokeWidth={0}>
                  {userDist.map((d,i)=><Cell key={i} fill={d.color}/>)}
                </Pie>
                <Tooltip content={<DarkTooltip/>}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:'grid', gap:10 }}>
              {userDist.map(d=>(
                <div key={d.name} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:10, height:10, borderRadius:3, background:d.color, flexShrink:0 }}/>
                  <span style={{ fontSize:'.84rem', color:'#7880a8', flex:1, textTransform:'capitalize' }}>{d.name}</span>
                  <span style={{ fontSize:'.9rem', fontWeight:700, color:'#e2e8f0' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent users + urgent tickets */}
      <div className="ap-g2" style={{ marginBottom:16 }}>
        <div className="ap-card">
          <h2 style={{ marginBottom:14 }}>Recent Users</h2>
          {recentUsers.length === 0
            ? <p style={{ color:'#7880a8', fontSize:'.86rem' }}>No users yet.</p>
            : recentUsers.slice(0,6).map((u,i)=>(
              <div key={u.id ?? i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
                <div>
                  <div style={{ fontSize:'.86rem', color:'#eceefb', fontWeight:500 }}>{u.name}</div>
                  <div style={{ fontSize:'.76rem', color:'#7880a8' }}>{u.email}</div>
                </div>
                <span className={`ap-badge ${u.role==='student'?'ap-badge-blue':u.role==='faculty'?'ap-badge-cyan':u.role==='admin'?'ap-badge-yellow':'ap-badge-green'}`}>{u.role}</span>
              </div>
            ))
          }
        </div>

        <div className="ap-card">
          <h2 style={{ marginBottom:14 }}>Urgent Tickets</h2>
          {tickets.length === 0
            ? <p style={{ color:'#7880a8', fontSize:'.86rem' }}>No urgent tickets.</p>
            : tickets.map((t,i)=>(
              <div key={t.id ?? i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
                <div>
                  <div style={{ fontSize:'.86rem', color:'#eceefb', fontWeight:500 }}>{t.issue ?? t.title}</div>
                  <div style={{ fontSize:'.76rem', color:'#7880a8' }}>{t.location}</div>
                </div>
                <span className="ap-badge ap-badge-red">{t.priority}</span>
              </div>
            ))
          }
        </div>
      </div>
    </AdminShell>
  );
}
