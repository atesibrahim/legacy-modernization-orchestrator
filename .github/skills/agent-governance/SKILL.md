---
name: agent-governance
description: 'Framework governance reference for the legacy-modernization-orchestrator. Use when: selecting the correct agent to invoke, chaining agents in the right order, resuming an in-progress project, understanding phase ordering and DoD gates, choosing between full orchestration and standalone phase modes.'
argument-hint: 'Framework governance reference — no argument required'
version: 1.0.0
last_reviewed: 2026-04-27
status: Active
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
                    ├─► Phase 4g (security-review)  ←  after any of 4b/4c/4d/4e/4i has code
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
| 4g | At least one of 4b/4c/4d/4e/4i has produced code |
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
| Project targets cross-platform mobile (Flutter/RN) | 4a (ui-ux-design), 4i (cross-platform-mobile) — only when `tech_stack_selections.md` § Mobile confirms Flutter or React Native; keep native 4d/4e as the default recommendation |

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

Architecture Decision Records (ADRs) are created whenever a significant decision is made that deviates from default framework behaviour. The ADR template is in [`.github/standards/core.md`](../../standards/core.md) § ADR Template.

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
   - Prerequisites (Preflight) — table format per [core.md](../../standards/core.md) § Preflight Contract
   - Output Directory
   - Procedure (numbered phases/steps)
   - Definition of Done (DoD) — checkboxes per [core.md](../../standards/core.md) § DoD Conventions
   - Next Skill (link to downstream skill)

2. If technology-specific, create `.github/skills/{skill-name}/STANDARDS.md` with the Tier 2 banner from [core.md](../../standards/core.md) § Standards Tier Model

3. **Create a matching `.agent.md` wrapper** at `.github/agents/{skill-name}.agent.md` containing:
   - Role summary (one line)
   - `## Skill Reference` block linking to the `SKILL.md`
   - `## Prerequisites` list
   - `## Outputs` (directory + key files)
   - `## Definition of Done` (exact copy of the skill's DoD checkboxes)

   > **Policy (enforced):** Every skill under `.github/skills/*/SKILL.md` MUST have a corresponding `.agent.md` under `.github/agents/` and a lightweight wrapper under `.claude/agents/`. Both the agent file and the skill file must be updated in the same PR when either changes. CI must fail if a `SKILL.md` exists without a matching `.agent.md`.

4. Register the new skill in:
   - `.github/agents/legacy-modernization-orchestrator.agent.md` (phase table + artifact map)
   - `AGENTS.md` (agent roster)
   - `CLAUDE.md` (agent roster)
   - `.github/skills/STANDARDS_OUTPUTS.md` (artifact tree)
   - `scripts/sync-wrappers.js` WRAPPERS array (if the skill has wrapper files in `.claude/` or `.codex/`)

4. Add the skill to `.github/roster.json` with the correct `phase`, `tier`, `required`, `depends_on`, `outputs`, and `status: "active"` fields.

5. Run `npm run sync:wrappers` to propagate descriptions to all wrapper files.

6. Run `npm run validate:roster` to confirm all checks pass before merging.

---

## 9. Skill Deprecation & Sunset

Every skill has a lifecycle status. The canonical status value lives in the `status` field of the SKILL.md frontmatter and is mirrored in `.github/roster.json`.

### 9.1 Status Values

| Status | Meaning | Action for callers |
|---|---|---|
| `Active` | Skill is current, maintained, and recommended for use | Use normally |
| `Deprecated` | Skill still works but is scheduled for removal; a successor exists | Migrate to the successor skill before the sunset date |
| `Retired` | Skill has been removed from the framework; invoking it is an error | Remove references; use the migration path documented at retirement |

### 9.2 Deprecation Process

1. **Propose** — Open a PR that changes the skill's `status` from `Active` to `Deprecated`.
   - Add a `deprecated_since` field (YYYY-MM-DD) and a `sunset_date` field (6 months from `deprecated_since`).
   - Add a `successor` field naming the replacement skill (e.g., `java-springboot`).
   - Add a `## ⚠️ Deprecated` banner at the top of the skill body (below frontmatter) with the sunset date and migration instructions.
   - Update `.github/roster.json` to reflect the new status.

2. **Announce** — Update `AGENTS.md`, `CLAUDE.md`, and the orchestrator agent's phase table to add a deprecation note next to the affected skill entry.

3. **Sunset (6-month window)** — During this window, the skill continues to function. Callers should migrate to the successor. The `validate-roster.js` Check 10 emits a **WARN** for any `Deprecated` skill still listed as a dependency in the roster.

4. **Retire** — At or after `sunset_date`, open a PR that:
   - Changes `status` to `Retired`.
   - Deletes the `.github/skills/{name}/` directory and `.github/agents/{name}.agent.md`.
   - Removes the skill from `bin/install.js` AGENTS, `.github/roster.json`, `AGENTS.md`, `CLAUDE.md`, and the orchestrator phase table.
   - Updates `STANDARDS_OUTPUTS.md` to remove the skill's output paths if they no longer apply.

### 9.3 Frontmatter Fields for Deprecated Skills

```yaml
---
name: <skill-slug>
description: '...'
argument-hint: '...'
version: 2.1.0
last_reviewed: 2026-04-27
status: Active
status: Deprecated
deprecated_since: 2026-04-27
sunset_date: 2026-10-27
successor: <replacement-skill-name>
---
```

### 9.4 Migration Path Template

When deprecating a skill, include this migration block in the skill body:

```markdown
## ⚠️ Deprecated

This skill is deprecated as of **YYYY-MM-DD** and will be retired on **YYYY-MM-DD** (6-month window).

**Successor:** [`<successor-skill>`](../<successor-skill>/SKILL.md)

**Migration steps:**
1. Replace all invocations of `<this-skill>` with `<successor-skill>`.
2. Review the successor's Preflight section — prerequisites may have changed.
3. Re-run the affected phase using the successor skill; outputs are written to the same directory.
4. Remove `<this-skill>` from any project-level `redesign_progress.md` rows if it was listed.
```

### 9.5 Quarterly Review

At the start of each quarter, run `npm run validate:roster`. Any skill with `last_reviewed` more than 365 days ago is flagged by Check 9. Review flagged skills and either:
- Update `last_reviewed` (if still current), or
- Initiate the deprecation process (§9.2) if the skill has become obsolete.

---

## 8. Agentic Evaluation Framework

This section defines how to audit any agent's output for DoD compliance. Use it when reviewing a completed phase, when taking over an in-progress project, or when running a quality gate before proceeding to the next phase.

---

### Evaluation Protocol

**For each completed phase**, run the following 4-step evaluation:

#### Step E1 — Artifact Presence Check

Read `ai-driven-development/redesign_progress.md` and the relevant skill's **Output Directory** table. For every expected output file:
- ✅ `Present` — file exists at the specified path
- ❌ `Missing` — file does not exist → **Phase is not complete**

```markdown
## Artifact Presence — Phase {N} [{skill-name}]
| Expected Artifact | Path | Status |
|---|---|---|
| legacy_analysis.md | ai-driven-development/docs/legacy_analysis/ | ✅ Present |
| risk_matrix.md | ai-driven-development/docs/legacy_analysis/ | ❌ Missing |
```

**If any artifact is missing**: Mark phase as `❌ Incomplete` and do not proceed.

---

#### Step E2 — DoD Checkbox Audit

Read the skill's **Definition of Done (DoD)** section. For each checkbox item:
- ✅ `Pass` — the item is demonstrably satisfied by the artifact content
- ⚠️ `Partial` — item is partially satisfied; record what is missing
- ❌ `Fail` — item is not satisfied and is blocking

Record the DoD audit result:

```markdown
## DoD Audit — Phase {N} [{skill-name}]
| DoD Item | Status | Evidence / Gap |
|---|---|---|
| Legacy modules/packages listed | ✅ Pass | Section 2 of legacy_analysis.md |
| All DB tables inventoried | ⚠️ Partial | 47/52 tables documented; stored proc inventory missing |
| Security findings listed | ✅ Pass | Section 6 of legacy_analysis.md |
| Integration map complete | ❌ Fail | integration_map.md not created |
```

**Scoring**:
- **Green (proceed)**: All items ✅ Pass or ⚠️ Partial with documented acceptance
- **Yellow (proceed with risk)**: ≤ 2 ⚠️ Partial items; all ❌ Fail items formally accepted in writing
- **Red (do not proceed)**: Any ❌ Fail item unresolved without written stakeholder acceptance

---

#### Step E3 — Evidence Quality Check

For each major finding or decision in the phase output, verify it is backed by evidence per [core.md](../../standards/core.md) § Evidence Rules:
- **Code evidence**: finding references a specific file, class, function, line range, or query
- **Config evidence**: finding references a named config file or environment variable
- **Schema evidence**: finding references a table name, column, constraint, or stored procedure

Flag unsupported claims:

```markdown
## Evidence Gaps — Phase {N} [{skill-name}]
| Claim | Type | Evidence Present? | Notes |
|---|---|---|---|
| "Password stored in plain text" | Security | ✅ Yes | User.java:45 — MD5 hash |
| "System has high coupling" | Architecture | ⚠️ Weak | Qualitative only — no dependency metrics |
| "DB performs poorly at scale" | Performance | ❌ No | No query plans, indexes, or timing cited |
```

---

#### Step E4 — Phase Readiness Score

Aggregate the three checks into a single readiness score:

```markdown
## Phase Readiness Score — Phase {N} [{skill-name}]
| Check | Result | Blocking? |
|---|---|---|
| Artifact Presence | ✅ 5/5 present | No |
| DoD Audit | ⚠️ 8/10 pass, 2 partial | No (accepted) |
| Evidence Quality | ❌ 2 unsupported claims | YES — must remediate |

**Overall**: 🔴 NOT READY TO PROCEED — remediate evidence gaps first
```

Readiness levels:
- 🟢 **READY** — All checks green/yellow, no unresolved blockers
- 🟡 **CONDITIONALLY READY** — Proceed with documented accepted risks
- 🔴 **NOT READY** — One or more blocking items must be remediated

---

### Cross-Phase Consistency Check

After all phases complete (before Phase 6 go/no-go), run a cross-phase consistency audit:

| Consistency Rule | Check |
|---|---|
| Tech stack in Phase 3 matches `tech_stack_selections.md` | Read both documents; verify no contradictions |
| API contracts in Phase 3 match Phase 4b implementation | Spot-check 3 endpoints from target_architecture vs backend code |
| UI component names in Phase 4a match Phase 4c implementation | Spot-check 5 component names from wireframes vs frontend code |
| Data model in Phase 3 matches Phase 4f migration scripts | Compare ERD from target architecture vs migration DDL |
| Security findings in Phase 4g match Phase 5 risk register | All open findings referenced in comparison report |

Record any contradictions as cross-phase discrepancies and resolve before issuing a Go decision.

---

### Evaluation Output Format

When running a full project evaluation (e.g., before Phase 6 or when taking over an in-progress project), produce:

```markdown
# Project Evaluation Report — [Project Name] — [Date]

## Phases Evaluated
| Phase | Agent | Readiness | Notes |
|---|---|---|---|
| 1 | legacy-analysis | 🟢 READY | All artifacts present, DoD 12/12 |
| 2 | legacy-architecture | 🟡 CONDITIONALLY READY | 1 diagram outdated — accepted |
| 3 | target-architecture | 🟢 READY | |
| 4a | ui-ux-design | 🟢 READY | |
| 4b | backend-development | 🔴 NOT READY | OpenAPI spec missing |
| 5 | compare-legacy-to-new | ⏳ Not started | Blocked by Phase 4b |

## Blockers
1. Phase 4b: OpenAPI spec not generated (DoD item 3/10 ❌ Fail)

## Accepted Risks
1. Phase 2: Architecture diagram for batch processor subsystem is outdated — accepted by [Name] [date]

## Recommended Next Action
Remediate Phase 4b OpenAPI spec, then proceed to Phase 5.
```

---

## 10. Failure Modes & Recovery

This section provides recovery recipes for the most common failure scenarios in a multi-phase modernization run. Apply the appropriate recipe before escalating or re-running from Phase 1.

---

### FM-1 — Phase Fails DoD Gate (Single Failure)

**Symptom**: At the end of a phase, one or more DoD checkboxes remain ❌ Fail.

**Protocol**:
1. Do **not** proceed to the next phase.
2. Record the failing items in `ai-driven-development/redesign_progress.md` under the current phase row with status `❌ Incomplete`.
3. Identify the root cause:
   - **Missing artifact** → re-run only the step that produces the missing file (Mode C — Repair / Patch).
   - **Incorrect content** → re-run the specific step that produced the incorrect content and overwrite.
   - **Scope not applicable** → formally accept the skip in writing (see FM-4).
4. Re-run the DoD audit (Step E2 from §8) before proceeding.

---

### FM-2 — Phase Fails DoD Gate Twice (Repeated Failure)

**Symptom**: A phase has been attempted twice and still fails DoD on the same items.

**Protocol**:
1. **Stop the run**. Do not attempt a third execution of the same phase without intervention.
2. File a **Blocker ADR** at `ai-driven-development/docs/adr/ADR-{NNN}-blocker-phase-{N}.md` documenting:
   - Which DoD items are failing
   - What was attempted in each run and why it did not satisfy the item
   - A proposed resolution: remediate prerequisite data, accept the gap, or descope the item
3. Present the ADR to the user / stakeholder for a Go/No-Go decision.
4. Depending on the decision:
   - **Remediate** — fix the upstream prerequisite (may require re-running a prior phase) then re-attempt.
   - **Accept gap** — mark the DoD item as `⚠️ Accepted with risk` in `redesign_progress.md`; document the business justification and the risk owner.
   - **Descope** — update the phase's scope, remove the failing item from the DoD for this project, update `redesign_progress.md`.

> **Rule**: No phase may be marked ✅ Complete while carrying an unresolved ❌ Fail DoD item without a signed-off acceptance record.

---

### FM-3 — Two Phases Produce Conflicting Artifacts

**Symptom**: Two phases have both passed DoD, but their outputs contradict each other (e.g., Phase 3 API contract vs Phase 4b OpenAPI spec; Phase 4a component names vs Phase 4c implementation).

**Protocol**:
1. Apply the precedence rules from §4 to determine which artifact wins.
2. The **losing** artifact must be corrected to align with the winner — do not modify the winning artifact unless a new decision is made and documented as an ADR.
3. Re-run the minimal set of steps needed to regenerate the losing artifact:
   - Use **Mode C — Repair / Patch** (§1); do not re-run the full phase.
4. Update `redesign_progress.md` to note the conflict, its resolution, and the correcting commit/run.
5. Re-run the DoD audit for the corrected phase before proceeding.

**Common conflict patterns and their resolutions**:

| Conflict | Winner | Recovery action |
|---|---|---|
| Phase 3 API contract ≠ Phase 4b OpenAPI spec | Phase 3 | Regenerate OpenAPI spec in Phase 4b to match Phase 3 routes |
| Phase 4a component names ≠ Phase 4c implementation | Phase 4a | Rename components in Phase 4c to match the design system |
| Phase 4f migration DDL ≠ Phase 3 target ERD | Phase 3 | Regenerate migration scripts in Phase 4f to match target ERD |
| Phase 4g security finding requires API change | Phase 4g | Phase 3 and 4b must be updated via a new ADR — security findings override architecture |
| Phase 3 SLOs ≠ Phase 4h Prometheus alert thresholds | Phase 3 | Regenerate alert thresholds in Phase 4h to match Phase 3 SLOs |

---

### FM-4 — User Changes Tech Stack Mid-Run

**Symptom**: After Phase 2.5 locked the tech stack in `tech_stack_selections.md`, the user requests a stack change (e.g., switching from Java to .NET, or adding a mobile target that was originally descoped).

**Protocol**:

#### Case A — Change before Phase 3 begins (low impact)
1. Update `tech_stack_selections.md` with the new choices.
2. Record the change reason in an ADR (`ADR-{NNN}-tech-stack-change.md`).
3. Proceed normally — Phase 3 and all downstream phases read the updated file.

#### Case B — Change after Phase 3 but before any Phase 4 code is produced (medium impact)
1. Update `tech_stack_selections.md` and file an ADR.
2. **Re-run Phase 3** (`target-architecture`) with the new stack — the architecture diagrams, API contracts, and tech stack section must reflect the new choice.
3. Mark Phase 3 in `redesign_progress.md` as `🔄 Re-run needed` before running.
4. All Phase 4 sub-phases that have not yet started proceed normally with the updated artifacts.

#### Case C — Change after Phase 4 code has been produced (high impact)
1. **Stop all active Phase 4 sub-phases**.
2. Assess blast radius: list all Phase 4 outputs that are stack-specific (e.g., `.java` files, `build.gradle`, Spring Boot config).
3. File a **Stack Change ADR** documenting: reason, blast radius, re-work estimate, rollback option.
4. Present the ADR to the user for sign-off before any rework.
5. After sign-off:
   - Update `tech_stack_selections.md`.
   - Re-run Phase 3 (architecture).
   - Re-run each affected Phase 4 sub-phase from the beginning (overwrite old outputs — they are stack-invalid).
   - Re-run Phase 5 (compare-legacy-to-new) after all Phase 4 outputs are updated.
6. Update `redesign_progress.md` to reflect which phases were re-run and why.

> **Prevention**: Phase 2.5 (Tech Stack Selection Gate) exists specifically to prevent Case C. If the user is uncertain, instruct them to finalize all stack choices before Phase 3 begins.

---

### FM-5 — Required Prerequisite Artifact Is Missing at Phase Start

**Symptom**: Entering a phase whose Preflight checklist requires an artifact that does not exist (e.g., `tech_stack_selections.md` is missing when starting Phase 3).

**Protocol**:
1. **Do not proceed** with the current phase. Stop and report the missing artifact.
2. Identify which upstream phase is responsible for producing it (see §2 Prerequisite Chain).
3. Determine whether the upstream phase was skipped, failed, or never run:
   - **Never run** → invoke the upstream phase in Mode B (standalone) and produce the missing artifact.
   - **Failed** → apply FM-1 / FM-2 to resolve the upstream phase first.
   - **Skipped intentionally** → confirm with the user whether the skip is still valid; if the downstream phase now requires it, the skip must be reversed.
4. Once the missing artifact is confirmed present, re-attempt the current phase.

---

### FM-6 — Agent Produces Partial / Incomplete Output (Crash or Context Limit)

**Symptom**: A phase run was interrupted mid-execution (context window exceeded, session timeout, or explicit cancellation), leaving output files that are incomplete or truncated.

**Protocol**:
1. Identify which steps in the phase completed and which did not by inspecting the partial output files.
2. Mark the phase as `🔄 Partial` in `redesign_progress.md`, listing the last completed step.
3. Re-invoke the agent in **Mode C — Repair / Patch** with an explicit instruction:
   > "Resume Phase {N} [{skill-name}] from Step {X}. Steps 1–{X-1} are complete and their outputs are at `{path}`. Do not regenerate already-complete steps."
4. After resuming, run the full DoD audit (Step E2 from §8) on all outputs — partial writes can corrupt content in earlier steps.
5. Update `redesign_progress.md` to ✅ Complete only after the full DoD audit passes.
