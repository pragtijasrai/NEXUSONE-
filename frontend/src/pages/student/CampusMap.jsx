import { useState } from 'react';
import { Bus, MapPin, Clock, ArrowRight } from 'lucide-react';

const buildings = [
  { id: 'A', name: 'Block A – Lectures',  x: 180, y: 80,  color: '#4338ca', rooms: ['A-101','A-201','A-301'] },
  { id: 'B', name: 'Block B – Seminar',   x: 320, y: 80,  color: '#0ea5e9', rooms: ['B-101','B-205'] },
  { id: 'C', name: 'Block C – Computer',  x: 460, y: 80,  color: '#7c3aed', rooms: ['C-105','CS-204'] },
  { id: 'D', name: 'Block D – Study',     x: 180, y: 200, color: '#10b981', rooms: ['D-110','D-202'] },
  { id: 'E', name: 'Engineering',         x: 320, y: 200, color: '#f59e0b', rooms: ['ENG-203','ENG-301'] },
  { id: 'L', name: 'Library',             x: 460, y: 200, color: '#ec4899', rooms: [] },
  { id: 'C1','name': 'Cafeteria',         x: 180, y: 310, color: '#14b8a6', rooms: [] },
  { id: 'S', name: 'Sports Complex',      x: 320, y: 310, color: '#f43f5e', rooms: [] },
  { id: 'H', name: 'Innovation Hub',      x: 460, y: 310, color: '#8b5cf6', rooms: [] },
];

const shuttleRoutes = [
  { route: 'Route A', stops: ['Main Gate','Block A','Library','Cafeteria','Sports Complex','Main Gate'], next: '6 min', color: '#4338ca' },
  { route: 'Route B', stops: ['East Gate','Block C','Innovation Hub','Block D','East Gate'],            next: '14 min', color: '#0ea5e9' },
  { route: 'Route C', stops: ['West Gate','Engineering','Block B','Cafeteria','West Gate'],              next: 'Suspended', color: '#dc2626' },
];

export default function CampusMap() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="stack">
      <header>
        <h1>Campus Map & Transport</h1>
        <p className="muted">Interactive campus map and real-time shuttle tracking.</p>
      </header>

      <div className="grid grid--2" style={{ alignItems: 'start' }}>
        {/* SVG Map */}
        <section className="card" aria-labelledby="map-title" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
            <h2 id="map-title" style={{ margin:0 }}>Campus Map</h2>
          </div>
          <div style={{ padding:16 }}>
            <svg viewBox="0 0 640 420" style={{ width:'100%', background:'var(--bg2)', borderRadius:12 }}>
              {/* Roads */}
              <path d="M 0 145 H 640" stroke="var(--border)" strokeWidth="20" />
              <path d="M 0 260 H 640" stroke="var(--border)" strokeWidth="20" />
              <path d="M 130 0 V 420"  stroke="var(--border)" strokeWidth="20" />
              <path d="M 400 0 V 420"  stroke="var(--border)" strokeWidth="20" />

              {/* Path labels */}
              <text x="325" y="140" textAnchor="middle" fontSize="11" fill="var(--muted)" fontWeight="500">Campus Road A</text>
              <text x="325" y="258" textAnchor="middle" fontSize="11" fill="var(--muted)" fontWeight="500">Campus Road B</text>

              {/* Buildings */}
              {buildings.map(b => (
                <g key={b.id} style={{ cursor:'pointer' }} onClick={() => setSelected(b)}>
                  <rect
                    x={b.x - 44} y={b.y - 28} width={88} height={56}
                    rx={10}
                    fill={selected?.id === b.id ? b.color : `${b.color}22`}
                    stroke={b.color}
                    strokeWidth={selected?.id === b.id ? 2.5 : 1.5}
                  />
                  <text x={b.x} y={b.y - 6} textAnchor="middle" fontSize="13" fontWeight="700" fill={selected?.id===b.id?'#fff':b.color}>{b.id}</text>
                  <text x={b.x} y={b.y + 12} textAnchor="middle" fontSize="9" fill={selected?.id===b.id?'#ffffffcc':'var(--muted)'}>
                    {b.name.split(' – ')[1] || b.name.split(' ')[0]}
                  </text>
                </g>
              ))}

              {/* You are here */}
              <circle cx="320" cy="200" r="9" fill="#4338ca" opacity=".9">
                <animate attributeName="r" values="9;13;9" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values=".9;.5;.9" dur="2s" repeatCount="indefinite" />
              </circle>
              <text x="320" y="230" textAnchor="middle" fontSize="10" fill="#4338ca" fontWeight="700">You</text>
            </svg>
          </div>

          {selected && (
            <div style={{ padding:'0 20px 20px' }}>
              <div className="card" style={{ margin:0, padding:16, borderColor: selected.color }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <h3 style={{ margin:'0 0 4px', color: selected.color }}>{selected.name}</h3>
                    {selected.rooms.length > 0 && (
                      <p className="muted small" style={{ margin:0 }}>Rooms: {selected.rooms.join(', ')}</p>
                    )}
                  </div>
                  <button className="icon-btn" onClick={() => setSelected(null)} aria-label="Close">✕</button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Shuttle routes */}
        <section aria-labelledby="shuttle-title">
          <div className="section-header">
            <h2 id="shuttle-title">Shuttle Routes</h2>
            <span className="badge badge--live" style={{ display:'flex', alignItems:'center', gap:4 }}>
              <Bus size={11} /> Live tracking
            </span>
          </div>
          <div style={{ display:'grid', gap:12 }}>
            {shuttleRoutes.map(r => (
              <div key={r.route} className="card" style={{ padding:16, borderLeft: `4px solid ${r.color}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <h3 style={{ margin:0, color: r.color }}>{r.route}</h3>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <Clock size={13} style={{ color: r.next==='Suspended'?'var(--danger)':'var(--ok)' }} />
                    <span style={{ fontSize:'.82rem', fontWeight:600, color: r.next==='Suspended'?'var(--danger)':'var(--ok)' }}>
                      {r.next === 'Suspended' ? 'Suspended' : `Arrives in ${r.next}`}
                    </span>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:4 }}>
                  {r.stops.map((s, i) => (
                    <span key={i} style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <span style={{ fontSize:'.75rem', background:`${r.color}14`, color: r.color, padding:'2px 8px', borderRadius:99 }}>{s}</span>
                      {i < r.stops.length - 1 && <ArrowRight size={10} style={{ color:'var(--muted)' }} />}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginTop:12, background:'var(--grad-brand)', border:0, color:'#fff', padding:20 }}>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <div style={{ width:40, height:40, borderRadius:12, background:'rgba(255,255,255,.15)', display:'grid', placeItems:'center' }}>
                <Bus size={20} color="#fff" />
              </div>
              <div>
                <p style={{ margin:0, fontWeight:700 }}>Next arrival at your stop</p>
                <p style={{ margin:'2px 0 0', color:'#c7cbf0', fontSize:'.88rem' }}>Route A · Main Gate</p>
              </div>
              <div style={{ marginLeft:'auto', textAlign:'right' }}>
                <p style={{ margin:0, fontSize:'1.6rem', fontWeight:800 }}>6 min</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
