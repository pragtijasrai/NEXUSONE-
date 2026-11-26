import { useState } from 'react';
import { Plus, Search, Filter, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, X, Upload, MapPin, User, Tag, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useApi } from '../../hooks/useApi.js';
import * as ms from '../../services/maintenanceService.js';
import { css, C } from './mStyles.js';

const statusCls = { open:'mp-badge mp-pending', pending:'mp-badge mp-pending', assigned:'mp-badge mp-inprogress', in_progress:'mp-badge mp-inprogress', resolved:'mp-badge mp-completed', closed:'mp-badge mp-completed' };
const CATEGORIES = ['Electrical','IT Equipment','Plumbing','Furniture','HVAC','Civil','Other'];
const LOCATIONS  = ['Block A - Room 101','Computer Lab 1','Hostel Block B','Library','Seminar Hall','Cafeteria','Sports Complex','Admin Block'];
const PRIORITIES = ['Low','Medium','High'];
const VALID_NEXT = { open:['in_progress','closed'], assigned:['in_progress','closed'], in_progress:['resolved','closed'], resolved:['closed'] };

function MField({ label, required, error, children }) {
  return (
    <div className="mp-field">
      <label className="mp-field-lbl">{label}{required&&<span className="mp-field-req"> *</span>}</label>
      {children}
      {error&&<span className="mp-field-err">{error}</span>}
    </div>
  );
}

function RequestModal({ initial, onClose, onSave, title, sub, busy }) {
  const empty = { issue:'', location:'', priority:'Medium' };
  const [form, setForm] = useState(initial ?? empty);
  const [errors, setErrors] = useState({});
  const set = k => e => { setForm(f=>({...f,[k]:e.target.value})); setErrors(x=>({...x,[k]:''})); };
  const submit = e => {
    e.preventDefault();
    const err = {};
    if (!form.issue || form.issue.trim().length < 5) err.issue = 'Min 5 characters.';
    if (!form.location) err.location = 'Select a location.';
    setErrors(err);
    if (Object.keys(err).length) return;
    onSave(form);
  };
  return (
    <div className="mp-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mp-modal">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
          <div><h2 style={{ margin:0, color:'#fff', fontSize:'1.15rem' }}>{title}</h2><p style={{ margin:'4px 0 20px', fontSize:'.83rem', color:C.muted }}>{sub}</p></div>
          <button onClick={onClose} style={{ border:0, background:'rgba(255,255,255,.08)', borderRadius:7, width:30, height:30, cursor:'pointer', display:'grid', placeItems:'center', color:C.muted }}><X size={15}/></button>
        </div>
        <form onSubmit={submit} noValidate>
          <MField label="Issue description" required error={errors.issue}>
            <textarea className="mp-textarea" value={form.issue} onChange={set('issue')} placeholder="Describe the problem…"/>
          </MField>
          <div className="mp-g2">
            <MField label="Location *" error={errors.location}>
              <select className="mp-select" value={form.location} onChange={set('location')}>
                <option value="">Select location</option>
                {LOCATIONS.map(l=><option key={l}>{l}</option>)}
              </select>
            </MField>
            <MField label="Priority">
              <select className="mp-select" value={form.priority} onChange={set('priority')}>
                {PRIORITIES.map(p=><option key={p}>{p}</option>)}
              </select>
            </MField>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:6 }}>
            <button type="button" className="mp-btn mp-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="mp-btn mp-btn-primary" disabled={busy}>{busy?'Saving…':initial?'Update Request':'Submit Request'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailModal({ ticket, onClose, onEdit }) {
  return (
    <div className="mp-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mp-modal" style={{ width:'min(650px,100%)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
          <div>
            <h2 style={{ margin:0, color:'#fff', fontSize:'1.15rem' }}>Request Details</h2>
            <p style={{ margin:'3px 0 0', fontSize:'.83rem', color:C.muted }}>View complete information.</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="mp-btn mp-btn-primary mp-btn-sm" onClick={()=>{onClose();onEdit();}}>Update Status</button>
            <button onClick={onClose} style={{ border:0, background:'rgba(255,255,255,.08)', borderRadius:7, width:30, height:30, cursor:'pointer', display:'grid', placeItems:'center', color:C.muted }}><X size={15}/></button>
          </div>
        </div>
        <div style={{ background:'rgba(255,255,255,.04)', border:`1px solid ${C.border}`, borderRadius:12, padding:'14px 16px', marginBottom:18 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
            <span style={{ background:'rgba(99,102,241,.2)', color:'#818cf8', fontWeight:700, fontSize:'.78rem', padding:'3px 9px', borderRadius:5 }}>{ticket.id}</span>
            <span className={statusCls[ticket.status] ?? 'mp-badge mp-pending'}>{ticket.status}</span>
          </div>
          <div style={{ fontWeight:700, color:'#fff', fontSize:'1rem', marginBottom:3 }}>{ticket.issue ?? ticket.title}</div>
          <div style={{ fontSize:'.78rem', color:C.muted }}>Reported {ticket.created_at ? new Date(ticket.created_at).toLocaleString() : ''}</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
          {[{icon:MapPin,label:'Location',val:ticket.location},{icon:AlertCircle,label:'Priority',val:ticket.priority,color:ticket.priority==='High'||ticket.priority==='high'?'#f87171':ticket.priority==='Medium'||ticket.priority==='medium'?'#fbbf24':'#34d399'},{icon:User,label:'Reported By',val:ticket.reporter_name??'—'},{icon:Clock,label:'Date',val:ticket.created_at?new Date(ticket.created_at).toLocaleDateString():'—'}].map(item=>(
            <div key={item.label} style={{ background:'rgba(255,255,255,.04)', border:`1px solid ${C.border}`, borderRadius:10, padding:'11px 13px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:'.73rem', fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'.04em', marginBottom:4 }}>
                <item.icon size={11}/>{item.label}
              </div>
              <div style={{ fontSize:'.88rem', fontWeight:600, color:item.color??'#e2e8f0' }}>{item.val}</div>
            </div>
          ))}
        </div>
        {ticket.history?.length > 0 && (
          <>
            <div style={{ fontSize:'.76rem', fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:8 }}>History</div>
            {ticket.history.map((h,i)=>(
              <div key={i} style={{ display:'flex', gap:12, padding:'7px 0', borderBottom:i<ticket.history.length-1?`1px solid ${C.border}`:'0' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:i===0?C.primary:'#34d399', flexShrink:0, marginTop:5 }}/>
                <div>
                  <div style={{ fontSize:'.77rem', color:C.muted }}>{h.date ?? (h.created_at ? new Date(h.created_at).toLocaleString() : '')}</div>
                  <div style={{ fontSize:'.86rem', fontWeight:600, color:'#e2e8f0' }}>{h.action ?? `${h.old_status} → ${h.new_status}`}</div>
                  {h.by && <div style={{ fontSize:'.77rem', color:C.muted }}>By {h.by}</div>}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default function MaintenanceTickets() {
  const { user } = useAuth();
  const { notify } = useToast();
  const [tab, setTab]     = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage]   = useState(1);
  const [showNew, setShowNew] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy]   = useState(false);
  const PER = 6;

  const { data, loading, error, refetch } = useApi(ms.getTickets, [page]);

  const tickets = data?.rows ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? tickets.length) / PER));

  const filtered = tickets.filter(t => {
    const matchTab = tab==='All' ||
      (tab==='Pending' && ['open','pending','assigned'].includes(t.status)) ||
      (tab==='In Progress' && t.status==='in_progress') ||
      (tab==='Completed' && ['resolved','closed'].includes(t.status));
    const q = search.trim().toLowerCase();
    const matchSearch = !q || (t.issue??t.title??'').toLowerCase().includes(q) || t.location?.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const counts = {
    all:  tickets.length,
    p:    tickets.filter(t=>['open','pending','assigned'].includes(t.status)).length,
    i:    tickets.filter(t=>t.status==='in_progress').length,
    c:    tickets.filter(t=>['resolved','closed'].includes(t.status)).length,
  };
  const TABS=[{k:'All',l:`All (${counts.all})`},{k:'Pending',l:`Pending (${counts.p})`},{k:'In Progress',l:`In Progress (${counts.i})`},{k:'Completed',l:`Completed (${counts.c})`}];

  const create = async (form) => {
    setBusy(true);
    try {
      await ms.createTicket({ location:form.location, issue:form.issue, priority:form.priority.toLowerCase() });
      notify('Ticket submitted!', 'success'); setShowNew(false); refetch();
    } catch (e) { notify(e.message || 'Failed', 'error'); }
    finally { setBusy(false); }
  };

  const updateStatus = async (form) => {
    if (!editing) return;
    const nextStatuses = VALID_NEXT[editing.status] ?? [];
    if (nextStatuses.length === 0) { notify('No valid transitions from this status.', 'info'); setEditing(null); return; }
    setBusy(true);
    try {
      await ms.updateStatus(editing.id, nextStatuses[0]);
      notify('Status updated.', 'success'); setEditing(null); refetch();
    } catch (e) { notify(e.message || 'Failed', 'error'); }
    finally { setBusy(false); }
  };

  const Abtn = ({onClick,bg,color,Icon,tt}) => (
    <button onClick={onClick} title={tt} className="mp-action" style={{ background:bg, borderColor:bg, color }}>
      <Icon size={13}/>
    </button>
  );

  return (
    <>
      <style>{css}</style>
      <div className="mp">
        <div style={{ fontSize:'.78rem', color:C.muted, marginBottom:14 }}>Home &rsaquo; <span style={{ color:C.text }}>Maintenance</span></div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:20 }}>
          <div><h1>Maintenance Requests</h1><p className="mp-sub">View, manage and update maintenance requests.</p></div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="mp-btn mp-btn-ghost mp-btn-sm" onClick={refetch}><RefreshCw size={13}/> Refresh</button>
            <button className="mp-btn mp-btn-primary" onClick={()=>setShowNew(true)}><Plus size={15}/> + New Request</button>
          </div>
        </div>

        <div className="mp-card">
          <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:16 }}>
            <div className="mp-tabs">{TABS.map(t=><button key={t.k} className={`mp-tab ${tab===t.k?'mp-tab-active':''}`} onClick={()=>{setTab(t.k);setPage(1);}}>{t.l}</button>)}</div>
            <div style={{ display:'flex', gap:8 }}>
              <div className="mp-search" style={{ minWidth:200 }}>
                <Search size={14} color={C.muted}/>
                <input placeholder="Search requests…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
              </div>
            </div>
          </div>

          {loading ? <div style={{ textAlign:'center', padding:40, color:C.muted }}>Loading…</div>
           : error  ? <div style={{ textAlign:'center', padding:40, color:'#f87171' }}>{error.message} <button className="mp-btn mp-btn-ghost mp-btn-sm" onClick={refetch}>Retry</button></div>
           : filtered.length===0 ? <div style={{ textAlign:'center', padding:40, color:C.muted }}>No requests found.</div>
           : (
            <div style={{ overflowX:'auto' }}>
              <table className="mp-tbl">
                <thead><tr><th>ID</th><th>Issue</th><th>Location</th><th>Priority</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(t=>(
                    <tr key={t.id}>
                      <td style={{ color:'#818cf8', fontFamily:'monospace', fontSize:'.8rem', fontWeight:700 }}>#{t.id}</td>
                      <td style={{ color:'#e2e8f0', fontWeight:500 }}>{t.issue ?? t.title}</td>
                      <td style={{ color:C.muted }}>{t.location}</td>
                      <td><span className={`mp-badge ${t.priority==='high'||t.priority==='High'?'mp-badge-high':t.priority==='medium'||t.priority==='Medium'?'mp-badge-medium':'mp-badge-low'}`}>{t.priority}</span></td>
                      <td style={{ color:C.muted, fontSize:'.8rem' }}>{t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}</td>
                      <td><span className={statusCls[t.status]??'mp-badge mp-pending'}>{t.status}</span></td>
                      <td>
                        <div style={{ display:'flex', gap:5 }}>
                          <Abtn onClick={()=>setViewing(t)} bg="rgba(14,165,233,.2)" color="#38bdf8" Icon={Eye} tt="View"/>
                          <Abtn onClick={()=>setEditing(t)} bg="rgba(99,102,241,.2)" color="#818cf8" Icon={Pencil} tt="Update status"/>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:14 }}>
              <span style={{ fontSize:'.8rem', color:C.muted }}>Showing {filtered.length} of {data?.total ?? tickets.length}</span>
              <div className="mp-pages">
                <button className="mp-page" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}><ChevronLeft size={13}/></button>
                {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                  <button key={p} className={`mp-page ${p===page?'mp-page-on':''}`} onClick={()=>setPage(p)}>{p}</button>
                ))}
                <button className="mp-page" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}><ChevronRight size={13}/></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showNew && <RequestModal title="Create Maintenance Request" sub="Fill in the details to create a new request." onClose={()=>setShowNew(false)} onSave={create} busy={busy}/>}
      {editing && <RequestModal title="Update Request Status" sub={`Current status: ${editing.status}. Next: ${(VALID_NEXT[editing.status]??[]).join(', ') || 'No transitions available'}`} initial={{ issue:editing.issue??editing.title, location:editing.location, priority:editing.priority }} onClose={()=>setEditing(null)} onSave={updateStatus} busy={busy}/>}
      {viewing && !editing && <DetailModal ticket={viewing} onClose={()=>setViewing(null)} onEdit={()=>{setEditing(viewing);setViewing(null);}}/>}
    </>
  );
}
