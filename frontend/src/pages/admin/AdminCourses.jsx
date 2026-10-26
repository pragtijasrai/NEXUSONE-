import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import AdminShell from './AdminShell.jsx';

const COURSES = [
  { code:'CS-201', name:'Data Structures',           dept:'CSE', semester:3, credits:4 },
  { code:'CS-301', name:'DBMS',                      dept:'CSE', semester:5, credits:4 },
  { code:'CS-305', name:'Operating Systems',         dept:'CSE', semester:5, credits:4 },
  { code:'CS-401', name:'Web Development',           dept:'CSE', semester:7, credits:3 },
  { code:'CS-402', name:'AI & ML',                   dept:'CSE', semester:7, credits:4 },
  { code:'CS-403', name:'Computer Networks',         dept:'CSE', semester:7, credits:4 },
  { code:'CS-404', name:'Software Engineering',      dept:'CSE', semester:7, credits:3 },
  { code:'CS-405', name:'Cloud Computing',           dept:'CSE', semester:7, credits:3 },
];

export default function AdminCourses() {
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All Departments');
  const [sem, setSem] = useState('All Semesters');

  const filtered = COURSES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) &&
    (dept === 'All Departments' || c.dept === dept) &&
    (sem === 'All Semesters' || String(c.semester) === sem)
  );

  return (
    <AdminShell>
      <div className="ap-hdr">
        <div>
          <h1>Courses</h1>
          <p className="ap-sub">Manage academic courses and subjects</p>
        </div>
        <button className="ap-btn ap-btn-primary"><Plus size={15} /> Add Course</button>
      </div>

      <div className="ap-card">
        <div className="ap-bar">
          <div className="ap-search">
            <Search size={14} color="#7880a8" />
            <input placeholder="Search courses..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select className="ap-select" value={dept} onChange={e=>setDept(e.target.value)}>
            <option>All Departments</option>
            <option>CSE</option><option>ECE</option><option>ME</option>
          </select>
          <select className="ap-select" value={sem} onChange={e=>setSem(e.target.value)}>
            <option>All Semesters</option>
            {[1,2,3,4,5,6,7,8].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr><th>Code</th><th>Course Name</th><th>Department</th><th>Semester</th><th>Credits</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.code}>
                  <td><span className="ap-badge ap-badge-blue">{c.code}</span></td>
                  <td style={{ color:'#eceefb', fontWeight:500 }}>{c.name}</td>
                  <td style={{ color:'#7880a8' }}>{c.dept}</td>
                  <td style={{ color:'#c5caf0' }}>{c.semester}</td>
                  <td style={{ color:'#c5caf0' }}>{c.credits}</td>
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
          <span className="ap-page-info">Showing 1–{filtered.length} of 48 courses</span>
          {[1,2,3,'...',5].map((p,i)=><button key={i} className={`ap-page ${p===1?'ap-page-active':''}`}>{p}</button>)}
        </div>
      </div>
    </AdminShell>
  );
}
