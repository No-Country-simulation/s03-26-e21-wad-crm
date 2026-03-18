# 🤝 Cómo contribuir

¡Gracias por tu interés en contribuir a Startup CRM! Este documento te guía para hacer tu primera contribución.

---

## 📋 Tabla de contenidos

1. [Código de conducta](#código-de-conducta)
2. [¿Cómo puedo contribuir?](#¿cómo-puedo-contribuir)
3. [Entorno de desarrollo](#entorno-de-desarrollo)
4. [Flujo de trabajo](#flujo-de-trabajo)
5. [Estilos de código](#estilos-de-código)
6. [Commits semánticos](#commits-semánticos)
7. [Pull Requests](#pull-requests)

---

## Código de conducta

Al participar en este proyecto, aceptás seguir nuestro [Código de Conducta](./CODE_OF_CONDUCT.md).

---

## ¿Cómo puedo contribuir?

### 🐛 Reportar bugs

- Usá el template de **Bug** en Issues
- Incluí pasos para reproducir
- Agregá screenshots si es posible

### 💡 Sugerir features

- Usá el template de **Feature** en Issues
- Explicá el problema que resuelve
- Incluí mockup si tenés

### 💻 Escribir código

- Escolí un issue de la columna "Help Wanted"
- Commentá que vas a trabajar en él
- Seguí el flujo de trabajo abajo

---

## Entorno de desarrollo

### Requisitos

- Node.js 18+
- npm o yarn
- Git

### Setup

```bash
# 1. Fork del repo
# 2. Clonar tu fork
git clone https://github.com/TU_USUARIO/startup-crm.git
cd startup-crm

# 3. Instalar dependencias
npm install

# 4. Copiar variables de entorno
cp .env.example .env.local

# 5. Iniciar servidor de desarrollo
npm run dev
```

### Estructura de carpetas

```
src/
├── app/           # Next.js App Router
├── features/      # Clean Architecture por módulo
├── shared/       # Componentes compartidos
├── mocks/        # MSW handlers
└── styles/       # Estilos globales
```

---

## Flujo de trabajo

### 1. Elegir un issue

```
Projects → Kanban → Help Wanted
```

### 2. Asignarse el issue

Commentá: *"Voy a trabajar en esto"* para que otros no lo hagan.

### 3. Crear rama

```bash
# Para una task
git checkout -b task/startup-crm/module/name

# Para un bugfix
git checkout -b fix/startup-crm/description
```

### 4. Hacer cambios

```bash
# Hacer cambios en tu editor
# Luego commitear
git add .
git commit -m "feat(module): description"
```

### 5. Push y crear PR

```bash
git push origin tu-rama
# GitHub te sugiere crear PR
```

---

## Estilos de código

### TypeScript

- Usamos **TypeScript estricto**
- Tipado obligatorio en funciones
- Interfaces para tipos de dominio

### Prettier + ESLint

```bash
# Formatear código
npm run format

# Ver errores de lint
npm run lint

# Fix automático
npm run lint:fix
```

### Componentes

```tsx
// ✅ Bien
interface Contact {
  id: string;
  name: string;
  email: Email;
}

export function ContactCard({ contact }: ContactCardProps) {
  return <div>{contact.name}</div>;
}

// ❌ Mal
function ContactCard({ contact }) { // Falta tipo
  return <div>{contact.name}</div>;
}
```

---

## Commits semánticos

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(alcance): descripción
```

| Tipo | Descripción |
|------|-------------|
| `feat` | Nueva funcionalidad |
| `fix` | Bug fix |
| `docs` | Documentación |
| `style` | Formateo |
| `refactor` | Refactorización |
| `test` | Tests |
| `chore` | Mantenimiento |

### Ejemplos

```bash
git commit -m "feat(contacts): add filter by status"
git commit -m "fix(login): resolve redirect loop"
git commit -m "docs: update API endpoints"
```

---

## Pull Requests

### Antes de crear PR

- [ ] Commits siguen el formato semántico
- [ ] `npm run lint` pasa sin errores
- [ ] `npm run build` compila exitosamente
- [ ] Tests pasan
- [ ] Descripción incluye `Closes #issue`

### Template de PR

```markdown
## Descripción

## Cambios realizados

## Cómo probar

## Checklist
- [ ] 
- [ ] 
```

### После merge

¡Celebremos! 🎉 Tu contribución ahora es parte del proyecto.

---

## ❓ ¿Dudas?

- Abrí un **Discussion**
- Preguntá en el **Discord** (si hay)
- O creá un issue con la etiqueta `question`

---

¡Gracias por contribuir! 🚀
