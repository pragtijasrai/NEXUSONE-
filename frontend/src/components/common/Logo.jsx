import { Link } from 'react-router-dom';

export function LogoMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect width="34" height="34" rx="10" fill="url(#lg)" />
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4338ca" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <path d="M10 24l7-14 7 14" stroke="#22d3ee" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="10" y1="24" x2="24" y2="24" stroke="#22d3ee" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="10" cy="24" r="2.5" fill="#22d3ee" />
      <circle cx="17" cy="10" r="2.5" fill="#a78bfa" />
      <circle cx="24" cy="24" r="2.5" fill="#22d3ee" />
    </svg>
  );
}

export default function Logo({ to = '/', showTagline = false, size }) {
  return (
    <Link to={to} className="logo" aria-label="NexusOne home">
      <LogoMark size={size} />
      <span className="logo__text">
        <strong>NexusOne</strong>
        {showTagline && <small>Connecting Every Corner of Campus</small>}
      </span>
    </Link>
  );
}
