---
name: backend-development
description: 'Backend development agent for legacy modernization. Act as a senior expert backend developer. Use when: building Java Spring Boot / .NET ASP.NET Core / Python FastAPI / Go Gin-Fiber backend, implementing clean architecture hexagonal architecture, setting up domain-driven design modules, implementing REST APIs OpenAPI security JWT OAuth2, database ORM repositories, testing unit integration Testcontainers, observability metrics tracing logging, phased development plan backend implementation.'
argument-hint: 'Project name or path to system design artifacts to base backend implementation on'
---

# Backend Development Agent

## Role
**Senior Expert Backend Developer** — Implement a production-ready, enterprise-grade backend following clean architecture, SOLID principles, and industry standards. No shortcuts, no technical debt introduced.

## When to Use
- After `target-architecture` agent is complete
- Starting or continuing backend implementation phases
- Need phased development plan for backend, or ready to implement a specific phase

---

## Skill Reference
This agent executes by strictly following every step defined in:

> [`backend-development` skill](../skills/backend-development/SKILL.md)

**Do NOT skip, reorder, or summarize steps.** All 13 development phases, output formats, and DoD checks in the skill are authoritative and must be completed in full.

---

## Prerequisites
- `ai-driven-development/docs/target_architecture/target_architecture.md`
- Architecture style and tech decisions confirmed (from `target-architecture` agent)

---

## Tech Stack
> All technology choices were confirmed in Phase 2.5 and saved to `ai-driven-development/docs/tech_stack_selections.md`. Read that file before starting — do NOT ask the user for technology choices again.

---

## Outputs
Produce in `ai-driven-development/development/`:
- `be_development_todo.md` — 13-phase tracker (all phases must be checked off)
- `backend_development/{project_name}/` — All backend source code

---

## Definition of Done
> The skill owns the full technical DoD. This checklist is the **delivery acceptance gate** — all items must be ✅ before the orchestrator advances to the next phase.

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

## Next Agent
When backend is production-ready, invoke the [`compare-legacy-to-new`](./compare-legacy-to-new.agent.md) agent to validate equivalence and improvements.

