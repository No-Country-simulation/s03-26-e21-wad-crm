# {{titulo}}

## 📸 Screenshot
![{{proyecto}}]({{screenshot_url}})

## 📌 Issue Relacionado
- {{#if closes}}Closes #{{closes}}{{/if}}
{{#if related}}- {{related}}{{/if}}

---

## 📌 Descripción del PR

{{descripcion}}

{{#if cambios}}
## ✅ Cambios incluidos

{{cambios}}
{{/if}}

{{#if validacion}}
## 🧪 ¿Cómo probar?

{{validacion}}
{{/if}}

{{#if estrategia}}
## 🔀 Estrategia de merge

- **Rama**: `{{rama}}`
- **Destino**: `{{rama_destino}}`
- **No se mergea directamente a `{{rama_final}}`**
{{/if}}

{{#if entregables}}
## 📁 Entregables clave

{{entregables}}
{{/if}}

{{#if checklist}}
## 🧩 Checklist de validación

{{checklist}}
{{/if}}

{{#if notas}}
## 📝 Notas clave

{{notas}}
{{/if}}

---

Asignado: @{{responsable}}  
{{#if estado}}Estado: **{{estado}}**{{/if}}
{{#if fecha}}Fecha: {{fecha}}{{/if}}
