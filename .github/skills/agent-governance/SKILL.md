---
name: agent-governance
description: 'Framework governance reference for the legacy-modernization-orchestrator. Use when: selecting the correct agent to invoke, chaining agents in the right order, resuming an in-progress project, understanding phase ordering and DoD gates, choosing between full orchestration and standalone phase modes.'
argument-hint: 'Framework governance reference — no argument required'
---

# Agent Governance — SKILL.md

## Role
**Framework Governance Reference**

This document defines how to correctly select, invoke, and chain agents in the legacy-modernization-orchestrator framework. Read this when unsure which agent to invoke, how to run multiple agents, or how to resume a project in progress.

---

## 1. Agent Invocation Modes

### Mode A — Full Orchestration (use for new or in-progress projects)
Invoke `legacy-modernization-orchestrator` as the entry point. It executes all phases in order, validates DoD at each gate, and coordinates all sub-agents.

**When to use**:
- Starting a new legacy modernization project from scratch
- Resuming an in-progress project (orchestrator reads `redesign_progress.md` to find the current phase)
- Running all phases end-to-end with automated sequencing

**Command pattern**:
> "Modernize the legacy system at `{path}`. Use the `legacy-modernization-orchestrator` agent."

---

### Mode B — Standalone Phase (use for isolated phase runs)
Invoke an individual sub-agent directly when you only need output from a single phase, not the full workflow.

**When to use**:
- You already have Phase 1–2 outputs and only need target architecture designed (invoke `target-architecture` directly)
- You want to re-run a single phase without repeating all prior phases
- You are experimenting with a specific phase

**Pre-condition**: The phase's `## Prerequisites (Preflight)` section must be satisfied. If required prior-phase artifacts are missing, the skill will stop and report what is needed.

**Command pattern**:
> "Run the `legacy-analysis` agent on the codebase at `{path}`."

---

### Mode C — Repair / Patch (use when fixing a single output)
Invoke an individual sub-agent to regenerate or fix a single artifact without re-running the full phase.

**When to use**:
- One diagram in `legacy_architecture.html` is broken — invoke `legacy-architecture` with a note to regenerate just that diagram
- The backend needs an additional endpoint — continue in `backend-development` from the current phase

**Important**: Do not re-run prior phases to fix a downstream issue. Navigate to the correct agent and fix in place.

---

## 2. Prerequisite Chain (Phase Dependencies)

The following chain defines which phases must complete before each agent can run:

```
Phase 1 (legacy-analysis)
  └─► Phase 2 (legacy-architecture)
        └─► Phase 2.5 (Tech Stack Selection Gate — user confirms tech choices)
              └─► Phase 3 (target-architecture)
                    ├─► Phase 4a (ui-ux-design)  ←  required before 4c/4d/4e
                    │     ├─► Phase 4c (frontend-development)
                    │     ├─► Phase 4d (ios-development)
                    │     └─► Phase 4e (android-development)
                    ├─► Phase 4b (backend-development)  ←  can run parallel with 4a
                    ├─► Phase 4f (data-migration)  ←  parallel, depends only on Phase 3
                    ├─► Phase 4g (security-review)  ←  after any of 4b/4c/4d/4e has code
                    └─► Phase 4h (devops-infra)  ←  parallel with 4b, depends on Phase 3
                          └─► Phase 5 (compare-legacy-to-new)  ←  requires ≥1 Phase 4 artifact
                                └─► Phase 6 (final-validation)
```

**Summary of hard dependencies**:
| Phase | Requires |
|---|---|
| 2 | Phase 1 complete |
| 2.5 | Phase 2 complete |
| 3 | Phase 2.5 complete (tech_stack_selections.md exists) |
| 4a | Phase 3 complete |
| 4b | Phase 3 complete |
| 4c | Phase 4a complete |
| 4d | Phase 4a complete |
| 4e | Phase 4a complete |
| 4f | Phase 3 complete (target DB schema known) |
| 4g | At least one of 4b/4c/4d/4e has produced code |
| 4h | Phase 3 complete |
| 5 | Phase 3 complete + at least one Phase 4 artifact exists |
| 6 | Phase 5 complete |

---

## 3. When to Skip Optional Phases

Use this decision table to determine which Phase 4 sub-phases apply:

| Condition | Include |
|---|---|
| Project has a web browser UI | 4a (ui-ux-design), 4c (frontend-development) |
| Project has an iOS mobile app | 4a (ui-ux-design), 4d (ios-development) |
| Project has an Android mobile app | 4a (ui-ux-design), 4e (android-development) |
| Project is backend-only API (no UI) | 4b only — skip 4a, 4c, 4d, 4e |
| Legacy DB schema needs migration to new schema | 4f (data-migration) |
| Security review required before go-live | 4g (security-review) |
| Kubernetes / Helm / Terraform infra needed | 4h (devops-infra) |
| Project targets cross-platform mobile (Flutter/RN) | ❌ Not supported — see cross-platform note in orchestrator |

**The orchestrator auto-detects scope from Phase 1 Section 10 (Technology Profile)** and presents the detected scope to the user for confirmation before Phase 4. Do NOT ask all questions blindly if the profile is already known.

---

## 4. Resolving Conflicts Between Agents

When two agents produce overlapping outputs (e.g., both `target-architecture` and `backend-development` define API contracts), follow this precedence:

| Winner | Loser | Rule |
|---|---|---|
| `target-architecture` | `backend-development` | Architecture defines API contracts — backend implements them. If they conflict, backend must conform, not override. |
| `ui-ux-design` | `frontend-development` | Design tokens and component API are defined by ui-ux-design — frontend implements them. |
| `target-architecture` | `data-migration` | Target schema is defined by architecture — migration scripts must conform to it. |
| `legacy-analysis` | All other phases | If legacy analysis findings contradict assumptions made in later phases, the later phase must be corrected. |

---

## 5. Resuming In-Progress Projects

1. Read `ai-driven-development/redesign_progress.md` — find the last ✅ Complete phase
2. Check the next phase's preflight checklist — confirm all required artifacts exist
3. Invoke the next in-sequence agent in **Mode B** (standalone)
4. Update `redesign_progress.md` to ✅ after completing the phase

**Do not re-run completed phases** unless explicitly requested or a prior-phase artifact was found to be incorrect (in which case re-run from the incorrect phase forward, not from Phase 1).

---

## 6. ADR Governance

Architecture Decision Records (ADRs) are created whenever a significant decision is made that deviates from default framework behaviour. The ADR template is in [`.github/standards/core.md`](../standards/core.md) § ADR Template.

**Create an ADR when**:
- Choosing a non-default tech stack option not listed in `tech_stack_selections.md`
- Skipping a normally-required DoD item with justification
- Introducing a cross-cutting dependency not shown in the target architecture
- Accepting a known security finding rather than remediating it

**ADR placement**: `ai-driven-development/docs/adr/ADR-{NNN}-{title}.md`

**ADR numbering**: Sequential, starting at ADR-001. Never reuse or skip numbers. ADR-000 is reserved for documenting the ADR process itself (create on first use).

---

## 7. Adding New Skills or Agents

When extending the framework with a new skill:

1. Create `.github/skills/{skill-name}/SKILL.md` following this structure:
   - Role (who this agent is)
   - Prerequisites (Preflight) — table format per [core.md](../standards/core.md) § Preflight Contract
   - Output Directory
   - Procedure (numbered phases/steps)
   - Definition of Done (DoD) — checkboxes per [core.md](../standards/core.md) § DoD Conventions
   - Next Skill (link to downstream skill)

2. If technology-specific, create `.github/skills/{skill-name}/STANDARDS.md` with the Tier 2 banner from [core.md](../standards/core.md) § Standards Tier Model

3. Register the new skill in:
   - `.github/agents/legacy-modernization-orchestrator.agent.md` (phase table + artifact map)
   - `AGENTS.md` (agent roster)
   - `.github/skills/STANDARDS_OUTPUTS.md` (artifact tree)
   - `scripts/sync-wrappers.js` WRAPPERS array (if the skill has wrapper files in `.claude/` or `.codex/`)

4. Run `npm run sync:wrappers` to propagate descriptions to all wrapper files

5. Run `npm run check:wrappers` to validate no drift remains
