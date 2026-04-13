import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRoles } from '../hooks/useSettingsData'

export function RolesSettings() {
  const { roles } = useRoles()

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
                  <p className="text-sm text-muted-foreground">{role.users} usuario(s)</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {role.permissions.map(p => (
                    <Badge key={p} variant="outline" className="text-xs">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}