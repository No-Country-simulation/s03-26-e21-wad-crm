# 🚀 {{titulo}}

## 📋 Descripción
{{descripcion}}

## 🎯 Objetivo
{{objetivo}}

{{#if contexto}}
> ✨ **Contexto**: {{contexto}}
{{/if}}

---

## 🧩 Sub-Issues (Módulos)

{{subissues}}

---

## 📁 Convención de entregables

{{convencion_entregables}}

---

## 🔀 Estrategia de ramas y PRs

1. **Rama madre del proyecto**: `{{rama_base}}`

2. **Rama por módulo**: `{{rama_modulo}}` (creada desde `{{rama_base}}`)

3. **Ramas por task**: `{{rama_task}}` (creada desde su módulo)

4. **Flujo de merges**:  
   - `task/...` → **PR a su rama de módulo**  
   - Cuando todas las tasks de un módulo estén listas → **PR del módulo a `{{rama_base}}`**  
   - Cuando todos los módulos estén listos → **PR de `{{rama_base}}` → `{{rama_destino}}`**

---

## ✅ Checklist final

| De | A | Check |
|-|-|-|
{{checklist}}

---

👷‍♂️ **Responsable**: @{{responsable}}  
🔀 **Rama madre**: `{{rama_base}}`  
🎯 **Rama final**: `{{rama_destino}}`  
📅 **Estado**: {{estado}}
