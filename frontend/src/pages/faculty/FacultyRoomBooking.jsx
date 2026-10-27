/**
 * FacultyRoomBooking — /faculty/rooms
 * Book rooms with date, time slot, and purpose.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, DoorOpen, Users, MapPin, CheckCircle2, Plus, X, Calendar, Clock, FileText } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';

const css = `
  .frb { background:#0d1117; min-height:100vh; color:#c5caf0; font-family:inherit; padding:28px 32px; }
  .frb h1 { font-size:1.4rem; font-weight:700; color:#eceefb; margin:0 0 4px; }
  .frb-sub { font-size:.88rem; color:#7880a8; margin:0 0 24px; }
  .frb-back { display:inline-flex; align-items:center; gap:6px; color:#7880a8; font-size:.83rem; text-decoration:none; margin-bottom:16px; transition:color .15s; }
  .frb-back:hover { color:#818cf8; }
  .frb-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
  .frb-card { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:20px; display:flex; flex-direction:column; gap:12px; transition:border-color .18s,transform .18s; }
  .frb-card:hover { border-color:rgba(99,102,241,.3); transform:translateY(-2px); }
  .frb-card--booked { border-color:rgba(52,211,153,.25); }
  .frb-name { font-size:1rem; font-weight:700; color:#eceefb; }
  .frb-type { font-size:.72rem; font-weight:700; padding:3px 9px; border-radius:6px; background:rgba(99,102,241,.15); color:#818cf8; display:inline-block; }
  .frb-meta { display:grid; gap:7px; }
  .frb-meta-row { display:flex; align-items:center; gap:8px; font-size:.8rem; color:#7880a8; }
  .frb-avail { font-size:.72rem; font-weight:700; padding:3px 9px; border-radius:6px; white-space:nowrap; }
  .frb-avail--yes    { background:rgba(52,211,153,.13); color:#34d399; }
  .frb-avail--no     { background:rgba(248,113,113,.13); color:#f87171; }
  .frb-avail--booked { background:rgba(52,211,153,.2);  color:#34d399; }
  .frb-book-btn { width:100%; padding:10px; border-radius:10px; border:0; font:inherit; font-size:.88rem; font-weight:700; cursor:pointer; transition:all .18s; background:linear-gradient(135deg,#4338ca,#6366f1); color:#fff; display:flex; align-items:center; justify-content:center; gap:7px; }
  .frb-book-btn:hover { filter:brightness(1.1); }
  .frb-book-btn:disabled { opacity:.5; cursor:not-allowed; filter:none; }
  .frb-booked-info { background:rgba(52,211,153,.07); border:1px solid rgba(52,211,153,.2); border-radius:8px; padding:8px 12px; font-size:.76rem; color:#34d399; }
  .frb-cancel-btn { width:100%; padding:8px; border-radius:9px; border:1px solid rgba(248,113,113,.3); background:rgba(248,113,113,.08); color:#f87171; font:inherit; font-size:.82rem; font-weight:600; cursor:pointer; transition:all .15s; }
  .frb-cancel-btn:hover { background:rgba(248,113,113,.16); }

  /* Modal */
  .frb-modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.72); z-index:9999; backdrop-filter:blur(4px); display:grid; place-items:center; padding:16px; }
  .frb-modal { background:#131628; border:1px solid rgba(255,255,255,.1); border-radius:16px; padding:26px; width:min(480px,100%); animation:frbIn .2s cubic-bezier(.34,1.1,.64,1); }
  @keyframes frbIn { from{opacity:0;transform:scale(.95) translateY(10px);} }
  .frb-modal h3 { font-size:1.05rem; font-weight:700; color:#eceefb; margin:0 0 18px; display:flex; align-items:center; gap:9px; }
  .frb-field { margin-bottom:14px; }
  .frb-field label { display:block; font-size:.75rem; font-weight:600; color:#7880a8; text-transform:uppercase; letter-spacing:.05em; margin-bottom:5px; }
  .frb-field input, .frb-field select, .frb-field textarea {
    width:100%; padding:10px 13px; border-radius:9px; box-sizing:border-box;
    background:#0d1117; border:1.5px solid rgba(255,255,255,.1);
    color:#eceefb; font:inherit; font-size:.88rem; transition:border-color .18s;
  }
  .frb-field select { appearance:none; cursor:pointer; }
  .frb-field input:focus, .frb-field select:focus, .frb-field textarea:focus { outline:none; border-color:#4338ca; }
  .frb-field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .frb-modal-footer { display:flex; gap:10px; justify-content:flex-end; margin-top:8px; }
  .frb-btn-ghost { display:inline-flex; align-items:center; gap:7px; padding:9px 18px; border-radius:9px; background:rgba(255,255,255,.06); color:#c5caf0; border:1px solid rgba(255,255,255,.1); font:inherit; font-size:.86rem; font-weight:600; cursor:pointer; }
  .frb-btn-ghost:hover { background:rgba(255,255,255,.1); }
  .frb-btn-primary { display:inline-flex; align-items:center; gap:7px; padding:9px 18px; border-radius:9px; background:linear-gradient(135deg,#4338ca,#6366f1); color:#fff; border:0; font:inherit; font-size:.86rem; font-weight:600; cursor:pointer; transition:all .18s; }
  .frb-btn-primary:hover { filter:brightness(1.1); }
  .frb-btn-primary:disabled { opacity:.45; cursor:not-allowed; }

  @media(max-width:480px){.frb{padding:16px;}.frb-grid{grid-template-columns:1fr;}.frb-field-row{grid-template-columns:1fr;}}
`;

const TIME_SLOTS = ['08:00–09:30','09:00–10:30','10:00–11:30','11:00–12:30','12:00–13:30','13:00–14:30','14:00–15:30','15:00–16:30','16:00–17:30','17:00–18:30'];
const PURPOSES  = ['Lecture','Lab Session','Seminar','Meeting','Workshop','Exam','Office Hours','Other'];

const ROOMS = [
  { id:'r1', name:'CS Seminar Hall',    type:'Seminar',    capacity:60,  location:'CS Block, Floor 2',  available:true  },
  { id:'r2', name:'Innovation Lab',     type:'Lab',        capacity:30,  location:'Innovation Hub',     available:true  },
  { id:'r3', name:'Conference Room A',  type:'Conference', capacity:20,  location:'Admin Block',        available:false },
  { id:'r4', name:'Lecture Hall 101',   type:'Lecture',    capacity:120, location:'Main Academic Block', available:true  },
  { id:'r5', name:'Faculty Lounge',     type:'Meeting',    capacity:10,  location:'Faculty Building',   available:true  },
  { id:'r6', name:'CS Lab B',           type:'Lab',        capacity:40,  location:'CS Block, Floor 1',  available:false },
];

function BookingModal({ room, onClose, onConfirm }) {
  const [form, setForm] = useState({ date:'', slot: TIME_SLOTS[0], purpose: PURPOSES[0], notes:'' });
  const set  = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.date;

  return (
    <div className="frb-modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="frb-modal" role="dialog" aria-modal="true">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <h3 style={{ margin:0 }}><DoorOpen size={17} color="#818cf8" /> Book {room.name}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#7880a8', cursor:'pointer' }}><X size={18} /></button>
        </div>

        <div style={{ background:'#0d1117', borderRadius:9, padding:'10px 14px', marginBottom:16, fontSize:'.82rem', color:'#7880a8' }}>
          <div style={{ display:'flex', gap:16 }}>
            <span><Users size={12} style={{ display:'inline', marginRight:4 }} />{room.capacity} capacity</span>
            <span><MapPin size={12} style={{ display:'inline', marginRight:4 }} />{room.location}</span>
            <span style={{ color:'#818cf8', fontWeight:600 }}>{room.type}</span>
          </div>
        </div>

        <div className="frb-field">
          <label>Date *</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required min={new Date().toISOString().split('T')[0]} />
        </div>

        <div className="frb-field-row">
          <div className="frb-field">
            <label>Time Slot *</label>
            <select value={form.slot} onChange={e => set('slot', e.target.value)}>
              {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="frb-field">
            <label>Purpose *</label>
            <select value={form.purpose} onChange={e => set('purpose', e.target.value)}>
              {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="frb-field">
          <label>Notes (optional)</label>
          <input type="text" placeholder="Any special requirements…" value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        <div className="frb-modal-footer">
          <button className="frb-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="frb-btn-primary" disabled={!valid} onClick={() => onConfirm({ ...form, roomId: room.id })}>
            <CheckCircle2 size={14} /> Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FacultyRoomBooking() {
  const { notify } = useToast();
  const [bookings,    setBookings]    = useState({});   // roomId → booking details
  const [modalRoom,   setModalRoom]   = useState(null);

  function handleConfirm(details) {
    setBookings(prev => ({ ...prev, [details.roomId]: details }));
    setModalRoom(null);
    notify(`${ROOMS.find(r=>r.id===details.roomId)?.name} booked for ${details.date} · ${details.slot}`, 'success');
  }

  function cancelBooking(roomId) {
    setBookings(prev => { const n = { ...prev }; delete n[roomId]; return n; });
    notify('Booking cancelled.', 'info');
  }

  return (
    <>
      <style>{css}</style>
      <div className="frb">
        <Link to="/faculty/dashboard" className="frb-back"><ChevronLeft size={15} /> Back to Dashboard</Link>
        <h1>Room Booking</h1>
        <p className="frb-sub">Book rooms for classes, seminars, or meetings</p>

        <div className="frb-grid">
          {ROOMS.map(r => {
            const booking   = bookings[r.id];
            const isBooked  = !!booking;
            const canBook   = r.available && !isBooked;
            return (
              <div key={r.id} className={`frb-card${isBooked?' frb-card--booked':''}`}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <p className="frb-name">{r.name}</p>
                    <span className="frb-type">{r.type}</span>
                  </div>
                  <span className={`frb-avail frb-avail--${isBooked?'booked':r.available?'yes':'no'}`}>
                    {isBooked ? 'Booked' : r.available ? 'Available' : 'Occupied'}
                  </span>
                </div>

                <div className="frb-meta">
                  <div className="frb-meta-row"><Users size={13} /> Capacity: {r.capacity}</div>
                  <div className="frb-meta-row"><MapPin size={13} /> {r.location}</div>
                </div>

                {isBooked && (
                  <div className="frb-booked-info">
                    <Calendar size={11} style={{ display:'inline', marginRight:4 }} />{booking.date}
                    <span style={{ margin:'0 6px' }}>·</span>
                    <Clock size={11} style={{ display:'inline', marginRight:4 }} />{booking.slot}
                    <span style={{ margin:'0 6px' }}>·</span>
                    {booking.purpose}
                  </div>
                )}

                {canBook ? (
                  <button className="frb-book-btn" onClick={() => setModalRoom(r)}>
                    <DoorOpen size={15} /> Book Now
                  </button>
                ) : isBooked ? (
                  <button className="frb-cancel-btn" onClick={() => cancelBooking(r.id)}>
                    Cancel Booking
                  </button>
                ) : (
                  <button className="frb-book-btn" disabled>
                    <X size={14} /> Occupied
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {modalRoom && (
          <BookingModal
            room={modalRoom}
            onClose={() => setModalRoom(null)}
            onConfirm={handleConfirm}
          />
        )}
      </div>
    </>
  );
}
