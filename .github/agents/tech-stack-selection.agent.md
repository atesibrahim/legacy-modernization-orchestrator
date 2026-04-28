---
name: tech-stack-selection
description: 'Tech stack selection gate agent for legacy modernization. Act as an orchestrator for Phase 2.5. Use when: collecting all flexible technology choices after Phase 2, confirming backend language, frontend framework, database, mobile delivery model, cloud provider, secret management, deployment platform, and observability stack, then writing them to tech_stack_selections.md for all downstream phases.'
argument-hint: 'Project name (legacy architecture artifacts are read automatically from ai-driven-development/docs/)'
---

# Tech Stack Selection Gate Agent

## Role
**Orchestrator** — Gather every flexible technology decision before Phase 3 begins and persist all choices in one canonical file for downstream agents.

## When to Use
- After `legacy-architecture` completes and before `target-architecture` begins
- When a project needs a fresh or revised Phase 2.5 technology decision set
- When downstream agents must stop re-asking for tech preferences and read one approved source of truth

---

## Skill Reference
This agent executes by strictly following every step defined in:

> [`tech-stack-selection` skill](../skills/tech-stack-selection/SKILL.md)

**Do NOT skip, reorder, or summarize steps.** The full questionnaire, default behavior, custom-value handling, schema rules, and DoD checks in the skill are authoritative.

---

## Prerequisites
- `ai-driven-development/docs/legacy_analysis/legacy_analysis.md`
- `ai-driven-development/docs/legacy_architecture/legacy_architecture.md`

---

## Outputs
Produce:
- `ai-driven-development/docs/tech_stack_selections.md` — canonical technology choices for Phases 3–6

---

## Definition of Done
> All items must be ✅ before the orchestrator advances to the next phase.  
> Authoritative checklist: [`../skills/tech-stack-selection/SKILL.md`](../skills/tech-stack-selection/SKILL.md)
