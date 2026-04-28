---
name: tech-stack-selection
description: 'Phase 2.5 Tech Stack Selection Gate. Use when: collecting all flexible technology choices (backend language, frontend framework, database, mobile targets, cloud provider, secret management, deployment platform, observability) after Phase 2 and writing them to tech_stack_selections.md. All downstream agents (Phases 3–6) read from this file exclusively — do not ask for tech choices again after this gate.'
argument-hint: 'Project name (legacy architecture artifacts are read automatically from ai-driven-development/docs/)'
version: 1.0.0
last_reviewed: 2026-04-27
status: Active
---

# Tech Stack Selection Gate

## Role
**Orchestrator** — Gather every flexible technology decision from the user before any design or implementation work begins. Persist all choices in a single file that every downstream agent reads instead of asking again.

## When to Use
- After Phase 2 (`legacy-architecture`) completes and before Phase 3 (`target-architecture`) begins — this gate is **always required**
- Any time a standalone tech stack review is needed mid-project (re-run when choices change materially)

## Prerequisites (Preflight)

| Artifact | Expected Path | Required? |
|---|---|---|
| Legacy analysis report | `ai-driven-development/docs/legacy_analysis/legacy_analysis.md` | Always |
| Legacy architecture | `ai-driven-development/docs/legacy_architecture/legacy_architecture.md` | Always |

**Output:** `ai-driven-development/docs/tech_stack_selections.md`  
**Template / output schema:** `.github/skills/tech-stack-selection/tech_stack_selections.template.md`

---

## Procedure

Present the following questionnaire to the user. Show **only the sections relevant to the confirmed scope** (Backend / Web Frontend / Mobile / iOS / Android — read from Section 10 of `legacy_analysis.md`). If any mobile client is in scope, ask **§ Mobile first** to confirm whether the delivery model is native per platform or cross-platform (Flutter / React Native). Record all answers and save to `ai-driven-development/docs/tech_stack_selections.md` using the template as the output schema.

### Opening Prompt

> "Before I begin designing the target architecture, I need to confirm your technology preferences.
>
> **Option A — Skip selection (use defaults)**: Type `skip` or `default` and I will apply the full default stack immediately:
> - Common: Docker Compose, GitHub Actions, AWS, AWS Secrets Manager, Prometheus + Grafana
> - Backend: Java 21 + Spring Boot 3.5, PostgreSQL, Keycloak, no broker, Redis, framework default scheduler
> - Frontend: React 18 + TypeScript, MUI v5, Zustand, no charts/table/RTE/i18n, CSS transitions
> - Mobile: Native (separate iOS + Android) by default; choose Flutter or React Native only when you explicitly want a shared cross-platform codebase
> - iOS: iOS 16 minimum, CoreData, AsyncImage, APNs only, no crash/analytics, SPM
> - Android: API 26 minimum, Moshi, FCM, no crash/analytics, manual pagination, no WorkManager
>
> **Option B — Answer each question**: Pick from the listed options **or type any custom value** — you are not limited to the suggestions shown. For each question you can also type `default` to accept the recommended option for that item.
>
> Which would you prefer?"

### Skip / Default Behaviour
If the user types `skip`, `default`, or `use defaults`:
- Populate `tech_stack_selections.md` with the full default stack listed in Option A above.
- Skip all remaining questions.
- Proceed directly to the Definition of Done gate.

If the user chooses to answer individually, for **any question** where the user types `default`, apply the *(default)* or *(recommended)* option shown for that question.

### Custom Value Handling

Users are never limited to the listed options. When a user enters a technology not in the suggestion list, apply the following decision tree **before recording the choice and moving to the next question**:

#### Step 1 — Assess familiarity
Evaluate whether you have sufficient knowledge of the entered technology to:
- Design integration points in the target architecture (Phase 3)
- Generate implementation patterns, configuration, and code (Phase 4)
- Produce accurate DevOps manifests or pipeline config (Phase 4h)

**Familiar** means: the technology is publicly documented, widely adopted, and you can implement it without additional context (e.g. "Oracle DB", "Bun", "SolidJS", "Drizzle ORM").

**Unfamiliar** means any of the following:
- The technology name is not in your training knowledge
- It appears to be an internal/enterprise-specific tool, proprietary framework, or private library
- You cannot confidently describe its integration pattern with the rest of the stack
- The name could refer to multiple things (ambiguous)

#### Step 2 — If familiar: accept and continue
Record the value exactly as entered and proceed to the next question.

#### Step 3 — If unfamiliar: request supporting documentation

Respond with:

> "I'm not familiar enough with **[technology name]** to implement it reliably in later phases. To proceed with this choice, please provide one or more of the following:
>
> - **Official documentation URL** (public docs, GitHub repo, or internal wiki link)
> - **Architecture overview** (how it fits into your system — a paragraph is enough)
> - **Configuration or setup examples** (sample config file, Docker image name, API surface)
> - **Internal docs or runbook** (paste content directly, or attach the file)
>
> You can also:
> - Type `skip this` to leave this choice blank for now and revisit before Phase 3
> - Type `default` to use the recommended option instead
>
> What can you share?"

#### Step 4 — Process provided documentation
Once the user provides documentation or links:
- Read all provided content in full before proceeding
- Extract: purpose, integration model, configuration surface, runtime requirements
- Confirm your understanding with a one-line summary:
  > "Got it — **[technology name]** is [one-line description]. I'll use this as the implementation reference for Phase [3/4/4h]. Recording your choice."
- Record the value in `tech_stack_selections.md` along with a `Notes` entry: `"Custom — see: [source]"`

#### Step 5 — If documentation is insufficient
If the provided documentation is too sparse to implement reliably:

> "The documentation provided doesn't give me enough detail to implement **[technology name]** correctly in Phase [X]. I can:
> 1. Record it as a **placeholder** — you provide more detail before Phase [X] begins
> 2. Fall back to the **default** option for this decision
>
> Which do you prefer?"

Record the outcome (placeholder or default) and continue.

---

### Questions — Common *(always ask)*

| # | Decision | Options *(custom values accepted)* |
|---|---|---|
| C1 | **Container / Deployment Strategy** | **Docker Compose** *(default)* / Docker + Kubernetes / Amazon ECS / Azure App Service / Fly.io / bare-metal VM / *custom* |
| C2 | **CI/CD Platform** | **GitHub Actions** *(default)* / GitLab CI / Jenkins / Azure DevOps / *custom* |
| C3 | **Cloud Provider** | **AWS** *(default)* / Azure / GCP / On-premise / None / *custom* |
| C4 | **Secret Management** | **AWS Secrets Manager** *(default if AWS)* / HashiCorp Vault / Azure Key Vault / GCP Secret Manager / env files *(dev only)* / *custom* |
| C5 | **Observability Stack** | **Prometheus + Grafana** *(default)* / Datadog / ELK Stack / New Relic / CloudWatch / *custom* |

---

### Questions — Backend *(ask only if Backend is in scope)*

| # | Decision | Options *(custom values accepted)* |
|---|---|---|
| B0 | **Backend Language & Framework** | **Java 21 + Spring Boot 3.5** *(default)* / .NET 9 + ASP.NET Core / Python 3.12 + FastAPI / Go 1.23 + Gin or Fiber / *custom* |
| B1 | **Architecture Style** | **Modular Monolith** *(default)* / Microservices / Hybrid / *custom* |
| B2 | **Database** | **PostgreSQL** *(default)* / Oracle / MySQL / MSSQL / MongoDB / *custom* |
| B3 | **Auth Provider** | **Keycloak (OAuth2/OIDC)** *(default)* / Spring Security + LDAP *(Java only)* / ASP.NET Identity *(.NET only)* / Auth0 / Okta / AWS Cognito / *custom* |
| B4 | **Message Broker** | **None** *(default)* / Kafka / RabbitMQ / AWS SQS / Azure Service Bus / *custom* |
| B5 | **Caching** | **Redis** *(default)* / Memcached / In-process (Caffeine) / None / *custom* |
| B6 | **Job Scheduling** | **Framework default scheduler** *(default)* / Quartz / Hangfire *(.NET)* / APScheduler *(Python)* / *custom* |

---

### Questions — Web Frontend *(ask only if Web Frontend is in scope)*

| # | Decision | Options *(custom values accepted)* |
|---|---|---|
| F0 | **Frontend Framework** | **React 18 + TypeScript** *(default)* / Vue 3 + TypeScript / Angular 18 / Svelte 5 + TypeScript / *custom* |
| F1 | **UI Component Library** | **MUI v5** *(default)* / shadcn/ui + Tailwind CSS / Chakra UI v3 *(React)* · PrimeVue / Vuetify / Quasar *(Vue)* · Angular Material / PrimeNG *(Angular)* · shadcn-svelte + Tailwind *(Svelte)* / *custom* |
| F2 | **Global State Management** | **Zustand** *(default, React)* / Redux Toolkit / Jotai / Context API only *(React)* · **Pinia** *(default, Vue)* · **NgRx** *(default, Angular)* / Signals · **Svelte stores** *(default, Svelte)* / *custom* |
| F3 | **Charts / Data Visualization** | **None** *(default)* / Recharts / Chart.js / Nivo / *custom* |
| F4 | **Data Table** | **None** *(default)* / TanStack Table v8 / AG Grid Community / *custom* |
| F5 | **Rich Text Editor** | **None** *(default)* / TipTap / Quill / *custom* |
| F6 | **Internationalization (i18n)** | **None** *(default)* / react-i18next *(React)* · vue-i18n *(Vue)* · Angular i18n built-in *(Angular)* · svelte-i18n *(Svelte)* / *custom* |
| F7 | **Animation** | **CSS transitions only** *(default)* / Framer Motion *(React/Svelte)* / GSAP / *custom* |

---

### Questions — Mobile *(ask only if any mobile target is in scope)*

> Ask this section **before** `§ iOS` / `§ Android`.
>
> If `Framework = Native (separate iOS + Android)`, set the remaining `§ Mobile` fields to `N/A` and continue with the native `§ iOS` / `§ Android` sections as applicable.
>
> If `Framework = Flutter` or `React Native`, complete the full `§ Mobile` section and mark `§ iOS` / `§ Android` as `N/A` unless separate native apps are also required in addition to the shared mobile client.

| # | Decision | Options *(custom values accepted)* |
|---|---|---|
| M0 | **Framework** | **Native (separate iOS + Android)** *(default)* / Flutter / React Native / *custom* |
| M1 | **Minimum iOS Target** | **iOS 16** *(default for Flutter/RN)* / iOS 17 / iOS 15 / *custom* / N/A if Android-only |
| M2 | **Minimum SDK** | **API 26 (Android 8.0)** *(default for Flutter/RN)* / API 28 / API 24 / *custom* / N/A if iOS-only |
| M3 | **State Management** | **Riverpod** *(default for Flutter)* / BLoC / **Zustand** *(default for React Native)* / Redux Toolkit / *custom* |
| M4 | **Secure Storage** | **flutter_secure_storage** *(default for Flutter)* / **react-native-keychain** *(default for React Native)* / *custom* |
| M5 | **Local Persistence** | **sqflite or Isar** *(default for Flutter)* / **WatermelonDB or MMKV** *(default for React Native)* / SQLite / None / *custom* |
| M6 | **Push Notifications** | **Firebase Cloud Messaging (FCM)** *(default)* / None / *custom* |
| M7 | **Crash Reporting** | **None** *(default)* / Firebase Crashlytics / Sentry / *custom* |
| M8 | **Analytics** | **None** *(default)* / Firebase Analytics / Amplitude / *custom* |

---

### Questions — iOS App *(ask only if native iOS is in scope)*

| # | Decision | Options *(custom values accepted)* |
|---|---|---|
| I0 | **Minimum iOS Target** | **iOS 16** *(default)* / iOS 17 / iOS 15 / *custom* |
| I1 | **Local Persistence** | **CoreData** *(default)* / SwiftData *(iOS 17+)* / SQLite (GRDB) / None / *custom* |
| I2 | **Image Loading** | **Native AsyncImage** *(default)* / Kingfisher / SDWebImageSwiftUI / *custom* |
| I3 | **Push Notifications** | **APNs only** *(default)* / APNs + Firebase Cloud Messaging (FCM) / None / *custom* |
| I4 | **Crash Reporting** | **None** *(default)* / Firebase Crashlytics / Sentry / *custom* |
| I5 | **Analytics** | **None** *(default)* / Firebase Analytics / Amplitude / *custom* |
| I6 | **Package Manager** | **Swift Package Manager (SPM)** *(default)* / CocoaPods / *custom* |

---

### Questions — Android App *(ask only if native Android is in scope)*

| # | Decision | Options *(custom values accepted)* |
|---|---|---|
| A0 | **Minimum SDK** | **API 26 (Android 8.0)** *(default)* / API 28 / API 24 / *custom* |
| A1 | **JSON Serialization** | **Moshi** *(default)* / Gson / kotlinx.serialization / *custom* |
| A2 | **Push Notifications** | **Firebase Cloud Messaging (FCM)** *(default)* / None / *custom* |
| A3 | **Crash Reporting** | **None** *(default)* / Firebase Crashlytics / Sentry / *custom* |
| A4 | **Analytics** | **None** *(default)* / Firebase Analytics / Amplitude / *custom* |
| A5 | **Paging Strategy** | **Manual pagination** *(default)* / Paging 3 (Jetpack) / None / *custom* |
| A6 | **Background Sync (WorkManager)** | **No** *(default)* / Yes / *custom* |

---

## Output

Save all confirmed choices to `ai-driven-development/docs/tech_stack_selections.md` using `.github/skills/tech-stack-selection/tech_stack_selections.template.md` as the schema. Every mandatory field for in-scope tiers must be filled — no placeholder values remain.

---

## Definition of Done

> 📋 **Quality review**: Before confirming choices, consult [quality-playbook/SKILL.md](../quality-playbook/SKILL.md) §1 — Architecture Decision Trees (monolith vs microservices, DB strategy, REST vs GraphQL vs gRPC).

- [ ] User answered all questions for all in-scope tiers (or selected the default stack)
- [ ] `ai-driven-development/docs/tech_stack_selections.md` created with all confirmed choices
- [ ] No placeholder values remaining for any in-scope tier (all placeholders either resolved or explicitly deferred with an owner + phase deadline)
- [ ] § Common complete: Container/Deployment, CI/CD, Cloud Provider, Secret Management, Observability all populated
- [ ] § Backend complete (if in scope): Language/Framework, Database, Auth Provider all populated
- [ ] § Web Frontend complete (if in scope): Framework populated
- [ ] § Mobile complete (if any mobile target is in scope): Framework populated
- [ ] § Mobile complete (if Framework = Flutter or React Native): Minimum iOS Target and Minimum SDK populated
- [ ] § iOS complete (if native iOS is in scope): Minimum iOS Target populated
- [ ] § Android complete (if native Android is in scope): Minimum SDK populated
- [ ] Every custom/unfamiliar technology either has supporting documentation recorded in the `Notes` column **or** is marked as a placeholder with a phase-deadline note
- [ ] All downstream agents confirmed: they will read `tech_stack_selections.md` and not ask for tech choices again
