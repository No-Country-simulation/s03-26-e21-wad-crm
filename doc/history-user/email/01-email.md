# HU-050: Configurar Email (SMTP)

**Módulo**: Email  
**Prioridad**: Alta  
**Como**: administrador  
**Quiero**: configurar el servidor de email  
**Para**: poder enviar correos desde el CRM

## Criterios de Aceptación

- [ ] Sección "Integraciones" en settings
- [ ] Formulario de configuración SMTP
- [ ] Campos: host, puerto, usuario, contraseña, encryption (SSL/TLS)
- [ ] Botón "Probar Conexión"
- [ ] Guardar credenciales encriptadas
- [ ] Estado de conexión visible

---

# HU-051: Configurar Email con Gmail API

**Módulo**: Email  
**Prioridad**: Alta  
**Como**: administrador  
**Quiero**: conectar mi cuenta de Gmail  
**Para**: enviar emails con mi dominio

## Criterios de Aceptación

- [ ] Opción "Conectar con Google"
- [ ] OAuth flow para permisos de Gmail (send)
- [ ] Refresh token automático
- [ ] Mostrar email conectado
- [ ] Opción de desconectar

---

# HU-052: Enviar Email desde el CRM

**Módulo**: Email  
**Prioridad**: Alta  
**Como**: vendedor  
**Quiero**: enviar un email a un contacto  
**Para**: comunicarme formalmente con mis leads

## Criterios de Aceptación

- [ ] Botón "Enviar Email" en detalle de contacto
- [ ] Editor de email con: To, CC, BCC, asunto, cuerpo
- [ ] Autocomplete de contactos en To/CC
- [ ] Adjuntar archivos (drag & drop)
- [ ] Selector de plantilla
- [ ] Preview antes de enviar
- [ ] Envío asíncrono (mostrar estado)

---

# HU-053: Recibir Reply de Email

**Módulo**: Email  
**Prioridad**: Alta  
**Como**: usuario  
**Quiero**: ver las respuestas de mis emails  
**Para**: continuar la conversación

## Criterios de Aceptación

- [ ] Webhook de Gmail/SMTP recibe replies
- [ ] Se vincula al thread original
- [ ] Aparece en conversación del contacto
- [ ] Notificación de nuevo email
- [ ] Soporte para threads (replies encadenados)

---

# HU-054: Crear Plantilla de Email

**Módulo**: Email  
**Prioridad**: Media  
**Como**: administrador  
**Quiero**: crear plantillas de email  
**Para**: enviar emails profesionales rápidamente

## Criterios de Aceptación

- [ ] Biblioteca de plantillas en sección de email
- [ ] Editor visual (o HTML)
- [ ] Variables: {{contact_name}}, {{company_name}}, {{custom_field}}
- [ ] Preview con datos de ejemplo
- [ ] Categorías: bienvenida, seguimiento, propuesta, cierre
- [ ] Crear, editar, eliminar plantillas

---

# HU-055: Tracking de Apertura (Opens)

**Módulo**: Email  
**Prioridad**: Media  
**Como**: vendedor  
**Quiero**: saber si mi email fue abierto  
**Para**: hacer seguimiento inteligente

## Criterios de Aceptación

- [ ] Pixel invisible en emails enviados
- [ ] Registro de apertura: fecha, ubicación (aproximada)
- [ ] Badge en conversación: "Abierto"
- [ ] Cantidad de veces abierto
- [ ] Primera apertura como "engagement"

---

# HU-056: Tracking de Clicks

**Módulo**: Email  
**Prioridad**: Media  
**Como**: vendedor  
**Quiero**: saber si hicieron click en mis links  
**Para**: medir interés del lead

## Criterios de Aceptación

- [ ] Links shorteneados y trackeados automáticamente
- [ ] Registro de click: fecha, URL original
- [ ] Badge en conversación: "Hizo click"
- [ ] Cuántos clicks, en qué links
- [ ] Click = engagement de alta intensidad

---

# HU-057: Adjuntar Archivo a Email

**Módulo**: Email  
**Prioridad**: Media  
**Como**: vendedor  
**Quiero**: enviar archivos adjuntos  
**Para**: compartir documentos con el cliente

## Criterios de Aceptación

- [ ] Drag & drop de archivos
- [ ] Botón de adjuntar
- [ ] Límite de tamaño (ej: 25MB)
- [ ] Tipos de archivo permitidos
- [ ] Upload a storage (S3/Cloud) antes de enviar

---

# HU-058: Email Masivo (Campañas)

**Módulo**: Email  
**Prioridad**: Baja  
**Como**: manager  
**Quiero**: enviar un email a múltiples contactos  
**Para**: hacer campañas de nurture

## Criterios de Aceptación

- [ ] Seleccionar lista de contactos o segmento
- [ ] Seleccionar plantilla
- [ ] Preview de cuántos recipientos
- [ ] Programar envío o enviar inmediatamente
- [ ] Rate limiting para no saturar SMTP
- [ ] Reporte post-envío: enviados, abiertos, clicks
