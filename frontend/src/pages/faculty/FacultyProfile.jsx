/**
 * FacultyProfile — /faculty/profile
 * Camera icon directly opens camera. "Upload from Device" is a text link below.
 */
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Camera, Mail, Phone, Shield,
  User, BookOpen, Bell, Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const css = `
  .fp { background:#0d1117; min-height:100vh; color:#c5caf0; font-family:inherit; padding:28px 32px; }
  .fp h1 { font-size:1.4rem; font-weight:700; color:#eceefb; margin:0 0 4px; }
  .fp-sub { font-size:.88rem; color:#7880a8; margin:0 0 24px; }
  .fp-back { display:inline-flex; align-items:center; gap:6px; color:#7880a8; font-size:.83rem; text-decoration:none; margin-bottom:16px; transition:color .15s; }
  .fp-back:hover { color:#818cf8; }
  .fp-body { display:grid; grid-template-columns:260px 1fr; gap:20px; align-items:start; }
  .fp-left { display:grid; gap:16px; }

  /* Avatar card */
  .fp-avatar-wrap { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:16px; padding:28px 20px; display:flex; flex-direction:column; align-items:center; gap:4px; text-align:center; }
  .fp-avatar { width:90px; height:90px; border-radius:50%; background:linear-gradient(135deg,#4338ca,#818cf8); display:flex; align-items:center; justify-content:center; font-size:1.6rem; font-weight:800; color:#fff; position:relative; margin-bottom:4px; }
  .fp-avatar-edit { position:absolute; bottom:0; right:0; width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,#4338ca,#6366f1); display:grid; place-items:center; cursor:pointer; border:2px solid #0d1117; transition:transform .15s; }
  .fp-avatar-edit:hover { transform:scale(1.12); }
  .fp-name { font-size:1.05rem; font-weight:700; color:#eceefb; margin:8px 0 2px; }
  .fp-role { font-size:.82rem; color:#818cf8; font-weight:600; margin:0 0 2px; }
  .fp-dept { font-size:.78rem; color:#7880a8; margin:0 0 8px; }
  .fp-status-row { display:flex; align-items:center; gap:6px; font-size:.8rem; font-weight:600; color:#34d399; margin-bottom:6px; }
  .fp-status-dot { width:7px; height:7px; border-radius:50%; background:#34d399; }
  .fp-upload-link { background:none; border:none; color:#818cf8; font-size:.78rem; cursor:pointer; text-decoration:underline; padding:0; }
  .fp-upload-link:hover { color:#a5b4fc; }

  /* Info list */
  .fp-info-list { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:14px; overflow:hidden; }
  .fp-info-row { display:flex; align-items:center; gap:12px; padding:14px 16px; border-bottom:1px solid rgba(255,255,255,.04); }
  .fp-info-row:last-child { border:0; }
  .fp-info-icon { color:#555a7a; flex-shrink:0; }
  .fp-info-label { font-size:.72rem; color:#7880a8; font-weight:600; text-transform:uppercase; letter-spacing:.04em; }
  .fp-info-val   { font-size:.86rem; color:#eceefb; font-weight:500; margin-top:1px; }

  /* Right panel tabs */
  .fp-right { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:16px; overflow:hidden; }
  .fp-tabs { display:flex; border-bottom:1px solid rgba(255,255,255,.07); }
  .fp-tab { padding:14px 20px; border:0; background:none; font:inherit; font-size:.85rem; font-weight:500; color:#7880a8; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-1px; transition:all .15s; display:flex; align-items:center; gap:7px; }
  .fp-tab:hover { color:#c5caf0; }
  .fp-tab--active { color:#818cf8; border-bottom-color:#818cf8; font-weight:700; }
  .fp-panel { padding:24px; }
  .fp-section-title { font-size:.82rem; font-weight:700; color:#7880a8; text-transform:uppercase; letter-spacing:.06em; margin:0 0 16px; }
  .fp-field { margin-bottom:16px; }
  .fp-field label { display:block; font-size:.76rem; font-weight:600; color:#7880a8; text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px; }
  .fp-field input, .fp-field select, .fp-field textarea { width:100%; padding:10px 13px; border-radius:9px; box-sizing:border-box; background:#0d1117; border:1.5px solid rgba(255,255,255,.1); color:#eceefb; font:inherit; font-size:.88rem; transition:border-color .18s; }
  .fp-field input:focus, .fp-field select:focus, .fp-field textarea:focus { outline:none; border-color:#4338ca; }
  .fp-field textarea { resize:vertical; min-height:80px; }
  .fp-field-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .fp-save-btn { display:inline-flex; align-items:center; gap:7px; padding:10px 24px; border-radius:10px; border:0; font:inherit; font-size:.9rem; font-weight:600; cursor:pointer; background:linear-gradient(135deg,#4338ca,#6366f1); color:#fff; transition:all .18s; }
  .fp-save-btn:hover { filter:brightness(1.1); transform:translateY(-1px); }
  .fp-pref-row { display:flex; justify-content:space-between; align-items:center; padding:14px 0; border-bottom:1px solid rgba(255,255,255,.05); }
  .fp-pref-row:last-child { border:0; }
  .fp-pref-label { font-size:.88rem; color:#eceefb; font-weight:500; }
  .fp-pref-sub   { font-size:.76rem; color:#7880a8; margin-top:2px; }
  .fp-toggle { width:42px; height:24px; border-radius:99px; border:0; cursor:pointer; transition:background .2s; position:relative; flex-shrink:0; }
  .fp-toggle::after { content:''; position:absolute; top:3px; width:18px; height:18px; border-radius:50%; background:#fff; transition:left .2s; }
  .fp-toggle--on { background:#4338ca; }
  .fp-toggle--on::after { left:21px; }
  .fp-toggle--off { background:rgba(255,255,255,.15); }
  .fp-toggle--off::after { left:3px; }

  .fp-field-error { font-size:.75rem; color:#f87171; margin-top:4px; display:block; }
  .fp-field input--error { border-color:#f87171 !important; }

  @media(max-width:900px){ .fp-body{grid-template-columns:1fr;} .fp{padding:16px;} }
  @media(max-width:480px){ .fp-field-row{grid-template-columns:1fr;} }
`;

const TABS = [
  { id:'personal',    label:'Personal Info', icon:User    },
  { id:'preferences', label:'Preferences',   icon:Bell    },
  { id:'security',    label:'Security',      icon:Lock    },
];

function Toggle({ on, onChange }) {
  return (
    <button
      className={`fp-toggle fp-toggle--${on?'on':'off'}`}
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
    />
  );
}

/* ─── Security Tab with password validation ─── */
function SecurityTab({ notify }) {
  const [form, setForm] = useState({ current:'', next:'', confirm:'' });
  const [errors, setErrors] = useState({});
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.current) errs.current = 'Required';
    if (form.next.length < 8) errs.next = 'Must be at least 8 characters';
    if (form.next !== form.confirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    notify('Password updated successfully!', 'success');
    setForm({ current:'', next:'', confirm:'' });
  }

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ fontSize:'.82rem', fontWeight:700, color:'#7880a8', textTransform:'uppercase', letterSpacing:'.06em', margin:'0 0 16px' }}>Change Password</p>
      <div className="fp-field">
        <label>Current Password</label>
        <input
          type="password"
          placeholder="Enter current password"
          value={form.current}
          onChange={e => set('current', e.target.value)}
          style={errors.current ? { borderColor:'#f87171' } : {}}
        />
        {errors.current && <span className="fp-field-error">{errors.current}</span>}
      </div>
      <div className="fp-field">
        <label>New Password</label>
        <input
          type="password"
          placeholder="At least 8 characters"
          value={form.next}
          onChange={e => set('next', e.target.value)}
          style={errors.next ? { borderColor:'#f87171' } : {}}
        />
        {errors.next && <span className="fp-field-error">{errors.next}</span>}
        {form.next.length > 0 && !errors.next && (
          <div style={{ marginTop:6, display:'flex', gap:4 }}>
            {['Length','Number','Special'].map((label, i) => {
              const checks = [form.next.length >= 8, /\d/.test(form.next), /[^a-zA-Z0-9]/.test(form.next)];
              return (
                <div key={label} style={{ flex:1, height:3, borderRadius:99, background: checks[i] ? '#34d399' : 'rgba(255,255,255,.1)', transition:'background .2s' }} />
              );
            })}
          </div>
        )}
      </div>
      <div className="fp-field">
        <label>Confirm New Password</label>
        <input
          type="password"
          placeholder="Repeat new password"
          value={form.confirm}
          onChange={e => set('confirm', e.target.value)}
          style={errors.confirm ? { borderColor:'#f87171' } : form.confirm && form.confirm === form.next ? { borderColor:'#34d399' } : {}}
        />
        {errors.confirm && <span className="fp-field-error">{errors.confirm}</span>}
        {form.confirm && form.confirm === form.next && !errors.confirm && (
          <span style={{ fontSize:'.74rem', color:'#34d399', marginTop:4, display:'block' }}>✓ Passwords match</span>
        )}
      </div>
      <button type="submit" className="fp-save-btn"><Lock size={14} /> Update Password</button>
    </form>
  );
}

export default function FacultyProfile() {
  const { user } = useAuth();
  const { notify } = useToast();
  const [tab, setTab] = useState('personal');
  const [avatarSrc, setAvatarSrc] = useState(null);
  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);

  const displayName = user?.name ?? 'Priya Raman';
  const initials    = displayName.split(' ').filter(p => !p.endsWith('.')).map(p => p[0]).slice(0, 2).join('');

  const [profile, setProfile] = useState({
    firstName:   'Priya',
    lastName:    'Raman',
    email:       user?.email ?? 'priya.raman@northbridge.edu',
    phone:       '+1 (555) 234-5678',
    designation: 'Associate Professor',
    department:  'Computer Science',
    facultyId:   'NB-F-0042',
    office:      'CS Block, Room 312',
    bio:         'Specialising in distributed systems and cloud computing with over 10 years of teaching experience.',
  });

  const [prefs, setPrefs] = useState({
    emailNotifs:   true,
    smsNotifs:     false,
    assignmentAlerts: true,
    attendanceAlerts: true,
    eventReminders:   false,
  });

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatarSrc(ev.target.result);
    reader.readAsDataURL(file);
  }

  function openCamera()  { cameraInputRef.current?.click(); }
  function openUpload()  { fileInputRef.current?.click(); }

  function handleSave(e) {
    e.preventDefault();
    notify('Profile updated successfully!', 'success');
  }

  return (
    <>
      <style>{css}</style>
      <div className="fp">
        <Link to="/faculty/dashboard" className="fp-back"><ChevronLeft size={15} /> Back to Dashboard</Link>
        <div style={{ marginBottom:16 }}>
          <h1>My Profile</h1>
          <p className="fp-sub">View and manage your faculty profile and account settings</p>
        </div>

        <div className="fp-body">

          {/* ── Left: profile card ── */}
          <div className="fp-left">
            <div className="fp-avatar-wrap">
              <div className="fp-avatar">
                {avatarSrc
                  ? <img src={avatarSrc} alt="Avatar" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} />
                  : initials
                }
                {/* Camera icon — directly opens camera */}
                <div
                  className="fp-avatar-edit"
                  title="Take profile photo"
                  role="button"
                  aria-label="Take profile photo"
                  tabIndex={0}
                  onClick={openCamera}
                  onKeyDown={e => e.key === 'Enter' && openCamera()}
                >
                  <Camera size={11} color="#fff" />
                </div>
                {/* Hidden inputs */}
                <input ref={cameraInputRef} type="file" accept="image/*" capture="user" style={{ display:'none' }} onChange={handleAvatarChange} aria-hidden="true" />
                <input ref={fileInputRef}   type="file" accept="image/*"               style={{ display:'none' }} onChange={handleAvatarChange} aria-hidden="true" />
              </div>

              <p className="fp-name">{displayName}</p>
              <p className="fp-role">{profile.designation}</p>
              <p className="fp-dept">{profile.department}</p>
              <div className="fp-status-row"><div className="fp-status-dot" /> Active Faculty</div>
              <button className="fp-upload-link" onClick={openUpload}>Upload from Device</button>
            </div>

            {/* Info rows */}
            <div className="fp-info-list">
              <div className="fp-info-row">
                <Mail size={14} className="fp-info-icon" />
                <div><div className="fp-info-label">Email</div><div className="fp-info-val">{profile.email}</div></div>
              </div>
              <div className="fp-info-row">
                <Shield size={14} className="fp-info-icon" />
                <div><div className="fp-info-label">Faculty ID</div><div className="fp-info-val">{profile.facultyId}</div></div>
              </div>
              <div className="fp-info-row">
                <Phone size={14} className="fp-info-icon" />
                <div><div className="fp-info-label">Phone</div><div className="fp-info-val">{profile.phone}</div></div>
              </div>
              <div className="fp-info-row">
                <BookOpen size={14} className="fp-info-icon" />
                <div><div className="fp-info-label">Department</div><div className="fp-info-val">{profile.department}</div></div>
              </div>
            </div>
          </div>

          {/* ── Right: tabbed panel ── */}
          <div className="fp-right">
            <div className="fp-tabs">
              {TABS.map(t => (
                <button key={t.id} className={`fp-tab${tab===t.id?' fp-tab--active':''}`} onClick={() => setTab(t.id)}>
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>

            <div className="fp-panel">
              {/* Personal Info */}
              {tab === 'personal' && (
                <form onSubmit={handleSave}>
                  <p className="fp-section-title">Personal Information</p>
                  <div className="fp-field-row">
                    <div className="fp-field"><label>First Name</label><input value={profile.firstName} onChange={e => setProfile(p=>({...p, firstName:e.target.value}))} /></div>
                    <div className="fp-field"><label>Last Name</label><input value={profile.lastName} onChange={e => setProfile(p=>({...p, lastName:e.target.value}))} /></div>
                  </div>
                  <div className="fp-field"><label>Email</label><input type="email" value={profile.email} onChange={e => setProfile(p=>({...p, email:e.target.value}))} /></div>
                  <div className="fp-field"><label>Phone</label><input value={profile.phone} onChange={e => setProfile(p=>({...p, phone:e.target.value}))} /></div>
                  <div className="fp-field-row">
                    <div className="fp-field"><label>Designation</label><input value={profile.designation} onChange={e => setProfile(p=>({...p, designation:e.target.value}))} /></div>
                    <div className="fp-field"><label>Department</label><input value={profile.department} onChange={e => setProfile(p=>({...p, department:e.target.value}))} /></div>
                  </div>
                  <div className="fp-field"><label>Office</label><input value={profile.office} onChange={e => setProfile(p=>({...p, office:e.target.value}))} /></div>
                  <div className="fp-field"><label>Bio</label><textarea value={profile.bio} onChange={e => setProfile(p=>({...p, bio:e.target.value}))} /></div>
                  <button type="submit" className="fp-save-btn">Save Changes</button>
                </form>
              )}

              {/* Preferences */}
              {tab === 'preferences' && (
                <div>
                  <p className="fp-section-title">Notification Preferences</p>
                  {[
                    { key:'emailNotifs',      label:'Email Notifications',   sub:'Receive updates via email'              },
                    { key:'smsNotifs',        label:'SMS Notifications',      sub:'Receive text message alerts'            },
                    { key:'assignmentAlerts', label:'Assignment Alerts',      sub:'New submissions and grading reminders'  },
                    { key:'attendanceAlerts', label:'Attendance Alerts',      sub:'Low attendance warnings'                },
                    { key:'eventReminders',   label:'Event Reminders',        sub:'Campus events you\'ve RSVP\'d to'       },
                  ].map(({ key, label, sub }) => (
                    <div key={key} className="fp-pref-row">
                      <div><div className="fp-pref-label">{label}</div><div className="fp-pref-sub">{sub}</div></div>
                      <Toggle on={prefs[key]} onChange={v => { setPrefs(p=>({...p,[key]:v})); notify(`${label} ${v?'enabled':'disabled'}`, 'success'); }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Security */}
              {tab === 'security' && (
                <SecurityTab notify={notify} />
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
