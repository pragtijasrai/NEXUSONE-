import { useState } from 'react';
import { Search, Check, X } from 'lucide-react';
import AdminShell from './AdminShell.jsx';

const STUDENTS = [
  { id:'CSE124001', name:'Aditi Sharma',  status:'Present',  remarks:''              },
  { id:'CSE124002', name:'Rahul Gupta',   status:'Present',  remarks:''              },
  { id:'CSE124003', name:'Neha Gupta',    status:'Absent',   remarks:''              },
  { id:'CSE124004', name:'Vikram Singh',  status:'Late',     remarks:'Arrived at 15:15' },
  { id:'CSE124005', name:'Priya Patel',   status:'Present',  remarks:''              },
  { id:'CSE124006', name:'Sonam Kumar',   status:'Absent',   remarks:''              },
  { id:'CSE124007', name:'Arjun Mehta',   status:'Present',  remarks:''              },
  { id:'CSE124008', name:'Mohit Kumar',   status:'Absent',   remarks:''              },
];

const statusStyle = {
  Present: { badge:'ap-badge-green',  dot:'ap-dot-green'  },
  Absent:  { badge:'ap-badge-red',    dot:'ap-dot-red'    },
  Late:    { badge:'ap-badge-yellow', dot:'ap-dot-yellow' },
};

export default function AdminAttendance() {
  const [course, setCourse] = useState('CS-201 · Data Structures');
  const [date,   setDate  ] = useState('26 Oct 2026');
  const [room,   setRoom  ] = useState('B-101');
  const [search, setSearch] = useState('');

  const filtered = STUDENTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  const present = STUDENTS.filter(s=>s.status==='Present').length;
  const absent  = STUDENTS.filter(s=>s.status==='Absent').length;
  const late    = STUDENTS.filter(s=>s.status==='Late').length;
  const total   = STUDENTS.length;

  return (
    <AdminShell>
      <div className="ap-hdr">
        <div>
          <h1>Attendance</h1>
          <p className="ap-sub">Track and manage student attendance</p>
        </div>
      </div>

      {/* Filter row */}
      <div className="ap-card" style={{ marginBottom:16 }}>
        <div className="ap-bar" style={{ marginBottom:0 }}>
          <select className="ap-select" style={{ flex:1 }} value={course} onChange={e=>setCourse(e.target.value)}>
            <option>CS-201 · Data Structures</option>
            <option>CS-301 · DBMS</option>
            <option>CS-305 · Operating Systems</option>
          </select>
          <input
            type="date"
            className="ap-select"
            defaultValue="2026-10-26"
            style={{ width:160 }}
          />
          <select className="ap-select" value={room} onChange={e=>setRoom(e.target.value)}>
            <option>B-101</option><option>B-203</option><option>Lab-1</option>
          </select>
        </div>
      </div>

      {/* Stats row */}
      <div className="ap-g4" style={{ marginBottom:16 }}>
        {[
          { label:'Total Students', val:total,   color:'#818cf8', bg:'rgba(99,102,241,.2)'  },
          { label:'Present',        val:`${present} (${Math.round(present/total*100)}%)`, color:'#34d399', bg:'rgba(52,211,153,.2)'  },
          { label:'Absent',         val:`${absent}`,  color:'#f87171', bg:'rgba(248,113,113,.2)' },
          { label:'Late',           val:`${late} (${Math.round(late/total*100)}%)`,  color:'#fbbf24', bg:'rgba(251,191,36,.2)' },
        ].map(s=>(
          <div key={s.label} className="ap-card" style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:42, height:42, borderRadius:11, background:s.bg, display:'grid', placeItems:'center', fontSize:'1rem', fontWeight:700, color:s.color }}>{s.val}</div>
            <span style={{ fontSize:'.84rem', color:'#7880a8' }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="ap-card">
        <div className="ap-bar">
          <div className="ap-search">
            <Search size={14} color="#7880a8" />
            <input placeholder="Search students..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>

        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr><th>Roll No</th><th>Name</th><th>Status</th><th>Remarks</th></tr>
            </thead>
            <tbody>
              {filtered.map((s,i)=>(
                <tr key={i}>
                  <td style={{ color:'#7880a8', fontFamily:'monospace' }}>{s.id}</td>
                  <td style={{ color:'#eceefb', fontWeight:500 }}>{s.name}</td>
                  <td>
                    <span className={`ap-badge ${statusStyle[s.status]?.badge ?? 'ap-badge-gray'}`}>
                      {s.status === 'Present' ? <Check size={11} /> : s.status === 'Absent' ? <X size={11} /> : null}
                      {s.status}
                    </span>
                  </td>
                  <td style={{ color:'#7880a8', fontSize:'.82rem' }}>{s.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display:'flex', gap:10, marginTop:16, justifyContent:'flex-end' }}>
          <button className="ap-btn ap-btn-ghost">Mark Absent</button>
          <button className="ap-btn ap-btn-primary"><Check size={14} /> Mark Present</button>
        </div>
      </div>
    </AdminShell>
  );
}
