---
name: PR Final - Epic
about: Template para el PR que cierra un Epic completo
title: 'feat/startup-crm/landing: Epic Landing Page'
labels: 'Epic, Finished'
reviewers: davidcoachdev
---

## 📸 Preview Final

<!-- Screenshot o demo del feature completo -->

---

## 📌 Issue Relacionado

<!-- Closes #XX (Epic issue) -->

---

## 📌 Descripción del PR

<!-- Descripción del Epic completado y su impacto -->

---

## ✅ Módulos integrados

| # | Módulo | Rama | Tasks | Estado |
|---|--------|------|-------|--------|
| 1 | Header/Navbar | `feat/startup-crm/landing/header` | X | ✅ |
| 2 | Hero Section | `feat/startup-crm/landing/hero` | X | ✅ |
| 3 | Features | `feat/startup-crm/landing/features` | X | ✅ |
| 4 | Social Proof | `feat/startup-crm/landing/social-proof` | X | ✅ |
| 5 | Footer | `feat/startup-crm/landing/footer` | X | ✅ |

---

## 📁 Estructura final

```
/landing/
├── src/
│   ├── components/
│   │   ├── Header/
│   │   ├── Hero/
│   │   ├── Features/
│   │   ├── SocialProof/
│   │   └── Footer/
│   ├── layouts/
│   └── pages/
└── public/
```

---

## 🎨 Sistema de diseño

| Elemento | Implementación |
|----------|-----------------|
| Colors | Tailwind config |
| Typography | Tailwind + Google Fonts |
| Components | Atomic design |
| Icons | Heroicons / Lucide |

---

## 🛠️ Herramientas y calidad

| Herramienta | Uso |
|------------|-----|
| ESLint | Linting |
| Prettier | Formateo |
| TypeScript | Tipado |
| Vitest | Tests |

---

## 🚀 Cómo validar

```bash
# Install
npm install

# Dev
npm run dev

# Test
npm run test

# Build
npm run build
```

1. Landing carga sin errores
2. Todos los CTAs funcionan (WhatsApp, Login)
3. Responsive en mobile/tablet/desktop
4. Sin errores en consola
5. Performance OK (Lighthouse)

---

## 🧩 Checklist de validación

- [ ] Todos los módulos completados y mergeados
- [ ] Integración entre módulos fluida
- [ ] SEO básico (meta tags, title)
- [ ] Accesibilidad (alt tags, focus states)
- [ ] Tests E2E pasando (si aplica)
- [ ] Preview deploy OK
- [ ] PRs de módulos referenciados

---

## 🔀 Estrategia de merge

- **Rama**: `feat/startup-crm/landing`
- **Destino**: `dev`
- **Precondición**: todos los módulos mergeados a `feat/startup-crm/landing`

---

## 📝 Notas finales

<!-- Lecciones aprendidas, deuda técnica, siguiente paso -->

---

**Responsable**: @davidcoachdev  
**Epic**: #XX  
**Estado**: ✅ Listo para review y merge a `dev`
