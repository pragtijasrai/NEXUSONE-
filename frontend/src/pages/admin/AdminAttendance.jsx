/**
 * AdminAttendance — /admin/attendance
 * Real API: GET /admin/attendance (attendance summary per course)
 */
import { useState, useMemo } from 'react';
import { Search, RefreshCw, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import { getAttendanceOverview } from '../../services/adminService.js';
import AdminShell from './AdminShell.jsx';

const pct = (present, total) => total > 0 ? Math.round((Number(present)/Number(total))*100) : 0;
const pctColor = (p) => p >= 75 ? '#34d399' : p >= 60 ? '#fbbf24' : '#f87171';

export default function AdminAttendance() {
  const [search, setSearch] = useState('');

  const { data, loading, error, refetch } = useApi(getAttendanceOverview);
  const summary = data?.summary ?? [];

  const filtered = useMemo(() => summary.filter(s => {
    const q = search.toLowerCase();
    return !q || s.course_code?.toLowerCase().includes(q) || s.course_name?.toLowerCase().includes(q);
  }), [summary, search]);

  const totalPresent = summary.reduce((s,r) => s+Number(r.present??0),0);
  const totalAbsent  = summary.reduce((s,r) => s+Number(r.absent??0), 0);
  const totalRecords = summary.reduce((s,r) => s+Number(r.total??0),  0);
  const overallPct   = pct(totalPresent, totalRecords);

  const lowCourses = summary.filter(s => pct(s.present, s.total) < 75).length;

  return (
    <AdminShell>
      <div className="ap-hdr">
        <div><h1>Attendance Overview</h1><p className="ap-sub">Per-course attendance summary across all classes</p></div>
        <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={refetch}><RefreshCw size={13}/> Refresh</button>
      </div>

      <div className="ap-g4" style={{ marginBottom:18 }}>
        {[
          { icon:TrendingUp,   label:'Overall Rate',    val:`${overallPct}%`, color:'#34d399', bg:'rgba(52,211,153,.15)' },
          { icon:TrendingUp,   label:'Total Present',   val:totalPresent,     color:'#818cf8', bg:'rgba(99,102,241,.15)' },
          { icon:TrendingDown, label:'Total Absent',    val:totalAbsent,      color:'#f87171', bg:'rgba(248,113,113,.15)' },
          { icon:AlertTriangle,label:'Courses < 75%',   val:lowCourses,       color:'#fbbf24', bg:'rgba(251,191,36,.15)' },
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
            <input placeholder="Search courses…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <span style={{ fontSize:'.82rem', color:'#7880a8', marginLeft:'auto' }}>{filtered.length} courses</span>
        </div>

        {loading ? <LoadingSpinner message="Loading attendance…"/>
        : error   ? <ErrorState error={error} onRetry={refetch}/>
        : filtered.length === 0 ? <EmptyState icon="📋" title="No attendance data" description="Attendance records will appear here once marked."/>
        : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr><th>Course</th><th>Present</th><th>Absent</th><th>Late</th><th>Total</th><th style={{width:'28%'}}>Attendance Rate</th></tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const p = pct(s.present, s.total);
                  const col = pctColor(p);
                  return (
                    <tr key={s.course_code}>
                      <td>
                        <span className="ap-badge ap-badge-blue" style={{ marginRight:8 }}>{s.course_code}</span>
                        <span style={{ color:'#7880a8', fontSize:'.82rem' }}>{s.course_name}</span>
                      </td>
                      <td style={{ color:'#34d399', fontWeight:600 }}>{s.present}</td>
                      <td style={{ color:'#f87171', fontWeight:600 }}>{s.absent}</td>
                      <td style={{ color:'#fbbf24', fontWeight:600 }}>{s.late}</td>
                      <td style={{ color:'#7880a8' }}>{s.total}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div className="ap-progress" style={{ flex:1 }}>
                            <div className="ap-progress-fill" style={{ width:`${p}%`, background:`linear-gradient(90deg,${col}aa,${col})` }}/>
                          </div>
                          <strong style={{ width:44, textAlign:'right', fontSize:'.84rem', color:col }}>{p}%</strong>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
