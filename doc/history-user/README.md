# 📖 Historias de Usuario - Startup CRM

## Índice por Módulo

| Módulo | Archivo | HU Count |
|--------|---------|----------|
| **Auth** | [auth/01-auth.md](./auth/01-auth.md) | 8 HU |
| **Contacts** | [contacts/01-contacts.md](./contacts/01-contacts.md) | 10 HU |
| **Contacts** | [contacts/02-companies.md](./contacts/02-companies.md) | 2 HU |
| **Deals** | [deals/01-deals.md](./deals/01-deals.md) | 9 HU |
| **WhatsApp** | [whatsapp/01-whatsapp.md](./whatsapp/01-whatsapp.md) | 7 HU |
| **Email** | [email/01-email.md](./email/01-email.md) | 9 HU |
| **Tasks** | [tasks/01-tasks.md](./tasks/01-tasks.md) | 8 HU |
| **Analytics** | [analytics/01-analytics.md](./analytics/01-analytics.md) | 7 HU |
| **Automation** | [automation/01-automation.md](./automation/01-automation.md) | 6 HU |
| **Export** | [export/01-export.md](./export/01-export.md) | 5 HU |
| **Settings** | [settings/01-settings.md](./settings/01-settings.md) | 9 HU |

---

## Resumen Total

| Categoría | HU Count |
|-----------|----------|
| Auth | 8 |
| Contacts + Companies | 12 |
| Deals | 9 |
| WhatsApp | 7 |
| Email | 9 |
| Tasks | 8 |
| Analytics | 7 |
| Automation | 6 |
| Export | 5 |
| Settings | 9 |
| **Total** | **80 HU** |

---

## Prioridades

### 🔴 Alta Prioridad (MVP)
- Auth: HU-001 a HU-008 (8)
- Contacts: HU-010, HU-011, HU-012, HU-014, HU-015, HU-019 (6)
- Deals: HU-030, HU-031, HU-032, HU-035, HU-036 (5)
- WhatsApp: HU-040, HU-041, HU-042, HU-043 (4)
- Email: HU-050, HU-051, HU-052, HU-053 (4)
- Tasks: HU-060, HU-061, HU-062, HU-065 (4)
- Analytics: HU-070 (1)
- Settings: HU-100, HU-101, HU-102, HU-107 (4)

**Total MVP: 32 HU**

### 🟡 Media Prioridad (Post-MVP)
- Contacts: HU-013, HU-016, HU-017, HU-018 (4)
- Companies: HU-020, HU-021 (2)
- Deals: HU-033, HU-034, HU-037, HU-038 (4)
- WhatsApp: HU-044, HU-045, HU-046 (3)
- Email: HU-054, HU-055, HU-056, HU-057, HU-058 (5)
- Tasks: HU-063, HU-064, HU-066, HU-067 (4)
- Analytics: HU-071, HU-072, HU-073, HU-074, HU-075, HU-076 (6)
- Automation: HU-080, HU-081, HU-082, HU-083, HU-084, HU-085 (6)
- Export: HU-090, HU-091, HU-092 (3)
- Settings: HU-103, HU-104, HU-105 (3)

**Total Post-MVP: 40 HU**

### 🟢 Baja Prioridad
- Export: HU-093, HU-094 (2)
- Settings: HU-106, HU-108 (2)

**Total Baja: 4 HU**

---

## Estructura de Carpetas

```
history-user/
├── auth/
│   └── 01-auth.md
├── contacts/
│   ├── 01-contacts.md
│   └── 02-companies.md
├── deals/
│   └── 01-deals.md
├── whatsapp/
│   └── 01-whatsapp.md
├── email/
│   └── 01-email.md
├── tasks/
│   └── 01-tasks.md
├── analytics/
│   └── 01-analytics.md
├── automation/
│   └── 01-automation.md
├── export/
│   └── 01-export.md
└── settings/
    └── 01-settings.md
```

---

## Formato de HU

Cada historia de usuario sigue este formato:

```markdown
# HU-XXX: Título

**Módulo**: [Nombre del módulo]  
**Prioridad**: Alta/Media/Baja  
**Como**: [rol]  
**Quiero**: [acción]  
**Para**: [beneficio]

## Criterios de Aceptación

- [ ] Criterio 1
- [ ] Criterio 2

## Criterios de Negocio (opcional)

- Regla de negocio 1
- Regla de negocio 2
```

---

## Próximos Pasos

1. **Revisar historias de usuario** - Validar que están completas
2. **Priorizar con el equipo** - Ajustar prioridades según negocio
3. **Crear SDDs por módulo** - Generar specs, design y tasks para cada área
4. **Dividir en sprints** - Asignar HUs a iterations
