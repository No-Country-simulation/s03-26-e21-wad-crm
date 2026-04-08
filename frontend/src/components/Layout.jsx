import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, CheckSquare, LogOut, Briefcase, Settings, Mail, MessageCircle } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard',          label: 'Dashboard',          icon: LayoutDashboard },
    { path: '/contacts',           label: 'Contacts',           icon: Users },
    { path: '/deals',              label: 'Deals',              icon: Briefcase },
    { path: '/tasks',              label: 'Tasks',              icon: CheckSquare },
    { path: '/email-templates',    label: 'Email Templates',    icon: Mail },
    { path: '/whatsapp-templates', label: 'WhatsApp Templates', icon: MessageCircle },
    { path: '/settings',           label: 'Settings',           icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>
      <aside className="w-64 flex flex-col" style={{ background: 'var(--color-bg-deep)', borderRight: '1px solid var(--color-border)' }}>
        <div className="p-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>Nexo CRM</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200"
              style={isActive(item.path)
                ? { background: 'var(--color-primary)', color: '#fff' }
                : { color: 'var(--color-muted)' }
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
