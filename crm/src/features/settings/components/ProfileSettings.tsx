import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useProfile } from '../hooks/useSettingsData'
import { MOCK_TIMEZONES } from '../mocks'

interface ProfileSettingsProps {
  user: {
    name: string
    email: string
    role: string
  }
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const { updateProfile, changePassword } = useProfile()

  const handleSave = () => {
    updateProfile({ name: user.name })
  }

  const handlePasswordChange = () => {
    changePassword('', '')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Mi Perfil</h2>
      
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div>
          <p className="font-medium text-lg">{user?.name}</p>
          <p className="text-muted-foreground">{user?.email}</p>
          <Badge variant="secondary" className="mt-1">
            {user?.role}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" type="text" defaultValue={user?.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" defaultValue={user?.email} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" type="tel" placeholder="+54 9..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Zona Horaria</Label>
          <Select defaultValue="America/Argentina/Buenos_Aires">
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar zona horaria" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_TIMEZONES.map(tz => (
                <SelectItem key={tz} value={tz}>{tz}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="font-medium mb-3">Cambiar Contraseña</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Contraseña actual</Label>
            <Input id="current-password" type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva contraseña</Label>
            <Input id="new-password" type="password" placeholder="••••••••" />
          </div>
        </div>
      </div>

      <Button onClick={handleSave}>Guardar Cambios</Button>
    </div>
  )
}