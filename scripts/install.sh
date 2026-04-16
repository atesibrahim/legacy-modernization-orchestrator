#!/usr/bin/env bash
# install.sh — Install Legacy Modernization Orchestrator agents and skills globally
# Usage: bash scripts/install.sh [--global | --local] [--claude] [--codex] [--all]
#
# --global  Install to ~/.claude/ and ~/.codex/  (default, works in any project)
# --local   Install to ./.claude/ and ./.codex/  (current project only)
# --claude  Install Claude Code agents + skills only
# --codex   Install Codex skills only
# --all     Install for all supported runtimes (default)

set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCOPE="global"
RUNTIMES=("claude" "codex")

# Parse args
for arg in "$@"; do
  case $arg in
    --local)   SCOPE="local" ;;
    --global)  SCOPE="global" ;;
    --claude)  RUNTIMES=("claude") ;;
    --codex)   RUNTIMES=("codex") ;;
    --all)     RUNTIMES=("claude" "codex") ;;
  esac
done

# Resolve install targets
if [[ "$SCOPE" == "global" ]]; then
  CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
  CODEX_DIR="$HOME/.codex"
  SCOPE_LABEL="global (~/.claude, ~/.codex)"
else
  CLAUDE_DIR="$(pwd)/.claude"
  CODEX_DIR="$(pwd)/.codex"
  SCOPE_LABEL="local ($(pwd))"
fi

echo ""
echo "══════════════════════════════════════════════════════════"
echo "  Legacy Modernization Orchestrator — Installer"
echo "══════════════════════════════════════════════════════════"
echo "  Source : $REPO_DIR"
echo "  Scope  : $SCOPE_LABEL"
echo "  Runtime: ${RUNTIMES[*]}"
echo "══════════════════════════════════════════════════════════"
echo ""

install_claude() {
  echo "▶ Installing Claude Code agents..."
  mkdir -p "$CLAUDE_DIR/agents"
  for agent_file in "$REPO_DIR/.claude/agents/"*.md; do
    name="$(basename "$agent_file")"
    cp "$agent_file" "$CLAUDE_DIR/agents/$name"
    echo "  ✓ agent: $name"
  done

  echo ""
  echo "▶ Installing Claude Code skills..."
  for skill_dir in "$REPO_DIR/.claude/skills/"/*/; do
    skill_name="$(basename "$skill_dir")"
    mkdir -p "$CLAUDE_DIR/skills/$skill_name"
    cp "$skill_dir/SKILL.md" "$CLAUDE_DIR/skills/$skill_name/SKILL.md"
    echo "  ✓ skill: $skill_name"
  done

  echo ""
  echo "  Claude Code install complete → $CLAUDE_DIR"
  echo "  Verify: type /analysing-legacy or @analysing-legacy in Claude Code"
}

install_codex() {
  echo "▶ Installing Codex skills..."
  for skill_dir in "$REPO_DIR/.codex/skills/"/*/; do
    skill_name="$(basename "$skill_dir")"
    mkdir -p "$CODEX_DIR/skills/$skill_name"
    cp "$skill_dir/SKILL.md" "$CODEX_DIR/skills/$skill_name/SKILL.md"
    echo "  ✓ skill: $skill_name"
  done

  echo ""
  echo "  Codex install complete → $CODEX_DIR"
  echo "  Verify: type \$analysing-legacy in Codex"
}

for runtime in "${RUNTIMES[@]}"; do
  case $runtime in
    claude) install_claude ;;
    codex)  install_codex ;;
  esac
  echo ""
done

echo "══════════════════════════════════════════════════════════"
echo "  Installation complete!"
echo ""
echo "  Claude Code: /analysing-legacy  or  @analysing-legacy"
echo "  Codex CLI  : \$analysing-legacy"
echo "══════════════════════════════════════════════════════════"
echo ""
