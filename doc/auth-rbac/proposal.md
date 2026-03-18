# Propuesta: Auth & RBAC System

## Resumen Ejecutivo

Sistema de autenticación y control de acceso para el CRM Startup, basado en JWT con refresh tokens y Google OAuth 2.0. Implementa RBAC con 5 roles y soporte multi-tenant mediante workspaces.

---

## Problema

El CRM necesita un sistema de seguridad que:
- Permita múltiples usuarios con diferentes niveles de acceso
- Garantice aislamiento de datos entre organizaciones (workspaces)
- Proporcione experiencia de login fluida (Google OAuth)
- Sea escalable y seguro

---

## Alcance

### Incluido
- Registro y login con email/password
- Login con Google OAuth 2.0
- Sistema de JWT con access/refresh tokens
- RBAC con 5 roles predefinidos
- Gestión de usuarios por administradores
- Multi-tenancy mediante workspaces
- Logout y invalidación de sesiones

### Excluido
- Two-Factor Authentication (2FA)
- Login con redes sociales (solo Google)
- SSO empresarial
- Recuperación de contraseña por SMS

---

## Enfoque

### Arquitectura
- **Frontend**: NextAuth.js para manejo de sesión
- **Backend**: Express/Fastify con JWT (Node.js)
- **Base de datos**: PostgreSQL con tablas de usuarios, roles, permisos
- **OAuth**: Google Cloud Console para autenticación

### Flujo de Autenticación
1. Usuario inicia sesión (email/password o Google)
2. Backend verifica credenciales y genera JWT (access + refresh)
3. Frontend almacena tokens (httpOnly cookies para access, secure storage para refresh)
4. Cada request incluye access token en header
5. Si access expira, se usa refresh token para obtener nuevo par
6. Refresh token rotation en cada uso (seguridad)

### Roles y Permisos

| Rol | Descripción | Permisos |
|-----|-------------|-----------|
| Admin | Administrador del workspace | CRUD total, gestión usuarios, settings |
| Manager | Gestor de equipo | CRUD en contacts/deals, ver analytics |
| Sales | Vendedor | Crear/editar/leer en su área |
| Support | Atención al cliente | Leer contacts, gestionar conversaciones |
| Viewer | Solo lectura | Ver dashboard y reports |

---

## Cronograma Estimado

- **Fase 1**: Setup proyecto + DB migrations (2 días)
- **Fase 2**: Auth endpoints + JWT (3 días)
- **Fase 3**: Google OAuth (2 días)
- **Fase 4**: RBAC middleware (2 días)
- **Fase 5**: Frontend pages + testing (3 días)

**Total estimado**: 12 días

---

## Riesgos

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Google OAuth no aprobado | Medio | Email/password como primary |
| Rate limits JWT | Bajo | Token rotation mitiga |
| Session hijacking | Alto | httpOnly cookies, HTTPS only |

---

## Success Criteria

- [ ] Login con email/password funciona
- [ ] Login con Google OAuth funciona
- [ ] JWT tokens se generan y validan correctamente
- [ ] Refresh token rotation funciona
- [ ] RBAC restricciones se aplican en backend
- [ ] Frontend protege rutas según rol
- [ ] Multi-tenancy aísla datos entre workspaces

---

## Siguiente Paso

Proceder a Spec para detallar historias de usuario y criterios de aceptación.
