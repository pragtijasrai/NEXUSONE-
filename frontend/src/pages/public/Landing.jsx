import { Link } from 'react-router-dom';
import {
  CalendarCheck, DoorOpen, Wrench, PackageSearch,
  CalendarDays, Bus, Bot, Megaphone, GraduationCap,
  BookOpen, ShieldCheck, ArrowRight, Sparkles,
  CheckCircle, Zap, Star, Play,
} from 'lucide-react';
import Logo from '../../components/common/Logo.jsx';

/* Local Chitkara University campus photos (in /public) */
const CAMPUS_PHOTO   = '/cu-campus.jpg';   /* Main campus aerial gate view */
const CAMPUS_PHOTO_2 = '/cu-turing.jpg';   /* Turing Block view             */

/* hero chips — bottom bar */
const chips = [
  { icon: CalendarCheck, label: 'Academics',        sub: 'Timetable, Attendance',  color: '#818cf8', bg: 'rgba(129,140,248,.18)' },
  { icon: DoorOpen,      label: 'Campus Services',  sub: 'Rooms, Maintenance',      color: '#34d399', bg: 'rgba(52,211,153,.18)'  },
  { icon: CalendarDays,  label: 'Events',           sub: 'Stay Updated',            color: '#f59e0b', bg: 'rgba(245,158,11,.18)'  },
  { icon: PackageSearch, label: 'Community',        sub: 'Lost & Found, Transport', color: '#f472b6', bg: 'rgba(244,114,182,.18)' },
  { icon: Bot,           label: 'AI Assistant',     sub: '24/7 Support',            color: '#22d3ee', bg: 'rgba(34,211,238,.18)'  },
];

const features = [
  { icon: CalendarCheck, title: 'Academic Dashboard',     desc: 'Schedule, attendance and assignments in one unified view.',     color: '#4338ca', bg: 'rgba(67,56,202,.08)'  },
  { icon: DoorOpen,      title: 'Smart Room Booking',     desc: 'Find a free room instantly and confirm in seconds.',            color: '#0ea5e9', bg: 'rgba(14,165,233,.08)' },
  { icon: Wrench,        title: 'Maintenance Management', desc: 'Report a fault and track it from open to resolved.',            color: '#f59e0b', bg: 'rgba(245,158,11,.08)' },
  { icon: PackageSearch, title: 'Lost & Found',           desc: 'Report and automatically match lost belongings.',               color: '#ec4899', bg: 'rgba(236,72,153,.08)' },
  { icon: CalendarDays,  title: 'Campus Events',          desc: 'Browse, register and keep track of events and clubs.',          color: '#8b5cf6', bg: 'rgba(139,92,246,.08)' },
  { icon: Bus,           title: 'Shuttle Tracker',        desc: 'Live-simulated routes and next arrival estimates.',             color: '#10b981', bg: 'rgba(16,185,129,.08)' },
  { icon: Bot,           title: 'AI Campus Assistant',    desc: 'Ask anything about campus — rooms, schedules, people.',         color: '#22d3ee', bg: 'rgba(34,211,238,.08)' },
  { icon: Megaphone,     title: 'Announcements',          desc: 'Role-targeted notices from faculty and administration.',        color: '#f43f5e', bg: 'rgba(244,63,94,.08)'  },
];

const roles = [
  { role: 'Student',     icon: GraduationCap, grad: 'linear-gradient(135deg,#4338ca,#6366f1)', desc: 'Classes, attendance, assignments and campus life all in one place.', bullets: ["Today's timetable", 'Room booking', 'Events & clubs', 'AI assistant'] },
  { role: 'Faculty',     icon: BookOpen,      grad: 'linear-gradient(135deg,#0ea5e9,#22d3ee)', desc: 'Manage courses, mark attendance, post resources and announcements.',  bullets: ['Class schedule', 'Attendance marking', 'Post announcements', 'Grade assignments'] },
  { role: 'Admin',       icon: ShieldCheck,   grad: 'linear-gradient(135deg,#7c3aed,#a78bfa)', desc: 'Full campus oversight — users, rooms, analytics and system settings.',  bullets: ['User management', 'Room utilisation', 'Reports & analytics', 'System settings'] },
  { role: 'Maintenance', icon: Wrench,        grad: 'linear-gradient(135deg,#f59e0b,#fbbf24)', desc: 'Receive, prioritise and resolve maintenance tickets across campus.',     bullets: ['Ticket queue', 'Priority routing', 'Status updates', 'Completion logs'] },
];

const stats = [
  { val: '10K+', lbl: 'Students'       },
  { val: '500+', lbl: 'Faculty & Staff' },
  { val: '50+',  lbl: 'Campus Services' },
  { val: '24/7', lbl: 'Smart Support'   },
];

const testimonials = [
  { name: 'Alex Morgan',     role: 'CSE Year 3, Chitkara',     text: 'NexusOne changed how I navigate campus. Everything I need is right here.',    rating: 5 },
  { name: 'Dr. Priya Raman', role: 'Faculty, CS Dept.',        text: 'Managing attendance and posting assignments has never been this effortless.',  rating: 5 },
  { name: 'Jordan Ellis',    role: 'Campus Administrator',     text: 'The admin dashboard gives me real-time visibility I never had before.',        rating: 5 },
];

function Stars({ n = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
      ))}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="landing">

      {/* ── Navbar (fixed, over hero photo) ── */}
      <header className="landing__nav">
        <Logo showTagline />
        <nav aria-label="Main">
          <a href="#about">Home</a>
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#solutions">Contact</a>
          <Link className="btn btn--ghost btn--sm" to="/login">Login</Link>
          <Link className="btn btn--primary btn--sm" to="/login">Get Started</Link>
        </nav>
      </header>

      {/* ── Hero — full-bleed Chitkara photo ── */}
      <section className="hero-wrap" aria-label="Campus hero">
        {/* Background photo */}
        <div
          className="hero-bg"
          style={{ backgroundImage: `url('${CAMPUS_PHOTO}')` }}
          role="img"
          aria-label="Chitkara University campus — Turing Block"
        />

        {/* Copy */}
        <div className="hero-inner">
          <div className="hero__eyebrow">
            <Sparkles size={13} />
            All-in-One Campus Platform
          </div>

          <h1 className="hero-title">
            <span className="brand-line">NexusOne</span>
            <span className="sub-line">Connecting Every Corner of Campus</span>
          </h1>

          <p>
            One platform for students, faculty, staff and administrators.
            Simplify your campus life with smart tools, real-time updates
            and seamless communication.
          </p>

          <div className="hero__cta">
            <Link className="btn btn--primary btn--lg" to="/login">
              Get Started
            </Link>
            <button
              className="btn btn--lg"
              style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.28)', backdropFilter: 'blur(8px)' }}
              onClick={() => {}}
            >
              <Play size={16} fill="#fff" /> Watch Demo
            </button>
          </div>
        </div>

        {/* Feature chips bar at bottom */}
        <div className="hero-chips" role="list">
          {chips.map(({ icon: Icon, label, sub, color, bg }) => (
            <div key={label} className="hero-chip" role="listitem">
              <div className="hero-chip__icon" style={{ background: bg }}>
                <Icon size={18} color={color} aria-hidden="true" />
              </div>
              <div>
                <div className="hero-chip__label">{label}</div>
                <div className="hero-chip__sub">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 5vw', display: 'flex', gap: 0 }}>
          {stats.map((s, i) => (
            <div key={s.lbl} style={{
              flex: 1, textAlign: 'center', position: 'relative',
              padding: '0 16px',
              borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-.02em' }}>{s.val}</div>
              <div style={{ fontSize: '.82rem', color: 'var(--muted)' }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features">
        <div className="landing-section">
          <div className="landing-section__header">
            <p style={{ textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, color: 'var(--primary)', fontSize: '.75rem', marginBottom: 8 }}>EVERYTHING YOU NEED</p>
            <h2>Everything a campus runs on, in one place</h2>
            <p>Eight powerful modules, seamlessly integrated, available to every role on campus.</p>
          </div>
          <div className="grid grid--4">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="feature-card">
                <div className="feature-card__icon" style={{ background: bg, color }}>
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section id="solutions" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="landing-section">
          <div className="landing-section__header">
            <p style={{ textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, color: 'var(--primary)', fontSize: '.75rem', marginBottom: 8 }}>SOLUTIONS FOR EVERY ROLE</p>
            <h2>One Campus. Endless Possibilities.</h2>
            <p>Students, faculty, administrators and maintenance staff each get a portal built for their work.</p>
          </div>
          <div className="grid grid--4">
            {roles.map(({ role, icon: Icon, grad, desc, bullets }) => (
              <div key={role} className="role-card">
                <div className="role-card__icon" style={{ background: grad }}>
                  <Icon size={28} color="#fff" aria-hidden="true" />
                </div>
                <h3>{role}</h3>
                <p>{desc}</p>
                <ul style={{ marginTop: 12, display: 'grid', gap: 6 }}>
                  {bullets.map(b => (
                    <li key={b} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '.82rem', color: 'var(--text2)' }}>
                      <CheckCircle size={13} style={{ color: 'var(--ok)', flexShrink: 0 }} />
                      {b}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 20 }}>
                  <Link className="btn btn--ghost btn--sm btn--block" to="/login">
                    {role} Portal <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Campus photo banner ── */}
      <section style={{ position: 'relative', height: 400, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('${CAMPUS_PHOTO_2}')`,
          backgroundSize: 'cover', backgroundPosition: 'center 40%',
        }} />
        {/* Light overlay — photo is clearly visible, text still readable */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(8,10,20,.72) 0%, rgba(8,10,20,.40) 45%, rgba(8,10,20,.10) 100%)',
        }} />
        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: 600, padding: '80px 5vw',
        }}>
          <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', color: '#fff', marginBottom: 16 }}>
            "More Than a Platform —<br />A Smarter Campus Experience"
          </h2>
          <p style={{ color: 'rgba(255,255,255,.72)', marginBottom: 28, fontSize: '.95rem' }}>
            Simpler Access · Stronger Community · Brighter Future
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['Learn', 'Connect', 'Explore', 'Grow'].map(t => (
              <Link key={t} className="btn btn--sm" to="/login"
                style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.3)' }}>
                {t}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="about">
        <div className="landing-section">
          <div className="landing-section__header">
            <p style={{ textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, color: 'var(--primary)', fontSize: '.75rem', marginBottom: 8 }}>TESTIMONIALS</p>
            <h2>Loved by the whole campus</h2>
          </div>
          <div className="grid grid--3">
            {testimonials.map(({ name, role: r, text, rating }) => (
              <div key={name} className="card" style={{ display: 'grid', gap: 12 }}>
                <Stars n={rating} />
                <p style={{ fontStyle: 'italic', color: 'var(--text2)', margin: 0 }}>"{text}"</p>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div className="avatar avatar--sm">
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '.88rem' }}>{name}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'var(--grad-brand)', padding: '72px 5vw', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
            <Zap size={18} color="#22d3ee" />
            <span style={{ fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '.07em', fontSize: '.75rem' }}>Get Started Today</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', color: '#fff', marginBottom: 14 }}>
            Ready to transform your campus experience?
          </h2>
          <p style={{ color: '#c7cbf0', marginBottom: 28 }}>
            Join thousands of students, faculty and staff already on NexusOne at Chitkara University.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="btn btn--primary btn--lg" to="/login" style={{ background: '#fff', color: '#1e1b4b' }}>
              Start for Free →
            </Link>
            <a className="btn btn--lg" href="#features"
              style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.28)' }}>
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '32px 5vw', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Logo showTagline />
          <div style={{ display: 'flex', gap: 24 }}>
            {['Home', 'Features', 'Solutions', 'Contact'].map(t => (
              <a key={t} href="#" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '.85rem' }}>{t}</a>
            ))}
          </div>
        </div>
        <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '20px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--muted)' }}>
            © 2026 NexusOne — Connecting Every Corner of Campus. Built for Chitkara University.
          </p>
          <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--muted)' }}>A demo project. All data is simulated.</p>
        </div>
      </footer>
    </div>
  );
}
