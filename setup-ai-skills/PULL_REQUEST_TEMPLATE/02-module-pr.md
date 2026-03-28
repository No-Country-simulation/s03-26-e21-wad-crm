---
name: PR de Module
about: Template para PRs que integran múltiples tasks de un módulo
title: 'feat/xxx: Módulo '
labels: 'Module, Working'
reviewers: davidcoachdev
---

## 📸 Preview (si aplica)

<!-- Screenshot del módulo completo -->

---

## 📌 Issue Relacionado

<!-- Closes #XX (Module issue) -->

---

## 📌 Descripción del PR

<!-- Descripción del módulo completado -->

---

## ✅ Tasks integradas

Todas las tasks de este módulo fueron completadas:

| # | Task | PR | Estado |
|---|------|-----|--------|
| | | | ✅ |
| | | | ✅ |
| | | | ✅ |

---

## 📁 Estructura del módulo

```
/src/features/xxx/
├── components/
├── domain/
├── services/
└── ...
```

---

## 📦 Entregables del módulo

| Entregable | Estado |
|------------|--------|
| | ✅ |
| | ✅ |

---

## 🧪 Validación del módulo

```bash
npm run dev
npm run test
```

1. Verificar todas las features del módulo
2. Probar edge cases
3. Verificar responsive

---

## 🧩 Checklist de validación

- [ ] Todas las tasks mergeadas
- [ ] Integración entre tasks OK
- [ ] Sin conflictos con `feat/startup-crm/landing`
- [ ] Tests del módulo pasando
- [ ] Documentación actualizada (si aplica)

---

## 🔀 Estrategia de merge

- **Rama**: `feat/startup-crm/xxx`
- **Destino**: `feat/startup-crm/landing` (o `dev` si es final)
- **Precondición**: todas las `task/` mergeadas

---

## 📝 Notas

<!-- Consideraciones de integración, dependencias -->

---

**Responsable**: @davidcoachdev  
**Estado**: ✅ Listo para review
