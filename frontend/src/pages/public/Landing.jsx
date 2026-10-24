import { Link } from 'react-router-dom';
import { CalendarCheck, DoorOpen, Wrench, PackageSearch, CalendarDays, Bus, Bot, Megaphone } from 'lucide-react';
import Logo from '../../components/common/Logo.jsx';
import NetworkArt from '../../components/common/NetworkArt.jsx';
import { todaysClasses, announcements } from '../../data/mockStudent.js';
const features = [
  [CalendarCheck, 'Academic dashboard', 'Schedule, attendance and assignments in one view.'],
  [DoorOpen, 'Smart room booking', 'Find a free room and book it without clashes.'],
  [Wrench, 'Maintenance management', 'Report a fault and follow it to resolution.'],
  [PackageSearch, 'Lost and found', 'Report and match lost belongings.'],
  [CalendarDays, 'Campus events', 'Browse, register and keep track of events.'],
  [Bus, 'Shuttle information', 'Simulated routes and arrival estimates.'],
  [Bot, 'Campus assistant', 'Ask where things are and what is on today.'],
  [Megaphone, 'Announcements', 'Targeted notices from faculty and administration.'],
];
export default function Landing() {
  return (
    <div className="landing">
      <header className="landing__nav"><Logo />
        <nav aria-label="Main"><a href="#features">Features</a><a href="#solutions">Solutions</a><a href="#about">About</a>
          <Link to="/login">Login</Link><Link className="btn btn--primary" to="/login">Get Started</Link></nav></header>
      <section className="hero hero--dark"><NetworkArt /><div className="hero__copy">
        <h1>Your Entire Campus. One Intelligent Platform.</h1>
        <p>Connect students, faculty, administration, and campus services through one seamless digital experience. Discover a smarter way to navigate university life.</p>
        <div className="hero__cta"><Link className="btn btn--primary" to="/login">Explore NexusOne</Link><a className="btn btn--ghost" href="#features">Discover Features</a></div></div>
        <div className="preview card" aria-label="Dashboard preview built from live components">
          <p><strong>Good morning, Alex!</strong></p>
          <ul className="list">{todaysClasses.map((c) => <li key={c.id} className="row"><span>{c.subject}</span><span className="muted small">{c.time.split(' ')[0]}</span></li>)}</ul>
          <p className="muted small">{announcements[1].title}</p></div></section>
      <section id="features" className="section"><h2>Everything a campus runs on, in one place</h2>
        <div className="grid grid--4">{features.map(([Icon, t, d]) => (<div key={t} className="card"><span className="stat__icon"><Icon size={18} aria-hidden="true" /></span><h3>{t}</h3><p className="muted">{d}</p></div>))}</div></section>
      <section id="solutions" className="section"><h2>Solutions for every role</h2><p className="muted">Students, faculty, administrators and maintenance staff each get a portal built around their work.</p></section>
      <section id="about" className="section"><h2>About</h2><p className="muted">NexusOne is a frontend prototype for a fictional university. All data is simulated and stored in your browser only.</p></section>
      <footer className="section muted small">© NexusOne — Connecting Every Corner of Campus. Demo project.</footer>
    </div>
  );
}
