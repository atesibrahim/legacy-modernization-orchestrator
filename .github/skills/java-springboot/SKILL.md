---
name: java-springboot
description: 'Get best practices for developing applications with Spring Boot.'
---

# Spring Boot Best Practices

Your goal is to help me write high-quality Spring Boot applications by following established best practices.

## Project Setup & Structure

- **Build Tool:** Use Maven (`pom.xml`) or Gradle (`build.gradle`) for dependency management.
- **Starters:** Use Spring Boot starters (e.g., `spring-boot-starter-web`, `spring-boot-starter-data-jpa`) to simplify dependency management.
- **Package Structure:** Organize code by feature/domain (e.g., `com.example.app.order`, `com.example.app.user`) rather than by layer (e.g., `com.example.app.controller`, `com.example.app.service`).

## Dependency Injection & Components

- **Constructor Injection:** Always use constructor-based injection for required dependencies. This makes components easier to test and dependencies explicit.
- **Immutability:** Declare dependency fields as `private final`.
- **Component Stereotypes:** Use `@Component`, `@Service`, `@Repository`, and `@Controller`/`@RestController` annotations appropriately to define beans.

## Configuration

- **Externalized Configuration:** Use `application.yml` (or `application.properties`) for configuration. YAML is often preferred for its readability and hierarchical structure.
- **Type-Safe Properties:** Use `@ConfigurationProperties` to bind configuration to strongly-typed Java objects.
- **Profiles:** Use Spring Profile (`application.yml`)
- **Secrets Management:** Do not hardcode secrets. Use environment variables, or a dedicated secret management tool like Openshift Secrets.

## Web Layer (Controllers)

- **RESTful APIs:** Design clear and consistent RESTful endpoints.
- **DTOs (Data Transfer Objects):** Use DTOs to expose and consume data in the API layer. Do not expose JPA entities directly to the client.
- **Validation:** Use Java Bean Validation (JSR 380) with annotations (`@Valid`, `@NotNull`, `@Size`) on DTOs to validate request payloads.
- **Error Handling:** Implement a global exception handler using `@ControllerAdvice` and `@ExceptionHandler` to provide consistent error responses.

## Service Layer

- **Business Logic:** Encapsulate all business logic within `@Service` classes.
- **Statelessness:** Services should be stateless.
- **Transaction Management:** Use `@Transactional` on service methods to manage database transactions declaratively. Apply it at the most granular level necessary.

## Data Layer (Repositories)

- **Spring Data JPA:** Use Spring Data JPA repositories by extending `JpaRepository` or `CrudRepository` for standard database operations.
- **Custom Queries:** For complex queries, use `@Query` or the JPA Criteria API.
- **Projections:** Use DTO projections to fetch only the necessary data from the database.

## Logging

- **SLF4J:** Use the SLF4J API for logging.
- **Logger Declaration:** `private static final Logger logger = LoggerFactory.getLogger(MyClass.class);`
- **Parameterized Logging:** Use parameterized messages (`logger.info("Processing user {}...", userId);`) instead of string concatenation to improve performance.

## Testing

- **Unit Tests:** Write unit tests for services and components using JUnit 5 and a mocking framework like Mockito.
- **Integration Tests:** Use `@SpringBootTest` for integration tests that load the Spring application context.
- **Test Slices:** Use test slice annotations like `@WebMvcTest` (for controllers) or `@DataJpaTest` (for repositories) to test specific parts of the application in isolation.
- **Testcontainers:** Consider using Testcontainers for reliable integration tests with real databases, message brokers, etc.

## Security

- **Spring Security:** Use Spring Security for authentication and authorization.
- **Password Encoding:** Always encode passwords using a strong hashing algorithm like BCrypt.
- **Input Sanitization:** Prevent SQL injection by using Spring Data JPA or parameterized queries. Prevent Cross-Site Scripting (XSS) by properly encoding output.

---

## Backend Development — Java 21 + Spring Boot 3.5 Implementation

> These are the Java-specific implementation steps that complement [`backend-development/SKILL.md`](../backend-development/SKILL.md). Apply these when `tech_stack_selections.md` confirms Java + Spring Boot as the backend stack.

See also: [`STANDARDS.md`](./STANDARDS.md) for Java-specific architecture rules, Maven folder structure, and Docker image template.

---

### Phase 1 — Project Setup (Java / Spring Boot)

**`pom.xml`** — required dependencies:
- `spring-boot-starter-parent` 3.5+ as parent
- `spring-boot-starter-web`
- `spring-boot-starter-security`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-validation`
- `spring-boot-starter-actuator`
- `springdoc-openapi-starter-webmvc-ui`
- `lombok` + `mapstruct`
- Java 21 compiler settings (`maven-compiler-plugin` with `release=21`)
- Profiles: `dev`, `test`, `prod`

**Configuration files**:
- `application.yml` — common config
- `application-dev.yml` — local dev overrides (H2 or Docker DB, debug logging)
- `application-prod.yml` — production (all secrets via env vars, JSON logging)

---

### Phase 5 — Application & Infrastructure Layers (Java)

**Application Layer**:
- Use case / Service implementation classes annotated with `@Service`
- DTOs with Jakarta Validation (`@NotNull`, `@Size`, etc.) on request objects
- MapStruct mappers (`@Mapper(componentModel = "spring")`)
- Transaction boundaries at service layer with `@Transactional`

**Infrastructure Layer**:
- JPA repository implementations extending `JpaRepository`
- External service clients using `RestClient` or `WebClient`
- Messaging producers/consumers (Kafka `@KafkaListener` / RabbitMQ `@RabbitListener`)
- Caching with `@EnableCaching` + `@Cacheable`

---

### Phase 7 — Spring Security Configuration

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    // SecurityFilterChain bean
    // JWT filter (OncePerRequestFilter)
    // CORS configuration (CorsConfigurationSource)
    // CSRF: disabled for stateless APIs
}
```

**Auth Options**:
- **JWT + LDAP**: `LdapAuthenticationProvider` + JWT issuance on success
- **Keycloak/OAuth2**: Spring Security OAuth2 Resource Server + JWT decoder
- **Both**: LDAP for legacy clients, OAuth2 for new clients (migration period)

**Authorization**:
```java
@PreAuthorize("hasRole('ADMIN') or hasPermission(#id, 'READ')")
public ItemDto getItem(Long id) { ... }
```

---

### Phase 9 — Integrations (Java)

- **Scheduling**: `@Scheduled` or Spring Batch — use `ShedLock` for distributed job locking
- **SSH**: JSch library wrapped in a service layer
- **FTP**: Apache Commons Net wrapped in a service layer
- **Email**: `JavaMailSender` with Thymeleaf or Freemarker templates

---

### Phase 11 — Observability (Java)

**Logging** (`logback-spring.xml`):
- JSON structured output in `prod` profile (`logstash-logback-encoder`)
- Include `traceId`, `spanId`, `userId` MDC fields for correlation

**Metrics**: Micrometer → exposed at `/actuator/prometheus`

**Tracing**: OpenTelemetry Java Agent attached as `-javaagent:opentelemetry-javaagent.jar`

**Health probes** (Actuator):
- `/actuator/health` — liveness
- `/actuator/health/readiness` — readiness
- Custom `HealthIndicator` beans for DB and messaging

**Docker**: use the template in [`STANDARDS.md`](./STANDARDS.md) § Docker Image Template.

---

### Phase 12 — Quality Gate (Java)

- **Coverage**: JaCoCo Maven plugin — target ≥ 70% line coverage (`mvn verify`)
- **Dependency security**: `mvn dependency-check:check` (OWASP Dependency Check plugin) — fail on CVSS ≥ 7
- **N+1 queries**: Enable `spring.jpa.show-sql=true` in test profile; analyse Hibernate SQL output
- **Integration tests**: `@SpringBootTest` + `MockMvc` for API layer; `@DataJpaTest` for repositories; Testcontainers for real DB