/**
 * ResetPassword — /reset-password?token=...
 * Reads the token from query string, calls POST /auth/reset-password.
 */
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import { api } from '../../services/apiClient.js';

function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/\d/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  if (pw.length >= 12) s++;
  return s;
}

const BARS = ['', 'var(--danger)', 'var(--warn)', 'var(--ok)', 'var(--ok)'];
const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

export default function ResetPassword() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const token      = params.get('token') || '';

  const [pw,     setPw]     = useState('');
  const [confirm,setConfirm]= useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy,   setBusy]   = useState(false);
  const [done,   setDone]   = useState(false);
  const [error,  setError]  = useState('');
  const [errs,   setErrs]   = useState({});

  const s = strength(pw);

  async function submit(e) {
    e.preventDefault();
    const err = {};
    if (!token) err.general = 'Missing reset token. Please use the link from your email.';
    if (pw.length < 8) err.pw = 'Password must be at least 8 characters.';
    if (pw !== confirm) err.confirm = 'Passwords do not match.';
    setErrs(err);
    if (Object.keys(err).length) return;

    setBusy(true);
    setError('');
    try {
      await api('/auth/reset-password', { method: 'POST', body: { token, password: pw }, skipAuth: true });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (e) {
      setError(e.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setBusy(false);
    }
  }

  if (!token) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', padding: 20 }}>
      <div className="card" style={{ width: 'min(440px,100%)', padding: 36, textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</div>
        <h2 style={{ marginBottom: 8 }}>Invalid reset link</h2>
        <p className="muted" style={{ marginBottom: 20 }}>The reset link is missing or malformed. Please request a new one.</p>
        <Link to="/forgot-password" className="btn btn--primary">Request new link</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', padding: 20 }}>
      <div className="card" style={{ width: 'min(440px,100%)', padding: 36 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#4338ca,#22d3ee)', display: 'grid', placeItems: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '.9rem' }}>N</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>NexusOne</span>
        </div>

        {!done ? (
          <>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 6px' }}>Create new password</h1>
            <p className="muted" style={{ marginBottom: 24 }}>Choose a strong password for your account.</p>

            {errs.general && <div className="field__error" style={{ marginBottom: 14 }} role="alert">{errs.general}</div>}
            {error && <div className="field__error" style={{ marginBottom: 14 }} role="alert">{error}</div>}

            <form onSubmit={submit} noValidate>
              <label className="field">
                New password
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={pw}
                    onChange={e => { setPw(e.target.value); setErrs(x => ({ ...x, pw: '' })); }}
                    placeholder="At least 8 characters"
                    style={{ paddingRight: 42, borderColor: errs.pw ? 'var(--danger)' : undefined }}
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Strength bars */}
                {pw && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= s ? BARS[s] : 'var(--border)', transition: 'background .2s' }} />
                    ))}
                    <span style={{ fontSize: '.72rem', color: BARS[s], marginLeft: 6, lineHeight: 1.2, alignSelf: 'center' }}>{LABELS[s]}</span>
                  </div>
                )}
                {errs.pw && <span className="field__error" role="alert">{errs.pw}</span>}
              </label>

              <label className="field">
                Confirm password
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setErrs(x => ({ ...x, confirm: '' })); }}
                  placeholder="Re-enter new password"
                  style={{ borderColor: errs.confirm ? 'var(--danger)' : (confirm && confirm === pw ? 'var(--ok)' : undefined) }}
                />
                {errs.confirm && <span className="field__error" role="alert">{errs.confirm}</span>}
                {confirm && confirm === pw && !errs.confirm && (
                  <span style={{ fontSize: '.74rem', color: 'var(--ok)', marginTop: 4, display: 'block' }}>✓ Passwords match</span>
                )}
              </label>

              <button className="btn btn--primary" type="submit" disabled={busy || !pw || !confirm} style={{ width: '100%', marginTop: 8 }}>
                <KeyRound size={16} /> {busy ? 'Resetting…' : 'Reset password'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={48} color="var(--ok)" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: '1.2rem', margin: '0 0 10px' }}>Password reset!</h2>
            <p className="muted" style={{ marginBottom: 20 }}>
              Your password has been updated. Redirecting to login in a moment…
            </p>
            <Link to="/login" className="btn btn--primary">Go to login →</Link>
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link to="/login" style={{ color: 'var(--muted)', fontSize: '.86rem', display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
