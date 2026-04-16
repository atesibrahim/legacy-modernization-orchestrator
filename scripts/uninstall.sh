#!/usr/bin/env bash
# uninstall.sh — Remove Legacy Modernization Orchestrator agents and skills
# Usage: bash scripts/uninstall.sh [--global | --local] [--claude] [--codex] [--all]

set -e

SCOPE="global"
RUNTIMES=("claude" "codex")
AGENTS=(
  analysing-legacy legacy-architecture target-architecture ui-ux-design
  backend-development frontend-development ios-development android-development
  compare-legacy-to-new legacy-modernization-orchestrator
)

for arg in "$@"; do
  case $arg in
    --local)   SCOPE="local" ;;
    --global)  SCOPE="global" ;;
    --claude)  RUNTIMES=("claude") ;;
    --codex)   RUNTIMES=("codex") ;;
    --all)     RUNTIMES=("claude" "codex") ;;
  esac
done

if [[ "$SCOPE" == "global" ]]; then
  CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
  CODEX_DIR="$HOME/.codex"
else
  CLAUDE_DIR="$(pwd)/.claude"
  CODEX_DIR="$(pwd)/.codex"
fi

echo ""
echo "══════════════════════════════════════════════════════════"
echo "  Legacy Modernization Orchestrator — Uninstaller"
echo "══════════════════════════════════════════════════════════"
echo ""

for runtime in "${RUNTIMES[@]}"; do
  if [[ "$runtime" == "claude" ]]; then
    echo "▶ Removing Claude Code agents..."
    for name in "${AGENTS[@]}"; do
      target="$CLAUDE_DIR/agents/$name.md"
      if [[ -f "$target" ]]; then rm "$target" && echo "  ✓ removed agent: $name.md"; fi
    done
    echo ""
    echo "▶ Removing Claude Code skills..."
    for name in "${AGENTS[@]}"; do
      target="$CLAUDE_DIR/skills/$name"
      if [[ -d "$target" ]]; then rm -rf "$target" && echo "  ✓ removed skill: $name"; fi
    done
  fi

  if [[ "$runtime" == "codex" ]]; then
    echo "▶ Removing Codex skills..."
    for name in "${AGENTS[@]}"; do
      target="$CODEX_DIR/skills/$name"
      if [[ -d "$target" ]]; then rm -rf "$target" && echo "  ✓ removed skill: $name"; fi
    done
  fi
  echo ""
done

echo "  Uninstall complete."
echo "══════════════════════════════════════════════════════════"
echo ""
