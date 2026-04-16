# Backend Development Standards

These are the **non-negotiable, project-independent** standards for all backend implementations.
The SKILL.md procedure references these. Do not deviate — create an ADR if a justified exception is needed.

---

## Architecture Rules (Non-Negotiable)

- **Clean Architecture layers**: `Controller → Service → Repository → Entity` — strict, no skipping
- **Dependency Inversion**: Use interfaces, inject via constructor, never field injection
- **No business logic** in controllers, entities, or repositories
- **No raw SQL** — Spring Data JPA repositories or named queries only
- **No `@Autowired` on fields** — constructor injection only
- **`@PreAuthorize`** for authorization — never inline role checks in business logic
- **No hard-coded secrets** — all configuration via environment variables or Vault
- **No `DEBUG_MODE` flags** — use Spring profiles (`dev`, `test`, `prod`)
- **Lombok**: Use minimally — `@Getter`, `@Builder`, `@Slf4j` preferred over `@Data`
- **No over-engineering** — YAGNI; implement only what is needed

---

## Project Folder Structure (Maven)

```
src/main/java/com/{company}/{project}/
├── {module}/
│   ├── domain/         ← Entities, Value Objects, Repository interfaces
│   ├── application/    ← Service interfaces, Use cases, DTOs
│   ├── infrastructure/ ← JPA Repositories, external clients, config
│   └── api/            ← REST Controllers, request/response mappers
├── shared/             ← Cross-cutting: exceptions, utils, audit
└── Application.java
```

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

---

## Docker Image Template

```dockerfile
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
COPY target/app.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Rules:
- Non-root user (`appuser`) — mandatory for security
- Alpine base — minimal attack surface
- No `latest` tags — always pin base image version
- `ENV JAVA_OPTS=""` — allow JVM tuning without image rebuild

---

## Application Configuration Structure

```
src/main/resources/
├── application.yml         ← Common config (no secrets, no env-specific values)
├── application-dev.yml     ← Local dev overrides (H2 / local DB, debug logging)
├── application-prod.yml    ← Production (all sensitive values via env vars)
└── logback-spring.xml      ← Structured JSON logging for prod, console for dev
```

Environment variable naming convention: `APP_DATASOURCE_URL`, `APP_SECURITY_JWT_SECRET`

---

## Security Configuration Template

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)        // stateless API
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**", "/actuator/health").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```

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

```xml
<!-- logback-spring.xml — production profile -->
<!-- JSON structured output with correlation fields -->
<!-- Required MDC fields: traceId, spanId, userId, requestId -->
```

Every log entry in production must include:
- `traceId` — OpenTelemetry W3C trace context
- `level`, `timestamp`, `logger`, `message`
- `userId` (where available, from security context)
- Never log: passwords, tokens, PII, full request bodies
