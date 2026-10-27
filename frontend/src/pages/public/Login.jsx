import { useState, useEffect } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import {
  Eye, EyeOff, GraduationCap, BookOpen,
  ShieldCheck, Wrench, ArrowRight, ChevronLeft, ChevronRight,
  Mail, Lock,
} from 'lucide-react';
import Logo from '../../components/common/Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { roleHome, roleLabels } from '../../data/mockUsers.js';

const DOMAIN = 'chitkara.edu.in';

const slides = [
  {
    src: '/cu-campus.jpg',
    caption: 'Chitkara University — Main Campus, Rajpura',
    sub: 'A sprawling 70‑acre campus with world-class facilities',
  },
  {
    src: '/cu-turing.jpg',
    caption: 'Turing Block — Computer Science Hub',
    sub: "State-of-the-art labs powering tomorrow's innovators",
  },
];

const roleConfig = {
  student:     { icon: GraduationCap, color: '#4338ca', grad: 'linear-gradient(135deg,#4338ca,#6366f1)' },
  faculty:     { icon: BookOpen,      color: '#0ea5e9', grad: 'linear-gradient(135deg,#0ea5e9,#22d3ee)' },
  admin:       { icon: ShieldCheck,   color: '#7c3aed', grad: 'linear-gradient(135deg,#7c3aed,#a78bfa)' },
  maintenance: { icon: Wrench,        color: '#f59e0b', grad: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
};

export default function Login() {
  const { user, signInRemote, loading } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [slide, setSlide]       = useState(0);
  const [animating, setAnimating] = useState(false);
  const [activeRole, setActiveRole] = useState('student');
  const [form, setForm]         = useState({ email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [show, setShow]         = useState(false);
  const [busy, setBusy]         = useState(false);

  /* Auto-advance slideshow */
  useEffect(() => {
    const t = setInterval(() => changeSlide((s) => (s + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const changeSlide = (idx) => {
    if (animating) return;
    setAnimating(true);
    const next = typeof idx === 'function' ? idx(slide) : idx;
    setTimeout(() => { setSlide(next); setAnimating(false); }, 350);
  };

  if (!loading && user) return <Navigate to={roleHome[user.role]} replace />;

  const validate = () => {
    const e = {};
    const email = form.email.trim().toLowerCase();
    if (!email) {
      e.email = 'Email is required.';
    } else if (!email.endsWith(`@${DOMAIN}`)) {
      e.email = `Only @${DOMAIN} email addresses are allowed.`;
    }
    if (!form.password) e.password = 'Password is required.';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    const r = await signInRemote(form.email.trim().toLowerCase(), form.password);
    setBusy(false);

    if (r.ok) {
      notify(`Welcome back, ${r.user.name}! 👋`, 'success');
      navigate(roleHome[r.user.role]);
    } else {
      notify(r.error || 'Login failed', 'error');
      setErrors({ password: r.error || 'Invalid credentials' });
    }
  };

  const cfg = roleConfig[activeRole];

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

      {/* ── LEFT: Form ── */}
      <div style={{
        background: 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 48px', overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <div style={{ marginBottom: 32 }}><Logo showTagline /></div>

          <h1 style={{ fontSize: '1.75rem', marginBottom: 4, fontWeight: 800 }}>Welcome Back</h1>
          <p className="muted" style={{ marginBottom: 28, fontSize: '.9rem' }}>
            Sign in with your <strong>@{DOMAIN}</strong> account
          </p>

          <form onSubmit={submit} noValidate>
            {/* Email */}
            <label className="field">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={13} /> University Email</span>
              <input
                type="email"
                value={form.email}
                aria-invalid={!!errors.email}
                placeholder={`yourname@${DOMAIN}`}
                autoComplete="email"
                onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(x => ({ ...x, email: '' })); }}
              />
              {errors.email && <span className="field__error">{errors.email}</span>}
            </label>

            {/* Password */}
            <label className="field">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Lock size={13} /> Password</span>
              <span className="field__pw">
                <input
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  aria-invalid={!!errors.password}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(x => ({ ...x, password: '' })); }}
                />
                <button type="button" className="icon-btn" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
              {errors.password && <span className="field__error">{errors.password}</span>}
            </label>

            <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 20 }}>
              <span style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
                Forgot password? Contact your IT administrator.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--block"
              style={{ background: cfg.grad, border: 0, minHeight: 46, fontSize: '1rem' }}
              disabled={busy}
            >
              {busy ? 'Signing in…' : 'Sign In'} {!busy && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Divider */}
          <div style={{ position: 'relative', textAlign: 'center', margin: '22px 0' }}>
            <hr style={{ border: 0, borderTop: '1px solid var(--border)' }} />
            <span style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              background: 'var(--surface)', padding: '0 14px',
              fontSize: '.78rem', color: 'var(--muted)',
            }}>Select your role</span>
          </div>

          {/* Role chips — visual only, highlight active role */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 26 }}>
            {Object.entries(roleConfig).map(([role, rc]) => {
              const Icon = rc.icon;
              const active = activeRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setActiveRole(role);
                    setForm(f => ({ ...f, email: `${role}@${DOMAIN}` }));
                    setErrors({});
                  }}
                  title={`Sign in as ${roleLabels[role]}`}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                    padding: '12px 6px', borderRadius: 14,
                    border: active ? `2.5px solid ${rc.color}` : '2px solid var(--border)',
                    background: active ? `${rc.color}10` : 'var(--bg)',
                    cursor: 'pointer', font: 'inherit', transition: 'all 180ms',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 11,
                    background: active ? rc.grad : 'var(--surface)',
                    border: active ? 'none' : `1.5px solid ${rc.color}40`,
                    display: 'grid', placeItems: 'center', transition: 'all 180ms',
                  }}>
                    <Icon size={17} color={active ? '#fff' : rc.color} aria-hidden="true" />
                  </div>
                  <span style={{ fontSize: '.7rem', fontWeight: 700, color: active ? rc.color : 'var(--muted)', lineHeight: 1 }}>
                    {roleLabels[role].split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          <p style={{ textAlign: 'center', fontSize: '.83rem', color: 'var(--muted)', margin: '0 0 12px' }}>
            New to NexusOne?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              Create account
            </Link>
          </p>
          <div style={{ textAlign: 'center' }}>
            <Link to="/" style={{ fontSize: '.8rem', color: 'var(--muted)', textDecoration: 'none' }}>
              ← Back to home
            </Link>
          </div>

          {/* Domain notice */}
          <div style={{
            marginTop: 20, padding: '10px 14px', borderRadius: 10,
            background: 'rgba(37,99,235,.07)', border: '1px solid rgba(37,99,235,.18)',
            fontSize: '.75rem', color: 'var(--info)', lineHeight: 1.6,
          }}>
            🔒 Only <strong>@{DOMAIN}</strong> email addresses are accepted.
            Use your official Chitkara University credentials.
          </div>
        </div>
      </div>

      {/* ── RIGHT: Slideshow ── */}
      <div style={{ position: 'relative', overflow: 'hidden', background: '#0b0f1e' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('${slides[slide].src}')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          transition: animating ? 'opacity 350ms ease' : 'none',
          opacity: animating ? 0 : 1,
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(10,12,26,.92) 0%,rgba(10,12,26,.55) 40%,rgba(10,12,26,.25) 70%,rgba(10,12,26,.4) 100%)' }} />
        <div style={{ position: 'absolute', top: 28, left: 28, zIndex: 2 }}><Logo size={30} /></div>

        <button onClick={() => changeSlide((slide - 1 + slides.length) % slides.length)} aria-label="Previous" style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', zIndex:2, width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,.18)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,.25)', color:'#fff', display:'grid', placeItems:'center', cursor:'pointer' }}>
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => changeSlide((slide + 1) % slides.length)} aria-label="Next" style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', zIndex:2, width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,.18)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,.25)', color:'#fff', display:'grid', placeItems:'center', cursor:'pointer' }}>
          <ChevronRight size={20} />
        </button>

        <div style={{ position:'absolute', bottom:0, left:0, right:0, zIndex:2, padding:'36px 36px 40px' }}>
          <div style={{ background:'rgba(10,12,26,.6)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,.12)', borderRadius:18, padding:'24px 28px', marginBottom:18 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(67,56,202,.35)', border:'1px solid rgba(99,102,241,.4)', borderRadius:99, padding:'4px 14px', marginBottom:12, fontSize:'.72rem', fontWeight:700, color:'#a5b4fc', textTransform:'uppercase', letterSpacing:'.07em' }}>
              🎓 Chitkara University, Punjab
            </div>
            <h2 style={{ color:'#fff', fontWeight:800, fontSize:'clamp(1.3rem,2.2vw,1.65rem)', margin:'0 0 6px', lineHeight:1.25 }}>
              {slides[slide].caption}
            </h2>
            <p style={{ color:'rgba(255,255,255,.65)', fontSize:'.88rem', margin:'0 0 16px', lineHeight:1.6 }}>
              {slides[slide].sub}
            </p>
            <div style={{ display:'flex', gap:20 }}>
              {[{ val:'20K+', lbl:'Students' }, { val:'1500+', lbl:'Faculty & Staff' }, { val:'70 ac', lbl:'Campus Area' }].map(s => (
                <div key={s.lbl}>
                  <div style={{ fontSize:'1.2rem', fontWeight:800, color:'#fff', lineHeight:1 }}>{s.val}</div>
                  <div style={{ fontSize:'.7rem', color:'rgba(255,255,255,.55)', marginTop:2 }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => changeSlide(i)} aria-label={`Slide ${i+1}`} style={{ width:slide===i?24:8, height:8, borderRadius:99, border:0, cursor:'pointer', background:slide===i?'#818cf8':'rgba(255,255,255,.35)', transition:'all 300ms', padding:0 }} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="background: #0b0f1e"] { display: none !important; }
        }
      `}</style>
    </div>
  );
}
