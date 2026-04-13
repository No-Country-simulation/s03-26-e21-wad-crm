import { useEffect } from 'react'
import { Settings, Trash2, Loader2, CheckCircle2, XCircle, Plug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useWhatsAppConfig } from '../hooks/useWhatsAppConfig'
import { WHATSAPP_CONFIG_FIELDS } from '../constants'

export function WhatsAppConfigPage() {
  const {
    config,
    status,
    isLoading,
    error,
    testResult,
    fetchStatus,
    testConnection,
    saveConfig,
    disconnect,
    updateConfig,
    resetConfig,
  } = useWhatsAppConfig()

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveConfig()
  }

  const handleDisconnect = async () => {
    if (window.confirm('¿Estás seguro de desconectar WhatsApp?')) {
      await disconnect()
    }
  }

  const handleClear = () => {
    if (window.confirm('¿Estás seguro de limpiar la configuración?')) {
      resetConfig()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📱</span>
          <div>
            <h2 className="text-lg font-semibold">WhatsApp Business API</h2>
            <p className="text-sm text-muted-foreground">
              Conecta tu número de WhatsApp Business
            </p>
          </div>
        </div>
        {status?.connected && (
          <Badge className="bg-green-600/20 text-green-600 dark:text-green-400 border border-green-600/50">
            <CheckCircle2 className="size-4 mr-1" />
            Conectado
          </Badge>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="size-4" />
            Configuración de API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {WHATSAPP_CONFIG_FIELDS.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Input
                  id={field.key}
                  type={field.type}
                  value={config[field.key] ?? ''}
                  onChange={(e) => updateConfig({ [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  disabled={status?.connected}
                />
              </div>
            ))}

            {testResult && (
              <Alert variant={testResult.ok ? 'default' : 'destructive'}>
                <AlertDescription>{testResult.msg}</AlertDescription>
              </Alert>
            )}

            {status?.connected ? (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Conectado el {new Date(status.connectedAt || '').toLocaleDateString()}
                  </p>
                  {status.phoneNumberId && (
                    <p className="text-xs text-muted-foreground">
                      Phone ID: {status.phoneNumberId}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Desconectando...
                    </>
                  ) : (
                    <>
                      <XCircle className="size-4 mr-2" />
                      Desconectar
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex gap-3 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  onClick={testConnection}
                  disabled={isLoading || !config.phoneNumberId || !config.accessToken}
                >
                  {isLoading ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Plug className="size-4 mr-2" />
                  )}
                  Probar Conexión
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Configuración'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClear}
                  title="Limpiar configuración"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}