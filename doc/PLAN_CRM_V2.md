# 🚀 Plan de Acción - CRM SaaS v2.0 (Multi-negocio)

## 📋 Resumen Ejecutivo

**Objetivo:** Crear un CRM profesional, multi-negocio, multi-agente con WhatsApp + Email integrado.

**Para quién:**
- Servicios (seguimiento clientes)
- Venta de PCs (pipeline ventas)
- Coaching (contactos, citas)
- Academia (estudiantes, progreso)
- **MAS:** Otros clientes que contraten el servicio SaaS

**Modelo de Negocio:** SaaS - Suscripción mensual
- Cada organización = 1 tenant
- Planes por cantidad de agentes y features
- Onboarding automático para nuevos clientes

**Deadline:** Miércoles (presentación funcional)

---

## 🌿 Estructura de Ramas

```
main (no tocar - desarrolladores)
  └── dev (backend estable)
        └── crm (NUEVA - desde whatsapp, renombrada)
              └── (features van aquí)
```

### Por qué nueva rama:
- No altera `dev` (evita conflictos con otros desarrolladores)
- Base sólida desde whatsapp-prueba (ya tiene la mejor UI)
- Nombre más descriptivo: `crm` en vez de `whatsapp`

---

## 💰 Modelo de Negocio SaaS

### Planes de Suscripción

| Plan | Precio (USD) | Agentes | Features |
|------|--------------|---------|----------|
| **STARTER** | $29/mes | 1-3 | Contacts, WhatsApp básico, Email |
| **PROFESSIONAL** | $79/mes | 4-10 | + Deals Kanban, Plantillas, Tasks |
| **ENTERPRISE** | $199/mes | 11-50 | + Multi-supervisor, Analytics, API |
| **CUSTOM** | Negociar | ilimitado | Todo + personalizaciones |

### Revenue Streams

| Stream | Descripción |
|--------|-------------|
| **Suscripción mensual** | Planes above |
| **Setup fee** | $99 one-time (implementación) |
| **Training** | $150 sesión de onboarding |
| **Soporte premium** | $99/mes (respuesta < 2h) |
| **Personalizaciones** |quote por desarrollo |

### Costos Operativos (estimados)

| Item | Costo |
|------|-------|
| Servidor (VPS) | $20-50/mes |
| WhatsApp API | $0.01-0.05/mensaje (varía por país) |
| Dominio | $12/año |
| SSL | gratis (Let's Encrypt) |
| **Margen** | ~80% bruto |

### Churn Target
- Mantener < 5% mensual
- Features que reducen churn: Analytics, Automations, Templates

---

## 📊 Sistema de Suscripción

### Tabla de Organizations
```sql
organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  slug VARCHAR(50) UNIQUE,  -- para subdominio: miempresa.crm.com
  plan VARCHAR(20),          -- STARTER, PROFESSIONAL, ENTERPRISE, CUSTOM
  status VARCHAR(20),        -- ACTIVE, SUSENDED, TRIAL, PAST_DUE
  trial_ends_at TIMESTAMP,
  subscription_ends_at TIMESTAMP,
  created_at TIMESTAMP,
  owner_id UUID REFERENCES users
)
```

### Límites por Plan
```java
STARTER: {
  maxAgents: 3,
  maxContacts: 1000,
  features: ["contacts", "whatsapp_basic", "email"],
  analytics: false
}
PROFESSIONAL: {
  maxAgents: 10,
  maxContacts: 10000,
  features: ["contacts", "whatsapp", "email", "deals", "tasks", "templates"],
  analytics: true
}
ENTERPRISE: {
  maxAgents: 50,
  maxContacts: -1,  // unlimited
  features: ["*"],  // all
  analytics: true,
  api: true
}
```

### Features de monetización
- **Trial:** 14 días gratis, sin tarjeta
- **Upgrade:** Prorrateo automático
- **Downgrade:** Fin de ciclo actual
- **Cancel:** Data retenida 30 días, luego eliminada

---

## 🎯 Sistema de Roles (Multi-nivel)

### Roles del Sistema
| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **SUPER_ADMIN** | Dueño del sistema SaaS | Todo + gestión organizaciones + billing |
| **ORG_ADMIN** | Admin de una organización | Todo de su org |
| **SUPERVISOR** | Supervisor de equipo | Ver agentes, KPIs equipo |
| **AGENT** | Agente de ventas/soporte | Su trabajo diario |
| **VIEWER** | Solo lectura | Para clientes internos |

---

## 🗄️ Esquema de Base de Datos

### PostgreSQL (ya existente + nuevas tablas)

Las tablas existentes en V1-V18 + las siguientes adiciones para el nuevo CRM:

#### Tablas existentes (revisar y extender):
```
├── workspaces        ✅ (V1) - Ya tiene plan, puede agregar more fields
├── users            ✅ (V1) - Ya tiene role, workspace_id
├── contacts         ✅ (V2)
├── companies        ✅ (V2)
├── tags             ✅ (V2)
├── deals            ✅ (V3)
├── pipelines        ✅ (V3)
├── stages           ✅ (V3)
├── tasks            ✅ (V5)
├── conversations    ✅ (V4)
├── messages         ✅ (V4)
├── roles            ✅ (V16)
├── email_config     ✅ (V6)
├── whatsapp_config ✅ (V8)
└── [NUEVAS ABAJO]
```

#### Tablas NUEVAS necesarias:

```sql
-- ============================================================
-- V19: Citas y Reservas / Appointments
-- ============================================================
CREATE TYPE appointment_type AS ENUM ('VIRTUAL', 'PRESENTIAL', 'PHONE');
CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

CREATE TABLE appointments (
    id                  UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id        UUID              NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    contact_id          UUID              REFERENCES contacts(id) ON DELETE SET NULL,
    assigned_to_user_id UUID              REFERENCES users(id) ON DELETE SET NULL,
    
    -- Cita details
    title               VARCHAR(255)      NOT NULL,
    description         TEXT,
    appointment_type    appointment_type  NOT NULL,
    status              appointment_status NOT NULL DEFAULT 'PENDING',
    
    -- Scheduling
    scheduled_start     TIMESTAMPTZ       NOT NULL,
    scheduled_end        TIMESTAMPTZ       NOT NULL,
    duration_minutes    INTEGER           NOT NULL DEFAULT 30,
    
    -- Virtual meeting
    meeting_url         VARCHAR(500),
    meeting_id           VARCHAR(100),
    
    -- Tracking
    created_by          UUID              REFERENCES users(id),
    created_at          TIMESTAMPTZ       NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ       NOT NULL DEFAULT now(),
    cancelled_at        TIMESTAMPTZ,
    cancel_reason       TEXT
);

CREATE INDEX idx_appointments_workspace ON appointments(workspace_id);
CREATE INDEX idx_appointments_date ON appointments(scheduled_start);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_contact ON appointments(contact_id);

-- ============================================================
-- V20: Agent Activity Log / Bitácora de Conversación
-- ============================================================
CREATE TYPE agent_action AS ENUM ('STARTED', 'REPLIED', 'ESCALATED', 'TRANSFERRED', 'CLOSED', 'ADDED_NOTE');

CREATE TABLE conversation_activity_log (
    id                  UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id        UUID              NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    conversation_id    UUID              NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    agent_id            UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Log details
    action              agent_action      NOT NULL,
    message_preview    TEXT,
    internal_note       TEXT,
    timestamp           TIMESTAMPTZ       NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_log_conversation ON conversation_activity_log(conversation_id);
CREATE INDEX idx_activity_log_agent ON conversation_activity_log(agent_id);
CREATE INDEX idx_activity_log_workspace ON conversation_activity_log(workspace_id);

-- ============================================================
-- V21: Campaign Buttons / Botones de Landing
-- ============================================================
CREATE TABLE campaign_buttons (
    id                  UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id        UUID              NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    -- Button config
    name                VARCHAR(100)      NOT NULL,
    button_type         VARCHAR(20)       NOT NULL,  -- WHATSAPP, URL, FORM, DEMO
    label               VARCHAR(255)      NOT NULL,
    url                 VARCHAR(500),
    whatsapp_number     VARCHAR(50),
    whatsapp_message    TEXT,
    
    -- Styling
    color               VARCHAR(20)       DEFAULT '#25D366',
    position            VARCHAR(20)       NOT NULL,  -- HEADER, HERO, FOOTER, FLOATING, BANNER
    
    -- Display
    show_on_desktop     BOOLEAN           DEFAULT TRUE,
    show_on_mobile      BOOLEAN           DEFAULT TRUE,
    is_active           BOOLEAN           DEFAULT TRUE,
    
    -- Campaign dates
    start_date          DATE,
    end_date            DATE,
    
    created_at          TIMESTAMPTZ       NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ       NOT NULL DEFAULT now()
);

CREATE INDEX idx_campaign_buttons_workspace ON campaign_buttons(workspace_id);

-- ============================================================
-- V22: Organizations (SaaS Multi-tenant)
-- ============================================================
ALTER TABLE workspaces ADD COLUMN plan VARCHAR(20) DEFAULT 'STARTER';
ALTER TABLE workspaces ADD COLUMN status VARCHAR(20) DEFAULT 'TRIAL';
ALTER TABLE workspaces ADD COLUMN trial_ends_at TIMESTAMPTZ;
ALTER TABLE workspaces ADD COLUMN subscription_ends_at TIMESTAMPTZ;
ALTER TABLE workspaces ADD COLUMN stripe_customer_id VARCHAR(100);
ALTER TABLE workspaces ADD COLUMN custom_domain VARCHAR(255);

-- Add max agents limit by plan
ALTER TABLE workspaces ADD COLUMN max_agents INTEGER DEFAULT 3;
ALTER TABLE workspaces ADD COLUMN max_contacts INTEGER DEFAULT 1000;

-- ============================================================
-- V23: Booking Settings / Configuración de Citas
-- ============================================================
CREATE TABLE booking_settings (
    id                  UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id        UUID              NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE UNIQUE,
    
    -- General config
    is_enabled          BOOLEAN           DEFAULT FALSE,
    default_duration    INTEGER           DEFAULT 30,
    buffer_minutes      INTEGER           DEFAULT 15,
    
    -- Hours (JSON for flexibility)
    work_days           VARCHAR(20)       DEFAULT 'MON-FRI',  -- MON,TUE,WED,THU,FRI,SAT,SUN
    work_start_time     VARCHAR(10)       DEFAULT '09:00',
    work_end_time       VARCHAR(10)       DEFAULT '18:00',
    timezone            VARCHAR(50)       DEFAULT 'America/Argentina/Buenos_Aires',
    
    -- Booking page
    booking_page_enabled BOOLEAN           DEFAULT FALSE,
    booking_page_slug    VARCHAR(100),
    primary_color       VARCHAR(20)       DEFAULT '#2563EB',
    
    -- Notifications
    send_confirmation    BOOLEAN           DEFAULT TRUE,
    send_reminder        BOOLEAN           DEFAULT TRUE,
    reminder_hours      INTEGER           DEFAULT 24
);

-- ============================================================
-- V24: Appointment Types / Tipos de Cita
-- ============================================================
CREATE TABLE appointment_types (
    id                  UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id        UUID              NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    name                VARCHAR(100)      NOT NULL,
    description         TEXT,
    duration_minutes    INTEGER           NOT NULL DEFAULT 30,
    is_active           BOOLEAN           DEFAULT TRUE,
    
    -- Pricing (optional)
    price               DECIMAL(10,2),
    currency            VARCHAR(3)         DEFAULT 'USD',
    
    created_at          TIMESTAMPTZ       NOT NULL DEFAULT now()
);

CREATE INDEX idx_appointment_types_workspace ON appointment_types(workspace_id);
```

### MongoDB (para datos flexibles)

```javascript
// Colección: whatsapp_templates
{
  "_id": ObjectId,
  "workspaceId": UUID,
  "name": "bienvenida",
  "category": "UTILITY",  // MARKETING, UTILITY, AUTHENTICATION
  "language": "es",
  "content": "¡Hola {{name}}! Bienvenido a {{company}}...",
  "variables": ["name", "company"],
  "metaTemplateId": "123456789",
  "status": "APPROVED",  // PENDING, APPROVED, REJECTED
  "createdAt": Date,
  "updatedAt": Date
}

// Colección: email_templates
{
  "_id": ObjectId,
  "workspaceId": UUID,
  "name": "seguimiento",
  "category": "FOLLOW_UP",
  "subject": "Seguimiento: {{topic}}",
  "body": "<html>...{{name}}...</html>",
  "variables": ["name", "topic"],
  "isActive": true,
  "createdAt": Date
}

// Colección: full_conversation_logs (historial completo)
{
  "_id": ObjectId,
  "workspaceId": UUID,
  "conversationId": UUID,
  "messages": [
    {
      "timestamp": Date,
      "direction": "INBOUND",  // OUTBOUND
      "channel": "WHATSAPP",  // EMAIL
      "content": "Hola!",
      "agentId": UUID,
      "agentName": "Juan",
      "messageId": "wamid.xxx"
    }
  ],
  "createdAt": Date,
  "updatedAt": Date
}
```

---

## 🎯 Resumen de tablas nuevas

| # | Tabla | Para qué | Ubicación |
|---|-------|----------|-----------|
| 1 | appointments | Citas y reservas | PostgreSQL |
| 2 | conversation_activity_log | Bitácora de conversación | PostgreSQL |
| 3 | campaign_buttons | Botones de landing | PostgreSQL |
| 4 | Extender workspaces | Organizations SaaS | PostgreSQL |
| 5 | booking_settings | Config de bookings | PostgreSQL |
| 6 | appointment_types | Tipos de cita | PostgreSQL |
| 7 | whatsapp_templates | Templates WA | MongoDB |
| 8 | email_templates | Templates email | MongoDB |
| 9 | full_conversation_logs | Historial completo | MongoDB |

---

## 🔐 Sistema RBAC (mantener y extender)

El sistema de roles existente se mantiene y extiende:

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **SUPER_ADMIN** | Dueño del SaaS | Todo: organizations, billing, system |
| **ORG_ADMIN** | Admin de organización | Todo de su workspace |
| **SUPERVISOR** | Supervisor de equipo | Ver agentes, KPIs, bitácora |
| **AGENT** | Agente de ventas | Su trabajo diario |
| **VIEWER** | Solo lectura | Ver sin modificar |

### Permisos específicos nuevos:
- `appointments:read` - Ver citas
- `appointments:write` - Crear/editar citas
- `appointments:manage` - Gestionar tipos de cita
- `activity_log:read` - Ver bitácora (supervisor+)
- `campaigns:manage` - Gestionar botones y campañas
- `billing:manage` - Gestionar suscripción (admin)

### NUEVO: MongoDB (agregar)

| Colección | Uso |
|------------|-----|
| `whatsapp_templates` | Plantillas de mensajes WhatsApp |
| `email_templates` | Plantillas de emails |
| `conversation_history` | Historial completo de conversaciones |
| `agent_activity_log` | Bitácora de actividad por agente |
| `audit_logs` | Logs de auditoría por organización |

**Por qué MongoDB:**
- Documentos flexibles para templates con variables
- Historial de conversaciones puede crecer mucho
- Queries eficientes para búsqueda de mensajes
- JSON nativo para logs de actividad

---

## 📱 Módulos a Implementar

### 0. Landing Page (Punto de entrada)
```
├── Landing page existente en /landing (Astro)
├── Flujo de captura de leads:
│   ├── Visitante llega a landing
│   ├── Ve propuesta de valor
│   ├── Hace click en "Contactar por WhatsApp"
│   └── [Redirige a WhatsApp Business]
├── Botones de acción configurables (desde CRM):
│   ├── Botón principal: "Contactar por WhatsApp"
│   ├── Botón secundario: "Pedir información" / "Ver demo"
│   ├── Botón terciario: "Registrarse"
│   └── [Cada organización puede configurar sus propios botones]
├── Configuración por organización:
│   ├── Número de WhatsApp (Phone Number)
│   ├── Mensaje inicial (texto que se envía al hacer click)
│   ├── Texto del botón
│   ├── Color del botón
│   └── URL del botón (WA, formulario, registro, etc.)
├── Tracking:
│   ├── UTM parameters para analytics
│   ├── Facebook Pixel / Google Ads
│   └── Cookie de referencia
└── Post-click:
    ├── Cliente llega a WhatsApp
    ├── Atiende agente (vos o tu equipo)
    ├── Si es lead nuevo → se crea contacto en CRM
    └── Conversación ya queda registrada
```

### 0.1 Sistema de Botones de Acción (Configurable desde CRM)
```
Settings > Configuración del Sitio > Botones de Acción
├── Tipos de botón:
│   ├── WhatsApp (wa.me/link)
│   ├── Registro (URL a página de signup)
│   ├── Demo (URL a agendar demo)
│   ├── Landing interna (URL a otra página del sitio)
│   └── Campaña/Promo (banner temporal con descuento)
├── Configuración por botón:
│   ├── Label (texto visible)
│   ├── URL / Número WhatsApp
│   ├── Mensaje predefinido (para WA)
│   ├── Color (primary, secondary, accent)
│   ├── Posición (header, hero, footer, floating, banner)
│   ├── Mostrar en: desktop, mobile, o ambos
│   ├── Active / Inactive
│   └── Fechas: start_date, end_date (para campañas)
├── Configuración de Campaña/Promo (ejemplo):
│   ├── Tipo: Banner promocional
│   ├── Título: "🎉 20% de descuento"
│   ├── Subtítulo: "en servicios de reparación de PC"
│   ├── Imagen: [foto de servicio de reparación]
│   ├── Código: SAVE20
│   ├── Términos: "Válido hasta el 31/03/2024"
│   ├── Botón CTA:
│   │   ├── Texto: "Aprovechar descuento"
│   │   ├── Acción: WhatsApp
│   │   └── Mensaje: "Hola! Quiero aplicar el 20% de descuento en servicio de reparación"
│   ├── Posición: Banner inferior (floating)
│   ├── Mostrar: Mobile + Desktop
│   ├── Fechas: 01/03/2024 - 31/03/2024
│   └── Estado: Activo
│
│   [EJEMPLO VISUAL DEL BANNER]
│   ┌─────────────────────────────────────────────────────────┐
│   │ 🎉 20% de descuento en servicios de reparación de PC   │
│   │ code: SAVE20 | Válido hasta 31/03/2024                 │
│   │            [Aprovechar descuento] 📱                   │
│   └─────────────────────────────────────────────────────────┘
│
├── Otro ejemplo - Botón flotante WhatsApp:
│   ├── Tipo: Botón flotante
│   ├── Posición: Corner derecho inferior
│   ├── Icono: WhatsApp verde
│   ├── Texto: "Hola, necesito ayuda"
│   ├── Mensaje predefinido: "Hola! Estoy interesado en sus servicios"
│   ├── Mostrar siempre: Sí
│   └── Estado: Activo
│
├── Previsualización:
│   └── Vista previa de cómo queda el botón/banner
│
├── Múltiples botones:
│   ├── Botón 1: "Chatea con nosotros" (WA, header)
│   ├── Botón 2: "Pedir demo" (URL, hero)
│   ├── Botón 3: "Registrarse" (URL, footer)
│   └── Banner: "20%DESC" (campaña, floating)
│
└── Por organización:
    └── Cada cliente puede tener sus propios botones y campañas
```

### Ejemplos de Campañas Reales

#### Ejemplo 1: Descuento en Servicio (Reparación de PC)
```
Tipo: Banner Campaña
Título: 🔧 ¡20% de descuento en reparación de PCs!
Subtítulo: Servicio a domicilio incluido
Imagen: [foto técnico reparando PC]
Código: REPARO20
Términos: *Válido para equipos de escritorio. No aplica en componentes.
Botón CTA: "Reservar ahora" → WhatsApp
Mensaje WA: "Hola! Quiero aplicar el 20% de descuento en mi reparación"
Fechas: 15/03/2024 - 15/04/2024
Posición: Banner inferior fixed
```

#### Ejemplo 2: Promo de Producto (Venta de PCs)
```
Tipo: Banner Campaña
Título: 💻 PC Gamer + Monitor 24" ¡SOLO $899!
Subtítulo: Antes $1,199 - Ahorras $300
Imagen: [fotoセット PC gamer]
Código: PCGAMER300
Términos: *Stock limitado a 10 unidades. Incluye ensamblaje gratis.
Botón CTA: "Comprar ahora" → WhatsApp
Mensaje WA: "Hola! Estoy interesado en el PC Gamer con el descuento de $300"
Fechas: 01/04/2024 - 07/04/2024
Posición: Hero section (reemplaza contenido normal)
```

#### Ejemplo 3: Descuento en Academia (Curso)
```
Tipo: Botón CTA
Título: 📚 50% OFF en Curso de Marketing Digital
Subtítulo: Modalidad online - 8 semanas
Código: MARKETING50
Términos: *Incluye certificado y proyectos prácticos
Botón CTA: "Inscríbete ahora" → Formulario/WhatsApp
Fechas: Permanente (para siempre activo)
Posición: Header + Hero
```

#### Ejemplo 4: Servicio de Coaching
```
Tipo: Botón flotante WhatsApp
Posición: Bottom-right fixed
Icono: WhatsApp (verde corporativo)
Texto: "¡Agenda tu consulta gratuita!"
Mensaje WA: "Hola! Me interesa agendar una consulta de coaching gratuita"
Mostrar: Siempre activo
```

### Métricas de Campañas (Tracking)

```
Dashboard > Campañas
├── Vistas del banner/botón
├── Clicks en botón
├── Conversiones (clics que iniciaron conversación WA)
├── Costo por lead (si hay inversión publicitaria)
├── ROAS (Return on Ad Spend)
└── Comparativa: esta campaña vs anteriores
```

### 1. Dashboard (KPIs)
```
├── Resumen del día (Acciones para hoy):
│   ├── Citas pendientes de hoy
│   ├── Tareas pendientes de hoy
│   ├── Conversaciones sin atender (más antiguas)
│   ├── Leads nuevos sin atender
│   ├── Deals proximos a cerrar esta semana
│   └── Recordatorios de seguimiento
│
│   [EJEMPLO VISUAL - Panel "Acciones para hoy"]
│   ┌─────────────────────────────────────────────────────┐
│   │ ⚡ ACCIONES PARA HOY                               │
│   ├─────────────────────────────────────────────────────┤
│   │ 🗓️ Citas (2)                                      │
│   │   • 10:00 - Juan Pérez - Consulta gratuita        │
│   │   • 15:00 - María García - Sesión coaching         │
│   │                                                     │
│   │ ✅ Tareas (5)                                     │
│   │   • Llamar a Roberto - Seguimiento @10:30         │
│   │   • Enviar cotización a TechCorp @11:00           │
│   │   • Revisar presupuesto PC Gamer @14:00           │
│   │   • Completar diagnóstico PC #452 @16:00          │
│   │   • Follow-up con cliente satisfecho @17:00      │
│   │                                                     │
│   │ 💬 Pendientes (3)                                 │
│   │   • Cliente nuevo - 2 mensajes sin leer (hace 5m)  │
│   │   • Maria - Sin responder (hace 1h)               │
│   │   • Carlos - Esperando respuesta (hace 3h)        │
│   │                                                     │
│   │ 🎯 Deals para cerrar esta semana (2)              │
│   │   • TechCorp - $2,500 --listo para cerrar          │
│   │   • StartupXYZ - $800 - necesita follow-up        │
│   └─────────────────────────────────────────────────────┘
│
├── KPIs Generales:
│   ├── Contactos activos
│   ├── Mensajes enviados/hoy
│   ├── Deals abiertos
│   └── Tareas pendientes
├── KPIs por Agente (para supervisor):
│   ├── Mensajes atendidos
│   ├── Tiempo promedio de respuesta
│   ├── Deals creados
│   └── Tareas completadas
└── Gráficos de tendencia
```

### 2. Conversaciones (WhatsApp + Email)
```
├── Lista de conversaciones
├── Chat activo
├── Info del contacto (sidebar)
├── Registro interno (bitácora):
│   ├── Agent 1: "Cliente consultó sobre precio" (10:30)
│   ├── Agent 2: "Respondió con cotización" (10:45)
│   ├── Agent 1: "Hizo follow-up" (11:00)
│   └── [visible solo para admins/supervisors]
└── Quick Actions: Crear Deal, Task, Email
```

### 2.1 Auditoría de Conversaciones (Para supervisors/admins)
```
├── Vista de auditoría:
│   ├── Selector de conversación
│   ├── Timeline completo con todos los mensajes
│   ├── Filtrar por: agente, fecha, tipo de mensaje
│   └── Duración total de la conversación
├── Información visible:
│   ├── Mensaje del cliente (entrada)
│   ├── Mensaje del agente (salida)
│   ├── Timestamp de cada mensaje
│   ├── Si fue derivado entre agentes
│   └── Notas internas del agente
├── Métricas de auditoría:
│   ├── Tiempo total de atención
│   ├── Cantidad de mensajes del agente
│   ├── Tiempo hasta primera respuesta
│   ├── Sentimiento (positivo/negativo/neutral) - opcional
│   └── Cumplimiento de SLA
├── Exportar auditoría:
│   └── PDF con timeline completo para registros
└── Calificación de calidad (opcional):
    ├── Supervisor califica atención (1-5 estrellas)
    ├── Comentarios de retroalimentación
    └── Guardar para training
```

### 3. Contacts + Companies
```
├── Lista con filtros (estado, tags, assigned)
├── CRUD completo
├── Historial de interacciones
├── Notas
└── Tags
```

### 4. Deals (Pipeline)
```
├── Kanban por stages
├── Cards con info
├── Drag & drop
├── Pipeline value
└── Tiempo por stage
```

### 5. Email
```
├── Compose (enviar email)
├── Configuración SMTP/Gmail
├── Plantillas
└── Historial de enviados
```

### 6. Tasks
```
├── Lista de tareas
├── Por hacer / En progreso / Completadas
├── Fechas y recordatorios
└── Asignación
```

### 7. Citas y Reuniones (NUEVO)
```
├── Tipos de cita:
│   ├── Virtual (Google Meet, Zoom, WhatsApp call)
│   ├── Presencial (en oficina/tienda)
│   └── Telefónica
├── Configuración de disponibilidad:
│   ├── Horarios disponibles por día
│   ├── Días laborables
│   ├── Duración por tipo de cita (30min, 1hr, etc.)
│   ├── Tiempo entre citas (buffer)
│   └── Excepciones (feriados, días libres)
├── booking page pública:
│   ├── Página donde clientes reservan cita
│   ├── SELECTOR de tipo de servicio
│   ├── Calendario con horarios disponibles
│   ├── FORMULARIO datos cliente
│   └── Confirmación + notificación
├── Panel de citas (CRM):
│   ├── Calendario mensual/semanal/diario
│   ├── Lista de citas próximas
│   ├── Estados: Pendiente, Confirmada, Completada, Cancelada
│   ├── Detalles de la cita
│   └── Acciones: confirmar, cancelar, reprogramar
├── Notificaciones:
│   ├── Email confirmación al cliente
│   ├── Recordatorio 24hs antes (email/WhatsApp)
│   ├── Recordatorio 1hr antes
│   ├── Notificación al agente/asignado
│   └── Alertas de cancelaciones
├── Integraciones:
│   ├── Google Calendar (sincronizar)
│   ├── Zoom API (crear meeting automático)
│   ├── WhatsApp (enviar link de meeting)
│   └── Webhooks para otras apps
└── Métricas:
    ├── Citas por día/semana/mes
    ├── Tasa de cancelacion
    ├── Citas por tipo (virtual vs presencial)
    └── Duración promedio
```

### 7.1 Configuración de Citas por Organización
```
Settings > Citas y Reservas
├── Configuración General:
│   ├── Duración por defecto (30/45/60 min)
│   ├── Buffer entre citas (15 min)
│   ├── Horario laboral (9:00 - 18:00)
│   └── Zona horaria
├── Tipos de Cita:
│   ├── Consulta gratuita (30 min)
│   ├── Servicio técnico (1 hr)
│   ├── Sesión coaching (50 min)
│   ├── Clase prueba (45 min)
│   └── [Custom: crear nuevos tipos]
├── Disponibilidad:
│   ├── Por agente (si hay varios)
│   ├── Por tipo de cita
│   └── Excepciones (días específicos)
├── Booking Page:
│   ├── Activar/Desactivar
│   ├── URL personalizada (midominio.com/book)
│   ├── Colores (match con marca)
│   ├── Campos del formulario
│   └── Mensajes personalizados
└── Notificaciones:
    ├── Plantilla email confirmación
    ├── Plantilla recordatorio
    └── Activar/Desactivar por canal
```

### 7.2 Ejemplo: Booking Page para tu negocio de servicios
```
URL: serviciosmicomputadora.com/book

[Página de Reserva]
┌─────────────────────────────────────────────────┐
│ 📅 Reserve su cita de servicio técnico         │
├─────────────────────────────────────────────────┤
│ Tipo de servicio: [Dropdown]                   │
│   ├─ Diagnóstico ($30) - 30min                  │
│   ├─ Reparación Básica - 1hr                   │
│   ├─ Reparación Avanzada - 2hr                 │
│   └─ Mantenimiento - 45min                      │
├─────────────────────────────────────────────────┤
│ Fecha: [Calendario interactivo]                │
│   Lu  Ma Mi Ju Vi Sa Do                        │
│   [15] [16] [17] [18] [19] [20] [21]           │
├─────────────────────────────────────────────────┤
│ Horario disponible:                             │
│   ( ) 09:00 - 10:00 (1 slot)                   │
│   (✓) 10:00 - 11:00 (DISPONIBLE) ⭐            │
│   ( ) 11:00 - 12:00 (2 slots)                  │
│   ...                                           │
├─────────────────────────────────────────────────┤
│ Sus datos:                                      │
│   Nombre: [_________]                          │
│   Teléfono: [_________]                        │
│   Email: [_________]                            │
│   Notes: [_________]                            │
├─────────────────────────────────────────────────┤
│               [Confirmar Reserva]              │
└─────────────────────────────────────────────────┘

[Resultado]
✅ Cita confirmada para el 18/03/2024 a las 10:00
📧 Se envió confirmación a su email
📱 Recordatorio: Le recordaremos 24hs antes
```

### 7. Settings (Configuración)
```
├── PERFIL (todos)
│   ├── Mi información
│   ├── Cambiar contraseña
│   └── Preferencias
├── INTEGRACIONES (admin)
│   ├── WhatsApp config
│   ├── Email config
│   └── Webhooks
├── ROLES Y PERMISOS (admin/organización)
│   ├── Crear roles custom
│   ├── Asignar permisos por rol
│   ├── Asignar usuarios a roles
│   └── Admin por organización
├── PLANTILLAS (admin)
│   ├── WhatsApp templates
│   └── Email templates
├── AGENTES (admin/supervisor)
│   ├── Lista de agentes
│   ├── Asignar a conversaciones
│   ├── Ver rendimiento
│   └── KPIs por agente
└── CONFIGURACIÓN DE NEGOCIO (admin org)
    ├── Nombre del negocio
    ├── Colores/marca
    └── Configuración específica
```

---

## 🎯 Sistema de Roles (Multi-nivel)

### Roles del Sistema
| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **SUPER_ADMIN** | Dueño del sistema | Todo, gestión de organizaciones |
| **ORG_ADMIN** | Admin de una organización | Todo de su org |
| **SUPERVISOR** | Supervisor de equipo | Ver agentes, KPIs equipo |
| **AGENT** | Agente de ventas/soporte | Su trabajo diario |
| **VIEWER** | Solo lectura | Para clientes internos |

### Gestión por Organización (Tenant)
- Cada "negocio" (servicios, PC, coaching, academia) = 1 Workspace = 1 Organization
- Cada organización tiene su propio:
  - Subdominio: `negocio.crmtuyo.com`
  - Agentes
  - Roles custom
  - Configuración
  - Plantillas
  - Facturación independiente

---

## 🏢 Arquitectura Multi-Tenant

### DNS y Subdominios
```
mipcshop.crmtuyo.com      → Organización "Mi PC Shop"
 coaching.crmtuyo.com     → Organización "Coaching Pro"
 servicios.crmtuyo.com    → Organización "Servicios Tech"
```

### Onboarding Automático
```
1. Cliente se registra en crmtuyo.com
2. Elige subdominio: mipcshop.crmtuyo.com
3. Completa formulario: nombre, email, industria
4. Trial de 14 días comienza automáticamente
5. Recibe email de bienvenida con guía
6. Puede invitar agentes desde el inicio
```

### white-label (Enterprise)
- Sin marca del SaaS
- Dominio propio: `crm.mipcshop.com`
- Logo y colores personalizados
- Solo en plan ENTERPRISE/CUSTOM

---

## 💳 Sistema de Billing

### Tecnologías
- **Stripe** para pagos (tarjetas, Apple Pay, Google Pay)
- **Stripe Customer Portal** para gestión de cliente
- **Webhooks** para actualizar estado en DB

### Flujo de Pago
```
1. Usuario selecciona plan
2. Redirect a Stripe Checkout
3. Stripe procesa pago
4. Webhook actualiza organization.status = ACTIVE
5. Usuario recibe email de confirmación
```

### Métricas de Negocio (Dashboard Admin SaaS)
```
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Churn rate
- LTV (Lifetime Value)
- CAC (Customer Acquisition Cost)
- Net Revenue Retention
- Trial conversion rate
- Active organizations count
```

---

## 📊 Bitácora de Conversación (Historial interno)

### Estructura del Log
```json
{
  "conversationId": "uuid",
  "workspaceId": "uuid",
  "entries": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "agentId": "uuid",
      "agentName": "Juan Pérez",
      "action": "STARTED",  // STARTED, REPLIED, ESCALATED, TRANSFERRED, CLOSED
      "messagePreview": "Cliente consultó...",
      "notes": "Cliente interesado en套餐 premium"
    }
  ]
}
```

### Para qué sirve:
- Seguimiento de qué agente hizo qué
- KPIs por agente
- Historial para nuevo agente que toma la conversación
- Auditoría para supervisor

---

## 🔧 Configuración de la App

### Settings > Configuración General
```
├── Información de la Organización
│   ├── Nombre
│   ├── Logo
│   ├── Colores (brand)
│   └── timezone
├── Configuración de WhatsApp
│   ├── Phone Number ID
│   ├── Access Token
│   ├── Webhook URL
│   └── Verify Token
├── Configuración de Email
│   ├── SMTP / Gmail OAuth
│   ├── Email default (from)
│   └── Firma
├── Configuración de Notificaciones
│   ├── Notificaciones browser
│   ├── Notificaciones email
│   └── Sonido
└── Configuración de Workflow
    ├── Timeout de lock (minutos)
    ├── Notificaciones de transferencia
    └── Auto-assign rules
```

---

## 📦 Plantillas

### WhatsApp Templates
```json
{
  "name": "bienvenida",
  "category": "UTILITY",
  "language": "es",
  "content": "¡Hola {{name}}! Bienvenido a {{company}}.¿En qué podemos ayudarte?",
  "variables": ["name", "company"],
  "approved": true,
  "workspaceId": "uuid"
}
```

### Email Templates
```json
{
  "name": "seguimiento",
  "subject": "Seguimiento: {{topic}}",
  "body": "Hola {{name}},\n\n...",
  "variables": ["name", "topic", "company"],
  "category": "FOLLOW_UP",
  "workspaceId": "uuid"
}
```

---

## 🚀 Plan de Ejecución (4 días)

### DÍA 1: Setup + Merge
- [ ] Crear rama `crm` desde `feat/startup-crm/whatsapp`
- [ ] Agregar MongoDB al docker-compose
- [ ] Actualizar config del backend
- [ ] Test de conexión
- [ ] Planificar estructura de organizations

### DÍA 2: Backend + Frontend Core
- [ ] Crear entidades MongoDB para templates
- [ ] Crear endpoint de templates CRUD
- [ ] Crear modelo de agent_activity_log
- [ ] Agregar endpoints de bitácora
- [ ] Unificar rutas del frontend
- [ ] Crear Layout base
- [ ] Implementar sistema de subdominios (opcional)

### DÍA 3: Dashboard + Contacts + Features Core
- [ ] Dashboard con KPIs reales
- [ ] Dashboard SaaS (metricas del negocio)
- [ ] Contacts con CRUD
- [ ] Filtros y búsqueda
- [ ] Sidebar con navegación
- [ ] Per-user login con organización

### DÍA 4: Settings + Templates + Quick Actions + Billing
- [ ] Settings completo (integraciones, roles)
- [ ] UI de creación de templates
- [ ] Quick Actions desde conversación
- [ ] Bitácora visible para supervisors
- [ ] Settings de organización (plan, billing info)
- [ ] Testing final

---

## 🎁 Features Diferenciadoras (para vender)

| Feature | Descripción | Valor percibido |
|---------|-------------|-----------------|
| **Chatbots WA** | Automatización con respuestas automáticas | "No pierdo nunca un lead" |
| **Sequences** | Secuencias de mensajes automáticas | "Nurturing sin esfuerzo" |
| **Broadcasts** | Mensajes masivos a grupos | "Llego a todos mis clientes" |
| **Auto-assign** | Asignación automática de leads | "No pierdo tiempo repartiendo" |
| **SLA tracking** | Tiempo de respuesta por agente | "Mi equipo responde rápido" |
| **Audit trail** | Historial completo de acciones | "Tengo control total" |
| **Webhooks** | Integración con otros sistemas | "Conectado con todo" |
| **API REST** | Para integraciones custom | "Puedo hacer lo que quiera" |
| **Exportaciones** | CSV, PDF, Excel | "Tengo mis reportes" |

---

## 📈 Dashboard SaaS (Para el admin del SaaS)

```javascript
{
  "metrics": {
    "totalOrganizations": 45,
    "activeOrganizations": 38,
    "mrr": 3250,  // $3,250/mes
    "arr": 39000, // $39,000/año
    "churnRate": 3.2,
    "trialConversion": 68,
    "avgLtv": 2400,
    "cac": 150
  },
  "topOrganizations": [
    { "name": "Mi PC Shop", "plan": "PROFESSIONAL", "mrr": 79 },
    { "name": "Coaching Pro", "plan": "ENTERPRISE", "mrr": 199 },
    { "name": "Servicios Tech", "plan": "STARTER", "mrr": 29 }
  ],
  "recentSignups": [
    { "name": "Nueva Empresa", "plan": "STARTER", "date": "2024-01-15" }
  ]
}
```

---

## 🔒 Seguridad y Compliance

| Aspecto | Implementación |
|---------|----------------|
| **Encriptación** | TLS en tránsito, AES-256 en disco |
| **Contraseñas** | BCrypt + salt, no plaintext nunca |
| **Sesiones** | JWT con refresh tokens, expire 7 días |
| **API Security** | Rate limiting, CORS, sanitized inputs |
| **Backup** | Daily auto-backup, retention 30 días |
| **GDPR** | Export data, delete account, consent tracking |
| **Logs** | Todos los requests loggeados con IP |

---

## 📊 KPIs de Performance (para el SaaS)

| Métrica | Target | Crítico si |
|---------|--------|------------|
| Uptime | > 99.9% | < 99% |
| Response time API | < 200ms | > 500ms |
| DB query time | < 50ms | > 200ms |
| Concurrent users | - | > limit plan |
| Error rate | < 0.1% | > 1% |

### 8. Exportación de Datos
```
├── Por módulo:
│   ├── Contacts → CSV, Excel, PDF
│   ├── Deals → CSV, PDF
│   ├── Citas → CSV, PDF
│   ├── Conversaciones → PDF (para auditoría)
│   └── Tasks → CSV
├── Opciones de exportación:
│   ├── Todos los registros
│   ├── Solo filtro actual
│   ├── Seleccionar campos específicos
│   └── Incluir/excluir campos sensibles
├── Programación:
│   └── Export automático (diario/semanal) → email
└── Historial de exportaciones
```

### 9. Kanban de Tareas (Opcional - Similar a Deals)
```
├── Columnas: Por Hacer → En Progreso → Completado
├── Cards con info de tarea
├── Drag & drop
└── Asignación visual
```

### 10. Reportes y Analytics Avanzados
```
├── Reportes por módulo:
│   ├── Contactos: nuevos, por fuente, por estado
│   ├── Deals: pipeline completo, conversión por stage
│   ├── Citas: cancelaciones, duración promedio
│   ├── Agentes: rendimiento individual y grupal
│   └── Campañas: ROI, leads generados
├── Filtros:
│   ├── Por fecha (hoy, semana, mes, rango custom)
│   ├── Por agente
│   └── Por organización (si es SaaS)
├── Exportar:
│   └── PDF, Excel, CSV
└── Programar reportes automática (semanal, mensual)
```

### 11. Webhooks para Integraciones
```
├── Webhooks disponibles:
│   ├── Contacto creado/actualizado
│   ├── Nuevo mensaje entrante
│   ├── Cita agendada/cancelada
│   ├── Deal creado/cerrado
│   └── Payment exitoso/fallido
├── Configuración:
│   ├── URL del webhook
│   ├── Eventos a suscribir
│   ├── Headers (Authorization)
│   └── Active / Inactive
├── Logs:
│   └── Historial de webhooks enviados (éxitos/fallos)
└── Retry automático en caso de fallo
```

### 12. Notificaciones del Sistema
```
├── Notificaciones in-app:
│   ├── Nuevo lead
│   ├── Cita proxima (15min antes)
│   ├── Tarea asignada
│   ├── Deal próximo a cerrar
│   └── Mención en nota
├── Notificaciones push:
│   ├── Browser notifications
│   └── Email notifications
└── Configuración por usuario:
    └── Activar/Desactivar por tipo de notificación
```

---

## 🗂️ Checklist de Modules del CRM

| # | Módulo | Estado Base | Frontend a crear |
|---|--------|-------------|------------------|
| 1 | Landing + Botones WA | ✅ Existe | Config UI |
| 2 | Dashboard (KPIs + Acciones) | ✅ Backend | ✅ Crear |
| 3 | Conversations (WA) | ✅ Listo en whatsapp-prueba | Unificar |
| 4 | Contacts + Companies | ✅ Backend | ✅ Crear |
| 5 | Deals (Pipeline) | ✅ Backend | ✅ Crear |
| 6 | Email (Send + Config) | ✅ Backend | ✅ Crear |
| 7 | Tasks | ✅ Backend | ✅ Crear |
| 8 | Citas/Bookings | ⚠️ Migración V19 | ✅ Crear |
| 9 | Settings | ⚠️ Parcial | ✅ Completar |
| 10 | Templates (WA + Email) | ⚠️ MongoDB | ✅ Crear |
| 11 | Bitácora (Activity Log) | ⚠️ Migración V20 | ✅ Crear |
| 12 | Auditoría | ⚠️ Backend | ✅ Crear |
| 13 | Export Data | ⚠️ Backend | ✅ Crear |
| 14 | Webhooks | ⚠️ Backend | UI Config |
| 15 | Analytics/Reports | ⚠️ Backend | ✅ Crear |
| 16 | Configuración Bots WA | ⚠️ Backend | ✅ Crear |

---

## 🎯 Resumen de Features por Plan (SaaS)

| Feature | Starter | Pro | Enterprise |
|---------|---------|-----|------------|
| Contactos ilimitados | ❌ (1k) | ✅ (10k) | ✅ |
| Agentes | 1-3 | 4-10 | 50+ |
| WhatsApp | ✅ | ✅ | ✅ |
| Email | ✅ | ✅ | ✅ |
| Deals Kanban | ❌ | ✅ | ✅ |
| Tasks | ❌ | ✅ | ✅ |
| Citas/Bookings | ❌ | ✅ | ✅ |
| Plantillas | ❌ | ✅ | ✅ |
| Analytics | ❌ | ✅ | ✅ |
| Export data | ❌ | ✅ | ✅ |
| Webhooks | ❌ | ❌ | ✅ |
| API access | ❌ | ❌ | ✅ |
| Custom domain | ❌ | ❌ | ✅ |
| White-label | ❌ | ❌ | ✅ |
| Multi-supervisor | ❌ | ❌ | ✅ |
| Soporte prioritario | ❌ | ❌ | ✅ |

### Conexión MongoDB Spring Boot
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/crm_data
spring.data.mongodb.database=crm_data
```

### Endpoints Templates
- `GET /api/templates/whatsapp` - Listar
- `POST /api/templates/whatsapp` - Crear
- `PUT /api/templates/whatsapp/{id}` - Actualizar
- `DELETE /api/templates/whatsapp/{id}` - Eliminar
- (Igual para email)

### Endpoints Actividad
- `GET /api/conversations/{id}/activity` - Ver bitácora
- `POST /api/conversations/{id}/activity` - Agregar entrada
- `GET /api/agents/{id}/metrics` - KPIs agente
- `GET /api/workspaces/{id}/agent-metrics` - KPIs todos

---

## ✅ Checklist Final - SaaS Version

### Infraestructura
- [ ] Rama `crm` creada
- [ ] MongoDB configurado
- [ ] Docker compose actualizado con MongoDB
- [ ] Sistema de subdominios (nginx config)
- [ ] SSL configurado (Let's Encrypt)

### Core CRM
- [ ] Dashboard con KPIs
- [ ] Conversations con bitácora
- [ ] Contacts + Companies
- [ ] Deals Kanban
- [ ] Email sender
- [ ] Tasks

### Features SaaS
- [ ] Sistema de organizations (multi-tenant)
- [ ] Registro con subdominio
- [ ] Plan STARTER implementado
- [ ] Plan PROFESSIONAL implementado
- [ ] Plan ENTERPRISE implementado
- [ ] Trial de 14 días
- [ ] Stripe Checkout integrado
- [ ] Webhook de payment
- [ ] Portal de billing para clientes

### Sistema de Equipos
- [ ] Settings completo
- [ ] Templates UI (WA + Email)
- [ ] Quick Actions
- [ ] Roles por organización
- [ ] KPIs por agente
- [ ] Bitácora visible para supervisors

### Marketing/Onboarding
- [ ] Email de bienvenida
- [ ] Guía de inicio
- [ ] Videos tutoriales (placeholder)
- [ ] Chat de soporte (integración)

### Métricas del Negocio
- [ ] Dashboard de métricas SaaS (MRR, ARR, Churn)
- [ ] Alertas de payment failed
- [ ] Reporte mensual de ingresos

---

## 💡 Siguientes pasos después del MVP

### Mes 1: Estabilización
- Tests de carga
- Optimización de performance
- Documentación de API
- Página de pricing actualizada

### Mes 2: Automations
- Chatbot builder básico
- Sequences (email/WhatsApp)
- Triggers y acciones

### Mes 3: Analytics Avanzado
- Reports customizables
- Dashboard builder
- Exportaciones avanzadas

### Mes 4: Integraciones
- Zapier/Make integration
- Webhooks customizables
- API pública

---

## 🐳 Docker Compose - Servicios

### Servicios incluidos
- **PostgreSQL** (datos principales) - Puerto 5432
- **Redis** (cache y sesiones) - Puerto 6379
- **MongoDB** (templates y datos flexibles) - Puerto 27017

### Para iniciar
```bash
docker-compose up -d
```

---

## 📄 Documentación de Credenciales

Ver archivo: `doc/CREDENTIALS.md`
- Credenciales de bases de datos
- Variables de entorno
- Comandos de testing
- Usuarios de prueba

---

## ✅ Estado de Implementación

### Fase 1: Setup (COMPLETADO ✅)
- [x] Rama `nexo-crm` creada desde `feat/startup-crm/whatsapp`
- [x] MongoDB agregado al docker-compose.yml
- [x] Configuración de Spring Boot para MongoDB
- [x] Documentación de credenciales en `doc/CREDENTIALS.md`

### Fase 2: Backend (PENDIENTE)
- [ ] Migraciones V19-V24
- [ ] Entidades para Appointments, Activity Log, Campaign Buttons
- [ ] Endpoints REST
- [ ] Servicios

### Fase 3: Frontend (PENDIENTE)
- [ ] Unificar estructura de frontend
- [ ] Dashboard con KPIs
- [ ] UI de Contacts, Deals, Tasks
- [ ] Settings completo
- [ ] Citas/Bookings UI

### Fase 4: Integración (PENDIENTE)
- [ ] Testing
- [ ] Deploy
- [ ] Documentación final

---

*Documento generado: 2024*
*Para: Nexo CRM SaaS v2.0*
*Versión: 1.0*
*Estado: Plan de acción*