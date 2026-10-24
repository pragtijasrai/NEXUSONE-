import { Link } from 'react-router-dom';
export function LogoMark({ size = 32 }) {
  return (<svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="var(--brand)" />
    <path d="M9 22l7-12 7 12M9 22h14" stroke="var(--accent)" strokeWidth="2" fill="none" />
    <g fill="var(--accent)"><circle cx="9" cy="22" r="3" /><circle cx="16" cy="10" r="3" /><circle cx="23" cy="22" r="3" /></g></svg>);
}
export default function Logo({ to = '/', showTagline = false }) {
  return (<Link to={to} className="logo" aria-label="NexusOne home"><LogoMark />
    <span className="logo__text"><strong>NexusOne</strong>{showTagline && <small>Connecting Every Corner of Campus.</small>}</span></Link>);
}
