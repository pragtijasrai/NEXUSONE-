import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import AdminShell from './AdminShell.jsx';

const ROOMS = [
  { id:'R-101', name:'Main Classroom',  type:'Classroom',  capacity:60, status:'Available',  building:'Block A' },
  { id:'R-102', name:'Smart Classroom', type:'Classroom',  capacity:45, status:'Available',  building:'Block A' },
  { id:'B-203', name:'Lecture Hall',    type:'Lecture',    capacity:120,status:'Occupied',   building:'Block B' },
  { id:'B-205', name:'Seminar Hall',    type:'Seminar',    capacity:40, status:'Available',  building:'Block B' },
  { id:'Lab-1', name:'CS Lab',          type:'Lab',        capacity:50, status:'Available',  building:'Block C' },
  { id:'Lab-2', name:'AI/ML Lab',       type:'Lab',        capacity:30, status:'Maintenance',building:'Block C' },
  { id:'R-201', name:'Project Room',    type:'Classroom',  capacity:20, status:'Available',  building:'Block D' },
  { id:'R-301', name:'Conference Hall', type:'Conference', capacity:25, status:'Available',  building:'Block D' },
];

const statusBadge = { Available:'ap-badge-green', Occupied:'ap-badge-yellow', Maintenance:'ap-badge-red' };

export default function AdminRooms() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All Types');
  const [building, setBuilding] = useState('All Buildings');

  const filtered = ROOMS.filter(r =>
    (r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase())) &&
    (type === 'All Types' || r.type === type) &&
    (building === 'All Buildings' || r.building === building)
  );

  const counts = {
    total: ROOMS.length,
    available: ROOMS.filter(r=>r.status==='Available').length,
    occupied:  ROOMS.filter(r=>r.status==='Occupied').length,
    maintenance: ROOMS.filter(r=>r.status==='Maintenance').length,
  };

  return (
    <AdminShell>
      <div className="ap-hdr">
        <div>
          <h1>Rooms</h1>
          <p className="ap-sub">Manage classrooms, labs, and seminar halls</p>
        </div>
        <button className="ap-btn ap-btn-primary"><Plus size={15} /> Add Room</button>
      </div>

      {/* Summary chips */}
      <div className="ap-g4" style={{ marginBottom:18 }}>
        {[
          { label:'Total Rooms',  val:counts.total,       color:'#818cf8', bg:'rgba(99,102,241,.15)' },
          { label:'Available',    val:counts.available,   color:'#34d399', bg:'rgba(52,211,153,.15)' },
          { label:'Occupied',     val:counts.occupied,    color:'#fbbf24', bg:'rgba(251,191,36,.15)' },
          { label:'Maintenance',  val:counts.maintenance, color:'#f87171', bg:'rgba(248,113,113,.15)' },
        ].map(c=>(
          <div key={c.label} className="ap-card" style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:c.bg, display:'grid', placeItems:'center', fontSize:'1.1rem', fontWeight:700, color:c.color }}>{c.val}</div>
            <span style={{ fontSize:'.84rem', color:'#7880a8' }}>{c.label}</span>
          </div>
        ))}
      </div>

      <div className="ap-card">
        <div className="ap-bar">
          <div className="ap-search">
            <Search size={14} color="#7880a8" />
            <input placeholder="Search rooms..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select className="ap-select" value={type} onChange={e=>setType(e.target.value)}>
            <option>All Types</option>
            {['Classroom','Lecture','Seminar','Lab','Conference'].map(t=><option key={t}>{t}</option>)}
          </select>
          <select className="ap-select" value={building} onChange={e=>setBuilding(e.target.value)}>
            <option>All Buildings</option>
            {['Block A','Block B','Block C','Block D'].map(b=><option key={b}>{b}</option>)}
          </select>
        </div>

        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr><th>Room No</th><th>Name</th><th>Type</th><th>Capacity</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(r=>(
                <tr key={r.id}>
                  <td><span className="ap-badge ap-badge-blue">{r.id}</span></td>
                  <td style={{ color:'#eceefb', fontWeight:500 }}>{r.name}</td>
                  <td style={{ color:'#7880a8' }}>{r.type}</td>
                  <td style={{ color:'#c5caf0' }}>{r.capacity}</td>
                  <td><span className={`ap-badge ${statusBadge[r.status]}`}>{r.status}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="ap-btn ap-btn-ghost ap-btn-sm">Edit</button>
                      <button className="ap-btn ap-btn-danger ap-btn-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ap-pages">
          <span className="ap-page-info">Showing 1–{filtered.length} of 32 rooms</span>
          {[1,2,3,4,'...'].map((p,i)=><button key={i} className={`ap-page ${p===1?'ap-page-active':''}`}>{p}</button>)}
        </div>
      </div>
    </AdminShell>
  );
}
