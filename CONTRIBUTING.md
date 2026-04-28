# Contributing to Legacy Modernization Orchestrator

Thank you for contributing. This document covers everything you need to add, edit, or validate skills and agents in the framework.

---

## Prerequisites

- **Node.js ≥ 18** (for the installer and validator scripts)
- **bash** (for the skill scaffold generator)
- Git — clone the repo and work on a feature branch

```bash
git clone https://github.com/tciates/legacy-modernization-orchestrator.git
cd legacy-modernization-orchestrator
```

---

## Repository Layout

```
.github/
  agents/     ← Agent wrapper files (*.agent.md) — one per skill
  skills/     ← Canonical skill definitions (**/SKILL.md, **/STANDARDS.md)
  standards/  ← Cross-cutting standards (core.md, STANDARDS_OUTPUTS.md)
  roster.json ← Single source of truth for the skill/agent roster

.claude/agents/    ← Claude Code agent wrappers (frontmatter + body)
.claude/skills/    ← Claude Code skill wrappers (frontmatter only)
.codex/skills/     ← Codex CLI skill wrappers (frontmatter only)

bin/install.js     ← npm package installer
scripts/           ← Developer tooling scripts
```

---

## Running Validators

Always run both validators before opening a PR:

```bash
# Scan staged skill files for decision-language (advisory — always exits 0)
node scripts/check-adr-prompts.js      # pre-commit mode (staged files only)
node scripts/check-adr-prompts.js --pr # PR mode (HEAD vs main)

# Check that all 6 roster sources agree with .github/roster.json
node scripts/validate-roster.js        # exit 0 = all clear, exit 1 = failures

# Check that runtime wrapper descriptions/hints match canonical definitions
node scripts/sync-wrappers.js --check  # exit 0 = in sync, exit 1 = drift

# Check that every dod.json is present and structurally valid
node scripts/generate-dod.js --check   # exit 0 = all valid, exit 1 = failures
```

All are wired as npm scripts:

```bash
npm run validate:roster   # validate-roster.js (includes dod.json check)
npm run ci:validate       # ci-validate.js (frontmatter YAML lint, link resolution, required headings, STANDARDS_OUTPUTS coverage)
npm run check:wrappers    # sync-wrappers.js --check
npm run check:dod         # generate-dod.js --check
npm run generate:dod      # regenerate all dod.json from SKILL.md DoD sections
npm run check:adr         # check-adr-prompts.js --all (advisory, always exits 0)
```

**Recommended: install the ADR prompt as a pre-commit hook** so it runs automatically on every commit:

```bash
echo 'node scripts/check-adr-prompts.js' >> .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Fix any reported failures **before** pushing. The PR checklist (below) requires both to pass.

---

## Adding a New Skill

### 1 — Scaffold the files

Use the generator script — it creates all required stubs and prints the registration steps:

```bash
bash scripts/new-skill.sh <skill-name>              # Tier-1 skill (no STANDARDS.md)
bash scripts/new-skill.sh <skill-name> --tier2       # Tier-2 language skill (adds STANDARDS.md)
bash scripts/new-skill.sh <skill-name> --phase 4b    # set phase in the stub (default: advisory)
```

`<skill-name>` must be lowercase with hyphens (e.g. `graphql-gateway`, `react-native-mobile`).

The script creates:
- `.github/skills/<skill-name>/SKILL.md` — canonical skill definition stub
- `.github/skills/<skill-name>/STANDARDS.md` — technology-specific standards (Tier-2 only)
- `.github/agents/<skill-name>.agent.md` — agent wrapper stub
- `.claude/agents/<skill-name>.md` — Claude Code agent frontmatter
- `.claude/skills/<skill-name>/SKILL.md` — Claude Code skill wrapper
- `.codex/skills/<skill-name>/SKILL.md` — Codex CLI skill wrapper

### 2 — Fill in the stubs

Open each generated file and replace every `TODO` placeholder:

| File | Key sections to fill |
|---|---|
| `SKILL.md` | Role, Prerequisites (Preflight), Output Directory, Procedure steps, Definition of Done |
| `STANDARDS.md` | Architecture rules, code patterns, banned patterns for the language/framework |
| `*.agent.md` | When to Use bullets, Prerequisites list, Outputs list, DoD (copy from SKILL.md) |

Follow the schema in [`.github/standards/core.md`](/.github/standards/core.md) §§ 3–4 and §12 for frontmatter fields, DoD format, and Preflight contract.

### 3 — Register the skill

Add an entry to **`.github/roster.json`**:

```json
{
  "name": "<skill-name>",
  "phase": "<phase>",
  "tier": "1",
  "skill_path": ".github/skills/<skill-name>/SKILL.md",
  "agent_path": ".github/agents/<skill-name>.agent.md",
  "required": "optional",
  "depends_on": ["<prerequisite-skill>"],
  "outputs": ["ai-driven-development/<output-path>/"],
  "installer": true,
  "status": "Active"
}
```

Then add the skill name to the `AGENTS` array in `bin/install.js`.

### 4 — Update documentation

Add the new skill to:
- `AGENTS.md` — agent roster section
- `CLAUDE.md` — Agent Roster table
- `.github/agents/legacy-modernization-orchestrator.agent.md` — phase table
- `.github/skills/STANDARDS_OUTPUTS.md` — artifact tree

### 5 — Sync and validate

```bash
node scripts/sync-wrappers.js           # sync runtime wrapper descriptions
node scripts/validate-roster.js         # must exit 0 before PR
```

---

## Editing an Existing Skill

1. Edit the canonical file: `.github/skills/<name>/SKILL.md` (and `STANDARDS.md` if it exists).
2. If the `description` or `argument-hint` frontmatter changed, update `scripts/sync-wrappers.js` WRAPPERS array and run `npm run sync:wrappers`.
3. Bump `version` (e.g. `1.0.0` → `1.1.0` for new steps, `2.0.0` for changed outputs) and update `last_reviewed` to today in the frontmatter.
4. If the DoD changed, run `npm run generate:dod` to regenerate `dod.json`, then update the matching `.github/agents/<name>.agent.md` DoD section — all three in the same commit.
5. Run `npm run validate:roster` and `npm run ci:validate` — exit 0 required for both.

---

## Deprecating a Skill

Follow the deprecation process in [`agent-governance/SKILL.md §9`](.github/skills/agent-governance/SKILL.md). Summary:

1. Change `status: Active` → `status: Deprecated` in frontmatter; add `deprecated_since`, `sunset_date` (6 months), and `successor`.
2. Add a `## ⚠️ Deprecated` banner to the skill body.
3. Update `roster.json` to reflect the new status.
4. Announce in `AGENTS.md`, `CLAUDE.md`, and the orchestrator phase table.

---

## Commit Conventions

Use conventional commit format:

| Type | Use for |
|---|---|
| `feat` | New skill, new script, new section in a skill |
| `fix` | Bug fix in a skill procedure, wrong output path, broken validator |
| `docs` | README, CONTRIBUTING, comment-only changes |
| `refactor` | Restructuring an existing skill without changing behaviour |
| `chore` | Dependency updates, version bumps, config changes |

Examples:
```
feat: add graphql-gateway skill (Phase 4b Tier-2)
fix: ios-development output path aligned with STANDARDS_OUTPUTS.md
docs: add quarterly review trigger to agent-governance §9
```

---

## PR Checklist

Before requesting review, confirm all of these:

- [ ] `npm run validate:roster` exits 0
- [ ] `npm run ci:validate` exits 0
- [ ] `npm run check:wrappers` exits 0
- [ ] New `SKILL.md` has all required frontmatter: `name`, `description`, `argument-hint`, `version`, `last_reviewed`, `status`
- [ ] DoD in `.agent.md` is an exact copy of the DoD in `SKILL.md`
- [ ] New skill registered in `roster.json` and `bin/install.js`
- [ ] `AGENTS.md`, `CLAUDE.md`, and orchestrator phase table updated
- [ ] `STANDARDS_OUTPUTS.md` updated if new output paths introduced
- [ ] `version` and `last_reviewed` bumped on every edited `SKILL.md`
