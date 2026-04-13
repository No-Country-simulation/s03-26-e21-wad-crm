import { useAuthStore } from '@/features/auth/store'
import { Card, CardContent } from '@/components/ui/card'
import { useSettings } from '@/contexts/SettingsContext'
import { ProfileSettings } from '../components/ProfileSettings'
import { WebhooksSettings } from '../components/WebhooksSettings'
import { RolesSettings } from '../components/RolesSettings'
import { AgentsSettings } from '../components/AgentsSettings'
import { TemplatesSettings } from '../components/TemplatesSettings'
import { BusinessSettings } from '../components/BusinessSettings'
import { WhatsAppConfigPage } from '@/features/whatsapp/config/components/WhatsAppConfigPage'
import { EmailConfigPage } from '@/features/email/components/EmailConfigPage'

export function SettingsPage() {
  const { user, hasPermission } = useAuthStore()
  const { activeSection } = useSettings()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Administra tu cuenta y preferencias</p>
      </div>

      <Card>
        <CardContent className="p-6">
          {activeSection === 'profile' && <ProfileSettings user={user} />}
          {activeSection === 'whatsapp-config' && hasPermission('settings:read') && <WhatsAppConfigPage />}
          {activeSection === 'email-config' && hasPermission('settings:read') && <EmailConfigPage />}
          {activeSection === 'webhooks' && hasPermission('settings:read') && <WebhooksSettings />}
          {activeSection === 'roles' && hasPermission('settings:write') && <RolesSettings />}
          {activeSection === 'agents' && <AgentsSettings />}
          {activeSection === 'templates' && hasPermission('settings:write') && <TemplatesSettings />}
          {activeSection === 'business' && hasPermission('settings:write') && <BusinessSettings />}
        </CardContent>
      </Card>
    </div>
  )
}