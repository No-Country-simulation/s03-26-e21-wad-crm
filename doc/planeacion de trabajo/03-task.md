# 🛠️ task/contacts/list - Listar contactos con filtros

📌 **¿Qué hace esta tarea y por qué existe?**  
Crear la pantalla principal de gestión de contactos con tabla paginada, filtros por estado, búsqueda y ordenamiento. Es la base para toda la gestión de contactos.

🎯 **Objetivo**  
Permitir al usuario ver todos sus contactos de forma organizada, filtrarlos por estado (lead activo, cliente, inactivo), buscar por nombre/email y ordenarlos.

---

## ✅ Entregables esperados

### 1. Pantalla de lista de contactos
- **Ruta**: `/src/app/(dashboard)/contacts/page.tsx`
- Componente contenedor: `ContactsListContainer`
- Tabla con columnas: Nombre, Email, Teléfono, Empresa, Estado, Etiquetas, Acciones
- Paginación (20 items por página)
- Loading skeleton mientras carga

### 2. Filtros
- Dropdown de estado: Todos, Lead Activo, Cliente, Inactivo
- Input de búsqueda (debounce 300ms)
- Selector de cantidad por página

### 3. Ordenamiento
- Click en columna para ordenar (ASC/DESC)
- Indicador visual de orden activo

### 4. Interfaces TypeScript
- `/src/core/contacts/interfaces/contact.interface.ts`
- `/src/core/contacts/interfaces/filter.interface.ts`

### 5. Mock/MSW Handler
- `/src/mocks/handlers/contacts/contacts.handler.ts`
- Respuesta paginada con 50 contactos de ejemplo

---

## 🧪 Validación

```bash
npm run dev
```

- [ ] Acceder a `/contacts`
- [ ] Ver lista de contactos con datos de mock
- [ ] Filtro por estado funciona
- [ ] Búsqueda filtra resultados
- [ ] Click en columna ordena
- [ ] Paginación cambia de página
- [ ] Loading skeleton aparece durante carga
- [ ] No hay errores en consola

---

## 🔀 Estrategia de rama

- **Rama base**: `feat/startup-crm/contacts`
- **Rama de esta tarea**: `task/startup-crm/contacts/list`
- **PR destino**: `feat/startup-crm/contacts`

---

👷‍♂️ **Responsable**: @desarrollador  
📂 **Entregables**: Pantalla, filtros, ordenamiento, interfaces, mock  
🔀 **Rama**: `task/startup-crm/contacts/list`  
📅 **Estado**: Por iniciar
