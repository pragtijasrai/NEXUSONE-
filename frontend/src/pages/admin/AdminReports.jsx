import { Download } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import AdminShell from './AdminShell.jsx';

const roomUsage = [
  { week:'Week 1', usage:65 }, { week:'Week 2', usage:78 },
  { week:'Week 3', usage:82 }, { week:'Week 4', usage:71 },
];

const bookingTrends = [
  { week:'Week 1', approved:45, pending:12 },
  { week:'Week 2', approved:58, pending:8  },
  { week:'Week 3', approved:72, pending:15 },
  { week:'Week 4', approved:61, pending:10 },
];

const topRooms = [
  { id:'R-203', usage:'82%' }, { id:'R-101', usage:'78%' },
  { id:'Lab-1', usage:'54%' }, { id:'B-155', usage:'49%' },
];

const bookingTrendTable = [
  { label:'Total Bookings', val:196, change:'+8%' },
  { label:'Approved',       val:170, change:'+6%' },
  { label:'Rejected',       val:26,  change:'-2%' },
];

const courseAttendance = [
  { code:'CS-201', pct:'87%' }, { code:'CS-301', pct:'82%' },
  { code:'CS-305', pct:'91%' }, { code:'CS-401', pct:'79%' },
];

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#1e2440', border:'1px solid rgba(255,255,255,.12)', borderRadius:8, padding:'8px 14px', fontSize:'.8rem', color:'#c5caf0' }}>
      <strong>{label}</strong>
      {payload.map((p,i)=><div key={i} style={{ color:p.color }}>{p.name}: {p.value}</div>)}
    </div>
  );
}

export default function AdminReports() {
  return (
    <AdminShell>
      <div className="ap-hdr">
        <div>
          <h1>Reports</h1>
          <p className="ap-sub">View analytics and generate reports</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <select className="ap-select">
            <option>Room Usage</option><option>Attendance</option><option>Bookings</option>
          </select>
          <select className="ap-select">
            <option>This Month</option><option>Last Month</option><option>This Year</option>
          </select>
          <button className="ap-btn ap-btn-primary">Generate Report</button>
        </div>
      </div>

      {/* Room Usage chart */}
      <div className="ap-card" style={{ marginBottom:16 }}>
        <div className="ap-card-hdr">
          <h2>Room Usage Statistics</h2>
          <span className="ap-badge ap-badge-blue">Weekly</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={roomUsage} margin={{ top:4, right:4, left:-24, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize:11, fill:'#7880a8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fill:'#7880a8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<DarkTooltip />} />
            <Bar dataKey="usage" fill="#4338ca" radius={[4,4,0,0]} name="Usage %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Three summary cards */}
      <div className="ap-g3" style={{ marginBottom:16 }}>

        {/* Most Used Rooms */}
        <div className="ap-card">
          <h2 style={{ marginBottom:14 }}>Most Used Rooms</h2>
          {topRooms.map((r,i)=>(
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:'.78rem', color:'#7880a8', width:16 }}>{i+1}.</span>
                <span className="ap-badge ap-badge-blue" style={{ fontSize:'.76rem' }}>{r.id}</span>
              </div>
              <span style={{ fontSize:'.84rem', color:'#34d399', fontWeight:600 }}>{r.usage}</span>
            </div>
          ))}
        </div>

        {/* Booking Trends */}
        <div className="ap-card">
          <h2 style={{ marginBottom:14 }}>Booking Trends</h2>
          {bookingTrendTable.map((b,i)=>(
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
              <span style={{ fontSize:'.84rem', color:'#7880a8' }}>{b.label}</span>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:'.9rem', color:'#eceefb', fontWeight:600 }}>{b.val}</span>
                <span style={{ fontSize:'.74rem', color:b.change.startsWith('+')?'#34d399':'#f87171' }}>{b.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Course Attendance */}
        <div className="ap-card">
          <h2 style={{ marginBottom:14 }}>Course Attendance</h2>
          {courseAttendance.map((c,i)=>(
            <div key={i} style={{ padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span className="ap-badge ap-badge-blue" style={{ fontSize:'.74rem' }}>{c.code}</span>
                <span style={{ fontSize:'.84rem', color:'#34d399', fontWeight:600 }}>{c.pct}</span>
              </div>
              <div className="ap-progress">
                <div className="ap-progress-fill" style={{ width:c.pct, background:'#4338ca' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Download */}
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <button className="ap-btn ap-btn-primary">
          <Download size={15} /> Download Report (PDF)
        </button>
      </div>
    </AdminShell>
  );
}
