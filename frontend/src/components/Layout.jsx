import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, CheckSquare, LogOut, Briefcase, Settings, Mail, MessageCircle, Sun, Moon } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const navItems = [
    { path: '/dashboard',          label: 'Dashboard',          icon: LayoutDashboard },
    { path: '/contacts',           label: 'Contacts',           icon: Users },
    { path: '/deals',              label: 'Deals',              icon: Briefcase },
    { path: '/tasks',              label: 'Tasks',              icon: CheckSquare },
    { path: '/email-templates',    label: 'Email Templates',    icon: Mail },
    { path: '/whatsapp-templates', label: 'WhatsApp Templates', icon: MessageCircle, color: '#25D366' },
    { path: '/settings',           label: 'Settings',           icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>
      <aside className="w-64 flex flex-col" style={{ background: 'var(--color-bg-deep)', borderRight: '1px solid var(--color-border)' }}>
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <img src="/Logo NEXO copilot .png" alt="Nexo CRM" className="h-10" />
          <button onClick={toggleTheme} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--color-muted)', background: 'var(--color-surface-2)' }} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200"
              style={isActive(item.path)
                ? { background: 'var(--color-primary)', color: '#fff' }
                : { color: item.color || 'var(--color-muted)' }
              }
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="mb-3">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{user?.name}</p>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{user?.email}</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2" style={{ color: 'var(--color-muted)' }}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto" style={{ background: 'var(--color-bg)' }}>
        <Outlet />
      </main>
    </div>
  );
}
