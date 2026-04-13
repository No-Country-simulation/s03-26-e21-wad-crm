import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useEmailConfig } from '../hooks/useEmailConfig'
import { CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react'

export function EmailConfigPage() {
  const { status, isLoading, error, fetchStatus, saveSmtpConfig, startGmailOAuth, disconnect } = useEmailConfig()
  const [provider, setProvider] = useState<'SMTP' | 'GMAIL'>('SMTP')
  const [host, setHost] = useState('')
  const [port, setPort] = useState('587')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [encryption, setEncryption] = useState<'NONE' | 'TLS' | 'SSL'>('TLS')

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveSmtpConfig({
      host,
      port: parseInt(port, 10),
      username,
      password,
      encryption,
    })
  }

  const handleGmailConnect = async () => {
    const authUrl = await startGmailOAuth()
    if (authUrl) {
      window.open(authUrl, '_blank')
    }
  }

  const handleDisconnect = async () => {
    if (window.confirm('¿Estás seguro de desconectar el email?')) {
      await disconnect()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📧</span>
          <div>
            <h2 className="text-lg font-semibold">Email (SMTP / Gmail)</h2>
            <p className="text-sm text-muted-foreground">
              Configura el envío de emails
            </p>
          </div>
        </div>
        {status?.connected && (
          <Badge className="bg-green-600/20 text-green-600 dark:text-green-400 border border-green-600/50">
            <CheckCircle2 className="size-4 mr-1" />
            {status.type} Conectado
          </Badge>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!status?.connected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Seleccionar Proveedor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant={provider === 'SMTP' ? 'default' : 'outline'}
                onClick={() => setProvider('SMTP')}
              >
                SMTP
              </Button>
              <Button
                variant={provider === 'GMAIL' ? 'default' : 'outline'}
                onClick={() => setProvider('GMAIL')}
              >
                Gmail (OAuth)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {provider === 'SMTP' && !status?.connected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuración SMTP</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Host</label>
                  <Input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Puerto</label>
                  <Input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Usuario</label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="usuario@dominio.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contraseña</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Encriptación</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  value={encryption}
                  onChange={(e) => setEncryption(e.target.value as 'NONE' | 'TLS' | 'SSL')}
                >
                  <option value="TLS">TLS (Recomendado)</option>
                  <option value="SSL">SSL</option>
                  <option value="NONE">Sin encriptación</option>
                </select>
              </div>

              <Button type="submit" disabled={isLoading || !host || !username || !password}>
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Probando conexión...
                  </>
                ) : (
                  'Guardar y Probar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {provider === 'GMAIL' && !status?.connected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conectar con Gmail</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Se abrirá una ventana para autorizar el acceso a tu cuenta de Gmail.
            </p>
            <Button onClick={handleGmailConnect} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <ExternalLink className="size-4 mr-2" />
                  Conectar con Gmail
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {status?.connected && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{status.type} Conectado</p>
                <p className="text-sm text-muted-foreground">{status.identifier}</p>
              </div>
              <Button variant="destructive" onClick={handleDisconnect} disabled={isLoading}>
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}