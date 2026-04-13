import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTemplates } from '../hooks/useSettingsData'

export function TemplatesSettings() {
  const { templates } = useTemplates()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Plantillas</h2>
        <Button size="sm">+ Nueva Plantilla</Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {templates.map(template => (
          <Card key={template.type}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">
                  {template.type === 'whatsapp' ? '📱' : '📧'}
                </span>
                <span className="font-medium">
                  {template.type === 'whatsapp' ? 'WhatsApp' : 'Email'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {template.count}plantillas
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}