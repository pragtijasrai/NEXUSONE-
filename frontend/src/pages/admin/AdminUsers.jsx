import { useState } from 'react';
import { Search, UserPlus, MoreHorizontal, Filter } from 'lucide-react';
import AdminShell from './AdminShell.jsx';

const USERS = [
  { id:1, name:'Pragti Sharma',  email:'pragti.sharma@nit.edu',   role:'Student',  status:'Active',   avatar:'PS', ac:'#4338ca' },
  { id:2, name:'Dr. A. Sharma',  email:'a.sharma@nit.edu',        role:'Faculty',  status:'Active',   avatar:'AS', ac:'#0ea5e9' },
  { id:3, name:'Prof. R. Mehta', email:'r.mehta@nit.edu',         role:'Faculty',  status:'Active',   avatar:'RM', ac:'#0ea5e9' },
  { id:4, name:'Karan Verma',    email:'karan.verma@nit.edu',     role:'Student',  status:'Active',   avatar:'KV', ac:'#4338ca' },
  { id:5, name:'Jordan Ellis',   email:'admin@nit.edu',           role:'Admin',    status:'Active',   avatar:'JE', ac:'#7c3aed' },
  { id:6, name:'Neha Gupta',     email:'neha.gupta@nit.edu',      role:'Student',  status:'Inactive', avatar:'NG', ac:'#4338ca' },
  { id:7, name:'Dr. K. Verma',   email:'k.verma@nit.edu',         role:'Faculty',  status:'Active',   avatar:'KV', ac:'#0ea5e9' },
  { id:8, name:'Simran Kaur',    email:'simran.kaur@nit.edu',     role:'Student',  status:'Active',   avatar:'SK', ac:'#4338ca' },
];

const roleColor = { Student:'ap-badge-blue', Faculty:'ap-badge-cyan', Admin:'ap-badge-yellow', Maintenance:'ap-badge-green' };
const statusBadge = { Active:'ap-badge-green', Inactive:'ap-badge-red' };

export default function AdminUsers() {
  const [tab, setTab] = useState('All Users');
  const [search, setSearch] = useState('');
  const tabs = ['All Users', 'Students', 'Faculty', 'Administrators'];

  const filtered = USERS.filter(u => {
    const matchTab = tab === 'All Users' || u.role.toLowerCase().startsWith(tab.slice(0,-1).toLowerCase());
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <AdminShell>
      <div className="ap-hdr">
        <div>
          <h1>Users</h1>
          <p className="ap-sub">Manage students, faculty, and administrators</p>
        </div>
        <button className="ap-btn ap-btn-primary"><UserPlus size={15} /> Add User</button>
      </div>

      <div className="ap-card">
        {/* Tabs */}
        <div className="ap-tabs">
          {tabs.map(t => (
            <button key={t} className={`ap-tab ${tab===t?'ap-tab-active':''}`} onClick={()=>setTab(t)}>{t}</button>
          ))}
        </div>

        {/* Search bar */}
        <div className="ap-bar">
          <div className="ap-search" style={{ maxWidth: 340 }}>
            <Search size={14} color="#7880a8" />
            <input placeholder="Search users by name, email, or role..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <button className="ap-btn ap-btn-ghost ap-btn-sm"><Filter size={13} /> Filters</button>
        </div>

        {/* Table */}
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <div className="ap-avatar" style={{ background: u.ac }}>{u.avatar}</div>
                      <span style={{ color:'#eceefb', fontWeight:500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color:'#7880a8' }}>{u.email}</td>
                  <td><span className={`ap-badge ${roleColor[u.role]||'ap-badge-gray'}`}>{u.role}</span></td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span className={`ap-dot ${u.status==='Active'?'ap-dot-green':'ap-dot-red'}`} />
                      <span>{u.status}</span>
                    </div>
                  </td>
                  <td>
                    <button className="ap-btn ap-btn-ghost ap-btn-sm" style={{ padding:'0 8px' }}>
                      <MoreHorizontal size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="ap-pages">
          <span className="ap-page-info">Showing 1–{filtered.length} of {filtered.length} users</span>
          {[1,2,3,'...',5].map((p,i) => (
            <button key={i} className={`ap-page ${p===1?'ap-page-active':''}`}>{p}</button>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
