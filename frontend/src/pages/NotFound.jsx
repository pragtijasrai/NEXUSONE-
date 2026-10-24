import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
      <div>
        <Logo />
        <div style={{ fontSize: '6rem', marginTop: 24, lineHeight: 1 }}>404</div>
        <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: '1.6rem' }}>Page Not Found</h1>
        <p className="muted" style={{ maxWidth: '40ch', margin: '0 auto 28px' }}>
          That address doesn't exist in NexusOne. Check the URL or head back to safety.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn--ghost" onClick={() => navigate(-1)}>← Go Back</button>
          <Link className="btn btn--primary" to="/">Go to Home</Link>
        </div>
      </div>
    </div>
  );
}
