---
name: target-architecture
description: 'Target system architecture design skill for legacy modernization. Act as a senior master architect. Use when: designing new modern system architecture, creating target state architecture, applying clean architecture hexagonal DDD microservices patterns, defining service boundaries bounded contexts API-first design, producing mermaid architecture diagrams in HTML, tech stack user-selected: Java/.NET/Python/Go backend, React/Vue/Angular/Svelte frontend, Kotlin mobile.'
argument-hint: 'Project name or path to legacy analysis and legacy design artifacts'
---

# Target System Design

## Role
**Senior Master Architect** — Design a modern, scalable, maintainable target system grounded in industry standards and justified by analysis of the legacy system.

## When to Use
- After completing `analysing-legacy` and `legacy-architecture` skills
- Need to define the target architecture before development begins
- Require formal architecture decision records (ADR), service boundaries, and API contracts

## Prerequisites
- `ai-driven-development/docs/analysing/legacy_analyse.md`
- `ai-driven-development/docs/legacy_architecture/legacy_architecture.md`
- `ai-driven-development/docs/tech_stack_selections.md` ← **all flexible tech choices confirmed by user in Phase 2.5**

> **Before starting any design work**, read both `legacy_analyse.md` **Section 10 — Technology Profile** (to confirm scope) and `tech_stack_selections.md` (to load all confirmed technology choices). Apply every confirmed choice directly — do NOT ask the user again. Skip all design steps, tech choices, diagrams, and ADRs that are not applicable to the confirmed scope. Do NOT design layers that do not exist in the target system.

## Output Location
Create in folder `ai-driven-development/docs/target_architecture/` and produce:
- `target_architecture.md` — Target architecture documentation
- `target_architecture.html` — Interactive visual diagrams (Mermaid.js)

> ⚠️ **Always overwrite these files completely** — never append. Use `create_file` or write the full content from scratch. Appending produces two HTML documents in one file, which breaks rendering.

---

## Tech Stack (apply only layers in scope — language/framework from `tech_stack_selections.md`)

> The backend language/framework and frontend framework are **user-selected** in Phase 2.5. Read `tech_stack_selections.md` to determine the active choices. iOS/Android stacks are fixed.

| Layer | User-Selected Options | Required When |
|---|---|---|
| Backend Language | Java 21 / .NET 9 / Python 3.12 / Go 1.23 | Backend in scope |
| Backend Framework | Spring Boot 3.5+ / ASP.NET Core / FastAPI / Gin or Fiber | Backend in scope |
| Frontend Framework | React 18+ / Vue 3 / Angular 18 / Svelte 5 | Web Frontend in scope |
| Frontend Language | TypeScript (strict — all frameworks) | Web Frontend in scope |
| Mobile iOS | Swift / SwiftUI | iOS in scope |
| Mobile Android | Kotlin / Jetpack Compose | Android in scope |
| API Style | REST + OpenAPI 3.1 | Backend in scope |

> Do NOT include rows or sections for tiers that are out of scope.

### Confirmed Tech Choices (read from `tech_stack_selections.md`)

> **Do NOT ask the user for technology preferences** — all flexible choices were collected in Phase 2.5 and saved to `ai-driven-development/docs/tech_stack_selections.md`. Read that file and apply the confirmed selections directly.

| Concern | Confirmed In | Applicable When |
|---|---|---|
| **Backend Language / Framework** | `tech_stack_selections.md` § Backend → Language / Framework | Backend in scope |
| Architecture Style | `tech_stack_selections.md` § Backend → Architecture Style | Backend in scope |
| **Frontend Framework** | `tech_stack_selections.md` § Web Frontend → Framework | Web Frontend in scope |
| State Management (Frontend) | `tech_stack_selections.md` § Web Frontend → Global State Management | Web Frontend in scope |
| UI Component Library | `tech_stack_selections.md` § Web Frontend → UI Component Library | Web Frontend in scope |
| Message Broker | `tech_stack_selections.md` § Backend → Message Broker | Backend in scope |
| Caching | `tech_stack_selections.md` § Backend → Caching | Backend in scope |
| Auth Provider | `tech_stack_selections.md` § Backend → Auth Provider | Backend in scope |
| Database | `tech_stack_selections.md` § Backend → Database | Backend in scope |
| Container Orchestration | `tech_stack_selections.md` § Common → Container/Deployment | Any backend/full-stack |
| CI/CD | `tech_stack_selections.md` § Common → CI/CD | Always |
| Observability | `tech_stack_selections.md` § Common → Observability | Always |

---

## Procedure

### Step 0.5 — Scope & Complexity Check

> **Run before Steps 1–9.** The number of bounded contexts and in-scope tiers determines whether to proceed linearly or decompose design into parallel sub-tasks.

**Review from prerequisites:**
- Count bounded contexts hinted at in `legacy_analyse.md` (module count, God-tables, integration clusters)
- Count in-scope tiers from `tech_stack_selections.md` (Backend / Frontend / iOS / Android)

**Choose a strategy:**

| Scale | Signal | Strategy |
|---|---|---|
| **Simple** | 1–3 bounded contexts, 1 tier | Proceed through Steps 1–9 sequentially |
| **Moderate** | 4–6 bounded contexts OR 2 tiers | Design contexts one at a time; backend and frontend architecture as separate sub-tasks |
| **Complex** | 7+ bounded contexts OR 3+ tiers | One sub-task per bounded context group for Steps 2+3; one sub-task per tier for diagrams |

**Per-context sub-task breakdown (moderate/complex):**

For each bounded context (or group of 2–3 small related ones), create a sub-task that covers:
- Step 2: domain model, ubiquitous language, context relationships
- Step 3: module responsibilities, API surface, owned data, events

Each sub-task writes findings to: `ai-driven-development/docs/target_architecture/_partial_bc_{name}.md`

This agent then:
1. Synthesizes all partial BC files into `target_architecture.md`
2. Runs Steps 4–9 (API design, data architecture, security, diagrams, NFR, ADRs) using all partial inputs

**Multi-tier decomposition:**
- Sub-task A: Backend architecture (Steps 2, 3, 4, 5, 6, ADRs 001–004 + 006)
- Sub-task B: Frontend/Mobile architecture (Step 2 frontend-specific, ADR-005 if mobile in scope)
- This agent: Diagrams (Step 7) and NFR (Step 8) — synthesized after A and B complete

> Record the decomposition plan (bounded context list + assigned sub-tasks) in `target_architecture.md` before starting any sub-task.

---

### Step 1 — Architecture Style Decision
Justify the choice between:

- **Modular Monolith** (recommended default): Single deployable, domain modules with hard boundaries, easier ops, easier migration from legacy monolith
- **Microservices**: Only if: independent scaling requirements > 3 services, dedicated teams per service, or proven domain boundaries from DDD analysis
- **Hybrid**: Start modular monolith, extract services incrementally

Document the decision as an **Architecture Decision Record (ADR)** using the template from [STANDARDS.md](./STANDARDS.md).

### Step 2 — Domain Modeling (DDD)
Apply Domain-Driven Design:

- **Identify Bounded Contexts**: Each context is a potential module/service boundary
- **Define Ubiquitous Language**: Core terms per domain context
- **Map Context Relationships**: Partnership, Shared Kernel, Customer-Supplier, Anticorruption Layer
- **Identify Aggregates**: Root entities with invariants

### Step 3 — Service / Module Design
For each module/service:

| Module | Responsibility | Owns Data? | Exposes API? | Consumes Events? | Publishes Events? |
|---|---|---|---|---|---|
| Auth | User identity, tokens | Yes (users, roles) | Yes | No | user.logged-in |
| [Domain A] | [Responsibility] | Yes/No | Yes/No | [events] | [events] |

### Step 4 — API Design (API-First)
Before any code:
- Define OpenAPI 3.1 spec for all public APIs
- Standardize error model: `{ code, message, details[], traceId }`
- Define versioning strategy: URL path `/v1/` (recommended)
- Define pagination: offset or cursor-based
- Define authentication: Bearer JWT in Authorization header

### Step 5 — Data Architecture
Ground every decision in the DB analysis findings from `legacy_analyse.md` (Section 3):

- **Legacy DB Findings Input**: Review the Table Ownership Matrix, DB anti-patterns, query hotspots, and data quality issues before designing the target data model — these directly inform bounded context boundaries and migration risk
- **Data Ownership**: Each bounded context owns its data (no cross-context DB joins); use the legacy Table Ownership Matrix to propose initial ownership assignments
- **Database per Service/Module**: Separate schemas or databases; resolve legacy God-table coupling by splitting or replicating data with clear ownership
- **Target Data Model**: For each bounded context produce an entity relationship overview (key entities, relationships, constraints); address legacy anti-patterns (overloaded columns → proper typed fields, EAV → structured schema, BLOB serialization → proper columns/JSON)
- **Data Migration Strategy**: Choose per migration scenario — Strangler Fig pattern, DB-level migration scripts (Flyway/Liquibase), dual-write with reconciliation, or big-bang cut-over; document rationale
- **Stored Procedure / Trigger Migration**: For each legacy stored procedure/trigger decide: migrate to application service layer, rewrite as DB function, or deprecate — document decision per item
- **Data Quality Remediation**: Define how legacy data quality issues (nulls, orphaned rows, duplicates) will be cleansed before or during migration — specify scripts, validation gates, and rollback strategy
- **Read Models (CQRS)**: Define where read-optimized projections are needed, especially to replace legacy God-table queries
- **Event Sourcing**: Evaluate if audit trail requirements (previously handled by triggers) justify it

### Step 6 — Security Architecture
- **Authentication**: OAuth2 / OpenID Connect (Keycloak preferred) or Spring Security + LDAP
- **Authorization**: RBAC with `@PreAuthorize` annotations, externalized permission model
- **Token Strategy**: JWT (short-lived access token, refresh token rotation)
- **API Gateway**: Single entry point, rate limiting, auth validation, request routing
- **Secret Management**: HashiCorp Vault / AWS Secrets Manager / Kubernetes Secrets
- **TLS**: HTTPS everywhere, mTLS for service-to-service (if microservices)

### Step 7 — Generate Visual Diagrams (HTML + Mermaid.js)

Use the **HTML + Mermaid.js Page Template** from [STANDARDS.md](./STANDARDS.md) as the starting document for `target_architecture.html`.

Required diagram sections — **only include diagrams applicable to the confirmed scope**:

| Diagram | Content | Required When |
|---|---|---|
| **Diagram 1** | High-Level Target Architecture (all clients, gateway, services, DBs, observability) | Always — omit tiers not in scope |
| **Diagram 2** | Bounded Context Map (context relationships per DDD analysis) | Backend in scope |
| **Diagram 3** | Authentication Flow (OAuth2/JWT sequence, full participant chain) | Backend in scope |
| **Diagram 4** | Deployment Architecture (CI/CD pipeline → runtime pods → managed services) | Always |
| **Diagram 5** | Data Architecture / Schema Boundary Map (bounded contexts → owned DB schemas/tables) | Backend in scope |

> **Examples:**
> - `backend-only` repo: include all 5 diagrams; omit any React/mobile client nodes from Diagram 1.
> - `frontend-only` repo: include Diagram 1 (frontend + API boundary), Diagram 4 (deployment); skip Diagrams 2, 3, 5.
> - `mobile-only` repo: include Diagram 1 (mobile clients + API boundary), Diagram 4; skip Diagrams 2, 3, 5.

> **Important**: Replace ALL placeholder service and node labels with actual domain service names from the system design. Remove diagram sections not applicable to the project scope.

### Step 7.1 — Validate the Generated HTML File

After writing `target_architecture.html`, run through the **File Creation Validation Checklist** from [STANDARDS.md](./STANDARDS.md) before proceeding.

Key checks for this skill's output:
- `<!DOCTYPE html>` appears exactly **once** (no accidental file append)
- All 4 required diagrams are present as `<pre class="mermaid">` blocks (not `<div>`) — 5 if a Data Architecture diagram is applicable
- Multi-line node labels use `<br/>` not `\n` (e.g., bounded context labels)
- Participant display names containing `()`, `/`, or commas are double-quoted
- Every `subgraph` block is closed with `end`
- Node IDs contain no spaces or reserved keywords

If the file is missing or any check fails, **regenerate the entire file** from scratch using `create_file`. Do not attempt to patch individual lines.

### Step 8 — Non-Functional Requirements (NFR)
Define measurable targets using the **NFR Table Template** from [STANDARDS.md](./STANDARDS.md). Populate actual values agreed with stakeholders.

### Step 9 — Architecture Decision Records (ADR)
Produce an ADR for each major decision **applicable to the confirmed scope**:

| ADR | Decision | Required When |
|---|---|---|
| ADR-001 | Architecture Style selection | Backend in scope |
| ADR-002 | Authentication approach | Backend in scope |
| ADR-003 | Database per service vs shared | Backend in scope |
| ADR-004 | Message broker selection (or none) | Backend in scope |
| ADR-005 | Mobile strategy (native vs cross-platform) | iOS or Android in scope |
| ADR-006 | Legacy DB migration strategy (strangler fig / dual-write / big-bang) and stored procedure disposition | Backend in scope |

> Skip ADRs for components outside the confirmed scope. If the scope is `frontend-only`, produce only an ADR covering the state management and rendering strategy decisions.

---

## Definition of Done (DoD)

> ✅ = required for all scopes · *(backend)* = required only if backend is in scope · *(frontend)* = web frontend only · *(mobile)* = iOS or Android only

### Architecture
- [ ] Technology Profile read from `legacy_analyse.md` and confirmed scope recorded ✅
- [ ] Target architecture diagram created — only layers in scope ✅
- [ ] Each service/module has clear, non-overlapping responsibility ✅
- [ ] Bounded contexts defined and context map produced *(backend)*
- [ ] User-selectable tech components confirmed and documented ✅

### APIs
- [ ] OpenAPI 3.1 spec structure defined for all services *(backend)*
- [ ] Error model standardized across all APIs *(backend)*
- [ ] API versioning strategy documented *(backend)*

### Security
- [ ] Auth flow fully defined (OAuth2/LDAP/Keycloak) *(backend)*
- [ ] Role/permission model documented *(backend)*
- [ ] Secret management approach defined *(backend)*

### Scalability & Resilience
- [ ] Horizontal scaling strategy defined per service *(backend)*
- [ ] Failure scenarios documented (circuit breakers, fallbacks) *(backend)*
- [ ] NFR targets documented and agreed ✅

### Data
- [ ] Data ownership defined per bounded context *(backend)*
- [ ] Target data model (key entities and relationships) produced per bounded context *(backend)*
- [ ] Legacy God-table splits and ownership reassignments documented *(backend)*
- [ ] DB migration strategy from legacy documented *(backend)*
- [ ] Stored procedure and trigger disposition documented *(backend)*
- [ ] Data quality remediation plan defined *(backend)*
- [ ] No cross-context database sharing *(backend)*

### Diagrams
- [ ] High-level architecture diagram in HTML — only in-scope tiers shown ✅
- [ ] Bounded context map in HTML *(backend)*
- [ ] Auth flow sequence diagram in HTML *(backend)*
- [ ] Deployment architecture in HTML ✅
- [ ] Data Architecture / Schema Boundary Map in HTML *(backend)*
- [ ] All produced diagrams verified in browser ✅

### Documentation
- [ ] At least 1 ADR produced for major decisions (minimum 3 if backend in scope) ✅
- [ ] Out-of-scope ADRs explicitly skipped with reason noted ✅
- [ ] Design reviewed by at least 2 senior engineers ✅

### Validation
- [ ] Diagram walkthrough completed with system design team ✅
- [ ] Diagrams reviewed for accuracy against design decisions ✅
- [ ] Mermaid syntax validated and diagrams render without errors in browser ✅

---

## Next Skill
When target architecture is finalized, proceed based on confirmed scope:

- **If any UI is in scope** (web, iOS, or Android): proceed to [`ui-ux-design`](../ui-ux-design/SKILL.md) for UX design.
- **If backend only**: proceed directly to [`backend-development`](../backend-development/SKILL.md). Skip ui-ux-design.
- **Parallel tracks**: once scope is confirmed, [`backend-development`](../backend-development/SKILL.md) and [`frontend-development`](../frontend-development/SKILL.md) / [`ios-development`](../ios-development/SKILL.md) / [`android-development`](../android-development/SKILL.md) can run in parallel (frontend/mobile require ui-ux-design to complete first).
