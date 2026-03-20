# 🔀 Convenciones de Ramas y Commits

Este documento establece las convenciones para nombrar ramas y escribir commits semánticos en el proyecto Startup CRM.

---

## 📌 Ramas

### Prefijos

| Tipo | Prefijo | Ejemplo | Descripción |
|------|---------|---------|-------------|
| **Feature** | `feat/` | `feat/startup-crm` | Rama madre del proyecto |
| **Módulo** | `feat/` | `feat/startup-crm/contacts` | Rama de un módulo |
| **Task** | `task/` | `task/startup-crm/contacts/list` | Rama de una tarea |
| **Bugfix** | `fix/` | `fix/contacts-list-pagination` | Corrección de bug |
| **Hotfix** | `hotfix/` | `hotfix/login-redirect` | Corrección urgente |
| **Release** | `release/` | `release/v1.0.0` | Preparación de release |
| **Experimento** | `experiment/` | `experiment/new-ui` | Pruebas experimentales |

### Estructura de Ramas

```bash
dev
  └── feat/startup-crm                    (Epic)
        ├── feat/startup-crm/auth          (Módulo)
        │     └── task/startup-crm/auth/login
        │     └── task/startup-crm/auth/register
        ├── feat/startup-crm/contacts      (Módulo)
        │     └── task/startup-crm/contacts/list
        │     └── task/startup-crm/contacts/create
        └── feat/startup-crm/whatsapp     (Módulo)
              └── task/startup-crm/whatsapp/send
```

### Reglas de Nombrado

- ✅ Usar **kebab-case** (minúsculas con guiones)
- ✅ Incluir **ID de proyecto** al inicio (ej: `startup-crm`)
- ✅ Incluir **nombre del módulo** (ej: `contacts`)
- ✅ Incluir **nombre descriptivo** (ej: `list`, `login`)
- ❌ NO usar mayúsculas
- ❌ NO usar espacios
- ❌ NO usar tildes o caracteres especiales

### Ejemplos Buenos y Malos

| ❌ Malo | ✅ Bueno |
|---------|----------|
| `feature/Contacts` | `feat/startup-crm/contacts` |
| `task/crear_contacto` | `task/startup-crm/contacts/create` |
| `fix-Bug-en-login` | `fix/login-validation` |
| `rama-prueba` | `experiment/new-theme` |

---

## 📝 Commits Semánticos

### Formato

```bash
<tipo>(<alcance>): <mensaje>
```

- **tipo**: Tipo de cambio
- **alcance** (opcional): Módulo o componente afectado
- **mensaje**: Resumen en presente tense

### Tipos de Commits

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad para el usuario | `feat(contacts): add filter by status` |
| `fix` | Bug fix para el usuario | `fix(login): resolve redirect loop` |
| `docs` | Cambios en documentación | `docs: update API endpoints` |
| `style` | Formateo, sin cambio lógico | `style: format with Prettier` |
| `refactor` | Refactorización de código | `refactor(auth): extract validation logic` |
| `test` | Agregar o modificar tests | `test(contacts): add unit tests` |
| `chore` | Tareas de mantenimiento | `chore: update dependencies` |
| `build` | Cambios en build o dependencias | `build: add MSW package` |
| `ci` | Cambios en CI/CD | `ci: add GitHub Actions workflow` |
| `perf` | Mejora de performance | `perf(list): implement virtual scroll` |

### Reglas de Mensaje

- ✅ Usar **imperativo** ("add" no "added")
- ✅ Primer letra **minúscula**
- ✅ Sin punto al final
- ✅ Máximo 72 caracteres
- ✅ Si es largo, usar cuerpo multilínea

### Ejemplos de Commits Buenos

```bash
feat(contacts): add filter by status in contacts list
feat(whatsapp): integrate WhatsApp Cloud API send message
fix(login): resolve redirect loop on invalid credentials
refactor(auth): extract validation to useCase layer
test(contacts): add unit tests for filter logic
docs: update API documentation with new endpoints
style: format all components with Prettier
chore: update dependencies to latest versions
```

### Ejemplos de Commits Malos

| ❌ Malo | ✅ Bueno |
|---------|---------|
| `fix bug` | `fix(contacts): resolve filter not working` |
| ` update` | `feat(contacts): add search functionality` |
| `Added new feature` | `feat(auth): add Google OAuth login` |
| `WIP` | `feat(list): add pagination controls` |
| `fixed it` | `fix(login): handle empty password error` |

---

## 🔄 Relación Ramas ↔ Commits

### Flujo de Trabajo

1. **Crear rama desde feature/module**
   ```bash
   git checkout -b task/startup-crm/contacts/list
   ```

2. **Hacer commits semánticos**
   ```bash
   git add .
   git commit -m "feat(contacts): add list component with table"
   git commit -m "feat(contacts): add MSW mock handler"
   git commit -m "fix(contacts): resolve pagination bug"
   ```

3. **Crear PR con Closes**
   ```bash
   # En el PR description:
   # Closes #12
   ```

---

## ✅ Checklist antes de hacer PR

- [ ] Commits siguen formato semántico
- [ ] Rama sigue convención de nombres
- [ ] No hay commits de tipo `WIP` o `tmp`
- [ ] Mensajes son descriptivos
- [ ] Rama está actualizada con target

---

## 🔗 Referencias

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Commit Messages](https://seesparkbox.com/foundry/semantic_commit_messages)
- [Git Branch Naming Convention](https://codingsight.com/git-branching-naming-convention/)

---

*Última actualización: 17 de marzo de 2026*
