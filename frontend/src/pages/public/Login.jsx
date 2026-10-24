import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, BookOpen, ShieldCheck, Wrench } from 'lucide-react';
import Logo from '../../components/common/Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { roleHome, builtRoles, roleLabels, DEMO_PASSWORD, mockUsers } from '../../data/mockUsers.js';
const roleIcons = { student: GraduationCap, faculty: BookOpen, admin: ShieldCheck, maintenance: Wrench };
export default function Login() {
  const { user, signIn, signInAs } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={roleHome[user.role]} replace />;
  const finish = (r) => { if (r.ok) { notify(`Welcome, ${r.user.name}.`, 'success'); navigate(roleHome[r.user.role]); } else notify(r.error, 'error'); };
  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (!form.password) next.password = 'Enter the demo password.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setTimeout(() => { setBusy(false); const r = signIn(form.email, form.password); if (r.ok && !builtRoles.includes(r.user.role)) { notify('This role\'s portal is not built yet.', 'info'); } finish(r); }, 400);
  };
  return (
    <main className="auth"><div className="card auth__card"><Logo showTagline />
      <h1>Sign in</h1><p className="muted">Demo only. No real credentials are collected or protected.</p>
      <form onSubmit={submit} noValidate>
        <label className="field">Email<input type="email" value={form.email} aria-invalid={!!errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />{errors.email && <span className="field__error">{errors.email}</span>}</label>
        <label className="field">Password
          <span className="field__pw"><input type={show ? 'text' : 'password'} value={form.password} aria-invalid={!!errors.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" className="icon-btn" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></span>
          {errors.password && <span className="field__error">{errors.password}</span>}</label>
        <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="muted small">Student account: {mockUsers[0].email} · password: {DEMO_PASSWORD}</p>
      <h2 className="small">Or enter as a demo role</h2>
      <div className="grid grid--2">{Object.keys(roleIcons).map((role) => { const Icon = roleIcons[role]; const ready = builtRoles.includes(role);
        return (<button key={role} className="btn btn--ghost" disabled={!ready} onClick={() => finish(signInAs(role))}><Icon size={16} aria-hidden="true" />{roleLabels[role]}{!ready && <small> (coming soon)</small>}</button>); })}</div>
      <p className="small"><Link to="/">Back to home</Link></p></div></main>
  );
}
