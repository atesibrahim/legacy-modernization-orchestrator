# Legacy Modernization Orchestrator — Agent Instructions

This repository contains a structured multi-agent framework for end-to-end legacy system modernization. All detailed skill instructions live in `.github/skills/`. All agent definitions live in `.github/agents/`.

---

## How to Use This Framework

When a user asks you to modernize, analyse, or redesign a legacy system, you MUST act as the appropriate agent defined below. Read the referenced `SKILL.md` file in full before proceeding — it contains the authoritative, step-by-step instructions, output formats, and Definition of Done checklists. **Do NOT skip, reorder, or summarize steps.**

---

## Agent Roster

### `legacy-modernization-orchestrator` _(Master Orchestrator)_
**Use when:** Starting or continuing a full legacy modernization project.  
**Role:** Execute all phases in strict order, validate DoD gates, coordinate all other agents.  
**Agent file:** `.github/agents/legacy-modernization-orchestrator.agent.md`

**Phase Order:**
```
Phase 1 → Phase 2 → Phase 2.5 (Tech Stack Selection Gate) → Phase 3 → [Scope Selection] → Phase 4 (optional parallel) → Phase 5 → Phase 6
```

| Phase | Agent | Required? |
|-------|-------|----------|
| 1 | `legacy-analysis` | Always |
| 2 | `legacy-architecture` | Always |
| 2.5 | `tech-stack-selection` | Always |
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

---

### `legacy-analysis`
**Use when:** Analysing legacy codebase, reverse engineering legacy architecture, identifying technical debt, mapping business flows, detecting hidden dependencies, assessing security posture, database schema reverse engineering, stored procedures and triggers inventory, table ownership matrix, data quality assessment, creating legacy architecture reports, risk matrix, data and integration maps before any redesign or migration project.  
**Argument hint:** Path or description of the legacy project to analyze  
**Skill file:** `.github/skills/legacy-analysis/SKILL.md`

---

### `legacy-architecture`
**Use when:** Visualizing legacy architecture, creating system diagrams for legacy systems, understanding legacy component relationships, mapping legacy data flows, identifying architectural weaknesses, producing mermaid diagrams in HTML format, documenting legacy architectural constraints before redesign.  
**Argument hint:** Legacy system name or path to analysis report to base diagrams from  
**Skill file:** `.github/skills/legacy-architecture/SKILL.md`

---

### `tech-stack-selection` _(Phase 2.5 Gate)_
**Use when:** Collecting all flexible technology choices after Phase 2 completes — backend language, frontend framework, database engine, mobile targets, cloud provider, secret manager, deployment platform. Writes `tech_stack_selections.md` that all downstream agents (Phases 3–4) read exclusively. Do NOT ask for tech choices again after this gate.  
**Argument hint:** Project name (reads legacy architecture artifacts automatically)  
**Skill file:** `.github/skills/tech-stack-selection/SKILL.md`  
**Template / output schema:** `.github/skills/tech-stack-selection/tech_stack_selections.template.md`  
**Output:** `ai-driven-development/docs/tech_stack_selections.md`

---

### `target-architecture`
**Use when:** Designing new modern system architecture, creating target state architecture, applying clean architecture hexagonal DDD microservices patterns, defining service boundaries bounded contexts API-first design, producing mermaid architecture diagrams in HTML, tech stack user-selected: Java/.NET/Python/Go backend, React/Vue/Angular/Svelte frontend, Kotlin mobile.  
**Argument hint:** Project name or path to legacy analysis and legacy design artifacts  
**Skill file:** `.github/skills/target-architecture/SKILL.md`

---

### `ui-ux-design`
**Use when:** Designing user interfaces for modernized application, creating wireframes mockups design systems, defining user journeys for web and mobile iOS Android, applying WCAG accessibility standards, building responsive mobile-first design, producing HTML design previews, creating component design system tokens typography colors.  
**Argument hint:** Application name and list of primary user roles or workflows to design for  
**Skill file:** `.github/skills/ui-ux-design/SKILL.md`

---

### `backend-development`
**Use when:** Building Java Spring Boot / .NET ASP.NET Core / Python FastAPI / Go Gin-Fiber backend, implementing clean architecture hexagonal architecture, setting up domain-driven design modules, implementing REST APIs OpenAPI security JWT OAuth2, database ORM repositories, testing unit integration Testcontainers, observability metrics tracing logging, phased development plan backend implementation.  
**Argument hint:** Project name or path to system design artifacts to base backend implementation on  
**Skill file:** `.github/skills/backend-development/SKILL.md`

---

### Tier-2 Backend Language Skills

Apply the matching Tier-2 skill **after** `tech_stack_selections.md` confirms the backend language. Run alongside `backend-development` — they add language-specific patterns on top of the Tier-1 procedure.

#### `java-springboot`
**Use when:** `tech_stack_selections.md` confirms Java 21 + Spring Boot 3.  
**Argument hint:** Project name or path to target architecture artifacts  
**Skill file:** `.github/skills/java-springboot/SKILL.md`

#### `dotnet-aspnetcore`
**Use when:** `tech_stack_selections.md` confirms .NET 9 + ASP.NET Core.  
**Argument hint:** Project name or path to target architecture artifacts  
**Skill file:** `.github/skills/dotnet-aspnetcore/SKILL.md`

#### `python-fastapi`
**Use when:** `tech_stack_selections.md` confirms Python 3.12 + FastAPI.  
**Argument hint:** Project name or path to target architecture artifacts  
**Skill file:** `.github/skills/python-fastapi/SKILL.md`

#### `go-gin-fiber`
**Use when:** `tech_stack_selections.md` confirms Go 1.23 + Gin or Fiber.  
**Argument hint:** Project name or path to target architecture artifacts  
**Skill file:** `.github/skills/go-gin-fiber/SKILL.md`

---

### `frontend-development`
**Use when:** Building React / Vue / Angular / Svelte TypeScript frontend, implementing design system components, state management TanStack Query Zustand Pinia NgRx, API integration Axios, code splitting lazy loading performance optimization, Vitest Playwright testing, phased frontend development plan. For mobile clients use `ios-development` or `android-development` instead.  
**Argument hint:** Project name or path to UI/UX design artifacts and system design to implement  
**Skill file:** `.github/skills/frontend-development/SKILL.md`

---

### `ios-development`
**Use when:** Building Swift SwiftUI iOS mobile app, implementing MVVM architecture, Combine async-await, Keychain token storage, URLSession networking, CoreData local persistence, push notifications, deep linking, unit testing XCTest, UI testing, App Store deployment, phased iOS development plan.  
**Argument hint:** Project name or path to UI/UX design artifacts and system design to implement  
**Skill file:** `.github/skills/ios-development/SKILL.md`

---

### `android-development`
**Use when:** Building Kotlin Jetpack Compose Android mobile app, implementing MVVM Clean Architecture, Kotlin Coroutines Flow, EncryptedSharedPreferences Keystore token storage, Retrofit OkHttp networking, Room local persistence, push notifications FCM, deep linking, unit testing JUnit Mockk Turbine, UI testing Espresso Compose, Play Store deployment, phased Android development plan.  
**Argument hint:** Project name or path to UI/UX design artifacts and system design to implement  
**Skill file:** `.github/skills/android-development/SKILL.md`

---

### `cross-platform-mobile` _(Phase 4i — Optional, non-default)_
**Use when:** Building Flutter (Dart) or React Native (TypeScript) cross-platform mobile app targeting iOS and Android from a single codebase, implementing Riverpod/BLoC (Flutter) or Zustand/Redux Toolkit (React Native) state management, flutter_secure_storage or react-native-keychain token storage, Dio or Axios networking, FCM push notifications, deep linking, flutter integration_test or Detox E2E testing, App Store and Play Store deployment. **Only invoke when `tech_stack_selections.md` § Mobile explicitly confirms Flutter or React Native.** For native-first projects use `ios-development` and/or `android-development`.  
**Argument hint:** Project name or path to UI/UX design artifacts and system design to implement  
**Skill file:** `.github/skills/cross-platform-mobile/SKILL.md`

---

### `data-migration`
**Use when:** Migrating data from legacy to new schema, writing Flyway/Liquibase/Alembic/Goose schema migration scripts, implementing dual-write reconciliation, validating row counts and checksums, performing large-table chunking, repairing referential integrity, running legacy data cleansing pipelines, executing post-migration data quality audits, producing cutover freeze SQL and rollback procedures.  
**Argument hint:** Project name or path to legacy analysis and target architecture artifacts  
**Skill file:** `.github/skills/data-migration/SKILL.md`

---

### `security-review`
**Use when:** Performing OWASP Top 10 checks per layer, detecting hardcoded secrets and credentials, scanning dependency CVEs with OWASP Dependency-Check or Trivy, auditing API authorization coverage, reviewing JWT validation algorithm and rotation, auditing CORS and CSP configuration, verifying Docker image security, producing a security findings report before go-live.  
**Argument hint:** Project name or path to target architecture and Phase 4 code outputs  
**Skill file:** `.github/skills/security-review/SKILL.md`

---

### `devops-infra`
**Use when:** Producing Kubernetes manifests, Helm charts, Terraform/Pulumi cloud infrastructure modules, GitHub Actions / GitLab CI pipelines, Prometheus alerting rules, Grafana dashboards, secret management with HashiCorp Vault or External Secrets Operator, Docker image security.  
**Argument hint:** Project name or path to target architecture and backend development artifacts  
**Skill file:** `.github/skills/devops-infra/SKILL.md`

---

### `compare-legacy-to-new`
**Use when:** Comparing legacy system with redesigned system, gap analysis between legacy and new, mapping legacy components to new equivalents, creating migration strategy, producing before-after diagrams in HTML mermaid, validating that all legacy functionality is covered in new design, identifying improvements and regressions.  
**Argument hint:** Path to legacy analysis and new system design artifacts to compare  
**Skill file:** `.github/skills/compare-legacy-to-new/SKILL.md`

---

### `final-validation`
**Use when:** Performing functional completeness check, capturing performance baseline, conducting security clearance review, verifying operational readiness, producing smoke test plan, making go/no-go decision before production cutover.  
**Argument hint:** Project name (reads Phase 5 comparison report and all Phase 4 todo files automatically)  
**Skill file:** `.github/skills/final-validation/SKILL.md`

---

### `quality-playbook` _(Advisory — no standalone output)_
**Use when:** Evaluating architecture decisions (monolith vs microservices), selecting design patterns, reviewing testing strategy, applying code quality standards, evaluating API design options. Consult at any phase; produces no standalone output artifact — findings are embedded in the calling phase's output.  
**Argument hint:** Phase name or specific quality concern to evaluate  
**Skill file:** `.github/skills/quality-playbook/SKILL.md`

---

### `agent-governance` _(Advisory — no standalone output)_
**Use when:** Selecting which agent to invoke, understanding phase chaining rules and DoD gates, choosing between full orchestration and standalone phase modes, resuming an in-progress project.  
**Argument hint:** Description of where you are in the project and what you need to do next  
**Skill file:** `.github/skills/agent-governance/SKILL.md`

---

### Cross-Platform Mobile

> **Native (Swift/Kotlin) is the default and recommended path.** Cross-platform mobile (Phase 4i) is an optional, non-default path supported via the `cross-platform-mobile` skill (Flutter and React Native only).
>
> | Decision | When | Agent to use |
> |---|---|---|
> | Native iOS | Platform-native behaviour, deep OS integration | `ios-development` (Phase 4d) |
> | Native Android | Platform-native behaviour, deep OS integration | `android-development` (Phase 4e) |
> | Flutter | Unified codebase, team knows Dart, confirmed in `tech_stack_selections.md` | `cross-platform-mobile` (Phase 4i) |
> | React Native | Unified codebase, team knows React/TS, confirmed in `tech_stack_selections.md` | `cross-platform-mobile` (Phase 4i) |
> | KMM (Kotlin Multiplatform Mobile) | **Not supported** — KMM is a business-logic sharing layer, not a full UI framework | Use native 4d + 4e with shared domain module |
>
> Do NOT use `ios-development` or `android-development` to generate Flutter/React Native code — the output will be incorrect.
> Do NOT use `cross-platform-mobile` for KMM projects — KMM is out of scope for this framework.

---

## Execution Rules

1. **Always read the full `SKILL.md` file** for the active agent before starting work.
2. **Never skip or reorder steps** — the skill files are authoritative.
3. **Validate DoD checklists** at the end of each agent's work before proceeding.
4. **Phases 1–3 are always required** — never jump straight to development.
5. **Auto-detect scope from Phase 1** — after `legacy-analysis` completes, read **Section 10 — Technology Profile** in `legacy_analysis.md` to pre-fill the scope (Backend / Web Frontend / iOS / Android). Present the detected scope to the user for confirmation before Phase 4. Do NOT ask all 4 questions blindly if the profile is already known.
6. **Phase 2.5 (Tech Stack Selection Gate) is mandatory** — collect ALL flexible technology choices from the user after Phase 2 and save them to `ai-driven-development/docs/tech_stack_selections.md`. All downstream agents read from this file. Do NOT ask for tech choices again in Phases 3–4.
7. **Only execute phases relevant to the confirmed scope** — skip and mark N/A any Phase 4 sub-phase whose tier is not present in the repository. Do not design, diagram, or generate code for layers that don't exist.
8. **Phases 4a–4e and 4i can run in parallel** once scope is confirmed and UI/UX contracts are available (4a required before 4c/4d/4e/4i; 4a skipped if backend-only). Phases 4f/4g/4h can run in parallel with each other and with 4b–4e/4i once Phase 3 is complete. **4i is mutually exclusive with 4d/4e for the same mobile target** — do not run both native and cross-platform for the same platform.
9. All outputs go into `ai-driven-development/` subdirectories as specified by each skill.
