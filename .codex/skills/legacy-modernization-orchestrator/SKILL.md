---
name: legacy-modernization-orchestrator
description: 'Master orchestrator for complete end-to-end legacy system modernization from analysis to go-live. Trigger phrases: "modernize legacy system", "full legacy redesign", "end-to-end modernization project", "start legacy modernization workflow", "run all modernization phases", "orchestrate full redesign from legacy to production-ready", "legacy system transformation". Executes phases in strict order with DoD gates: Phase 1 (analysis) → Phase 2 (legacy diagrams) → Phase 2.5 (tech stack selection) → Phase 3 (target architecture) → Phase 4a–4g (optional parallel: UI/UX, backend, frontend, iOS, Android, data migration, security review) → Phase 5 (comparison) → Phase 6 (final validation + go/no-go). Use standalone sub-agents (legacy-analysis, target-architecture, etc.) when you only need a single phase, not the full workflow.'
argument-hint: 'Legacy project path or name to begin full end-to-end redesign workflow'
---

# legacy-modernization-orchestrator

## Role
Master Orchestrator — Execute all redesign phases in strict order, validate DoD gates, coordinate all other agents end-to-end.

## Argument
Legacy project path or name to begin full end-to-end redesign workflow.


## Instructions
Read `.github/agents/legacy-modernization-orchestrator.agent.md` in full before taking any action. Follow every phase and DoD gate exactly. Read each phase's SKILL.md before executing that phase.
