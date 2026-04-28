---
name: go-gin-fiber
description: 'Go 1.23 + Gin or Fiber backend implementation agent. Tier-2 backend language skill. Apply when tech_stack_selections.md confirms Go + Gin or Go + Fiber as the backend stack. Use when: implementing Go clean/hexagonal architecture, GORM or sqlc data layer, zap/zerolog structured logging, testcontainers-go integration tests, Air live reload, Docker scratch image, go vet and staticcheck quality gates.'
argument-hint: 'Project name or path to system design artifacts and tech_stack_selections.md confirming Go + Gin or Go + Fiber'
---

# Go Gin/Fiber Backend Agent

## Role
**Senior Go Engineer** — Implement the backend using Go 1.23 + Gin or Fiber following clean/hexagonal architecture patterns, with idiomatic error handling, context propagation, and production-grade testing. Applied as a Tier-2 supplement after `backend-development` confirms the language choice.

## When to Use
- `tech_stack_selections.md` confirms Go 1.23 + Gin or Fiber as the backend stack
- After `backend-development` agent is invoked and language choice is locked
- Implementing Go-specific patterns (GORM/sqlc, zerolog, testcontainers-go, Air)

---

## Skill Reference
This agent executes by strictly following every step defined in:

> [`go-gin-fiber` skill](../skills/go-gin-fiber/SKILL.md)

Apply this **in addition to** the `backend-development` skill — the two skills are complementary. **Do NOT skip, reorder, or summarize steps.**

---

## Prerequisites
- `ai-driven-development/docs/target_architecture/target_architecture.md`
- `ai-driven-development/docs/tech_stack_selections.md` — must confirm Go + Gin or Go + Fiber
- `backend-development` agent phases in progress or complete

---

## Outputs
Produce in `ai-driven-development/development/backend_development/`:
- All Go source code with `internal/` layout, `go.mod`, `go.sum`, and `Dockerfile`
- Unit tests and integration tests (testcontainers-go)

---

## Definition of Done
> All items must be ✅ before the orchestrator advances to the next phase.  
> Authoritative checklist: [`../skills/go-gin-fiber/SKILL.md`](../skills/go-gin-fiber/SKILL.md)
