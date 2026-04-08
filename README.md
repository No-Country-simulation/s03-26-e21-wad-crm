# Nexo CRM

> CRM inteligente para startups — gestión de contactos, pipeline de ventas, tareas y comunicación multicanal (Email + WhatsApp).

[![Deploy](https://img.shields.io/badge/Landing-Render-blueviolet)](https://nexo-crm-landing.onrender.com)
[![Frontend](https://img.shields.io/badge/Frontend-Render-blue)](https://nexo-crm-web.onrender.com)
[![Backend](https://img.shields.io/badge/API-Render-green)](https://nexo-crm-api.onrender.com)

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Landing | Astro + Tailwind CSS |
| Frontend | React 19 + Vite + Tailwind CSS |
| Backend | Java 17 + Spring Boot 3.3 |
| Base de datos | PostgreSQL 16 |
| Cache | Redis 7 |
| ORM / Migraciones | Spring Data JPA + Flyway |
| Autenticación | JWT (access 15min + refresh 7d) |
| WebSockets | STOMP sobre SockJS |
| Mensajería | WhatsApp Cloud API (Meta) + SMTP/Gmail OAuth |
| Deploy | Render (Static Sites + Docker + PostgreSQL) |

---

## Estructura del repositorio

```
s03-26-e21-wad-crm/
├── landing/          # Sitio de marketing (Astro)
├── frontend/         # App React (SPA)
├── server/           # API REST Spring Boot
└── doc/              # Documentación y especificaciones
```

---

## Servicios en producción (Render)

| Servicio | URL | Tipo |
|---------|-----|------|
| Landing | https://nexo-crm-landing.onrender.com | Static Site |
| Frontend | https://nexo-crm-web.onrender.com | Static Site |
| Backend API | https://nexo-crm-api.onrender.com | Docker |
| Base de datos | PostgreSQL interno | Managed DB |

---

## Desarrollo local

### Requisitos

- Java 17
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Docker Desktop (para PostgreSQL y Redis)

### 1. Infraestructura

```bash
docker compose up -d postgres redis
```

### 2. Backend

```bash
cd server
./mvnw spring-boot:run
```

Disponible en:
- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Disponible en: `http://localhost:5173`

### 4. Landing

```bash
cd landing
pnpm install
pnpm dev
```

Disponible en: `http://localhost:4321`

Copia `landing/.env.example` a `landing/.env` y ajusta:

```env
PUBLIC_CRM_APP_URL=http://localhost:5173
PUBLIC_SITE_URL=http://localhost:4321
```

---

## Variables de entorno

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8080
```

### Backend (`server/src/main/resources/application-dev.yml`)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/crm_db
    username: postgres
    password: tu_password
```

---

## Módulos implementados

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| 🔐 Auth | ✅ | Registro, login, Google OAuth, JWT refresh |
| 👥 Contactos | ✅ | CRUD, búsqueda, filtros, notas, tags |
| 💼 Deals | ✅ | Pipeline kanban, historial de etapas |
| ✅ Tareas | ✅ | Recordatorios, prioridades, scheduler |
| 💬 WhatsApp | ✅ | Webhook Meta Cloud API, conversaciones |
| 📧 Email | ✅ | SMTP/Gmail OAuth, templates, tracking |
| 📊 Analytics | ✅ | Dashboard KPIs, tasa de conversión |
| ⚙️ Settings | ✅ | Workspace, integraciones, usuarios |

---

## Flujo de demo (10 min)

1. Abrir landing → clic en **Login** → redirige al frontend
2. Registrar cuenta nueva o usar credenciales de prueba
3. Explorar Dashboard con métricas del workspace
4. Crear un contacto y asociarle una tarea
5. Mover un deal entre etapas del pipeline
6. Revisar configuración de integraciones (Email / WhatsApp)

---

## Equipo

Proyecto desarrollado en **No Country** — simulación laboral s03-26-e21-wad-crm.
