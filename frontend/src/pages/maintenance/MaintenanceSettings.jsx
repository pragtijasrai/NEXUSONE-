import { useState, useRef } from 'react';
import { Eye, EyeOff, Camera, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { css, C } from './mStyles.js';

const TABS = ['Profile','Notifications','Preferences','Security'];

function MField({ label, children }) {
  return (
    <div className="mp-field">
      <label className="mp-field-lbl">{label}</label>
      {children}
    </div>
  );
}

export default function MaintenanceSettings() {
  const { user } = useAuth();
  const { notify } = useToast();
  const fileRef = useRef(null);

  const [tab, setTab]     = useState('Profile');
  const [photo, setPhoto] = useState(null);
  const [profile, setProfile] = useState({
    name:  user?.name ?? 'Sam Okafor',
    email: user?.email ?? 'sam.okafor@nexusone.edu',
    role:  'Maintenance Staff',
    phone: '+91 98765 43210',
  });
  const [pw, setPw]   = useState({ current:'', newpw:'', confirm:'' });
  const [show, setShow] = useState({ current:false, newpw:false, confirm:false });
  const [notifs, setNotifs] = useState({ email:true, push:true, sms:false, digest:true });

  const initials = profile.name.split(' ').map(p=>p[0]).slice(0,2).join('');

  const saveProfile = () => notify('Profile saved.','success');
  const updatePw = () => {
    if (!pw.current) { notify('Enter current password.','error'); return; }
    if (pw.newpw.length < 8) { notify('New password must be 8+ characters.','error'); return; }
    if (pw.newpw !== pw.confirm) { notify('Passwords do not match.','error'); return; }
    setPw({current:'',newpw:'',confirm:''});
    notify('Password updated.','success');
  };

  const pickPhoto = e => {
    const f = e.target.files?.[0]; e.target.value='';
    if (!f) return;
    const r = new FileReader(); r.onload=()=>setPhoto(r.result); r.readAsDataURL(f);
  };

  const PwField = ({k,label}) => (
    <MField label={label}>
      <div style={{position:'relative'}}>
        <input className="mp-input" type={show[k]?'text':'password'} value={pw[k]} onChange={e=>setPw(p=>({...p,[k]:e.target.value}))} placeholder={`Enter ${label.toLowerCase()}`} style={{paddingRight:40}}/>
        <button type="button" onClick={()=>setShow(s=>({...s,[k]:!s[k]}))} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',border:0,background:'none',color:C.muted,cursor:'pointer',display:'grid',placeItems:'center'}}>
          {show[k]?<EyeOff size={15}/>:<Eye size={15}/>}
        </button>
      </div>
    </MField>
  );

  const Toggle = ({k,label,sub}) => (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:`1px solid ${C.border}`}}>
      <div>
        <div style={{fontSize:'.9rem',color:'#e2e8f0',fontWeight:500}}>{label}</div>
        {sub&&<div style={{fontSize:'.78rem',color:C.muted,marginTop:2}}>{sub}</div>}
      </div>
      <button onClick={()=>setNotifs(n=>({...n,[k]:!n[k]}))} aria-pressed={notifs[k]}
        style={{width:42,height:24,borderRadius:99,border:0,cursor:'pointer',background:notifs[k]?C.primary:'rgba(255,255,255,.12)',position:'relative',transition:'background .2s',flexShrink:0}}>
        <span style={{position:'absolute',top:3,left:notifs[k]?20:3,width:18,height:18,borderRadius:'50%',background:'#fff',transition:'left .2s'}}/>
      </button>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div className="mp">
        <div style={{fontSize:'.78rem',color:C.muted,marginBottom:14}}>Home &rsaquo; <span style={{color:C.text}}>Settings</span></div>
        <div style={{marginBottom:20}}>
          <h1>Settings</h1>
          <p className="mp-sub">Manage your profile and application preferences.</p>
        </div>

        {/* Tab bar */}
        <div className="mp-tabs" style={{marginBottom:22,borderBottom:`1px solid ${C.border}`,paddingBottom:0}}>
          {TABS.map(t=>(
            <button key={t} className={`mp-tab ${tab===t?'mp-tab-active':''}`} onClick={()=>setTab(t)}>{t}</button>
          ))}
        </div>

        {tab==='Profile' && (
          <div style={{display:'grid',gridTemplateColumns:'1.1fr 1fr',gap:16}}>

            {/* Profile info */}
            <div className="mp-card">
              <h2 style={{marginBottom:18}}>Profile Information</h2>
              <div className="mp-g2">
                <MField label="Full Name">
                  <input className="mp-input" value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))}/>
                </MField>
                <MField label="Email">
                  <input className="mp-input" type="email" value={profile.email} onChange={e=>setProfile(p=>({...p,email:e.target.value}))}/>
                </MField>
                <MField label="Role">
                  <input className="mp-input" value={profile.role} readOnly style={{opacity:.6,cursor:'not-allowed'}}/>
                </MField>
                <MField label="Phone">
                  <input className="mp-input" type="tel" value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))}/>
                </MField>
              </div>
              <button className="mp-btn mp-btn-primary" onClick={saveProfile}><Save size={14}/> Save Changes</button>
            </div>

            {/* Avatar */}
            <div className="mp-card" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16}}>
              <div style={{position:'relative'}}>
                {photo
                  ? <img src={photo} alt="profile" style={{width:90,height:90,borderRadius:'50%',objectFit:'cover',border:`3px solid ${C.primary}`}}/>
                  : <div style={{width:90,height:90,borderRadius:'50%',background:'linear-gradient(135deg,#4338ca,#818cf8)',display:'grid',placeItems:'center',fontSize:'1.6rem',fontWeight:700,color:'#fff',border:`3px solid ${C.primary}`}}>{initials}</div>
                }
                <button onClick={()=>fileRef.current?.click()} aria-label="Change photo"
                  style={{position:'absolute',right:-4,bottom:-4,width:28,height:28,borderRadius:'50%',border:`2px solid ${C.card}`,background:C.primary,color:'#fff',cursor:'pointer',display:'grid',placeItems:'center'}}>
                  <Camera size={13}/>
                </button>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={pickPhoto} hidden/>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontWeight:700,color:'#e2e8f0',fontSize:'1rem'}}>{profile.name}</div>
                <div style={{fontSize:'.82rem',color:C.muted}}>{profile.email}</div>
                <div style={{fontSize:'.78rem',color:C.muted,marginTop:4}}>JPG, PNG (Max 2MB)</div>
              </div>
              <button className="mp-btn mp-btn-ghost mp-btn-sm" onClick={()=>fileRef.current?.click()}>Change Photo</button>
            </div>
          </div>
        )}

        {tab==='Notifications' && (
          <div className="mp-card" style={{maxWidth:600}}>
            <h2 style={{marginBottom:4}}>Notification Preferences</h2>
            <p style={{fontSize:'.84rem',color:C.muted,marginBottom:16}}>Choose how you want to receive updates.</p>
            <Toggle k="email" label="Email Notifications"   sub="Receive ticket updates via email" />
            <Toggle k="push"  label="Push Notifications"    sub="Browser push alerts" />
            <Toggle k="sms"   label="SMS Alerts"            sub="Text messages for urgent tickets" />
            <Toggle k="digest" label="Daily Digest"         sub="Summary email every morning" />
          </div>
        )}

        {tab==='Preferences' && (
          <div className="mp-card" style={{maxWidth:500}}>
            <h2 style={{marginBottom:16}}>App Preferences</h2>
            <MField label="Default View">
              <select className="mp-select"><option>Week</option><option>Month</option><option>List</option></select>
            </MField>
            <MField label="Items per page">
              <select className="mp-select"><option>5</option><option>10</option><option>20</option></select>
            </MField>
            <MField label="Date Format">
              <select className="mp-select"><option>DD Mon YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select>
            </MField>
            <button className="mp-btn mp-btn-primary" onClick={()=>notify('Preferences saved.','success')}><Save size={14}/> Save</button>
          </div>
        )}

        {tab==='Security' && (
          <div className="mp-card" style={{maxWidth:560}}>
            <h2 style={{marginBottom:18}}>Change Password</h2>
            <div className="mp-g2">
              <PwField k="current"  label="Current Password"/>
              <div/>
              <PwField k="newpw"    label="New Password"/>
              <PwField k="confirm"  label="Confirm New Password"/>
            </div>
            <button className="mp-btn mp-btn-primary" onClick={updatePw}>Update Password</button>
          </div>
        )}
      </div>
    </>
  );
}
