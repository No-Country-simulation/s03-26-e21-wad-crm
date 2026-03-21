---
name: github-issue-generator
description: >
  Genera issues y PRs estructurados para GitHub (Epics, Modules, Tasks, PRs).
  Trigger: Cuando el usuario quiere crear un Epic con módulos, tasks y sus PRs.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.4"
---

## When to Use

- Usuario quiere crear un **Epic** (issue madre) con múltiples módulos
- Necesita generar **Modules** (sub-issues) derivados del Epic
- Quiere crear **Tasks** individuales con detalle completo
- Necesita generar **Pull Requests** con el formato del proyecto
- Cuando dice: "crear Epic", "generar PR", "crear task", "cerrar ciclo"

## Critical Patterns

### Ciclo Completo de un Feature

```
Epic (Issue Madre)
  └── Module (Sub-Issue - un módulo por funcionalidad)
        └── Task (Issue individual - una por cada feature pequeña)
              └── PR (Pull Request con "Closes #ID")
```

### Reglas de Generación

1. **Epic → Modules**: Cada módulo se convierte en una sub-issue
2. **Module → Tasks**: Cada task es un issue independiente
3. **Task → PR**: Cada task completada genera un PR que cierra su issue
4. **Se referencian**: "Closes #X" conecta PR con Issue

### Formato de Rama

```
Epic: feat/clinic-nc-project-flows
  ├── Module: feat/clinic-nc-project-flows/auth
  │     └── Task: task/auth/login
  │           └── PR: task/auth/login → Closes #X
```

## Input Requerido

### Para generar un Epic:

| Campo | Requerido | Ejemplo |
|-------|-----------|---------|
| Título | Sí | "Clínica NC - Desarrollo de flujos" |
| Rama base | Sí | "feat/clinic-nc-project-flows" |
| Rama destino | Sí | "dev" |
| Módulos | Sí | Lista: Auth, Citas, Perfil... |

### Para generar un Module:

| Campo | Requerido | Ejemplo |
|-------|-----------|---------|
| Título | Sí | "Autenticación" |
| Epic ID | Sí | #1 |
| Rama | Sí | "feat/clinic-nc-project-flows/auth" |
| Tasks | Sí | Lista: login, register... |

### Para generar una Task:

| Campo | Requerido | Ejemplo |
|-------|-----------|---------|
| Título | Sí | "task/auth/login" |
| Rama | Sí | "task/clinic-nc-project-flows/auth/login" |
| Rama base | Sí | "feat/clinic-nc-project-flows/auth" |

### Para generar un PR:

| Campo | Requerido | Ejemplo |
|-------|-----------|---------|
| Título | Sí | "task/auth/login: Login con email/password" |
| Task ID | Sí | #5 |
| Rama | Sí | "task/clinic-nc-project-flows/auth/login" |
| Rama destino | Sí | "feat/clinic-nc-project-flows/auth" |
| Descripción | Sí | Qué cambios incluye |
| Validación | Sí | Cómo probar |
| Checklist | Sí | Items de validación |

## Código de Ejemplo

### Generación de PR

```markdown
INPUT:
- Título: task/auth/login - Login de usuarios
- Task ID: #5
- Rama: task/clinic-nc-project-flows/auth/login
- Rama destino: feat/clinic-nc-project-flows/auth
- Descripción: Crear flujo de login con email/password y validación
- Cambios: Pantalla login, handler MSW, interfaz TypeScript, Zustand store
- Validación: npm run dev, probar credenciales correctas e incorrectas

OUTPUT:
# task/auth/login: Login de usuarios

## 📌 Issue Relacionado
- Closes #5

## 📌 Descripción del PR

Crear flujo de login con email/password y validación...

## ✅ Cambios incluidos

- Pantalla de login en /src/app/(auth)/login/page.tsx
- Handler MSW en /src/mocks/handlers/auth/login.ts
- Interfaz TypeScript en /src/core/auth/interfaces/
- Zustand store para autenticación

## 🧪 ¿Cómo probar?

1. npm run dev
2. Ir a /login
3. Probar credenciales correctas → redirige al dashboard
4. Probar credenciales incorrectas → muestra error

## 🧩 Checklist de validación

- [x] Login funcional
- [x] Manejo de errores
- [x] Validación de inputs
- [x] Integración con MSW

## 🔀 Estrategia de merge

- Rama: task/clinic-nc-project-flows/auth/login
- Destino: feat/clinic-nc-project-flows/auth

---

Asignado: @davidcoachdev
```

## Commands

No hay comandos especiales — el skill se activa cuando el usuario describe lo que necesita.

## Resources

- **Templates**: Ver [assets/](assets/) para:
  - `template-epic.md` - Issue madre con módulos
  - `template-module.md` - Sub-issue (módulo con tasks)
  - `template-task.md` - Task individual
  - `template-pr.md` - PR de task individual
  - `template-pr-module.md` - PR de módulo (integra tasks del módulo)
  - `template-pr-final.md` - PR final que cierra el Epic
- **Ejemplos**: Los ejemplos en la conversación del usuario son la referencia definitiva
