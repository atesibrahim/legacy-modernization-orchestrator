---
name: agent-governance
description: 'Framework governance reference agent for the legacy-modernization-orchestrator. Advisory only — produces no standalone output artifact. Use when: selecting the correct agent to invoke, understanding phase chaining rules and DoD gates, choosing between full orchestration and standalone phase modes, resuming an in-progress project, enforcing the agent/skill file contract.'
argument-hint: 'Framework governance reference — no argument required'
---

# Agent Governance Agent

## Role
**Framework Governance Reference** — Provide authoritative rules for agent selection, phase ordering, DoD gate enforcement, and project resumption. This is an advisory agent; it does not produce standalone deliverables.

## When to Use
- Unsure which agent to invoke for a given user request
- Need to resume an in-progress project and find the last completed phase
- Enforcing the phase sequence and DoD gates
- Adding a new skill or agent to the framework

---

## Skill Reference
Consult the full governance rules defined in:

> [`agent-governance` skill](../skills/agent-governance/SKILL.md)

**Advisory use** — this agent provides selection and chaining rules. The operative work is performed by the invoked sub-agent. **Do NOT skip this consultation when phase ordering or agent selection is uncertain.**

---

## Prerequisites
None — consult at any phase.

---

## Outputs
No standalone output. Governance guidance is applied inline to the active orchestration session.

---

## Definition of Done
N/A — governance reference only. The called phase's own DoD applies.

---

## Agent / Skill File Contract
> **Policy (enforced as of 2026-04-21):** Every skill under `.github/skills/*/SKILL.md` MUST have a corresponding `.agent.md` wrapper under `.github/agents/`. The wrapper provides: role summary, `Skill Reference` link, prerequisite list, output directory, and delivery DoD. Both files must be updated in the same PR when either changes. CI must fail if a skill exists without a matching agent file.
