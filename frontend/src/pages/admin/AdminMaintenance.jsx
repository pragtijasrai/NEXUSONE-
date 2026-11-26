/**
 * AdminMaintenance — /admin/maintenance
 * Real API: GET /maintenance (all tickets), assign staff, update status, delete
 * Admin can: view all, assign staff, cancel/close tickets, see full history
 */
import { useState, useCallback } from 'react';
import { Search, RefreshCw, Eye, UserCheck, XCircle, ChevronLeft, ChevronRight, X, Clock, MapPin, AlertCircle, User } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import { getAllTickets, assignTicket, updateTicketStatus } from '../../services/adminService.js';
import * as ms from '../../services/maintenanceService.js';
import AdminShell from './AdminShell.jsx';

const STATUS_BADGE = {
  open:'ap-badge-yellow', assigned:'ap-badge-blue', in_progress:'ap-badge-cyan',
  resolved:'ap-badge-green', closed:'ap-badge-gray',
};
const PRIO_BADGE = { low:'ap-badge-gray', medium:'ap-badge-blue', high:'ap-badge-yellow', urgent:'ap-badge-red' };

const VALID_NEXT = {
  open:        ['assigned','in_progress','closed'],
  assigned:    ['in_progress','closed'],
  in_progress: ['resolved','closed'],
  resolved:    ['closed'],
  closed:      [],
};

function DetailDrawer({ ticket, onClose, onRefresh }) {
  const { notify } = useToast();
  const [updating, setUpdating] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  /* Load full ticket detail including history */
  if (!loaded) {
    setLoaded(true);
    ms.getTicket(ticket.id).then(r => setDetailData(r)).catch(() => {});
  }

  const history = detailData?.history ?? [];
  const nextStatuses = VALID_NEXT[ticket.status] ?? [];

  async function handleStatus(status) {
    setUpdating(true);
    try {
      await updateTicketStatus(ticket.id, status, `Status changed by admin`);
      notify(`Ticket moved to ${status}.`, 'success');
      onClose();
      onRefresh();
    } catch (e) { notify(e.message || 'Failed', 'error'); }
    finally { setUpdating(false); }
  }

  return (
    <>
      <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.65)', zIndex:9990, backdropFilter:'blur(3px)' }} onClick={onClose}/>
      <aside style={{ position:'fixed', right:0, top:0, bottom:0, width:'min(600px,100vw)', background:'#0f1320', borderLeft:'1px solid rgba(255,255,255,.08)', zIndex:9991, overflowY:'auto', display:'flex', flexDirection:'column', animation:'fcSI .22s cubic-bezier(.34,1.1,.64,1)' }}
        role="dialog" aria-modal="true">
        <style>{`@keyframes fcSI{from{transform:translateX(100%);opacity:0;}to{transform:none;opacity:1;}}`}</style>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, position:'sticky', top:0, background:'#0f1320', zIndex:2 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <span style={{ background:'rgba(99,102,241,.2)', color:'#818cf8', fontWeight:700, fontSize:'.76rem', padding:'2px 8px', borderRadius:5 }}>#{ticket.id}</span>
              <span className={`ap-badge ${STATUS_BADGE[ticket.status]??'ap-badge-gray'}`}>{ticket.status}</span>
              <span className={`ap-badge ${PRIO_BADGE[ticket.priority]??'ap-badge-gray'}`}>{ticket.priority}</span>
            </div>
            <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700, color:'#eceefb' }}>{ticket.issue}</h2>
          </div>
          <button onClick={onClose} style={{ border:0, background:'rgba(255,255,255,.06)', color:'#7880a8', borderRadius:8, width:34, height:34, cursor:'pointer', display:'grid', placeItems:'center', flexShrink:0 }}>
            <X size={16}/>
          </button>
        </div>

        <div style={{ padding:'20px 24px', display:'grid', gap:16 }}>
          {/* Info grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { icon:MapPin, label:'Location', val:ticket.location },
              { icon:User, label:'Reported By', val:ticket.reporter_name ?? '—' },
              { icon:Clock, label:'Created', val:ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—' },
              { icon:UserCheck, label:'Assigned To', val:ticket.assigned_name ?? 'Unassigned' },
            ].map(item => (
              <div key={item.label} style={{ background:'#161b2e', border:'1px solid rgba(255,255,255,.07)', borderRadius:10, padding:'11px 13px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:'.72rem', fontWeight:600, color:'#7880a8', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:4 }}>
                  <item.icon size={11}/>{item.label}
                </div>
                <div style={{ fontSize:'.88rem', fontWeight:500, color:'#eceefb' }}>{item.val}</div>
              </div>
            ))}
          </div>

          {/* Status actions */}
          {nextStatuses.length > 0 && (
            <div style={{ background:'#161b2e', border:'1px solid rgba(255,255,255,.07)', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:'.78rem', color:'#7880a8', fontWeight:600, marginBottom:10 }}>Move to status:</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {nextStatuses.map(s => (
                  <button key={s} className="ap-btn ap-btn-ghost ap-btn-sm" disabled={updating}
                    style={{ borderColor: s==='closed'?'rgba(248,113,113,.3)':undefined, color: s==='closed'?'#f87171':undefined }}
                    onClick={() => handleStatus(s)}>
                    {updating ? '…' : s.replace('_',' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div style={{ background:'#161b2e', border:'1px solid rgba(255,255,255,.07)', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:'.78rem', color:'#7880a8', fontWeight:600, marginBottom:10 }}>Status History</div>
              <div style={{ display:'grid', gap:8 }}>
                {history.map((h, i) => (
                  <div key={h.id??i} style={{ display:'flex', gap:10, alignItems:'flex-start', fontSize:'.82rem', padding:'4px 0' }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:'#4338ca', marginTop:5, flexShrink:0 }}/>
                    <div>
                      <span style={{ fontWeight:500, color:'#eceefb' }}>{h.new_status}</span>
                      {h.old_status && <span style={{ color:'#7880a8' }}> from {h.old_status}</span>}
                      {h.note && <span style={{ color:'#7880a8' }}> — {h.note}</span>}
                      <div style={{ fontSize:'.74rem', color:'#555a7a', marginTop:2 }}>
                        {h.changed_by_name ?? 'System'} · {h.created_at ? new Date(h.created_at).toLocaleString() : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default function AdminMaintenance() {
  const { notify } = useToast();
  const [tab,     setTab]     = useState('all');
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [viewing, setViewing] = useState(null);

  const statusFilter = { open:'open', assigned:'assigned', in_progress:'in_progress', resolved:'resolved' }[tab];
  const fetchFn = useCallback(() => getAllTickets({
    page, limit: 20,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(search ? { search } : {}),
  }), [page, statusFilter, search]);

  const { data, loading, error, refetch } = useApi(fetchFn, [page, tab, search]);
  const tickets = data?.rows ?? [];
  const meta    = data ?? {};

  const TABS = [
    { k:'all',         l:'All' },
    { k:'open',        l:'Open' },
    { k:'assigned',    l:'Assigned' },
    { k:'in_progress', l:'In Progress' },
    { k:'resolved',    l:'Resolved' },
  ];

  return (
    <AdminShell>
      <div className="ap-hdr">
        <div><h1>Maintenance Tickets</h1><p className="ap-sub">View and manage all campus maintenance requests</p></div>
        <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={refetch}><RefreshCw size={13}/> Refresh</button>
      </div>

      <div className="ap-card">
        <div className="ap-tabs">
          {TABS.map(t => (
            <button key={t.k} className={`ap-tab ${tab===t.k?'ap-tab-active':''}`}
              onClick={() => { setTab(t.k); setPage(1); }}>{t.l}</button>
          ))}
        </div>

        <div className="ap-bar">
          <div className="ap-search" style={{ maxWidth:360 }}>
            <Search size={14} color="#7880a8"/>
            <input placeholder="Search issue, location…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}/>
          </div>
          <span style={{ fontSize:'.82rem', color:'#7880a8', marginLeft:'auto' }}>
            {meta.total != null ? `${meta.total} tickets` : ''}
          </span>
        </div>

        {loading ? <LoadingSpinner message="Loading tickets…"/>
        : error   ? <ErrorState error={error} onRetry={refetch}/>
        : tickets.length === 0 ? <EmptyState icon="🛠️" title="No tickets found" description="No tickets match the current filter."/>
        : (
          <>
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr><th>#</th><th>Issue</th><th>Location</th><th>Reporter</th><th>Priority</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t.id}>
                      <td style={{ color:'#818cf8', fontFamily:'monospace', fontSize:'.8rem', fontWeight:700 }}>#{t.id}</td>
                      <td style={{ color:'#eceefb', fontWeight:500, maxWidth:220 }}>
                        <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.issue}</div>
                        {t.assigned_name && <div style={{ fontSize:'.72rem', color:'#7880a8', marginTop:2 }}>→ {t.assigned_name}</div>}
                      </td>
                      <td style={{ color:'#7880a8', fontSize:'.83rem' }}>{t.location}</td>
                      <td style={{ color:'#7880a8', fontSize:'.83rem' }}>{t.reporter_name ?? '—'}</td>
                      <td><span className={`ap-badge ${PRIO_BADGE[t.priority]??'ap-badge-gray'}`}>{t.priority}</span></td>
                      <td><span className={`ap-badge ${STATUS_BADGE[t.status]??'ap-badge-gray'}`}>{t.status}</span></td>
                      <td style={{ color:'#7880a8', fontSize:'.8rem' }}>
                        {t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={() => setViewing(t)}>
                          <Eye size={13}/> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="ap-pages">
              <span className="ap-page-info">Showing {(page-1)*20+1}–{Math.min(page*20, meta.total??tickets.length)} of {meta.total??tickets.length}</span>
              {Array.from({length: meta.totalPages??1}, (_,i)=>i+1).map(p => (
                <button key={p} className={`ap-page ${p===page?'ap-page-active':''}`} onClick={()=>setPage(p)}>{p}</button>
              ))}
            </div>
          </>
        )}
      </div>

      {viewing && <DetailDrawer ticket={viewing} onClose={() => setViewing(null)} onRefresh={refetch}/>}
    </AdminShell>
  );
}
