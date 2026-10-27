import { useState, useMemo } from 'react';
import { Plus, Search, Filter, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, X, Upload, MapPin, User, Tag, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { css, C } from './mStyles.js';
import { TICKETS as initData, CATEGORIES, LOCATIONS, PRIORITIES, nextId as _nid } from './mData.js';

let nid = _nid;
const statusCls  = { Pending:'mp-badge mp-pending', 'In Progress':'mp-badge mp-inprogress', Completed:'mp-badge mp-completed' };
const statusList = ['All (12)', 'Pending (5)', 'In Progress (4)', 'Completed (3)'];
const tabKey = (t) => t.split(' ')[0];

function MField({ label, required, error, children }) {
  return (
    <div className="mp-field">
      <label className="mp-field-lbl">{label}{required&&<span className="mp-field-req"> *</span>}</label>
      {children}
      {error&&<span className="mp-field-err">{error}</span>}
    </div>
  );
}

function RequestModal({ initial, onClose, onSave, title, sub }) {
  const empty = { title:'', description:'', category:'', location:'', priority:'Medium', contact:'' };
  const [form, setForm] = useState(initial ?? empty);
  const [errors, setErrors] = useState({});
  const set = k => e => { setForm(f=>({...f,[k]:e.target.value})); setErrors(x=>({...x,[k]:''})); };

  const submit = e => {
    e.preventDefault();
    const err = {};
    if (!form.title.trim() || form.title.trim().length < 3) err.title = 'Min 3 characters.';
    if (!form.description.trim() || form.description.trim().length < 10) err.description = 'Min 10 characters.';
    if (!form.category) err.category = 'Select a category.';
    if (!form.location) err.location = 'Select a location.';
    setErrors(err);
    if (Object.keys(err).length) return;
    onSave(form);
  };

  return (
    <div className="mp-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mp-modal">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
          <div><h2 style={{margin:0,color:'#fff',fontSize:'1.15rem'}}>{title}</h2>
          <p style={{margin:'4px 0 20px',fontSize:'.83rem',color:C.muted}}>{sub}</p></div>
          <button onClick={onClose} style={{border:0,background:'rgba(255,255,255,.08)',borderRadius:7,width:30,height:30,cursor:'pointer',display:'grid',placeItems:'center',color:C.muted}}><X size={15}/></button>
        </div>

        <form onSubmit={submit} noValidate>
          <MField label="Title" required error={errors.title}>
            <input className="mp-input" value={form.title} onChange={set('title')} placeholder="Enter request title"/>
          </MField>
          <MField label="Description" required error={errors.description}>
            <textarea className="mp-textarea" value={form.description} onChange={set('description')} placeholder="Enter description..."/>
          </MField>
          <div className="mp-g2">
            <MField label="Category *" error={errors.category}>
              <select className="mp-select" value={form.category} onChange={set('category')}>
                <option value="">Select category</option>
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </MField>
            <MField label="Location *" error={errors.location}>
              <select className="mp-select" value={form.location} onChange={set('location')}>
                <option value="">Select location</option>
                {LOCATIONS.map(l=><option key={l}>{l}</option>)}
              </select>
            </MField>
          </div>
          <MField label="Priority">
            <select className="mp-select" value={form.priority} onChange={set('priority')}>
              {PRIORITIES.map(p=><option key={p}>{p}</option>)}
            </select>
          </MField>
          <MField label="Attach Image (optional)">
            <div style={{display:'flex',alignItems:'center',gap:9,background:'rgba(255,255,255,.05)',border:`1px solid ${C.border}`,borderRadius:8,padding:'8px 12px',cursor:'pointer',fontSize:'.83rem',color:C.muted}}>
              <Upload size={13}/><span>Choose File</span><span style={{opacity:.6}}>No file chosen</span>
            </div>
          </MField>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:6}}>
            <button type="button" className="mp-btn mp-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="mp-btn mp-btn-primary">{initial?'Update Request':'Submit Request'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailModal({ ticket, onClose, onEdit }) {
  return (
    <div className="mp-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mp-modal" style={{width:'min(650px,100%)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
          <div>
            <h2 style={{margin:0,color:'#fff',fontSize:'1.15rem'}}>Request Details</h2>
            <p style={{margin:'3px 0 0',fontSize:'.83rem',color:C.muted}}>View complete information about this maintenance request.</p>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button className="mp-btn mp-btn-primary mp-btn-sm" onClick={()=>{onClose();onEdit();}}>Update Status</button>
            <button onClick={onClose} style={{border:0,background:'rgba(255,255,255,.08)',borderRadius:7,width:30,height:30,cursor:'pointer',display:'grid',placeItems:'center',color:C.muted}}><X size={15}/></button>
          </div>
        </div>

        <div style={{background:'rgba(255,255,255,.04)',border:`1px solid ${C.border}`,borderRadius:12,padding:'14px 16px',marginBottom:18,display:'flex',gap:14,alignItems:'flex-start'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
              <span style={{background:'rgba(99,102,241,.2)',color:'#818cf8',fontWeight:700,fontSize:'.78rem',padding:'3px 9px',borderRadius:5}}>{ticket.id}</span>
              <span className={statusCls[ticket.status]}>{ticket.status}</span>
            </div>
            <div style={{fontWeight:700,color:'#fff',fontSize:'1rem',marginBottom:3}}>{ticket.title}</div>
            <div style={{fontSize:'.78rem',color:C.muted}}>Reported on {ticket.date}, 10:30 AM</div>
          </div>
        </div>

        <div style={{marginBottom:16}}>
          <div style={{fontSize:'.76rem',fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:6}}>Description</div>
          <p style={{margin:0,color:C.text,fontSize:'.88rem',lineHeight:1.65}}>{ticket.description}</p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
          {[
            {icon:Tag,      label:'Category',    val:ticket.category},
            {icon:MapPin,   label:'Location',    val:ticket.location},
            {icon:User,     label:'Requested By',val:ticket.requestedBy},
            {icon:AlertCircle,label:'Priority',  val:ticket.priority,
             color:ticket.priority==='High'?'#f87171':ticket.priority==='Medium'?'#fbbf24':'#34d399'},
            {icon:User,     label:'Contact',     val:ticket.contact},
            {icon:Clock,    label:'Date',        val:ticket.date},
          ].map(item=>(
            <div key={item.label} style={{background:'rgba(255,255,255,.04)',border:`1px solid ${C.border}`,borderRadius:10,padding:'11px 13px'}}>
              <div style={{display:'flex',alignItems:'center',gap:5,fontSize:'.73rem',fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:'.04em',marginBottom:4}}>
                <item.icon size={11}/>{item.label}
              </div>
              <div style={{fontSize:'.88rem',fontWeight:600,color:item.color??'#e2e8f0'}}>{item.val}</div>
            </div>
          ))}
        </div>

        <div style={{fontSize:'.76rem',fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:8}}>Status History</div>
        {ticket.history.map((h,i)=>(
          <div key={i} style={{display:'flex',gap:12,padding:'7px 0',borderBottom:i<ticket.history.length-1?`1px solid ${C.border}`:'0'}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:i===0?C.primary:'#34d399',flexShrink:0,marginTop:5}}/>
            <div>
              <div style={{fontSize:'.77rem',color:C.muted}}>{h.date}</div>
              <div style={{fontSize:'.86rem',fontWeight:600,color:'#e2e8f0'}}>{h.action}</div>
              <div style={{fontSize:'.77rem',color:C.muted}}>By {h.by}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MaintenanceTickets() {
  const { user } = useAuth();
  const { notify } = useToast();
  const [tickets, setTickets] = useState(initData);
  const [tab, setTab]         = useState('All');
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [showNew, setShowNew] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const PER = 6;

  const filtered = useMemo(()=>{
    const q=search.trim().toLowerCase();
    return tickets.filter(t=>{
      const matchTab = tab==='All'||(tab==='Pending'&&t.status==='Pending')||(tab==='In Progress'&&t.status==='In Progress')||(tab==='Completed'&&t.status==='Completed');
      return matchTab&&(!q||t.title.toLowerCase().includes(q)||t.id.toLowerCase().includes(q)||t.location.toLowerCase().includes(q)||t.requestedBy.toLowerCase().includes(q));
    });
  },[tickets,tab,search]);

  const pages = Math.max(1,Math.ceil(filtered.length/PER));
  const rows  = filtered.slice((page-1)*PER,page*PER);

  const create = form => {
    const id=`MNT-${String(nid++).padStart(3,'0')}`;
    const date=new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
    const time=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    setTickets(p=>[{id,title:form.title.trim(),category:form.category,location:form.location,requestedBy:user.name,priority:form.priority,status:'Pending',date,description:form.description.trim(),contact:user.email||'',history:[{date:`${date}, ${time}`,action:'Request Created',by:user.name}]},...p]);
    setShowNew(false); setPage(1); setTab('All');
    notify(`Ticket ${id} created!`,'success');
  };

  const edit = form => {
    setTickets(p=>p.map(x=>x.id===editing.id?{...x,title:form.title.trim(),category:form.category,location:form.location,priority:form.priority,description:form.description.trim()}:x));
    setEditing(null); notify('Updated.','success');
  };

  const del = id => {
    if(!window.confirm('Delete?')) return;
    setTickets(p=>p.filter(t=>t.id!==id)); notify('Deleted.','info');
  };

  const Abtn = ({onClick,bg,color,Icon,tt}) => (
    <button onClick={onClick} title={tt} className="mp-action" style={{background:bg,borderColor:bg,color}}>
      <Icon size={13}/>
    </button>
  );

  const counts = {all:tickets.length,p:tickets.filter(t=>t.status==='Pending').length,i:tickets.filter(t=>t.status==='In Progress').length,c:tickets.filter(t=>t.status==='Completed').length};
  const TABS=[{k:'All',l:`All (${counts.all})`},{k:'Pending',l:`Pending (${counts.p})`},{k:'In Progress',l:`In Progress (${counts.i})`},{k:'Completed',l:`Completed (${counts.c})`}];

  return (
    <>
      <style>{css}</style>
      <div className="mp">
        <div style={{fontSize:'.78rem',color:C.muted,marginBottom:14}}>Home &rsaquo; <span style={{color:C.text}}>Maintenance</span></div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12,marginBottom:20}}>
          <div>
            <h1>Maintenance Requests</h1>
            <p className="mp-sub">View, manage and update maintenance requests.</p>
          </div>
          <button className="mp-btn mp-btn-primary" onClick={()=>setShowNew(true)}><Plus size={15}/> + New Request</button>
        </div>

        <div className="mp-card">
          <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:12,marginBottom:16}}>
            <div className="mp-tabs">
              {TABS.map(t=>(
                <button key={t.k} className={`mp-tab ${tab===t.k?'mp-tab-active':''}`} onClick={()=>{setTab(t.k);setPage(1);}}>{t.l}</button>
              ))}
            </div>
            <div style={{display:'flex',gap:8}}>
              <div className="mp-search" style={{minWidth:200}}>
                <Search size={14} color={C.muted}/>
                <input placeholder="Search requests..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
              </div>
              <button className="mp-btn mp-btn-ghost mp-btn-sm"><Filter size={13}/> Filter</button>
            </div>
          </div>

          <div style={{overflowX:'auto'}}>
            <table className="mp-tbl">
              <thead>
                <tr><th>ID</th><th>Title</th><th>Category</th><th>Location</th><th>Requested By</th><th>Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {rows.length===0
                  ? <tr><td colSpan={8} style={{textAlign:'center',padding:'36px 0',color:C.muted}}>No requests found.</td></tr>
                  : rows.map(t=>(
                    <tr key={t.id}>
                      <td style={{color:'#818cf8',fontFamily:'monospace',fontSize:'.8rem',fontWeight:700}}>{t.id}</td>
                      <td style={{color:'#e2e8f0',fontWeight:500}}>{t.title}</td>
                      <td style={{color:C.muted}}>{t.category}</td>
                      <td style={{color:C.muted}}>{t.location}</td>
                      <td style={{color:C.muted}}>{t.requestedBy}</td>
                      <td style={{color:C.muted,fontSize:'.8rem'}}>{t.date}</td>
                      <td><span className={statusCls[t.status]}>{t.status}</span></td>
                      <td>
                        <div style={{display:'flex',gap:5}}>
                          <Abtn onClick={()=>setViewing(t)} bg="rgba(14,165,233,.2)" color="#38bdf8" Icon={Eye} tt="View"/>
                          <Abtn onClick={()=>setEditing(t)} bg="rgba(99,102,241,.2)" color="#818cf8" Icon={Pencil} tt="Edit"/>
                          <Abtn onClick={()=>del(t.id)} bg="rgba(239,68,68,.2)" color="#f87171" Icon={Trash2} tt="Delete"/>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:14}}>
            <span style={{fontSize:'.8rem',color:C.muted}}>Showing 1 to {rows.length} of {filtered.length} requests</span>
            <div className="mp-pages">
              <button className="mp-page" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}><ChevronLeft size={13}/></button>
              {Array.from({length:pages},(_,i)=>i+1).map(p=>(
                <button key={p} className={`mp-page ${p===page?'mp-page-on':''}`} onClick={()=>setPage(p)}>{p}</button>
              ))}
              <button className="mp-page" onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages}><ChevronRight size={13}/></button>
            </div>
          </div>
        </div>
      </div>

      {showNew&&<RequestModal title="Create Maintenance Request" sub="Fill in the details to create a new maintenance request." onClose={()=>setShowNew(false)} onSave={create}/>}
      {editing&&<RequestModal title="Edit Maintenance Request" sub="Update the details of this maintenance request." initial={{title:editing.title,description:editing.description,category:editing.category,location:editing.location,priority:editing.priority,contact:editing.contact}} onClose={()=>setEditing(null)} onSave={edit}/>}
      {viewing&&!editing&&<DetailModal ticket={viewing} onClose={()=>setViewing(null)} onEdit={()=>{setEditing(viewing);setViewing(null);}}/>}
    </>
  );
}
