# Legacy Modernization Orchestrator

A structured multi-agent framework for end-to-end legacy system modernization.
Works with **Claude Code**, **OpenAI Codex CLI**, and **GitHub Copilot**.

---

## Agents

| Agent | Role |
|-------|------|
| `legacy-modernization-orchestrator` | Master orchestrator — runs all phases in order |
| `analysing-legacy` | Legacy codebase analysis, technical debt, DB schema, security posture |
| `legacy-architecture` | Legacy architecture diagrams (mermaid HTML) |
| `target-architecture` | Target architecture — Clean/Hexagonal/DDD, Java 21, Spring Boot 3.5, React 18 |
| `ui-ux-design` | Wireframes, design system, WCAG, HTML previews |
| `backend-development` | Java 21 Spring Boot 3.5 backend, JWT/OAuth2, JPA, Testcontainers |
| `frontend-development` | React 18 TypeScript, Redux Toolkit, TanStack Query, Playwright |
| `ios-development` | Swift SwiftUI, MVVM, Keychain, CoreData, XCTest |
| `android-development` | Kotlin Compose, MVVM, Room, Retrofit, Mockk |
| `compare-legacy-to-new` | Gap analysis, migration strategy, before/after diagrams |

---

## Installation

### Option 1 — npx (recommended)

```bash
npx legacy-modernization-orchestrator@latest
```

The interactive prompt asks for scope (global/local) and runtime (Claude Code, Codex, or both).

#### Non-interactive flags

```bash
# Global — available in every project on your machine (recommended)
npx legacy-modernization-orchestrator --global

# Local — current project only
npx legacy-modernization-orchestrator --local

# Specific runtimes
npx legacy-modernization-orchestrator --global --claude   # Claude Code only
npx legacy-modernization-orchestrator --global --codex    # Codex CLI only
npx legacy-modernization-orchestrator --global --all      # Both (default)

# Uninstall
npx legacy-modernization-orchestrator --uninstall --global --all
```

### Option 2 — Clone and run the shell script

```bash
git clone https://github.com/your-org/legacy-modernization-orchestrator.git
cd legacy-modernization-orchestrator
bash scripts/install.sh --global --all
```

---

## What gets installed

| Runtime | Location (global) | What |
|---------|------------------|------|
| Claude Code | `~/.claude/agents/*.md` | Named subagents (`@agent-name`) |
| Claude Code | `~/.claude/skills/<name>/SKILL.md` | Slash commands (`/agent-name`) |
| Codex CLI | `~/.codex/skills/<name>/SKILL.md` | Skill commands (`$agent-name`) |
| GitHub Copilot | `.github/agents/*.agent.md` | Agent definitions (in this repo) |

> For **local** installs, files go into `./.claude/` and `./.codex/` inside your project.

---

## Usage

### Claude Code

After installing, use agents in two ways:

**As a slash command (skill):**
```
/legacy-modernization-orchestrator path/to/my-legacy-app
/analysing-legacy path/to/my-legacy-app
/target-architecture MyProject
/backend-development MyProject
```

**As a subagent (invoked by the orchestrator or directly):**
```
@legacy-modernization-orchestrator path/to/my-legacy-app
@analysing-legacy path/to/my-legacy-app
```

**Typical full workflow:**
```
@legacy-modernization-orchestrator path/to/my-legacy-app
```
The orchestrator runs all phases automatically, asking you for scope (which dev targets) before Phase 4.

### Codex CLI

```bash
$legacy-modernization-orchestrator path/to/my-legacy-app
$analysing-legacy path/to/my-legacy-app
$target-architecture MyProject
$backend-development MyProject
```

### GitHub Copilot (VS Code)

Agents are defined in `.github/agents/`. Use the agent picker in VS Code Copilot Chat or reference them by name. The framework is also described in `AGENTS.md` at the repo root.

---

## Phase workflow

```
Phase 1  →  analysing-legacy          (always required)
Phase 2  →  legacy-architecture      (always required)
Phase 3  →  target-architecture             (always required)
             ↓ ask user: which targets?
Phase 4a →  ui-ux-design              (if any client UI)
Phase 4b →  backend-development       (optional)
Phase 4c →  frontend-development      (optional)
Phase 4d →  ios-development           (optional)
Phase 4e →  android-development       (optional)
             ↓ phases 4a–4e can run in parallel
Phase 5  →  compare-legacy-to-new     (after any dev phase)
Phase 6  →  Final Validation
```

All outputs are written to `ai-driven-development/` inside your project.

---

## How agents work

Each agent reads its full `SKILL.md` from `.github/skills/<name>/SKILL.md` before acting. The skill files contain the authoritative step-by-step procedures, output formats, and Definition of Done checklists. Agents never skip, reorder, or summarize steps.

The `.claude/agents/`, `.claude/skills/`, and `.codex/skills/` files installed on your machine are thin wrappers that point back to these skill files.

---

## Repository layout

```
.github/
  agents/          ← GitHub Copilot agent definitions (*.agent.md)
  skills/          ← Authoritative skill SKILL.md files (step-by-step procedures)
.claude/
  agents/          ← Claude Code subagent definitions (@agent-name)
  skills/          ← Claude Code slash command skills (/agent-name)
.codex/
  skills/          ← Codex CLI skill definitions ($agent-name)
bin/
  install.js       ← npx installer
scripts/
  install.sh       ← Shell installer (alternative)
  uninstall.sh     ← Shell uninstaller
AGENTS.md          ← Loaded by Codex CLI automatically
CLAUDE.md          ← Loaded by Claude Code CLI automatically
```

---

## Uninstall

```bash
# npx
npx legacy-modernization-orchestrator --uninstall --global --all

# shell
bash scripts/uninstall.sh --global --all
```

---

## License

MIT
