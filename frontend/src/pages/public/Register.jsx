import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, BookOpen, ArrowRight, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import Logo from '../../components/common/Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { roleHome } from '../../data/mockUsers.js';

const DOMAIN = 'chitkara.edu.in';

const ROLES = [
  { value: 'student', label: 'Student',  icon: GraduationCap, color: '#4338ca', grad: 'linear-gradient(135deg,#4338ca,#6366f1)', desc: 'Access classes, rooms, events & more' },
  { value: 'faculty', label: 'Faculty',  icon: BookOpen,      color: '#0ea5e9', grad: 'linear-gradient(135deg,#0ea5e9,#22d3ee)', desc: 'Manage classes, attendance & assignments' },
];

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'At least one number',   test: (p) => /\d/.test(p) },
  { label: 'At least one letter',   test: (p) => /[a-zA-Z]/.test(p) },
];

export default function Register() {
  const { user, signUp, loading } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '', role: 'student' });
  const [errors, setErrors] = useState({});
  const [show, setShow]     = useState({ password: false, confirm: false });
  const [busy, setBusy]     = useState(false);

  if (!loading && user) return <Navigate to={roleHome[user.role]} replace />;

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = 'Full name must be at least 2 characters.';

    const email = form.email.trim().toLowerCase();
    if (!email)
      e.email = 'Email is required.';
    else if (!email.endsWith(`@${DOMAIN}`))
      e.email = `Only @${DOMAIN} email addresses are allowed.`;

    if (!form.password)
      e.password = 'Password is required.';
    else if (form.password.length < 8)
      e.password = 'Password must be at least 8 characters.';

    if (form.password !== form.confirm)
      e.confirm = 'Passwords do not match.';

    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    const r = await signUp(form.name.trim(), form.email.trim().toLowerCase(), form.password, form.role);
    setBusy(false);

    if (r.ok) {
      notify(`Account created! Welcome to NexusOne, ${r.user.name}! 🎉`, 'success');
      navigate(roleHome[r.user.role]);
    } else {
      notify(r.error || 'Registration failed', 'error');
      if (r.error?.toLowerCase().includes('email')) {
        setErrors(e => ({ ...e, email: r.error }));
      }
    }
  };

  const pwRules = PASSWORD_RULES.map(r => ({ ...r, met: r.test(form.password) }));

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

      {/* ── LEFT: Form ── */}
      <div style={{ background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          <div style={{ marginBottom: 28 }}><Logo showTagline /></div>

          <h1 style={{ fontSize: '1.65rem', marginBottom: 4, fontWeight: 800 }}>Create Account</h1>
          <p className="muted" style={{ marginBottom: 24, fontSize: '.9rem' }}>
            Register with your official <strong>@{DOMAIN}</strong> email
          </p>

          {/* Role selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {ROLES.map(({ value, label, icon: Icon, color, grad, desc }) => {
              const active = form.role === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('role', value)}
                  style={{
                    padding: '14px 12px', borderRadius: 14, border: active ? `2px solid ${color}` : '2px solid var(--border)',
                    background: active ? `${color}10` : 'var(--bg)',
                    cursor: 'pointer', font: 'inherit', textAlign: 'left', transition: 'all 180ms',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: active ? grad : 'var(--surface)', border: active ? 'none' : `1.5px solid ${color}40`, display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'all 180ms' }}>
                      <Icon size={15} color={active ? '#fff' : color} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '.88rem', color: active ? color : 'var(--text)' }}>{label}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '.72rem', color: 'var(--muted)', lineHeight: 1.4 }}>{desc}</p>
                </button>
              );
            })}
          </div>

          <form onSubmit={submit} noValidate>
            {/* Name */}
            <label className="field">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={13} /> Full Name</span>
              <input
                type="text"
                value={form.name}
                aria-invalid={!!errors.name}
                placeholder="Dr. Priya Raman"
                autoComplete="name"
                onChange={e => set('name', e.target.value)}
              />
              {errors.name && <span className="field__error">{errors.name}</span>}
            </label>

            {/* Email */}
            <label className="field">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={13} /> University Email</span>
              <input
                type="email"
                value={form.email}
                aria-invalid={!!errors.email}
                placeholder={`yourname@${DOMAIN}`}
                autoComplete="email"
                onChange={e => set('email', e.target.value)}
              />
              {errors.email && <span className="field__error">{errors.email}</span>}
              {!errors.email && form.email && form.email.toLowerCase().endsWith(`@${DOMAIN}`) && (
                <span style={{ fontSize: '.76rem', color: 'var(--ok)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={12} /> Valid Chitkara University email
                </span>
              )}
            </label>

            {/* Password */}
            <label className="field">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Lock size={13} /> Password</span>
              <span className="field__pw">
                <input
                  type={show.password ? 'text' : 'password'}
                  value={form.password}
                  aria-invalid={!!errors.password}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  onChange={e => set('password', e.target.value)}
                />
                <button type="button" className="icon-btn" onClick={() => setShow(s => ({ ...s, password: !s.password }))} aria-label="Toggle password">
                  {show.password ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
              {errors.password && <span className="field__error">{errors.password}</span>}
              {/* Password rules */}
              {form.password && (
                <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                  {pwRules.map(r => (
                    <span key={r.label} style={{ fontSize: '.72rem', color: r.met ? 'var(--ok)' : 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <CheckCircle2 size={11} style={{ opacity: r.met ? 1 : 0.4 }} />
                      {r.label}
                    </span>
                  ))}
                </div>
              )}
            </label>

            {/* Confirm password */}
            <label className="field">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Lock size={13} /> Confirm Password</span>
              <span className="field__pw">
                <input
                  type={show.confirm ? 'text' : 'password'}
                  value={form.confirm}
                  aria-invalid={!!errors.confirm}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  onChange={e => set('confirm', e.target.value)}
                />
                <button type="button" className="icon-btn" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))} aria-label="Toggle confirm password">
                  {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
              {errors.confirm && <span className="field__error">{errors.confirm}</span>}
              {!errors.confirm && form.confirm && form.confirm === form.password && (
                <span style={{ fontSize: '.76rem', color: 'var(--ok)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={12} /> Passwords match
                </span>
              )}
            </label>

            <button
              type="submit"
              className="btn btn--primary btn--block"
              style={{ minHeight: 46, fontSize: '1rem', marginTop: 4 }}
              disabled={busy}
            >
              {busy ? 'Creating Account…' : 'Create Account'} {!busy && <ArrowRight size={16} />}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '.83rem', color: 'var(--muted)', margin: '18px 0 8px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
          <div style={{ textAlign: 'center' }}>
            <Link to="/" style={{ fontSize: '.8rem', color: 'var(--muted)', textDecoration: 'none' }}>← Back to home</Link>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Info panel ── */}
      <div style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e40af 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(99,102,241,.2)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(34,211,238,.15)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <Logo size={36} />

        <div style={{ marginTop: 40, marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(1.6rem,2.5vw,2.2rem)', color: '#fff', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2 }}>
            Join NexusOne at<br />Chitkara University
          </h2>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.95rem', lineHeight: 1.7, margin: 0 }}>
            One platform for your entire campus life — classes, rooms, events, announcements, and more.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ display: 'grid', gap: 16 }}>
          {[
            { emoji: '🏛️', title: 'Room Booking',      desc: 'Reserve labs, seminar halls & study rooms instantly' },
            { emoji: '📅', title: 'Class Schedule',    desc: 'See your timetable and mark attendance' },
            { emoji: '📢', title: 'Announcements',     desc: 'Stay updated with campus-wide notices' },
            { emoji: '🤖', title: 'AI Assistant',      desc: 'Get instant answers about campus services' },
          ].map(f => (
            <div key={f.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', display: 'grid', placeItems: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                {f.emoji}
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '.9rem', marginBottom: 2 }}>{f.title}</div>
                <div style={{ color: 'rgba(255,255,255,.6)', fontSize: '.8rem', lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, padding: '16px 20px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12 }}>
          <p style={{ margin: 0, fontSize: '.8rem', color: 'rgba(255,255,255,.7)', lineHeight: 1.6 }}>
            🔒 Registration is restricted to official <strong style={{ color: '#a5b4fc' }}>@{DOMAIN}</strong> email addresses. Your credentials are encrypted and never shared.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="background: linear-gradient(135deg,#1e1b4b"] { display: none !important; }
        }
      `}</style>
    </div>
  );
}
