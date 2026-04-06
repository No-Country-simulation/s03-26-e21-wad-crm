import { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, DollarSign, TrendingUp, Activity, MessageCircle, Mail } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadStats();
  }, []);

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-600">Dashboard</h1>

      
      <div className="mb-4 text-gray-600">
        Welcome back, {user?.name}!
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Contacts"
          value={stats?.activeContacts || 0}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Active Deals"
          value={stats?.activeDeals || 0}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Pipeline Value"
          value={`$${(stats?.pipelineValue || 0).toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Conversion Rate"
          value={`${((stats?.conversionRate || 0) * 100).toFixed(1)}%`}
          icon={<Activity className="w-6 h-6" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="text-green-600" size={20} />
            Canales de Comunicación
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <ChannelCard 
              title="WhatsApp" 
              description="Configura tu conexión de WhatsApp Business"
              icon={<MessageCircle className="w-8 h-8" />}
              color="green"
              href="/settings"
            />
            <ChannelCard 
              title="Email" 
              description="Configura SMTP o Gmail OAuth"
              icon={<Mail className="w-8 h-8" />}
              color="blue"
              href="/settings"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <QuickAction href="/contacts" label="Add Contact" color="blue" />
            <QuickAction href="/deals" label="Create Deal" color="green" />
            <QuickAction href="/tasks" label="Create Task" color="purple" />
            <QuickAction href="/email-templates" label="Email Templates" color="orange" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChannelCard({ title, description, icon, color, href }) {
  const colors = {
    green: 'border-green-200 hover:border-green-400',
    blue: 'border-blue-200 hover:border-blue-400',
  };
  const iconColors = {
    green: 'text-green-600 bg-green-100',
    blue: 'text-blue-600 bg-blue-100',
  };

  return (
    <a 
      href={href}
      className={`p-4 border rounded-lg transition ${colors[color]}`}
    >
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 ${iconColors[color]}`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </a>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, label, color }) {
  const colors = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
  };

  return (
    <a
      href={href}
      className={`${colors[color]} text-white text-center py-3 px-4 rounded-lg transition`}
    >
      {label}
    </a>
  );
}
