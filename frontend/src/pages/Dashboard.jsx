import { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, DollarSign, TrendingUp, Activity, MessageCircle, Mail } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const response = await dashboardService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--color-bg)' }}>
        <div className="text-lg" style={{ color: 'var(--color-muted)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-accent)' }}>Dashboard</h1>
      <div className="mb-6" style={{ color: 'var(--color-muted)' }}>Welcome back, {user?.name}!</div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Contacts" value={stats?.activeContacts || 0} icon={<Users className="w-6 h-6" />} color="#7c3aed" />
        <StatCard title="Active Deals" value={stats?.activeDeals || 0} icon={<DollarSign className="w-6 h-6" />} color="#2563eb" />
        <StatCard title="Pipeline Value" value={`$${(stats?.pipelineValue || 0).toLocaleString()}`} icon={<TrendingUp className="w-6 h-6" />} color="#a855f7" />
        <StatCard title="Conversion Rate" value={`${((stats?.conversionRate || 0) * 100).toFixed(1)}%`} icon={<Activity className="w-6 h-6" />} color="#3b82f6" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="rounded-xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <MessageCircle size={20} style={{ color: '#25D366' }} />
            Canales de Comunicación
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <ChannelCard title="WhatsApp" description="Configura WhatsApp Business" icon={<MessageCircle className="w-8 h-8" />} color="#25D366" href="/settings" />
            <ChannelCard title="Email" description="Configura SMTP o Gmail" icon={<Mail className="w-8 h-8" />} color="#EA4335" href="/settings" />
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <QuickAction href="/contacts" label="Add Contact" />
            <QuickAction href="/deals" label="Create Deal" />
            <QuickAction href="/tasks" label="Create Task" />
            <QuickAction href="/email-templates" label="Email Templates" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{title}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--color-text)' }}>{value}</p>
        </div>
        <div className="p-3 rounded-full" style={{ background: color + '33', color }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ChannelCard({ title, description, icon, color, href }) {
  return (
    <a href={href} className="p-4 rounded-lg transition-opacity hover:opacity-80" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2" style={{ background: color + '33', color }}>
        {icon}
      </div>
      <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h3>
      <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>{description}</p>
    </a>
  );
}

function QuickAction({ href, label }) {
  return (
    <a href={href} className="text-center py-3 px-4 rounded-lg font-medium transition-opacity hover:opacity-80" style={{ background: 'var(--color-primary)', color: '#fff' }}>
      {label}
    </a>
  );
}
