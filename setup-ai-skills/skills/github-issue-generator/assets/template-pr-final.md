# {{titulo}}

## 📸 Screenshot
![{{proyecto}}]({{screenshot_url}})

## 📌 Issue Relacionado
- {{#if closes}}Closes #{{closes}}{{/if}}

---

## 📌 Descripción del PR

{{descripcion}}

{{#if contexto}}
> 🎯 {{contexto}}
{{/if}}

---

## ✅ Tareas integradas

Todas las sub-tareas del Issue #{{epic_id}} han sido completadas y mergeadas a esta rama:

{{tareas}}

---

{{#if estructura}}
## 📁 Estructura final del proyecto

{{estructura}}
{{/if}}

{{#if herramientas}}
## 🛠️ Herramientas y calidad

{{herramientas}}
{{/if}}

{{#if sistema_diseno}}
## 🎨 Sistema de diseño

{{sistema_diseno}}
{{/if}}

{{#if proveedores}}
## 🌐 Proveedores globales

{{proveedores}}
{{/if}}

{{#if arquitectura}}
## 🧩 Arquitectura escalable

{{arquitectura}}
{{/if}}

{{#if validacion}}
## 🚀 Cómo validar

{{validacion}}
{{/if}}

{{#if checklist}}
## 🧩 Checklist de validación

{{checklist}}
{{/if}}

{{#if estrategia}}
## 🔀 Estrategia de merge

- **Rama**: `{{rama}}`
- **Destino**: `{{rama_destino}}`
{{#if precondicion}}
- **Precondición**: {{precondicion}}
{{/if}}
{{/if}}

{{#if notas}}
## 📝 Notas clave

{{notas}}
{{/if}}

---

Asignado: @{{responsable}}  
{{#if estado}}Estado: **{{estado}}**{{/if}}
{{#if fecha}}Fecha: {{fecha}}{{/if}}
