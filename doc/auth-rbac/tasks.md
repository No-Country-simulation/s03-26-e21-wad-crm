# Tareas: Auth & RBAC System

## Fase 1: Setup y Base de Datos

### 1.1 Configuración de Proyecto Backend
- [ ] Inicializar proyecto Node.js con TypeScript
- [ ] Instalar dependencias: express, bcrypt, jsonwebtoken, passport, pg, zod, dotenv
- [ ] Configurar TypeScript (tsconfig.json)
- [ ] Crear estructura de carpetas según design.md
- [ ] Configurar variables de entorno (.env.example)

### 1.2 Migraciones de Base de Datos
- [ ] Crear tabla `workspaces`
- [ ] Crear tabla `users` con índices
- [ ] Crear tabla `sessions` para refresh tokens
- [ ] Crear tabla `user_invitations`
- [ ] Ejecutar migraciones en PostgreSQL local
- [ ] Crear script de seed para workspace inicial

### 1.3 Conexión a Base de Datos
- [ ] Implementar `database/connection.ts` con node-postgres
- [ ] Crear pool de conexiones con manejo de errores
- [ ] Implementar función de health check

---

## Fase 2: Servicio de Autenticación

### 2.1 Utilidades
- [ ] Implementar `utils/errors.ts` (UnauthorizedError, ForbiddenError, etc.)
- [ ] Implementar `utils/validators.ts` con esquemas Zod
- [ ] Crear tipos TypeScript para User, Workspace, Session

### 2.2 Token Service
- [ ] Implementar generación de access tokens JWT
- [ ] Implementar generación de refresh tokens
- [ ] Implementar verificación de tokens
- [ ] Implementar rotación de refresh tokens
- [ ] Implementar hash de refresh tokens (bcrypt)

### 2.3 Auth Controller & Routes
- [ ] Implementar `POST /api/auth/register`
- [ ] Implementar `POST /api/auth/login`
- [ ] Implementar `POST /api/auth/refresh`
- [ ] Implementar `POST /api/auth/logout`
- [ ] Implementar `POST /api/auth/google`
- [ ] Agregar rate limiting a endpoints de auth

### 2.4 Passport Strategies
- [ ] Implementar LocalStrategy (email/password)
- [ ] Implementar GoogleStrategy (OAuth 2.0)

---

## Fase 3: Middleware de Protección

### 3.1 Auth Middleware
- [ ] Implementar middleware de verificación de JWT
- [ ] Implementar middleware de extracción de usuario
- [ ] Manejar token expirado (retornar 401 específico)

### 3.2 Workspace Middleware
- [ ] Implementar middleware de aislamiento por workspace
- [ ] Añadir workspace_id a request

### 3.3 RBAC Middleware
- [ ] Implementar middleware de verificación de rol
- [ ] Crear decorador @Roles() para rutas
- [ ] Crear decorador @Permissions() para control granular

---

## Fase 4: Gestión de Usuarios

### 4.1 Users Service
- [ ] Implementar CRUD de usuarios
- [ ] Implementar búsqueda por email
- [ ] Implementar búsqueda por workspace
- [ ] Implementar soft delete (desactivar usuario)
- [ ] Implementar actualización de rol

### 4.2 Users Controller & Routes
- [ ] Implementar `GET /api/users` (admin)
- [ ] Implementar `PATCH /api/users/:id` (admin)
- [ ] Implementar `DELETE /api/users/:id` (admin)
- [ ] Proteger rutas con middleware RBAC

### 4.3 Invitations Service
- [ ] Implementar generación de token de invitación
- [ ] Implementar envío de email de invitación
- [ ] Implementar aceptación de invitación
- [ ] Implementar expiración de invitación (24h)

### 4.4 Invitations Controller & Routes
- [ ] Implementar `POST /api/users/invite` (admin)
- [ ] Implementar `POST /api/invitations/:token/accept`
- [ ] Implementar `GET /api/invitations` (listar)

---

## Fase 5: Frontend - Autenticación

### 5.1 Setup NextAuth
- [ ] Instalar next-auth
- [ ] Configurar `src/lib/auth.ts`
- [ ] Configurar providers (Google, Credentials)
- [ ] Configurar callbacks (jwt, session)
- [ ] Crear API route `/api/auth/[...nextauth]`

### 5.2 Páginas de Auth
- [ ] Crear página `/login`
- [ ] Crear formulario de login con email/password
- [ ] Crear botón de Google OAuth
- [ ] Crear página `/register`
- [ ] Crear página de error/login inválido

### 5.3 Componentes de Auth
- [ ] Crear `LoginForm.tsx`
- [ ] Crear `GoogleButton.tsx`
- [ ] Crear `UserMenu.tsx` (dropdown con logout)
- [ ] Crear `ProtectedRoute.tsx`

### 5.4 Context y Hooks
- [ ] Crear `AuthContext.tsx` (proveedor de sesión)
- [ ] Crear hook `useAuth()`
- [ ] Crear hook `useRole()` para verificar rol

---

## Fase 6: Frontend - Dashboard Protegido

### 6.1 Layout de Dashboard
- [ ] Crear layout con sidebar
- [ ] Incluir UserMenu en header
- [ ] Implementar navegación según rol

### 6.2 Protección de Rutas
- [ ] Crear componente `RoleGuard.tsx`
- [ ] Proteger rutas de dashboard
- [ ] Redirigir a login si no autenticado

### 6.3 Gestión de Usuarios (Admin)
- [ ] Crear página `/settings/users`
- [ ] Listar usuarios del workspace
- [ ] Formulario para invitar usuario
- [ ] Dropdown para cambiar rol
- [ ] Botón para desactivar usuario

---

## Fase 7: Testing

### 7.1 Unit Tests
- [ ] Tests para token.service.ts
- [ ] Tests para auth.service.ts
- [ ] Tests para user.service.ts

### 7.2 Integration Tests
- [ ] Tests para endpoints /api/auth/*
- [ ] Tests para endpoints /api/users/*

### 7.3 E2E Tests
- [ ] Test flujo registro → login → logout
- [ ] Test flujo Google OAuth
- [ ] Test verificación de permisos

---

## Fase 8: Documentación

### 8.1 Documentación de API
- [ ] Documentar endpoints con OpenAPI/Swagger
- [ ] Crear colección de Postman

### 8.2 README
- [ ] Crear guía de instalación
- [ ] Crear guía de configuración de Google OAuth
- [ ] Documentar variables de entorno

---

## Dependencias entre Tareas

```
Fase 1 (Setup)
  ├── 1.1 Configuración → 1.2 Migraciones
  └── 1.2 Migraciones → 1.3 Conexión

Fase 2 (Auth Service)
  ├── 2.1 Utilidades → 2.2 Token Service
  ├── 2.2 Token Service → 2.3 Auth Controller
  └── 2.1 Utilidades → 2.4 Passport

Fase 3 (Middleware)
  ├── Fase 2 completa → 3.1 Auth Middleware
  ├── 3.1 Auth Middleware → 3.2 Workspace
  └── 3.2 Workspace → 3.3 RBAC

Fase 4 (Users)
  ├── 2.3 Auth Controller → 4.1 Users Service
  ├── 3.3 RBAC → 4.2 Users Controller
  └── 4.1 Users Service → 4.3 Invitations

Fase 5 (Frontend Auth)
  ├── Fase 1+2+3+4 → 5.1 Setup NextAuth
  ├── 5.1 Setup → 5.2 Páginas
  └── 5.2 Páginas → 5.3 Componentes

Fase 6 (Dashboard)
  ├── 5.3 Componentes → 6.1 Layout
  ├── 6.1 Layout → 6.2 Protección
  └── 4.2 Users Controller → 6.3 Gestión

Fase 7 (Testing)
  └── Todas las fases → 7.1, 7.2, 7.3

Fase 8 (Docs)
  └── Todas las fases → 8.1, 8.2
```

---

## Estimación de Tiempo

| Fase | Días | Responsable |
|------|------|--------------|
| Fase 1: Setup | 2 | |
| Fase 2: Auth Service | 3 | |
| Fase 3: Middleware | 2 | |
| Fase 4: Users | 2 | |
| Fase 5: Frontend Auth | 2 | |
| Fase 6: Dashboard | 2 | |
| Fase 7: Testing | 2 | |
| Fase 8: Docs | 1 | |

**Total: 16 días**

---

## Definition of Done

- [ ] Todos los tests pasan
- [ ] Login con email/password funciona
- [ ] Login con Google OAuth funciona
- [ ] Refresh token rotation funciona
- [ ] RBAC restricciones aplicadas
- [ ] Documentación actualizada
- [ ] Code review aprobado
