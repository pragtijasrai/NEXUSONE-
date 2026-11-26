import { useState } from 'react';
import { Search, Users } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/common/ApiStates.jsx';
import * as room from '../../services/roomService.js';

export default function RoomBooking() {
  const { notify } = useToast();
  const [search, setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [bookingRoom, setBookingRoom] = useState(null);
  const [busy, setBusy]         = useState(false);
  const [form, setForm]         = useState({ date: '', slot: '09:00 – 11:00', purpose: 'Study session' });

  const { data: roomData, loading, error, refetch } = useApi(room.getRooms);
  const { data: bookingData, refetch: refetchBookings } = useApi(room.getMyBookings);

  const rooms    = roomData?.rows ?? [];
  const bookings = bookingData?.rows ?? [];
  const types    = ['All', ...new Set(rooms.map(r => r.type))];

  const filtered = rooms.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                        r.building.toLowerCase().includes(search.toLowerCase()) ||
                        r.room_code?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const slotToTimes = (slot) => {
    const [s, e] = slot.split(' – ');
    const toISO = (t) => { const [h, m] = t.split(':'); return `${form.date}T${h.padStart(2,'0')}:${m}:00`; };
    return { start_time: toISO(s), end_time: toISO(e) };
  };

  const handleBook = (r) => {
    if (!r.is_active) { notify(`${r.room_code} is inactive.`, 'info'); return; }
    setBookingRoom(r);
    setForm({ date: new Date().toISOString().slice(0,10), slot:'09:00 – 11:00', purpose:'Study session' });
  };

  const confirmBooking = async () => {
    if (!form.date) { notify('Please select a date.', 'error'); return; }
    setBusy(true);
    try {
      const { start_time, end_time } = slotToTimes(form.slot);
      await room.createBooking({ room_id: bookingRoom.id, start_time, end_time, purpose: form.purpose });
      notify(`Room ${bookingRoom.room_code} booked! 🎉`, 'success');
      setBookingRoom(null);
      refetchBookings();
    } catch (e) {
      notify(e.message || 'Booking failed', 'error');
    } finally { setBusy(false); }
  };

  const cancelBooking = async (id) => {
    try {
      await room.cancelBooking(id);
      notify('Booking cancelled.', 'info');
      refetchBookings();
    } catch (e) { notify(e.message || 'Could not cancel booking', 'error'); }
  };

  if (loading) return <LoadingSpinner message="Loading rooms…" />;
  if (error)   return <ErrorState error={error} onRetry={refetch} />;

  const typeColors = { seminar:'#4338ca', lab:'#0ea5e9', lecture:'#7c3aed', study:'#10b981', conference:'#f59e0b', other:'#6b7280' };

  return (
    <div className="stack">
      <header>
        <h1>Find &amp; Book a Room</h1>
        <p className="muted">Search available rooms, check amenities, and confirm your booking instantly.</p>
      </header>

      {/* Search & filter */}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
        <label className="search" style={{ flex:1, minWidth:240 }}>
          <Search size={16}/>
          <input type="search" placeholder="Search rooms…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </label>
        <div style={{ display:'flex', gap:6 }}>
          {types.map(t => (
            <button key={t} className={`btn btn--sm ${typeFilter===t?'btn--primary':'btn--ghost'}`} onClick={()=>setTypeFilter(t)}>{t}</button>
          ))}
        </div>
      </div>

      {/* Room grid */}
      {filtered.length === 0
        ? <EmptyState icon="🚪" title="No rooms found" description="Try a different search or filter." />
        : <div className="grid grid--4" style={{ alignItems:'start' }}>
          {filtered.map(r => {
            const color = typeColors[r.type] ?? '#4338ca';
            return (
              <div key={r.id} className="card card--hover" style={{ padding:18 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div>
                    <span className="badge badge--next" style={{ color, background:`${color}14`, marginBottom:6, display:'inline-block' }}>{r.type}</span>
                    <h3 style={{ margin:0, fontSize:'.9rem' }}>{r.name}</h3>
                    <p className="muted small" style={{ margin:'2px 0 0' }}>{r.building} · {r.room_code}</p>
                  </div>
                  <span className={`badge badge--${r.is_active ? 'done' : 'urgent'}`}>{r.is_active ? 'Available' : 'Inactive'}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
                  <Users size={13} style={{ color:'var(--muted)' }}/>
                  <span style={{ fontSize:'.8rem', color:'var(--muted)' }}>Up to {r.capacity} people</span>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:14 }}>
                  {(r.amenities ?? []).map(a=>(
                    <span key={a} style={{ fontSize:'.7rem', background:'var(--bg2)', color:'var(--text2)', padding:'2px 8px', borderRadius:99, border:'1px solid var(--border)' }}>{a}</span>
                  ))}
                </div>
                <button className={`btn btn--block btn--sm ${r.is_active?'btn--primary':'btn--ghost'}`} onClick={()=>handleBook(r)} disabled={!r.is_active}>
                  {r.is_active ? 'Book Now' : 'Inactive'}
                </button>
              </div>
            );
          })}
        </div>
      }

      {/* My bookings */}
      {bookings.length > 0 && (
        <section className="card" aria-labelledby="mb">
          <h2 id="mb">My Bookings</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Room</th><th>Start</th><th>End</th><th>Purpose</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td><strong>{b.room_name ?? b.room_code}</strong></td>
                    <td>{new Date(b.start_time).toLocaleString([], { dateStyle:'short', timeStyle:'short' })}</td>
                    <td>{new Date(b.end_time).toLocaleTimeString([], { timeStyle:'short' })}</td>
                    <td>{b.purpose}</td>
                    <td><span className={`badge badge--${b.status==='confirmed'?'done':b.status==='cancelled'?'urgent':'warn'}`}>{b.status}</span></td>
                    <td>
                      {b.status !== 'cancelled' && (
                        <button className="btn btn--ghost btn--sm" onClick={()=>cancelBooking(b.id)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Booking modal */}
      {bookingRoom && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:50, display:'grid', placeItems:'center', padding:16 }}>
          <div className="card" style={{ width:'min(480px,100%)', position:'relative' }}>
            <button className="icon-btn" style={{ position:'absolute', top:12, right:12 }} onClick={()=>setBookingRoom(null)}>✕</button>
            <h2 style={{ marginBottom:4 }}>Book {bookingRoom.room_code}</h2>
            <p className="muted" style={{ marginBottom:20 }}>{bookingRoom.name} · {bookingRoom.building}</p>
            <label className="field">Date
              <input type="date" value={form.date} min={new Date().toISOString().slice(0,10)}
                onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
            </label>
            <label className="field">Time slot
              <select value={form.slot} onChange={e=>setForm(f=>({...f,slot:e.target.value}))}>
                {['09:00 – 11:00','10:00 – 12:00','13:00 – 15:00','14:00 – 16:00','16:00 – 18:00'].map(s=><option key={s}>{s}</option>)}
              </select>
            </label>
            <label className="field">Purpose
              <input type="text" value={form.purpose} onChange={e=>setForm(f=>({...f,purpose:e.target.value}))}/>
            </label>
            <div style={{ display:'flex', gap:10, marginTop:8 }}>
              <button className="btn btn--ghost btn--block" onClick={()=>setBookingRoom(null)}>Cancel</button>
              <button className="btn btn--primary btn--block" onClick={confirmBooking} disabled={busy}>
                {busy ? 'Booking…' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
