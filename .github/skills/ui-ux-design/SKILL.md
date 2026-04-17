---
name: ui-ux-design
description: 'UI/UX design skill for legacy system redesign. Act as a senior master UI/UX developer. Use when: designing user interfaces for modernized application, creating wireframes mockups design systems, defining user journeys for web React and mobile iOS Android, applying WCAG accessibility standards, building responsive mobile-first design, producing HTML design previews, creating component design system tokens typography colors.'
argument-hint: 'Application name and list of primary user roles or workflows to design for'
---

# UI/UX Design for Redesign

## Role
**Senior Master UI/UX Developer** — Design a modern, accessible, and delightful user experience that addresses all the pain points of the legacy UI. Evidence-based design grounded in user goals, not legacy screen layouts.

## When to Use
- After `target-architecture` skill defines service boundaries and user-facing APIs
- Prior to frontend and mobile development
- Need wireframes, design system, or UX specifications

## Prerequisites
- `ai-driven-development/docs/target_architecture/target_architecture.md`
- Legacy screen inventory (from `legacy-analysis`)

## Output Location
Create folder `ai-driven-development/docs/ui_design/` and produce:
- `ui_ux_pages.md` — Design documentation, component specs, UX decisions
- `ui_ux_pages.html` — Interactive HTML wireframes/layouts using Mermaid.js and HTML/CSS

---

## Procedure

### Step 1 — User Research & Journey Mapping
Identify all user types and their goals:

| User Role | Primary Goals | Pain Points (Legacy) | Key Screens |
|---|---|---|---|
| [Role A] | [Goal 1, Goal 2] | [Pain 1, Pain 2] | [Screen list] |
| [Role B] | [Goal] | [Pain] | [Screen list] |

For each primary role, document the **User Journey**:
```
[Trigger] → [Entry Point] → [Core Action 1] → [Core Action 2] → [Success State / Exit]
```

### Step 2 — Information Architecture (IA)
Design the navigation structure:

- **Site Map**: Top-level navigation hierarchy
- **Screen Inventory**: Complete list of all screens/pages required
- **Navigation Patterns**: Sidebar / Top-nav / Bottom-nav (mobile) / Breadcrumbs
- **Search & Filter**: Where and how users find content

Produce a site map diagram:
```html
<!-- Include in ui_ux_pages.html -->
<pre class="mermaid">
graph TD
  A[Login] --> B[Dashboard]
  B --> C[Module A]
  B --> D[Module B]
  B --> E[Settings]
  C --> C1[List View]
  C --> C2[Detail View]
  C --> C3[Create / Edit Form]
  D --> D1[Reports]
  D --> D2[Analytics]
</pre>
```

### Step 3 — Design System Definition
Define the design token foundation. Use the **CSS Design Tokens** from [STANDARDS.md](./STANDARDS.md) as the starting point — customize the color palette for the project's brand.

Decisions to make:
- Brand primary color (replace `#3b82f6` default)
- Font family (default: `'Segoe UI', Arial, sans-serif`)
- Any project-specific semantic colors beyond success/warning/error

Document finalized token values in `ui_ux_pages.md` under `## Design Tokens`.

### Step 4 — Component Inventory
Define the reusable component library:

**Foundation Components**
- Button (primary, secondary, ghost, destructive, loading states)
- Input / Textarea / Select / Checkbox / Radio / Toggle
- Badge / Tag / Chip
- Avatar
- Icon system

**Layout Components**
- Page Layout (sidebar + content)
- Card / Panel
- Modal / Drawer / Popover
- Table (with sorting, pagination, selection)
- Tabs / Accordion

**Domain Components** (project-specific, defined per application)
- List items with actions
- Status indicators
- Data visualizations (charts, KPIs)
---

### Step 4.5 — Screen Decomposition for Large Applications

> **Run after Step 2 (IA) produces the full screen inventory.** For applications with many screens, batching prevents context overload and enables parallel wireframe production.

**Measure:**
- Count total screens/pages from the site map produced in Step 2

**Choose a strategy:**

| Scale | Threshold | Strategy |
|---|---|---|
| **Small** | ≤ 8 screens | Produce all wireframes in Step 5 sequentially |
| **Medium** | 9–20 screens | Group into 2–3 feature batches; each batch as a sub-task |
| **Large** | 20+ screens | Group by user role or domain area; each group = one parallel sub-task |

**Grouping approach (medium/large):**

Assign every screen from the inventory to a named batch. Example grouping for a typical enterprise app:

| Batch | Area | Example Screens |
|---|---|---|
| Batch 1 | Auth & Onboarding | Login, Register, Forgot Password, Profile Setup |
| Batch 2 | Core Domain A | List View, Detail View, Create/Edit Form |
| Batch 3 | Core Domain B | Reports, Dashboard, KPI Board |
| Batch 4 | Admin / Settings | User Management, Configuration, Audit Log |

Each batch sub-task:
1. Receives: the batch screen list + design tokens + component inventory from Steps 3+4
2. Produces: HTML wireframe sections for its screens (matching `ui_ux_pages.html` structure)
3. This agent merges all batch outputs into a single `ui_ux_pages.html` file

> **Design system (Steps 3+4) is not parallelizable** — it must complete fully before any wireframe batch starts, as every batch relies on shared tokens and components.

Record the batch plan (screen → batch assignment) in `ui_ux_pages.md` under `## Screen Decomposition Plan` before starting any batch.

---
### Step 5 — Wireframes for Critical Screens
For each critical screen, produce an HTML wireframe in `ui_ux_pages.html`.

Start from the **HTML Wireframe Page Template** in [STANDARDS.md](./STANDARDS.md). The template includes:
- Full CSS (layout helpers, component styles, Mermaid.js setup)
- Pre-built Dashboard wireframe (sidebar + KPI cards + table)
- Pre-built Login screen wireframe
- IA diagram placeholder
- User journey map placeholder

For each additional screen from the screen inventory:
1. Add a new `<h2>Screen N: [Screen Name]</h2>` section
2. Add a `<div class="wireframe">` block with the appropriate layout
3. Use the CSS classes from the template (`card`, `table-mock`, `btn`, `badge`, `form-group`, etc.)
4. Document states: empty, loading, error, and success


### Step 6 — Accessibility (WCAG 2.1 AA Compliance)
Validate against:
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation**: All interactive elements reachable via Tab, actionable via Enter/Space
- **Screen Reader Support**: Semantic HTML, ARIA labels, alt text for images
- **Focus Management**: Visible focus rings, modal focus traps
- **Error Communication**: Error messages not conveyed by color alone

### Step 7 — Responsive Design Breakpoints
Apply the **Responsive Design Breakpoints** and adaptation rules from [STANDARDS.md](./STANDARDS.md). Update the adaptation table with project-specific screen behavior for each breakpoint.

---

## Definition of Done (DoD)

### UX Quality
- [ ] User journeys cover all primary use cases identified in analysis
- [ ] Friction points from legacy UI explicitly addressed
- [ ] Navigation structure logical and tested with at least 1 real user

### Design System
- [ ] Design tokens defined (colors, typography, spacing)
- [ ] Component inventory documented
- [ ] Consistent naming conventions (BEM or component-based)

### Wireframes
- [ ] All critical screens wireframed in HTML
- [ ] Mobile and desktop views specified
- [ ] States documented (empty, loading, error, success)

### Accessibility
- [ ] Color contrast ratios verified (WCAG AA minimum)
- [ ] Keyboard navigation path documented for each screen
- [ ] ARIA roles/labels specified for custom components

### Validation
- [ ] Design reviewed by product owner / stakeholder
- [ ] At least 1 usability test or design walkthrough conducted

---

## Next Skill
Proceed to [`frontend-development`](../frontend-development/SKILL.md) to implement the design system and screens. Run in parallel with [`backend-development`](../backend-development/SKILL.md).
