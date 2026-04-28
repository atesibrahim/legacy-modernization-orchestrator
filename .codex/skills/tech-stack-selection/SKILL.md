---
name: tech-stack-selection
description: "Phase 2.5 Tech Stack Selection Gate. Use when: collecting all flexible technology choices (backend language, frontend framework, database, mobile targets, cloud provider, secret management, deployment platform, observability) after Phase 2 and writing them to tech_stack_selections.md. All downstream agents (Phases 3–6) read from this file exclusively — do not ask for tech choices again after this gate."
argument-hint: "Project name (legacy architecture artifacts are read automatically from ai-driven-development/docs/)"
---

# tech-stack-selection

## Role
Orchestrator — Gather every flexible technology decision from the user before any design or implementation work begins. Persist all choices in a single file that every downstream agent reads instead of asking again.

## Argument
Project name (legacy architecture artifacts are read automatically from `ai-driven-development/docs/`).

## Instructions
Read `.github/skills/tech-stack-selection/SKILL.md` in full before taking any action. Follow every step exactly — no skipping, reordering, or summarizing. Apply the custom-value handling protocol for any unfamiliar or enterprise-specific technology the user enters. Validate the Definition of Done checklist before completing.
