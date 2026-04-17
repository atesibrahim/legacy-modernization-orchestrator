# Output Artifact Structure Reference

This document defines the complete expected artifact tree for all phases of the legacy modernization framework.
Every skill writes its outputs to the paths listed here. No skill may write to a path not listed here without updating this document.

---

## Root: `ai-driven-development/`

```
ai-driven-development/
├── redesign_progress.md                              ← Phase tracker (always — created Phase 1)
│
├── docs/
│   │
│   ├── tech_stack_selections.md                      ← Phase 2.5 (always — filled from template)
│   │   [Template: .github/skills/tech-stack-selection/tech_stack_selections.template.md]
│   │
│   ├── adr/                                          ← Architecture Decision Records (as needed)
│   │   └── ADR-{NNN}-{title}.md                     ← One file per decision
│   │
│   ├── legacy_analysis/                                    ← Phase 1: legacy-analysis
│   │   └── legacy_analysis.md                        ← Always
│   │
│   ├── legacy_architecture/                          ← Phase 2: legacy-architecture
│   │   ├── legacy_architecture.md                   ← Always
│   │   └── legacy_architecture.html                 ← Always (Mermaid diagrams: 4.1–4.6)
│   │
│   ├── target_architecture/                          ← Phase 3: target-architecture
│   │   ├── target_architecture.md                   ← Always
│   │   └── target_architecture.html                 ← Always (Mermaid diagrams)
│   │
│   ├── ui_design/                                    ← Phase 4a: ui-ux-design (if any UI)
│   │   ├── ui_ux_pages.md                           ← Screen inventory, user journeys, design tokens
│   │   ├── ui_ux_pages.html                         ← HTML wireframe previews
│   │   ├── tokens.json                              ← Design tokens (W3C format) — Step 8.1
│   │   ├── component_api.md                         ← Component prop API definitions — Step 8.2
│   │   ├── design-implementation-checklist.md       ← Dev implementation checklist — Step 8.4
│   │   └── storybook_stubs/                         ← Storybook story stubs — Step 8.3
│   │       └── {ComponentName}/{ComponentName}.stories.tsx
│   │
│   ├── legacy_vs_new_system/                         ← Phase 5: compare-legacy-to-new
│   │   ├── compare_legacy_to_new_system.md          ← Always
│   │   └── compare_legacy_to_new_system.html        ← Always (Mermaid comparison diagrams)
│   │
│   ├── security_review/                              ← Phase 4g: security-review (optional)
│   │   ├── security_review_report.md               ← OWASP Top 10 audit findings
│   │   └── security_review_report.html             ← HTML report with severity ratings
│   │
│   └── final_validation/                             ← Phase 6: final-validation (always)
│       ├── release_readiness_checklist.md           ← All gates with status
│       ├── go_no_go_decision.md                     ← Stakeholder sign-off record
│       └── smoke_test_plan.md                       ← Post-cutover smoke tests
│
└── development/
    │
    ├── be_development_todo.md                        ← Phase 4b: backend-development (if backend in scope)
    │
    ├── backend_development/                          ← Phase 4b: backend-development
    │   ├── {ProjectName}/                           ← Backend project root (e.g. Maven/Gradle/sln/pyproject.toml)
    │   │   ├── src/                                ← Application source
    │   │   ├── test/                               ← Tests
    │   │   └── {build-file}                        ← pom.xml / build.gradle.kts / {Name}.sln / pyproject.toml / go.mod
    │   └── README.md                               ← Setup, env vars, run, test instructions
    │
    ├── fe_development_todo.md                        ← Phase 4c: frontend-development (if web frontend in scope)
    │
    ├── frontend_development/                         ← Phase 4c: frontend-development
    │   ├── {ProjectName}/                           ← Frontend project root (e.g. Vite/Next.js)
    │   │   ├── src/
    │   │   │   ├── components/                     ← Design system components
    │   │   │   ├── pages/ (or app/ for Next.js)    ← Page/route components
    │   │   │   ├── hooks/                          ← Custom React/Vue/Svelte hooks/composables
    │   │   │   ├── stores/                         ← State management (Zustand/Pinia/NgRx)
    │   │   │   ├── api/                            ← API client layer (Axios)
    │   │   │   └── types/                          ← TypeScript type definitions
    │   │   ├── public/
    │   │   └── package.json
    │   └── README.md
    │
    ├── mobile_development/
    │   │
    │   ├── ios/                                      ← Phase 4d: ios-development (if iOS in scope)
    │   │   ├── ios_development_todo.md
    │   │   └── {ProjectName}/                       ← Xcode project root
    │   │       ├── {ProjectName}.xcodeproj/
    │   │       ├── {ProjectName}/                  ← App target source
    │   │       │   ├── App/                        ← App entry point + DI setup
    │   │       │   ├── Features/                   ← Feature modules (ViewModel + View)
    │   │       │   ├── Data/                       ← Repositories + Network + Persistence
    │   │       │   ├── Domain/                     ← Models + Use Cases
    │   │       │   └── Resources/                  ← Assets, Localizable.strings
    │   │       └── {ProjectName}Tests/
    │   │
    │   └── android/                                  ← Phase 4e: android-development (if Android in scope)
    │       ├── android_development_todo.md
    │       └── {ProjectName}/                       ← Gradle project root
    │           ├── app/
    │           │   └── src/main/java/.../
    │           │       ├── di/                     ← Hilt modules
    │           │       ├── features/               ← Feature packages (ViewModel + UI + domain)
    │           │       ├── data/                   ← Repositories + Network + Room
    │           │       └── core/                   ← Shared utilities, navigation, theme
    │           ├── build.gradle.kts
    │           └── settings.gradle.kts
    │
    └── data_migration/                               ← Phase 4f: data-migration (optional)
        ├── data_migration_todo.md
        ├── schema_migrations/                       ← Flyway/Alembic/Goose scripts
        │   ├── V001__initial_schema.sql
        │   └── V002__add_indexes.sql
        ├── validation/                              ← Row count + checksum validation scripts
        │   ├── validate_row_counts.sql
        │   └── validate_checksums.sql
        ├── cleansing/                               ← Data quality fix scripts
        │   └── clean_nulls.sql
        └── rollback/                               ← Rollback scripts
            └── rollback_V001.sql
```

---

## Phase → Artifact Mapping Summary

| Phase | Agent | Output Paths |
|---|---|---|
| 1 | legacy-analysis | `docs/legacy_analysis/legacy_analysis.md` |
| 2 | legacy-architecture | `docs/legacy_architecture/legacy_architecture.md` + `.html` |
| 2.5 | Tech Stack Gate | `docs/tech_stack_selections.md` |
| 3 | target-architecture | `docs/target_architecture/target_architecture.md` + `.html` |
| 4a | ui-ux-design | `docs/ui_design/ui_ux_pages.md` + `.html` + `tokens.json` + `component_api.md` + `design-implementation-checklist.md` + `storybook_stubs/` |
| 4b | backend-development | `development/be_development_todo.md` + `development/backend_development/` |
| 4c | frontend-development | `development/fe_development_todo.md` + `development/frontend_development/` |
| 4d | ios-development | `development/mobile_development/ios/ios_development_todo.md` + `development/mobile_development/ios/{ProjectName}/` |
| 4e | android-development | `development/mobile_development/android/android_development_todo.md` + `development/mobile_development/android/{ProjectName}/` |
| 4f | data-migration | `development/data_migration/` |
| 4g | security-review | `docs/security_review/security_review_report.md` + `.html` |
| 4h | devops-infra | `development/infra/` (infra_todo.md + kubernetes/ + helm/ + terraform/ + ci-cd/ + monitoring/ + secrets/) |
| 5 | compare-legacy-to-new | `docs/legacy_vs_new_system/compare_legacy_to_new_system.md` + `.html` |
| 6 | final-validation | `docs/final_validation/release_readiness_checklist.md` + `go_no_go_decision.md` + `smoke_test_plan.md` |

---

## Notes

- `{ProjectName}` is replaced with the actual project name (PascalCase, no spaces)
- All paths are relative to `ai-driven-development/`
- Optional phases (4b–4g) only create their artifacts if in scope — confirmed by scope selection before Phase 4
- ADRs are created on-demand throughout all phases, not just in a specific phase
- `redesign_progress.md` is created in Phase 1 and updated by every subsequent phase
