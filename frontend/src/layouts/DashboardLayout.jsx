import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Menu, Moon, Sun, Bell, LogOut,
  PanelLeftClose, PanelLeftOpen, Search, ChevronRight,
} from 'lucide-react';
import Logo from '../components/common/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { roleLabels } from '../data/mockUsers.js';
import { navByRole } from './navConfig.js';

const roleGradients = {
  student:     'linear-gradient(135deg,#4338ca,#6366f1)',
  faculty:     'linear-gradient(135deg,#0ea5e9,#22d3ee)',
  admin:       'linear-gradient(135deg,#7c3aed,#a78bfa)',
  maintenance: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
};

export default function DashboardLayout() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  const items = navByRole[user.role] ?? [];
  const initials = user.name.split(' ').map(p => p[0]).slice(0, 2).join('');
  const grad = roleGradients[user.role] || roleGradients.student;

  const handleLogout = () => {
    signOut();
    notify('You have been signed out. See you soon! 👋', 'success');
    navigate('/login');
  };

  return (
    <div className={`shell ${collapsed ? 'shell--collapsed' : ''}`}>
      {drawer && (
        <div className="scrim" onClick={() => setDrawer(false)} aria-hidden="true" />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${drawer ? 'sidebar--open' : ''}`} aria-label="Primary navigation">
        <div className="sidebar__head">
          <Logo to={items[0]?.to} />
        </div>

        <nav>
          <p className="sidebar__section-label">Navigation</p>
          <ul>
            {items.map(({ to, label, icon: Icon, badge }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => setDrawer(false)}
                  className="nav-link"
                >
                  <Icon size={18} aria-hidden="true" style={{ flexShrink: 0 }} />
                  <span>{label}</span>
                  {badge && <span className="nav-link__badge">{badge}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info in sidebar */}
        <div className="sidebar__footer">
          <div style={{
            display: 'flex', gap: 10, alignItems: 'center',
            padding: '10px 12px', borderRadius: 10,
            background: 'var(--bg)', marginBottom: 8,
          }}>
            <div className="avatar avatar--sm" style={{ background: grad, flexShrink: 0 }}>
              {initials}
            </div>
            {!collapsed && (
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '.83rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{roleLabels[user.role]}</div>
              </div>
            )}
          </div>
          <button
            className="sidebar__collapse"
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={17} style={{ flexShrink: 0 }} /> : <PanelLeftClose size={17} style={{ flexShrink: 0 }} />}
            <span>Collapse</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="shell__main">
        <header className="topbar" role="banner">
          <button className="icon-btn topbar__menu" onClick={() => setDrawer(true)} aria-label="Open navigation">
            <Menu size={20} />
          </button>

          <label className="search">
            <Search size={15} aria-hidden="true" style={{ flexShrink: 0, color: 'var(--muted)' }} />
            <input
              type="search"
              placeholder="Search campus…"
              aria-label="Search campus"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQ.trim()) {
                  notify(`Searching for "${searchQ}"… Global search coming soon.`, 'info');
                  setSearchQ('');
                }
              }}
            />
          </label>

          <div className="topbar__actions">
            <button
              className="icon-btn"
              onClick={toggle}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              data-tip={theme === 'light' ? 'Dark mode' : 'Light mode'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <button
              className="icon-btn notif-dot"
              onClick={() => notify('Notification centre — coming in the next phase!', 'info')}
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>

            <div className="user-chip">
              <div className="avatar" style={{ background: grad }}>
                {initials}
              </div>
              <div className="user-chip__meta">
                <strong>{user.name}</strong>
                <small>{roleLabels[user.role]}</small>
              </div>
            </div>

            <button className="icon-btn" onClick={handleLogout} aria-label="Sign out" data-tip="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="content" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
