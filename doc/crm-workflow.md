# NEXO CRM - Flujo de Trabajo del Cliente

## Resumen Ejecutivo

Este documento describe el flujo completo de servicios que NEXO CRM ofrece al usuario para la gestión de clientes y empresas, desde el primer contacto hasta el cierre de la venta.

---

## 1. Flujo General del Cliente

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CICLO DE VIDA DEL CLIENTE                           │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
    │ NUEVO    │────▶│ EN      │────▶│ CALIF.   │────▶│ PROPUESTA│────▶│ GANADO   │
    │ CONTACTO │     │ PROCESO │     │ LEAD     │     │ /NEGOC.  │     │ /PERDIDO │
    └──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
         │                                                               │
         │                                                               │
         ▼                                                               ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                         CANALES DE COMUNICACIÓN                         │
    │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────────────┐  │
    │  │WhatsApp │  │  Email  │  │ Tareas  │  │ Conversaciones Unificadas│  │
    │  └─────────┘  └─────────┘  └─────────┘  └─────────────────────────┘  │
    └─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Módulo de Contactos

### 2.1 Creación de Contacto

```
┌─────────────────────────────────────────────────────────────────┐
│                    CREAR NUEVO CONTACTO                           │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
  │ Datos Básicos│────▶│ Datos Extra  │────▶│ Validación        │
  │              │     │              │     │                  │
  │ • Nombre     │     │ • Empresa    │     │ • Email único    │
  │ • Email      │     │ • Teléfono   │     │ • Teléfono único │
  │ • Teléfono   │     │ • Cargo      │     │ • Workspace      │
  │ • Empresa    │     │ • Notas      │     │   verificado     │
  └──────────────┘     └──────────────┘     └──────────────────┘
         │                                           │
         │                                           ▼
         │              ┌──────────────────────────────────┐
         │              │       CONTACTO CREADO            │
         │              │  Status: NUEVO                    │
         │              │  Canal: Manual / WhatsApp / Email  │
         └─────────────▶└──────────────────────────────────┘
```

### 2.2 Estados del Contacto

| Estado | Descripción | Color UI | Trigger |
|--------|-------------|----------|---------|
| `NUEVO` | Primer contacto | 🔵 Azul | Creación manual o inbound |
| `EN_PROCESO` | Contacto activo | 🟡 Amarillo | Asignado a usuario |
| `CALIFICADO` | Lead cualificado | 🟠 Naranja | Cumple criterios |
| `OPORTUNIDAD` | Potencial de venta | 🟣 Morado | Creado Deal |
| `CLIENTE` | Cliente ganado | 🟢 Verde | Deal ganado |
| `INACTIVO` | Sin contacto reciente | ⚫ Gris | 30 días sin interacción |
| `ELIMINADO` | Soft delete | ❌ Rojo | Usuario elimina |

### 2.3 Flujo de Estados

```
  NUEVO ──▶ EN_PROCESO ──▶ CALIFICADO ──▶ OPORTUNIDAD ──▶ CLIENTE
    │           │              │              │              │
    │           │              │              │              │
    ▼           ▼              ▼              ▼              ▼
  INACTIVO ←──┴───────────────┴──────────────┴──▶ PERDIDO
```

---

## 3. Módulo de Empresas

### 3.1 Gestión de Empresas

```
┌─────────────────────────────────────────────────────────────────┐
│                      GESTIÓN DE EMPRESAS                         │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
  │ Datos Empresa│────▶│ Contactos   │────▶│ Deals/Pipelines  │
  │              │     │              │     │                  │
  │ • Nombre     │     │ • 1:N       │     │ • Múltiples      │
  │ • RUC/DNI   │     │   contactos │     │   pipelines      │
  │ • Dirección │     │ • Links     │     │ • Etapas        │
  │ • Industry   │     │   únicos    │     │ • Valor $       │
  └──────────────┘     └──────────────┘     └──────────────────┘
         │
         ▼
  ┌──────────────────────────────────────────────────────────┐
  │                    RELACIONES                              │
  │   Empresa ────1:N───▶ Contactos                            │
  │     │                                                       │
  │     └───1:N───▶ Deals (Ofertas)                           │
  │     │                                                       │
  │     └───1:N───▶ Conversaciones                             │
  └──────────────────────────────────────────────────────────┘
```

---

## 4. Módulo de Deals (Ofertas/Pipeline)

### 4.1 Pipeline de Ventas

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PIPELINE DE VENTAS                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  NUEVO   │──▶│ CALIFIC. │──▶│PROPUESTA │──▶│NEGOCIAC.│──▶│  GANADO  │
├──────────┤   ├──────────┤   ├──────────┤   ├──────────┤   ├──────────┤
│          │   │          │   │          │   │          │   │          │
│ Valor:   │   │ Valor:   │   │ Valor:   │   │ Valor:   │   │ Valor:   │
│ $0       │   │ $X       │   │ $Y       │   │ $Z       │   │ $W       │
│          │   │          │   │          │   │          │   │          │
│ Win%: 0% │   │ Win%: 20%│   │ Win%: 50%│   │ Win%: 75%│   │ Win%:100%│
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                                                        │
                                                        ▼
                                                   ┌──────────┐
                                                   │  PERDIDO │
                                                   ├──────────┤
                                                   │          │
                                                   │ Valor:   │
                                                   │ -$Z      │
                                                   │          │
                                                   │ Win%: 0% │
                                                   └──────────┘
```

### 4.2 Cálculo de Valor Ponderado

```
Pipeline Value = Σ (Stage_Value × Win_Probability)

Ejemplo:
  Calificado:     $10,000 × 20% = $2,000
  Propuesta:      $15,000 × 50% = $7,500
  Negociación:    $20,000 × 75% = $15,000
  ────────────────────────────────────────
  Total Ponderado:                  = $24,500
```

---

## 5. Módulo de Tareas

### 5.1 Tipos de Tareas

| Tipo | Descripción | Color | Ejemplo |
|------|-------------|-------|---------|
| `LLAMADA` | Seguimiento telefónico | 📞 Verde | "Llamar a Juan" |
| `EMAIL` | Envío de correos | 📧 Azul | "Enviar propuesta" |
| `REUNION` | Reunión programada | 📅 Naranja | "Reunión con cliente" |
| `WHATSAPP` | Mensaje por WhatsApp | 💬 Verde | "Enviar info por WA" |
| `TAREA` | Tarea general | 📋 Gris | "Preparar cotización" |

### 5.2 Flujo de Tareas

```
┌─────────────────────────────────────────────────────────────────┐
│                       FLUJO DE TAREAS                           │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
  │  CREAR TAREA │────▶│  PENDIENTE   │────▶│    VENCIDA       │
  │              │     │              │     │                  │
  │ • Título     │     │ • Fecha      │     │ • Fecha < hoy   │
  │ • Tipo       │     │   límite    │     │ • Sin completar  │
  │ • Contacto   │     │ • Prioridad │     │                  │
  │ • Fecha      │     │ • Asignado  │     │                  │
  │ • Prioridad  │     │              │     │                  │
  └──────────────┘     └──────────────┘     └──────────────────┘
                              │
                              ▼
                         ┌──────────────┐
                         │  COMPLETADA   │
                         │              │
                         │ ✓ Marcar     │
                         │   como done  │
                         └──────────────┘
```

### 5.3 Prioridades

| Prioridad | Indicador | SLA |
|-----------|-----------|-----|
| `URGENTE` | 🔴 Rojo | 1 día |
| `ALTA` | 🟠 Naranja | 3 días |
| `MEDIA` | 🟡 Amarillo | 7 días |
| `BAJA` | 🟢 Verde | 14 días |

---

## 6. Módulo de WhatsApp

### 6.1 Integración WhatsApp Business API

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUJO WHATSAPP CRM                                    │
└─────────────────────────────────────────────────────────────────────────┘

     ┌──────────────────────────────────────────────────────────────────┐
     │                      WEBHOOK ENTRANTE                             │
     └──────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
     ┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐
     │ WhatsApp     │────▶│ NEXO CRM     │────▶│ Identificar          │
     │ Cloud API    │     │ Webhook      │     │ Contacto             │
     │              │     │              │     │                      │
     │ • Mensajes   │     │ • Validar    │     │ • Por teléfono      │
     │ • Status    │     │   webhook    │     │ • Por nombre        │
     │ • Media     │     │ • Parse msg  │     │ • Crear nuevo       │
     └──────────────┘     └──────────────┘     └──────────────────────┘
                                                             │
                                                             ▼
     ┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐
     │ Contacto     │◀────│ Conversación │◀────│ Mensaje guardado     │
     │ actualizado  │     │ actualizada  │     │ en BD               │
     │              │     │              │     │                      │
     │ • Ult. msg   │     │ • Nuevo msg  │     │ • Body              │
     │ • Estado    │     │ • Timestamp  │     │ • Sender            │
     └──────────────┘     └──────────────┘     │ • Timestamp        │
                                                 └──────────────────────┘
```

### 6.2 Estados de Conversación WhatsApp

| Estado | Descripción | Aplica a |
|--------|-------------|----------|
| `OPEN` | Conversación activa | Ambos |
| `CLOSED` | Conversación cerrada | Ambos |
| `ARCHIVED` | Archivado | Ambos |
| `LOCKED` | Bloqueado por agente | Multi-agente |

### 6.3 Multi-Agente (Locking)

```
┌─────────────────────────────────────────────────────────────────┐
│                    BLOQUEO DE CONVERSACIÓN                       │
└─────────────────────────────────────────────────────────────────┘

  Agente 1                Agente 2               Sistema
      │                       │                      │
      ▼                       │                      │
  ┌───────────┐               │                      │
  │ LOCK      │               │                      │
  │ /wa/123   │               │                      │
  └─────┬─────┘               │                      │
        │                     │                      │
        ▼                     ▼                      │
   Conversación          ¿Intenta                    │
   bloqueada             lock?                       │
        │                  │                          │
        │                   ▼                          │
        │              ┌──────────────────┐            │
        │              │ DENEGADO         │            │
        │              │ Ya está bloqueada│            │
        │              │ por Agente 1     │            │
        │              └──────────────────┘            │
        │                                               │
        ▼                                               │
   ┌──────────────────┐                                 │
   │ UNLOCK           │                                 │
   │ Disponible para   │                                 │
   │ otro agente      │                                 │
   └──────────────────┘                                 │
                                                         │
                              ┌─────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Auto-unlock      │
                    │ después de X min │
                    │ sin actividad    │
                    └──────────────────┘
```

---

## 7. Módulo de Email

### 7.1 Flujo de Email

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       FLUJO DE EMAIL CRM                                │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────┐
  │                         ENVÍO DE EMAIL                                 │
  └──────────────────────────────────────────────────────────────────────┘

  Usuario                CRM                      SMTP
     │                    │                        │
     ▼                    ▼                        │
  ┌───────────┐    ┌───────────┐                 │
  │ Redactar  │───▶│ Seleccionar│                 │
  │ Email     │    │ Plantilla │                 │
  │           │    │ (opcional)│                 │
  └─────┬─────┘    └─────┬─────┘                 │
        │                │                        │
        ▼                ▼                        │
   ┌───────────┐    ┌───────────┐                 │
   │ Template  │    │ Resolver  │                 │
   │ Variables │    │ {{name}}  │                 │
   └─────┬─────┘    └─────┬─────┘                 │
         │                │                        │
         │                ▼                        │
         │           ┌───────────┐                 │
         │           │ Enviar    │────────────────▶│
         │           │ via SMTP │                 │
         │           └─────┬─────┘                 │
         │                 │                        │
         │                 ▼                        │
         │           ┌───────────┐                 │
         │           │ Guardar   │                 │
         │           │ en BD     │                 │
         │           └───────────┘                 │
         │                                         │
         ▼                                         ▼
   ┌───────────┐                            ┌───────────┐
   │ Convers.  │                            │ Contacto  │
   │ updated  │                            │ actualizado│
   └───────────┘                            └───────────┘


  ┌──────────────────────────────────────────────────────────────────────┐
  │                       RECEPCIÓN DE EMAIL                               │
  └──────────────────────────────────────────────────────────────────────┘

     SMTP/IMAP              Scheduler                CRM
         │                      │                     │
         │    Cada 2 min        │                     │
         │◀─────────────────────▶│                     │
         │                      │                     │
         ▼                      ▼                     │
    ┌───────────┐          ┌───────────┐              │
    │ Nuevo     │─────────▶│ Poll     │              │
    │ Email    │          │ INBOX    │              │
    └─────┬─────┘          └─────┬─────┘              │
          │                      │                     │
          │                      ▼                     │
          │                 ┌───────────┐              │
          │                 │ Procesar │─────────────▶│
          │                 │ Reply    │              │
          │                 └─────┬─────┘              │
          │                       │                    │
          │                       ▼                    │
          │                 ┌───────────┐              │
          │                 │ Identif. │              │
          │                 │ Thread   │              │
          │                 └─────┬─────┘              │
          │                       │                    │
          │                       ▼                    │
          │                 ┌───────────┐              │
          │                 │ Vincular  │              │
          │                 │ Convers.  │              │
          │                 └───────────┘              │
          │                                             │
          └────────────────────────────────────────────┘
```

### 7.2 Plantillas de Email

| Categoría | Uso | Variables |
|-----------|-----|-----------|
| `WELCOME` | Bienvenida a nuevo contacto | `{{contact_name}}`, `{{company_name}}` |
| `FOLLOW_UP` | Seguimiento a contacto | `{{contact_name}}` |
| `PROPOSAL` | Envío de propuesta comercial | `{{contact_name}}`, `{{company_name}}` |
| `CLOSING` | Cierre de venta | `{{contact_name}}` |
| `MEETING` | Confirmación de reunión | `{{contact_name}}`, `{{date}}` |
| `CUSTOM` | Personalizada por usuario | Variable |

---

## 8. Integración de Canales

### 8.1 Vista Unificada de Conversaciones

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PANEL DE CONVERSACIONES                               │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐ ┌─────────────────────────────────────────────────┐
│ CONVERSACIONES  │ │ DETALLE DE CONVERSACIÓN                          │
├─────────────────┤ │                                                  │
│                 │ │ Contacto: Juan Pérez                             │
│ 🔍 Buscar...    │ │ Empresa: TechCorp S.A.                           │
│                 │ │ Email: juan@techcorp.com                         │
│ ┌─────────────┐ │ │ Tel: +51 999 123 456                            │
│ │💬 WhatsApp  │ │ │                                                  │
│ │ Juan Pérez  │ │ ├─────────────────────────────────────────────────┤
│ │ Última msg..│ │ │                                                   │
│ │ Hace 5 min │ │ │  ┌────────────────────────────────────────────┐ │
│ └─────────────┘ │ │  │ 💬 Juan: Hola, me interesa el producto X │ │
│                 │ │  │  │ 10:30 AM                                 │ │
│ ┌─────────────┐ │ │  └────────────────────────────────────────────┘ │
│ │📧 Email     │ │ │  ┌────────────────────────────────────────────┐ │
│ │ María García│ │ │  │ ✓ Tú: Hola Juan, con gusto te ayudamos   │ │
│ │ Re: Prod... │ │ │  │  10:32 AM                                  │ │
│ │ Hace 1 hora│ │ │  └────────────────────────────────────────────┘ │
│ └─────────────┘ │ │                                                   │
│                 │ │  ┌────────────────────────────────────────────┐ │
│ ┌─────────────┐ │ │  │ 💬 Juan: ¿Cuál es el precio?              │ │
│ │📋 Tarea     │ │ │  │  10:35 AM                                  │ │
│ │ Llamar a... │ │ │  └────────────────────────────────────────────┘ │
│ │ Hoy 3:00 PM │ │ │                                                   │
│ └─────────────┘ │ │ ┌─────────────────────────────────────────────┐ │
│                 │ │ │ 📝 Escribir mensaje...              [Enviar ▼]│ │
│                 │ │ └─────────────────────────────────────────────┘ │
│                 │ │                                                  │
│                 │ │ [+ Email] [+ WhatsApp] [+ Tarea] [📎 Archivos] │
└─────────────────┘ └─────────────────────────────────────────────────┘
```

---

## 9. Resumen de Estados y Transiciones

### 9.1 Contacto

```
NUEVO ──────────▶ EN_PROCESO ──────────▶ CALIFICADO
   │                   │                      │
   │                   │                      │
   ▼                   ▼                      ▼
INACTIVO ◀──────┴───────────┴──▶ OPORTUNIDAD ───▶ CLIENTE
                                       │
                                       │
                                       ▼
                                    PERDIDO
```

### 9.2 Deal

```
NUEVO ───▶ CALIFICADO ───▶ PROPUESTA ───▶ NEGOCIACION ───▶ GANADO
   │                                                       │
   │                                                       │
   ▼                                                       ▼
PERDIDO ◀──────────────────────────────────────────────────┘
```

### 9.3 Conversación

```
NUEVO ───▶ ABIERTA ───▶ BLOQUEADA ───▶ CERRADA ───▶ ARCHIVADA
             │           (multi-agente)    │            │
             │                              │            │
             └──────────────────────────────┴────────────┘
```

---

## 10. Métricas del Flujo

### 10.1 KPIs Principales

| Métrica | Descripción | Meta Típica |
|---------|-------------|-------------|
| **Contactos Nuevos/Día** | Velocidad de adquisición | 5-10 |
| **Tasa Conversión Lead** | % Leads que se convierten | 20-30% |
| **Tiempo en Pipeline** | Días promedio por etapa | 7-14 días |
| **Tasa Cierre** | % Deals ganados | 25-35% |
| **Ticket Promedio** | Valor medio por Deal | $X,XXX |
| **Respuesta WhatsApp** | Tiempo medio de respuesta | < 1 hora |
| **Tareas Completadas** | % tareas vs creadas | > 80% |

### 10.2 Dashboard Sugerido

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DASHBOARD NEXO CRM                             │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ CONTACTOS    │  │ LEADS        │  │ DEALS        │  │ TASKS      │ │
│  │    245       │  │    89        │  │    34        │  │   67/80    │ │
│  │  +12 hoy    │  │  +5 hoy     │  │  +3 hoy     │  │  84%       │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                                          │
│  PIPELINE VALUE: $125,000 (Ponderado: $78,500)                          │
│  ████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 62% meta   │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ CANALES DE CONTACTO                                                  │ │
│  │                                                                      │ │
│  │  WhatsApp ████████████████████████████████ 65%                     │ │
│  │  Email   ████████████████████ 25%                                  │ │
│  │  Manual  ████ 10%                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Anexos

### 11.1 Endpoints Principales (API)

| Módulo | Endpoint | Método | Descripción |
|--------|----------|--------|-------------|
| Contactos | `/api/contacts` | GET/POST | Listar/Crear contactos |
| Contactos | `/api/contacts/{id}` | GET/PUT/DELETE | CRUD contacto |
| Empresas | `/api/companies` | GET/POST | Listar/Crear empresas |
| Deals | `/api/deals` | GET/POST | Listar/Crear deals |
| Deals | `/api/deals/{id}/stages` | PUT | Cambiar etapa |
| Tareas | `/api/tasks` | GET/POST | Listar/Crear tareas |
| Tareas | `/api/tasks/{id}/complete` | POST | Completar tarea |
| WhatsApp | `/api/whatsapp/webhook` | POST | Webhook entrante |
| Email | `/api/email/send` | POST | Enviar email |
| Email | `/api/settings/integrations/email` | POST | Configurar SMTP |

### 11.2 Estados Enum

```java
// Contacto
enum ContactStatus { NUEVO, EN_PROCESO, CALIFICADO, OPORTUNIDAD, CLIENTE, INACTIVO }

// Deal
enum DealStatus { NUEVO, GANADO, PERDIDO }

// Pipeline
enum PipelineStatus { ACTIVO, INACTIVO }

// Conversación
enum ConversationStatus { OPEN, CLOSED, ARCHIVED, LOCKED }

// Mensaje
enum MessageStatus { SENT, DELIVERED, READ, FAILED }

// Tarea
enum TaskStatus { PENDIENTE, COMPLETADA, VENCIDA }
```

---

*Documento creado: Abril 2026*
*Versión: 1.0*
*Proyecto: NEXO CRM - Startup CRM*
