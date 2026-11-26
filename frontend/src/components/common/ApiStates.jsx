/**
 * Shared loading, error, and empty-state UI components.
 * Used by every page that calls the real API.
 */

export function LoadingSpinner({ message = 'Loading…', size = 32 }) {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: 200, gap: 14, color: 'var(--muted)' }}>
      <div style={{
        width: size, height: size,
        border: '3px solid var(--border)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'nexus-spin 0.7s linear infinite',
      }} />
      <span style={{ fontSize: '.88rem' }}>{message}</span>
      <style>{`@keyframes nexus-spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}

export function ErrorState({ error, onRetry, message }) {
  const msg = message || error?.message || 'Something went wrong.';
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: 200, textAlign: 'center', gap: 12 }}>
      <div style={{ fontSize: '2rem' }}>⚠️</div>
      <p style={{ color: 'var(--danger)', margin: 0, fontSize: '.9rem' }}>{msg}</p>
      {onRetry && (
        <button className="btn btn--ghost btn--sm" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: 200, textAlign: 'center', gap: 10 }}>
      <div style={{ fontSize: '2.5rem' }}>{icon}</div>
      <h3 style={{ margin: 0, fontSize: '1rem' }}>{title}</h3>
      {description && <p className="muted" style={{ margin: 0, fontSize: '.88rem', maxWidth: '36ch' }}>{description}</p>}
      {action}
    </div>
  );
}
