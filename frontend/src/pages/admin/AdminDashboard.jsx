import { Link } from 'react-router-dom';
import {
  Users, BookOpen, CalendarCheck, DoorOpen,
  TrendingUp, ArrowRight, Clock,
  UserPlus, PlusSquare, CalendarPlus, LayoutGrid,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useAuth } from '../../context/AuthContext.jsx';

/* ── Mock data shaped to match the screenshot ── */
const stats = [
  {
    label: 'Total Users',
    value: 248,
    sub: '+12%',
    subNote: 'from last month',
    trend: 'up',
    icon: Users,
    iconBg: 'rgba(99,102,241,.25)',
    iconColor: '#818cf8',
  },
  {
    label: 'Total Courses',
    value: 12,
    sub: '+2',
    subNote: 'new this month',
    trend: 'up',
    icon: BookOpen,
    iconBg: 'rgba(34,211,238,.25)',
    iconColor: '#22d3ee',
  },
  {
    label: 'Active Class Sessions',
    value: 8,
    sub: '+3',
    subNote: 'from last week',
    trend: 'up',
    icon: CalendarCheck,
    iconBg: 'rgba(52,211,153,.25)',
    iconColor: '#34d399',
  },
  {
    label: 'Rooms Available',
    value: 6,
    sub: '2',
    subNote: 'currently booked',
    trend: 'neutral',
    icon: DoorOpen,
    iconBg: 'rgba(251,146,60,.25)',
    iconColor: '#fb923c',
  },
];

const userGrowthData = [
  { month: 'May', users: 62  },
  { month: 'Jun', users: 95  },
  { month: 'Jul', users: 130 },
  { month: 'Aug', users: 162 },
  { month: 'Sep', users: 210 },
  { month: 'Oct', users: 248 },
];

const quickActions = [
  {
    label: 'Add User',
    icon: UserPlus,
    to: '/admin/users',
    bg: 'linear-gradient(135deg,rgba(99,102,241,.35),rgba(99,102,241,.2))',
    border: 'rgba(99,102,241,.4)',
  },
  {
    label: 'Add Course',
    icon: PlusSquare,
    to: '/admin/courses',
    bg: 'linear-gradient(135deg,rgba(59,130,246,.35),rgba(59,130,246,.2))',
    border: 'rgba(59,130,246,.4)',
  },
  {
    label: 'Schedule Session',
    icon: CalendarPlus,
    to: '/admin/sessions',
    bg: 'linear-gradient(135deg,rgba(52,211,153,.25),rgba(52,211,153,.12))',
    border: 'rgba(52,211,153,.35)',
  },
  {
    label: 'Manage Rooms',
    icon: LayoutGrid,
    to: '/admin/rooms',
    bg: 'linear-gradient(135deg,rgba(251,146,60,.25),rgba(251,146,60,.12))',
    border: 'rgba(251,146,60,.35)',
  },
];

const recentActivity = [
  {
    type: 'user',
    title: 'New user registered',
    sub: 'Aditi Verma (Student)',
    time: '2 hours ago',
    iconBg: 'rgba(99,102,241,.3)',
    iconColor: '#818cf8',
    Icon: UserPlus,
  },
  {
    type: 'course',
    title: 'Course added',
    sub: 'Web Development',
    time: '4 hours ago',
    iconBg: 'rgba(34,211,238,.3)',
    iconColor: '#22d3ee',
    Icon: BookOpen,
  },
  {
    type: 'room',
    title: 'Room booked',
    sub: 'Room 101 · 10:00 AM to 11:00 AM',
    time: '5 hours ago',
    iconBg: 'rgba(251,146,60,.3)',
    iconColor: '#fb923c',
    Icon: DoorOpen,
  },
  {
    type: 'attendance',
    title: 'Attendance marked',
    sub: 'DSA · 3rd Year',
    time: '6 hours ago',
    iconBg: 'rgba(52,211,153,.3)',
    iconColor: '#34d399',
    Icon: CalendarCheck,
  },
];

const upcomingSessions = [
  { subject: 'Data Structures',          code: 'CS',   room: 'Room 101', day: 'Today',    time: '04:00 PM – 05:00 PM' },
  { subject: 'Database Management Systems',code: 'DBMS', room: 'Room 103', day: 'Today',    time: '06:00 PM – 07:00 PM' },
  { subject: 'Operating Systems',         code: 'CS',   room: 'Room 102', day: 'Tomorrow', time: '04:00 PM – 05:00 PM' },
  { subject: 'Computer Networks',         code: 'CN',   room: 'Room 105', day: 'Tomorrow', time: '07:00 PM – 08:00 PM' },
];

/* ── Custom tooltip for the chart ── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1e2440', border: '1px solid rgba(255,255,255,.12)',
      borderRadius: 8, padding: '8px 14px', fontSize: '.82rem', color: '#c5caf0',
    }}>
      <div style={{ marginBottom: 2, fontWeight: 700 }}>{label}</div>
      <div style={{ color: '#818cf8' }}>{payload[0].value} users</div>
    </div>
  );
}

/* ─── Admin stylesheet scoped to this page ─── */
const css = `
  .adm { background: #0d1117; min-height: 100vh; color: #c5caf0; font-family: inherit; padding: 28px 32px; }
  .adm h1 { font-size: 1.55rem; font-weight: 700; color: #eceefb; margin: 0 0 2px; }
  .adm .sub { font-size: .88rem; color: #7880a8; margin: 0; }
  .adm .date-chip { display:flex; align-items:center; gap:6px; background:#161b2e; border:1px solid rgba(255,255,255,.08); border-radius:8px; padding:6px 14px; font-size:.82rem; color:#7880a8; }
  
  .adm-grid4 { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-top:24px; }
  .adm-stat  { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:22px; }
  .adm-stat__top  { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:12px; }
  .adm-stat__icon { width:44px; height:44px; border-radius:11px; display:grid; place-items:center; }
  .adm-stat__val  { font-size:1.9rem; font-weight:800; color:#eceefb; line-height:1; margin-bottom:6px; }
  .adm-stat__lbl  { font-size:.78rem; color:#7880a8; margin-bottom:8px; }
  .adm-stat__trend{ display:flex; align-items:center; gap:6px; font-size:.78rem; }
  .adm-stat__up   { color:#34d399; }
  .adm-stat__note { color:#7880a8; }

  .adm-row { display:grid; grid-template-columns:1.3fr 1fr; gap:18px; margin-top:18px; }
  .adm-card { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:22px; }
  .adm-card h2 { font-size:.95rem; font-weight:600; color:#eceefb; margin:0 0 16px; }
  .adm-card .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
  .adm-card .select { background:#0d1117; border:1px solid rgba(255,255,255,.1); border-radius:7px; padding:4px 10px; color:#c5caf0; font-size:.78rem; cursor:pointer; }
  
  .adm-qa { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .adm-qa-btn { border-radius:12px; padding:18px 16px; border:1px solid; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:opacity .15s; }
  .adm-qa-btn:hover { opacity:.82; }
  .adm-qa-btn span { font-size:.9rem; font-weight:600; color:#eceefb; }
  .adm-qa-btn svg { color:rgba(255,255,255,.5); }

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
  .adm-session-item .s-title { font-size:.85rem; font-weight:500; color:#eceefb; margin:0 0 2px; }
  .adm-session-item .s-sub   { font-size:.74rem; color:#7880a8; margin:0; }
  .adm-session-item .s-right { margin-left:auto; text-align:right; flex-shrink:0; }
  .adm-session-item .s-day   { font-size:.78rem; font-weight:600; color:#818cf8; margin:0 0 2px; }
  .adm-session-item .s-time  { font-size:.73rem; color:#7880a8; margin:0; }

  .adm-view { font-size:.8rem; color:#818cf8; text-decoration:none; display:flex; align-items:center; gap:4px; }
  .adm-view:hover { text-decoration:underline; }

  @media (max-width:1200px) {
    .adm-grid4 { grid-template-columns:repeat(2,1fr); }
    .adm-row  { grid-template-columns:1fr; }
    .adm-row2 { grid-template-columns:1fr; }
  }
  @media (max-width:680px) {
    .adm { padding:16px; }
    .adm-grid4 { grid-template-columns:1fr 1fr; gap:12px; }
  }
`;

export default function AdminDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Admin';

  /* format today's date */
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <>
      <style>{css}</style>
      <div className="adm">

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1>Welcome back, {firstName}!</h1>
            <p className="sub">Here&rsquo;s what&rsquo;s happening at NexusOne today.</p>
          </div>
          <div className="date-chip">
            <CalendarCheck size={14} />
            {today}
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="adm-grid4">
          {stats.map(({ label, value, sub, subNote, icon: Icon, iconBg, iconColor }) => (
            <div className="adm-stat" key={label}>
              <div className="adm-stat__top">
                <div>
                  <div className="adm-stat__lbl">{label}</div>
                  <div className="adm-stat__val">{value}</div>
                </div>
                <div className="adm-stat__icon" style={{ background: iconBg }}>
                  <Icon size={20} color={iconColor} />
                </div>
              </div>
              <div className="adm-stat__trend">
                <TrendingUp size={13} className="adm-stat__up" />
                <span className="adm-stat__up">{sub}</span>
                <span className="adm-stat__note">{subNote}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Row: Chart + Quick Actions ── */}
        <div className="adm-row">

          {/* User Growth chart */}
          <div className="adm-card">
            <div className="header">
              <h2>User Growth</h2>
              <select className="select" defaultValue="6m">
                <option value="6m">Last 6 Months</option>
                <option value="3m">Last 3 Months</option>
                <option value="1y">This Year</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={userGrowthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ug" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4338ca" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#4338ca" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7880a8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#7880a8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="users"
                  stroke="#4338ca" strokeWidth={2.5}
                  fill="url(#ug)"
                  dot={{ r: 4, fill: '#818cf8', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#818cf8' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Actions */}
          <div className="adm-card">
            <h2>Quick Actions</h2>
            <div className="adm-qa">
              {quickActions.map(({ label, icon: Icon, to, bg, border }) => (
                <Link
                  key={label}
                  to={to}
                  className="adm-qa-btn"
                  style={{ background: bg, borderColor: border, textDecoration: 'none' }}
                >
                  <span>{label}</span>
                  <ArrowRight size={16} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row: Recent Activity + Upcoming Sessions ── */}
        <div className="adm-row2">

          {/* Recent Activity */}
          <div className="adm-card">
            <div className="header">
              <h2>Recent Activity</h2>
              <Link to="/admin/reports" className="adm-view">View All <ArrowRight size={12} /></Link>
            </div>
            {recentActivity.map((a, i) => (
              <div className="adm-activity-item" key={i}>
                <div className="adm-ai" style={{ background: a.iconBg }}>
                  <a.Icon size={16} color={a.iconColor} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p className="title">{a.title}</p>
                  <p className="note">{a.sub}</p>
                </div>
                <span className="time">{a.time}</span>
              </div>
            ))}
          </div>

          {/* Upcoming Sessions */}
          <div className="adm-card">
            <div className="header">
              <h2>Upcoming Sessions</h2>
              <Link to="/admin/sessions" className="adm-view">View All <ArrowRight size={12} /></Link>
            </div>
            {upcomingSessions.map((s, i) => (
              <div className="adm-session-item" key={i}>
                <div className="adm-cal">
                  <Clock size={15} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p className="s-title">{s.subject}</p>
                  <p className="s-sub">{s.code} &nbsp;·&nbsp; {s.room}</p>
                </div>
                <div className="s-right">
                  <p className="s-day">{s.day}</p>
                  <p className="s-time">{s.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
