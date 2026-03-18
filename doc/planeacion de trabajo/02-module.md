# 🏗️ Módulo: Gestión de Contactos

**Contexto:**  
Esta tarea forma parte del Epic #1 - "Startup CRM".

---

## 📋 Descripción

Gestión completa de contactos y empresas con segmentación por estado del funnel, etiquetas personalizadas y filtros guardados.

## 🎯 Objetivo

Permitir a los usuarios gestionar su base de contactos de manera eficiente, segmentarlos por estado (lead activo, cliente en seguimiento, etc.) y configurar vistas personalizadas.

---

## 🔧 Tasks asignadas a este módulo

### Contactos
- [ ] `task/contacts/list` - Listar contactos con filtros
- [ ] `task/contacts/create` - Crear nuevo contacto
- [ ] `task/contacts/edit` - Editar contacto
- [ ] `task/contacts/delete` - Eliminar contacto con confirmación
- [ ] `task/contacts/detail` - Ver detalle de contacto

### Empresas
- [ ] `task/companies/list` - Listar empresas
- [ ] `task/companies/create` - Crear empresa
- [ ] `task/companies/assign` - Asignar contactos a empresa

### Segmentación
- [ ] `task/segments/create` - Crear segmento
- [ ] `task/segments/filter` - Filtrar por estado/etiqueta
- [ ] `task/segments/save` - Guardar vista personalizada

---

## 📁 Convención de entregables

```
/src/features/contacts/
├── containers/
├── domain/
├── use-cases/
├── services/
├── components/
/src/core/contacts/interfaces/
/src/mocks/handlers/contacts/
```

---

## 🔀 Rama de este módulo

**Rama**: `feat/startup-crm/contacts`  
**Rama padre**: `feat/startup-crm`  
**PR destino**: `feat/startup-crm`

---

## ✅ Checklist de tareas

| Task | Rama | Estado |
|------|------|--------|
| task/contacts/list | task/startup-crm/contacts/list | ⏳ |
| task/contacts/create | task/startup-crm/contacts/create | ⏳ |
| task/contacts/edit | task/startup-crm/contacts/edit | ⏳ |
| task/contacts/delete | task/startup-crm/contacts/delete | ⏳ |
| task/contacts/detail | task/startup-crm/contacts/detail | ⏳ |
| task/companies/list | task/startup-crm/companies/list | ⏳ |
| task/companies/create | task/startup-crm/companies/create | ⏳ |
| task/companies/assign | task/startup-crm/companies/assign | ⏳ |
| task/segments/create | task/startup-crm/segments/create | ⏳ |
| task/segments/filter | task/startup-crm/segments/filter | ⏳ |
| task/segments/save | task/startup-crm/segments/save | ⏳ |

---

## 🔁 Relacionado con

- Epic #1 - Startup CRM

---

👷‍♂️ **Responsable**: @equipo  
📂 **Entregables**: Contactos, Empresas, Segmentos  
🔀 **Rama**: `feat/startup-crm/contacts`  
📅 **Estado**: Por iniciar
