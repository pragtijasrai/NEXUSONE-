/**
 * AdminCourses — /admin/courses
 * Real API: GET /admin/courses (admin read-only)
 */
import { useState, useMemo } from 'react';
import { Search, RefreshCw, BookOpen, Users, Layers } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import { getCourses } from '../../services/adminService.js';
import AdminShell from './AdminShell.jsx';

export default function AdminCourses() {
  const { notify } = useToast();
  const [search, setSearch] = useState('');
  const [dept,   setDept]   = useState('all');

  const { data, loading, error, refetch } = useApi(getCourses);
  const courses = data?.courses ?? [];

  const departments = useMemo(() => ['all', ...new Set(courses.map(c => c.department_name ?? 'Unassigned'))], [courses]);

  const filtered = useMemo(() => courses.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
    const matchD = dept === 'all' || (c.department_name ?? 'Unassigned') === dept;
    return matchQ && matchD;
  }), [courses, search, dept]);

  const totalEnrolled = courses.reduce((s,c) => s + Number(c.enrolled_count??0), 0);
  const totalSessions = courses.reduce((s,c) => s + Number(c.session_count??0), 0);

  return (
    <AdminShell>
      <div className="ap-hdr">
        <div><h1>Courses</h1><p className="ap-sub">View all academic courses and their enrollment</p></div>
        <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={refetch}><RefreshCw size={13}/> Refresh</button>
      </div>

      <div className="ap-g4" style={{ marginBottom:18 }}>
        {[
          { icon:BookOpen, label:'Total Courses', val:courses.length,   color:'#818cf8', bg:'rgba(99,102,241,.15)' },
          { icon:Users,    label:'Enrollments',  val:totalEnrolled,     color:'#22d3ee', bg:'rgba(34,211,238,.15)' },
          { icon:Layers,   label:'Sessions',     val:totalSessions,     color:'#fbbf24', bg:'rgba(251,191,36,.15)' },
          { icon:BookOpen, label:'Departments',  val:departments.length-1, color:'#34d399', bg:'rgba(52,211,153,.15)' },
        ].map(c => (
          <div key={c.label} className="ap-card" style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:42, height:42, borderRadius:11, background:c.bg, display:'grid', placeItems:'center' }}><c.icon size={19} color={c.color}/></div>
            <div>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#eceefb', lineHeight:1 }}>{c.val}</div>
              <div style={{ fontSize:'.76rem', color:'#7880a8' }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ap-card">
        <div className="ap-bar">
          <div className="ap-search" style={{ maxWidth:340 }}>
            <Search size={14} color="#7880a8"/>
            <input placeholder="Search courses by code or name…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="ap-select" value={dept} onChange={e=>setDept(e.target.value)}>
            {departments.map(d => <option key={d} value={d}>{d==='all'?'All Departments':d}</option>)}
          </select>
          <span style={{ fontSize:'.82rem', color:'#7880a8', marginLeft:'auto' }}>{filtered.length} of {courses.length}</span>
        </div>

        {loading ? <LoadingSpinner message="Loading courses…"/>
        : error   ? <ErrorState error={error} onRetry={refetch}/>
        : filtered.length === 0 ? <EmptyState icon="📚" title="No courses found" description="No courses match your filter."/>
        : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr><th>Code</th><th>Course Name</th><th>Department</th><th>Credits</th><th>Enrolled</th><th>Sessions</th></tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td><span className="ap-badge ap-badge-blue">{c.code}</span></td>
                    <td style={{ color:'#eceefb', fontWeight:500 }}>{c.name}</td>
                    <td style={{ color:'#7880a8' }}>{c.department_name ?? '—'}</td>
                    <td style={{ color:'#c5caf0' }}>{c.credits}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ flex:1, minWidth:50, height:5, background:'rgba(255,255,255,.08)', borderRadius:99, overflow:'hidden' }}>
                          <div style={{ width:`${Math.min(100, Number(c.enrolled_count??0)*10)}%`, height:'100%', background:'linear-gradient(90deg,#4338ca,#818cf8)', borderRadius:99 }}/>
                        </div>
                        <span style={{ color:'#eceefb', fontWeight:600 }}>{c.enrolled_count}</span>
                      </div>
                    </td>
                    <td style={{ color:'#c5caf0' }}>{c.session_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
