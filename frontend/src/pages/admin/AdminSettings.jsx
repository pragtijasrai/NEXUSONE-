import { useState } from 'react';
import { Save, Bell, Shield, Database, Palette, Globe } from 'lucide-react';
import AdminShell from './AdminShell.jsx';

function Section({ title, icon: Icon, children }) {
  return (
    <div className="ap-card" style={{ marginBottom:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18, paddingBottom:14, borderBottom:'1px solid rgba(255,255,255,.07)' }}>
        <div style={{ width:34, height:34, borderRadius:9, background:'rgba(99,102,241,.2)', display:'grid', placeItems:'center' }}>
          <Icon size={16} color="#818cf8" />
        </div>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, sub, defaultOn = false }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
      <div>
        <div style={{ fontSize:'.88rem', color:'#eceefb', fontWeight:500 }}>{label}</div>
        {sub && <div style={{ fontSize:'.78rem', color:'#7880a8', marginTop:2 }}>{sub}</div>}
      </div>
      <button
        onClick={() => setOn(v => !v)}
        style={{
          width:42, height:24, borderRadius:99, border:0, cursor:'pointer',
          background: on ? '#4338ca' : 'rgba(255,255,255,.12)',
          position:'relative', transition:'background .2s', flexShrink:0,
        }}
        aria-label={label}
      >
        <span style={{
          position:'absolute', top:3, left: on ? 20 : 3,
          width:18, height:18, borderRadius:'50%', background:'#fff',
          transition:'left .2s',
        }} />
      </button>
    </div>
  );
}

function FieldRow({ label, defaultValue, type = 'text' }) {
  return (
    <div style={{ display:'grid', gap:5, marginBottom:14 }}>
      <label style={{ fontSize:'.82rem', color:'#7880a8', fontWeight:500 }}>{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        style={{
          background:'#0d1117', border:'1px solid rgba(255,255,255,.1)', borderRadius:9,
          color:'#c5caf0', font:'inherit', fontSize:'.88rem', padding:'0 12px',
          minHeight:38, width:'100%', outline:'none',
        }}
      />
    </div>
  );
}

export default function AdminSettings() {
  return (
    <AdminShell>
      <div className="ap-hdr">
        <div>
          <h1>Settings</h1>
          <p className="ap-sub">Configure NexusOne platform settings</p>
        </div>
        <button className="ap-btn ap-btn-primary"><Save size={15} /> Save Changes</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div>
          <Section title="General" icon={Globe}>
            <FieldRow label="Institution Name"  defaultValue="Chitkara University" />
            <FieldRow label="Admin Email"       defaultValue="admin@northbridge.edu" />
            <FieldRow label="Academic Year"     defaultValue="2026–2027" />
            <FieldRow label="Current Semester"  defaultValue="5" type="number" />
          </Section>

          <Section title="Notifications" icon={Bell}>
            <Toggle label="Email Notifications"   sub="Send email on booking approvals" defaultOn />
            <Toggle label="Push Notifications"    sub="Browser push alerts" />
            <Toggle label="SMS Alerts"            sub="Send SMS for urgent announcements" />
            <Toggle label="Digest Emails"         sub="Daily summary email to admin" defaultOn />
          </Section>
        </div>

        <div>
          <Section title="Security" icon={Shield}>
            <Toggle label="Two-Factor Authentication" sub="Require 2FA for admin accounts" />
            <Toggle label="Session Timeout"           sub="Auto-logout after 60 minutes of inactivity" defaultOn />
            <Toggle label="Login Audit Log"           sub="Record all login attempts" defaultOn />
            <FieldRow label="Max Login Attempts" defaultValue="5" type="number" />
          </Section>

          <Section title="Appearance" icon={Palette}>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:'.82rem', color:'#7880a8', fontWeight:500, display:'block', marginBottom:8 }}>Default Theme</label>
              <div style={{ display:'flex', gap:8 }}>
                {['Dark','Light','System'].map(t=>(
                  <button key={t} className={`ap-btn ap-btn-sm ${t==='Dark'?'ap-btn-primary':'ap-btn-ghost'}`}>{t}</button>
                ))}
              </div>
            </div>
            <Toggle label="Compact Sidebar"   sub="Use narrow sidebar by default" />
            <Toggle label="Show Animations"   sub="Enable UI transitions" defaultOn />
          </Section>

          <Section title="Database" icon={Database}>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:12 }}>
              <button className="ap-btn ap-btn-ghost ap-btn-sm">Export CSV</button>
              <button className="ap-btn ap-btn-ghost ap-btn-sm">Backup Now</button>
              <button className="ap-btn ap-btn-danger ap-btn-sm">Clear Cache</button>
            </div>
            <div className="ap-info-row">
              <span className="ap-info-lbl">Last Backup</span>
              <span className="ap-info-val">26 Oct 2026, 03:00 AM</span>
            </div>
            <div className="ap-info-row">
              <span className="ap-info-lbl">DB Size</span>
              <span className="ap-info-val">248 MB</span>
            </div>
          </Section>
        </div>
      </div>
    </AdminShell>
  );
}
