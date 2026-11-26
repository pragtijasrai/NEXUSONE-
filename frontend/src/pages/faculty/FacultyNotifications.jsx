/**
 * FacultyNotifications — /faculty/notifications
 * Real API: GET /notifications, PATCH /notifications/:id/read, PATCH /notifications/read-all
 */
import { Link } from 'react-router-dom';
import { ChevronLeft, Bell, CheckCheck, FileText, Users, Megaphone, BarChart2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import { getNotifications, markRead, markAllRead } from '../../services/notificationService.js';

const css = `
  .fn{background:#0d1117;min-height:100vh;color:#c5caf0;font-family:inherit;padding:28px 32px;}
  .fn h1{font-size:1.4rem;font-weight:700;color:#eceefb;margin:0 0 4px;}
  .fn-sub{font-size:.88rem;color:#7880a8;margin:0 0 24px;}
  .fn-back{display:inline-flex;align-items:center;gap:6px;color:#7880a8;font-size:.83rem;text-decoration:none;margin-bottom:16px;transition:color .15s;}
  .fn-back:hover{color:#818cf8;}
  .fn-list{display:grid;gap:8px;}
  .fn-item{background:#161b2e;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:16px 18px;display:flex;align-items:flex-start;gap:12px;cursor:pointer;transition:border-color .18s;}
  .fn-item:hover{border-color:rgba(99,102,241,.25);}
  .fn-item--unread{border-left:3px solid #818cf8;}
  .fn-icon{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;flex-shrink:0;}
  .fn-title{font-size:.9rem;font-weight:600;color:#eceefb;margin:0 0 3px;}
  .fn-body{font-size:.82rem;color:#7880a8;margin:0 0 4px;}
  .fn-time{font-size:.72rem;color:#555a7a;}
  .fn-unread-dot{width:7px;height:7px;border-radius:50%;background:#818cf8;flex-shrink:0;margin-top:6px;}
  .fn-mark-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#7880a8;font:inherit;font-size:.82rem;cursor:pointer;transition:all .15s;}
  .fn-mark-btn:hover{color:#818cf8;border-color:#818cf8;}
  .fn-type-icon-info{background:rgba(99,102,241,.18);}
  .fn-type-icon-success{background:rgba(52,211,153,.15);}
  .fn-type-icon-warning{background:rgba(251,191,36,.15);}
  .fn-type-icon-error{background:rgba(248,113,113,.15);}
  @media(max-width:640px){.fn{padding:16px;}}
`;

const TYPE_MAP = {
  info:    { Icon: Bell,     bg: 'rgba(99,102,241,.18)',  col: '#818cf8' },
  success: { Icon: CheckCheck, bg: 'rgba(52,211,153,.15)', col: '#34d399' },
  warning: { Icon: BarChart2, bg: 'rgba(251,191,36,.15)',  col: '#fbbf24' },
  error:   { Icon: Megaphone, bg: 'rgba(248,113,113,.15)', col: '#f87171' },
};

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function FacultyNotifications() {
  const { notify } = useToast();
  const { data, loading, error, refetch } = useApi(getNotifications);

  const rows = data?.rows ?? [];
  const unreadCount = data?.unreadCount ?? rows.filter(n => !n.is_read).length;

  async function handleMarkOne(id) {
    try { await markRead(id); refetch(); } catch { /* ignore */ }
  }

  async function handleMarkAll() {
    try {
      await markAllRead();
      notify('All notifications marked as read', 'success');
      refetch();
    } catch (e) { notify(e.message || 'Failed', 'error'); }
  }

  if (loading) return <><style>{css}</style><div className="fn"><LoadingSpinner message="Loading notifications…" /></div></>;
  if (error)   return <><style>{css}</style><div className="fn"><ErrorState error={error} onRetry={refetch} /></div></>;

  return (
    <>
      <style>{css}</style>
      <div className="fn">
        <Link to="/faculty/dashboard" className="fn-back"><ChevronLeft size={15} /> Back to Dashboard</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
          <div>
            <h1>Notifications</h1>
            <p className="fn-sub">{unreadCount} unread · {rows.length} total</p>
          </div>
          {unreadCount > 0 && (
            <button className="fn-mark-btn" onClick={handleMarkAll}>
              <CheckCheck size={15} /> Mark all read
            </button>
          )}
        </div>

        {rows.length === 0 ? (
          <EmptyState icon="🔔" title="No notifications" description="You're all caught up." />
        ) : (
          <div className="fn-list">
            {rows.map(n => {
              const { Icon, bg, col } = TYPE_MAP[n.type] ?? TYPE_MAP.info;
              return (
                <div
                  key={n.id}
                  className={`fn-item${!n.is_read ? ' fn-item--unread' : ''}`}
                  onClick={() => !n.is_read && handleMarkOne(n.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && !n.is_read && handleMarkOne(n.id)}
                  aria-label={n.title}
                >
                  <div className="fn-icon" style={{ background: bg }}><Icon size={16} color={col} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="fn-title">{n.title}</p>
                    {n.body && <p className="fn-body">{n.body}</p>}
                    <p className="fn-time">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && <div className="fn-unread-dot" aria-label="Unread" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
