---
name: ui-ux-design
description: 'UI/UX design skill for legacy system redesign. Act as a senior master UI/UX developer. Use when: designing user interfaces for modernized application, creating wireframes mockups design systems, defining user journeys for web React and mobile iOS Android, applying WCAG accessibility standards, building responsive mobile-first design, producing HTML design previews, creating component design system tokens typography colors.'
argument-hint: 'Application name and list of primary user roles or workflows to design for'
version: 1.0.0
last_reviewed: 2026-04-27
status: Active
---

# UI/UX Design for Redesign

## Role
**Senior Master UI/UX Developer** — Design a modern, accessible, and delightful user experience that addresses all the pain points of the legacy UI. Evidence-based design grounded in user goals, not legacy screen layouts.

## When to Use
- After `target-architecture` skill defines service boundaries and user-facing APIs
- Prior to frontend and mobile development
- Need wireframes, design system, or UX specifications

## Prerequisites (Preflight)
Before starting, verify the following artifacts exist:

| Artifact | Expected Path | Required? |
|---|---|---|
| Target architecture | `ai-driven-development/docs/target_architecture/target_architecture.md` | Always |
| Legacy screen inventory | `ai-driven-development/docs/legacy_analysis/legacy_analysis.md` (Step 1.5 — UI Screen Inventory) | If Frontend or Mobile in scope |

**If any required artifact is missing**: Stop. Report which artifact is missing, which phase produces it (Phase 3: `target-architecture`, Phase 1: `legacy-analysis`), and offer: (a) Run the prerequisite phase now, (b) Provide the artifact path manually.

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

### Step 8 — Design-to-Code Handoff

Produce handoff artifacts that allow frontend/mobile developers to implement the design system without ambiguity.

#### 8.1 — Design Tokens (`tokens.json`)
Export all design tokens in **W3C Design Token Community Group format**:

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "primary": { "$value": "#2563EB", "$type": "color" },
    "primary-hover": { "$value": "#1D4ED8", "$type": "color" },
    "error": { "$value": "#DC2626", "$type": "color" },
    "surface": { "$value": "#FFFFFF", "$type": "color" },
    "surface-muted": { "$value": "#F9FAFB", "$type": "color" },
    "on-surface": { "$value": "#111827", "$type": "color" }
  },
  "typography": {
    "font-family-sans": { "$value": "Inter, system-ui, sans-serif", "$type": "fontFamily" },
    "font-size-base": { "$value": "16px", "$type": "dimension" },
    "font-size-sm": { "$value": "14px", "$type": "dimension" },
    "font-weight-regular": { "$value": 400, "$type": "fontWeight" },
    "font-weight-medium": { "$value": 500, "$type": "fontWeight" },
    "font-weight-bold": { "$value": 700, "$type": "fontWeight" },
    "line-height-normal": { "$value": 1.5, "$type": "number" }
  },
  "spacing": {
    "xs": { "$value": "4px", "$type": "dimension" },
    "sm": { "$value": "8px", "$type": "dimension" },
    "md": { "$value": "16px", "$type": "dimension" },
    "lg": { "$value": "24px", "$type": "dimension" },
    "xl": { "$value": "32px", "$type": "dimension" }
  },
  "border-radius": {
    "sm": { "$value": "4px", "$type": "dimension" },
    "md": { "$value": "8px", "$type": "dimension" },
    "full": { "$value": "9999px", "$type": "dimension" }
  },
  "shadow": {
    "card": { "$value": "0 1px 3px rgba(0,0,0,0.1)", "$type": "shadow" }
  }
}
```

Save to: `ai-driven-development/docs/ui_design/tokens.json`

#### 8.2 — Component Prop API Definition
For each component in the design system, define the prop API contract that developers must implement:

```markdown
## Component: Button

### Props
| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | No | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | No | Size preset |
| `label` | `string` | — | Yes | Visible button text |
| `disabled` | `boolean` | `false` | No | Disables interaction |
| `loading` | `boolean` | `false` | No | Shows spinner, disables click |
| `icon` | `string \| undefined` | `undefined` | No | Icon name from icon set |
| `onClick` | `() => void` | — | No | Click handler |

### States
- default, hover, active, focused (keyboard), disabled, loading

### Accessibility
- `role="button"`, `aria-disabled` when disabled, `aria-label` when icon-only
```

Produce a component prop API definition for every component in the design system inventory. Save to `ai-driven-development/docs/ui_design/component_api.md`.

#### 8.3 — Developer Handoff Stubs

Produce handoff stubs for **every confirmed client target** (read from `tech_stack_selections.md`). Only generate the paths applicable to the confirmed scope.

---

**8.3a — Web Frontend (React / Vue / Angular / Svelte): Storybook Story Stubs**

For each component, provide a Storybook story stub that developers can fill in. Save to `ai-driven-development/docs/ui_design/storybook_stubs/`.

```typescript
// src/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { label: 'Click me', variant: 'primary' } };
export const Disabled: Story = { args: { label: 'Disabled', disabled: true } };
export const Loading: Story = { args: { label: 'Saving...', loading: true } };
```

Also produce a token export file (`ai-driven-development/docs/ui_design/tokens_web.css`) with CSS custom properties generated from `tokens.json`.

---

**8.3b — iOS (SwiftUI): PreviewProvider Stubs**

For each component, produce a `PreviewProvider` stub. Save to `ai-driven-development/docs/ui_design/ios_previews/`.

```swift
// Previews/ButtonPreviews.swift
import SwiftUI

struct AppButton_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            AppButton(label: "Click me", style: .primary, action: {})
                .previewDisplayName("Primary")
            AppButton(label: "Disabled", style: .primary, action: {})
                .disabled(true)
                .previewDisplayName("Disabled")
            AppButton(label: "Saving...", style: .primary, isLoading: true, action: {})
                .previewDisplayName("Loading")
        }
        .previewLayout(.sizeThatFits)
        .padding()
    }
}
```

Also produce `ai-driven-development/docs/ui_design/tokens_ios.swift` — a Swift color/typography token file generated from `tokens.json` using the `Color(red:green:blue:)` initialiser, ready to drop into `Assets.xcassets` or a `DesignTokens.swift` helper.

---

**8.3c — Android (Jetpack Compose): @Preview Stubs**

For each component, produce `@Preview` annotated composable stubs. Save to `ai-driven-development/docs/ui_design/android_previews/`.

```kotlin
// previews/ButtonPreview.kt
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview

@Preview(showBackground = true, name = "Primary")
@Composable
fun AppButtonPrimaryPreview() {
    AppTheme {
        AppButton(label = "Click me", style = ButtonStyle.Primary, onClick = {})
    }
}

@Preview(showBackground = true, name = "Disabled")
@Composable
fun AppButtonDisabledPreview() {
    AppTheme {
        AppButton(label = "Disabled", style = ButtonStyle.Primary, enabled = false, onClick = {})
    }
}

@Preview(showBackground = true, name = "Loading")
@Composable
fun AppButtonLoadingPreview() {
    AppTheme {
        AppButton(label = "Saving...", style = ButtonStyle.Primary, isLoading = true, onClick = {})
    }
}
```

Also produce `ai-driven-development/docs/ui_design/tokens_android/`:
- `Color.kt` — Material 3 color tokens generated from `tokens.json`
- `Theme.kt` — `MaterialTheme` wrapper binding the color and typography tokens

#### 8.4 — Design Implementation Checklist
Produce `ai-driven-development/docs/ui_design/design-implementation-checklist.md`:

```markdown
# Design Implementation Checklist — [Project Name]

## Design Tokens
- [ ] `tokens.json` imported and CSS custom properties generated
- [ ] No hard-coded color hex values in component code (use token variables only)
- [ ] Typography scale applied via token variables

## Components (one block per component)
### Button
- [ ] All 4 variants implemented
- [ ] All 3 sizes implemented
- [ ] Loading state shows spinner and disables click
- [ ] Keyboard focus ring visible (WCAG AA)
- [ ] Storybook story present with all variants

### [Add one block per design-system component]

## Screens
### [Screen Name] — [Route]
- [ ] Matches wireframe layout at mobile (≤ 640px)
- [ ] Matches wireframe layout at desktop (≥ 1024px)
- [ ] Loading state implemented
- [ ] Empty state implemented
- [ ] Error state implemented
- [ ] ARIA labels present on interactive elements
```

---

## Definition of Done (DoD)

> 📋 **Quality review**: Before marking this phase complete, consult [quality-playbook/SKILL.md](../quality-playbook/SKILL.md) §3 — Phase 4c/4d/4e quality gates and §4 — Cross-Cutting Concerns checklist (security and accessibility).

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

### Design Handoff *(new)*
- [ ] `tokens.json` exported in W3C format
- [ ] Component prop API defined for every component
- [ ] Storybook story stubs produced
- [ ] `design-implementation-checklist.md` produced

### Validation
- [ ] Design reviewed by product owner / stakeholder
- [ ] At least 1 usability test or design walkthrough conducted

---

## Next Skill
Proceed to the client implementation skill(s) matching the confirmed scope in `tech_stack_selections.md`. All client skills can run in parallel with each other and with [`backend-development`](../backend-development/SKILL.md):

| Confirmed target | Next skill |
|---|---|
| Web frontend (React / Vue / Angular / Svelte) | [`frontend-development`](../frontend-development/SKILL.md) |
| iOS | [`ios-development`](../ios-development/SKILL.md) |
| Android | [`android-development`](../android-development/SKILL.md) |
