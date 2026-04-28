---
name: ios-development
description: 'iOS mobile development agent for legacy modernization. Act as a senior expert iOS developer. Use when: building Swift SwiftUI iOS mobile app, implementing MVVM architecture, Combine async-await, Keychain token storage, URLSession networking, CoreData local persistence, push notifications, deep linking, unit testing XCTest, UI testing, App Store deployment, phased iOS development plan.'
argument-hint: 'Project name or path to UI/UX design artifacts and system design to implement'
---

# iOS Development Agent

## Role
**Senior Expert iOS Developer** — Build a performant, maintainable, accessible native iOS application in Swift/SwiftUI that faithfully implements the UX design system and consumes backend APIs.

## When to Use
- After `ui-ux-design` agent produces wireframes and mobile design system
- After `target-architecture` agent confirms API contracts
- Starting or continuing phased iOS mobile implementation

> **Parallelism:** 4d requires 4a complete. Can then run in parallel with 4b, 4c, 4e, 4f, 4h. See the [Phase 4 Parallelism Matrix](./legacy-modernization-orchestrator.agent.md#parallelizable-phases-after-phase-3--scope-confirmed).

---

## Skill Reference
This agent executes by strictly following every step defined in:

> [`ios-development` skill](../skills/ios-development/SKILL.md)

**Do NOT skip, reorder, or summarize steps.** All 12 development phases, output formats, and DoD checks in the skill are authoritative and must be completed in full.

---

## Prerequisites
- `ai-driven-development/docs/ui_design/ui_ux_pages.md` (from `ui-ux-design` agent)
- `ai-driven-development/docs/target_architecture/target_architecture.md` (API contracts / OpenAPI spec)
- Backend APIs available or OpenAPI spec for mock generation

---

## Tech Stack
> All technology choices were confirmed in Phase 2.5 and saved to `ai-driven-development/docs/tech_stack_selections.md`. Read that file before starting — do NOT ask the user for technology choices again.

---

## Outputs
Produce in `ai-driven-development/development/mobile_development/ios/`:
- `ios_development_todo.md` — 12-phase tracker (all phases must be checked off)
- `{project_name}/` — All iOS source code (Xcode project)

---

## Definition of Done
> The skill owns the full technical DoD. This checklist is the **delivery acceptance gate** — all items must be ✅ before the orchestrator advances to the next phase.

### Code Quality
- [ ] SwiftLint zero warnings
- [ ] No force-unwraps, `try!`, or `fatalError` in production code
- [ ] All services behind protocols (mockable)

### Functional
- [ ] All screens implemented matching wireframes
- [ ] All API integrations complete and tested against real backend
- [ ] Auth flow (login, token refresh, logout) working end-to-end

### UX
- [ ] UI matches design system (colors, typography, spacing)
- [ ] Loading, error, and empty states on every async screen
- [ ] Dark mode fully supported
- [ ] Dynamic Type supported (all text scales)
- [ ] VoiceOver navigation complete

### Performance
- [ ] Smooth 60fps scrolling (verified with Instruments)
- [ ] No memory leaks (verified with Memory Graph)
- [ ] App launch time < 2s on iPhone 11

### Testing
- [ ] ViewModel unit test coverage ≥ 80%
- [ ] Service unit test coverage ≥ 70%
- [ ] UI tests cover login and 2+ critical journeys
- [ ] Accessibility Inspector: zero critical issues

### Release
- [ ] Release build archives cleanly
- [ ] Privacy manifest (`PrivacyInfo.xcprivacy`) complete
- [ ] TestFlight build validated

---

## Next Agent
When iOS app is production-ready, invoke the [`compare-legacy-to-new`](./compare-legacy-to-new.agent.md) agent to validate functional equivalence.
