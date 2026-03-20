# 📋 Agenda - Startup CRM

## 🎯 Qué es este proyecto

CRM inteligente con integración WhatsApp + Email para startups. Gestión de contactos, conversaciones en tiempo real, automatizaciones y métricas.

---

## 📂 Estructura de documentación

| Carpeta | Contenido |
|---------|-----------|
| `doc/planeacion de trabajo/` | Templates y convenciones de issues/PRs |
| `doc/history-user/` | Historias de usuario por módulo |
| `doc/auth-rbac/` | SDD completo de ejemplo (autenticación) |
| `.github/ISSUE_TEMPLATE/` | Templates automáticos de GitHub |

---

## 🔄 Flujo de trabajo

```
Epic → Module → Task → PR Task → PR Module → PR Final → dev
```

### Niveles

| Nivel | Descripción | Template |
|-------|-------------|----------|
| **Epic** | Proyecto grande o feature principal | `01-epic.md` |
| **Module** | Submódulo dentro de un Epic | `02-module.md` |
| **Task** | Tarea individual | `03-task.md` |

---

## 🌿 Convenciones de ramas

```
dev
  └── feat/startup-crm              ← Rama Epic
        ├── feat/startup-crm/auth         ← Rama Module
        │     └── task/auth/login        ← Rama Task
        ├── feat/startup-crm/contacts
        ├── feat/startup-crm/whatsapp
        ├── feat/startup-crm/email
        ├── feat/startup-crm/metrics
        └── feat/startup-crm/settings
```

| Tipo | Prefijo | Ejemplo |
|------|---------|---------|
| Feature/Epic | `feat/` | `feat/startup-crm` |
| Módulo | `feat/` | `feat/startup-crm/contacts` |
| Task | `task/` | `task/startup-crm/contacts/list` |

---

## 📝 Cómo usar los templates

### 1. Crear un Epic

```bash
gh issue create --template epic.md
```

O usar `doc/planeacion de trabajo/01-epic.md` como referencia.

### 2. Crear un Module

```bash
gh issue create --template module.md
```

O usar `doc/planeacion de trabajo/02-module.md`.

### 3. Crear una Task

```bash
gh issue create --template task.md
```

O usar `doc/planeacion de trabajo/03-task.md`.

### 4. Crear un PR

| Tipo | Formato de título | Closes |
|------|-------------------|--------|
| Task PR | `task/module/name: Descripción` | `Closes #X` |
| Module PR | `PR Módulo: Nombre del módulo` | `Closes #Y` |
| Final PR | `PR Final: Nombre del proyecto` | `Closes #1` |

---

## ✅ Módulos del proyecto

| Módulo | Estado | Rama |
|--------|--------|------|
| 🔐 Autenticación | ⏳ | `feat/startup-crm/auth` |
| 📇 Contactos | ⏳ | `feat/startup-crm/contacts` |
| 💬 WhatsApp | ⏳ | `feat/startup-crm/whatsapp` |
| 📧 Email | ⏳ | `feat/startup-crm/email` |
| 📊 Métricas | ⏳ | `feat/startup-crm/metrics` |
| ⚙️ Configuración | ⏳ | `feat/startup-crm/settings` |

---

## 🔗 Enlaces útiles

- 📄 [project.md](./project.md) - Requerimientos del cliente
- 📋 [Planeación de trabajo](./doc/planeacion%20de%20trabajo/README.md) - Guía completa
- 📂 [GitHub Templates](./.github/) - Templates automáticos
- 📖 [Historias de usuario](./doc/history-user/) - Detalle por módulo
- 🏗️ [SDD Auth (ejemplo)](./doc/auth-rbac/) - Spec-Driven Development de ejemplo

---

## 📝 Convenciones de Commits

Usar **Conventional Commits**:

```
<tipo>(<scope>): descripción

feat(auth): add login functionality
fix(contacts): resolve N+1 query issue
docs(readme): update installation guide
chore(deps): upgrade dependencies
refactor(api): simplify error handling
```

### Tipos permitidos

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Documentación |
| `chore` | Mantenimiento, dependencias |
| `refactor` | Refactoring sin cambio de funcionalidad |
| `test` | Tests |
| `style` | Formato, style (no lógica) |
| `perf` | Mejoras de performance |
| `ci` | Configuración de CI/CD |

### Reglas

- **Descripción en imperativo**: "add" no "added", "fix" no "fixed"
- **Scope opcional**: usar el nombre del módulo/componente
- **Sin punto final** en la descripción
- **Máximo 72 caracteres** en la primera línea
- **Si hay body**, separar con línea en blanco

---

*Última actualización: 19 de marzo de 2026*
