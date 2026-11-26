/**
 * AdminSessions — /admin/sessions
 * Real API: GET /admin/sessions (admin read-only)
 */
import { useState, useMemo } from 'react';
import { Search, RefreshCw, Clock, MapPin, CalendarDays, User } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import { getSessions } from '../../services/adminService.js';
import AdminShell from './AdminShell.jsx';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const fmt = (t) => {
  if (!t) return '—';
  const [h, m] = String(t).split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${((h+11)%12)+1}:${String(m).padStart(2,'0')} ${ap}`;
};

export default function AdminSessions() {
  const [search, setSearch] = useState('');
  const [day,    setDay]    = useState('all');

  const { data, loading, error, refetch } = useApi(getSessions);
  const sessions = data?.sessions ?? [];

  const filtered = useMemo(() => sessions.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || s.course_code?.toLowerCase().includes(q)
      || s.course_name?.toLowerCase().includes(q)
      || s.faculty_name?.toLowerCase().includes(q);
    const matchD = day === 'all' || Number(s.day_of_week) === Number(day);
    return matchQ && matchD;
  }), [sessions, search, day]);

  return (
    <AdminShell>
      <div className="ap-hdr">
        <div><h1>Class Sessions</h1><p className="ap-sub">All scheduled classes across courses</p></div>
        <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={refetch}><RefreshCw size={13}/> Refresh</button>
      </div>

      <div className="ap-g4" style={{ marginBottom:18 }}>
        {[
          { icon:CalendarDays, label:'Total Sessions', val:sessions.length, color:'#818cf8', bg:'rgba(99,102,241,.15)' },
          { icon:User,   label:'Faculty Involved',  val:new Set(sessions.map(s=>s.faculty_name)).size, color:'#22d3ee', bg:'rgba(34,211,238,.15)' },
          { icon:MapPin, label:'Rooms Used',        val:new Set(sessions.map(s=>s.room_code).filter(Boolean)).size, color:'#fbbf24', bg:'rgba(251,191,36,.15)' },
          { icon:Clock,  label:'Unique Courses',    val:new Set(sessions.map(s=>s.course_code)).size, color:'#34d399', bg:'rgba(52,211,153,.15)' },
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
            <input placeholder="Search course, faculty…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="ap-select" value={day} onChange={e=>setDay(e.target.value)}>
            <option value="all">All Days</option>
            {[1,2,3,4,5].map(d => <option key={d} value={d}>{DAYS[d]}</option>)}
          </select>
          <span style={{ fontSize:'.82rem', color:'#7880a8', marginLeft:'auto' }}>{filtered.length} of {sessions.length}</span>
        </div>

        {loading ? <LoadingSpinner message="Loading sessions…"/>
        : error   ? <ErrorState error={error} onRetry={refetch}/>
        : filtered.length === 0 ? <EmptyState icon="📅" title="No sessions found" description="No sessions match your filter."/>
        : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr><th>Day</th><th>Time</th><th>Course</th><th>Faculty</th><th>Room</th></tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td><span className="ap-badge ap-badge-blue">{DAYS[Number(s.day_of_week)]}</span></td>
                    <td style={{ color:'#c5caf0' }}>{fmt(s.start_time)} – {fmt(s.end_time)}</td>
                    <td>
                      <div style={{ fontWeight:600, color:'#eceefb', fontSize:'.85rem' }}>{s.course_code}</div>
                      <div style={{ fontSize:'.76rem', color:'#7880a8' }}>{s.course_name}</div>
                    </td>
                    <td style={{ color:'#c5caf0' }}>{s.faculty_name}</td>
                    <td style={{ color:'#7880a8' }}>{s.room_name ?? s.room_code ?? '—'}</td>
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
