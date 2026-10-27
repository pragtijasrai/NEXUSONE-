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
  admin:       'linear-gradient(135deg,#4338ca,#818cf8)',
  maintenance: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
};

/* Admin portal uses its own dark sidebar theme */
const adminSidebarStyle = {
  background: '#0d1117',
  borderRight: '1px solid rgba(255,255,255,.07)',
};

export default function DashboardLayout() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  const isAdmin = user.role === 'admin';
  const items = navByRole[user.role] ?? [];
  const initials = user.name.split(' ').map(p => p[0]).slice(0, 2).join('');
  const grad = roleGradients[user.role] || roleGradients.student;

  const handleLogout = () => {
    signOut();
    notify('You have been signed out. See you soon! 👋', 'success');
    navigate('/login');
  };

  return (
    <div
      className={`shell ${collapsed ? 'shell--collapsed' : ''}`}
      style={isAdmin ? { background: '#0d1117' } : {}}
    >
      {drawer && (
        <div className="scrim" onClick={() => setDrawer(false)} aria-hidden="true" />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`sidebar ${drawer ? 'sidebar--open' : ''}`}
        aria-label="Primary navigation"
        style={isAdmin ? adminSidebarStyle : {}}
      >
        <div className="sidebar__head" style={isAdmin ? { background: '#0d1117', borderBottomColor: 'rgba(255,255,255,.07)' } : {}}>
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
                  style={isAdmin ? ({ isActive }) => ({
                    color: isActive ? '#818cf8' : '#7880a8',
                    background: isActive ? 'rgba(99,102,241,.15)' : 'transparent',
                  }) : undefined}
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
        <div className="sidebar__footer" style={isAdmin ? { borderTopColor: 'rgba(255,255,255,.07)' } : {}}>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'center',
            padding: '10px 12px', borderRadius: 10,
            background: isAdmin ? 'rgba(255,255,255,.05)' : 'var(--bg)', marginBottom: 8,
          }}>
            <div className="avatar avatar--sm" style={{ background: grad, flexShrink: 0 }}>
              {initials}
            </div>
            {!collapsed && (
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '.83rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isAdmin ? '#eceefb' : 'inherit' }}>{user.name}</div>
                <div style={{ fontSize: '.72rem', color: isAdmin ? '#7880a8' : 'var(--muted)' }}>{roleLabels[user.role]}</div>
              </div>
            )}
          </div>
          <button
            className="sidebar__collapse"
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={isAdmin ? { color: '#7880a8' } : {}}
          >
            {collapsed ? <PanelLeftOpen size={17} style={{ flexShrink: 0 }} /> : <PanelLeftClose size={17} style={{ flexShrink: 0 }} />}
            <span>Collapse</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="shell__main" style={isAdmin ? { background: '#0d1117' } : {}}>
        <header
          className="topbar"
          role="banner"
          style={isAdmin ? {
            background: '#161b2e',
            borderBottomColor: 'rgba(255,255,255,.07)',
          } : {}}
        >
          <button className="icon-btn topbar__menu" onClick={() => setDrawer(true)} aria-label="Open navigation">
            <Menu size={20} />
          </button>

          <label
            className="search"
            style={isAdmin ? {
              background: '#0d1117',
              borderColor: 'rgba(255,255,255,.1)',
            } : {}}
          >
            <Search size={15} aria-hidden="true" style={{ flexShrink: 0, color: isAdmin ? '#7880a8' : 'var(--muted)' }} />
            <input
              type="search"
              placeholder="Search anything..."
              aria-label="Search campus"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              style={isAdmin ? { color: '#c5caf0' } : {}}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQ.trim()) {
                  notify(`Searching for "${searchQ}"… Global search coming soon.`, 'info');
                  setSearchQ('');
                }
              }}
            />
            {isAdmin && (
              <span style={{
                fontSize: '.72rem', color: '#7880a8',
                background: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 5, padding: '2px 7px',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                Ctrl + K
              </span>
            )}
          </label>

          <div className="topbar__actions">
            {!isAdmin && (
              <button
                className="icon-btn"
                onClick={toggle}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            )}

            <button
              className="icon-btn notif-dot"
              onClick={() => user.role === 'student' ? navigate('/student/notifications') : notify('Notification centre — coming in the next phase!', 'info')}
              aria-label="Notifications"
              style={isAdmin ? { color: '#7880a8', position: 'relative' } : {}}
            >
              <Bell size={18} />
              {isAdmin && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#f87171',
                  border: '1.5px solid #161b2e',
                }} />
              )}
            </button>

            <div
              className="user-chip"
              onClick={() => user.role === 'student' && navigate('/student/profile')}
              style={{
                cursor: user.role === 'student' ? 'pointer' : 'default',
                ...(isAdmin ? {
                  background: 'rgba(255,255,255,.06)',
                  border: '1px solid rgba(255,255,255,.08)',
                  borderRadius: 10, padding: '5px 12px',
                } : {}),
              }}
            >
              <div
                className="avatar"
                style={{ background: grad }}
              >
                {initials}
              </div>
              <div className="user-chip__meta">
                <strong style={isAdmin ? { color: '#eceefb' } : {}}>{user.name}</strong>
                <small style={isAdmin ? { color: '#7880a8' } : {}}>{roleLabels[user.role]}</small>
              </div>
              {isAdmin && (
                <ChevronRight size={14} style={{ color: '#7880a8', marginLeft: 4 }} />
              )}
            </div>

            <button
              className="icon-btn"
              onClick={handleLogout}
              aria-label="Sign out"
              style={isAdmin ? { color: '#7880a8' } : {}}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main
          className="content"
          id="main-content"
          style={isAdmin ? { background: '#0d1117', padding: 0 } : {}}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}