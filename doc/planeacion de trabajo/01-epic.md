# 🏗️ Epic - Startup CRM

## 📋 Descripción

Desarrollar un sistema CRM inteligente con integración nativa a WhatsApp y correo electrónico, diseñado para startups que gestionan relaciones con leads y clientes en tiempo real.

## 🎯 Objetivo

Centralizar conversaciones, automatizar seguimientos y segmentar usuarios, priorizando una experiencia simple, colaborativa y asincrónica.

---

## 🧩 Módulos

### 1. 🔐 Autenticación y Usuarios
- Gestión de usuarios y roles
- Login, registro, recuperación de contraseña

### 2. 📇 Gestión de Contactos
- Contactos y empresas
- Segmentación por estado del funnel
- Etiquetas y filtros

### 3. 💬 Comunicación - WhatsApp
- Integración WhatsApp Cloud API
- Conversaciones en tiempo real
- Plantillas de mensajes

### 4. 📧 Comunicación - Email
- Integración SMTP/Brevo
- Envío y registro de emails
- Plantillas de email

### 5. 📊 Panel de Métricas
- KPIs clave
- Visualización de datos
- Exportación CSV/PDF

### 6. ⚙️ Configuración
- Configuración de cuenta
- Automatizaciones
- Recordatorios

---

## 📁 Convención de entregables

| Tipo | Ubicación |
|------|-----------|
| Diseños | `/designs/excalidraw/[modulo]/[nombre].excalidraw` |
| Modelo | `/designs/drawio/[modulo]/[nombre].drawio` |
| Interfaces | `/src/core/[modulo]/interfaces/` |
| Pantallas | `/src/app/(rol)/[ruta]/page.tsx` |
| Mocks | `/src/mocks/handlers/[modulo]/[nombre].handler.ts` |

---

## 🔀 Estrategia de ramas

```
dev
  └── feat/startup-crm
        ├── feat/startup-crm/auth
        ├── feat/startup-crm/contacts
        ├── feat/startup-crm/whatsapp
        ├── feat/startup-crm/email
        ├── feat/startup-crm/metrics
        └── feat/startup-crm/settings
```

---

## ✅ Checklist de módulos

| Módulo | Rama | Estado |
|--------|------|--------|
| 🔐 Autenticación | feat/startup-crm/auth | ⏳ |
| 📇 Contactos | feat/startup-crm/contacts | ⏳ |
| 💬 WhatsApp | feat/startup-crm/whatsapp | ⏳ |
| 📧 Email | feat/startup-crm/email | ⏳ |
| 📊 Métricas | feat/startup-crm/metrics | ⏳ |
| ⚙️ Configuración | feat/startup-crm/settings | ⏳ |

---

👷‍♂️ **Responsable**: @equipo  
🔀 **Rama madre**: `feat/startup-crm`  
🎯 **Rama destino**: `dev`  
📅 **Estado**: En planificación
