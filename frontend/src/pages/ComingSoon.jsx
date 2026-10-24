import { Link, useLocation } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

export default function ComingSoon() {
  const location = useLocation();
  // Guess back link from path
  const parts = location.pathname.split('/').filter(Boolean);
  const backTo = parts.length >= 2 ? `/${parts[0]}/dashboard` : '/';

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh', textAlign: 'center', gap: 16 }}>
      <div>
        <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🚧</div>
        <h1 style={{ marginBottom: 8 }}>Coming Soon</h1>
        <p className="muted" style={{ maxWidth: '40ch', margin: '0 auto 24px' }}>
          This module is being built. Check back in the next phase!
        </p>
        <Link className="btn btn--primary" to={backTo}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
