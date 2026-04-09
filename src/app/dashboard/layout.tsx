'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard', exact: true },
  { href: '/dashboard/resume', icon: '📄', label: 'Resume Builder', exact: false },
  { href: '/dashboard/portfolio', icon: '🎨', label: 'Portfolio', exact: false },
  { href: '/dashboard/jobs', icon: '🤖', label: 'AI Job Match', exact: false },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div className="loading-spinner">
          <div className="spinner-ring" />
          <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>Loading...</p>
        </div>
        <style jsx>{`
          .loading-spinner { display: flex; flex-direction: column; align-items: center; }
          .spinner-ring { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--accent-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        `}</style>
      </div>
    );
  }

  const isActive = (href: string, exact: boolean) => {
    return exact ? pathname === href : pathname.startsWith(href);
  };

  return (
    <div className="dashboard-root">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="logo-icon">S2J</div>
            <span style={{ fontWeight: 800, fontSize: '17px', color: 'var(--text-primary)' }}>
              Skill2<span className="gradient-text">Jobs</span>
            </span>
          </Link>
        </div>

        <div className="divider" style={{ margin: '0 16px' }} />

        {/* User Info */}
        <div className="sidebar-user">
          <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>

        <div className="divider" style={{ margin: '0 16px' }} />

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="nav-section-label">MAIN MENU</p>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${isActive(item.href, item.exact) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {isActive(item.href, item.exact) && (
                <span className="nav-active-dot" />
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="sidebar-bottom">
          <div className="divider" style={{ margin: '0' }} />
          <button
            className="sidebar-nav-item"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          >
            <span className="nav-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            className="sidebar-nav-item"
            onClick={logout}
            style={{ color: 'var(--accent-danger)' }}
          >
            <span className="nav-icon">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          <button
            className="btn btn-ghost btn-sm mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="topbar-title">
            {navItems.find(item => isActive(item.href, item.exact))?.label || 'Dashboard'}
          </div>
          <div className="topbar-right">
            <div className="user-avatar-sm">{user.name.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>

      <style jsx>{`
        .dashboard-root { display: flex; min-height: 100vh; }
        .mobile-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 49; backdrop-filter: blur(4px); }
        .sidebar-logo { padding: 20px 16px; }
        .logo-icon { width: 36px; height: 36px; background: var(--gradient-primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #fff; flex-shrink: 0; }
        .sidebar-user { padding: 12px 16px; display: flex; align-items: center; gap: 10px; }
        .user-avatar { width: 36px; height: 36px; background: var(--gradient-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .user-info { overflow: hidden; }
        .user-name { font-size: 14px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-email { font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sidebar-nav { padding: 8px 8px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; }
        .nav-section-label { font-size: 10px; font-weight: 700; color: var(--text-muted); padding: 8px 8px 4px; letter-spacing: 0.1em; text-transform: uppercase; }
        .nav-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
        .nav-active-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent-primary); margin-left: auto; }
        .sidebar-bottom { padding: 8px 8px 16px; display: flex; flex-direction: column; gap: 2px; }
        .topbar { height: 60px; border-bottom: 1px solid var(--border); background: var(--bg-card); display: flex; align-items: center; padding: 0 24px; gap: 16px; position: sticky; top: 0; z-index: 10; }
        .topbar-title { font-size: 16px; font-weight: 600; color: var(--text-primary); flex: 1; }
        .topbar-right { display: flex; align-items: center; gap: 12px; }
        .user-avatar-sm { width: 32px; height: 32px; background: var(--gradient-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; }
        .mobile-menu-btn { display: none; font-size: 20px; }
        .page-content { padding: 28px; }
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex; }
          .page-content { padding: 16px; }
        }
      `}</style>
    </div>
  );
}
