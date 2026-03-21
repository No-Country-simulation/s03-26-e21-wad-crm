#!/bin/bash
# ============================================================================
# GitHub Config & AI Skills Setup - Startup CRM
# ============================================================================
# Configura templates, labels, milestones y skills para IAs
#
# IAs soportadas:
#   - Claude Code: .claude/skills/ symlink + CLAUDE.md
#   - Gemini CLI: .gemini/skills/ symlink + GEMINI.md
#   - Codex (OpenAI): .codex/skills/ symlink + AGENTS.md (native)
#   - GitHub Copilot: .github/skills/ + AGENTS.md copy
#
# GitHub recursos:
#   - Labels: Backend, Frontend, Epic, Module, Task, etc
#   - Milestones: Frontend, Backend, Documentación, Diseño, QA
#   - Templates: Issue + PR templates
#
# Uso:
#   ./setup.sh              # Interactivo
#   ./setup.sh --all        # Configurar todo
#   ./setup.sh --github     # Solo GitHub (labels + milestones)
#   ./setup.sh --ai         # Solo AI skills
#   ./setup.sh --claude     # Solo Claude Code
#
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

# ============================================================================
# COLORS
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ============================================================================
# FLAGS
# ============================================================================

SETUP_GITHUB=false
SETUP_CLAUDE=false
SETUP_GEMINI=false
SETUP_CODEX=false
SETUP_COPILOT=false

# ============================================================================
# FUNCTIONS
# ============================================================================

show_help() {
    cat << EOF
Usage: $0 [OPTIONS]

Configura GitHub y AI skills para el proyecto CRM.

Options:
  --all       Configurar todo (GitHub + todas las IAs)
  --github    Solo GitHub (labels + milestones)
  --ai        Solo AI skills (Claude, Gemini, Codex, Copilot)
  --claude    Solo Claude Code
  --gemini    Solo Gemini CLI
  --codex     Solo Codex (OpenAI)
  --copilot   Solo GitHub Copilot
  --help      Mostrar esta ayuda

Si no hay opciones, ejecuta modo interactivo.

Examples:
  $0                      # Interactivo
  $0 --all                # Todo
  $0 --github             # Solo GitHub
  $0 --claude --codex     # Claude y Codex

EOF
}

show_menu() {
    echo -e "${BOLD}¿Qué querés configurar?${NC}"
    echo -e "${CYAN}(Usá números para togglear, Enter para confirmar)${NC}"
    echo ""

    local options=("GitHub (labels + milestones)" "Claude Code" "Gemini CLI" "Codex (OpenAI)" "GitHub Copilot")
    local selected=(true false false false false)

    while true; do
        for i in "${!options[@]}"; do
            if [ "${selected[$i]}" = true ]; then
                echo -e "  ${GREEN}[x]${NC} $((i+1)). ${options[$i]}"
            else
                echo -e "  [ ] $((i+1)). ${options[$i]}"
            fi
        done
        echo ""
        echo -e "  ${YELLOW}a${NC}. Seleccionar todos"
        echo -e "  ${YELLOW}n${NC}. Ninguno"
        echo ""
        echo -n "Toggle (1-5, a, n) o Enter para confirmar: "

        read -r choice

        case $choice in
            1) selected[0]=$([ "${selected[0]}" = true ] && echo false || echo true) ;;
            2) selected[1]=$([ "${selected[1]}" = true ] && echo false || echo true) ;;
            3) selected[2]=$([ "${selected[2]}" = true ] && echo false || echo true) ;;
            4) selected[3]=$([ "${selected[3]}" = true ] && echo false || echo true) ;;
            5) selected[4]=$([ "${selected[4]}" = true ] && echo false || echo true) ;;
            a|A) selected=(true true true true true) ;;
            n|N) selected=(false false false false false) ;;
            "") break ;;
            *) echo -e "${RED}Opción inválida${NC}" ;;
        esac

        # Redraw menu
        echo -en "\033[11A\033[J"
    done

    SETUP_GITHUB=${selected[0]}
    SETUP_CLAUDE=${selected[1]}
    SETUP_GEMINI=${selected[2]}
    SETUP_CODEX=${selected[3]}
    SETUP_COPILOT=${selected[4]}
}

# ----------------------------------------------------------------------------
# GITHUB SETUP
# ----------------------------------------------------------------------------

setup_github() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  GitHub Setup (labels + milestones)${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

    # Verificar gh auth
    if ! gh auth status &>/dev/null; then
        echo -e "${RED}✗ No estás autenticado en gh${NC}"
        echo -e "${YELLOW}  Ejecutá: gh auth login${NC}"
        return 1
    fi

    local OWNER=$(gh api user --jq .login)
    echo -e "${GREEN}✓ Autenticado como: $OWNER${NC}"

    # Verificar repo
    local REPO=$(basename $(git remote get-url origin 2>/dev/null || echo ".") .git)
    if [ -z "$REPO" ] || [ "$REPO" = "." ]; then
        read -p "Repo slug (nombre del repo): " REPO
    fi

    local FULL_REPO="$OWNER/$REPO"

    # ------------------------------------------------------------------------
    # LABELS
    # ------------------------------------------------------------------------

    echo -e "\n${YELLOW}→ Creando labels...${NC}"

    declare -a LABELS=(
        "Backend:Issues related to backend/server:7B1FA2"
        "Frontend:Issues related to frontend/UI:1976D2"
        "Finished:Task or module completed:4CAF50"
        "Working:Work in progress:FF9800"
        "Epic:Epic - Large feature/project:9C27B0"
        "Module:Module - Sub-feature:673AB7"
        "Task:Individual task:2196F3"
        "Landing:Landing page related:E91E63"
        "Auth:Authentication and authorization:F44336"
    )

    for label_data in "${LABELS[@]}"; do
        IFS=':' read -r name desc color <<< "$label_data"
        gh api repos/$FULL_REPO/labels \
            -X POST \
            -f name="$name" \
            -f description="$desc" \
            -f color="$color" &>/dev/null || true
        echo "  ${GREEN}✓${NC} $name"
    done

    # ------------------------------------------------------------------------
    # MILESTONES
    # ------------------------------------------------------------------------

    echo -e "\n${YELLOW}→ Creando milestones...${NC}"

    declare -a MILESTONES=(
        "Frontend:React/Vue/Angular, componentes, UI:2026-04-30"
        "Backend:API, auth, DB, integraciones:2026-04-30"
        "Documentación:README, guías, historias de usuario:2026-04-30"
        "Diseño:Wireframes, mockups, sistema de diseño:2026-04-30"
        "QA:Testing, E2E, bug fixes:2026-04-30"
    )

    for milestone_data in "${MILESTONES[@]}"; do
        IFS=':' read -r title desc due <<< "$milestone_data"
        gh api repos/$FULL_REPO/milestones \
            -X POST \
            -f title="$title" \
            -f description="$desc" \
            -f due_on="${due}T00:00:00Z" &>/dev/null || true
        echo "  ${GREEN}✓${NC} $title"
    done

    echo -e "\n${GREEN}✓ GitHub configurado: $FULL_REPO${NC}"
}

# ----------------------------------------------------------------------------
# AI SKILLS SETUP
# ----------------------------------------------------------------------------

setup_claude() {
    echo -e "\n${YELLOW}→ Configurando Claude Code...${NC}"

    local target="$REPO_ROOT/.claude/skills"
    mkdir -p "$REPO_ROOT/.claude"

    if [ -L "$target" ]; then
        rm "$target"
    elif [ -d "$target" ]; then
        mv "$target" "$REPO_ROOT/.claude/skills.backup.$(date +%s)"
    fi

    ln -s "$SCRIPT_DIR" "$target"
    echo -e "${GREEN}✓${NC} .claude/skills -> setup-ai-skills/"

    # Copiar AGENTS.md
    if [ -f "$REPO_ROOT/AGENTS.md" ]; then
        cp "$REPO_ROOT/AGENTS.md" "$REPO_ROOT/.claude/CLAUDE.md"
        echo -e "${GREEN}✓${NC} AGENTS.md -> .claude/CLAUDE.md"
    fi
}

setup_gemini() {
    echo -e "\n${YELLOW}→ Configurando Gemini CLI...${NC}"

    local target="$REPO_ROOT/.gemini/skills"
    mkdir -p "$REPO_ROOT/.gemini"

    if [ -L "$target" ]; then
        rm "$target"
    elif [ -d "$target" ]; then
        mv "$target" "$REPO_ROOT/.gemini/skills.backup.$(date +%s)"
    fi

    ln -s "$SCRIPT_DIR" "$target"
    echo -e "${GREEN}✓${NC} .gemini/skills -> setup-ai-skills/"

    # Copiar AGENTS.md
    if [ -f "$REPO_ROOT/AGENTS.md" ]; then
        cp "$REPO_ROOT/AGENTS.md" "$REPO_ROOT/.gemini/GEMINI.md"
        echo -e "${GREEN}✓${NC} AGENTS.md -> .gemini/GEMINI.md"
    fi
}

setup_codex() {
    echo -e "\n${YELLOW}→ Configurando Codex (OpenAI)...${NC}"

    local target="$REPO_ROOT/.codex/skills"
    mkdir -p "$REPO_ROOT/.codex"

    if [ -L "$target" ]; then
        rm "$target"
    elif [ -d "$target" ]; then
        mv "$target" "$REPO_ROOT/.codex/skills.backup.$(date +%s)"
    fi

    ln -s "$SCRIPT_DIR" "$target"
    echo -e "${GREEN}✓${NC} .codex/skills -> setup-ai-skills/"
    echo -e "${GREEN}✓${NC} Codex usa AGENTS.md de forma nativa"
}

setup_copilot() {
    echo -e "\n${YELLOW}→ Configurando GitHub Copilot...${NC}"

    if [ -f "$REPO_ROOT/AGENTS.md" ]; then
        mkdir -p "$REPO_ROOT/.github"
        cp "$REPO_ROOT/AGENTS.md" "$REPO_ROOT/.github/copilot-instructions.md"
        echo -e "${GREEN}✓${NC} AGENTS.md -> .github/copilot-instructions.md"
    fi

    # Copiar skills de Copilot
    if [ -d "$REPO_ROOT/.github/skills" ]; then
        echo -e "${GREEN}✓${NC} .github/skills/ ya existe"
    else
        mkdir -p "$REPO_ROOT/.github/skills"
        echo -e "${GREEN}✓${NC} .github/skills/ creado"
    fi
}

# ----------------------------------------------------------------------------
# COPY TEMPLATES
# ----------------------------------------------------------------------------

copy_templates() {
    echo -e "\n${YELLOW}→ Copiando templates...${NC}"

    # Issue templates
    mkdir -p "$REPO_ROOT/.github/ISSUE_TEMPLATE"
    cp -r "$SCRIPT_DIR/ISSUE_TEMPLATE/"* "$REPO_ROOT/.github/ISSUE_TEMPLATE/" 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Issue templates"

    # PR templates
    mkdir -p "$REPO_ROOT/.github/PULL_REQUEST_TEMPLATE"
    cp -r "$SCRIPT_DIR/PULL_REQUEST_TEMPLATE/"* "$REPO_ROOT/.github/PULL_REQUEST_TEMPLATE/" 2>/dev/null || true
    echo -e "${GREEN}✓${NC} PR templates"

    # Otros archivos
    [ -f "$SCRIPT_DIR/CODEOWNERS" ] && cp "$SCRIPT_DIR/CODEOWNERS" "$REPO_ROOT/.github/"
    [ -f "$SCRIPT_DIR/TEAM.md" ] && cp "$SCRIPT_DIR/TEAM.md" "$REPO_ROOT/.github/"
    [ -f "$SCRIPT_DIR/pull_request_template.md" ] && cp "$SCRIPT_DIR/pull_request_template.md" "$REPO_ROOT/.github/"

    echo -e "${GREEN}✓${NC} Archivos de config"
}

# ============================================================================
# PARSE ARGUMENTS
# ============================================================================

while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            SETUP_GITHUB=true
            SETUP_CLAUDE=true
            SETUP_GEMINI=true
            SETUP_CODEX=true
            SETUP_COPILOT=true
            shift
            ;;
        --github)
            SETUP_GITHUB=true
            shift
            ;;
        --ai)
            SETUP_CLAUDE=true
            SETUP_GEMINI=true
            SETUP_CODEX=true
            SETUP_COPILOT=true
            shift
            ;;
        --claude)
            SETUP_CLAUDE=true
            shift
            ;;
        --gemini)
            SETUP_GEMINI=true
            shift
            ;;
        --codex)
            SETUP_CODEX=true
            shift
            ;;
        --copilot)
            SETUP_COPILOT=true
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Opción desconocida: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# ============================================================================
# MAIN
# ============================================================================

main() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║     GitHub + AI Skills Setup - Startup CRM           ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Modo interactivo si no hay flags
    if [ "$SETUP_GITHUB" = false ] && [ "$SETUP_CLAUDE" = false ] && [ "$SETUP_GEMINI" = false ] && [ "$SETUP_CODEX" = false ] && [ "$SETUP_COPILOT" = false ]; then
        show_menu
        echo ""
    fi

    # Verificar que hay algo seleccionado
    if [ "$SETUP_GITHUB" = false ] && [ "$SETUP_CLAUDE" = false ] && [ "$SETUP_GEMINI" = false ] && [ "$SETUP_CODEX" = false ] && [ "$SETUP_COPILOT" = false ]; then
        echo -e "${YELLOW}No hay nada seleccionado. Nada que hacer.${NC}"
        exit 0
    fi

    # Copiar templates siempre
    copy_templates

    # Ejecutar setups seleccionados
    [ "$SETUP_GITHUB" = true ] && setup_github
    [ "$SETUP_CLAUDE" = true ] && setup_claude
    [ "$SETUP_GEMINI" = true ] && setup_gemini
    [ "$SETUP_CODEX" = true ] && setup_codex
    [ "$SETUP_COPILOT" = true ] && setup_copilot

    # Resumen
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           ¡Configuración completada!                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""

    echo -e "${BOLD}Próximos pasos:${NC}"
    echo "  1. Revisá .github/TEAM.md y completá los datos"
    echo "  2. Editá AGENTS.md como fuente de verdad"
    echo "  3. Reiniciá tu IA para cargar los skills"
    echo ""
    echo -e "${BLUE}Para crear un Epic:${NC}"
    echo "  gh issue create --template epic.md"
    echo ""
}

# Ejecutar
main "$@"
