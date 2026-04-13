import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function WebhooksSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Webhooks</h2>
        <Button size="sm">+ Agregar Webhook</Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-4">
            Configura webhooks para recibir notificaciones en tiempo real sobre eventos del CRM.
          </p>
          <div className="text-center py-8 text-muted-foreground">
            No hay webhooks configurados
          </div>
        </CardContent>
      </Card>
    </div>
  )
}