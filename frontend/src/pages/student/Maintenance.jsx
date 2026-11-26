import { useState } from 'react';
import { Plus, X, MapPin, Calendar, Wrench, CheckCircle2, RotateCcw, AlertTriangle, Clock, User, History } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import * as ms from '../../services/maintenanceService.js';

const CATEGORIES = ['Electrical','Plumbing','Furniture','IT Equipment','Internet','Cleanliness','Other'];
const PRIORITIES  = ['Low','Medium','High','Urgent'];
const LOCATIONS   = ['CS Block','Engineering Block','Library','Hostel A','Innovation Hub','Main Auditorium','Cafeteria'];

const statusBadge = { open:'badge--warn', assigned:'badge--primary', in_progress:'badge--live', resolved:'badge--done', closed:'badge--next' };
const prioBadge   = { Low:'badge--next', Medium:'badge--primary', High:'badge--warn', Urgent:'badge--urgent' };
const FILTERS = ['All','Open','In Progress','Resolved'];

function TicketModal({ onClose, onSubmit, busy }) {
  const [f, setF] = useState({ location:'', issue:'', priority:'Medium' });
  const [err, setErr] = useState({});
  const set = k => e => { setF(p=>({...p,[k]:e.target.value})); setErr(x=>({...x,[k]:''})); };

  const submit = e => {
    e.preventDefault();
    const errors = {};
    if (!f.location) errors.location = 'Choose a location.';
    if (!f.issue || f.issue.trim().length < 5) errors.issue = 'Describe the issue (min 5 chars).';
    setErr(errors);
    if (Object.keys(errors).length) return;
    onSubmit(f);
  };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:60, display:'grid', placeItems:'center', padding:16 }}>
      <form className="card" onSubmit={submit} noValidate style={{ width:'min(500px,100%)', boxShadow:'var(--shadow-lg)' }}>
        <div className="section-header">
          <h2>Report an Issue</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18}/></button>
        </div>
        <label className="field">Location
          <select value={f.location} onChange={set('location')} aria-invalid={!!err.location}>
            <option value="">Select…</option>
            {LOCATIONS.map(l=><option key={l}>{l}</option>)}
          </select>
          {err.location && <span className="field__error">{err.location}</span>}
        </label>
        <label className="field">Issue description
          <textarea value={f.issue} onChange={set('issue')} rows={3} placeholder="Describe the problem…"
            style={{ padding:'10px 14px', minHeight:80, resize:'vertical' }} aria-invalid={!!err.issue}/>
          {err.issue && <span className="field__error">{err.issue}</span>}
        </label>
        <label className="field">Priority
          <select value={f.priority} onChange={set('priority')}>
            {PRIORITIES.map(p=><option key={p}>{p}</option>)}
          </select>
        </label>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            <Wrench size={16}/> {busy ? 'Submitting…' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Maintenance() {
  const { user } = useAuth();
  const { notify } = useToast();
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [busy, setBusy] = useState(false);

  const { data, loading, error, refetch } = useApi(ms.getTickets);
  const tickets = data?.rows ?? [];

  /* Ticket detail for expanded view */
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const counts = {
    open: tickets.filter(t=>['open','assigned'].includes(t.status)).length,
    progress: tickets.filter(t=>t.status==='in_progress').length,
    done: tickets.filter(t=>['resolved','closed'].includes(t.status)).length,
  };

  const visible = tickets.filter(t => {
    if (filter==='All') return true;
    if (filter==='Open') return ['open','assigned'].includes(t.status);
    if (filter==='In Progress') return t.status==='in_progress';
    return ['resolved','closed'].includes(t.status);
  });

  const create = async (f) => {
    setBusy(true);
    try {
      await ms.createTicket({ location: f.location, issue: f.issue, priority: f.priority.toLowerCase() });
      notify('Ticket submitted!', 'success');
      setShowForm(false);
      refetch();
    } catch (e) { notify(e.message || 'Failed to submit ticket', 'error'); }
    finally { setBusy(false); }
  };

  const reopen = async (id) => {
    try {
      await ms.updateStatus(id, 'open', 'Reopened by student');
      notify('Ticket reopened.', 'info');
      refetch();
    } catch (e) { notify(e.message, 'error'); }
  };

  /* Fetch full ticket detail (includes history) when expanding */
  const toggleExpand = async (id) => {
    if (openId === id) { setOpenId(null); setDetail(null); return; }
    setOpenId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const result = await ms.getTicket(id);
      setDetail(result);
    } catch { setDetail(null); }
    finally { setDetailLoading(false); }
  };

  if (loading) return <LoadingSpinner message="Loading tickets…" />;
  if (error)   return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="stack">
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div><h1>Maintenance</h1><p className="muted">Report issues and track their progress, {user.name.split(' ')[0]}.</p></div>
        <button className="btn btn--primary" onClick={()=>setShowForm(true)}><Plus size={16}/> Create Ticket</button>
      </header>

      {/* Summary */}
      <div className="grid grid--3">
        {[['Open / Assigned', counts.open, AlertTriangle,'stat__icon--warn'],['In Progress',counts.progress,Clock,''],['Resolved / Closed',counts.done,CheckCircle2,'stat__icon--ok']].map(([label,val,Icon,cls])=>(
          <div className="card" key={label}><div className="stat"><span className={`stat__icon ${cls}`}><Icon size={20}/></span><div><p className="stat__label">{label}</p><p className="stat__value">{val}</p></div></div></div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="tabs" style={{ marginBottom:0 }}>
        {FILTERS.map(f=><button key={f} className={`tab ${filter===f?'tab--active':''}`} onClick={()=>setFilter(f)}>{f==='Open'?'Open / Assigned':f==='Resolved'?'Resolved / Closed':f}</button>)}
      </div>

      {visible.length === 0
        ? <EmptyState icon="🛠️" title="No tickets" description="Create a ticket to report a campus issue." action={<button className="btn btn--primary btn--sm" onClick={()=>setShowForm(true)}>Create Ticket</button>}/>
        : <div className="stack">
          {visible.map(t => {
            const exp = openId===t.id;
            return (
              <article key={t.id} className="card" style={{ padding:0, overflow:'hidden' }}>
                <button onClick={()=>toggleExpand(t.id)} aria-expanded={exp}
                  style={{ all:'unset', boxSizing:'border-box', width:'100%', cursor:'pointer', display:'grid', gridTemplateColumns:'44px 1fr auto', gap:14, alignItems:'center', padding:'16px 20px' }}>
                  <span className="stat__icon"><Wrench size={20}/></span>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontWeight:600 }}>{t.issue ?? t.title}</div>
                    <div className="muted small" style={{ display:'flex', gap:14, flexWrap:'wrap', marginTop:2 }}>
                      <span style={{ display:'inline-flex', gap:4, alignItems:'center' }}><MapPin size={12}/>{t.location}</span>
                      <span style={{ display:'inline-flex', gap:4, alignItems:'center' }}><Calendar size={12}/>{t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}</span>
                      {t.reporter_name && <span style={{ display:'inline-flex', gap:4, alignItems:'center' }}><User size={12}/>{t.reporter_name}</span>}
                    </div>
                  </div>
                  <div style={{ display:'grid', gap:4, justifyItems:'end' }}>
                    <span className={`badge ${statusBadge[t.status] ?? 'badge--next'}`}>{t.status}</span>
                    <span className={`badge ${prioBadge[t.priority] ?? 'badge--next'}`}>{t.priority}</span>
                  </div>
                </button>
                {exp && (
                  <div style={{ padding:'4px 20px 20px', borderTop:'1px solid var(--border)', background:'var(--surface2)' }}>
                    <p style={{ margin:'12px 0', fontSize:'.9rem' }}>{t.issue ?? t.title}</p>

                    {/* Assigned staff */}
                    {t.assigned_name && (
                      <div style={{ display:'flex', gap:8, alignItems:'center', padding:'8px 12px', borderRadius:'var(--r)', background:'var(--info-bg)', color:'var(--info)', fontSize:'.85rem', marginBottom:10 }}>
                        <Wrench size={14}/> Assigned to <strong>{t.assigned_name}</strong>
                      </div>
                    )}

                    {/* History timeline */}
                    {detailLoading ? (
                      <p className="muted small" style={{ padding:'8px 0' }}>Loading details…</p>
                    ) : detail?.history && detail.history.length > 0 ? (
                      <div style={{ marginTop:8 }}>
                        <div className="muted small" style={{ display:'inline-flex', gap:6, alignItems:'center', marginBottom:6 }}>
                          <History size={13}/> Status History
                        </div>
                        <div style={{ display:'grid', gap:6 }}>
                          {detail.history.map((h, i) => (
                            <div key={h.id ?? i} style={{ display:'flex', gap:10, alignItems:'flex-start', fontSize:'.82rem', padding:'4px 0' }}>
                              <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--primary)', marginTop:5, flexShrink:0 }} />
                              <div>
                                <span style={{ fontWeight:500 }}>{h.new_status}</span>
                                {h.old_status && <span className="muted"> from {h.old_status}</span>}
                                {h.note && <span className="muted"> — {h.note}</span>}
                                <div className="muted small" style={{ fontSize:'.76rem' }}>
                                  {h.changed_by_name ?? 'System'} · {h.created_at ? new Date(h.created_at).toLocaleString() : ''}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : detail ? (
                      <p className="muted small" style={{ padding:'8px 0' }}>No status history yet.</p>
                    ) : null}

                    {t.status==='resolved' && (
                      <button className="btn btn--ghost btn--sm" onClick={()=>reopen(t.id)} style={{ marginTop:10 }}>
                        <RotateCcw size={14}/> Issue persists? Reopen
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      }

      {showForm && <TicketModal onClose={()=>setShowForm(false)} onSubmit={create} busy={busy}/>}
    </div>
  );
}
