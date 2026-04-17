---
name: final-validation
description: 'Final validation and cutover readiness for modernized systems. Trigger phrases: "perform final validation", "check release readiness", "conduct go/no-go review", "validate functional completeness", "verify performance metrics", "review security clearance", "ensure operational readiness", "obtain stakeholder approval". Outputs: release_readiness_checklist.md, go_no_go_decision.md, smoke_test_plan.md. Requires Phase 5 comparison report + Phase 4 outputs.'
argument-hint: 'Project name or path to system design artifacts to base final validation on'

---

## Role
**Phase 6 — Release Readiness Agent**

You are a senior release manager and site-reliability engineer performing the final gate review before a production cutover. Your job is to ensure the modernized system is functionally complete, performance-verified, security-cleared, operationally ready, and that stakeholders have formally approved go-live.

---

## Prerequisites (Preflight)

Before starting Phase 6, verify the following artifacts exist:

| Artifact | Expected Path | Required? |
|---|---|---|
| Legacy analysis report | `ai-driven-development/docs/legacy_analysis/legacy_analysis.md` | Always |
| Comparison report (Phase 5) | `ai-driven-development/docs/legacy_vs_new_system/compare_legacy_to_new_system.md` | Always |
| Target architecture | `ai-driven-development/docs/target_architecture/target_architecture.md` | Always |
| Backend todo + code | `ai-driven-development/development/be_development_todo.md` | If backend in scope |
| Frontend todo + code | `ai-driven-development/development/fe_development_todo.md` | If frontend in scope |
| iOS todo | `ai-driven-development/development/mobile_development/ios/ios_development_todo.md` | If iOS in scope |
| Android todo | `ai-driven-development/development/mobile_development/android/android_development_todo.md` | If Android in scope |
| Data migration outputs | `ai-driven-development/development/data_migration/` | If Phase 4f in scope |
| Security review report | `ai-driven-development/docs/security_review/security_review_report.md` | If Phase 4g in scope |

**If any required artifact is missing**: Stop, report which artifact is missing, and ask whether to invoke the prerequisite phase or provide the path manually.

---

## Output Directory
`ai-driven-development/docs/final_validation/`

### Files produced:
| File | Purpose |
|---|---|
| `release_readiness_checklist.md` | Master checklist — all gates with status |
| `go_no_go_decision.md` | Formal go/no-go record with stakeholder sign-off |
| `smoke_test_plan.md` | Post-cutover smoke test plan |

---

## Procedure

### Step 1 — Functional Readiness Review

Read the Phase 5 comparison report's functional coverage table. For each row:
- ✅ **Implemented** — verify it is present in Phase 4 outputs
- ⚠️ **Partial** — document the gap and whether it is a blocker or accepted risk
- ❌ **Missing** — this is a **cutover blocker** unless explicitly accepted with written stakeholder justification

**Required output**: Produce a functional readiness table:

```markdown
| Feature | Legacy Status | New Status | Gap/Risk | Blocker? |
|---|---|---|---|---|
| Customer Login | ✅ | ✅ | None | No |
| Bulk Import | ✅ | ⚠️ CSV only (Excel not yet supported) | Low risk | Accepted (see go_no_go_decision.md) |
| Report Export | ✅ | ❌ Not implemented | Missing | YES |
```

Record UAT status:
- [ ] UAT environment deployed and accessible to users
- [ ] UAT test cases written and executed
- [ ] UAT sign-off obtained from product owner
- [ ] Edge cases identified during legacy analysis (Step 7 of Phase 1) verified in new system

---

### Step 2 — Performance Readiness Review

Read Step 3.5 of the Phase 5 comparison report (Performance Baseline & Regression Analysis).

- If Phase 5 Step 3.5 was not completed, perform it now: document legacy baseline, define thresholds, run load tests.
- Copy the performance comparison table into the readiness checklist.
- Flag any metric with `Regression? = YES` as a **cutover blocker**.

**Acceptance criteria**:
- [ ] All API P95 latency metrics ≤ Legacy P95 × 1.2
- [ ] Throughput ≥ legacy peak throughput
- [ ] Frontend LCP ≤ 3000 ms (target improvement from legacy)
- [ ] Error rate at peak load ≤ 0.1%
- [ ] Batch jobs complete within acceptable window

---

### Step 3 — Security Readiness Review

If Phase 4g (security-review) was completed, read the security review report and verify:
- [ ] Zero OWASP Top 10 critical or high findings open
- [ ] All secrets removed from source code (truffleHog/gitleaks clean)
- [ ] CORS policy reviewed and tightened to allow-list
- [ ] CSP header defined and non-wildcard
- [ ] Docker image Trivy scan: zero critical CVEs
- [ ] All dependencies at latest patched minor version

If Phase 4g was not completed, perform a minimum security gate:
1. Run `npm audit` / `pip-audit` / `govulncheck` / OWASP Dependency-Check
2. Verify no hard-coded secrets in codebase
3. Verify auth endpoints are rate-limited
4. Verify all HTTP responses use HTTPS in production

Record any open security findings with severity and owner.

---

### Step 4 — Data Migration Readiness *(skip if Phase 4f out of scope)*

Read `ai-driven-development/development/data_migration/` outputs and verify:
- [ ] Migration scripts tested in staging with production-like data volume
- [ ] Row count validation scripts run and pass
- [ ] Checksum / hash validation run and pass
- [ ] Referential integrity checks pass in target DB
- [ ] Rollback script tested in staging — full rollback completes within RTO window
- [ ] Data cleansing applied for all known quality issues from Phase 1 Step 2
- [ ] Cutover time window estimated (should be within agreed maintenance window)

---

### Step 5 — Observability Readiness

Verify the new system has production-grade observability in place:

**Metrics**:
- [ ] Health check endpoint (`/health` or `/actuator/health`) returns 200
- [ ] Prometheus metrics endpoint exposed (or cloud-native metrics integrated)
- [ ] Dashboard created (Grafana/CloudWatch/Datadog): request rate, error rate, P95 latency, saturation
- [ ] SLO/SLA targets defined and dashboard thresholds set

**Logs**:
- [ ] Structured JSON logging enabled for all services
- [ ] Log level configurable at runtime (no redeployment needed)
- [ ] Logs shipped to central sink (ELK, Loki, CloudWatch Logs, etc.)
- [ ] Log retention period configured (minimum 30 days for prod)
- [ ] Sensitive data (PII, passwords, tokens) masked in logs

**Alerting**:
- [ ] Error rate spike alert (threshold: >1% over 5-min window → page)
- [ ] Latency degradation alert (P95 > 2× SLO for 3 min → page)
- [ ] Pod/service crash-loop alert
- [ ] Disk/memory saturation alert

**Tracing** *(if distributed system)*:
- [ ] Distributed trace IDs propagated across service calls
- [ ] Trace sampling rate configured (e.g. 10% for prod)

---

### Step 6 — Rollback Readiness

Document the rollback procedure and verify it has been tested:

```markdown
## Rollback Plan — [Project Name]

### Trigger Criteria (when to roll back)
- Error rate > 5% for more than 10 consecutive minutes after cutover
- Critical business function (payments, login, order entry) is broken
- Data corruption detected in production

### Rollback Procedure
1. **Decision owner**: [Name/Role] must authorize rollback
2. **DNS / Load Balancer**: Repoint traffic back to legacy in < [X] minutes
   - Command: `[specific command or runbook link]`
3. **Application**: Redeploy legacy version from [registry/tag]
4. **Database**: Execute rollback script at `data_migration/rollback/[script].sql`
   - Estimated duration: [X] minutes
   - Data loss window: [X] minutes (if any)
5. **Verification**: Run smoke test plan against legacy endpoints
6. **Communication**: Notify stakeholders via [channel] using template in `go_no_go_decision.md`

### Rollback Test Results
- [ ] Rollback rehearsed in staging: [date]
- [ ] Rollback duration: [X] minutes (must be ≤ RTO target of [X] minutes)
- [ ] Zero data loss confirmed: Yes / No
```

---

### Step 7 — Operational Handoff

Verify the operations and support teams are prepared:

**Runbooks**:
- [ ] Production runbook written: startup, shutdown, config changes, common errors
- [ ] Each runbook links to relevant dashboards, log queries, and on-call contacts
- [ ] Runbook reviewed by at least one operator who did not write it

**On-Call**:
- [ ] On-call rotation configured for go-live week (24/7 coverage)
- [ ] On-call playbook covers top 5 failure scenarios
- [ ] Escalation path defined (L1 → L2 → engineering on-call)

**Support Team**:
- [ ] Support team trained on new system flows and UI changes
- [ ] Known behavioural differences from legacy documented for support reference
- [ ] Support ticket routing updated to new components

---

### Step 8 — Smoke Test Plan

Define the post-cutover smoke test plan. This must be executable within 15 minutes of cutover:

```markdown
## Post-Cutover Smoke Test Plan — [Project Name]

**Owner**: [Name]
**Target execution time**: < 15 minutes
**Failure response**: If any smoke test fails, invoke rollback plan

| # | Test | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|
| 1 | Health check | GET /health | HTTP 200, status: "UP" | |
| 2 | Login | POST /api/auth/login with test user | JWT token returned | |
| 3 | Primary business flow | [Describe core happy path — 3 steps max] | Success response | |
| 4 | Data read | Fetch a known record migrated from legacy | Record present and correct | |
| 5 | External integration | Trigger one integration call (e.g. send email, payment ping) | Integration responds 200 | |
| 6 | Monitoring | Check dashboard — are metrics flowing? | Request rate visible, no error spike | |
```

---

### Step 9 — Go/No-Go Decision

After all steps above are complete, produce the formal go/no-go document:

```markdown
# Go/No-Go Decision — [Project Name]

**Date**: [YYYY-MM-DD]
**Cutover window**: [start datetime] – [end datetime] [timezone]

## Summary
| Gate | Status | Owner | Notes |
|---|---|---|---|
| Functional completeness | ✅ / ❌ BLOCKER | | |
| UAT sign-off | ✅ / ❌ BLOCKER | | |
| Performance regression | ✅ / ❌ BLOCKER | | |
| Security clearance | ✅ / ❌ BLOCKER | | |
| Data migration readiness | ✅ / N/A | | |
| Observability readiness | ✅ / ⚠️ | | |
| Rollback readiness | ✅ / ❌ BLOCKER | | |
| Operational handoff | ✅ / ⚠️ | | |

## Decision
**[ ] GO** — All blockers resolved. Proceed with cutover.  
**[ ] NO-GO** — Outstanding blockers: [list]. Re-evaluate on [date].

## Accepted Risks
List any ⚠️ partial or open items accepted with documented justification:
1. [Risk description] — Accepted by [Name, Role] on [date] — Mitigation: [plan]

## Stakeholder Sign-offs
| Name | Role | Signature / Approval | Date |
|---|---|---|---|
| | Product Owner | | |
| | Lead Engineer | | |
| | Security | | |
| | Operations | | |
```

---

## Output Files

### `release_readiness_checklist.md`
Consolidates all checklist items from Steps 1–8 in a single reviewable document. Format:
```markdown
# Release Readiness Checklist — [Project Name] — [Date]

## Functional Readiness (Step 1)
[table]

## Performance Readiness (Step 2)
[table]

## Security Readiness (Step 3)
[items]

## Data Migration Readiness (Step 4)
[items]

## Observability Readiness (Step 5)
[items]

## Rollback Readiness (Step 6)
[items]

## Operational Handoff (Step 7)
[items]
```

### `go_no_go_decision.md`
Formal decision record from Step 9.

### `smoke_test_plan.md`
Executable smoke test table from Step 8.

---

## Definition of Done (DoD)

- [ ] All Phase 5 comparison report ❌ Missing items resolved or formally accepted
- [ ] UAT completed with product owner sign-off
- [ ] Performance regression table complete — zero blocking regressions (or accepted with written sign-off)
- [ ] Security gate passed — zero critical/high open findings
- [ ] Rollback plan tested in staging and duration within RTO
- [ ] All observability checklist items ✅
- [ ] Smoke test plan written with owner assigned
- [ ] Go/No-Go decision document produced with stakeholder signatures
- [ ] `release_readiness_checklist.md`, `go_no_go_decision.md`, `smoke_test_plan.md` all written to `ai-driven-development/docs/final_validation/`

---

## Agentic Evaluation Framework

This section defines how to audit any agent's output for DoD compliance. Use it when reviewing a completed phase, when taking over an in-progress project, or when running a quality gate before proceeding to the next phase.

---

### Evaluation Protocol

**For each completed phase**, run the following 4-step evaluation:

#### Step E1 — Artifact Presence Check

Read `ai-driven-development/redesign_progress.md` and the relevant skill's **Output Directory** table. For every expected output file:
- ✅ `Present` — file exists at the specified path
- ❌ `Missing` — file does not exist → **Phase is not complete**

```markdown
## Artifact Presence — Phase {N} [{skill-name}]
| Expected Artifact | Path | Status |
|---|---|---|
| legacy_analysis.md | ai-driven-development/docs/legacy_analysis/ | ✅ Present |
| risk_matrix.md | ai-driven-development/docs/legacy_analysis/ | ❌ Missing |
```

**If any artifact is missing**: Mark phase as `❌ Incomplete` and do not proceed.

---

#### Step E2 — DoD Checkbox Audit

Read the skill's **Definition of Done (DoD)** section. For each checkbox item:
- ✅ `Pass` — the item is demonstrably satisfied by the artifact content
- ⚠️ `Partial` — item is partially satisfied; record what is missing
- ❌ `Fail` — item is not satisfied and is blocking

Record the DoD audit result:

```markdown
## DoD Audit — Phase {N} [{skill-name}]
| DoD Item | Status | Evidence / Gap |
|---|---|---|
| Legacy modules/packages listed | ✅ Pass | Section 2 of legacy_analysis.md |
| All DB tables inventoried | ⚠️ Partial | 47/52 tables documented; stored proc inventory missing |
| Security findings listed | ✅ Pass | Section 6 of legacy_analysis.md |
| Integration map complete | ❌ Fail | integration_map.md not created |
```

**Scoring**:
- **Green (proceed)**: All items ✅ Pass or ⚠️ Partial with documented acceptance
- **Yellow (proceed with risk)**: ≤ 2 ⚠️ Partial items; all ❌ Fail items formally accepted in writing
- **Red (do not proceed)**: Any ❌ Fail item unresolved without written stakeholder acceptance

---

#### Step E3 — Evidence Quality Check

For each major finding or decision in the phase output, verify it is backed by evidence per [core.md](../standards/core.md) § Evidence Rules:
- **Code evidence**: finding references a specific file, class, function, line range, or query
- **Config evidence**: finding references a named config file or environment variable
- **Schema evidence**: finding references a table name, column, constraint, or stored procedure

Flag unsupported claims:

```markdown
## Evidence Gaps — Phase {N} [{skill-name}]
| Claim | Type | Evidence Present? | Notes |
|---|---|---|---|
| "Password stored in plain text" | Security | ✅ Yes | User.java:45 — MD5 hash |
| "System has high coupling" | Architecture | ⚠️ Weak | Qualitative only — no dependency metrics |
| "DB performs poorly at scale" | Performance | ❌ No | No query plans, indexes, or timing cited |
```

---

#### Step E4 — Phase Readiness Score

Aggregate the three checks into a single readiness score:

```markdown
## Phase Readiness Score — Phase {N} [{skill-name}]
| Check | Result | Blocking? |
|---|---|---|
| Artifact Presence | ✅ 5/5 present | No |
| DoD Audit | ⚠️ 8/10 pass, 2 partial | No (accepted) |
| Evidence Quality | ❌ 2 unsupported claims | YES — must remediate |

**Overall**: 🔴 NOT READY TO PROCEED — remediate evidence gaps first
```

Readiness levels:
- 🟢 **READY** — All checks green/yellow, no unresolved blockers
- 🟡 **CONDITIONALLY READY** — Proceed with documented accepted risks
- 🔴 **NOT READY** — One or more blocking items must be remediated

---

### Cross-Phase Consistency Check

After all phases complete (before Phase 6 go/no-go), run a cross-phase consistency audit:

| Consistency Rule | Check |
|---|---|
| Tech stack in Phase 3 matches `tech_stack_selections.md` | Read both documents; verify no contradictions |
| API contracts in Phase 3 match Phase 4b implementation | Spot-check 3 endpoints from target_architecture vs backend code |
| UI component names in Phase 4a match Phase 4c implementation | Spot-check 5 component names from wireframes vs frontend code |
| Data model in Phase 3 matches Phase 4f migration scripts | Compare ERD from target architecture vs migration DDL |
| Security findings in Phase 4g match Phase 5 risk register | All open findings referenced in comparison report |

Record any contradictions as cross-phase discrepancies and resolve before issuing a Go decision.

---

### Evaluation Output Format

When running a full project evaluation (e.g., before Phase 6 or when taking over an in-progress project), produce:

```markdown
# Project Evaluation Report — [Project Name] — [Date]

## Phases Evaluated
| Phase | Agent | Readiness | Notes |
|---|---|---|---|
| 1 | legacy-analysis | 🟢 READY | All artifacts present, DoD 12/12 |
| 2 | legacy-architecture | 🟡 CONDITIONALLY READY | 1 diagram outdated — accepted |
| 3 | target-architecture | 🟢 READY | |
| 4a | ui-ux-design | 🟢 READY | |
| 4b | backend-development | 🔴 NOT READY | OpenAPI spec missing |
| 5 | compare-legacy-to-new | ⏳ Not started | Blocked by Phase 4b |

## Blockers
1. Phase 4b: OpenAPI spec not generated (DoD item 3/10 ❌ Fail)

## Accepted Risks
1. Phase 2: Architecture diagram for batch processor subsystem is outdated — accepted by [Name] [date]

## Recommended Next Action
Remediate Phase 4b OpenAPI spec, then proceed to Phase 5.
```

---

## Next Step
Phase 6 is the final phase. After Go decision:
1. Execute smoke test plan immediately post-cutover
2. Monitor dashboards for 24 hours post-cutover
3. Archive `redesign_progress.md` as `redesign_progress_final.md`
