---
name: backend-development
description: 'Backend development skill for legacy modernization. Act as a senior master backend developer. Use when: building Java 21 Spring Boot 3.5 backend, implementing clean architecture hexagonal architecture, setting up domain-driven design modules, implementing REST APIs OpenAPI security JWT LDAP OAuth2, database JPA repositories, testing JUnit Mockito Testcontainers, observability metrics tracing logging, phased development plan backend implementation.'
argument-hint: 'Project name or path to system design artifacts to base backend implementation on'
---

# Backend Development

## Role
**Senior Master Backend Developer** — Implement a production-ready, enterprise-grade backend following clean architecture, SOLID principles, and industry standards. No shortcuts, no technical debt introduced.

## When to Use
- After `target-architecture` skill is complete
- Starting or continuing backend implementation phases
- Need phased development plan for backend, or ready to implement a specific phase

## Prerequisites
- `ai-driven-development/docs/target_architecture/target_architecture.md`
- Architecture style and tech decisions confirmed

## Output Location
Create folders:
- `ai-driven-development/development/` — tracking file
- `ai-driven-development/development/be_development_todo.md` — phase tracker
- `ai-driven-development/development/backend_development/{project_name}` — all backend code

---

## Tech Stack (Fixed)

| Concern | Technology |
|---|---|
| Language | Java 21 (LTS, virtual threads capable) |
| Framework | Spring Boot 3.5+ |
| Build | Maven (`pom.xml`) |
| API Docs | SpringDoc OpenAPI 3 (Swagger UI) |
| ORM / DB | Spring Data JPA + Hibernate 6 |
| Connection Pool | HikariCP |
| Security | Spring Security 6 + JWT |
| Boilerplate | Lombok |
| Testing | JUnit 5 + Mockito + Testcontainers |
| Logging | SLF4J + Logback (structured JSON) |
| Metrics | Micrometer + Prometheus |
| Tracing | OpenTelemetry |

### Flexible / User-Selectable (confirm before Phase 1)

| Concern | Options |
|---|---|
| Database | Oracle / PostgreSQL / MySQL |
| Auth Provider | Spring Security + LDAP / Keycloak / Auth0 |
| Messaging | Kafka / RabbitMQ / AWS SQS / None |
| Caching | Redis / Caffeine / None |
| Scheduling | Spring Batch / `@Scheduled` / Quartz |
| Container Orchestration | Docker + K8s / Docker Compose / Cloud PaaS |

---

## Architecture Rules (Non-Negotiable)

> See [STANDARDS.md](./STANDARDS.md) for the full list of architecture rules, project folder structure, Docker image template, error response format, and all other project standards.

---

## Procedure

### Step 0 — Create `be_development_todo.md`
Before writing any code, create the phased tracking file using the **Phase Tracker Template** from [STANDARDS.md](./STANDARDS.md).

Update this file at the start and end of every phase.

---

### Phase 1 — Project Setup & Core Foundation
**Goal**: Bootstrap a working, runnable project with all tooling in place.

1. **Maven project structure**: Use the folder structure from [STANDARDS.md](./STANDARDS.md).

2. **`pom.xml`** with:
   - Spring Boot 3.5+ parent
   - Java 21 compiler settings
   - Required dependencies (Spring Web, Security, Data JPA, Validation, Actuator, Lombok, SpringDoc)
   - Profiles: `dev`, `test`, `prod`

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
- Entities have no Spring annotations in `domain/` package
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
- Use case / Service implementation classes (annotated with `@Service`)
- DTOs with Jakarta Validation (`@NotNull`, `@Size`, etc.)
- Mappers (MapStruct recommended)
- Transaction boundaries at service layer (`@Transactional`)

**Infrastructure Layer**:
- JPA repository implementations (Spring Data interfaces)
- External service clients (REST templates / WebClient)
- Messaging producers/consumers (if applicable)
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

**Spring Security Setup**:
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    // SecurityFilterChain bean
    // JWT filter
    // CORS config
    // CSRF: disable for stateless APIs
}
```

**Auth Options** (implement based on user selection):
- **JWT + LDAP**: `LdapAuthenticationProvider` + JWT issuance on success
- **Keycloak/OAuth2**: Spring Security OAuth2 Resource Server + JWT decoder
- **Both**: LDAP for legacy clients, OAuth2 for new clients (migration period)

**Authorization**:
```java
@PreAuthorize("hasRole('ADMIN') or hasPermission(#id, 'READ')")
public ItemDto getItem(Long id) { ... }
```

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
- `@Scheduled` or Spring Batch jobs replacing legacy cron scripts
- Job locking for distributed deployments (ShedLock)

**File/SSH/FTP** (if applicable):
- JSch for SSH commands
- Apache Commons Net for FTP operations
- All operations wrapped in service layer with error handling

**Email Notifications**:
- `JavaMailSender` or Spring Mail
- Templates (Thymeleaf or Freemarker)

### Phase 10 — Review Phase 9
- [ ] All integrations have circuit breakers or retry logic
- [ ] No uncaught exceptions from external calls leaking to API
- [ ] Scheduled jobs have ShedLock (multi-instance deployment safe)
- [ ] All async flows have dead letter handling

---

### Phase 11 — Observability & DevOps
**Goal**: Make the system monitorable in production.

**Logging**:
```xml
<!-- logback-spring.xml -->
<!-- JSON structured logging for prod -->
<!-- Pattern with traceId, spanId, userId for correlation -->
```

**Metrics** (Micrometer):
- Business metrics: counters per use case
- SLA metrics: response time histograms
- DB metrics: connection pool, query times

**Distributed Tracing** (OpenTelemetry):
- Trace propagation headers (W3C TraceContext)
- Span annotations on service methods

**Docker**:
```dockerfile
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
COPY target/app.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Health Checks** (Actuator):
- `/actuator/health` — liveness
- `/actuator/health/readiness` — readiness
- Custom health indicators for DB, messaging

---

### Phase 12 — Testing & Quality Gate
**Goal**: Achieve quality targets before release.

**Unit Tests** (JUnit 5 + Mockito):
- All service methods have unit tests
- Target: ≥ 70% line coverage
- Test all edge cases, null inputs, boundary values

**Integration Tests** (Testcontainers):
- DB integration tests using real DB container
- API layer tests with `@SpringBootTest` + `MockMvc`
- Security tests: authenticated vs unauthenticated requests

**Performance**:
- Load test key endpoints (k6 / Gatling / JMeter)
- Verify P95 < 200ms under expected load
- Check for N+1 queries (Hibernate query log analysis)

**Security Scan**:
- OWASP Dependency Check on `pom.xml`
- No CVEs in critical/high severity from runtime dependencies

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
