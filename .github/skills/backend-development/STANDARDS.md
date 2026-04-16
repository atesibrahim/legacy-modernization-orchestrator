# Backend Development Standards

These are the **non-negotiable, language-agnostic** standards for all backend implementations.
The SKILL.md procedure references these. Do not deviate — create an ADR if a justified exception is needed.

> **Java 21 + Spring Boot**: For Java-specific standards (Maven folder structure, Lombok, Spring annotations, Docker image template), see [`../java-springboot/STANDARDS.md`](../java-springboot/STANDARDS.md).

---

## Architecture Rules (Non-Negotiable)

- **Clean Architecture layers**: `Controller → Service → Repository → Entity` — strict, no skipping
- **Dependency Inversion**: Use interfaces, inject via constructor, never field injection
- **No business logic** in controllers, entities, or repositories
- **No raw SQL** — use the ORM or named/parameterized queries only
- **No framework-specific annotations in the `domain/` layer** — domain must be framework-free
- **Authorization at the method/handler level** — never inline role checks in business logic
- **No hard-coded secrets** — all configuration via environment variables or a secrets manager
- **No `DEBUG_MODE` flags** — use environment profiles (`dev`, `test`, `prod`)
- **No over-engineering** — YAGNI; implement only what is needed

---

## Standard Error Response Format

All APIs return this JSON structure for errors:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": ["field 'email' must not be blank"],
  "traceId": "abc-123-def-456"
}
```

Map HTTP status codes consistently:
- `400` — Validation / bad request  
- `401` — Not authenticated  
- `403` — Authenticated but not authorized  
- `404` — Resource not found  
- `409` — Conflict (duplicate)  
- `500` — Unexpected server error (never expose stack traces)

---

## Phase Tracker Template (`be_development_todo.md`)

```markdown
# Backend Development Todo

## Progress Tracker
- [ ] Phase 1: Project Setup & Core Foundation
- [ ] Phase 2: Review Phase 1
- [ ] Phase 3: Domain Layer Implementation
- [ ] Phase 4: Review Phase 3
- [ ] Phase 5: Application & Infrastructure Layers
- [ ] Phase 6: Review Phase 5
- [ ] Phase 7: API Layer & Security
- [ ] Phase 8: Review Phase 7
- [ ] Phase 9: Integrations & Async
- [ ] Phase 10: Review Phase 9
- [ ] Phase 11: Observability & DevOps
- [ ] Phase 12: Testing & Quality Gate
- [ ] Phase 13: Final Review & Cleanup

## Detailed Tasks per Phase
[Expand each phase with specific tasks as you start it]
```

> For Docker image templates, see the stack-specific standards file (e.g. [`../java-springboot/STANDARDS.md`](../java-springboot/STANDARDS.md) § Docker Image Template).

---

## Application Configuration Structure

Organize configuration files by environment profile. All sensitive values must come from environment variables — no secrets in config files:

- **Common config** — default values shared across all environments
- **Dev profile** — local overrides (local DB, debug logging, relaxed security)
- **Prod profile** — production (all secrets via env vars, structured JSON logging)

Environment variable naming convention: `APP_DATASOURCE_URL`, `APP_SECURITY_JWT_SECRET`

> For the Spring Boot-specific file layout (`application.yml`, `application-dev.yml`, `logback-spring.xml`), see [`../java-springboot/STANDARDS.md`](../java-springboot/STANDARDS.md).

---

## API Naming & Versioning Conventions

| Convention | Standard |
|---|---|
| Base path | `/api/v1/{resource}` |
| Resources | Plural nouns: `/users`, `/orders`, `/reports` |
| Sub-resources | `/orders/{id}/items` |
| Actions (non-CRUD) | POST to verb: `/orders/{id}/cancel` |
| Query params | `camelCase`: `?pageSize=20&sortBy=createdAt` |
| Response envelope | None for single resource, `{ content, page, totalElements }` for lists |

---

## Logging Standards

Every log entry in production must include:
- `traceId` — OpenTelemetry W3C trace context
- `level`, `timestamp`, `logger`, `message`
- `userId` (where available, from security context)
- Never log: passwords, tokens, PII, full request bodies

> For Java + Spring Boot logging configuration (Logback JSON, MDC fields), see [`../java-springboot/STANDARDS.md`](../java-springboot/STANDARDS.md).
