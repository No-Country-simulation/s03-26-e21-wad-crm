# 🚀 Setup AI Skills - Startup CRM

Configura GitHub (labels, milestones) y AI skills para IAs en cualquier proyecto.

---

## 📁 Estructura

```
setup-ai-skills/
├── setup.sh                  ← Script de setup
├── CODEOWNERS                ← Config de reviewers
├── TEAM.md                   ← Guía de responsables
├── pull_request_template.md  ← PR genérico
│
├── ISSUE_TEMPLATE/           ← Templates de issues
│   ├── bug.md
│   ├── epic.md
│   ├── feature.md
│   ├── module.md
│   ├── task.md
│   ├── epic-landing.md
│   ├── history-user.md
│   └── sub-issue.md
│
└── PULL_REQUEST_TEMPLATE/     ← Templates de PRs
    ├── 01-task-pr.md
    ├── 02-module-pr.md
    └── 03-final-pr.md
```

---

## ⚡ Uso rápido

### Opción 1: Script automático

```bash
# En un proyecto nuevo
git clone https://github.com/tu-user/s03-26-e21-wad-crm.git
cd s03-26-e21-wad-crm
./setup-ai-skills/setup.sh --all

# O solo GitHub
./setup-ai-skills/setup.sh --github

# O solo IAs
./setup-ai-skills/setup.sh --ai
```

### Opción 2: Copia manual

```bash
# Copiar solo .github
cp -r setup-ai-skills/.github /path/a/proyecto/

# Copiar skill de Copilot
cp -r setup-ai-skills/ISSUE_TEMPLATE /path/a/proyecto/.github/
```

---

## 🤖 IAs soportadas

| IA | Carpeta | Config |
|----|---------|--------|
| Claude Code | `.claude/skills/` | Symlink + CLAUDE.md |
| Gemini CLI | `.gemini/skills/` | Symlink + GEMINI.md |
| Codex (OpenAI) | `.codex/skills/` | Symlink + AGENTS.md |
| GitHub Copilot | `.github/skills/` | copilot-instructions.md |

---

## 🏷️ Labels creados

| Label | Color | Para |
|-------|-------|------|
| Backend | 🟣 | Server/API |
| Frontend | 🔵 | UI |
| Finished | 🟢 | Completado |
| Working | 🟠 | En progreso |
| Epic | 🟣 | Proyecto grande |
| Module | 🟣 | Sub-feature |
| Task | 🔵 | Tarea individual |
| Landing | 🩷 | Landing page |
| Auth | 🔴 | Autenticación |

---

## 📊 Milestones creados

| # | Milestone | Descripción | Due |
|---|-----------|-------------|-----|
| 1 | Frontend | React, UI | 2026-04-30 |
| 2 | Backend | API, auth | 2026-04-30 |
| 3 | Documentación | README, guías | 2026-04-30 |
| 4 | Diseño | Wireframes | 2026-04-30 |
| 5 | QA | Testing, E2E | 2026-04-30 |

---

## 🔄 Flujo de trabajo

```
Epic (#1)
  └── Module (#2)
        └── Task (#3) → PR → Closes #3
        └── Task (#4) → PR → Closes #4
        PR Module → Closes #2
  PR Final → Closes #1 → dev
```

---

## 📝 Comandos útiles

```bash
# Crear issues
gh issue create --template epic.md
gh issue create --template module.md
gh issue create --template task.md
gh issue create --template bug.md

# Crear PRs
gh pr create --template 01-task-pr.md
gh pr create --template 02-module-pr.md

# Asignar milestone
gh issue edit #5 --milestone "Frontend"
```

---

## ✏️ Personalización

Editá `setup-ai-skills/TEAM.md` para cambiar:
- Responsables por área
- Emails y datos de contacto

Editá `AGENTS.md` (fuente de verdad) y luego ejecutá el script para actualizar todas las IAs.

---

_Última actualización: 2026-03-21_
