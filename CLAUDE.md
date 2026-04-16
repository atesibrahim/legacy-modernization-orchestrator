# Legacy Modernization Orchestrator — Claude Instructions

This repository contains a structured multi-agent framework for end-to-end legacy system modernization. You must use the agents and skills defined here whenever a user asks you to analyse, design, or modernize a legacy system.

---

## Repository Layout

```
.github/
  agents/    ← Agent definitions (*.agent.md) — read these for role and DoD rules
  skills/    ← Detailed skill instructions (**/SKILL.md) — read these before doing any work
ai-driven-development/   ← All generated outputs go here (created during runs)
```

---

## Core Principle

When invoked for any legacy modernization task, you MUST:
1. Identify the correct agent from the roster below.
2. **Read the agent's `SKILL.md` file in full** before starting.
3. Follow every step in the skill exactly — no skipping, reordering, or summarizing.
4. Validate the Definition of Done checklist before declaring an agent complete.

---

## Agent Roster

### Master Orchestrator: `legacy-modernization-orchestrator`
**Trigger:** Starting or continuing a full legacy modernization project end-to-end.  
**Agent file:** `.github/agents/legacy-modernization-orchestrator.agent.md`  

**Mandatory phase sequence:**

| Phase | Agent | Required? |
|-------|-------|-----------|
| 1 | `analysing-legacy` | Always |
| 2 | `legacy-architecture` | Always || 2.5 | Tech Stack Selection Gate | Always || 3 | `target-architecture` | Always |
| 4a | `ui-ux-design` | If any client UI needed |
| 4b | `backend-development` | Optional |
| 4c | `frontend-development` | Optional |
| 4d | `ios-development` | Optional |
| 4e | `android-development` | Optional |
| 5 | `compare-legacy-to-new` | After any dev phase |
| 6 | Final Validation | After Phase 5 |

> Phases 4b–4e can run in parallel after scope is confirmed. Always ask the user which development targets are required before entering Phase 4.

---

### `analysing-legacy`
Legacy system analysis — reverse engineering, technical debt, business flows, DB schema, integration maps, security posture.  
**Skill:** `.github/skills/analysing-legacy/SKILL.md`  
**Output dir:** `ai-driven-development/docs/analysing/`

---

### `legacy-architecture`
Legacy architecture visualization — component diagrams, data flow maps, mermaid HTML diagrams, architectural constraint documentation.  
**Skill:** `.github/skills/legacy-architecture/SKILL.md`  
**Output dir:** `ai-driven-development/docs/legacy_architecture/`

---

### `target-architecture`
Target architecture design — Clean/Hexagonal/DDD patterns, service boundaries, API-first design, user-selected: Java/.NET/Python/Go backend, React/Vue/Angular/Svelte frontend, Kotlin mobile stack.  
**Skill:** `.github/skills/target-architecture/SKILL.md`  
**Output dir:** `ai-driven-development/docs/target_architecture/`

---

### `ui-ux-design`
UI/UX design — wireframes, design system, user journeys for web and mobile, WCAG accessibility, HTML design previews, component tokens.  
**Skill:** `.github/skills/ui-ux-design/SKILL.md`  
**Output dir:** `ai-driven-development/docs/ui_design/`

---

### `backend-development`
Java Spring Boot / .NET ASP.NET Core / Python FastAPI / Go Gin-Fiber backend — clean/hexagonal architecture, DDD modules, REST APIs, JWT/OAuth2, ORM repositories, unit/integration/Testcontainers testing, observability.  
**Skill:** `.github/skills/backend-development/SKILL.md`  
**Prerequisites:** `target_architecture/target_architecture.md` must exist.

---

### `frontend-development`
React / Vue / Angular / Svelte TypeScript frontend — design system components, TanStack Query / Zustand / Pinia / NgRx state management, Axios, Vitest/Playwright testing. Use `ios-development` or `android-development` for mobile.  
**Skill:** `.github/skills/frontend-development/SKILL.md`  
**Prerequisites:** UI/UX design artifacts and system design must exist.

---

### `ios-development`
Swift SwiftUI iOS app — MVVM, Combine/async-await, Keychain, URLSession, CoreData, FCM, XCTest, App Store deployment.  
**Skill:** `.github/skills/ios-development/SKILL.md`  
**Prerequisites:** UI/UX design artifacts and system design must exist.

---

### `android-development`
Kotlin Jetpack Compose Android app — MVVM Clean Architecture, Coroutines Flow, EncryptedSharedPreferences/Keystore, Retrofit/OkHttp, Room, FCM, JUnit/Mockk/Turbine, Play Store deployment.  
**Skill:** `.github/skills/android-development/SKILL.md`  
**Prerequisites:** UI/UX design artifacts and system design must exist.

---

### `compare-legacy-to-new`
Gap analysis — legacy vs new system comparison, migration strategy, before-after mermaid HTML diagrams, regression and improvement identification.  
**Skill:** `.github/skills/compare-legacy-to-new/SKILL.md`  
**Prerequisites:** Legacy analysis and at least one development phase complete.

---

## Execution Rules

1. **Read the full `SKILL.md` first** — every time, for every agent invocation.
2. **Phases 1–3 are mandatory** — never skip analysis and design phases.
3. **No partial DoD** — all checklist items must be ✅ before the phase is considered done.
4. **Output location matters** — write all artifacts to the directories specified in the skill.
5. **Auto-detect scope from Phase 1** — after `analysing-legacy` completes, read **Section 10 — Technology Profile** in `legacy_analyse.md` to pre-fill scope (Backend / Web Frontend / iOS / Android). Present the detected scope to the user for confirmation. Do NOT ask all 4 questions blindly when the profile is already available.
6. **Phase 2.5 (Tech Stack Selection Gate) is mandatory** — collect ALL flexible technology choices from the user after Phase 2, save to `ai-driven-development/docs/tech_stack_selections.md`. All downstream agents read from this file. Do NOT ask for tech choices again in Phases 3–4.
7. **Only execute phases relevant to the confirmed scope** — skip and mark N/A any Phase 4 sub-phase whose tier is absent from the repository. Do not design, diagram, or produce code for layers that don't exist.
8. **Evidence-based only** — no assumptions; findings must be backed by code, config, or schema evidence.
