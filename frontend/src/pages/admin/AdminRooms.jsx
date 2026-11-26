/**
 * AdminRooms — /admin/rooms
 * Real API: GET/POST/PATCH/DELETE /rooms (admin includes inactive)
 */
import { useState, useCallback } from 'react';
import { Search, Plus, RefreshCw, Edit3, Trash2, X, Check } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../../services/adminService.js';
import AdminShell from './AdminShell.jsx';

const TYPES = ['seminar','lab','lecture','study','conference','other'];
const EMPTY = { room_code:'', name:'', building:'', capacity:'', type:'seminar', amenities:'' };

function RoomModal({ initial, onClose, onSave, busy }) {
  const isEdit = !!initial?.id;
  const [f, setF] = useState(initial
    ? { ...initial, amenities: (initial.amenities ?? []).join(', ') }
    : { ...EMPTY });
  const [errs, setErrs] = useState({});
  const set = (k, v) => { setF(p=>({...p,[k]:v})); setErrs(e=>({...e,[k]:''})); };

  function submit(e) {
    e.preventDefault();
    const err = {};
    if (!f.room_code?.trim()) err.room_code = 'Required';
    if (!f.name?.trim())      err.name      = 'Required';
    if (!f.building?.trim())  err.building  = 'Required';
    if (!f.capacity || Number(f.capacity) < 1) err.capacity = 'Must be ≥ 1';
    setErrs(err);
    if (Object.keys(err).length) return;
    onSave({
      room_code: f.room_code.trim().toUpperCase(),
      name: f.name.trim(),
      building: f.building.trim(),
      capacity: Number(f.capacity),
      type: f.type,
      amenities: f.amenities ? f.amenities.split(',').map(s=>s.trim()).filter(Boolean) : [],
    });
  }

  const field = (k, label, type='text', placeholder='') => (
    <div style={{ display:'grid', gap:4, marginBottom:14 }}>
      <label style={{ fontSize:'.78rem', color:'#7880a8', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>{label}</label>
      <input type={type} value={f[k]??''} onChange={e=>set(k,e.target.value)} placeholder={placeholder}
        style={{ background:'#0d1117', border:`1.5px solid ${errs[k]?'#f87171':'rgba(255,255,255,.1)'}`, borderRadius:9, color:'#eceefb', font:'inherit', fontSize:'.88rem', padding:'0 12px', minHeight:38, outline:'none', width:'100%', boxSizing:'border-box' }}/>
      {errs[k] && <span style={{ fontSize:'.74rem', color:'#f87171' }}>{errs[k]}</span>}
    </div>
  );

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.72)', zIndex:9999, display:'grid', placeItems:'center', padding:16 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <form style={{ background:'#131628', border:'1px solid rgba(255,255,255,.1)', borderRadius:16, padding:26, width:'min(520px,100%)', boxShadow:'0 20px 60px rgba(0,0,0,.5)', maxHeight:'90vh', overflowY:'auto' }}
        onSubmit={submit} noValidate>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ margin:0, color:'#eceefb', fontSize:'1.05rem', fontWeight:700 }}>{isEdit ? 'Edit Room' : 'Add Room'}</h3>
          <button type="button" onClick={onClose} style={{ background:'none', border:'none', color:'#7880a8', cursor:'pointer' }}><X size={18}/></button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 14px' }}>
          {field('room_code','Room Code','text','e.g. CS-204')}
          {field('capacity','Capacity','number','e.g. 40')}
        </div>
        {field('name','Room Name','text','e.g. CS Lab CS-204')}
        {field('building','Building','text','e.g. CS Block')}
        <div style={{ display:'grid', gap:4, marginBottom:14 }}>
          <label style={{ fontSize:'.78rem', color:'#7880a8', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>Type</label>
          <select value={f.type} onChange={e=>set('type',e.target.value)}
            style={{ background:'#0d1117', border:'1.5px solid rgba(255,255,255,.1)', borderRadius:9, color:'#eceefb', font:'inherit', fontSize:'.88rem', padding:'0 12px', minHeight:38, outline:'none' }}>
            {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </select>
        </div>
        {field('amenities','Amenities (comma-separated)','text','e.g. Projector, AC, Whiteboard')}
        {isEdit && (
          <div style={{ display:'grid', gap:4, marginBottom:14 }}>
            <label style={{ fontSize:'.78rem', color:'#7880a8', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>Status</label>
            <select value={f.is_active ? 'active' : 'inactive'} onChange={e=>set('is_active', e.target.value==='active')}
              style={{ background:'#0d1117', border:'1.5px solid rgba(255,255,255,.1)', borderRadius:9, color:'#eceefb', font:'inherit', fontSize:'.88rem', padding:'0 12px', minHeight:38, outline:'none' }}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:6 }}>
          <button type="button" className="ap-btn ap-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="ap-btn ap-btn-primary" disabled={busy}>
            {busy ? 'Saving…' : <><Check size={14}/> {isEdit ? 'Update' : 'Create'}</>}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminRooms() {
  const { notify } = useToast();
  const [search,   setSearch]   = useState('');
  const [typeF,    setTypeF]    = useState('all');
  const [modal,    setModal]    = useState(null); // null | 'create' | roomObj
  const [saveBusy, setSaveBusy] = useState(false);
  const [page,     setPage]     = useState(1);

  const fetchFn = useCallback(() => getRooms({ page, limit:20, ...(search?{search}:{}), ...(typeF!=='all'?{type:typeF}:{}) }), [page, search, typeF]);
  const { data, loading, error, refetch } = useApi(fetchFn, [page, search, typeF]);

  const rooms = data?.rows ?? [];
  const meta  = data ?? {};

  const allTypes = ['all', ...TYPES];

  async function handleSave(fields) {
    setSaveBusy(true);
    try {
      if (modal?.id) {
        await updateRoom(modal.id, fields);
        notify(`Room "${fields.name}" updated.`, 'success');
      } else {
        await createRoom(fields);
        notify(`Room "${fields.name}" created.`, 'success');
      }
      setModal(null);
      refetch();
    } catch (e) { notify(e.message || 'Failed to save room', 'error'); }
    finally { setSaveBusy(false); }
  }

  async function handleDelete(r) {
    if (!window.confirm(`Delete room "${r.name}"? This cannot be undone.`)) return;
    try { await deleteRoom(r.id); notify(`Room "${r.name}" deleted.`, 'info'); refetch(); }
    catch (e) { notify(e.message || 'Delete failed', 'error'); }
  }

  const counts = { total: meta.total ?? 0, active: rooms.filter(r=>r.is_active).length, inactive: rooms.filter(r=>!r.is_active).length };

  return (
    <AdminShell>
      <div className="ap-hdr">
        <div><h1>Rooms</h1><p className="ap-sub">Manage classrooms, labs, and seminar halls</p></div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={refetch}><RefreshCw size={13}/> Refresh</button>
          <button className="ap-btn ap-btn-primary" onClick={() => setModal('create')}><Plus size={15}/> Add Room</button>
        </div>
      </div>

      <div className="ap-g4" style={{ marginBottom:18 }}>
        {[
          { label:'Total Rooms', val:meta.total??0, color:'#818cf8', bg:'rgba(99,102,241,.15)' },
          { label:'Active',      val:rooms.filter(r=>r.is_active).length,  color:'#34d399', bg:'rgba(52,211,153,.15)' },
          { label:'Inactive',    val:rooms.filter(r=>!r.is_active).length, color:'#f87171', bg:'rgba(248,113,113,.15)' },
          { label:'Types',       val:TYPES.length, color:'#fbbf24', bg:'rgba(251,191,36,.15)' },
        ].map(c => (
          <div key={c.label} className="ap-card" style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:c.bg, display:'grid', placeItems:'center', fontSize:'1.1rem', fontWeight:800, color:c.color }}>{c.val}</div>
            <span style={{ fontSize:'.84rem', color:'#7880a8' }}>{c.label}</span>
          </div>
        ))}
      </div>

      <div className="ap-card">
        <div className="ap-bar">
          <div className="ap-search">
            <Search size={14} color="#7880a8"/>
            <input placeholder="Search rooms by name or code…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
          </div>
          <select className="ap-select" value={typeF} onChange={e=>{setTypeF(e.target.value);setPage(1);}}>
            {allTypes.map(t => <option key={t} value={t}>{t==='all'?'All Types':t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </select>
          <span style={{ fontSize:'.82rem', color:'#7880a8', marginLeft:'auto' }}>{meta.total ?? 0} rooms</span>
        </div>

        {loading ? <LoadingSpinner message="Loading rooms…"/>
        : error   ? <ErrorState error={error} onRetry={refetch}/>
        : rooms.length === 0 ? <EmptyState icon="🚪" title="No rooms found" description="Add a room or change the filter."/>
        : (
          <>
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr><th>Code</th><th>Name</th><th>Type</th><th>Building</th><th>Capacity</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {rooms.map(r => (
                    <tr key={r.id}>
                      <td><span className="ap-badge ap-badge-blue">{r.room_code}</span></td>
                      <td style={{ color:'#eceefb', fontWeight:500 }}>{r.name}</td>
                      <td style={{ color:'#7880a8' }}>{r.type}</td>
                      <td style={{ color:'#7880a8' }}>{r.building}</td>
                      <td style={{ color:'#c5caf0' }}>{r.capacity}</td>
                      <td><span className={`ap-badge ${r.is_active?'ap-badge-green':'ap-badge-red'}`}>{r.is_active?'Active':'Inactive'}</span></td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={() => setModal(r)}><Edit3 size={13}/> Edit</button>
                          <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={() => handleDelete(r)}><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="ap-pages">
              <span className="ap-page-info">Showing {rooms.length} of {meta.total ?? rooms.length}</span>
              {Array.from({length: meta.totalPages??1}, (_,i)=>i+1).map(p => (
                <button key={p} className={`ap-page ${p===page?'ap-page-active':''}`} onClick={()=>setPage(p)}>{p}</button>
              ))}
            </div>
          </>
        )}
      </div>

      {(modal === 'create' || (modal && modal.id)) && (
        <RoomModal
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          busy={saveBusy}
        />
      )}
    </AdminShell>
  );
}
