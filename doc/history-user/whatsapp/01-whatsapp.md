# HU-040: Conectar WhatsApp (Configuración)

**Módulo**: WhatsApp  
**Prioridad**: Alta  
**Como**: administrador  
**Quiero**: conectar mi número de WhatsApp Business  
**Para**: comenzar a usar el canal de mensajería

## Criterios de Aceptación

- [ ] Sección "Integraciones" en settings
- [ ] Botón "Conectar WhatsApp"
- [ ] Formulario para ingresar: Phone Number ID, Access Token, Webhook Verify Token
- [ ] Botón de "Verificar Conexión"
- [ ] Estado de conexión visible (conectado/desconectado)
- [ ] Si está desconectado, mostar guía de configuración de Meta

---

# HU-041: Recibir Mensaje de WhatsApp

**Módulo**: WhatsApp  
**Prioridad**: Alta  
**Como**: usuario  
**Quiero**: recibir mensajes de WhatsApp en el CRM  
**Para**: gestionar conversaciones desde un solo lugar

## Criterios de Aceptación

- [ ] Webhook recibe mensajes de Meta Cloud API
- [ ] Se identifica contacto por teléfono
- [ ] Si contacto no existe, se crea automáticamente
- [ ] Mensaje aparece en conversación del contacto
- [ ] Notificación en tiempo real (si el usuario está online)
- [ ] Se registra: mensaje, timestamp, dirección (entrante/saliente), status

---

# HU-042: Enviar Mensaje de WhatsApp

**Módulo**: WhatsApp  
**Prioridad**: Alta  
**Como**: vendedor  
**Quiero**: enviar un mensaje de WhatsApp a un contacto  
**Para**: comunicarme con mis leads y clientes

## Criterios de Aceptación

- [ ] Botón "Enviar WhatsApp" en detalle de contacto
- [ ] Input de texto para mensaje
- [ ] Selector de plantilla si es mensaje outbound inicial
- [ ] Envío vía Meta Cloud API
- [ ] Status: sending → sent → delivered → read
- [ ] Mensaje aparece en conversación
- [ ] Si falla, mostrar error y opción de reintentar

---

# HU-043: Ver Historial de Conversación

**Módulo**: WhatsApp  
**Prioridad**: Alta  
**Como**: usuario  
**Quiero**: ver el historial completo de mensajes  
**Para**: entender el contexto de la conversación

## Criterios de Aceptación

- [ ] Timeline de mensajes en detalle de contacto
- [ ] Diferenciación visual: entrante (izquierda) vs saliente (derecha)
- [ ] Timestamps legibles
- [ ] Estados de mensaje visibles (✓, ✓✓, 📖)
- [ ] Scroll infinito para históricos largos

---

# HU-044: Crear Plantilla de WhatsApp

**Módulo**: WhatsApp  
**Prioridad**: Media  
**Como**: administrador  
**Quiero**: crear plantillas de mensaje  
**Para**: enviar mensajes predefinidos rápidamente

## Criterios de Aceptación

- [ ] Biblioteca de plantillas en sección de WhatsApp
- [ ] Editor de plantilla con variables {{nombre}}, {{empresa}}, etc.
- [ ] Preview del mensaje final
- [ ] Requiere aprobación de Meta para usar (mostrar estado)
- [ ] Categorías: marketing, utility, authentication

---

# HU-045: Notificación de Nuevo Mensaje

**Módulo**: WhatsApp  
**Prioridad**: Media  
**Como**: usuario  
**Quiero**: recibir notificación cuando llega un mensaje  
**Para**: responder rápidamente

## Criterios de Aceptación

- [ ] Notificación push en navegador (si está online)
- [ ] Badge en icono de conversaciones
- [ ] Toast notification
- [ ] Sonido de notificación (opcional, configurable)

---

# HU-046: Estado de Lectura de Mensaje

**Módulo**: WhatsApp  
**Prioridad**: Baja  
**Como**: usuario  
**Quiero**: saber si el cliente leyó mi mensaje  
**Para**: saber cuándo hacer seguimiento

## Criterios de Aceptación

- [ ] Indicadores de status: sent (✓), delivered (✓✓), read (💙 o azul)
- [ ] Timestamp de lectura si está disponible
- [ ] Actualización en tiempo real del status
