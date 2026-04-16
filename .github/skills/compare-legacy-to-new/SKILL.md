---
name: compare-legacy-to-new
description: 'Legacy vs new system comparison and gap analysis skill. Act as a senior master architect analyst developer. Use when: comparing legacy system with redesigned system, gap analysis between legacy and new, mapping legacy components to new equivalents, creating migration strategy, producing before-after diagrams in HTML mermaid, validating that all legacy functionality is covered in new design, identifying improvements and regressions.'
argument-hint: 'Path to legacy analysis and new system design artifacts to compare'
---

# Compare Legacy to New System

## Role
**Senior Master Architect / Analyst / Developer** — Produce an objective, evidence-based comparison between the legacy system and the new design. Identify what was preserved, what was improved, what was eliminated, and what risks remain in the transition.

## When to Use
- After legacy analysis (`analysing-legacy`, `legacy-architecture`) and target design (`target-architecture`) are complete, and at least one in-scope development target is complete (`backend-development`, `frontend-development`, `ios-development`, and/or `android-development`)
- Need to validate that all legacy functionality is covered in the new system
- Presenting migration strategy to stakeholders
- Risk assessment before production cutover

## Prerequisites
- `ai-driven-development/docs/analysing/legacy_analyse.md`
- `ai-driven-development/docs/legacy_architecture/legacy_architecture.md`
- `ai-driven-development/docs/target_architecture/target_architecture.md`
- At least one of the following (based on project scope):
  - `ai-driven-development/development/backend_development/` (or OpenAPI spec)
  - `ai-driven-development/development/frontend_development/` (or screen inventory)
  - `ai-driven-development/development/mobile_development/ios/` (or screen inventory)
  - `ai-driven-development/development/mobile_development/android/` (or screen inventory)

## Output Location
Create folder `ai-driven-development/docs/legacy_vs_new_system/` and produce:
- `compare_legacy_to_new_system.md` — Full comparison report
- `compare_legacy_to_new_system.html` — Visual comparison diagrams

---

## Procedure

### Step 1 — Functional Coverage Matrix
Map every legacy feature/function to its new equivalent. No legacy feature left unmapped.

Format:

| Legacy Feature | Legacy Location | New Equivalent | New Location | Coverage Status | Notes |
|---|---|---|---|---|---|
| User Login | `LoginServlet.java` | Auth Service | `AuthController.java` | ✅ Full | OAuth2 replaces custom session |
| Order Processing | `OrderBean.java` | Order Service | `OrderService.java` | ✅ Full | |
| PDF Report Export | `ReportUtil.java` | Report Service | `ReportController.java` | ⚠️ Partial | Format changed from PDF to XLSX |
| Nightly Batch Job | `cron_nightly.sh` | Scheduler | `NightlyJobConfig.java` | ✅ Full | Spring Batch replaces shell script |
| [Legacy function] | [Legacy class/file] | [New service] | [New class/file] | ❌ Missing | [Why / plan] |

**Coverage Status Key**:
- ✅ Full — Fully implemented in new system
- ⚠️ Partial — Partially implemented or behavior changed
- ❌ Missing — Not yet implemented (MUST be resolved before cutover)
- 🗑️ Removed — Intentionally not migrated (document justification)

### Step 2 — Architecture Comparison
Compare architectural decisions side by side:

| Dimension | Legacy | New | Change Type | Impact |
|---|---|---|---|---|
| Architecture Style | Monolith | Modular Monolith | Structural | Lower coupling |
| Language / Runtime | Java 8 | Java 21 (Virtual Threads) | Upgrade | Performance gain |
| Frontend | JSP + jQuery | React 18 + TypeScript | Full rewrite | UX improvement |
| Authentication | Custom session | JWT + OAuth2/LDAP | Replacement | Security improvement |
| Authorization | Hard-coded role checks | `@PreAuthorize` + RBAC | Replacement | Maintainability |
| Database Access | Raw JDBC + Stored Procs | Spring Data JPA | Replacement | Testability |
| API Style | No REST (form POSTs) | REST + OpenAPI 3.1 | New | Integrability |
| Messaging | File-based polling | Message Broker (Kafka/RabbitMQ) | Replacement | Reliability |
| Deployment | Manual WAR deploy | Docker + CI/CD | Replacement | Repeatability |
| Observability | Log files (manual) | Structured logs + Metrics + Tracing | Addition | Operational visibility |
| Testing | None / manual | JUnit + Integration + E2E | Addition | Quality gate |

### Step 3 — Non-Functional Improvement Analysis
Quantify improvements where possible:

| NFR | Legacy | New (Target) | Measurement Method |
|---|---|---|---|
| Response Time (P95) | ~2000ms | <200ms | APM / Load test |
| Throughput | X req/sec | Y req/sec | Load test |
| Deployment Time | 4h manual | 15min (CI/CD) | Pipeline metrics |
| Recovery Time (RTO) | Hours | <30min | DR drill |
| Test Coverage | 0% | ≥70% | SonarQube |
| Security Score | OWASP D | OWASP B | ZAP scan |
| Bundle Size (Frontend) | N/A | <500KB | Bundle analyzer |

### Step 4 — Risk & Migration Strategy
Identify transition risks and mitigation:

| Risk | Description | Probability | Impact | Mitigation |
|---|---|---|---|---|
| Data migration failure | Legacy DB schema to new schema | Medium | High | Dual-write + validation scripts |
| Missing functionality | Legacy edge case not migrated | Low | High | Functional coverage matrix (Step 1) |
| External system incompatibility | Changed API contracts break integrations | Medium | High | Anticorruption layer / versioned API |
| User adoption | Users struggle with new UI | Medium | Medium | Training, progressive rollout |
| Performance regression | New system slower under load | Low | High | Load test gate before cutover |

**Migration Strategy** (pick one, justify):
- **Big Bang**: Cut over all users at once on a date
- **Strangler Fig**: Route new requests to new system, legacy handles rest until migration done
- **Parallel Run**: Both systems run simultaneously, validate output equivalence
- **Feature Flag**: Gradually expose new features behind flags

### Step 5 — Generate Visual Comparison Diagrams (HTML + Mermaid.js)

Use the **HTML Comparison Page Template** from [STANDARDS.md](./STANDARDS.md) as the starting document for `compare_legacy_to_new_system.html`.

Required sections to populate:
- **Side-by-side summary cards**: Legacy vs New technology stack (customize all values)
- **Architecture Evolution Diagram**: Legacy → Migration layer → New (Mermaid `graph LR`)
- **Technology Migration Map**: Each legacy tech → new equivalent with relationship label
- **Functional Coverage Summary**: Table with ✅/⚠️/❌ per feature row

> See the **Coverage Status Legend** in [STANDARDS.md](./STANDARDS.md) for the meaning of each status symbol.
>
> **Important**: Replace ALL placeholder technology names and feature rows with actual project data. Verify the rendered HTML in a browser.

### Step 6 — Cutover Readiness Checklist
Before production migration, all items must be checked:

**Functional Readiness**
- [ ] Functional coverage matrix: 0 items in ❌ Missing status
- [ ] All ⚠️ Partial items documented and accepted by stakeholders
- [ ] All 🗑️ Removed features formally signed off by business

**Technical Readiness**
- [ ] Data migration scripts tested in staging
- [ ] Performance benchmarks meet or exceed legacy
- [ ] Security scan passed (no critical CVEs)
- [ ] Rollback plan documented and tested

**Operational Readiness**
- [ ] Runbook created for new system
- [ ] Monitoring dashboards live
- [ ] On-call escalation path defined
- [ ] Support team trained on new system

---

## Output Format

### compare_legacy_to_new_system.md
```markdown
# Legacy vs New System: Comparison Report

## Executive Summary
## 1. Functional Coverage Matrix
## 2. Architecture Comparison Table
## 3. Non-Functional Improvements
## 4. Technology Migration Map
## 5. Risk Assessment
## 6. Migration Strategy
## 7. Cutover Readiness Checklist
## 8. Recommendation
```

---

## Definition of Done (DoD)

### Coverage
- [ ] Every legacy module/feature mapped to new equivalent (no gaps)
- [ ] All ❌ Missing items have documented resolution plan
- [ ] All architectural dimensions compared (auth, data, deployment, observability)

### Diagrams
- [ ] Architecture evolution diagram showing legacy → new
- [ ] Technology migration map
- [ ] Functional coverage table
- [ ] All diagrams render correctly in HTML

### Clarity
- [ ] Improvements quantified with metrics where possible
- [ ] Regressions or partial migrations explicitly flagged
- [ ] Migration strategy chosen and justified

### Validation
- [ ] Report reviewed by lead architect AND product owner
- [ ] Cutover checklist reviewed and items assigned owners

---

## Next Step
Final step: return to the [`legacy-modernization-orchestrator`](../../agents/legacy-modernization-orchestrator.agent.md) for Phase 6 final validation and cutover readiness.
