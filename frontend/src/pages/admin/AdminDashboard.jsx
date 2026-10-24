import { Link } from 'react-router-dom';
import { Users, DoorOpen, Wrench, CalendarDays, TrendingUp, TrendingDown, Shield } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  adminStats, userDistribution, roomUtilisation,
  systemMetrics, recentActivity, allUsers,
} from '../../data/mockAdmin.js';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card">
      <div className="stat">
        <span className="stat__icon" style={{ background:`${color}18`, color }}>
          <Icon size={20} />
        </span>
        <div>
          <p className="stat__label muted small" style={{ margin:'0 0 2px' }}>{label}</p>
          <p className="stat__value">{value}</p>
          {sub && <p className="muted small" style={{ margin:'2px 0 0' }}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}

const roleColor = { student:'#4338ca', faculty:'#0ea5e9', admin:'#7c3aed', maintenance:'#f59e0b' };
const roleBadge = { student:'badge--primary', faculty:'badge--accent', admin:'badge--warn', maintenance:'badge--next' };

export default function AdminDashboard() {
  const { user } = useAuth();
  const roomUtil = Math.round((adminStats.roomsBooked / adminStats.roomsTotal) * 100);

  return (
    <div className="stack">
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1>Welcome, Admin! 🛡️</h1>
          <p className="muted">Here's today's campus overview at a glance.</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Link className="btn btn--ghost btn--sm" to="/admin/reports">Reports</Link>
          <Link className="btn btn--primary btn--sm" to="/admin/users">Manage Users</Link>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid--4">
        <StatCard icon={Users}      label="Total Users"        value={adminStats.totalUsers}   color="#4338ca" sub={`${adminStats.students} students`} />
        <StatCard icon={DoorOpen}   label="Rooms Booked"       value={adminStats.roomsBooked}  color="#0ea5e9" sub={`of ${adminStats.roomsTotal} total`} />
        <StatCard icon={Wrench}     label="Open Tickets"       value={adminStats.openTickets}  color="#f59e0b" sub="Maintenance requests" />
        <StatCard icon={CalendarDays} label="Upcoming Events"  value={adminStats.upcomingEvents} color="#7c3aed" sub="Next 30 days" />
      </div>

      {/* Charts row */}
      <div className="grid grid--2">
        {/* User distribution */}
        <section className="card" aria-labelledby="ud">
          <div className="section-header">
            <h2 id="ud">User Distribution</h2>
            <span className="badge badge--primary">{adminStats.totalUsers} total</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, alignItems:'center' }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={userDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                  {userDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:'grid', gap:8 }}>
              {userDistribution.map(d => (
                <div key={d.name} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:10, height:10, borderRadius:3, background:d.color, flexShrink:0 }} />
                  <span className="muted small" style={{ flex:1 }}>{d.name}</span>
                  <strong style={{ fontSize:'.88rem' }}>{d.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Room utilisation */}
        <section className="card" aria-labelledby="ru">
          <div className="section-header">
            <h2 id="ru">Room Utilisation</h2>
            <span className="badge badge--live">{roomUtil}%</span>
          </div>
          <div style={{ marginBottom:16 }}>
            <div className="progress">
              <div className="progress__fill progress__fill--ok" style={{ width:`${roomUtil}%` }} />
            </div>
            <p className="muted small" style={{ marginTop:6 }}>{adminStats.roomsBooked} of {adminStats.roomsTotal} rooms booked today</p>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={roomUtilisation} margin={{ top:0, right:0, bottom:0, left:-28 }}>
              <XAxis dataKey="day" tick={{ fontSize:11, fill:'var(--muted)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0,100]} tick={{ fontSize:11, fill:'var(--muted)' }} axisLine={false} tickLine={false} />
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <Bar dataKey="pct" fill="#4338ca" radius={[4,4,0,0]} />
              <Tooltip contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }} formatter={v=>[`${v}%`, 'Utilisation']} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      <div className="grid grid--2">
        {/* System metrics */}
        <section className="card" aria-labelledby="sm">
          <h2 id="sm">System Overview</h2>
          <div className="grid grid--2" style={{ gap:10 }}>
            {systemMetrics.map(m => (
              <div key={m.label} className="card" style={{ padding:14, margin:0 }}>
                <p className="muted small" style={{ margin:'0 0 4px' }}>{m.label}</p>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <strong style={{ fontSize:'1.4rem', fontWeight:800 }}>{m.value}</strong>
                  {m.delta==='up'
                    ? <TrendingUp size={16} style={{ color:'var(--ok)' }} />
                    : <TrendingDown size={16} style={{ color:'var(--danger)' }} />}
                </div>
                <p className="muted small" style={{ margin:'2px 0 0' }}>{m.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent activity */}
        <section className="card" aria-labelledby="ra">
          <div className="section-header">
            <h2 id="ra">Recent Activity</h2>
          </div>
          <ul className="list">
            {recentActivity.map((a, i) => (
              <li key={i} className="row" style={{ alignItems:'center' }}>
                <div style={{ display:'flex', gap:10, alignItems:'center', flex:1, minWidth:0 }}>
                  <div className="avatar avatar--sm" style={{ flexShrink:0 }}>
                    {a.user === 'System' ? '⚙' : a.user.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ margin:0, fontSize:'.85rem', fontWeight:500 }} className="truncate">{a.action}</p>
                    <p className="muted small" style={{ margin:0 }}>{a.user !== 'System' ? a.user : ''} · {a.time}</p>
                  </div>
                </div>
                <span className={`badge badge--${a.type==='user'?'primary':a.type==='room'?'accent':a.type==='event'?'done':'next'}`}>{a.type}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* User management table */}
      <section className="card" aria-labelledby="um">
        <div className="section-header">
          <h2 id="um">User Management</h2>
          <div style={{ display:'flex', gap:8 }}>
            <Link className="btn btn--ghost btn--sm" to="/admin/users">View All</Link>
            <Link className="btn btn--primary btn--sm" to="/admin/users">+ Add User</Link>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <div className="avatar avatar--sm" style={{ background: `${roleColor[u.role]}22`, color: roleColor[u.role] }}>
                        {u.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontSize:'.85rem', fontWeight:600 }}>{u.name}</div>
                        <div style={{ fontSize:'.75rem', color:'var(--muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${roleBadge[u.role]}`}>{u.role}</span></td>
                  <td className="muted small">{u.id}</td>
                  <td><span className={`badge badge--${u.status==='active'?'done':'next'}`}>{u.status}</span></td>
                  <td className="muted small">{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
