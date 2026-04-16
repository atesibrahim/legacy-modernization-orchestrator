---
name: analysing-legacy
description: 'Legacy system analysis skill. Act as a senior expert technical analyst. Use when: analysing legacy codebase, reverse engineering legacy architecture, identifying technical debt, mapping business flows, detecting hidden dependencies, assessing security posture, database schema reverse engineering, stored procedures and triggers inventory, table ownership matrix, data quality assessment, creating legacy architecture reports, risk matrix, data and integration maps before any redesign or migration project.'
argument-hint: 'Path or description of the legacy project to analyze'
---

# Legacy System Analysis

## Role
**Senior Expert Technical Analyst** — Deep-dive into the legacy system before any redesign decision. No assumptions. Evidence-based findings only.

## When to Use
- Starting a legacy modernization or redesign project
- Need to understand a legacy system before making architectural decisions
- Required to produce risk matrix, technical debt report, integration map, or database inventory

## Output Location
Create folder `ai-driven-development/docs/analysing/` in the root and produce:
- `legacy_analyse.md` — Full analysis report

---

## Procedure

### Step 0 — Technology Profile Detection
**Before doing anything else**, classify the repository to determine which phases apply downstream.

Scan the repository root for evidence of each tier:

| Tier | Evidence to Look For |
|---|---|
| **Backend** | `pom.xml`, `build.gradle`, `*.java`, `*.kt` (server), `package.json` with Express/Nest/Fastify, `*.py` with Django/Flask/FastAPI, `*.go`, `*.rs`, `*.rb`, `Gemfile` |
| **Web Frontend** | `package.json` with React/Angular/Vue/Svelte, `*.tsx`, `*.jsx`, `src/` with component files, `index.html` at root with JS framework markers |
| **iOS** | `*.xcodeproj`, `*.xcworkspace`, `*.swift`, `Info.plist`, `Podfile`, `Package.swift` with SwiftUI imports |
| **Android** | `build.gradle` with `com.android.application`, `*.kt` under `app/src/`, `AndroidManifest.xml`, `gradle/wrapper/` |

Classify the repository as one of:

| Profile | Definition |
|---|---|
| `backend-only` | Server-side code only — no client UI at any tier |
| `frontend-only` | Web client code only — no server-side business logic |
| `mobile-ios-only` | iOS app only |
| `mobile-android-only` | Android app only |
| `mobile-only` | iOS and/or Android — no separate backend in this repo |
| `fullstack-web` | Backend + Web Frontend |
| `fullstack-mobile` | Backend + iOS and/or Android |
| `fullstack` | Backend + Web Frontend + Mobile |

Record the profile in `legacy_analyse.md` **Section 10 — Technology Profile** (see Output Format).

> ⚠️ This profile is consumed by the `target-architecture` and `legacy-modernization-orchestrator` agents to skip inapplicable layers. It must be accurate — if ambiguous, list evidence for and against each tier.

---

### Step 1 — System Inventory
Catalog everything that exists:

- **Services & Modules**: List all services, modules, subsystems with their responsibilities
- **APIs**: REST/SOAP/RPC endpoints — list all, annotate with usage frequency if available
- **Database**: High-level list of all data stores (RDBMS, NoSQL, file-based) — detailed analysis in Step 2
- **External Integrations**: LDAP, SSO, payment gateways, messaging systems, 3rd-party APIs
- **Build & Deployment**: CI/CD pipelines, build scripts, deployment tools, environments

### Step 2 — Database Deep Dive
Perform a thorough reverse-engineering of every persistent data store:

- **DB Technology**: Engine name, exact version, EOL status, licensing model (commercial/open-source), cloud/on-prem deployment
- **Schema Inventory**: List all schemas, tables, columns (name, data type, nullable, default value, constraints), indexes (type, columns, uniqueness, covering), sequences, and partitions
- **Stored Procedures & Functions**: Catalog every stored procedure and function — name, purpose, input/output parameters, tables accessed, estimated call frequency
- **Triggers**: List all triggers with owning table, event (INSERT/UPDATE/DELETE), timing (BEFORE/AFTER), and business logic summary
- **Scheduled DB Jobs**: Document all DB-native scheduled jobs (Oracle DBMS_SCHEDULER, SQL Server Agent, pg_cron, etc.) with schedule and purpose
- **Views & Materialized Views**: List all views — owning module, refresh strategy, business purpose, and whether they mask complexity or cross-module data access
- **Referential Integrity**: Map all foreign-key relationships; identify tables that rely on application-level integrity enforcement instead of DB constraints (constraint bypasses)
- **Data Volumes & Growth**: Row counts per table, estimated growth rate, largest tables by disk size; flag tables > 1M rows as migration risk
- **Query Hotspots**: Identify the top 10 slowest or most-frequently-executed queries; capture execution plans, index usage, and full-table-scan occurrences
- **DB Anti-Patterns** — identify and document each instance:
  - Shared/God tables used by multiple unrelated modules
  - Columns overloaded with multiple business meanings (type flags, status codes, multipurpose text fields)
  - Denormalized data kept in sync via triggers or application code
  - Hard-coded IDs or magic numbers embedded in data rows
  - BLOB/CLOB columns storing serialized objects, JSON, or XML
  - EAV (Entity–Attribute–Value) patterns that hinder query performance
  - Missing indexes on high-cardinality foreign keys
- **Cross-Module DB Coupling**: Map which application modules read/write which tables; produce a **Table Ownership Matrix** (table rows × module columns, annotated R/W/RW)
- **Data Quality Issues**: NULLs in logically mandatory columns, orphaned foreign-key values, duplicate records without unique constraints, inconsistent formats (dates, phone numbers, status codes), stale/unreferenced rows
- **Backup & Recovery**: Backup type (full/incremental/logical), frequency, retention period, tested restoration procedure, point-in-time recovery (PITR) capability, RPO/RTO SLAs

### Step 3 — Codebase Analysis
Examine the code quality and structural health:

- **Languages & Framework Versions**: Exact versions, EOL status
- **Anti-Patterns**: God classes, tight coupling, anemic domain model, spaghetti logic
- **Code Quality Metrics**: Cyclomatic complexity, code duplication ratio, lines of code per module
- **Dead Code Detection**: Unused classes, methods, endpoints, DB tables
- **Dependency Graph**: Internal module dependencies, circular dependencies

### Step 4 — Runtime Analysis
Understand behavior under real conditions:

- **Logs Analysis**: Error patterns, warning frequency, recurring failures
- **Performance Metrics**: Avg/P95/P99 latency, throughput per endpoint, DB query times
- **Threading & Blocking**: Synchronous blocking calls, thread pool configurations
- **Memory & CPU**: Leak patterns, GC pressure, high CPU operations

### Step 5 — Data Flow Mapping
Trace data end-to-end:

- **Input → Processing → Output** per feature/module
- **Sync vs Async Flows**: Identify all async patterns (queues, callbacks, events)
- **Batch vs Real-Time Jobs**: Scheduled tasks, cron jobs, batch processors
- **Data Transformations**: Where and how data is transformed between layers

### Step 6 — Dependency Mapping
- **Internal**: Module dependency graph (who calls what)
- **External**: All third-party systems with SLAs, contracts, protocols
- **Transitive Dependencies**: Library vulnerabilities (CVE checks)

### Step 7 — Security & Access Assessment
- **Authentication**: Mechanism (LDAP/SSO/Basic/Custom), session management
- **Authorization**: Role/permission model (RBAC/ABAC), enforcement points
- **Secret Management**: Hard-coded credentials, config file secrets, environment variables
- **Audit Logging**: What is logged, retention policy, log tampering protection
- **Known Vulnerabilities**: OWASP Top 10 mapping against legacy code

### Step 8 — Risk Identification & Scoring
Score each risk by **Impact (1-5) × Likelihood (1-5)**:

| Risk Category | Description | Impact | Likelihood | Score |
|---|---|---|---|---|
| Single Point of Failure | e.g. monolithic DB | — | — | — |
| Security Risk | e.g. hard-coded creds | — | — | — |
| Scalability | e.g. no horizontal scaling | — | — | — |
| Operational | e.g. manual deployments | — | — | — |
| Data Loss | e.g. no backup strategy | — | — | — |
| DB Coupling | e.g. God tables shared by all modules | — | — | — |
| Data Quality | e.g. orphaned FK rows, null mandatory cols | — | — | — |

---

## Output Format

### Legacy Architecture Report (legacy_analyse.md)
```markdown
# Legacy Architecture Report

## 1. Executive Summary
## 2. System Inventory
  - 2.1 Services & Modules
  - 2.2 APIs
  - 2.3 External Integrations
## 3. Database Analysis
  - 3.1 DB Technology & Version
  - 3.2 Schema Inventory (tables, columns, indexes)
  - 3.3 Stored Procedures, Functions & Triggers
  - 3.4 Scheduled DB Jobs
  - 3.5 Views & Materialized Views
  - 3.6 Referential Integrity Map
  - 3.7 Data Volumes & Growth Estimates
  - 3.8 Query Hotspots & Execution Plans
  - 3.9 DB Anti-Patterns Found
  - 3.10 Table Ownership Matrix (module × table)
  - 3.11 Data Quality Issues
  - 3.12 Backup & Recovery Posture
## 4. Code Quality Assessment
## 5. Data Flow Map
## 6. Security Posture
## 7. Risk Matrix
## 8. Pain Points (prioritized)
## 9. Recommendations
## 10. Technology Profile
  - 10.1 Detected Tiers (Backend / Web Frontend / iOS / Android) — list evidence per tier
  - 10.2 Repository Profile: `backend-only` | `frontend-only` | `mobile-only` | `fullstack-web` | `fullstack-mobile` | `fullstack` | other
  - 10.3 Scope Recommendation — which development phases are applicable
```

---

## Definition of Done (DoD)

### Technology Profile
- [ ] Technology Profile (Section 10) produced before any other analysis step
- [ ] Each detected tier (Backend / Frontend / iOS / Android) listed with file/directory evidence
- [ ] Repository profile classification recorded (e.g., `backend-only`, `fullstack-web`)
- [ ] Scope recommendation documented (which Phase 4 targets apply)

### Completeness
- [ ] 100% of services, modules, and APIs listed and categorized
- [ ] All DB tables, columns, indexes, views, stored procedures, and triggers documented
- [ ] All external systems identified with purpose and protocol
- [ ] All build/deployment artifacts catalogued

### Database Analysis
- [ ] DB engine name, exact version, and EOL status recorded
- [ ] Full schema inventory produced (tables, columns, constraints, indexes, sequences)
- [ ] All stored procedures and functions catalogued with purpose and tables accessed
- [ ] All triggers documented (table, event, timing, business logic)
- [ ] All scheduled DB jobs listed with schedule and business purpose
- [ ] Table Ownership Matrix produced (which module reads/writes which table)
- [ ] Top 10 query hotspots identified with execution plans
- [ ] At least 3 DB anti-patterns identified with table/column evidence
- [ ] Data quality issues quantified (null counts, orphaned rows, duplicates)
- [ ] Backup/recovery posture assessed (type, frequency, PITR capability, RPO/RTO)

### Depth
- [ ] At least 3 critical business flows documented end-to-end (sequence level)
- [ ] Performance metrics collected (latency, throughput, error rate)
- [ ] Top 5 bottlenecks identified and proven with logs/metrics
- [ ] Dead code percentage estimated

### Security & Risk
- [ ] Authentication/authorization flow documented
- [ ] Sensitive data handling identified (PII, credentials, keys)
- [ ] Risk matrix scored for all identified risks (Impact × Likelihood)
- [ ] At least 1 OWASP Top 10 issue assessed

### Validation
- [ ] Findings reviewed with at least 1 senior developer from legacy team
- [ ] Findings validated against actual system behavior (not just docs)
- [ ] Business stakeholder confirmed business flow accuracy

---

## Next Skill
When this analysis is complete, proceed to [`legacy-architecture`](../legacy-architecture/SKILL.md) to visualize the architecture.
