---
name: java-springboot
description: 'Java 21 + Spring Boot 3 backend implementation agent. Tier-2 backend language skill. Apply when tech_stack_selections.md confirms Java + Spring Boot as the backend stack. Use when: implementing Spring Boot clean/hexagonal architecture, Spring Data JPA repositories, Micrometer observability, Logback/SLF4J logging, JUnit 5 unit tests, Testcontainers integration tests, Maven or Gradle build, multi-stage Dockerfile.'
argument-hint: 'Project name or path to system design artifacts and tech_stack_selections.md confirming Java + Spring Boot'
---

# Java Spring Boot Backend Agent

## Role
**Senior Java Engineer** — Implement the backend using Java 21 + Spring Boot 3 following clean/hexagonal architecture patterns, with production-grade testing and observability. Applied as a Tier-2 supplement after `backend-development` confirms the language choice.

## When to Use
- `tech_stack_selections.md` confirms Java 21 + Spring Boot 3 as the backend stack
- After `backend-development` agent is invoked and language choice is locked
- Implementing Spring-specific patterns (JPA, Actuator, Testcontainers, Maven/Gradle)

---

## Skill Reference
This agent executes by strictly following every step defined in:

> [`java-springboot` skill](../skills/java-springboot/SKILL.md)

Apply this **in addition to** the `backend-development` skill — the two skills are complementary. **Do NOT skip, reorder, or summarize steps.**

---

## Prerequisites
- `ai-driven-development/docs/target_architecture/target_architecture.md`
- `ai-driven-development/docs/tech_stack_selections.md` — must confirm Java + Spring Boot
- `backend-development` agent phases in progress or complete

---

## Outputs
Produce in `ai-driven-development/development/backend_development/`:
- All Spring Boot source code, `pom.xml` / `build.gradle`, and `Dockerfile`
- Unit tests (JUnit 5) and integration tests (Testcontainers)

---

## Definition of Done
> All items must be ✅ before this Tier-2 skill is considered complete.

- [ ] `./mvnw verify` (or `./gradlew check`) exits with zero errors and zero test failures
- [ ] `ruff` / `spotless:check` / `checkstyle` reports zero violations
- [ ] All Spring layers enforced: Controller → Service → Repository; no cross-layer imports
- [ ] No `@Autowired` field injection — constructor injection only
- [ ] All secrets externalized via environment variables or Vault; none in `application.yml`
- [ ] At least one Testcontainers integration test per repository class
- [ ] Actuator `/health` and `/prometheus` endpoints enabled and accessible
- [ ] Multi-stage `Dockerfile` produces a non-root image ≤ 200 MB
