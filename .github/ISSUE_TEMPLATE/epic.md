---
name: "🏗️ Epic - Proyecto grande"
about: "Crear un Epic (issue madre) con múltiples módulos"
title: "'🏗️ Epic: '"
labels: ["Epic", "planning"]
assignees: ""
---

## 📋 Descripción

<!-- Describe el objetivo general del proyecto -->

## 🎯 Objetivo

<!-- Qué se quiere lograr con este Epic -->

---

## 🧩 Módulos planned

<!-- Lista los módulos que tendrá este Epic -->

- [ ] **Módulo 1** - Descripción breve
- [ ] **Módulo 2** - Descripción breve
- [ ] **Módulo 3** - Descripción breve

---

## 📁 Convención de entregables

| Tipo | Ubicación |
|------|-----------|
| Diseños | `/designs/excalidraw/[modulo]/[nombre].excalidraw` |
| Interfaces | `/src/core/[modulo]/interfaces/` |
| Pantallas | `/src/app/(rol)/[ruta]/page.tsx` |
| Mocks | `/src/mocks/handlers/[modulo]/[nombre].handler.ts` |

---

## 🔀 Estrategia de ramas

```
dev
  └── feat/<project-name>
        ├── feat/<project-name>/module1
        │     └── task/<project-name>/module1/task1
        └── feat/<project-name>/module2
              └── task/<project-name>/module2/task1
```

---

## ✅ Checklist

| Módulo | Rama | Estado |
|--------|------|--------|
| | | ⏳ |

---

👷‍♂️ **Responsable**: @ 
🔀 **Rama madre**: `feat/<project-name>`  
🎯 **Rama destino**: `dev`  
📅 **Estado**: En planificación
