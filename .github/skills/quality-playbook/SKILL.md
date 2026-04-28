---
name: quality-playbook
description: 'Cross-cutting quality reference for all phases of legacy modernization. Use when: evaluating architecture decisions, applying quality gates, choosing between design patterns, reviewing testing strategy, applying code quality standards, deciding monolith vs microservices, selecting database strategies, evaluating API design options across any agent phase.'
argument-hint: 'Phase name or quality concern to evaluate'
version: 1.0.0
last_reviewed: 2026-04-27
status: Active
---

# Quality Playbook — SKILL.md

## Role
**Cross-Cutting Quality Reference**

This document centralizes best practices, decision trees, and quality gates applicable across all phases and agents. Consult it at any phase when facing a design fork, evaluating options, or applying quality standards.

---

## 1. Architecture Decision Trees

### 1.1 Monolith vs Microservices

```
Q1: Does the legacy system have a single team (< 8 engineers) working on it?
  └─► YES → Start with Modular Monolith. Microservices can be extracted later.
  └─► NO → Q2

Q2: Are there clear, stable bounded contexts with independent deployment needs?
  └─► NO → Modular Monolith (shared DB, deployed as one unit, internal package boundaries)
  └─► YES → Q3

Q3: Do the bounded contexts have significantly different scaling requirements?
  └─► NO → Modular Monolith (easier ops, no distributed transactions)
  └─► YES → Microservices (deploy and scale independently, accept operational complexity)

Q4: Is the team experienced with distributed systems, service meshes, and observability?
  └─► NO → Modular Monolith until team gains experience
  └─► YES → Microservices acceptable
```

**Default recommendation**: Modular Monolith unless Q3 + Q4 both answer YES.

**Anti-pattern**: Do not decompose by CRUD noun (UserService, OrderService, ProductService) — decompose by **business capability** (Fulfillment, Catalog, Identity).

---

### 1.2 Polyglot vs Single Database

```
Q1: Do any of the bounded contexts have fundamentally different data access patterns?
    (e.g., graph traversal, full-text search, time-series, document)
  └─► NO → Single relational DB for all services (PostgreSQL/MySQL/SQL Server)
  └─► YES → Q2

Q2: Does the team have operational expertise to run multiple database engines?
  └─► NO → Single relational DB + specialized extensions (pg_trgm for search, TimescaleDB for time-series)
  └─► YES → Polyglot — assign the specialized engine only to the service that needs it

Q3 (if polyglot): Is cross-service querying required between the polyglot stores?
  └─► YES → Use async event streaming (Kafka/Kinesis) to replicate read models; never JOIN across DB engines
  └─► NO → Polyglot is safe
```

**Default recommendation**: Single PostgreSQL instance scoped per service (schema-per-service or DB-per-service depending on isolation needs).

---

### 1.3 REST vs GraphQL vs gRPC

```
Q1: Is this an internal service-to-service API with known consumers?
  └─► YES + performance critical → gRPC (Protobuf, bidirectional streaming, HTTP/2)
  └─► YES + not performance critical → REST (simpler, tooling everywhere)
  └─► NO → Q2

Q2: Is this a public-facing API consumed by web/mobile clients with varied data needs?
  └─► YES + many different query shapes from different clients → GraphQL
  └─► YES + fixed, well-defined resource shapes → REST + OpenAPI
  └─► NO → REST

Q3: Does the team have GraphQL operational experience (N+1 protection, persisted queries, schema versioning)?
  └─► NO → REST (GraphQL operational complexity is high; do not use without team experience)
  └─► YES → GraphQL acceptable
```

**Default recommendation**: REST + OpenAPI. Use gRPC for high-throughput internal calls. Avoid GraphQL unless the team has proven experience.

---

### 1.4 Synchronous vs Asynchronous Integration

```
Q1: Does the consumer need a response within the same request?
  └─► YES → Synchronous (REST/gRPC)
  └─► NO → Q2

Q2: Is the operation long-running (> 2 seconds) or involves side effects in multiple services?
  └─► YES → Async (message queue or event stream)
  └─► NO → Q3

Q3: Does the operation need to be retried automatically on failure?
  └─► YES → Async with dead-letter queue
  └─► NO → Synchronous is fine
```

**Default recommendation**: Synchronous REST for read operations and simple writes. Async events for: user-initiated long operations, cross-service state changes, notifications, and audit log ingestion.

---

### 1.5 SQL vs NoSQL

```
Q1: Does the data have a well-defined, stable schema?
  └─► YES → Relational (PostgreSQL/MySQL)
  └─► NO → Q2

Q2: Is the primary access pattern key-based lookup with no relational joins?
  └─► YES + high write throughput → DynamoDB / Cassandra
  └─► YES + moderate throughput → Redis (cache/session) or MongoDB (documents)
  └─► NO → Relational

Q3: Are ACID transactions required across multiple entities?
  └─► YES → Relational (or NewSQL like CockroachDB/Spanner)
  └─► NO → NoSQL acceptable
```

**Default recommendation**: PostgreSQL. Only introduce NoSQL when a concrete performance or schema-flexibility need is demonstrated.

---

## 2. Common Anti-Patterns and How to Avoid Them

### 2.1 Big Ball of Mud → Modular Monolith
**Problem**: Legacy code with no package boundaries, circular dependencies, god classes.  
**Fix**: Apply **Strangler Fig** pattern — introduce new code behind a façade, gradually route traffic away from legacy paths. Never rewrite all-at-once.

---

### 2.2 Shared Database Anti-Pattern
**Problem**: Two services share the same DB schema, leading to implicit coupling.  
**Fix**: One DB schema (or schema prefix) per service. Cross-service data access via APIs or events, never direct SQL joins across service boundaries.

---

### 2.3 Distributed Monolith
**Problem**: Microservices that are chatty (synchronous call chains 5+ deep), share a DB, or cannot be deployed independently.  
**Fix**: Apply the "can I deploy this service alone?" test. If NO → it is not a true microservice. Merge it or decouple it with async events.

---

### 2.4 Anemic Domain Model
**Problem**: All business logic lives in service classes; domain entities are pure data holders.  
**Fix**: Move invariants and business rules into domain aggregate roots. Services orchestrate, aggregates enforce rules.

---

### 2.5 Hardcoded Configuration
**Problem**: Hostnames, credentials, feature flags baked into source code.  
**Fix**: Externalize to environment variables or a secrets manager. Enforce with automated secret scanning (truffleHog/gitleaks) in CI.

---

### 2.6 Missing Idempotency on Write APIs
**Problem**: Duplicate requests (retries, network failures) cause double-writes or double-charges.  
**Fix**: Accept an `Idempotency-Key` header on all POST/PATCH mutations. Store key in DB for 24 hours; replay the cached response on duplicate.

---

### 2.7 N+1 Query Problem
**Problem**: Loading a list of N entities then issuing one query per entity for related data.  
**Fix**: Use batch loading, eager loading with JOIN FETCH (JPA), or DataLoader (GraphQL). Profile with query logs in testing.

---

### 2.8 Logging Sensitive Data
**Problem**: PII, tokens, passwords accidentally logged.  
**Fix**: Mask or redact before logging. Apply log sanitisation at the logging framework level (not per call-site).

---

## 3. Quality Gates by Phase

### Phase 1 — Legacy Analysis
- All major components identified with ownership
- Every DB table mapped with at least one owner service
- Integration points documented (protocol, auth, frequency)
- Security posture includes at least: auth mechanism, session management, input validation assessment

### Phase 2 — Legacy Architecture
- Component diagram renders correctly with no orphan nodes
- Data flow covers all integration points from Phase 1
- Architectural weaknesses linked to specific Phase 1 findings

### Phase 3 — Target Architecture
- Bounded contexts map to Phase 1 business flows
- `tech_stack_selections.md` fully populated before generating diagrams
- API contracts defined for all inter-service calls
- No Phase 1 integration point is silently dropped

### Phase 4b — Backend Development
- Every Phase 3 domain module has a corresponding package structure
- OpenAPI spec generated from code (not hand-written)
- No business logic in controllers; all domain logic in domain layer
- Integration tests use Testcontainers (real DB, not mocks)

### Phase 4c/4d/4e — Frontend / iOS / Android Development
- Design tokens from Phase 4a are imported, not copied
- Accessibility (WCAG 2.1 AA) checks automated in CI
- No hard-coded API base URLs; configuration via environment

### Phase 5 — Compare Legacy to New
- Every Phase 1 business flow has an explicit coverage row in the comparison table
- Performance baseline uses real legacy measurements, not estimates

### Phase 6 — Final Validation
- Go/No-Go document produced with named stakeholder sign-offs
- Smoke test plan assigned to a named owner
- Rollback procedure rehearsed (not just documented)

---

## 4. Cross-Cutting Concerns Checklist

Apply to every new service or major component added in Phase 4:

**Security**:
- [ ] Authentication: OAuth2 / JWT with short expiry + refresh token rotation
- [ ] Authorization: RBAC or ABAC enforced at service boundary (not just UI)
- [ ] Input validation: All user-supplied data validated and sanitised at entry
- [ ] Output encoding: Response data encoded to prevent XSS
- [ ] Dependency scan: No known CVEs above medium severity
- [ ] Secret management: No credentials in source code or image layers

**Reliability**:
- [ ] Health check endpoint implemented (`/health`)
- [ ] Graceful shutdown: drain in-flight requests before termination
- [ ] Retry logic with exponential backoff + jitter for outbound calls
- [ ] Circuit breaker on external dependencies (Resilience4j / Polly / etc.)
- [ ] Timeout configured on every outbound HTTP/DB call (no infinite wait)

**Observability**:
- [ ] Structured logging (JSON) with correlation ID propagated across services
- [ ] Request-level metrics: rate, errors, latency (RED method)
- [ ] Saturation metrics: CPU, memory, DB connection pool usage
- [ ] Distributed trace context propagated (W3C TraceContext header)

**Operability**:
- [ ] `README.md` with local dev setup in < 5 commands
- [ ] Docker Compose or equivalent for local dependency stack
- [ ] Database migrations versioned (Flyway/Liquibase/Alembic/Goose)
- [ ] Feature flags for high-risk new behaviour (allows rollback without redeployment)

---

## 5. Naming Conventions Quick Reference

See [`.github/standards/core.md`](../standards/core.md) § Naming Conventions for the authoritative list.

| Layer | Convention | Example |
|---|---|---|
| Domain Aggregate | PascalCase noun | `Order`, `Customer`, `ShipmentItem` |
| Domain Event | PascalCase past tense | `OrderPlaced`, `PaymentFailed` |
| Application Service | PascalCase + `Service` | `OrderFulfillmentService` |
| REST Resource | kebab-case plural | `/api/v1/order-items` |
| DB Table | snake_case plural | `order_items` |
| Config Key | UPPER_SNAKE_CASE | `DATABASE_URL`, `JWT_SECRET` |
| File (most languages) | kebab-case | `order-service.ts`, `payment_gateway.py` |

---

## 6. Dependency Management Rules

1. **Pin exact versions in production** — use lock files (`package-lock.json`, `poetry.lock`, `go.sum`, `Gemfile.lock`). Never `*` or `^` in production images.
2. **Review before upgrading** — always check changelogs for breaking changes. Prefer patching minor/patch versions automatically, require manual review for major.
3. **Scan continuously** — run `npm audit`, `pip-audit`, `govulncheck`, or OWASP Dependency-Check in CI on every PR.
4. **Prefer well-maintained libraries** — check last commit date, open issues ratio, and maintainer responsiveness before adding a new dependency.
5. **Minimize dependencies** — prefer using language standard library features over adding a library for trivial tasks (e.g., date formatting, string padding).

---

## 7. Code Review Checklist

For any code produced in Phase 4, verify:

**Design**:
- [ ] Does the code express the business concept clearly (is the naming domain-accurate)?
- [ ] Is the responsibility of each class/module/function single and clear?
- [ ] Are there any hidden dependencies not visible from the class signature?

**Correctness**:
- [ ] Edge cases handled: null/empty inputs, boundary values, concurrent access
- [ ] Error paths: what happens when a dependency fails? Is it logged? Is the caller informed?
- [ ] Idempotency: can this mutating operation be called twice safely?

**Security**:
- [ ] No SQL built by string concatenation (use parameterised queries / ORM)
- [ ] No user-controlled data used in file paths, shell commands, or redirects
- [ ] Auth/authz check present on every entry point

**Testability**:
- [ ] Each new public method has at least one happy-path unit test
- [ ] Each new API endpoint has at least one integration test
- [ ] Tests are deterministic (no `Thread.sleep`, no time-dependent assertions without clock injection)
