/# task/contacts/list: Lista de contactos con filtros

## 📸 Screenshot
![Contacts List](https://i.imgur.com/ejemplo.png)

## 📌 Issue Relacionado
- Closes #12

---

## 📌 Descripción del PR

Se implementa la pantalla de lista de contactos con paginación, filtros por estado, búsqueda con debounce y ordenamiento por columnas.

> 🎯 Esta task es la base del módulo de Contactos y será utilizada por todas las demás tareas del módulo.

---

## ✅ Cambios incluidos

### Estructura de archivos
```
/src/features/contacts/
├── containers/
│   └── ContactsListContainer.tsx
├── components/
│   └── ContactsTable.tsx
├── domain/
│   └── types.ts
└── services/
    └── contacts.service.ts

/src/core/contacts/interfaces/
├── contact.interface.ts
└── filter.interface.ts

/src/mocks/handlers/contacts/
└── contacts.handler.ts
```

### Funcionalidades implementadas
- ✅ Tabla con datos paginados (20 por página)
- ✅ Filtro por estado (Lead Activo, Cliente, Inactivo)
- ✅ Búsqueda con debounce de 300ms
- ✅ Ordenamiento por columnas (ASC/DESC)
- ✅ Loading skeleton
- ✅ Tipado completo con TypeScript

---

## 🧪 ¿Cómo probar?

```bash
npm run dev
```

1. Navegar a `/contacts`
2. Verificar que carga la lista de contactos (mock)
3. Probar filtro por estado
4. Escribir en búsqueda y verificar filtrado
5. Click en columnas para ordenar
6. Cambiar de página en paginación

---

## 🧩 Checklist de validación

- [x] Tabla renderiza datos de mock
- [x] Filtro por estado funciona
- [x] Búsqueda filtra correctamente
- [x] Ordenamiento funciona
- [x] Paginación cambia página
- [x] Loading skeleton aparece
- [x] Tipado TypeScript sin errores
- [x] `npm run lint` pasa sin errores
- [x] `npm run build` compila exitosamente

---

## 🔀 Estrategia de merge

- **Rama**: `task/startup-crm/contacts/list`
- **Destino**: `feat/startup-crm/contacts`

---

## 📝 Notas clave

- Se usa el patrón contenedor para separar lógica de UI
- Los datos de mock incluyen 50 contactos para pruebas
- La paginación es server-side simulada (en realidad filtra el array)

---

Asignado: @desarrollador  
Estado: ✅ **Listo para review y merge**  
Fecha: 17 de marzo de 2026
