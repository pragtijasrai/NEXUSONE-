/**
 * AdminUsers — /admin/users
 * Real API: GET/PATCH/DELETE /users (admin-only)
 * Features: search, role filter, pagination, status toggle, role change, delete confirm
 */
import { useState, useCallback } from 'react';
import { Search, UserPlus, RefreshCw, Shield, Trash2, Edit3, X, Check } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import { getUsers, updateUser, deleteUser } from '../../services/adminService.js';
import AdminShell from './AdminShell.jsx';

const ROLE_BADGE = { student:'ap-badge-blue', faculty:'ap-badge-cyan', admin:'ap-badge-yellow', maintenance:'ap-badge-green' };
const ROLES = ['student','faculty','admin','maintenance'];
const STATUSES = ['active','inactive','suspended'];

function EditModal({ user, onClose, onSave, busy }) {
  const [role,   setRole]   = useState(user.role);
  const [status, setStatus] = useState(user.status);
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.72)', zIndex:9999, display:'grid', placeItems:'center', padding:16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'#131628', border:'1px solid rgba(255,255,255,.1)', borderRadius:16, padding:26, width:'min(420px,100%)', boxShadow:'0 20px 60px rgba(0,0,0,.5)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <h3 style={{ margin:0, color:'#eceefb', fontSize:'1.05rem', fontWeight:700 }}>Edit User</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#7880a8', cursor:'pointer' }}><X size={18}/></button>
        </div>
        <div style={{ marginBottom:18 }}>
          <div style={{ fontWeight:600, color:'#eceefb', marginBottom:2 }}>{user.name}</div>
          <div style={{ fontSize:'.82rem', color:'#7880a8' }}>{user.email}</div>
        </div>
        <label style={{ display:'block', fontSize:'.78rem', color:'#7880a8', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:5 }}>Role</label>
        <select value={role} onChange={e => setRole(e.target.value)}
          style={{ width:'100%', background:'#0d1117', border:'1px solid rgba(255,255,255,.1)', borderRadius:9, color:'#eceefb', font:'inherit', fontSize:'.88rem', padding:'0 12px', minHeight:38, marginBottom:14, outline:'none' }}>
          {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
        </select>
        <label style={{ display:'block', fontSize:'.78rem', color:'#7880a8', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:5 }}>Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ width:'100%', background:'#0d1117', border:'1px solid rgba(255,255,255,.1)', borderRadius:9, color:'#eceefb', font:'inherit', fontSize:'.88rem', padding:'0 12px', minHeight:38, marginBottom:20, outline:'none' }}>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button className="ap-btn ap-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="ap-btn ap-btn-primary" disabled={busy} onClick={() => onSave({ role, status })}>
            {busy ? 'Saving…' : <><Check size={14}/> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { user: me } = useAuth();
  const { notify } = useToast();
  const [tab,    setTab]    = useState('all');
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);
  const [editing, setEditing] = useState(null);
  const [editBusy, setEditBusy] = useState(false);

  const roleFilter = { students:'student', faculty:'faculty', admins:'admin', maintenance:'maintenance' }[tab];

  const fetchFn = useCallback(() => getUsers({
    page, limit: 20,
    ...(roleFilter ? { role: roleFilter } : {}),
    ...(search ? { search } : {}),
  }), [page, roleFilter, search]);

  const { data, loading, error, refetch } = useApi(fetchFn, [page, tab, search]);
  const users = data?.users ?? [];
  const meta  = data?.meta ?? {};

  async function handleSave(fields) {
    if (!editing) return;
    setEditBusy(true);
    try {
      await updateUser(editing.id, fields);
      notify(`${editing.name} updated.`, 'success');
      setEditing(null);
      refetch();
    } catch (e) { notify(e.message || 'Failed to update user', 'error'); }
    finally { setEditBusy(false); }
  }

  async function handleDelete(u) {
    if (String(u.id) === String(me?.id)) { notify('You cannot delete your own account.', 'error'); return; }
    if (!window.confirm(`Delete user "${u.name}"? This cannot be undone.`)) return;
    try {
      await deleteUser(u.id);
      notify(`${u.name} deleted.`, 'info');
      refetch();
    } catch (e) { notify(e.message || 'Delete failed', 'error'); }
  }

  const TABS = [
    { k:'all',         l:`All (${meta.total ?? '…'})` },
    { k:'students',    l:'Students' },
    { k:'faculty',     l:'Faculty' },
    { k:'admins',      l:'Admins' },
    { k:'maintenance', l:'Maintenance' },
  ];

  return (
    <AdminShell>
      <div className="ap-hdr">
        <div><h1>Users</h1><p className="ap-sub">Manage all platform users across roles</p></div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={refetch}><RefreshCw size={13}/> Refresh</button>
        </div>
      </div>

      <div className="ap-card">
        <div className="ap-tabs">
          {TABS.map(t => (
            <button key={t.k} className={`ap-tab ${tab === t.k ? 'ap-tab-active' : ''}`}
              onClick={() => { setTab(t.k); setPage(1); }}>{t.l}</button>
          ))}
        </div>

        <div className="ap-bar">
          <div className="ap-search" style={{ maxWidth: 360 }}>
            <Search size={14} color="#7880a8"/>
            <input placeholder="Search by name or email…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}/>
          </div>
          <span style={{ fontSize:'.82rem', color:'#7880a8', marginLeft:'auto' }}>
            {meta.total != null ? `${meta.total} total` : ''}
          </span>
        </div>

        {loading ? <LoadingSpinner message="Loading users…"/>
        : error   ? <ErrorState error={error} onRetry={refetch}/>
        : users.length === 0 ? <EmptyState icon="👥" title="No users found" description="Try a different search or tab."/>
        : (
          <>
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                          <div className="ap-avatar" style={{ background: u.role==='admin'?'#7c3aed':u.role==='faculty'?'#0ea5e9':u.role==='maintenance'?'#f59e0b':'#4338ca' }}>
                            {(u.name??'?').split(' ').map(p=>p[0]).slice(0,2).join('')}
                          </div>
                          <span style={{ color:'#eceefb', fontWeight:500 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color:'#7880a8', fontSize:'.83rem' }}>{u.email}</td>
                      <td><span className={`ap-badge ${ROLE_BADGE[u.role]??'ap-badge-gray'}`}>{u.role}</span></td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <span className={`ap-dot ${u.status==='active'?'ap-dot-green':u.status==='inactive'?'ap-dot-red':'ap-dot-yellow'}`}/>
                          <span style={{ fontSize:'.83rem' }}>{u.status}</span>
                        </div>
                      </td>
                      <td style={{ color:'#7880a8', fontSize:'.8rem' }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'}
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={() => setEditing(u)}
                            title="Edit role/status">
                            <Edit3 size={13}/> Edit
                          </button>
                          {String(u.id) !== String(me?.id) && (
                            <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={() => handleDelete(u)}
                              title="Delete user">
                              <Trash2 size={13}/>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="ap-pages">
              <span className="ap-page-info">
                Showing {(page-1)*20+1}–{Math.min(page*20, meta.total??users.length)} of {meta.total??users.length}
              </span>
              {Array.from({ length: meta.totalPages ?? 1 }, (_,i) => i+1).map(p => (
                <button key={p} className={`ap-page ${p===page?'ap-page-active':''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
            </div>
          </>
        )}
      </div>

      {editing && (
        <EditModal user={editing} onClose={() => setEditing(null)} onSave={handleSave} busy={editBusy} />
      )}
    </AdminShell>
  );
}
