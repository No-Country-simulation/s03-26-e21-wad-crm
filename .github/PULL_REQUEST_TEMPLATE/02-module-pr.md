# {{titulo}}

## 📸 Screenshot
![{{proyecto}}]({{screenshot_url}})

## 📌 Issue Relacionado
- {{#if closes}}Closes #{{closes}}{{/if}}
{{#if related}}- {{related}}{{/if}}

---

## 📌 Descripción del PR

{{descripcion}}

{{#if contexto}}
> 🎯 {{contexto}}
{{/if}}

---

## ✅ Tasks integradas a este módulo

Todas las tareas de este módulo han sido completadas y mergeadas:

{{tareas}}

---

{{#if estructura}}
## 📁 Estructura del módulo

{{estructura}}
{{/if}}

{{#if entregables}}
## 📁 Entregables del módulo

{{entregables}}
{{/if}}

{{#if validacion}}
## 🧪 Validación del módulo

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
- **Precondición**: todas las tasks ya mergeadas
{{/if}}

{{#if notas}}
## 📝 Notas clave

{{notas}}
{{/if}}

---

Asignado: @{{responsable}}  
{{#if estado}}Estado: **{{estado}}**{{/if}}
{{#if fecha}}Fecha: {{fecha}}{{/if}}
