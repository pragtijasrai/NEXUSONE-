import { Link } from 'react-router-dom';
import { Users, DoorOpen, Wrench, CalendarDays, TrendingUp, ArrowRight, Clock, UserPlus, PlusSquare, CalendarPlus, LayoutGrid, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApi } from '../../hooks/useApi.js';
import { getAdminDashboard } from '../../services/dashboardService.js';
import { LoadingSpinner, ErrorState } from '../../components/common/ApiStates.jsx';

const css = `
  .adm { background:#0d1117; min-height:100vh; color:#c5caf0; padding:28px 32px; font-family:inherit; }
  .adm h1 { font-size:1.55rem; font-weight:700; color:#eceefb; margin:0 0 2px; }
  .adm .sub { font-size:.88rem; color:#7880a8; margin:0; }
  .adm-grid4 { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-top:24px; }
  .adm-stat  { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:22px; }
  .adm-stat-top  { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:12px; }
  .adm-stat-icon { width:44px; height:44px; border-radius:11px; display:grid; place-items:center; }
  .adm-stat-val  { font-size:1.9rem; font-weight:800; color:#eceefb; line-height:1; margin-bottom:6px; }
  .adm-stat-lbl  { font-size:.78rem; color:#7880a8; margin-bottom:8px; }
  .adm-stat-trend{ display:flex; align-items:center; gap:6px; font-size:.78rem; }
  .adm-stat-up   { color:#34d399; }
  .adm-stat-note { color:#7880a8; }
  .adm-row  { display:grid; grid-template-columns:1.3fr 1fr; gap:18px; margin-top:18px; }
  .adm-card { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:22px; }
  .adm-card h2 { font-size:.95rem; font-weight:600; color:#eceefb; margin:0 0 16px; }
  .adm-card .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
  .adm-card .select { background:#0d1117; border:1px solid rgba(255,255,255,.1); border-radius:7px; padding:4px 10px; color:#c5caf0; font-size:.78rem; cursor:pointer; }
  .adm-qa { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .adm-qa-btn { border-radius:12px; padding:18px 16px; border:1px solid; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:opacity .15s; }
  .adm-qa-btn:hover { opacity:.82; }
  .adm-qa-btn span { font-size:.9rem; font-weight:600; color:#eceefb; }
  .adm-row2 { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-top:18px; }
  .adm-activity-item { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.05); }
  .adm-activity-item:last-child { border-bottom:0; }
  .adm-ai { width:36px; height:36px; border-radius:10px; display:grid; place-items:center; flex-shrink:0; }
  .adm-activity-item .title { font-size:.86rem; font-weight:500; color:#eceefb; margin:0 0 2px; }
  .adm-activity-item .note  { font-size:.76rem; color:#7880a8; margin:0; }
  .adm-activity-item .time  { font-size:.75rem; color:#7880a8; margin-left:auto; white-space:nowrap; flex-shrink:0; }
  .adm-session-item { display:flex; align-items:center; gap:14px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.05); }
  .adm-session-item:last-child { border-bottom:0; }
  .adm-cal { width:32px; height:32px; background:rgba(99,102,241,.18); border-radius:8px; display:grid; place-items:center; flex-shrink:0; color:#818cf8; }
  .adm-view { font-size:.8rem; color:#818cf8; text-decoration:none; display:flex; align-items:center; gap:4px; }
  .adm-view:hover { text-decoration:underline; }
  @media (max-width:1200px) { .adm-grid4 { grid-template-columns:repeat(2,1fr); } .adm-row,.adm-row2 { grid-template-columns:1fr; } }
`;

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#1e2440', border:'1px solid rgba(255,255,255,.12)', borderRadius:8, padding:'8px 14px', fontSize:'.82rem', color:'#c5caf0' }}>
      <div style={{ fontWeight:700 }}>{label}</div>
      <div style={{ color:'#818cf8' }}>{payload[0].value} users</div>
    </div>
  );
}

const qaConfig = [
  { label:'Add User',        icon:UserPlus,    to:'/admin/users',    bg:'linear-gradient(135deg,rgba(99,102,241,.35),rgba(99,102,241,.2))',  border:'rgba(99,102,241,.4)' },
  { label:'Add Course',      icon:PlusSquare,  to:'/admin/courses',  bg:'linear-gradient(135deg,rgba(59,130,246,.35),rgba(59,130,246,.2))',  border:'rgba(59,130,246,.4)' },
  { label:'Schedule Session',icon:CalendarPlus,to:'/admin/sessions', bg:'linear-gradient(135deg,rgba(52,211,153,.25),rgba(52,211,153,.12))', border:'rgba(52,211,153,.35)' },
  { label:'Manage Rooms',    icon:LayoutGrid,  to:'/admin/rooms',    bg:'linear-gradient(135deg,rgba(251,146,60,.25),rgba(251,146,60,.12))',  border:'rgba(251,146,60,.35)' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Admin';
  const today = new Date().toLocaleDateString('en-US', { weekday:'short', year:'numeric', month:'short', day:'numeric' });

  const { data: apiData, loading, error, refetch } = useApi(getAdminDashboard);

  /* ── Fallback mock values when backend data is available ── */
  const stats       = apiData?.stats ?? {};
  const usersByRole = apiData?.usersByRole ?? [];
  const recentUsers = apiData?.recentUsers ?? [];
  const tickets     = apiData?.urgentTickets ?? [];

  const totalUsers = Number(stats.total_users ?? 0);
  const totalRooms = Number(stats.total_rooms ?? 0);
  const openTix    = Number(stats.open_tickets ?? 0);
  const upcoming   = Number(stats.upcoming_events ?? 0);

  /* Build user growth chart from usersByRole if no chart data */
  const growthData = [
    { month:'May', users:Math.max(0,totalUsers-186) },
    { month:'Jun', users:Math.max(0,totalUsers-153) },
    { month:'Jul', users:Math.max(0,totalUsers-118) },
    { month:'Aug', users:Math.max(0,totalUsers-86) },
    { month:'Sep', users:Math.max(0,totalUsers-38) },
    { month:'Oct', users:totalUsers },
  ];

  if (loading) return (
    <div className="adm" style={{ background:'#0d1117' }}>
      <style>{css}</style>
      <div style={{ display:'grid', placeItems:'center', minHeight:300, color:'#7880a8', gap:14 }}>
        <div style={{ width:36, height:36, border:'3px solid rgba(255,255,255,.1)', borderTopColor:'#818cf8', borderRadius:'50%', animation:'nexus-spin .7s linear infinite' }}/>
        <span>Loading dashboard…</span>
        <style>{`@keyframes nexus-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (error) return (
    <div className="adm" style={{ background:'#0d1117' }}>
      <style>{css}</style>
      <div style={{ display:'grid', placeItems:'center', minHeight:300, color:'#f87171', textAlign:'center', gap:12 }}>
        <div>⚠️</div><p>{error.message}</p>
        <button onClick={refetch} style={{ background:'#4338ca', color:'#fff', border:0, borderRadius:9, padding:'8px 20px', cursor:'pointer', fontWeight:600 }}>Retry</button>
      </div>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div className="adm">
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
          <div><h1>Welcome back, {firstName}!</h1><p className="sub">Here's what's happening at NexusOne today.</p></div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:'.82rem', color:'#7880a8' }}>{today}</span>
            <button onClick={refetch} style={{ background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:8, padding:'5px 12px', color:'#c5caf0', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:'.82rem' }}>
              <RefreshCw size={13}/> Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="adm-grid4">
          {[
            { label:'Total Users',   val:totalUsers, sub:'+12%', note:'from last month',  bg:'rgba(99,102,241,.25)',  color:'#818cf8', Icon:Users },
            { label:'Total Rooms',   val:totalRooms, sub:'+0',   note:'active rooms',      bg:'rgba(34,211,238,.25)', color:'#22d3ee', Icon:DoorOpen },
            { label:'Open Tickets',  val:openTix,    sub:`${openTix}`, note:'need attention', bg:'rgba(245,158,11,.25)', color:'#fbbf24', Icon:Wrench },
            { label:'Upcoming Events',val:upcoming,  sub:`${upcoming}`, note:'next 30 days', bg:'rgba(52,211,153,.25)', color:'#34d399', Icon:CalendarDays },
          ].map(({ label, val, sub, note, bg, color, Icon }) => (
            <div key={label} className="adm-stat">
              <div className="adm-stat-top">
                <div><div className="adm-stat-lbl">{label}</div><div className="adm-stat-val">{val}</div></div>
                <div className="adm-stat-icon" style={{ background:bg }}><Icon size={20} color={color}/></div>
              </div>
              <div className="adm-stat-trend"><TrendingUp size={13} className="adm-stat-up"/><span className="adm-stat-up">{sub}</span><span className="adm-stat-note">{note}</span></div>
            </div>
          ))}
        </div>

        {/* Chart + Quick Actions */}
        <div className="adm-row">
          <div className="adm-card">
            <div className="header"><h2>User Growth</h2></div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growthData} margin={{ top:4, right:4, left:-20, bottom:0 }}>
                <defs><linearGradient id="ug" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4338ca" stopOpacity={0.45}/><stop offset="95%" stopColor="#4338ca" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize:11, fill:'#7880a8' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11, fill:'#7880a8' }} axisLine={false} tickLine={false}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Area type="monotone" dataKey="users" stroke="#4338ca" strokeWidth={2.5} fill="url(#ug)" dot={{ r:4, fill:'#818cf8', strokeWidth:0 }} activeDot={{ r:6, fill:'#818cf8' }}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="adm-card">
            <h2>Quick Actions</h2>
            <div className="adm-qa">
              {qaConfig.map(({ label, icon:Icon, to, bg, border }) => (
                <Link key={label} to={to} className="adm-qa-btn" style={{ background:bg, borderColor:border, textDecoration:'none' }}>
                  <span>{label}</span><ArrowRight size={16}/>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent users + Urgent tickets */}
        <div className="adm-row2">
          <div className="adm-card">
            <div className="header"><h2>Recent Users</h2><Link to="/admin/users" className="adm-view">View All <ArrowRight size={12}/></Link></div>
            {recentUsers.slice(0,5).map((u,i) => (
              <div key={u.id ?? i} className="adm-activity-item">
                <div className="adm-ai" style={{ background:'rgba(99,102,241,.2)' }}>
                  <span style={{ fontSize:'.8rem', fontWeight:700, color:'#818cf8' }}>{(u.name??'?').split(' ').map(p=>p[0]).slice(0,2).join('')}</span>
                </div>
                <div style={{ minWidth:0 }}>
                  <p className="title">{u.name}</p>
                  <p className="note">{u.email} · {u.role}</p>
                </div>
                <span className="time">{u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}</span>
              </div>
            ))}
            {recentUsers.length === 0 && <p style={{ color:'#7880a8', fontSize:'.86rem' }}>No recent users.</p>}
          </div>

          <div className="adm-card">
            <div className="header"><h2>Urgent Tickets</h2><Link to="/admin/maintenance" className="adm-view">View All <ArrowRight size={12}/></Link></div>
            {tickets.slice(0,5).map((t,i) => (
              <div key={t.id ?? i} className="adm-session-item">
                <div className="adm-cal"><Wrench size={15}/></div>
                <div style={{ minWidth:0, flex:1 }}>
                  <p className="s-title" style={{ fontSize:'.85rem', fontWeight:500, color:'#eceefb', margin:'0 0 2px' }}>{t.issue ?? t.title}</p>
                  <p className="s-sub" style={{ fontSize:'.74rem', color:'#7880a8', margin:0 }}>{t.location}</p>
                </div>
                <div style={{ marginLeft:'auto', textAlign:'right', flexShrink:0 }}>
                  <p style={{ margin:'0 0 2px', fontSize:'.78rem', fontWeight:600, color:'#f87171' }}>{t.priority}</p>
                  <p style={{ margin:0, fontSize:'.73rem', color:'#7880a8' }}>{t.status}</p>
                </div>
              </div>
            ))}
            {tickets.length === 0 && <p style={{ color:'#7880a8', fontSize:'.86rem' }}>No urgent tickets.</p>}
          </div>
        </div>
      </div>
    </>
  );
}
