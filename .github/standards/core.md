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

---

## 3. Definition of Done (DoD) Conventions

- Every skill has a `## Definition of Done (DoD)` section at the end of the Procedure
- Every DoD item is a checkbox: `- [ ] {Measurable criterion}`
- DoD items must be **verifiable** — not "looks good" but "Lighthouse score ≥ 90 on mobile"
- A phase is **only complete** when ALL DoD checkboxes are ✅
- Partial completion is not acceptable — flag blockers explicitly and resolve before marking complete
- The orchestrator validates DoD before triggering the next phase

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
