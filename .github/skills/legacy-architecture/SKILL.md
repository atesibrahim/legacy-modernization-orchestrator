---
name: legacy-architecture
description: 'Legacy system architecture visualization and design skill. Act as a senior master architect. Use when: visualizing legacy architecture, creating system diagrams for legacy systems, understanding legacy component relationships, mapping legacy data flows, identifying architectural weaknesses, producing mermaid diagrams in HTML format, documenting legacy architectural constraints before redesign.'
argument-hint: 'Legacy system name or path to analysis report to base diagrams from'
---

# Legacy System Design & Visualization

## Role
**Senior Master Architect** — Reconstruct and visually document the legacy architecture with precision. Produce diagrams that make even the most chaotic legacy systems understandable.

## When to Use
- After completing legacy analysis (`analysing-legacy` skill)
- Need visual blueprints of the legacy system for team alignment
- Prior to designing the new target architecture

## Prerequisites
- Completed `legacy_analyse.md` from the `analysing-legacy` skill

## Output Location
Create folder `ai-driven-development/docs/legacy_architecture/` and produce:
- `legacy_architecture.md` — Architecture documentation
- `legacy_architecture.html` — Interactive visual diagrams (Mermaid.js)

> ⚠️ **Always overwrite these files completely** — never append. Use `create_file` or write the full content from scratch. Appending produces two HTML documents in one file, which breaks rendering.

---

## Procedure

### Step 1 — Identify Architectural Style
Determine the dominant architectural pattern:
- **Monolith**: Single deployable unit, shared DB
- **Layered (N-Tier)**: Presentation → Business → Data
- **Modular Monolith**: Internal modules with clear boundaries
- **SOA**: Service-oriented, WSDL/SOAP contracts
- **Legacy Distributed**: Multiple apps, shared DB (common anti-pattern)

Document the style formally and explain why it was likely chosen historically.

### Step 2 — Module Boundary Mapping
- List all modules/components/subsystems
- Identify responsibilities and ownership
- Mark which modules are **coupled**, **cohesive**, or **isolated**
- Identify **shared kernel** — code that is consumed by multiple modules
- Identify **cross-cutting concerns**: logging, auth, error handling

### Step 3 — Communication Pattern Analysis
Map how components communicate:
- **Synchronous**: HTTP, RPC, direct DB calls
- **Asynchronous**: JMS, MQ, file-based messaging
- **Database coupling**: Multiple services writing to same tables
- **Event-driven**: Any pub/sub or callback patterns

### Step 4 — Generate Visual Diagrams (HTML + Mermaid.js)
Produce all diagrams as an HTML file with embedded Mermaid.js.

Use the **HTML + Mermaid.js Page Template** from [STANDARDS.md](./STANDARDS.md) as the starting document for `legacy_architecture.html`.

Required diagram sections (match the template structure):
- **4.1** — High-Level Architecture (system boundary: clients, app server, DB, external)
- **4.2** — Component Dependency Diagram (all modules, coupling visible)
- **4.3** — Data Flow Diagram (request → processing → response)
- **4.4** — Authentication/Authorization Flow (login sequence)

> **Important**: Replace ALL placeholder node labels with the ACTUAL legacy system components discovered during analysis. The template is a starting point only.

### Step 4.1 — Validate the Generated HTML File

After writing `legacy_architecture.html`, run through the **File Creation Validation Checklist** from [STANDARDS.md](./STANDARDS.md) before proceeding.

Key checks for this skill's output:
- `<!DOCTYPE html>` appears exactly **once** (no accidental file append)
- All 4 required diagrams are present as `<pre class="mermaid">` blocks (not `<div>`)
- Every `subgraph` block is closed with `end`
- `alt … else … end` in sequenceDiagram is fully closed
- No `\n` inside quoted node labels — use `<br/>` for multi-line labels
- Node IDs contain no spaces or reserved keywords (`end`, `subgraph`)

If the file is missing or any check fails, **regenerate the entire file** from scratch using `create_file`. Do not attempt to patch individual lines.

### Step 5 — Identify Architectural Weaknesses
Document at least 3 critical weaknesses:

| # | Weakness | Evidence | Impact | Migration Risk |
|---|---|---|---|---|
| 1 | Shared database between modules | Multiple modules write to `USERS` table | High coupling | High |
| 2 | Business logic in stored procedures | 40+ stored procs with complex logic | Hard to test/migrate | High |
| 3 | Hard-coded configuration | DB URLs in source code | Security risk | Medium |

### Step 6 — Coupling Hotspot Map
Identify the tightest coupling points that will be hardest to untangle during migration:
- Shared DB tables with multiple consumers
- God classes/services with 20+ dependencies
- Circular module dependencies
- Framework-specific annotations bleeding into domain logic

---

## Output Format

### legacy_architecture.md
```markdown
# Legacy System Architecture

## 1. Architectural Style
## 2. Module Inventory
  - 2.1 Module List with Responsibilities
  - 2.2 Module Dependency Matrix
## 3. Communication Patterns
  - 3.1 Synchronous Calls
  - 3.2 Asynchronous Flows
  - 3.3 Database Coupling Points
## 4. Cross-Cutting Concerns
## 5. Architectural Weaknesses
## 6. Coupling Hotspots
## 7. Constraints for New Design
```

### legacy_architecture.html
Full Mermaid.js HTML file containing all diagrams from Step 4 above, customized to actual system components.

---

## Definition of Done (DoD)

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
- [ ] Diagram walkthrough completed with system design team
- [ ] Diagrams reviewed for accuracy against design decisions
- [ ] Mermaid syntax validated and diagrams render without errors in browser

---

## Next Skill
When legacy architecture is fully visualized, proceed to [`target-architecture`](../target-architecture/SKILL.md) to design the target architecture.
