/**
 * ForgotPassword — /forgot-password
 * Calls POST /auth/forgot-password, shows confirmation.
 * In dev mode (no SMTP) the backend returns devToken for testing.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/apiClient.js';

export default function ForgotPassword() {
  const [email, setEmail]   = useState('');
  const [busy,  setBusy]    = useState(false);
  const [sent,  setSent]    = useState(false);
  const [devUrl, setDevUrl] = useState(null);
  const [error, setError]   = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError('');
    try {
      const res = await api('/auth/forgot-password', { method: 'POST', body: { email: email.trim().toLowerCase() }, skipAuth: true });
      setSent(true);
      /* Dev mode: backend returns the reset URL so we can test without email */
      if (res.data?.devResetUrl) setDevUrl(res.data.devResetUrl);
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', padding: 20 }}>
      <div className="card" style={{ width: 'min(440px, 100%)', padding: 36 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#4338ca,#22d3ee)', display: 'grid', placeItems: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '.9rem' }}>N</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)' }}>NexusOne</span>
        </div>

        {!sent ? (
          <>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 6px' }}>Forgot password?</h1>
            <p className="muted" style={{ marginBottom: 24 }}>Enter your @chitkara.edu.in email and we'll send a reset link.</p>

            <form onSubmit={submit} noValidate>
              <label className="field">
                University email
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@chitkara.edu.in"
                    style={{ paddingLeft: 40 }}
                    required
                    autoFocus
                  />
                </div>
                {error && <span className="field__error" role="alert">{error}</span>}
              </label>

              <button className="btn btn--primary" type="submit" disabled={busy || !email.trim()} style={{ width: '100%', marginTop: 8 }}>
                {busy ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={48} color="var(--ok)" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: '1.2rem', margin: '0 0 10px' }}>Check your email</h2>
            <p className="muted" style={{ marginBottom: 20 }}>
              If <strong>{email}</strong> is registered, a reset link has been sent. It expires in 30 minutes.
            </p>

            {/* Dev mode: show direct link when SMTP is not configured */}
            {devUrl && (
              <div style={{ background: 'var(--warn-bg)', border: '1px solid var(--warn)', borderRadius: 10, padding: 14, marginBottom: 20, textAlign: 'left' }}>
                <p style={{ fontSize: '.78rem', color: 'var(--warn)', fontWeight: 700, margin: '0 0 6px' }}>⚡ Dev mode — no SMTP configured</p>
                <p style={{ fontSize: '.78rem', color: 'var(--muted)', margin: 0, wordBreak: 'break-all' }}>
                  <Link to={devUrl.replace('http://localhost:5173', '')} style={{ color: 'var(--primary)' }}>Click here to reset password →</Link>
                </p>
              </div>
            )}
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
