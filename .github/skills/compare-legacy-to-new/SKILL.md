---
name: compare-legacy-to-new
description: 'Legacy vs new system comparison and gap analysis skill. Act as a senior master architect analyst developer. Use when: comparing legacy system with redesigned system, gap analysis between legacy and new, mapping legacy components to new equivalents, creating migration strategy, producing before-after diagrams in HTML mermaid, validating that all legacy functionality is covered in new design, identifying improvements and regressions.'
argument-hint: 'Path to legacy analysis and new system design artifacts to compare'
version: 1.0.0
last_reviewed: 2026-04-27
status: Active
---

# Compare Legacy to New System

## Role
**Senior Master Architect / Analyst / Developer** — Produce an objective, evidence-based comparison between the legacy system and the new design. Identify what was preserved, what was improved, what was eliminated, and what risks remain in the transition.

## When to Use
- After legacy analysis (`legacy-analysis`, `legacy-architecture`) and target design (`target-architecture`) are complete, and at least one in-scope implementation target is complete (`backend-development`, `frontend-development`, `ios-development`, `android-development`, and/or `cross-platform-mobile`)
- Need to validate that all legacy functionality is covered in the new system
- Presenting migration strategy to stakeholders
- Risk assessment before production cutover

## Prerequisites (Preflight)
Before starting, verify the following artifacts exist:

| Artifact | Expected Path | Required? |
|---|---|---|
| Legacy analysis report | `ai-driven-development/docs/legacy_analysis/legacy_analysis.md` | Always |
| Legacy architecture report | `ai-driven-development/docs/legacy_architecture/legacy_architecture.md` | Always |
| Target architecture | `ai-driven-development/docs/target_architecture/target_architecture.md` | Always |
| Backend development outputs | `ai-driven-development/development/backend_development/` | If backend in scope |
| Frontend development outputs | `ai-driven-development/development/frontend_development/` | If web frontend in scope |
| iOS development outputs | `ai-driven-development/development/mobile_development/ios/` | If iOS in scope |
| Android development outputs | `ai-driven-development/development/mobile_development/android/` | If Android in scope |
| Cross-platform mobile outputs | `ai-driven-development/development/mobile_development/cross-platform/` | If Flutter or React Native is in scope |

**At least one in-scope Phase 4 implementation artifact must exist (`4b`, `4c`, `4d`, `4e`, or `4i`).** If none are present, stop and report which Phase 4 agents must run first.

**If any always-required artifact is missing**: Stop. Report which artifact is missing, which phase produces it (Phase 1: `legacy-analysis`, Phase 2: `legacy-architecture`, Phase 3: `target-architecture`), and offer: (a) Run the prerequisite phase now, (b) Provide the artifact path manually.

## Output Location
Create folder `ai-driven-development/docs/legacy_vs_new_system/` and produce:
- `compare_legacy_to_new_system.md` — Full comparison report
- `compare_legacy_to_new_system.html` — Visual comparison diagrams

---

## Procedure

### Step 0.5 — Scale Check for Coverage Analysis

> **Run before Steps 1–6.** For systems with many legacy features, processing the full coverage matrix in one pass risks incomplete mapping. Batch by domain area when the feature count is high.

**Measure:**
- Count legacy features/modules listed in `legacy_analysis.md` §2 (System Inventory) and §5 (Data Flow Map)
- Note: stored procedures, scheduled jobs, and external integrations each count as separate features

**Choose a strategy:**

| Scale | Signal | Strategy |
|---|---|---|
| **Small** | ≤ 25 legacy features | Complete coverage matrix (Step 1) in a single pass |
| **Large** | 26+ legacy features | Group features by domain area; each group as a parallel sub-task |

**Domain-batched sub-tasks (large scale):**

Group legacy features by domain area — use the Table Ownership Matrix and module list from `legacy_analysis.md` to define groups. Example for a typical enterprise system:

| Batch | Domain Area | Typical Coverage |
|---|---|---|
| Batch 1 | User & Access Management | Login, roles, LDAP/SSO, permissions, audit log |
| Batch 2 | Core Domain A | Main entity CRUD, business workflows, validations |
| Batch 3 | Core Domain B | Secondary entity CRUD, downstream business rules |
| Batch 4 | Reporting & Exports | PDF/XLSX/CSV generation, scheduled reports, dashboards |
| Batch 5 | Integrations & Batch Jobs | External API calls, cron jobs, file transfers, messaging |

Each batch sub-task:
1. Receives: the legacy features assigned to its batch + access to all prerequisite artifacts
2. Produces: its section of the Functional Coverage Matrix (Step 1 format rows only)

This orchestrating agent:
1. Merges all batch sub-task matrices into a single unified coverage table
2. Runs Steps 2–6 (architecture comparison, NFR analysis, diagrams, risk, cutover checklist) using the full merged data

Record the batch assignment (feature → batch) in `compare_legacy_to_new_system.md` under `## Coverage Analysis Plan` before starting any batch.

---

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

**Coverage Status Key** (canonical values from `core.md` §11 — use exact strings):
- `✅ Full` — Fully implemented with functional parity
- `⚠️ Partial` — Implemented but missing edge cases or minor behaviour
- `🔄 Planned` — Absent but roadmapped; ticket/sprint and delivery date must exist
- `❌ Missing` — Absent with no remediation plan — **blocks cutover** if feature is critical
- `🗑️ Removed` — Intentionally not migrated; stakeholder sign-off required

### Step 2 — Architecture Comparison
Compare architectural decisions side by side:

> **⚠ EXAMPLE VALUES ONLY — REPLACE ALL ROWS WITH YOUR ACTUAL STACK.**
> The table below uses a Java 8 → Java 21 / Spring / React migration as an illustration.
> Read `legacy_analysis.md` and `tech_stack_selections.md` to populate the real values before saving this report.

| Dimension | Legacy | New | Change Type | Impact |
|---|---|---|---|---|
| Architecture Style | Monolith | Modular Monolith | Structural | Lower coupling |
| Language / Runtime | Java 8 | Java 21 (Virtual Threads) | Upgrade | Performance gain |
| Frontend | JSP + jQuery | React 18 + TypeScript | Full rewrite | UX improvement |
| Authentication | Custom session | JWT + OAuth2/LDAP | Replacement | Security improvement |
| Authorization | Hard-coded role checks | RBAC at application boundary | Replacement | Maintainability |
| Database Access | Raw JDBC + Stored Procs | ORM / query layer per stack | Replacement | Testability |
| API Style | No REST (form POSTs) | REST + OpenAPI 3.1 | New | Integrability |
| Messaging | File-based polling | Message Broker (Kafka/RabbitMQ) | Replacement | Reliability |
| Deployment | Manual WAR deploy | Docker + CI/CD | Replacement | Repeatability |
| Observability | Log files (manual) | Structured logs + Metrics + Tracing | Addition | Operational visibility |
| Testing | None / manual | Unit + Integration + E2E per stack | Addition | Quality gate |

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

### Step 3.5 — Performance Baseline & Regression Analysis
Document the legacy system's performance benchmarks and verify the new system does not regress.

#### 3.5.1 — Capture Legacy Performance Baseline
Collect or estimate from logs/monitoring:

| Metric | Legacy Measured Value | Source |
|---|---|---|
| API P50 latency (ms) | e.g. 120 ms | APM / access log |
| API P95 latency (ms) | e.g. 480 ms | APM / access log |
| API P99 latency (ms) | e.g. 1200 ms | APM / access log |
| Max throughput (req/s) | e.g. 250 rps | Load test / log analysis |
| DB query P95 (ms) | e.g. 340 ms | DB slow query log |
| Frontend LCP (ms) | e.g. 3800 ms | Lighthouse / RUM |
| Frontend TTI (ms) | e.g. 5200 ms | Lighthouse / RUM |
| Batch job duration | e.g. 4h 20min | Scheduler logs |

> If measured values are unavailable, label estimates as `(estimated)` and note the estimation method.

#### 3.5.2 — Define Regression Thresholds
Set pass/fail thresholds for the new system based on the baseline:

**Rule**: New system P95 latency ≤ Legacy P95 × 1.2 (20% regression tolerance)

| Metric | Legacy Baseline | Regression Threshold (≤) | New System Result | Pass/Fail |
|---|---|---|---|---|
| API P95 latency | 480 ms | 576 ms | TBD | — |
| API P99 latency | 1200 ms | 1440 ms | TBD | — |
| Max throughput | 250 rps | 250 rps (must match or exceed) | TBD | — |
| DB query P95 | 340 ms | 408 ms | TBD | — |
| Frontend LCP | 3800 ms | 3000 ms (target improvement) | TBD | — |
| Batch job | 4h 20min | 5h 00min | TBD | — |

#### 3.5.3 — Load Test Scenario Definition
Define test scenarios to run against the new system using k6, Gatling, or JMeter:

```
Scenario: Peak Load
  Virtual Users: <same peak as legacy production>
  Ramp-up: 2 min
  Steady state: 10 min
  Ramp-down: 1 min
  Key transactions:
    - Login (10% of traffic)
    - Primary business flow (40% of traffic)
    - Read-heavy pages (40% of traffic)
    - Batch trigger / report (10% of traffic)

Scenario: Spike Test
  Baseline: 50% of peak
  Spike to: 150% of peak over 30s
  Hold: 2 min
  Expected: no error rate increase >0.1%
```

#### 3.5.4 — Performance Comparison Table
Complete after running load tests on the new system:

| Metric | Legacy | New System | Δ% | Regression? |
|---|---|---|---|---|
| API P95 latency | 480 ms | TBD | TBD | TBD |
| API P99 latency | 1200 ms | TBD | TBD | TBD |
| Max throughput | 250 rps | TBD | TBD | TBD |
| DB query P95 | 340 ms | TBD | TBD | TBD |
| Frontend LCP | 3800 ms | TBD | TBD | TBD |
| Error rate (at peak) | ~0.5% | TBD | TBD | TBD |

> **Blocking rule**: Any metric marked `Regression? = YES` is a **cutover blocker**. Do not proceed to Phase 6 until all regressions are resolved or explicitly accepted with stakeholder sign-off.

---

### Step 3.6 — Automated Surface Diff

Run automated diffs to catch regressions that manual review misses. Record results in `compare_legacy_to_new_system.md §5 — Automated Surface Diff`.

#### 3.6.1 — API Surface Diff (openapi-diff)

If both legacy and new system have OpenAPI specs (or the legacy endpoints were reverse-engineered in Phase 1):

```bash
# Install once
npm install -g openapi-diff   # or: npx openapi-diff

# Diff legacy spec against new spec
openapi-diff legacy-openapi.json new-openapi.json --format markdown > api_surface_diff.md
```

Classify every change using the table below. Any **Breaking** change that is also present in the legacy feature list is a **cutover blocker** unless a migration path is documented.

| Change Type | Example | Classification | Action Required |
|---|---|---|---|
| Endpoint removed | `DELETE /api/v1/reports/{id}` removed | **Breaking** | Document consumer impact; add to feature coverage table as `❌ Missing` |
| Required field added | New mandatory request field | **Breaking** | Version the endpoint or provide default |
| Response field removed | Field dropped from response body | **Breaking** | Document downstream consumers |
| Endpoint added | New endpoint with no legacy equivalent | Non-breaking | Record as improvement |
| Optional field added | New optional response field | Non-breaking | No action needed |
| Status code changed | `200 → 204` on DELETE | **Breaking** | Update consumers |

#### 3.6.2 — Feature List Diff (script)

Compare the legacy feature inventory (from `legacy_analysis.md §5 — Business Flows`) against the new system's feature coverage table:

```bash
# Extract feature IDs from legacy analysis
grep -oP '(?<=\| )\w+\-\d+' ai-driven-development/docs/legacy_analysis/legacy_analysis.md \
  | sort -u > /tmp/legacy_features.txt

# Extract covered feature IDs from coverage table
grep '✅ Full\|⚠️ Partial\|🔄 Planned' \
  ai-driven-development/docs/legacy_vs_new_system/compare_legacy_to_new_system.md \
  | grep -oP '\w+\-\d+' | sort -u > /tmp/covered_features.txt

# Report uncovered features
comm -23 /tmp/legacy_features.txt /tmp/covered_features.txt > /tmp/uncovered_features.txt
echo "Uncovered legacy features:"; cat /tmp/uncovered_features.txt
```

Any feature in `/tmp/uncovered_features.txt` that is not `🗑️ Removed` (with sign-off) is a **gap** — add it to the feature coverage table as `❌ Missing` and escalate for resolution before Phase 6.

---

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

> 📋 **Quality review**: Before marking this phase complete, consult [quality-playbook/SKILL.md](../quality-playbook/SKILL.md) §3 — Phase 5 quality gates.

### Performance
- [ ] Legacy performance baseline documented (P50/P95/P99 latency, throughput, batch duration)
- [ ] Regression thresholds defined per metric
- [ ] Load test scenarios defined and executed against new system
- [ ] Performance comparison table complete with Pass/Fail per metric
- [ ] Zero blocking performance regressions (or written stakeholder acceptance on record)

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
