# Core Standards — Legacy Modernization Orchestrator

This document defines cross-cutting conventions enforced by all agents and skills in this framework.

## Standards Tier Model

This framework uses a **two-tier standards model**:

| Tier | File | Scope | Override? |
|---|---|---|---|
| **Tier 1 — Core (this file)** | `.github/standards/core.md` | Universal — all phases, all skills, all languages | No — create an ADR if a justified exception is needed |
| **Tier 2 — Skill-local** | `.github/skills/{skill}/STANDARDS.md` | Technology or skill-specific extensions | Only for items explicitly scoped to that technology |

**Rules:**
- Tier 1 always takes precedence over Tier 2 where they overlap
- Tier 2 files must not contradict Tier 1 — they only add technology-specific detail
- Language-specific STANDARDS.md files (e.g., `java-springboot/STANDARDS.md`, `dotnet-aspnetcore/STANDARDS.md`) are a sub-category of Tier 2 — they extend both `backend-development/STANDARDS.md` (Tier 2) and this file (Tier 1)

All skills MUST conform to these standards. Tier 2 STANDARDS.md files are technology-specific extensions of this document.

---

## 1. Naming Conventions

### Files & Directories
| Artifact Type | Convention | Example |
|---|---|---|
| Analysis markdown | `snake_case.md` | `legacy_analysis.md` |
| Architecture diagram (HTML) | `snake_case.html` | `legacy_architecture.html` |
| Progress tracker | `redesign_progress.md` | (fixed name) |
| Todo lists | `{phase}_development_todo.md` | `be_development_todo.md` |
| Phase output dirs | `snake_case/` | `target_architecture/` |
| Source code | Per language convention | Java: `PascalCase.java` |

### Code Symbols
| Language | Classes | Functions/Methods | Variables | Constants |
|---|---|---|---|---|
| Java | `PascalCase` | `camelCase` | `camelCase` | `UPPER_SNAKE_CASE` |
| Kotlin | `PascalCase` | `camelCase` | `camelCase` | `UPPER_SNAKE_CASE` |
| C# (.NET) | `PascalCase` | `PascalCase` | `camelCase` | `PascalCase` |
| Python | `PascalCase` | `snake_case` | `snake_case` | `UPPER_SNAKE_CASE` |
| Go | `PascalCase` (exported) | `camelCase` (private) | `camelCase` | `PascalCase` (exported) |
| TypeScript | `PascalCase` (types/classes) | `camelCase` | `camelCase` | `UPPER_SNAKE_CASE` |
| Swift | `PascalCase` | `camelCase` | `camelCase` | `camelCase` (enum cases too) |

### API Endpoints
- Use kebab-case for URL path segments: `/api/customer-orders/{id}`
- Resource names are plural nouns: `/api/orders`, not `/api/order`
- Version prefix: `/api/v1/...`
- Action endpoints (non-REST): `/api/v1/orders/{id}/cancel` (verb suffix after resource)

---

## 2. Architecture Decision Record (ADR) Template

Every significant architecture decision must be recorded as an ADR in `ai-driven-development/docs/adr/ADR-{NNN}-{title}.md`.

```markdown
# ADR-{NNN}: {Short Title}

**Status**: Proposed | Accepted | Deprecated | Superseded by ADR-{NNN}  
**Date**: YYYY-MM-DD  
**Deciders**: {names/roles}

## Context
What is the issue or situation that requires a decision?

## Decision
What is the decision that was made?

## Consequences
### Positive
- ...

### Negative
- ...

### Risks
- ...

## Alternatives Considered
| Alternative | Reason Rejected |
|---|---|
| | |
```

**ADR numbering**: Start at ADR-001, increment by 1. ADR-000 is reserved for the ADR process itself.

### ADR Capture Workflow

To prevent decisions from being embedded in skill prose without a formal record, the framework includes an automated prompt tool:

```bash
node scripts/check-adr-prompts.js           # scan git-staged changes (pre-commit)
node scripts/check-adr-prompts.js --pr      # scan HEAD vs main (CI / PR check)
node scripts/check-adr-prompts.js --all     # scan all skill files
```

Or via npm: `npm run check:adr`

**This check is advisory — it never blocks a commit.** It scans changed `SKILL.md` files for decision-language keywords (`chose`, `decided`, `selected`, `adopted`, `instead of`, `rather than`, etc.) and prints a prompt when a potential unrecorded decision is found. The author decides whether the change warrants an ADR.

**Install as a git pre-commit hook** (recommended for contributors):

```bash
echo 'node scripts/check-adr-prompts.js' >> .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

**When an ADR IS required** (create the file before merging):
- Choosing a technology or framework not listed in `tech_stack_selections.md`
- Skipping a normally-required DoD item with justification
- Introducing a cross-cutting dependency not shown in the target architecture
- Accepting a known security finding rather than remediating it
- Changing the output path of any skill artifact

**When an ADR is NOT required:**
- Clarifying existing wording without changing intent
- Adding a new procedure step within an existing design decision
- Fixing a typo or reformatting

---

## 3. Definition of Done (DoD) Conventions

- Every skill has a `## Definition of Done (DoD)` section at the end of the Procedure
- Every DoD item is a checkbox: `- [ ] {Measurable criterion}`
- DoD items must be **verifiable** — not "looks good" but "Lighthouse score ≥ 90 on mobile"
- A phase is **only complete** when ALL DoD checkboxes are ✅
- Partial completion is not acceptable — flag blockers explicitly and resolve before marking complete
- The orchestrator validates DoD before triggering the next phase

### Machine-Readable DoD (dod.json)

Every skill directory must also contain a `dod.json` file — the machine-readable parallel of the markdown DoD. This is the authoritative source for programmatic validation and meta-agent gate checks. Regenerate with `node scripts/generate-dod.js`.

**Schema:**
```json
{
  "skill": "<skill-name>",
  "version": "1.0.0",
  "generated_from": "SKILL.md",
  "items": [
    {
      "id": "<PREFIX>-NN",
      "description": "<exact text from the markdown checkbox>",
      "verifier": "glob | cmd | manual",
      "glob": "<ai-driven-development/... path pattern>",
      "cmd":  "<shell command that exits 0 on pass>",
      "note": "<optional human hint for manual items>"
    }
  ]
}
```

**Verifier types:**

| Type | Meaning | When to use |
|---|---|---|
| `glob` | File existence check — artifact at the given path must exist | Output files / directories that can be presence-checked |
| `cmd` | Shell command exits 0 | Linters, formatters, test runners (`./mvnw verify`, `ruff check .`) |
| `manual` | Requires human or agent review | Quality judgements, stakeholder sign-offs, content validation |

**Maintenance rule:** When a DoD item is added, changed, or removed in `SKILL.md`, run `node scripts/generate-dod.js` to regenerate `dod.json`. Both files must be updated in the same commit. CI Check 11 (`validate-roster.js`) fails if `dod.json` is missing or structurally invalid.

---

## 4. Preflight Contract

Every skill that depends on prior phase outputs MUST include a `## Prerequisites (Preflight)` section as the **first section after the Role**. This section must:

1. List every required artifact with its expected file path
2. State whether the artifact is required for all runs or conditional on scope
3. Specify the action to take if an artifact is missing:
   - Stop execution
   - Report which artifact is missing and which phase produces it
   - Offer two options: (a) invoke the prerequisite phase now, or (b) provide the artifact path manually

**Standard preflight format**:
```markdown
## Prerequisites (Preflight)
Before starting, verify the following artifacts exist:

| Artifact | Expected Path | Required? |
|---|---|---|
| {Artifact name} | `{path}` | Always / If {condition} |

**If any required artifact is missing**: Stop. Report: "Artifact `{path}` not found. This is produced by Phase {N} (`{agent-name}`). Options: (a) Run Phase {N} now, (b) Provide the path to the artifact manually."
```

---

## 5. Artifact Validation Checklist

Before writing any HTML output file, validate:
- [ ] `<!DOCTYPE html>` present exactly once (no accidental file append)
- [ ] All Mermaid diagrams use `<pre class="mermaid">` blocks (not `<div>`)
- [ ] Every `subgraph` has a matching `end`
- [ ] `alt … else … end` in `sequenceDiagram` is fully closed
- [ ] No `\n` inside quoted Mermaid node labels — use `<br/>` for multi-line
- [ ] Node IDs contain no spaces or reserved keywords (`end`, `subgraph`)
- [ ] File renders without Mermaid parse errors in a browser

Before writing any Markdown report:
- [ ] All tables have header and separator rows
- [ ] All section headings follow H2/H3/H4 hierarchy (no skipped levels)
- [ ] File path references use relative paths from `ai-driven-development/`
- [ ] No external URLs embedded (use relative links within the project)

---

## 6. Output Artifact Structure

See [`.github/skills/STANDARDS_OUTPUTS.md`](./STANDARDS_OUTPUTS.md) for the complete expected artifact tree with descriptions, owning phases, and conditions.

---

## 7. Evidence-Based Analysis Rule

All findings in analysis, architecture, and comparison reports must be backed by:
- **Code evidence**: file path + line numbers or function/class names
- **Configuration evidence**: config file name + key
- **Schema evidence**: table name + column name
- **Log evidence**: log pattern + timestamp range

Findings without evidence must be marked `(estimated)` and the estimation method stated.

---

## 8. Sensitive Data Handling

- Never log, print, or include in reports: passwords, API keys, tokens, PII (names, emails, SSNs)
- When capturing DB schema examples, use anonymized/synthetic values in examples
- When capturing API response examples, redact personal data fields
- Hard-coded secrets found during analysis are a **Critical** security finding — report immediately

---

## 10. Standard Error Response Format (RFC 9457)

All backend APIs across **all language stacks** MUST return errors in [RFC 9457 Problem Details](https://datatracker.ietf.org/doc/html/rfc9457) format (July 2023, obsoletes RFC 7807). This is the Tier-1 contract — Tier-2 language STANDARDS.md files must not define a different shape; justify any deviation in an ADR.

**Canonical shape**:
```json
{
  "type": "https://tools.ietf.org/html/rfc9457",
  "title": "Validation failed",
  "status": 422,
  "detail": "One or more fields failed validation.",
  "instance": "/api/v1/orders",
  "traceId": "abc-123-def-456"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | URI string | Yes | URI identifying the problem type; defaults to `"about:blank"` when no custom page exists |
| `title` | string | Yes | Human-readable summary — stable across occurrences of the same problem type |
| `status` | integer | Yes | HTTP status code |
| `detail` | string | No | Human-readable explanation specific to this occurrence |
| `instance` | URI string | No | URI reference identifying this specific occurrence (typically the request path) |
| `traceId` | string | Yes | Distributed trace ID for log correlation — mandatory extension field for all responses |

**Extension for validation errors** (optional `errors` map per RFC 9457 §3.1):
```json
{
  "type": "about:blank",
  "title": "Validation failed",
  "status": 422,
  "detail": "One or more fields failed validation.",
  "instance": "/api/v1/orders",
  "traceId": "abc-123-def-456",
  "errors": {
    "email": ["must not be blank"],
    "age": ["must be a positive integer"]
  }
}
```

**HTTP status code mapping** (consistent across all stacks):
| Code | Meaning |
|---|---|
| `400` | Bad request / malformed input |
| `401` | Not authenticated |
| `403` | Authenticated but not authorized |
| `404` | Resource not found |
| `409` | Conflict (duplicate or state violation) |
| `422` | Semantic validation failure |
| `500` | Unexpected server error — never expose stack traces |

---

## 11. Functional Coverage Status Vocabulary

All feature-coverage tables in comparison reports MUST use exactly these five status strings. No variants, abbreviations, or combined values are permitted — each state is mutually exclusive.

| Status | CSS class | Meaning | Go/No-Go implication |
|---|---|---|---|
| `✅ Full` | `coverage-full` | Fully implemented with functional parity | No action needed |
| `⚠️ Partial` | `coverage-partial` | Implemented but missing edge cases or minor behaviour | Document gap; acceptable if non-critical |
| `🔄 Planned` | `coverage-planned` | Absent in new system but roadmapped (ticket / sprint exists) | Must have acceptance criteria and delivery date before cutover |
| `❌ Missing` | `coverage-missing` | Absent with no remediation plan | **Blocks cutover** if feature is critical |
| `🗑️ Removed` | `coverage-removed` | Intentionally not migrated — stakeholder sign-off recorded | Document justification; no action required |

**Rules:**
- Use `🔄 Planned` (not `❌`) when a delivery commitment exists — this is a different risk profile from `❌ Missing`.
- A `❌ Missing` item on a critical feature is a hard go/no-go blocker; `final-validation` must surface all such items.
- `🗑️ Removed` requires a written justification in the comparison report; it cannot be assumed.
- Downstream tooling (scripts, CI checks) must match against these exact Unicode strings.

---

## 9. Phase Tracker Format

`ai-driven-development/redesign_progress.md` must be maintained throughout the project:

```markdown
# Redesign Progress — [Project Name]

Last updated: YYYY-MM-DD

| Phase | Agent | Status | Completed At | Notes |
|---|---|---|---|---|
| 1 | legacy-analysis | ✅ Complete | YYYY-MM-DD | |
| 2 | legacy-architecture | ✅ Complete | YYYY-MM-DD | |
| 2.5 | Tech Stack Selection | ✅ Complete | YYYY-MM-DD | Java Spring Boot, React |
| 3 | target-architecture | 🔄 In Progress | — | |
| 4a | ui-ux-design | ⏳ Not Started | — | |
| 4b | backend-development | ⏳ Not Started | — | |
| 4c | frontend-development | ⏳ Not Started | — | |
| 4d | ios-development | N/A | — | Not in scope |
| 4e | android-development | N/A | — | Not in scope |
| 4f | data-migration | ⏳ Not Started | — | |
| 4g | security-review | ⏳ Not Started | — | |
| 5 | compare-legacy-to-new | ⏳ Not Started | — | |
| 6 | final-validation | ⏳ Not Started | — | |
```

Status values: `✅ Complete` | `🔄 In Progress` | `⏳ Not Started` | `N/A`

---

## 12. Skill Frontmatter Schema

Every `SKILL.md` file under `.github/skills/` MUST begin with a YAML frontmatter block containing exactly these fields. The linter (`npm run validate:roster`) enforces presence and validates values.

### Required fields

| Field | Type | Constraint | Description |
|---|---|---|---|
| `name` | string | Matches parent directory slug (lowercase, hyphens only) | Machine-readable skill identifier |
| `description` | string | ≤ 500 chars (warn above); must contain `"Use when:"` or `"Act as"` trigger context | Used by AI runtimes to select the correct skill; must include trigger phrases |
| `argument-hint` | string | Required for active skills; `"no argument required"` is valid for advisory-only skills | Short phrase describing what argument the caller should pass |

### Recommended fields

| Field | Type | Format | Description |
|---|---|---|---|
| `version` | string | Semantic version `MAJOR.MINOR.PATCH` | Current version of the skill content; bump `MINOR` for new steps or DoD items, `MAJOR` for breaking changes to outputs |
| `last_reviewed` | string | `YYYY-MM-DD` | Date the skill was last substantively reviewed; drives quarterly review queue |
| `status` | string | `Active` \| `Deprecated` \| `Retired` | Lifecycle state per `agent-governance/SKILL.md` §9; defaults to `Active` when absent |

Bump `version` and update `last_reviewed` in the same commit as any material skill change (new step, revised DoD gate, changed output path).

### Canonical template

```yaml
---
name: <skill-slug>
description: '<Role sentence>. Use when: <comma-separated trigger phrases>. Outputs: <key artifacts>. NOT for: <exclusions — optional>. Requires: <prerequisites — optional>.'
argument-hint: '<Short description of the expected argument>'
version: 1.0.0
last_reviewed: YYYY-MM-DD
status: Active
---
```

### Rules

- **`name`** must equal the directory name of the skill (e.g., `legacy-analysis` for `.github/skills/legacy-analysis/SKILL.md`). CI will fail if they diverge.
- **`description`** must be a single line (no newlines). Descriptions > 500 chars generate a CI warning; descriptions > 800 chars are a CI error.
- **`argument-hint`** is required on all skills. For advisory reference skills that take no argument (e.g., `agent-governance`, `quality-playbook`), use the value `"no argument required"` — do not omit the field.
- **`version`** must follow `MAJOR.MINOR.PATCH` semver. Start at `1.0.0` for all existing skills.
- **`last_reviewed`** must be `YYYY-MM-DD`. CI warns if the date is more than 365 days in the past.
- **`status`** must be one of `Active`, `Deprecated`, or `Retired`. When `Deprecated`, `deprecated_since`, `sunset_date`, and `successor` fields are also required (see `agent-governance/SKILL.md` §9).
- Frontmatter must be fenced with `---` on both sides, with no blank lines inside the block.

### Enforcement

`scripts/validate-roster.js`:
- Check 8 — `name`, `description`, `argument-hint` presence and format (**FAIL** on missing; **WARN/FAIL** on description length)
- Check 9 — `version` and `last_reviewed` presence (**WARN** if absent; **WARN** if `last_reviewed` > 365 days ago)
- Check 10 — `status` value (**WARN** if `Deprecated`; **FAIL** if `Retired`; **WARN** if `Deprecated` but `deprecated_since`/`sunset_date`/`successor` are missing)
