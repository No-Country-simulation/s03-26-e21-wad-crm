import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useWhatsAppConfig } from '../hooks/useWhatsAppConfig'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export function WhatsAppConfigPage() {
  const { status, isLoading, error, fetchStatus, saveConfig, disconnect } = useWhatsAppConfig()
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [webhookVerifyToken, setWebhookVerifyToken] = useState('')
  const [appSecret, setAppSecret] = useState('')

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveConfig({
      phoneNumberId,
      accessToken,
      webhookVerifyToken,
      appSecret,
    })
  }

  const handleDisconnect = async () => {
    if (window.confirm('¿Estás seguro de desconectar WhatsApp?')) {
      await disconnect()
      setPhoneNumberId('')
      setAccessToken('')
      setWebhookVerifyToken('')
      setAppSecret('')
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
          <CardTitle className="text-base">Configuración de API</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone-number-id">Phone Number ID</Label>
                <Input
                  id="phone-number-id"
                  type="text"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="123456789012345"
                  disabled={status?.connected}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="access-token">Access Token</Label>
                <Input
                  id="access-token"
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="EAAxxxxxxxxxx"
                  disabled={status?.connected}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-verify-token">Webhook Verify Token</Label>
                <Input
                  id="webhook-verify-token"
                  type="text"
                  value={webhookVerifyToken}
                  onChange={(e) => setWebhookVerifyToken(e.target.value)}
                  placeholder="verify_token_123"
                  disabled={status?.connected}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-secret">App Secret</Label>
                <Input
                  id="app-secret"
                  type="password"
                  value={appSecret}
                  onChange={(e) => setAppSecret(e.target.value)}
                  placeholder="app_secret_xyz"
                  disabled={status?.connected}
                />
              </div>
            </div>

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
              <Button type="submit" disabled={isLoading || !phoneNumberId || !accessToken}>
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Guardar y Verificar'
                )}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}