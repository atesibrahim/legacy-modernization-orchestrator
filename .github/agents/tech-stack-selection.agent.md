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
> The skill owns the full technical DoD. This checklist is the **delivery acceptance gate** — all items must be ✅ before the orchestrator advances to Phase 3.

- [ ] User answered all questions for all in-scope tiers (or selected the default stack)
- [ ] `ai-driven-development/docs/tech_stack_selections.md` created with all confirmed choices
- [ ] No placeholder values remaining for any in-scope tier (all placeholders either resolved or explicitly deferred with an owner + phase deadline)
- [ ] § Common complete: Container/Deployment, CI/CD, Cloud Provider, Secret Management, Observability all populated
- [ ] § Backend complete (if in scope): Language/Framework, Database, Auth Provider all populated
- [ ] § Web Frontend complete (if in scope): Framework populated
- [ ] § Mobile complete (if any mobile target is in scope): Framework populated
- [ ] § Mobile complete (if Framework = Flutter or React Native): Minimum iOS Target and Minimum SDK populated
- [ ] § iOS complete (if native iOS is in scope): Minimum iOS Target populated
- [ ] § Android complete (if native Android is in scope): Minimum SDK populated
- [ ] Every custom/unfamiliar technology either has supporting documentation recorded in the `Notes` column **or** is marked as a placeholder with a phase-deadline note
- [ ] All downstream agents confirmed: they will read `tech_stack_selections.md` and not ask for tech choices again
