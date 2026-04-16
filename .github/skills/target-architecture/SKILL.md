---
name: target-architecture
description: 'Target system architecture design skill for legacy modernization. Act as a senior master architect. Use when: designing new modern system architecture, creating target state architecture, applying clean architecture hexagonal DDD microservices patterns, defining service boundaries bounded contexts API-first design, producing mermaid architecture diagrams in HTML, tech stack Java 21 Spring Boot 3.5 React 18 Kotlin mobile.'
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

> **Before starting any design work**, read `legacy_analyse.md` **Section 10 — Technology Profile** and record the confirmed scope (Backend / Web Frontend / iOS / Android). Skip all design steps, tech choices, diagrams, and ADRs that are not applicable to the confirmed scope. Do NOT design layers that do not exist in the target system.

## Output Location
Create in folder `ai-driven-development/docs/target_architecture/` and produce:
- `target_architecture.md` — Target architecture documentation
- `target_architecture.html` — Interactive visual diagrams (Mermaid.js)

> ⚠️ **Always overwrite these files completely** — never append. Use `create_file` or write the full content from scratch. Appending produces two HTML documents in one file, which breaks rendering.

---

## Tech Stack (Fixed — apply only layers in scope)

| Layer | Technology | Required When |
|---|---|---|
| Backend Language | Java 21 (LTS) | Backend in scope |
| Backend Framework | Spring Boot 3.5+ | Backend in scope |
| Frontend | React 18+ with TypeScript | Web Frontend in scope |
| Mobile iOS | Swift / SwiftUI | iOS in scope |
| Mobile Android | Kotlin | Android in scope |
| API Style | REST + OpenAPI 3.1 | Backend in scope |

> Do NOT include rows or sections for tiers that are out of scope.

### Flexible / User-Selectable Components
Present options **only for components relevant to the confirmed scope**:

| Concern | Options | Applicable When |
|---|---|---|
| Architecture Style | Modular Monolith / Microservices / Hybrid | Backend in scope |
| State Management (Frontend) | Redux Toolkit / Zustand / Jotai | Web Frontend in scope |
| UI Component Library | MUI / Tailwind CSS + shadcn/ui / Chakra UI | Web Frontend in scope |
| Message Broker | Kafka / RabbitMQ / AWS SQS / None | Backend in scope |
| Caching | Redis / Caffeine / None | Backend in scope |
| Auth Provider | Keycloak (OAuth2/OIDC) / Spring Security + LDAP / Auth0 | Backend in scope |
| Database | PostgreSQL / Oracle / MySQL / MongoDB | Backend in scope |
| Container Orchestration | Kubernetes / Docker Compose / Cloud PaaS | Any backend/full-stack |
| CI/CD | GitHub Actions / GitLab CI / Jenkins | Always |
| Observability | Prometheus + Grafana / Datadog / ELK Stack | Always |

---

## Procedure

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
