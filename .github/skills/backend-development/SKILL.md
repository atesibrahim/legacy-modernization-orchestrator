---
name: backend-development
description: 'Backend development skill for legacy modernization. Act as a senior master backend developer. Use when: building Java Spring Boot / .NET ASP.NET Core / Python FastAPI / Go Gin-Fiber backend, implementing clean architecture hexagonal architecture, setting up domain-driven design modules, implementing REST APIs OpenAPI security JWT OAuth2, database ORM repositories, testing unit integration Testcontainers, observability metrics tracing logging, phased development plan backend implementation.'
argument-hint: 'Project name or path to system design artifacts to base backend implementation on'
---

# Backend Development

## Role
**Senior Master Backend Developer** — Implement a production-ready, enterprise-grade backend following clean architecture, SOLID principles, and industry standards. No shortcuts, no technical debt introduced.

## When to Use
- After `target-architecture` skill is complete
- Starting or continuing backend implementation phases
- Need phased development plan for backend, or ready to implement a specific phase

## Prerequisites (Preflight)
Before starting, verify the following artifacts exist:

| Artifact | Expected Path | Required? |
|---|---|---|
| Target architecture | `ai-driven-development/docs/target_architecture/target_architecture.md` | Always |
| Tech stack selections | `ai-driven-development/docs/tech_stack_selections.md` | Always |

**If any required artifact is missing**: Stop. Report which artifact is missing, which phase produces it (Phase 3: `target-architecture`, Phase 2.5: Tech Stack Selection Gate), and offer: (a) Run the prerequisite phase now, (b) Provide the artifact path manually.

## Output Location
Create folders:
- `ai-driven-development/development/` — tracking file
- `ai-driven-development/development/be_development_todo.md` — phase tracker
- `ai-driven-development/development/backend_development/{project_name}` — all backend code

---

## Tech Stack

> **Read `tech_stack_selections.md` § Backend → Language / Framework** before Phase 1 to determine the active language and framework. Apply the corresponding toolchain column from the table below throughout the entire implementation.

### Per-Language Toolchain

| Concern | Java 21 + Spring Boot 3.5 | .NET 9 + ASP.NET Core | Python 3.12 + FastAPI | Go 1.23 + Gin / Fiber |
|---|---|---|---|---|
| Build | Maven (`pom.xml`) | .NET CLI / MSBuild (`*.csproj`) | pip + `pyproject.toml` | Go modules (`go.mod`) |
| API Docs | SpringDoc OpenAPI 3 (Swagger UI) | Swashbuckle / NSwag | FastAPI auto-docs (built-in) | swaggo/swag |
| ORM / DB Access | Spring Data JPA + Hibernate 6 | EF Core 9 | SQLAlchemy 2 + Alembic | GORM / sqlc |
| Connection Pool | HikariCP | Built-in (EF Core) | asyncpg / psycopg3 | pgxpool |
| Security / JWT | Spring Security 6 + JWT | ASP.NET Identity + JWT Bearer | python-jose / authlib | golang-jwt |
| Boilerplate | Lombok | (built-in records/nullability) | Pydantic v2 | (native structs) |
| Testing | JUnit 5 + Mockito + Testcontainers | xUnit + Moq + Testcontainers.NET | pytest + pytest-asyncio + Testcontainers | Go testing + testcontainers-go |
| Logging | SLF4J + Logback (structured JSON) | Serilog or NLog (JSON sink) | structlog / loguru | zerolog / zap |
| Metrics | Micrometer + Prometheus | prometheus-net | prometheus\_client | prometheus/client\_golang |
| Tracing | OpenTelemetry Java Agent | OpenTelemetry .NET | opentelemetry-python | opentelemetry-go |

### Confirmed Tech Choices (read from `tech_stack_selections.md`)

> **Do NOT ask the user for these** — all choices were confirmed in Phase 2.5 and saved to `ai-driven-development/docs/tech_stack_selections.md`. Read that file before Phase 1 and apply the confirmed selections throughout.

| Concern | `tech_stack_selections.md` key |
|---|---|
| Language / Framework | § Backend → Language / Framework |
| Database | § Backend → Database |
| Auth Provider | § Backend → Auth Provider |
| Messaging | § Backend → Message Broker |
| Caching | § Backend → Caching |
| Scheduling | § Backend → Job Scheduling |
| Container Orchestration | § Common → Container/Deployment |

---

## Architecture Rules (Non-Negotiable)

> See [STANDARDS.md](./STANDARDS.md) for language-agnostic architecture rules, the error response format, and the phase tracker template.

> **Java + Spring Boot**: For Java-specific standards (Maven folder structure, Lombok, Spring annotations, Docker template), see [`../java-springboot/STANDARDS.md`](../java-springboot/STANDARDS.md). For Java-specific implementation steps (pom.xml setup, Spring Security config, Logback, Testcontainers), see [`../java-springboot/SKILL.md`](../java-springboot/SKILL.md).

> **.NET 9 + ASP.NET Core**: For .NET-specific standards (solution structure, EF Core conventions, Docker template), see [`../dotnet-aspnetcore/STANDARDS.md`](../dotnet-aspnetcore/STANDARDS.md). For .NET-specific implementation steps (NuGet packages, MediatR CQRS, Serilog, xUnit, Testcontainers.NET), see [`../dotnet-aspnetcore/SKILL.md`](../dotnet-aspnetcore/SKILL.md).

> **Python 3.12 + FastAPI**: For Python-specific standards (src layout, Alembic conventions, Docker template), see [`../python-fastapi/STANDARDS.md`](../python-fastapi/STANDARDS.md). For Python-specific implementation steps (pyproject.toml, SQLAlchemy 2 async, pytest-asyncio, structlog), see [`../python-fastapi/SKILL.md`](../python-fastapi/SKILL.md).

> **Go 1.23 + Gin / Fiber**: For Go-specific standards (project layout, golangci-lint, Docker scratch image), see [`../go-gin-fiber/STANDARDS.md`](../go-gin-fiber/STANDARDS.md). For Go-specific implementation steps (go.mod, GORM/sqlc, zap, testcontainers-go, govulncheck), see [`../go-gin-fiber/SKILL.md`](../go-gin-fiber/SKILL.md).

> **Language adaptation**: The procedure below applies to all stacks. When the confirmed stack is Java + Spring Boot, follow the Java-specific steps in [`../java-springboot/SKILL.md`](../java-springboot/SKILL.md) alongside this procedure. For .NET, use [`../dotnet-aspnetcore/SKILL.md`](../dotnet-aspnetcore/SKILL.md). For Python, use [`../python-fastapi/SKILL.md`](../python-fastapi/SKILL.md). For Go, use [`../go-gin-fiber/SKILL.md`](../go-gin-fiber/SKILL.md). Same architectural patterns (Clean Architecture, layered structure, REST + OpenAPI, JWT auth, observability), different tools.

---

## Procedure

### Step 0 — Create `be_development_todo.md`
Before writing any code, create the phased tracking file using the **Phase Tracker Template** from [STANDARDS.md](./STANDARDS.md).

Update this file at the start and end of every phase.

---

### Step 0.1 — Bounded Context Decomposition Check

> **Run after reading `target_architecture.md` and before Phase 1.** The number of bounded contexts determines whether to implement the domain in one pass or decompose feature development into sequential or parallel sub-tasks per context.

**Measure:**
- Count bounded contexts defined in `target_architecture.md`
- List the feature modules they map to and their entity counts

**Choose a strategy:**

| Scale | Signal | Strategy |
|---|---|---|
| **Simple** | 1–2 bounded contexts, ≤ 5 entities per context | Implement all contexts in a single pass through Phases 3–9 |
| **Moderate** | 3–5 bounded contexts | Implement one bounded context at a time through Phases 3, 5, 7 |
| **Complex** | 6+ bounded contexts | One sub-task per context for Phases 3+5+7; run in parallel; merge into shared codebase |

**Per-context sub-task scope (moderate/complex):**

Each sub-task implements the full vertical slice for one bounded context:
- **Phase 3** scope: entities + value objects + repository interfaces for this context only
- **Phase 5** scope: application services + infrastructure repos + DTOs + mappers for this context
- **Phase 7** scope: REST controllers + OpenAPI annotations for this context's API surface

**Always single-threaded (never per-context):**
- Phase 1–2: project setup and core foundation — done once for the whole project
- Phase 9: integrations and async — done once; references all contexts
- Phase 11: observability and DevOps — done once
- Phase 12: testing and quality gate — runs across full codebase
- Phase 13: final review — runs across full codebase

**Integration contracts between contexts:**
Define and document inter-context DTOs and events in a shared `api-contracts/` folder **before** starting parallel context sub-tasks. Both sides of a context boundary must agree on the contract first.

Record the decomposition plan (bounded context list → sub-task assignment) in `be_development_todo.md` before coding any context.

---

### Phase 1 — Project Setup & Core Foundation
**Goal**: Bootstrap a working, runnable project with all tooling in place.

1. **Project structure**: Use the folder structure from the stack-specific standards file — [`../java-springboot/STANDARDS.md`](../java-springboot/STANDARDS.md) (Java), [`../dotnet-aspnetcore/STANDARDS.md`](../dotnet-aspnetcore/STANDARDS.md) (.NET), [`../python-fastapi/STANDARDS.md`](../python-fastapi/STANDARDS.md) (Python), [`../go-gin-fiber/STANDARDS.md`](../go-gin-fiber/STANDARDS.md) (Go).

2. **Build file** (`pom.xml` / `*.csproj` / `pyproject.toml` / `go.mod`) with:
   - Framework parent / version pinning
   - Required dependencies (web, security, ORM, validation, health checks, API docs)
   - Profiles / environments: `dev`, `test`, `prod`
   - Java: see [`../java-springboot/SKILL.md`](../java-springboot/SKILL.md) § Phase 1 · .NET: see [`../dotnet-aspnetcore/SKILL.md`](../dotnet-aspnetcore/SKILL.md) § Phase 1 · Python: see [`../python-fastapi/SKILL.md`](../python-fastapi/SKILL.md) § Phase 1 · Go: see [`../go-gin-fiber/SKILL.md`](../go-gin-fiber/SKILL.md) § Phase 1.

3. **Application configuration files**:
   - `application.yml` — common config
   - `application-dev.yml` — local dev overrides
   - `application-prod.yml` — production (secrets via env vars)

4. **Health check**: Verify `/actuator/health` returns 200

5. **Global exception handler**: `@ControllerAdvice` with standardized error response:
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": ["field 'email' must not be blank"],
  "traceId": "abc-123"
}
```

### Phase 2 — Review Phase 1
- [ ] Project compiles and runs
- [ ] Actuator health endpoint works
- [ ] Exception handler returns standardized errors
- [ ] All profiles configured correctly
- [ ] No hard-coded secrets anywhere

---

### Phase 3 — Domain Layer
**Goal**: Model the business domain cleanly, independent of framework.

For each bounded context identified in system design:

1. **Entities** (JPA): Map to DB tables, no business logic methods
2. **Value Objects**: Immutable, no ID, encapsulate validation
3. **Repository Interfaces**: Only interfaces in domain layer (interface segregation)
4. **Domain Events** (if applicable): Plain POJOs published on aggregate changes
5. **Domain Services**: Business logic that doesn't belong to a single entity
6. **Enumerations**: Business-meaningful constants as enums

**Rules**:
- Entities have no framework-specific annotations in the `domain/` package
- Validation logic belongs in domain constructors / factory methods
- No `Optional` wrapping everywhere — use it only as return type from repositories

### Phase 4 — Review Phase 3
- [ ] All entities mapped correctly (no missing relationships)
- [ ] No circular entity dependencies
- [ ] Repository interfaces named consistently (`UserRepository`, not `IUserRepository`)
- [ ] Domain events defined for all state changes that others may react to

---

### Phase 5 — Application & Infrastructure Layers
**Goal**: Implement use cases and wire them to infrastructure.

**Application Layer**:
- Use case / service implementation classes
- DTOs with validation (Jakarta Validation / FluentValidation / Pydantic / struct tags per stack)
- Mappers (MapStruct / AutoMapper / dataclasses / struct mapping per stack)
- Transaction boundaries at service layer
- Java: see [`../java-springboot/SKILL.md`](../java-springboot/SKILL.md) § Phase 5 · .NET: see [`../dotnet-aspnetcore/SKILL.md`](../dotnet-aspnetcore/SKILL.md) § Phase 5 · Python: see [`../python-fastapi/SKILL.md`](../python-fastapi/SKILL.md) § Phase 5 · Go: see [`../go-gin-fiber/SKILL.md`](../go-gin-fiber/SKILL.md) § Phase 5.

**Infrastructure Layer**:
- ORM repository implementations
- External service clients (HTTP clients, messaging producers/consumers)
- Caching configuration (if applicable)

### Phase 6 — Review Phase 5
- [ ] All use cases testable without Spring context
- [ ] No `@Transactional` in controllers
- [ ] No `EntityManager` exposed beyond infrastructure layer
- [ ] Mappers produce correct output (unit tests for mappers)

---

### Phase 7 — API Layer & Security
**Goal**: Expose secure, documented REST APIs.

**API Layer**:
- `@RestController` classes — thin, only delegate to service
- Request/Response DTOs (separate from domain DTOs)
- Path: `/api/v1/{resource}`
- HTTP verbs: GET (read), POST (create), PUT (update), PATCH (partial), DELETE
- OpenAPI annotations for all endpoints

**Security Framework Setup** (implement based on the confirmed stack):
- Register a security filter chain / middleware pipeline
- Configure JWT validation (or OAuth2 resource server)
- Configure CORS for frontend origins only
- Disable CSRF for stateless APIs

**Auth Options** (implement based on user selection):
- **JWT + LDAP**: LDAP authentication provider + JWT issuance on success
- **Keycloak/OAuth2**: OAuth2 Resource Server + JWT decoder
- **Both**: LDAP for legacy clients, OAuth2 for new clients (migration period)

**Authorization**: enforce at method/handler level — never inline role checks in business logic.

> Language-specific security config — Java: see [`../java-springboot/SKILL.md`](../java-springboot/SKILL.md) § Phase 7 · .NET: see [`../dotnet-aspnetcore/SKILL.md`](../dotnet-aspnetcore/SKILL.md) § Phase 7 · Python: see [`../python-fastapi/SKILL.md`](../python-fastapi/SKILL.md) § Phase 7 · Go: see [`../go-gin-fiber/SKILL.md`](../go-gin-fiber/SKILL.md) § Phase 7.

### Phase 8 — Review Phase 7
- [ ] All endpoints documented in Swagger UI
- [ ] All endpoints require authentication (except `/auth/**`, `/actuator/health`)
- [ ] Authorization enforced at method level
- [ ] CORS configured for frontend origins only
- [ ] No sensitive data in response bodies (no passwords, no internal IDs in pagination)

---

### Phase 9 — Integrations & Async
**Goal**: Wire all external systems and asynchronous flows.

**LDAP Integration** (if Spring Security + LDAP):
- Multiple DN fallback configured
- LDAP connection pooling
- Group-to-role mapping

**Messaging** (if Kafka/RabbitMQ):
- Producer service with retry + dead letter queue
- Consumer with idempotency check
- Message schemas documented

**Scheduling**:
- Replace legacy cron scripts with framework scheduler or batch jobs
- Use distributed job locking for multi-instance deployments

**File/SSH/FTP** (if applicable):
- Use stack-appropriate SSH / FTP client library
- All operations wrapped in service layer with error handling

**Email Notifications**:
- Use stack-appropriate mail client with templated email bodies

> Language-specific integration patterns — Java: see [`../java-springboot/SKILL.md`](../java-springboot/SKILL.md) § Phase 9 · .NET: see [`../dotnet-aspnetcore/SKILL.md`](../dotnet-aspnetcore/SKILL.md) § Phase 9 · Python: see [`../python-fastapi/SKILL.md`](../python-fastapi/SKILL.md) § Phase 9 · Go: see [`../go-gin-fiber/SKILL.md`](../go-gin-fiber/SKILL.md) § Phase 9.

### Phase 10 — Review Phase 9
- [ ] All integrations have circuit breakers or retry logic
- [ ] No uncaught exceptions from external calls leaking to API
- [ ] Scheduled jobs have ShedLock (multi-instance deployment safe)
- [ ] All async flows have dead letter handling

---

### Phase 11 — Observability & DevOps
**Goal**: Make the system monitorable in production.

**Logging**:
- Structured JSON output in `prod` profile
- Include trace ID, span ID, and user ID in every log line for correlation

**Metrics**:
- Business metrics: counters per use case
- SLA metrics: response time histograms
- DB metrics: connection pool, query times

**Distributed Tracing** (OpenTelemetry):
- Trace propagation headers (W3C TraceContext)
- Span annotations on service methods

**Docker**:
- Non-root user — mandatory for security
- Minimal base image (Alpine or distroless); pin exact version
- See stack-specific Docker template: [`../java-springboot/STANDARDS.md`](../java-springboot/STANDARDS.md) § Docker Image Template

**Health Checks**:
- Liveness and readiness endpoints (e.g. `/actuator/health`, `/actuator/health/readiness` for Java)
- Custom health indicators for DB and messaging

> Language-specific observability setup — Java: see [`../java-springboot/SKILL.md`](../java-springboot/SKILL.md) § Phase 11 · .NET: see [`../dotnet-aspnetcore/SKILL.md`](../dotnet-aspnetcore/SKILL.md) § Phase 11 · Python: see [`../python-fastapi/SKILL.md`](../python-fastapi/SKILL.md) § Phase 11 · Go: see [`../go-gin-fiber/SKILL.md`](../go-gin-fiber/SKILL.md) § Phase 11.

> **Infrastructure-as-Code**: For Kubernetes manifests, Helm charts, Terraform/Pulumi modules, Prometheus alerting rules, and Grafana dashboards, use the [`devops-infra`](../devops-infra/SKILL.md) skill (optional Phase 4h).

---

### Phase 12 — Testing & Quality Gate
**Goal**: Achieve quality targets before release.

**Unit Tests**:
- All service methods have unit tests
- Target: ≥ 70% line coverage
- Test all edge cases, null inputs, boundary values

**Integration Tests**:
- DB integration tests using real DB container (Testcontainers or equivalent)
- API layer tests covering happy path and error cases
- Security tests: authenticated vs unauthenticated requests

**Performance**:
- Load test key endpoints (k6 / Gatling / JMeter)
- Verify P95 < 200ms under expected load
- Check for N+1 queries via ORM query logging

**Security Scan**:
- Run a dependency vulnerability scan (OWASP Dependency Check / `dotnet list package --vulnerable` / `pip-audit` / `govulncheck`)
- No CVEs in critical/high severity from runtime dependencies

> Language-specific quality gate tools — Java: see [`../java-springboot/SKILL.md`](../java-springboot/SKILL.md) § Phase 12 · .NET: see [`../dotnet-aspnetcore/SKILL.md`](../dotnet-aspnetcore/SKILL.md) § Phase 12 · Python: see [`../python-fastapi/SKILL.md`](../python-fastapi/SKILL.md) § Phase 12 · Go: see [`../go-gin-fiber/SKILL.md`](../go-gin-fiber/SKILL.md) § Phase 12.

### Phase 13 — Final Review & Cleanup
- [ ] All TODO comments resolved
- [ ] No commented-out code
- [ ] API documentation complete and accurate
- [ ] Docker build produces minimal, non-root image
- [ ] Environment variables documented in `README.md`
- [ ] All phases in `be_development_todo.md` checked off

---

## Definition of Done (DoD)

### Code Quality
- [ ] Clean architecture layers enforced (no framework in domain)
- [ ] No critical SonarQube/SpotBugs issues
- [ ] All `TODO` comments resolved
- [ ] Code review completed by 1 senior developer

### Functional
- [ ] All business use cases implemented and tested
- [ ] API contracts match OpenAPI spec exactly

### Security
- [ ] Authentication working (configured auth provider)
- [ ] Authorization enforced at method level on all endpoints
- [ ] No hardcoded secrets, passwords, or API keys
- [ ] OWASP CVSS 7+ dependencies resolved

### Performance
- [ ] Key endpoints meet SLA (P95 < 200ms under expected load)
- [ ] No N+1 queries in ORM layer

### Testing
- [ ] Unit test coverage ≥ 70%
- [ ] Integration tests cover all critical flows including security

### Observability
- [ ] Logs structured (JSON in prod), correlation IDs included
- [ ] Metrics available at `/actuator/prometheus`
- [ ] Errors fully traceable via trace ID

### Deployment
- [ ] Runs in Docker (non-root user, minimal image)
- [ ] All config externalized via environment variables
- [ ] Readiness and liveness probes configured

---

## Next Skill
When backend is production-ready, proceed to [`compare-legacy-to-new`](../compare-legacy-to-new/SKILL.md) to validate equivalence and improvements.
