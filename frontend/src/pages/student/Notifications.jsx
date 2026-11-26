import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, ArrowRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import * as ns from '../../services/notificationService.js';

const catColor = { info:'#4338ca', success:'#059669', warning:'#d97706', error:'#dc2626' };
const catRoute = { info:'/student/dashboard', success:'/student/dashboard', warning:'/student/announcements', error:'/student/dashboard' };

export default function Notifications() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data, loading, error, refetch } = useApi(
    () => ns.getNotifications(unreadOnly ? { unread:'true' } : {}),
    [unreadOnly],
  );

  const notifications = data?.rows ?? [];
  const unreadCount   = data?.unreadCount ?? 0;

  const open = async (n) => {
    if (n.is_read === false) {
      try { await ns.markRead(n.id); refetch(); } catch { /* ignore */ }
    }
    navigate(catRoute[n.type] ?? '/student/dashboard');
  };

  const handleMarkAll = async () => {
    try { await ns.markAllRead(); refetch(); notify('All notifications marked as read.', 'info'); } catch (e) { notify(e.message, 'error'); }
  };

  if (loading) return <LoadingSpinner message="Loading notifications…" />;
  if (error)   return <ErrorState error={error} onRetry={refetch} />;

  const today   = notifications.filter(n => !n.is_read);
  const earlier = notifications.filter(n => n.is_read);

  const Group = ({ label, list }) => list.length === 0 ? null : (
    <section>
      <h2 style={{ fontSize:'.78rem', textTransform:'uppercase', letterSpacing:'.05em', color:'var(--muted)', margin:'0 0 8px' }}>{label}</h2>
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        {list.map((n, i) => {
          const color = catColor[n.type] ?? 'var(--primary)';
          return (
            <div key={n.id} style={{ display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', borderTop:i?'1px solid var(--border)':0, background:!n.is_read?'rgba(99,102,241,.06)':'transparent' }}>
              <button onClick={()=>open(n)} style={{ all:'unset', boxSizing:'border-box', cursor:'pointer', display:'grid', gridTemplateColumns:'44px 1fr', gap:14, alignItems:'center', padding:'14px 16px' }}>
                <span className="stat__icon" style={{ background:`${color}1a`, color }}><Bell size={20}/></span>
                <div style={{ minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {!n.is_read && <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--primary)', flexShrink:0 }}/>}
                    <span style={{ fontWeight:!n.is_read?700:500 }}>{n.title}</span>
                  </div>
                  <div className="muted small" style={{ marginTop:2 }}>{n.body}</div>
                  <div className="muted" style={{ fontSize:'.72rem', marginTop:4, display:'flex', gap:10 }}>
                    <span style={{ color, fontWeight:600 }}>{n.type}</span>
                    <span style={{ display:'inline-flex', gap:3, alignItems:'center' }}>Open <ArrowRight size={11}/></span>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="stack">
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1>Notifications</h1>
          <p className="muted">{unreadCount > 0 ? <strong>{unreadCount} unread</strong> : 'All caught up.'}</p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <label style={{ display:'inline-flex', gap:8, alignItems:'center', fontSize:'.85rem', cursor:'pointer' }}>
            <input type="checkbox" checked={unreadOnly} onChange={e=>setUnreadOnly(e.target.checked)}/>
            Unread only
          </label>
          <button className="btn btn--primary" onClick={handleMarkAll} disabled={unreadCount===0}>
            <CheckCheck size={16}/> Mark all as read
          </button>
        </div>
      </header>

      {notifications.length === 0
        ? <EmptyState icon="🔔" title="No notifications" description={unreadOnly ? 'No unread notifications.' : 'Nothing here yet.'}/>
        : <>
          <Group label="Unread" list={today}/>
          <Group label="Read" list={earlier}/>
        </>
      }
    </div>
  );
}
