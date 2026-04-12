import { useState } from 'react';
import { useAuthStore } from '../features/auth/store';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

type SettingsTab = 'profile' | 'integrations' | 'roles' | 'agents' | 'templates' | 'business';

export function Settings() {
  const { user, hasPermission } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: '👤', permission: null },
    { id: 'integrations', label: 'Integraciones', icon: '🔌', permission: 'settings:read' },
    { id: 'roles', label: 'Roles y Permisos', icon: '🔐', permission: 'settings:write' },
    { id: 'agents', label: 'Agentes', icon: '👥', permission: 'settings:read' },
    { id: 'templates', label: 'Plantillas', icon: '📝', permission: 'settings:write' },
    { id: 'business', label: 'Negocio', icon: '🏢', permission: 'settings:write' },
  ];

  const visibleTabs = tabs.filter(t => !t.permission || hasPermission(t.permission));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500">Administra tu cuenta y preferencias</p>
      </div>

      <div className="flex gap-6">
        <div className="w-56 shrink-0">
          <nav className="space-y-1">
            {visibleTabs.map(tab => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                className="w-full justify-start px-4 py-2.5 text-left"
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.label}
              </Button>
            ))}
          </nav>
        </div>

        <Card className="flex-1">
          <CardContent className="p-6">
            {activeTab === 'profile' && <ProfileSettings user={user} />}
            {activeTab === 'integrations' && hasPermission('settings:read') && <IntegrationSettings />}
            {activeTab === 'roles' && hasPermission('settings:write') && <RolesSettings />}
            {activeTab === 'agents' && <AgentsSettings />}
            {activeTab === 'templates' && hasPermission('settings:write') && <TemplatesSettings />}
            {activeTab === 'business' && hasPermission('settings:write') && <BusinessSettings />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfileSettings({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Mi Perfil</h2>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div>
          <p className="font-medium text-lg">{user?.name}</p>
          <p className="text-gray-500">{user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
            {user?.role}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <Input type="text" defaultValue={user?.name} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <Input type="email" defaultValue={user?.email} disabled />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <Input type="tel" placeholder="+54 9..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zona Horaria</label>
          <select className="w-full px-3 py-2 border rounded-lg">
            <option>America/Argentina/Buenos_Aires</option>
            <option>America/New_York</option>
            <option>Europe/Madrid</option>
          </select>
        </div>
      </div>
      <div className="pt-4 border-t">
        <h3 className="font-medium mb-3">Cambiar Contraseña</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input type="password" placeholder="Contraseña actual" />
          <Input type="password" placeholder="Nueva contraseña" />
        </div>
      </div>
      <Button>Guardar Cambios</Button>
    </div>
  );
}

function IntegrationSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Integraciones</h2>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <p className="font-medium">WhatsApp Business</p>
                <p className="text-sm text-gray-500">Conecta tu número de WhatsApp Business</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">Conectado</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input type="text" placeholder="Phone Number ID" />
            <Input type="text" placeholder="Access Token" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📧</span>
              <div>
                <p className="font-medium">Email (SMTP / Gmail)</p>
                <p className="text-sm text-gray-500">Configura el envío de emails</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">No configurado</span>
          </div>
          <select className="w-full px-3 py-2 border rounded-lg text-sm">
            <option>Seleccionar proveedor</option>
            <option>Gmail (OAuth)</option>
            <option>SMTP</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔗</span>
              <div>
                <p className="font-medium">Webhooks</p>
                <p className="text-sm text-gray-500">Recibe notificaciones en tiempo real</p>
              </div>
            </div>
            <Button variant="ghost" className="text-blue-600 text-sm">+ Agregar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RolesSettings() {
  const roles = [
    { name: 'ADMIN', users: 1, permissions: ['Todos'] },
    { name: 'MANAGER', users: 2, permissions: [' contacts:read/write', 'deals:read/write', 'tasks:read/write', 'analytics:read'] },
    { name: 'AGENT', users: 5, permissions: ['contacts:read', 'conversations:read/write', 'tasks:read/write'] },
    { name: 'VIEWER', users: 3, permissions: ['Solo lectura'] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Roles y Permisos</h2>
        <Button size="sm">+ Nuevo Rol</Button>
      </div>
      <div className="space-y-3">
        {roles.map(role => (
          <Card key={role.name}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{role.name}</p>
                  <p className="text-sm text-gray-500">{role.users} usuario(s)</p>
                </div>
                <div className="flex gap-2">
                  {role.permissions.map(p => (
                    <span key={p} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AgentsSettings() {
  const agents = [
    { name: 'Admin Nexo', email: 'admin@nexo.com', role: 'ADMIN', status: 'active' },
    { name: 'Juan Pérez', email: 'juan@nexo.com', role: 'AGENT', status: 'active' },
    { name: 'María García', email: 'maria@nexo.com', role: 'AGENT', status: 'active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Agentes</h2>
        <Button size="sm">+ Invitar Agente</Button>
      </div>
      <div className="space-y-3">
        {agents.map(agent => (
          <Card key={agent.email}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-gray-500">{agent.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{agent.role}</span>
                  <span className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TemplatesSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Plantillas</h2>
        <Button size="sm">+ Nueva Plantilla</Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📱</span>
              <span className="font-medium">WhatsApp</span>
            </div>
            <p className="text-sm text-gray-500">5 plantillas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📧</span>
              <span className="font-medium">Email</span>
            </div>
            <p className="text-sm text-gray-500">3 plantillas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BusinessSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Configuración del Negocio</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Negocio</label>
          <Input type="text" defaultValue="Nexo CRM" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color Principal</label>
          <Input type="color" defaultValue="#2563EB" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zona Horaria</label>
          <select className="w-full px-3 py-2 border rounded-lg">
            <option>America/Argentina/Buenos_Aires</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
          <select className="w-full px-3 py-2 border rounded-lg">
            <option>ARS - Peso Argentino</option>
            <option>USD - Dólar</option>
          </select>
        </div>
      </div>
      <Button>Guardar</Button>
    </div>
  );
}