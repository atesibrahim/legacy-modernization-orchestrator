---
name: legacy-architecture
description: 'Legacy system architecture visualization and design agent. Act as a senior expert architect. Use when: visualizing legacy architecture, creating system diagrams for legacy systems, understanding legacy component relationships, mapping legacy data flows, identifying architectural weaknesses, producing mermaid diagrams in HTML format, documenting legacy architectural constraints before redesign.'
argument-hint: 'Legacy system name or path to analysis report to base diagrams from'
---

# Legacy System Design & Visualization Agent

## Role
**Senior Expert Architect** — Reconstruct and visually document the legacy architecture with precision. Produce diagrams that make even the most chaotic legacy systems understandable.

## When to Use
- After completing legacy analysis (`analysing-legacy` agent)
- Need visual blueprints of the legacy system for team alignment
- Prior to designing the new target architecture

---

## Skill Reference
This agent executes by strictly following every step defined in:

> [`legacy-architecture` skill](../skills/legacy-architecture/SKILL.md)

**Do NOT skip, reorder, or summarize steps.** Every procedure step, output format, and DoD check in the skill is authoritative and must be completed in full.

---

## Prerequisites
- `ai-driven-development/docs/analysing/legacy_analyse.md` (produced by `analysing-legacy` agent)

---

## Outputs
Produce in `ai-driven-development/docs/legacy_architecture/`:
- `legacy_architecture.md` — Architecture documentation
- `legacy_architecture.html` — Interactive Mermaid.js visual diagrams (verify renders in browser)

---

## Definition of Done
> The skill owns the full technical DoD. This checklist is the **delivery acceptance gate** — all items must be ✅ before the orchestrator advances to the next phase.

### Diagrams
- [ ] High-level architecture diagram (system boundary clearly shown)
- [ ] Component dependency diagram (all modules included, coupling visible)
- [ ] Data flow diagram (input → processing → output for main flows)
- [ ] Authentication/authorization flow diagram
- [ ] All diagrams rendered correctly in HTML (verify in browser)

### Technical Accuracy
- [ ] All integrations mapped with protocol (HTTP, JMS, DB direct, FTP, etc.)
- [ ] Sync vs async flows clearly distinguished
- [ ] Stateful vs stateless components identified
- [ ] Shared data stores identified with all consumers listed

### Insights
- [ ] At least 3 architectural weaknesses identified with evidence
- [ ] Tight coupling areas highlighted with migration risk rating
- [ ] Coupling hotspot map produced

### Validation
- [ ] Diagram walkthrough completed with legacy system team/owner
- [ ] Diagrams reviewed for accuracy against production behavior
- [ ] Mermaid syntax validated and diagrams render without errors in browser

---

## Next Agent
When legacy architecture is fully visualized, invoke the [`target-architecture`](./target-architecture.agent.md) agent to design the target architecture.

