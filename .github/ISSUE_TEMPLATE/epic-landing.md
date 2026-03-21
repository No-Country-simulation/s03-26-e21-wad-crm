---
name: "🚀 Epic - Landing Page"
about: "Crear Landing Page completa con CTA a WhatsApp y acceso al CRM"
title: "🚀 Epic: Landing Page - Startup CRM"
labels: ["Epic", "planning"]
assignees: "davidcoachdev"
---

# 🚀 Epic: Landing Page - Startup CRM

## 📋 Descripción

Desarrollar una landing page profesional para el Startup CRM que funcione como punto de entrada para potenciales clientes. La landing debe transmitir confianza, mostrar el valor del producto y facilitar el contacto inicial vía WhatsApp.

## 🎯 Objetivo

Crear una landing page moderna, rápida y persuasiva que:
- Presente el CRM de manera clara y atractiva
- Incluya un CTA prominente a WhatsApp
- Tenga acceso directo al login del CRM
- Convierta visitantes en leads

> ✨ **Contexto**: Esta landing será el punto de entrada web del proyecto. Debe estar en `/landing/` y ser independiente del CRM principal.

---

## 🧩 Sub-Issues (Módulos)

- [ ] **Module: Header/Navbar** → Barra de navegación con logo + botón Login
- [ ] **Module: Hero Section** → Titular impactante + CTA WhatsApp
- [ ] **Module: Features/Beneficios** → Grid de features del CRM
- [ ] **Module: Social Proof** → Testimonios y logos de clientes
- [ ] **Module: Footer** → Links, contacto y redes

---

## 📁 Convención de entregables

| Tipo | Ubicación |
|------|-----------|
| Componentes | `/landing/src/components/` |
| Layout | `/landing/src/layouts/` |
| Assets | `/landing/public/` |
| Estilos | `/landing/src/styles/` |

---

## 🔀 Estrategia de ramas y PRs

1. **Rama madre del proyecto**: `feat/startup-crm/landing`

2. **Rama por módulo**: `feat/startup-crm/landing/{module}` (creada desde `feat/startup-crm/landing`)

3. **Flujo de merges**:  
   - `task/...` → **PR a su rama de módulo**  
   - Cuando todas las tasks de un módulo estén listas → **PR del módulo a `feat/startup-crm/landing`**  
   - Cuando todos los módulos estén listos → **PR de `feat/startup-crm/landing` → `dev`**

---

## 📱 Wireframe / Estructura Visual

```
┌─────────────────────────────────────────────────────────────┐
│  🔵 LOGO                              [Iniciar Sesión] 📝  │  ← Header/Navbar
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         🚀 CRM para Startups                                │
│         Gestiona clientes, conversaciones y                  │
│         automatizaciones en un solo lugar.                  │
│                                                             │
│         [💬 Escribir por WhatsApp] ← CTA PRINCIPAL         │
│                                                             │
│         📱 Dashboard preview screenshot                     │
│                                                             │  ← Hero Section
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ✨ Feature 1          ✨ Feature 2          ✨ Feature 3   │
│   Gestión de           Conversaciones        Automatizaciones
│   Contactos            en Tiempo Real        Inteligentes    │  ← Features
│                                                             │
│   ✨ Feature 4          ✨ Feature 5          ✨ Feature 6   │
│   Integración          Métricas y            Multi-usuario
│   Email/WhatsApp        Dashboard             y Roles
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   "⭐⭐⭐⭐⭐"                                                 │
│   "Increíble CRM, me ayudó a                                │
│    organizar mi startup"                                   │
│    — Juan Pérez, CEO @Startup                              │
│                                                             │  ← Social Proof
│   [Logo1] [Logo2] [Logo3] [Logo4]                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   📧 hola@startupcrm.com                                    │
│   💬 +54 11 1234-5678                                      │
│   [Términos] [Privacidad] [Twitter] [LinkedIn]             │  ← Footer
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist final

| Módulo | Rama | Estado |
|--------|------|--------|
| Header/Navbar | `feat/startup-crm/landing/header` | ⏳ |
| Hero Section | `feat/startup-crm/landing/hero` | ⏳ |
| Features | `feat/startup-crm/landing/features` | ⏳ |
| Social Proof | `feat/startup-crm/landing/social-proof` | ⏳ |
| Footer | `feat/startup-crm/landing/footer` | ⏳ |

---

## 🛠️ Detalle de Módulos

### 1. Header/Navbar
- Logo del CRM a la izquierda
- Botón "Iniciar Sesión" a la derecha (enlace a `/crm/login`)
- Sticky en scroll
- Responsive (hamburger menu en mobile)

### 2. Hero Section
- Titular principal: "CRM para Startups - Gestiona clientes, conversaciones y automatizaciones"
- Subtítulo descriptivo
- **CTA PRINCIPAL**: Botón "💬 Escribir por WhatsApp" → Abre wa.me con mensaje predefinido
- Imagen/preview del dashboard

### 3. Features/Beneficios (Grid 3x2)
- Gestión de Contactos
- Conversaciones en Tiempo Real
- Automatizaciones Inteligentes
- Integración Email/WhatsApp
- Métricas y Dashboard
- Multi-usuario y Roles

### 4. Social Proof
- Testimonios con foto, nombre, cargo y empresa
- Logos de clientes (placeholder si no hay)
- Rating/reputación visual

### 5. Footer
- Email de contacto
- WhatsApp
- Links: Términos, Privacidad
- Redes sociales: Twitter/X, LinkedIn
- Copyright

---

👷‍♂️ **Responsable**: @davidcoachdev  
🔀 **Rama madre**: `feat/startup-crm/landing`  
🎯 **Rama destino**: `dev`  
📅 **Estado**: En planificación
