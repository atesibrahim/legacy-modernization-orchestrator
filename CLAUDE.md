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
| 1 | `legacy-analysis` | Always |
| 2 | `legacy-architecture` | Always |
| 2.5 | Tech Stack Selection Gate | Always |
| 3 | `target-architecture` | Always |
| 4a | `ui-ux-design` | If any client UI needed |
| 4b | `backend-development` | Optional |
| 4c | `frontend-development` | Optional |
| 4d | `ios-development` | Optional |
| 4e | `android-development` | Optional |
| 4f | `data-migration` | Optional |
| 4g | `security-review` | Optional |
| 4h | `devops-infra` | Optional |
| 4i | `cross-platform-mobile` | Optional (non-default) |
| 5 | `compare-legacy-to-new` | After any dev phase |
| 6 | `final-validation` | After Phase 5 |

> Phase 4a must complete before 4c/4d/4e/4i (they depend on wireframes); 4a can run in parallel with 4b; 4b/4c/4d/4e/4i can run in parallel with each other as scope allows. **4i is mutually exclusive with 4d/4e for the same mobile target** — do not run both native and cross-platform for the same platform. Before entering Phase 4, present the auto-detected development targets from Phase 1 for confirmation; ask directly only if Phase 1 is unavailable or ambiguous.

---

### `legacy-analysis`
Legacy system analysis — reverse engineering, technical debt, business flows, DB schema, integration maps, security posture.  
**Skill:** `.github/skills/legacy-analysis/SKILL.md`  
**Output dir:** `ai-driven-development/docs/legacy_analysis/`

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

### `cross-platform-mobile` _(Phase 4i — Optional, non-default)_
Flutter (Dart) or React Native (TypeScript) cross-platform mobile app targeting iOS and Android from a single codebase — Riverpod/BLoC or Zustand/Redux Toolkit state management, secure storage, Dio/Axios networking, FCM, flutter integration_test or Detox E2E testing, App Store and Play Store deployment.  
**Skill:** `.github/skills/cross-platform-mobile/SKILL.md`  
**Output dir:** `ai-driven-development/development/mobile_development/cross-platform/`  
**Prerequisites:** UI/UX design artifacts, system design, and `tech_stack_selections.md` confirming Flutter or React Native must exist.

---

### `compare-legacy-to-new`
Gap analysis — legacy vs new system comparison, migration strategy, before-after mermaid HTML diagrams, regression and improvement identification.  
**Skill:** `.github/skills/compare-legacy-to-new/SKILL.md`  
**Prerequisites:** Legacy analysis and at least one development phase complete.

---

### `data-migration`
Zero-data-loss schema migration — Flyway/Liquibase/Alembic/Goose scripts, dual-write reconciliation, large-table chunking, row-count/checksum validation, data cleansing pipelines, cutover freeze SQL and rollback procedures.  
**Skill:** `.github/skills/data-migration/SKILL.md`  
**Output dir:** `ai-driven-development/development/data_migration/`  
**Prerequisites:** `legacy_analysis/legacy_analysis.md`, `target_architecture/target_architecture.md`, and `tech_stack_selections.md` must exist.

---

### `security-review`
OWASP Top 10 checks per layer — hardcoded-secret detection, dependency CVE scanning (OWASP Dependency-Check / Trivy), API authorization audit, JWT validation review, CORS/CSP configuration, Docker image security.  
**Skill:** `.github/skills/security-review/SKILL.md`  
**Output dir:** `ai-driven-development/docs/security_review/`  
**Prerequisites:** `target_architecture/target_architecture.md`, `tech_stack_selections.md`, and any Phase 4 code outputs in scope must exist.

---

### `devops-infra`
Kubernetes manifests, Helm charts, Terraform/Pulumi modules, GitHub Actions / GitLab CI pipelines, Prometheus alerting rules, Grafana dashboards, secret management (HashiCorp Vault / External Secrets Operator), Docker image hardening.  
**Skill:** `.github/skills/devops-infra/SKILL.md`  
**Output dir:** `ai-driven-development/development/infra/`  
**Prerequisites:** `target_architecture/target_architecture.md`, `tech_stack_selections.md`, and backend code artifacts must exist.

---

### `final-validation`
Release readiness gate — functional completeness check, performance baseline, security clearance, operational readiness review, smoke test plan, go/no-go decision.  
**Skill:** `.github/skills/final-validation/SKILL.md`  
**Output dir:** `ai-driven-development/docs/final_validation/`  
**Prerequisites:** Phase 5 comparison report (`legacy_vs_new_system/compare_legacy_to_new_system.md`), `target_architecture/target_architecture.md`, and all in-scope Phase 4 todo files must exist.

---

### Tier-2 Backend Language Skills

These skills supplement `backend-development` with language-specific implementation patterns. Apply the matching skill **after** `tech_stack_selections.md` confirms the backend language choice. They share the same output directory as `backend-development`.

| Skill | When to apply | Skill file |
|---|---|---|
| `java-springboot` | Java 21 + Spring Boot 3 confirmed | `.github/skills/java-springboot/SKILL.md` |
| `dotnet-aspnetcore` | .NET 9 + ASP.NET Core confirmed | `.github/skills/dotnet-aspnetcore/SKILL.md` |
| `python-fastapi` | Python 3.12 + FastAPI confirmed | `.github/skills/python-fastapi/SKILL.md` |
| `go-gin-fiber` | Go 1.23 + Gin or Fiber confirmed | `.github/skills/go-gin-fiber/SKILL.md` |

**Output dir (all four):** `ai-driven-development/development/backend_development/`  
**Prerequisites:** `target_architecture/target_architecture.md` and `tech_stack_selections.md` must exist.

---

### `quality-playbook`
Cross-cutting quality reference — architecture decision trees (monolith vs microservices, DB strategy), design pattern selection, testing strategy, code quality standards, API design evaluation. Consult at any phase; produces no standalone output artifact.  
**Skill:** `.github/skills/quality-playbook/SKILL.md`  
**Output dir:** N/A — advisory reference only; findings are embedded in the calling phase's output.  
**Prerequisites:** None — consult at any phase.

---

### `agent-governance`
Framework governance reference — agent selection, phase chaining rules, DoD gate enforcement, standalone vs full-orchestration mode selection, project resume procedure.  
**Skill:** `.github/skills/agent-governance/SKILL.md`  
**Output dir:** N/A — governance reference only.  
**Prerequisites:** None — consult when unsure which agent to invoke or how to resume a project.

---

### `tech-stack-selection` _(Phase 2.5 Gate)_
Collects all flexible technology choices (backend language, frontend framework, database, mobile targets, cloud provider, secret manager, deployment platform) after Phase 2 and writes them to `tech_stack_selections.md`. All downstream agents (Phases 3–4) read from this file exclusively — do **not** ask for tech choices again after this gate.  
**Skill:** `.github/skills/tech-stack-selection/SKILL.md`  
**Template / output schema:** `.github/skills/tech-stack-selection/tech_stack_selections.template.md`  
**Output:** `ai-driven-development/docs/tech_stack_selections.md`
**Prerequisites:** `legacy_architecture/legacy_architecture.md` must exist (Phase 2 complete).

---

## Execution Rules

1. **Read the full `SKILL.md` first** — every time, for every agent invocation.
2. **Phases 1–3 are mandatory** — never skip analysis and design phases.
3. **No partial DoD** — all checklist items must be ✅ before the phase is considered done.
4. **Output location matters** — write all artifacts to the directories specified in the skill.
5. **Auto-detect scope from Phase 1** — after `legacy-analysis` completes, read **Section 10 — Technology Profile** in `legacy_analysis.md` to pre-fill scope (Backend / Web Frontend / iOS / Android / Cross-Platform Mobile). If mobile is detected, also use the recorded `Mobile Framework` field to distinguish native vs Flutter vs React Native before Phase 4. Present the detected scope to the user for confirmation. Do NOT ask all 4 questions blindly when the profile is already available.
6. **Phase 2.5 (Tech Stack Selection Gate) is mandatory** — collect ALL flexible technology choices from the user after Phase 2, save to `ai-driven-development/docs/tech_stack_selections.md`. All downstream agents read from this file. Do NOT ask for tech choices again in Phases 3–4.
7. **Only execute phases relevant to the confirmed scope** — skip and mark N/A any Phase 4 sub-phase whose tier is absent from the repository. Do not design, diagram, or produce code for layers that don't exist.
8. **Evidence-based only** — no assumptions; findings must be backed by code, config, or schema evidence.
