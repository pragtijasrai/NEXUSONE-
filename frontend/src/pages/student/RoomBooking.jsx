import { useState } from 'react';
import { Search, Users, Monitor, Wifi, Wind, Printer, Mic, Filter } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { rooms, myBookings } from '../../data/mockRooms.js';

const amenityIcon = { 'Projector': Monitor, 'Computers': Monitor, 'AC': Wind, 'Whiteboard': null, 'Printer': Printer, 'Mic system': Mic, 'Video conf.': Monitor };
const typeColors = { Seminar:'#4338ca', Lab:'#0ea5e9', Lecture:'#7c3aed', 'Study':'#10b981', 'Conf.':'#f59e0b' };

export default function RoomBooking() {
  const { notify } = useToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [bookingRoom, setBookingRoom] = useState(null);
  const [bookings, setBookings] = useState(myBookings);

  const types = ['All', ...new Set(rooms.map(r => r.type))];
  const filtered = rooms.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.building.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleBook = (room) => {
    if (!room.available) { notify(`${room.id} is currently occupied. Next free at ${room.nextFree}.`, 'info'); return; }
    setBookingRoom(room);
  };

  const confirmBooking = (room) => {
    setBookings(prev => [...prev, { id: Date.now(), room: room.id, date: 'Oct 25, 2026', time: '10:00 – 12:00', purpose: 'Study session', status: 'confirmed' }]);
    setBookingRoom(null);
    notify(`Room ${room.id} booked successfully! 🎉`, 'success');
  };

  return (
    <div className="stack">
      <header>
        <h1>Find & Book a Room</h1>
        <p className="muted">Search available rooms, check amenities, and confirm your booking instantly.</p>
      </header>

      {/* Search & filter bar */}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
        <label className="search" style={{ flex:1, minWidth:240 }}>
          <Search size={16} aria-hidden="true" />
          <input type="search" placeholder="Search rooms…" value={search} onChange={e => setSearch(e.target.value)} />
        </label>
        <div style={{ display:'flex', gap:6 }}>
          {types.map(t => (
            <button key={t} className={`btn btn--sm ${typeFilter===t?'btn--primary':'btn--ghost'}`} onClick={() => setTypeFilter(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Room grid */}
      <div className="grid grid--4" style={{ alignItems:'start' }}>
        {filtered.map(room => (
          <div key={room.id} className="card card--hover" style={{ padding:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div>
                <span className="badge badge--next" style={{ color: typeColors[room.type], background:`${typeColors[room.type]}14`, marginBottom:6, display:'inline-block' }}>{room.type}</span>
                <h3 style={{ margin:0, fontSize:'.9rem' }}>{room.name}</h3>
                <p className="muted small" style={{ margin:'2px 0 0' }}>{room.building}</p>
              </div>
              <span className={`badge badge--${room.available?'done':'urgent'}`}>
                {room.available ? 'Available' : 'Occupied'}
              </span>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
              <Users size={13} style={{ color:'var(--muted)' }} />
              <span style={{ fontSize:'.8rem', color:'var(--muted)' }}>Up to {room.capacity} people</span>
            </div>

            <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:14 }}>
              {room.amenities.map(a => (
                <span key={a} style={{ fontSize:'.7rem', background:'var(--bg2)', color:'var(--text2)', padding:'2px 8px', borderRadius:99, border:'1px solid var(--border)' }}>{a}</span>
              ))}
            </div>

            {!room.available && (
              <p className="muted small" style={{ marginBottom:8 }}>Next free at {room.nextFree}</p>
            )}

            <button
              className={`btn btn--block btn--sm ${room.available?'btn--primary':'btn--ghost'}`}
              onClick={() => handleBook(room)}
              disabled={!room.available}
            >
              {room.available ? 'Book Now' : 'Unavailable'}
            </button>
          </div>
        ))}
      </div>

      {/* My bookings */}
      {bookings.length > 0 && (
        <section className="card" aria-labelledby="mb">
          <h2 id="mb">My Bookings</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Room</th><th>Date</th><th>Time</th><th>Purpose</th><th>Status</th></tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td><strong>{b.room}</strong></td>
                    <td>{b.date}</td>
                    <td>{b.time}</td>
                    <td>{b.purpose}</td>
                    <td><span className={`badge badge--${b.status==='confirmed'?'done':'warn'}`}>{b.status}</span></td>
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
            <button className="icon-btn" style={{ position:'absolute', top:12, right:12 }} onClick={() => setBookingRoom(null)} aria-label="Close">✕</button>
            <h2 style={{ marginBottom:4 }}>Book {bookingRoom.id}</h2>
            <p className="muted" style={{ marginBottom:20 }}>{bookingRoom.name} · {bookingRoom.building}</p>
            <label className="field">Date<input type="date" defaultValue="2026-10-25" /></label>
            <label className="field">Time slot
              <select>
                <option>09:00 – 11:00</option>
                <option>10:00 – 12:00</option>
                <option>14:00 – 16:00</option>
                <option>16:00 – 18:00</option>
              </select>
            </label>
            <label className="field">Purpose<input type="text" defaultValue="Study session" /></label>
            <div style={{ display:'flex', gap:10, marginTop:8 }}>
              <button className="btn btn--ghost btn--block" onClick={() => setBookingRoom(null)}>Cancel</button>
              <button className="btn btn--primary btn--block" onClick={() => confirmBooking(bookingRoom)}>Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
