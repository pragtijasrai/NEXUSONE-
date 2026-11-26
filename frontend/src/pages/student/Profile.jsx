import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, CreditCard, Building2, GraduationCap, Camera, Lock, Save, LogOut,
  Moon, Sun, Trash2, CheckCircle2, Eye, EyeOff, KeyRound, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { load, save, remove } from '../../utils/storage.js';
import { roleLabels } from '../../data/mockUsers.js';
import {
  academicByUser, fallbackAcademic, defaultEditable, CONTACT_METHODS, NOTIFY_OPTIONS,
} from '../../data/mockProfile.js';
import { updateMyProfile, changeMyPassword } from '../../services/userService.js';

/* ───────── small pieces ───────── */
const Row = ({ icon: Icon, label, value }) => (
  <div>
    <dt style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      {Icon && <Icon size={14} aria-hidden="true" />}{label}
    </dt>
    <dd>{value}</dd>
  </div>
);

const phoneOk = (v) => v === '' || /^[+]?[0-9\s-]{10,15}$/.test(v.trim());

/* ───────── change password modal ───────── */
function ChangePasswordModal({ onClose, onSubmit, busy }) {
  const [f, setF] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ cur: false, new: false, conf: false });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => { setF((p) => ({ ...p, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: '' })); };

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!f.currentPassword) err.currentPassword = 'Enter your current password.';
    if (!f.newPassword || f.newPassword.length < 8) err.newPassword = 'New password must be at least 8 characters.';
    if (f.newPassword !== f.confirmPassword) err.confirmPassword = 'Passwords do not match.';
    setErrors(err);
    if (Object.keys(err).length === 0) onSubmit(f);
  };

  const field = (key, label, placeholder, showKey) => (
    <label className="field">
      {label}
      <div style={{ position: 'relative' }}>
        <input
          type={show[showKey] ? 'text' : 'password'}
          value={f[key]}
          onChange={set(key)}
          placeholder={placeholder}
          aria-invalid={!!errors[key]}
          style={{ paddingRight: 40 }}
        />
        <button type="button" onClick={() => setShow((p) => ({ ...p, [showKey]: !p[showKey] }))}
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
          aria-label={show[showKey] ? 'Hide password' : 'Show password'}>
          {show[showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {errors[key] && <span className="field__error" role="alert">{errors[key]}</span>}
    </label>
  );

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="pw-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,12,26,.55)', display: 'grid', placeItems: 'center', zIndex: 60, padding: 16 }}>
      <form className="card" onSubmit={submit} noValidate style={{ width: 'min(460px, 100%)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="section-header">
          <h2 id="pw-title" style={{ fontSize: '1.2rem' }}>Change Password</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {field('currentPassword', 'Current password', 'Enter current password', 'cur')}
        {field('newPassword', 'New password', 'At least 8 characters', 'new')}
        {field('confirmPassword', 'Confirm new password', 'Re-enter new password', 'conf')}
        <p className="field__hint" style={{ marginTop: -4 }}>
          You will be logged out of other devices after changing your password.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? 'Changing…' : 'Change password'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ───────── page ───────── */
export default function Profile() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const { notify } = useToast();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const storeKey = `profile:${user.id}`;
  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('');
  const academic = academicByUser[user.id] ?? fallbackAcademic;

  const saved = load(storeKey, {});
  const [form, setForm] = useState({ ...defaultEditable, ...saved.form, phone: saved.form?.phone ?? user.phone ?? '' });
  const [photo, setPhoto] = useState(saved.photo ?? null);
  const [errors, setErrors] = useState({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);

  const setField = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setDirty(true); };

  const pickPhoto = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(png|jpeg)$/.test(file.type)) { notify('Please choose a PNG or JPG image.', 'error'); return; }
    if (file.size > 1024 * 1024) { notify('Photo must be under 1 MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => { setPhoto(reader.result); setDirty(true); };
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = {};
    if (!phoneOk(form.phone)) err.phone = 'Enter 10–15 digits (you may start with +).';
    setErrors(err);
    if (Object.keys(err).length) return;

    setSaving(true);
    try {
      /* Send only the fields the API accepts: name, phone, avatar_url */
      await updateMyProfile({
        name: user.name,
        phone: form.phone,
      });
      /* Save notification preferences locally (no API for these) */
      const ok = save(storeKey, { form, photo });
      setDirty(false);
      notify('Profile saved.', 'success');
    } catch (e) {
      notify(e.message || 'Could not save profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (f) => {
    setPwBusy(true);
    try {
      await changeMyPassword({ currentPassword: f.currentPassword, newPassword: f.newPassword });
      notify('Password changed successfully. Other devices will be logged out.', 'success');
      setShowPwModal(false);
    } catch (e) {
      notify(e.message || 'Failed to change password.', 'error');
    } finally {
      setPwBusy(false);
    }
  };

  const reset = () => {
    remove(storeKey);
    setForm({ ...defaultEditable, phone: user.phone ?? '' }); setPhoto(null); setErrors({}); setDirty(false);
    notify('Profile preferences reset to defaults.', 'info');
  };

  const logout = () => { signOut(); navigate('/login'); };

  return (
    <div className="stack">
      <header>
        <h1>My Profile</h1>
        <p className="muted">Your account and academic details.</p>
      </header>

      {/* Identity card */}
      <div className="card card--brand" style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          {photo ? (
            <img src={photo} alt={`${user.name} profile`} style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,.4)' }} />
          ) : user.avatar_url ? (
            <img src={user.avatar_url} alt={`${user.name} profile`} style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,.4)' }} />
          ) : (
            <div className="avatar" style={{ width: 88, height: 88, fontSize: '1.6rem', border: '3px solid rgba(255,255,255,.4)' }}>{initials}</div>
          )}
          <button type="button" onClick={() => fileRef.current?.click()} aria-label="Change profile photo"
            style={{ position: 'absolute', right: -4, bottom: -4, width: 32, height: 32, borderRadius: '50%', border: '2px solid #fff', background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <Camera size={14} aria-hidden="true" />
          </button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={pickPhoto} hidden />
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem' }}>{user.name}</h2>
          <p style={{ margin: '4px 0 10px', opacity: .85 }}>{academic.course}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: 'rgba(255,255,255,.18)', color: '#fff' }}>{roleLabels[user.role]}</span>
            <span className="badge" style={{ background: 'rgba(255,255,255,.18)', color: '#fff' }}>{academic.semester}</span>
            <span className="badge" style={{ background: 'rgba(255,255,255,.18)', color: '#fff' }}>{academic.section}</span>
          </div>
        </div>
      </div>

      <div className="grid grid--2 profile-grid">
        {/* Read-only official details */}
        <section className="card" aria-label="Official details">
          <div className="section-header">
            <h2 style={{ fontSize: '1.1rem' }}>Official details</h2>
            <span className="badge badge--next"><Lock size={11} aria-hidden="true" /> Managed by university</span>
          </div>
          <dl className="facts">
            <Row icon={Mail}          label="University email" value={user.email} />
            <Row icon={CreditCard}    label="Student ID"       value={user.demoId || `STU-${String(user.id).padStart(4, '0')}`} />
            <Row icon={Building2}     label="Department"       value={user.department || 'Computer Science & Engineering'} />
            <Row icon={GraduationCap} label="Course"           value={academic.course} />
            <Row label="Semester"      value={academic.semester} />
            <Row label="Section"       value={academic.section} />
            <Row label="Batch"         value={academic.batch} />
            <Row label="Faculty advisor" value={academic.advisor} />
          </dl>
          <p className="muted small" style={{ margin: '12px 0 0' }}>
            These details can only be changed by an administrator. Contact the academic office if something is incorrect.
          </p>
        </section>

        {/* Editable settings */}
        <form className="card" onSubmit={submit} noValidate aria-label="Account settings">
          <div className="section-header"><h2 style={{ fontSize: '1.1rem' }}>Account settings</h2></div>

          <label className="field">Phone number (optional)
            <input type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)}
              placeholder="+91 98765 43210" aria-invalid={!!errors.phone} maxLength={20} />
            {errors.phone
              ? <span className="field__error" role="alert">{errors.phone}</span>
              : <span className="field__hint">Only you and campus administrators can see this.</span>}
          </label>

          <label className="field">Preferred contact method
            <select value={form.preferredContact} onChange={(e) => setField('preferredContact', e.target.value)}>
              {CONTACT_METHODS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>

          <fieldset style={{ border: 0, padding: 0, margin: '0 0 14px' }}>
            <legend style={{ fontWeight: 500, fontSize: '.9rem', marginBottom: 8 }}>Notify me about</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }} className="notify-grid">
              {NOTIFY_OPTIONS.map(([key, label]) => (
                <label key={key} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '.88rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form[key]} onChange={(e) => setField(key, e.target.checked)} />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Change password button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: '.9rem' }}>Password</div>
              <div className="muted small">Change your account password</div>
            </div>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowPwModal(true)}>
              <KeyRound size={14} aria-hidden="true" /> Change password
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: '.9rem' }}>Appearance</div>
              <div className="muted small">Currently {theme} mode</div>
            </div>
            <button type="button" className="btn btn--ghost btn--sm" onClick={toggle}>
              {theme === 'light' ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}
              Switch to {theme === 'light' ? 'dark' : 'light'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn--ghost" onClick={reset}><Trash2 size={16} aria-hidden="true" /> Reset</button>
            <button type="submit" className="btn btn--primary" disabled={!dirty || saving}>
              {saving ? <Save size={16} aria-hidden="true" /> : dirty ? <Save size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}
              {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
            </button>
          </div>
        </form>
      </div>

      {/* Session */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <strong>Sign out of NexusOne</strong>
          <div className="muted small">You will need to log in again to access your portal.</div>
        </div>
        <button className="btn btn--danger" onClick={logout}><LogOut size={16} aria-hidden="true" /> Sign out</button>
      </div>

      {showPwModal && <ChangePasswordModal onClose={() => setShowPwModal(false)} onSubmit={handleChangePassword} busy={pwBusy} />}
      <style>{`@media (max-width: 860px){ .profile-grid{ grid-template-columns: 1fr !important; } } @media (max-width: 420px){ .notify-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
