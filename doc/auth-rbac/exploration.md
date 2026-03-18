# Exploración: Auth & RBAC System

## Estado Actual

**Proyecto nuevo sin sistema de autenticación.** No existe estructura de usuarios, roles ni permisos definidos.

---

## Áreas Afectadas

| Área | Descripción |
|------|-------------|
| `/frontend` | Páginas de login, register, forgot-password, dashboard |
| `/backend/auth` | Servicio de autenticación (Node.js) |
| `/backend/middleware` | Verificación de tokens y permisos |
| `/database` | Tablas de usuarios, roles, permisos, workspaces |

---

## Enfoques Propuestos

### 1. Stack de Autenticación

**Opción A: NextAuth.js + Passport.js**
- Pros: well-maintained, integración fácil con Google, callbacks flexibles
- Cons: NextAuth es frontend-centric, backend separado necesita Passport
- Effort: Low

**Opción B: JWT manual con Fastify/Express**
- Pros: Control total, menos dependencias
- Cons: Hay que implementar todo manualmente (rotation, refresh, etc.)
- Effort: Medium

**Opción C: Firebase Auth**
- Pros: Serverless, gestión de usuarios incluida
- Cons: Vendor lock-in, cost eventually, menos control
- Effort: Low

### 2. RBAC Implementation

**Opción A: Base de datos**
- Tablas: roles, permissions, user_roles, role_permissions
- Pros: Flexible, editable desde admin
- Cons: Más queries, overhead

**Opción B: hardcoded en código**
- Enum de roles con permisos
- Pros: Rápido, simple
- Cons: No editable, requiere deploy para cambios

---

## Recomendación

1. **Auth**: NextAuth.js (frontend) + JWT con refresh tokens (backend)
2. **RBAC**: Base de datos con tabla de permisos para flexibilidad de admin
3. **Multi-tenancy**: Workspaces como entidad raíz

---

## Riesgos

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Tokens robados | Alta | Short-lived access tokens, refresh rotation |
| Escalabilidad | Media | Stateless JWT permite horizontal scaling |
| Google OAuth quota | Baja | Email/password como fallback |

---

## Ready for Proposal

**Sí.** El análisis está completo y hay claridad sobre el enfoque técnico.
