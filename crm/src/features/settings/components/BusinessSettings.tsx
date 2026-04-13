import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBusinessSettings } from '../hooks/useSettingsData'
import { MOCK_TIMEZONES, MOCK_CURRENCIES } from '../mocks'

export function BusinessSettings() {
  const { settings, updateSettings } = useBusinessSettings()

  const handleSave = () => {
    updateSettings(settings)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Configuración del Negocio</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="business-name">Nombre del Negocio</Label>
          <Input 
            id="business-name" 
            type="text" 
            defaultValue={settings.name}
            onChange={(e) => updateSettings({ name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="primary-color">Color Principal</Label>
          <Input 
            id="primary-color" 
            type="color" 
            defaultValue={settings.primaryColor}
            className="h-10"
            onChange={(e) => updateSettings({ primaryColor: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="business-timezone">Zona Horaria</Label>
          <Select 
            defaultValue={settings.timezone}
            onValueChange={(value) => updateSettings({ timezone: value })}
          >
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
        <div className="space-y-2">
          <Label htmlFor="currency">Moneda</Label>
          <Select 
            defaultValue={settings.currency}
            onValueChange={(value) => updateSettings({ currency: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar moneda" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_CURRENCIES.map(curr => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.code} - {curr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button onClick={handleSave}>Guardar</Button>
    </div>
  )
}