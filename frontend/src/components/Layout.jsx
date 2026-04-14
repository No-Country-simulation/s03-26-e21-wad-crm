import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, CheckSquare, LogOut, Briefcase, Settings, Mail, MessageCircle, Sun, Moon, Download } from 'lucide-react';
import { exportService } from '../services/api';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [showExportMenu, setShowExportMenu] = useState(false);

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
    { path: '/whatsapp', label: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
    { path: '/settings',           label: 'Settings',           icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>
      <aside className="w-64 flex flex-col" style={{ background: 'var(--color-bg-deep)', borderRight: '1px solid var(--color-border)' }}>
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <img
              src={theme === 'dark' ? '/Logo NEXO blanco.png' : '/Logo NEXO transparente.png'}
              alt="Nexo CRM"
              className="h-12"
            />
            <h1 className="text-xl font-bold" style={{ color: theme === 'dark' ? '#ffffff' : 'var(--color-accent)' }}>NEXO CRM</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowExportMenu(!showExportMenu)} className="p-1.5 rounded-lg transition-colors flex items-center gap-1" style={{ color: 'var(--color-muted)', background: 'var(--color-surface-2)' }} title="Export">
                <Download size={16} />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <button onClick={() => { exportService.exportContacts('csv'); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-opacity-80" style={{ color: 'var(--color-text)' }}>
                    Contacts (CSV)
                  </button>
                  <button onClick={() => { exportService.exportContacts('pdf'); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-opacity-80" style={{ color: 'var(--color-text)' }}>
                    Contacts (PDF)
                  </button>
                  <button onClick={() => { exportService.exportDeals(); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-opacity-80" style={{ color: 'var(--color-text)' }}>
                    Deals (CSV)
                  </button>
                  <button onClick={() => { exportService.exportTasks(); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-opacity-80" style={{ color: 'var(--color-text)' }}>
                    Tasks (CSV)
                  </button>
                </div>
              )}
            </div>
            <button onClick={toggleTheme} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--color-muted)', background: 'var(--color-surface-2)' }} title={theme === "dark" ? "Light mode" : "Dark mode"}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
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