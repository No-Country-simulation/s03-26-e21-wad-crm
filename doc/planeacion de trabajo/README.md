# 📋 Planeación de Trabajo - Startup CRM

Este directorio contiene los templates de issues y PRs para el proyecto Startup CRM.

---

## 📁 Estructura de archivos

| Archivo | Descripción |
|---------|-------------|
| `01-epic.md` | Issue madre del proyecto |
| `02-module.md` | Template de sub-issue (módulo) |
| `03-task.md` | Template de task individual |
| `04-pr-task.md` | PR de task individual |
| `05-pr-module.md` | PR de módulo (integra tasks) |
| `06-pr-final.md` | PR final (cierra Epic) |
| `07-convenciones-ramas-commits.md` | Convenciones de ramas y commits |
| `08-convenciones-prs.md` | Convenciones de Pull Requests |

---

## 🔄 Ciclo de vida completo

```
Epic (#1)
  └── Module (#2) ── PR Module ──▶ Closes #2
        └── Task (#5) ── PR Task ──▶ Closes #5
        └── Task (#6) ── PR Task ──▶ Closes #6
        └── Task (#7) ── PR Task ──▶ Closes #7
  └── Module (#3) ── PR Module ──▶ Closes #3
        └── Task (#8)
        └── Task (#9)
              ...
                    │
                    ▼
              PR Final ──▶ Closes #1
```

---

## 🎯 Cómo usar

1. **Crear Epic**: Usar `01-epic.md` como referencia
2. **Crear Module**: Usar `02-module.md` para cada módulo
3. **Crear Task**: Usar `03-task.md` para cada task
4. **Crear PR de Task**: Usar `04-pr-task.md`
5. **Crear PR de Module**: Usar `05-pr-module.md`
6. **Crear PR Final**: Usar `06-pr-final.md`

---

## 📝 Convenciones

### Ramas

| Tipo | Prefijo | Ejemplo |
|------|---------|---------|
| Feature | `feat/` | `feat/startup-crm` |
| Módulo | `feat/` | `feat/startup-crm/contacts` |
| Task | `task/` | `task/startup-crm/contacts/list` |

### Issues

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Epic | Issue +1 | #1 - Startup CRM |
| Module | Sub-issue | #3 - Gestión de Contactos |
| Task | Issue | #12 - Lista de contactos |

### PRs

| Tipo | Closes | Formato |
|------|--------|---------|
| Task PR | Closes #X | "task/module/name: Descripción" |
| Module PR | Closes #Y | "PR Módulo: Nombre del módulo" |
| Final PR | Closes #1 | "PR Final: Nombre del proyecto" |

---

## 🔗 Relación con GitHub Projects

Este formato es compatible con **GitHub Projects** (no Jira):

- **Epic** → Issue con标签 "Epic"
- **Module** → Sub-issue con标签 "Module"  
- **Task** → Issue con标签 "Task"
- **PR** → Pull Request linkeado al issue

---

## 📂 GitHub Templates

Los templates se encuentran en `.github/`:

```
.github/
├── ISSUE_TEMPLATE/
│   ├── epic.md      ← 🏗️ Epic - Proyecto grande
│   ├── module.md    ← 🏗️ Module - Sub-issue
│   ├── task.md      ← 🛠️ Task - Tarea individual
│   ├── bug.md       ← 🐛 Bug - Reporte de bug
│   └── feature.md   ← 💡 Feature - Nueva funcionalidad
└── pull_request_template.md
```

Para usar:
- Crear nuevo issue → GitHub muestra opciones automáticamente
- Crear PR → se usa el template automáticamente

---

## ✅ Ejemplo de flujo

1. Crear Epic #1 → `feat/startup-crm`
2. Crear Module #3 → `feat/startup-crm/contacts`
3. Crear Task #12 → `task/startup-crm/contacts/list`
4. Completar Task → Crear PR → `Closes #12`
5. Merge PR Task → `feat/startup-crm/contacts`
6. Completar todas Tasks → Crear PR Module → `Closes #3`
7. Merge PR Module → `feat/startup-crm`
8. Completar todos Módulos → Crear PR Final → `Closes #1`
9. Merge PR Final → `dev`

---

*Última actualización: 17 de marzo de 2026*
