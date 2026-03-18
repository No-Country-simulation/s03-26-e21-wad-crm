# 🏗️ PR Módulo: Gestión de Contactos y Empresas

## 📸 Screenshot
![Contacts Module](https://i.imgur.com/ejemplo.png)

## 📌 Issue Relacionado
- Closes #3 (Module - Gestión de Contactos)

---

## 📌 Descripción del PR

Se entrega el módulo completo de **Gestión de Contactos y Empresas** para el Startup CRM, incluyendo CRUD de contactos, gestión de empresas y sistema de segmentación.

> 🎯 Este módulo es la base del CRM y será consumido por los módulos de comunicación (WhatsApp/Email).

---

## ✅ Tasks integradas a este módulo

Todas las tareas han sido completadas y mergeadas:

- [x] `task/contacts/list` - Lista de contactos con filtros
- [x] `task/contacts/create` - Crear nuevo contacto
- [x] `task/contacts/edit` - Editar contacto
- [x] `task/contacts/delete` - Eliminar contacto
- [x] `task/contacts/detail` - Ver detalle de contacto
- [x] `task/companies/list` - Lista de empresas
- [x] `task/companies/create` - Crear empresa
- [x] `task/companies/assign` - Asignar contactos a empresa
- [x] `task/segments/create` - Crear segmento
- [x] `task/segments/filter` - Filtrar por estado/etiqueta
- [x] `task/segments/save` - Guardar vista personalizada

---

## 📁 Estructura del módulo

```
/src/features/contacts/
├── containers/
│   ├── ContactsListContainer.tsx
│   ├── ContactsFormContainer.tsx
│   └── ContactsDetailContainer.tsx
├── components/
│   ├── ContactsTable.tsx
│   ├── ContactForm.tsx
│   └── ContactFilters.tsx
├── domain/
│   └── types.ts
├── use-cases/
│   └── contacts.use-case.ts
├── services/
│   └── contacts.service.ts
└── components/
    └── ...

/src/features/companies/
/src/features/segments/

/src/core/contacts/interfaces/
/src/core/companies/interfaces/
/src/core/segments/interfaces/

/src/mocks/handlers/contacts/
/src/mocks/handlers/companies/
/src/mocks/handlers/segments/
```

---

## 📁 Entregables del módulo

### Contactos
- ✅ Lista con paginación, filtros y búsqueda
- ✅ Formulario de creación/edición
- ✅ Modal de confirmación para eliminar
- ✅ Vista de detalle con historial

### Empresas
- ✅ CRUD de empresas
- ✅ Asignación de contactos a empresa

### Segmentación
- ✅ Filtros avanzados por estado, etiquetas
- ✅ Guardar vistas personalizadas
- ✅ Persistencia en localStorage

---

## 🧪 Validación del módulo

```bash
npm run dev
```

- [x] CRUD completo de contactos
- [x] CRUD completo de empresas
- [x] Sistema de segmentación funcional
- [x] Filtros guardados persisten
- [x] Todos los mocks funcionando
- [x] Tipado completo sin errores
- [x] Build exitoso

---

## 🧩 Checklist de validación

- [x] Todas las tasks mergeadas
- [x] Tests unitarios pasando
- [x] Lint sin errores
- [x] Build compila
- [x] Documentación actualizada en AGENTS.md

---

## 🔀 Estrategia de merge

- **Rama**: `feat/startup-crm/contacts`
- **Destino**: `feat/startup-crm`
- **Precondición**: todas las tasks mergeadas a este módulo

---

## 📝 Notas clave

- El módulo sigue el patrón de Clean Architecture con contenedores
- Los estados de contacto son: Lead Activo, En Seguimiento, Cliente, Inactivo
- Las etiquetas son configurables desde el módulo de Configuración
- La segmentación permitirá crear vistas guardadas por usuario

---

Asignado: @equipo-crm  
Estado: ✅ **Listo para review y merge a `feat/startup-crm`**  
Fecha: 17 de marzo de 2026
