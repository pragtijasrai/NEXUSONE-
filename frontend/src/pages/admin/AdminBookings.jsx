/**
 * AdminBookings — /admin/bookings
 * Real API: GET /bookings (admin — all bookings), PATCH /bookings/:id/admin-cancel
 */
import { useState, useCallback } from 'react';
import { Search, RefreshCw, XCircle } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import { getAllBookings, cancelBooking } from '../../services/adminService.js';
import AdminShell from './AdminShell.jsx';

const STATUS_BADGE = { confirmed:'ap-badge-green', pending:'ap-badge-yellow', cancelled:'ap-badge-red' };
const fmtDt = (dt) => dt ? new Date(dt).toLocaleString([],{dateStyle:'short',timeStyle:'short'}) : '—';

export default function AdminBookings() {
  const { notify } = useToast();
  const [tab,    setTab]    = useState('all');
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);

  const statusFilter = { confirmed:'confirmed', pending:'pending', cancelled:'cancelled' }[tab];
  const fetchFn = useCallback(() => getAllBookings({
    page, limit: 20,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(search ? { search } : {}),
  }), [page, statusFilter, search]);

  const { data, loading, error, refetch } = useApi(fetchFn, [page, tab, search]);
  const bookings = data?.rows ?? [];
  const meta     = data ?? {};

  async function handleCancel(b) {
    if (!window.confirm(`Cancel booking for "${b.room_name}" by ${b.user_name}?`)) return;
    try {
      await cancelBooking(b.id);
      notify('Booking cancelled.', 'info');
      refetch();
    } catch (e) { notify(e.message || 'Cancel failed', 'error'); }
  }

  const TABS = [
    { k:'all',       l:`All (${meta.total ?? '…'})` },
    { k:'confirmed', l:'Confirmed' },
    { k:'pending',   l:'Pending' },
    { k:'cancelled', l:'Cancelled' },
  ];

  return (
    <AdminShell>
      <div className="ap-hdr">
        <div><h1>Room Bookings</h1><p className="ap-sub">Manage all room reservations campus-wide</p></div>
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
            <input placeholder="Search room, user, purpose…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}/>
          </div>
          <span style={{ fontSize:'.82rem', color:'#7880a8', marginLeft:'auto' }}>
            {meta.total != null ? `${meta.total} bookings` : ''}
          </span>
        </div>

        {loading ? <LoadingSpinner message="Loading bookings…"/>
        : error   ? <ErrorState error={error} onRetry={refetch}/>
        : bookings.length === 0
          ? <EmptyState icon="📅" title="No bookings found" description="Try a different filter or search."/>
        : (
          <>
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Booked By</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight:600, color:'#eceefb' }}>{b.room_name ?? b.room_code}</div>
                        <div style={{ fontSize:'.76rem', color:'#7880a8' }}>{b.building}</div>
                      </td>
                      <td>
                        <div style={{ color:'#eceefb' }}>{b.user_name}</div>
                        <div style={{ fontSize:'.76rem', color:'#7880a8' }}>{b.user_role}</div>
                      </td>
                      <td style={{ color:'#c5caf0', fontSize:'.83rem' }}>{fmtDt(b.start_time)}</td>
                      <td style={{ color:'#c5caf0', fontSize:'.83rem' }}>{fmtDt(b.end_time)}</td>
                      <td style={{ color:'#7880a8', fontSize:'.83rem' }}>{b.purpose ?? '—'}</td>
                      <td>
                        <span className={`ap-badge ${STATUS_BADGE[b.status]??'ap-badge-gray'}`}>{b.status}</span>
                      </td>
                      <td>
                        {b.status !== 'cancelled' && (
                          <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={() => handleCancel(b)}>
                            <XCircle size={13}/> Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="ap-pages">
              <span className="ap-page-info">
                Showing {(page-1)*20+1}–{Math.min(page*20, meta.total??bookings.length)} of {meta.total??bookings.length}
              </span>
              {Array.from({length: meta.totalPages??1}, (_,i)=>i+1).map(p => (
                <button key={p} className={`ap-page ${p===page?'ap-page-active':''}`} onClick={()=>setPage(p)}>{p}</button>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
