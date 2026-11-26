import { useState } from 'react';
import { Search, CheckCheck, User, Calendar, Paperclip, ChevronDown, Megaphone, GraduationCap, FileText, CalendarDays, Bus, Building2, AlertTriangle } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import { getAnnouncements } from '../../services/announcementService.js';

const catIcon  = { academic:GraduationCap, examination:FileText, events:CalendarDays, transport:Bus, general:Building2, urgent:AlertTriangle };
const catColor = { academic:'#4338ca', examination:'#8b5cf6', events:'#ec4899', transport:'#10b981', general:'#0ea5e9', urgent:'#dc2626' };
const prioBadge = { urgent:['badge badge--urgent','Urgent'], normal:null };

export default function Announcements() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [openId, setOpenId] = useState(null);
  const [readIds, setReadIds] = useState(new Set());

  const { data, loading, error, refetch } = useApi(getAnnouncements);
  const announcements = data?.rows ?? [];

  const categories = ['All', ...new Set(announcements.map(a => a.category))];

  const visible = announcements.filter(a => {
    const term = q.trim().toLowerCase();
    const matchCat  = cat === 'All' || a.category === cat;
    const matchTerm = !term || [a.title, a.body, a.audience, a.category].some(s => s?.toLowerCase().includes(term));
    return matchCat && matchTerm;
  });

  const unreadCount = announcements.filter(a => !readIds.has(a.id)).length;

  const toggle = (id) => {
    setOpenId(openId === id ? null : id);
    setReadIds(s => new Set([...s, id]));
  };

  if (loading) return <LoadingSpinner message="Loading announcements…" />;
  if (error)   return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="stack">
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1>Announcements</h1>
          <p className="muted">Campus and academic updates in one place. {unreadCount > 0 ? <strong>{unreadCount} unread</strong> : 'You are all caught up.'}</p>
        </div>
        <button className="btn btn--ghost" onClick={()=>setReadIds(new Set(announcements.map(a=>a.id)))} disabled={unreadCount===0}>
          <CheckCheck size={16}/> Mark all as read
        </button>
      </header>

      {/* Search */}
      <div style={{ position:'relative', maxWidth:400 }}>
        <Search size={16} style={{ position:'absolute', left:14, top:13, color:'var(--muted)' }}/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search announcements…"
          style={{ width:'100%', minHeight:42, padding:'0 14px 0 38px', border:'1.5px solid var(--border)', borderRadius:'var(--r)', background:'var(--surface)', color:'var(--text)', font:'inherit' }}/>
      </div>

      {/* Category chips */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {categories.map(c => {
          const active = cat === c;
          const color = catColor[c] ?? 'var(--primary)';
          return (
            <button key={c} onClick={()=>setCat(c)}
              style={{ font:'inherit', fontSize:'.8rem', fontWeight:600, cursor:'pointer', padding:'6px 14px', borderRadius:99, border:`1.5px solid ${active?color:'var(--border)'}`, background:active?color:'var(--surface)', color:active?'#fff':'var(--text2)' }}>
              {c.charAt(0).toUpperCase()+c.slice(1)}
            </button>
          );
        })}
      </div>

      {visible.length === 0
        ? <EmptyState icon="📭" title="No announcements found" description="Try a different search or category." />
        : <div className="stack">
          {visible.map(a => {
            const Icon  = catIcon[a.category] ?? Megaphone;
            const color = catColor[a.category] ?? 'var(--primary)';
            const open  = openId === a.id;
            const unread = !readIds.has(a.id);
            const pb = prioBadge[a.priority];
            return (
              <article key={a.id} className="card" style={{ padding:0, overflow:'hidden', borderLeft:`4px solid ${a.priority==='urgent'?'var(--danger)':color}` }}>
                <button onClick={()=>toggle(a.id)} aria-expanded={open}
                  style={{ all:'unset', boxSizing:'border-box', width:'100%', cursor:'pointer', display:'grid', gridTemplateColumns:'44px 1fr auto', gap:14, alignItems:'center', padding:'16px 20px' }}>
                  <span className="stat__icon" style={{ background:`${color}1a`, color }}><Icon size={20}/></span>
                  <div style={{ minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      {unread && <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--primary)', flexShrink:0 }}/>}
                      <span style={{ fontWeight:unread?700:500 }}>{a.title}</span>
                    </div>
                    <div className="muted small" style={{ display:'flex', gap:14, flexWrap:'wrap', marginTop:2 }}>
                      <span style={{ color, fontWeight:600 }}>{a.category}</span>
                      <span style={{ display:'inline-flex', gap:4, alignItems:'center' }}><User size={12}/>{a.author_name ?? a.audience}</span>
                      <span style={{ display:'inline-flex', gap:4, alignItems:'center' }}><Calendar size={12}/>{a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    {pb && <span className={pb[0]}>{pb[1]}</span>}
                    <ChevronDown size={18} style={{ color:'var(--muted)', transition:'transform var(--t)', transform:open?'rotate(180deg)':'none' }}/>
                  </div>
                </button>
                {open && (
                  <div style={{ padding:'4px 20px 20px 78px', borderTop:'1px solid var(--border)', background:'var(--surface2)' }}>
                    <p style={{ whiteSpace:'pre-line', margin:'16px 0 0', fontSize:'.92rem', lineHeight:1.6 }}>{a.body ?? a.message}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      }
    </div>
  );
}
