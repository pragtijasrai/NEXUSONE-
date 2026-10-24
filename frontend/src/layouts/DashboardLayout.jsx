import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, Moon, Sun, Bell, LogOut, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import Logo from '../components/common/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { roleLabels } from '../data/mockUsers.js';
import { navByRole } from './navConfig.js';
export default function DashboardLayout() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const items = navByRole[user.role] ?? [];
  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('');
  const handleLogout = () => { signOut(); notify('You have been signed out.', 'success'); navigate('/login'); };
  return (
    <div className={`shell ${collapsed ? 'shell--collapsed' : ''}`}>
      {drawer && <div className="scrim" onClick={() => setDrawer(false)} aria-hidden="true" />}
      <aside className={`sidebar ${drawer ? 'sidebar--open' : ''}`} aria-label="Primary">
        <div className="sidebar__head"><Logo to={items[0]?.to} /></div>
        <nav><ul>{items.map(({ to, label, icon: Icon }) => (
          <li key={to}><NavLink to={to} onClick={() => setDrawer(false)} className="nav-link"><Icon size={18} aria-hidden="true" /><span>{label}</span></NavLink></li>))}</ul></nav>
        <button className="nav-link sidebar__collapse" onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}<span>Collapse</span></button>
      </aside>
      <div className="shell__main">
        <header className="topbar">
          <button className="icon-btn topbar__menu" onClick={() => setDrawer(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <label className="search"><Search size={16} aria-hidden="true" /><input type="search" placeholder="Search campus" aria-label="Search campus" onKeyDown={(e) => e.key === 'Enter' && notify('Global search arrives with the full portal.', 'info')} /></label>
          <div className="topbar__actions">
            <button className="icon-btn" onClick={toggle} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
            <button className="icon-btn" onClick={() => notify('Notification center arrives in the next student-portal phase.', 'info')} aria-label="Notifications"><Bell size={18} /></button>
            <div className="user-chip"><span className="avatar" aria-hidden="true">{initials}</span><span className="user-chip__meta"><strong>{user.name}</strong><small>{roleLabels[user.role]}</small></span></div>
            <button className="icon-btn" onClick={handleLogout} aria-label="Sign out"><LogOut size={18} /></button>
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
