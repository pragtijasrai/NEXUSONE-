import { useAuth } from '../../context/AuthContext.jsx';
import { Wrench, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const tickets = [
  { id: 'T-001', location: 'CS-204', issue: 'Projector not working',   priority: 'High',   status: 'open',       reported: '2 hours ago' },
  { id: 'T-002', location: 'B-101',  issue: 'AC unit making noise',    priority: 'Medium', status: 'in-progress',reported: '5 hours ago' },
  { id: 'T-003', location: 'D-202',  issue: 'Light flickering',        priority: 'Low',    status: 'in-progress',reported: 'Yesterday'   },
  { id: 'T-004', location: 'Cafeteria','issue': 'Water tap leaking',   priority: 'High',   status: 'open',       reported: '1 hour ago'  },
  { id: 'T-005', location: 'Library', issue: 'WiFi access point down', priority: 'High',   status: 'resolved',   reported: 'Yesterday'   },
];

const pMap = { High: 'badge--urgent', Medium: 'badge--warn', Low: 'badge--next' };
const sMap = { open: 'badge--urgent', 'in-progress': 'badge--live', resolved: 'badge--done' };

export default function MaintenanceDashboard() {
  const { user } = useAuth();
  const open     = tickets.filter(t => t.status === 'open').length;
  const inProg   = tickets.filter(t => t.status === 'in-progress').length;
  const resolved = tickets.filter(t => t.status === 'resolved').length;

  return (
    <div className="stack">
      <header>
        <h1>Welcome, {user.name.split(' ')[0]}! 🔧</h1>
        <p className="muted">Your maintenance ticket queue for today.</p>
      </header>

      <div className="grid grid--3">
        {[
          { icon: AlertTriangle, label: 'Open Tickets',       value: open,     color: '#dc2626', bg: 'rgba(220,38,38,.1)'  },
          { icon: Clock,         label: 'In Progress',         value: inProg,   color: '#d97706', bg: 'rgba(217,119,6,.1)'  },
          { icon: CheckCircle,   label: 'Resolved Today',      value: resolved, color: '#059669', bg: 'rgba(5,150,105,.1)'  },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="stat">
              <span className="stat__icon" style={{ background: s.bg, color: s.color }}>
                <s.icon size={20} />
              </span>
              <div>
                <p className="muted small" style={{ margin: '0 0 2px' }}>{s.label}</p>
                <p className="stat__value">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="card" aria-labelledby="tq">
        <h2 id="tq">Ticket Queue</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Location</th><th>Issue</th><th>Priority</th><th>Status</th><th>Reported</th></tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id}>
                  <td><strong style={{ fontSize:'.85rem' }}>{t.id}</strong></td>
                  <td>{t.location}</td>
                  <td style={{ fontSize:'.88rem' }}>{t.issue}</td>
                  <td><span className={`badge ${pMap[t.priority]}`}>{t.priority}</span></td>
                  <td><span className={`badge ${sMap[t.status]}`}>{t.status}</span></td>
                  <td className="muted small">{t.reported}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
