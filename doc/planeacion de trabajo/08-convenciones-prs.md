# 🔀 Convenciones de Pull Requests

Este documento establece las convenciones para crear, revisar y mergeear Pull Requests en el proyecto Startup CRM.

---

## 📌 Estructura de PRs

### Tipos de PRs

| Tipo | Descripción | Cierra |
|------|-------------|--------|
| **PR de Task** | Implementa una task individual | Un Issue (Task) |
| **PR de Módulo** | Integra todas las tasks de un módulo | Un Issue (Module) |
| **PR Final** | Integra todos los módulos del Epic | El Epic (Issue madre) |
| **PR de Bugfix** | Corrección de un bug específico | Un Issue |
| **PR de Hotfix** | Corrección urgente en producción | Issue crítico |

---

## 📝 Plantillas de PR

### PR de Task

```markdown
# task/<module>/<name>: Descripción corta

## 📌 Issue Relacionado
- Closes #<issue_id>

## 📌 Descripción del PR
Descripción detallada de qué se implementó y por qué.

## ✅ Cambios incluidos
- Cambio 1
- Cambio 2

## 🧪 ¿Cómo probar?
1. Paso 1
2. Paso 2

## 🧩 Checklist de validación
- [ ] Item verificado
- [ ] Item verificado

## 🔀 Estrategia de merge
- Rama: task/<project>/<module>/<name>
- Destino: feat/<project>/<module>

## 📝 Notas
Notas opcionales para reviewers.
```

### PR de Módulo

```markdown
# 🏗️ PR Módulo: Nombre del Módulo

## 📌 Issue Relacionado
- Closes #<module_issue_id>

## 📌 Descripción del PR
Resumen de lo que incluye el módulo.

## ✅ Tasks integradas
- [x] task/module/task1
- [x] task/module/task2
- [x] task/module/task3

## 📁 Estructura del módulo
```
/src/features/<module>/
```

## 🧪 Validación
- [ ] Tests pasando
- [ ] Lint sin errores
- [ ] Build exitoso

## 🔀 Estrategia de merge
- Rama: feat/<project>/<module>
- Destino: feat/<project>
- Precondición: todas las tasks mergeadas
```

### PR Final

```markdown
# 🏗️ PR Final: Nombre del Proyecto

## 📌 Issue Relacionado
- Closes #<epic_id>

## 📌 Descripción del PR
Resumen completo del proyecto.

## ✅ Módulos completados
- [x] 🔐 Módulo Auth
- [x] 📇 Módulo Contactos
- [x] 💬 Módulo WhatsApp
- [x] 📧 Módulo Email

## 📁 Estructura final
```
/src/
```

## 🛠️ Herramientas integradas
- Next.js 14
- TypeScript
- Tailwind CSS
- MSW, Zustand, etc.

## 🚀 Validación
- [ ] npm run dev funciona
- [ ] npm run build compila
- [ ] No hay errores

## 🔀 Estrategia de merge
- Rama: feat/<project>
- Destino: dev
- Precondición: todos los módulos validados
```

---

## 🔖 Reglas de Nombrado

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Task | `task/<proyecto>/<módulo>/<nombre>` | `task/startup-crm/contacts/list` |
| Módulo | `feat/<proyecto>/<módulo>` | `feat/startup-crm/contacts` |
| Bugfix | `fix/<proyecto>/<descripción>` | `fix/startup-crm/login-redirect` |
| Hotfix | `hotfix/<proyecto>/<descripción>` | `hotfix/startup-crm/security-patch` |

---

## ✅ Checklist antes de crear PR

### Para Task PR
- [ ] Rama basada en módulo correcto
- [ ] Commits siguen convenciones semánticas
- [ ] Código pasa `npm run lint`
- [ ] Código pasa `npm run build`
- [ ] Tests agregados/actualizados
- [ ] Descripción incluye "Closes #X"
- [ ] Screenshots si hay cambio visual

### Para Module PR
- [ ] Todas las tasks mergeadas
- [ ] No hay conflictos con rama destino
- [ ] Tests de integración pasando
- [ ] Documentación actualizada
- [ ] "Closes #Y" referencia correcto

### Para Final PR
- [ ] Todos los módulos mergeados
- [ ] Tests E2E pasando
- [ ] Validación manual completa
- [ ] "Closes #Epic" referencia correcto
- [ ] CHANGELOG actualizado

---

## 👀 Proceso de Code Review

### Para el Autor
- ✅ PR pequeño (< 400 líneas)
- ✅ Descripción clara y completa
- ✅ Screenshots para cambios UI
- ✅ Links a issues relacionados
- ✅ Auto-review pasado

### Para el Reviewer
- ✅ Revisar dentro de 24 horas
- ✅ Comentar problemas específicos
- ✅ Aprobar si está listo
- ✅ Sugerir cambios si es necesario
- ✅ No bloquear sin razón

### Etiquetas (Labels)

| Label | Usar cuando |
|-------|-------------|
| `WIP` | Trabajo en progreso |
| `Needs Review` | Listo para revisar |
| `Approved` | Aprobado |
| `Changes Requested` | Requiere cambios |
| `Blocked` | Bloqueado por otro PR |
| `Bug` | Es un bug |
| `Enhancement` | Mejora |
| `Documentation` | Solo documentación |

---

## 🔀 Estrategia de Merge

### Flujo de merge

```
task/... ──merge──▶ feat/module ──merge──▶ feat/project ──merge──▶ dev
                  (PR Task)       (PR Module)       (PR Final)
```

### Tipos de Merge

| Tipo | Cuándo usarlo |
|------|---------------|
| **Squash and Merge** | ✅ Recomendado para task PRs - mantiene `dev` limpio |
| **Rebase and Merge** | ✅ Para mantener historial lineal |
| **Merge Commit** | ⚠️ Evitar - ensucia historial |

### Reglas de Protección

- ⛔ No hacer merge a `main` directamente
- ⛔ Require 1 aprobación mínimo
- ⛔ Require CI pasando
- ⛔ Require branches actualizados

---

## 🚨 Revertir un Merge

Si un merge causa problemas:

```bash
# Revertir el último merge
git revert -m 1 <merge_commit>

# Crear PR de revert
git push origin revert/fix-description
```

---

## 📋 Template en GitHub

Podés crear un template en `.github/pull_request_template.md`:

```markdown
## 📌 Issue Relacionado
- Closes #

## 📌 Descripción del PR

## ✅ Cambios incluidos

## 🧪 ¿Cómo probar?

## 🧩 Checklist de validación
- [ ] 

## 🔀 Estrategia de merge
- Rama: 
- Destino: 
```

---

## 🔗 Referencias

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Pull Request Template](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/about-issue-and-pull-request-templates)

---

*Última actualización: 17 de marzo de 2026*
