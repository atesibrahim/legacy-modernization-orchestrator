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
**Skill:** `.github/agents/legacy-modernization-orchestrator.agent.md`

**Phase Order:**
```
Phase 1 → Phase 2 → Phase 2.5 (Tech Stack Selection Gate) → Phase 3 → [Scope Selection] → Phase 4 (optional parallel) → Phase 5 → Phase 6
```

| Phase | Agent | Required? |
|-------|-------|----------|
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
| 5 | `compare-legacy-to-new` | After any dev phase |
| 6 | Final Validation | After Phase 5 |

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

### `target-architecture`
**Use when:** Designing new modern system architecture, creating target state architecture, applying clean architecture hexagonal DDD microservices patterns, defining service boundaries bounded contexts API-first design, producing mermaid architecture diagrams in HTML, tech stack user-selected: Java/.NET/Python/Go backend, React/Vue/Angular/Svelte frontend, Kotlin mobile.  
**Argument hint:** Project name or path to legacy analysis and legacy design artifacts  
**Skill file:** `.github/skills/target-architecture/SKILL.md`

---

### `ui-ux-design`
**Use when:** Designing user interfaces for modernized application, creating wireframes mockups design systems, defining user journeys for web React and mobile iOS Android, applying WCAG accessibility standards, building responsive mobile-first design, producing HTML design previews, creating component design system tokens typography colors.  
**Argument hint:** Application name and list of primary user roles or workflows to design for  
**Skill file:** `.github/skills/ui-ux-design/SKILL.md`

---

### `backend-development`
**Use when:** Building Java Spring Boot / .NET ASP.NET Core / Python FastAPI / Go Gin-Fiber backend, implementing clean architecture hexagonal architecture, setting up domain-driven design modules, implementing REST APIs OpenAPI security JWT OAuth2, database ORM repositories, testing unit integration Testcontainers, observability metrics tracing logging, phased development plan backend implementation.  
**Argument hint:** Project name or path to system design artifacts to base backend implementation on  
**Skill file:** `.github/skills/backend-development/SKILL.md`

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

### `devops-infra`
**Use when:** Producing Kubernetes manifests, Helm charts, Terraform/Pulumi cloud infrastructure modules, GitHub Actions / GitLab CI pipelines, Prometheus alerting rules, Grafana dashboards, secret management with HashiCorp Vault or External Secrets Operator, Docker image security.  
**Argument hint:** Project name or path to target architecture and backend development artifacts  
**Skill file:** `.github/skills/devops-infra/SKILL.md`

---

### Cross-Platform Mobile — Not Supported

> **Flutter, React Native, and KMM (Kotlin Multiplatform Mobile) are not supported by this framework.**
>
> When a project requires cross-platform mobile, you have two options:
> 1. **Choose one native target** — use `ios-development` (Swift/SwiftUI) and/or `android-development` (Kotlin/Jetpack Compose). This is the recommended path for new projects where code quality and platform-native behaviour matter.
> 2. **Document the limitation** — note in the target architecture and tech_stack_selections.md that cross-platform is out of scope for this framework. A future `cross-platform-mobile` skill may be added to support Flutter or React Native.
>
> Do NOT attempt to use `ios-development` or `android-development` agents to generate Flutter/React Native/KMM code — the output will be incorrect.

---

### `compare-legacy-to-new`
**Use when:** Comparing legacy system with redesigned system, gap analysis between legacy and new, mapping legacy components to new equivalents, creating migration strategy, producing before-after diagrams in HTML mermaid, validating that all legacy functionality is covered in new design, identifying improvements and regressions.  
**Argument hint:** Path to legacy analysis and new system design artifacts to compare  
**Skill file:** `.github/skills/compare-legacy-to-new/SKILL.md`

---

## Execution Rules

1. **Always read the full `SKILL.md` file** for the active agent before starting work.
2. **Never skip or reorder steps** — the skill files are authoritative.
3. **Validate DoD checklists** at the end of each agent's work before proceeding.
4. **Phases 1–3 are always required** — never jump straight to development.
5. **Auto-detect scope from Phase 1** — after `legacy-analysis` completes, read **Section 10 — Technology Profile** in `legacy_analysis.md` to pre-fill the scope (Backend / Web Frontend / iOS / Android). Present the detected scope to the user for confirmation before Phase 4. Do NOT ask all 4 questions blindly if the profile is already known.
6. **Phase 2.5 (Tech Stack Selection Gate) is mandatory** — collect ALL flexible technology choices from the user after Phase 2 and save them to `ai-driven-development/docs/tech_stack_selections.md`. All downstream agents read from this file. Do NOT ask for tech choices again in Phases 3–4.
7. **Only execute phases relevant to the confirmed scope** — skip and mark N/A any Phase 4 sub-phase whose tier is not present in the repository. Do not design, diagram, or generate code for layers that don't exist.
8. **Phases 4a–4e can run in parallel** once scope is confirmed and UI/UX contracts are available (4a required before 4c/4d/4e; 4a skipped if backend-only).
9. All outputs go into `ai-driven-development/` subdirectories as specified by each skill.
