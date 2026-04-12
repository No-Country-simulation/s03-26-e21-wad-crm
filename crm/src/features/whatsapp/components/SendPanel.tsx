import { Send, Globe, Server } from 'lucide-react'
import { useSendPanel } from '../hooks/useSendPanel'
import { countVariables } from '@/utils/helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface SendPanelProps {
  conversationId?: string | null
  config?: any
  templates?: any[]
  crmConfig?: any
}

function renderPreview(text: string): string {
  return text
    .replace(/\{\{\d+\}\}/g, (match) => `<span class="bg-primary/20 px-1 rounded">${match}</span>`)
}

export function SendPanel({ config, templates = [], crmConfig }: SendPanelProps) {
  const {
    phone,
    body,
    contactId,
    crmContacts,
    loadingContacts,
    mode,
    sendVia,
    selectedTemplateId,
    templateParams,
    result,
    selectedTpl,
    isLoading,
    setPhone,
    setBody,
    setContactId,
    setMode,
    setSendVia,
    setSelectedTemplateId,
    setTemplateParams,
    handleSend,
    loadCrmContacts,
  } = useSendPanel({ config, templates, crmConfig })

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="size-5 text-primary" />
            Enviar Mensaje
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Enviar vía</Label>
            <ToggleGroup type="single" value={sendVia} onValueChange={(v) => v && setSendVia(v as any)}>
              <ToggleGroupItem value="direct" className="flex-1">
                <Globe className="size-3.5 mr-2" />
                Directo a Meta
              </ToggleGroupItem>
              <ToggleGroupItem value="crm" className="flex-1">
                <Server className="size-3.5 mr-2" />
                Vía CRM Backend
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {sendVia === 'direct' ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">
                Teléfono destino <span className="text-muted-foreground">(E.164, sin +)</span>
              </Label>
              <Input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="5491155551234"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact">Contacto del CRM</Label>
              {loadingContacts ? (
                <p className="text-sm text-muted-foreground py-2">Cargando contactos...</p>
              ) : crmContacts.length === 0 ? (
                <div className="text-sm text-muted-foreground py-2">
                  No hay contactos en el CRM.{' '}
                  <Button
                    variant="link"
                    onClick={loadCrmContacts}
                    className="h-auto p-0"
                  >
                    Reintentar
                  </Button>
                </div>
              ) : (
                <Select value={contactId} onValueChange={setContactId}>
                  <SelectTrigger id="contact">
                    <SelectValue placeholder="— Seleccioná un contacto —" />
                  </SelectTrigger>
                  <SelectContent>
                    {crmContacts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.email || c.phone || 'sin email/teléfono'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-muted-foreground">Contactos cargados automáticamente del CRM</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label>Tipo de mensaje</Label>
            <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as any)}>
              <ToggleGroupItem value="text" className="flex-1">
                Texto Libre
              </ToggleGroupItem>
              <ToggleGroupItem value="template" className="flex-1">
                Template ({templates.length})
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {mode === 'text' ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Hola, este es un mensaje de prueba desde el CRM..."
                rows={4}
                maxLength={4096}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {body.length}/4096 caracteres
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="template">Template Guardado</Label>
                <Select
                  value={selectedTemplateId}
                  onValueChange={(v) => {
                    setSelectedTemplateId(v)
                    setTemplateParams('')
                  }}
                >
                  <SelectTrigger id="template">
                    <SelectValue placeholder="— Seleccioná un template —" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.category}) — {t.language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTpl && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="text-xs text-muted-foreground mb-2 font-semibold">
                      📋 Contenido del template:
                    </div>
                    {selectedTpl.components
                      .filter((c: any) => c.type === 'header')
                      .map((c: any, i: number) => (
                        <div
                          key={i}
                          className="text-xs text-muted-foreground font-medium mb-1 pb-1 border-b border-border"
                        >
                          {c.text}
                        </div>
                      ))}
                    {selectedTpl.components
                      .filter((c: any) => c.type === 'body')
                      .map((c: any, i: number) => (
                        <div
                          key={i}
                          className="text-sm text-foreground whitespace-pre-wrap mb-1"
                          dangerouslySetInnerHTML={{ __html: renderPreview(c.text || '') }}
                        />
                      ))}
                    {selectedTpl.components
                      .filter((c: any) => c.type === 'footer')
                      .map((c: any, i: number) => (
                        <div
                          key={i}
                          className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border"
                        >
                          {c.text}
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}

              {selectedTpl &&
                countVariables(selectedTpl.components.find((c: any) => c.type === 'body')?.text || '') >
                  0 && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="params">
                      Parámetros <span className="text-muted-foreground">(separados por coma)</span>
                    </Label>
                    <Input
                      id="params"
                      type="text"
                      value={templateParams}
                      onChange={(e) => setTemplateParams(e.target.value)}
                      placeholder="Juan, 12345, FedEx"
                    />
                  </div>
                )}

              {selectedTpl && templateParams && (
                <Card className="bg-primary/10 border-primary/30">
                  <CardContent className="pt-6">
                    <div className="text-xs text-primary mb-1 font-semibold">
                      ✨ Vista previa con parámetros:
                    </div>
                    {selectedTpl.components
                      .filter((c: any) => c.type === 'body')
                      .map((c: any, i: number) => {
                        let preview = c.text || ''
                        const params = templateParams
                          .split(',')
                          .map((p) => p.trim())
                          .filter(Boolean)
                        params.forEach((val, idx) => {
                          preview = preview.replace(
                            new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g'),
                            val
                          )
                        })
                        return (
                          <div key={i} className="text-sm text-foreground whitespace-pre-wrap">
                            {preview}
                          </div>
                        )
                      })}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <Button
            onClick={handleSend}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <Send className="size-4 mr-2" />
            {isLoading ? 'Enviando...' : `Enviar ${sendVia === 'crm' ? 'vía CRM' : ''}`}
          </Button>

          {result && (
            <Alert variant={result.ok ? 'default' : 'destructive'}>
              <AlertDescription>
                <div className="font-medium mb-1">{result.msg}</div>
                {result.data && (
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SendPanel
