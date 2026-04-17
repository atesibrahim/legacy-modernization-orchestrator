# Comparison Standards

> **Tier 2 — Skill-local standards.** Extends [Core Standards (Tier 1)](../../standards/core.md). Core standards apply universally; this file adds comparison-report–specific HTML templates and coverage-status conventions.

Reference templates for producing `compare_legacy_to_new_system.html` and the comparison report.
Customize all technology labels, service names, and feature rows with actual system data.

---

## HTML Comparison Page Template

Complete starting template for `compare_legacy_to_new_system.html`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Legacy vs New System Comparison</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({ startOnLoad: true, theme: 'default' });</script>
  <style>
    body { font-family: Arial, sans-serif; padding: 2rem; background: #f7fafc; color: #2d3748; }
    h1 { color: #1a365d; }
    h2 { color: #2b6cb0; border-bottom: 2px solid #bee3f8; padding-bottom: 0.4rem; margin-top: 2rem; }
    .compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
    .panel { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .panel.legacy { border-top: 4px solid #fc8181; }
    .panel.new    { border-top: 4px solid #68d391; }
    .panel h3 { margin-bottom: 1rem; }
    .panel.legacy h3 { color: #c53030; }
    .panel.new h3    { color: #276749; }
    .badge { display: inline-flex; padding: 0.125rem 0.6rem; border-radius: 9999px;
             font-size: 0.75rem; font-weight: 700; margin: 0.125rem; }
    .badge-green  { background: #c6f6d5; color: #276749; }
    .badge-red    { background: #fed7d7; color: #9b2c2c; }
    .badge-yellow { background: #fefcbf; color: #744210; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.875rem; }
    th { background: #ebf8ff; padding: 0.75rem; text-align: left; border-bottom: 2px solid #bee3f8; }
    td { padding: 0.75rem; border-bottom: 1px solid #e2e8f0; }
    tr:hover td { background: #f7fafc; }
    .diagram { background: white; padding: 1.5rem; border-radius: 8px;
               box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 2rem; }
    .coverage-full    { color: #276749; font-weight: bold; }
    .coverage-partial { color: #744210; font-weight: bold; }
    .coverage-missing { color: #9b2c2c; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Legacy vs New System: Comparison Report</h1>

  <!-- Side-by-side summary cards -->
  <div class="compare-grid">
    <div class="panel legacy">
      <h3>🏚 Legacy System</h3>
      <p><strong>Architecture:</strong> Monolith</p>
      <p><strong>Language:</strong> Java [X]</p>
      <p><strong>Frontend:</strong> JSP / Static HTML</p>
      <p><strong>Auth:</strong> Custom session</p>
      <p><strong>DB Access:</strong> JDBC / Stored Procs</p>
      <p><strong>Deployment:</strong> Manual WAR</p>
      <p><strong>Tests:</strong> None</p>
      <p><strong>Observability:</strong> Log files</p>
    </div>
    <div class="panel new">
      <h3>🏗 New System</h3>
      <p><strong>Architecture:</strong> Modular Monolith</p>
      <p><strong>Language:</strong> Java 21 / React 18 / Kotlin</p>
      <p><strong>Frontend:</strong> React 18 + TypeScript</p>
      <p><strong>Auth:</strong> JWT + OAuth2/LDAP</p>
      <p><strong>DB Access:</strong> Spring Data JPA</p>
      <p><strong>Deployment:</strong> Docker + CI/CD</p>
      <p><strong>Tests:</strong> JUnit 5 + Playwright</p>
      <p><strong>Observability:</strong> Logs + Metrics + Traces</p>
    </div>
  </div>

  <!-- Architecture Evolution Diagram -->
  <h2>Architecture Evolution</h2>
  <div class="diagram">
    <pre class="mermaid">
graph LR
    subgraph "LEGACY"
        L_UI[JSP UI] --> L_APP[Monolithic App]
        L_APP --> L_DB[(Shared DB - JDBC/SP)]
        L_APP --> L_EXT[External Systems - SOAP]
        L_AUTH[Custom Session Auth] --> L_APP
    end
    subgraph "MIGRATION"
        M[Anticorruption Layer / Strangler Fig]
    end
    subgraph "NEW"
        N_WEB[React 18 SPA] --> N_GW[API Gateway]
        N_MOB[Mobile iOS/Android] --> N_GW
        N_GW --> N_AUTH[Auth Service - JWT/OAuth2]
        N_GW --> N_SVC1[Domain Service A]
        N_GW --> N_SVC2[Domain Service B]
        N_SVC1 --> N_DB1[(Domain DB A - JPA)]
        N_SVC2 --> N_DB2[(Domain DB B - JPA)]
        N_OBS[Observability Stack] -.->|monitor| N_GW
    end
    LEGACY --> M
    M --> NEW
    </pre>
  </div>

  <!-- Technology Migration Map -->
  <h2>Technology Migration Map</h2>
  <div class="diagram">
    <pre class="mermaid">
graph LR
    subgraph "Legacy Technologies"
        L1[Java 8]
        L2[JSP / jQuery]
        L3[JDBC + Stored Procedures]
        L4[Custom Session Auth]
        L5[Manual WAR Deployment]
        L6[File-based Messaging]
        L7[Cron Shell Scripts]
        L8[Manual Log Files]
    end
    subgraph "New Technologies"
        N1[Java 21 Virtual Threads]
        N2[React 18 + TypeScript]
        N3[Spring Data JPA + Hibernate]
        N4[JWT + OAuth2 / LDAP]
        N5[Docker + CI/CD Pipeline]
        N6[Kafka / RabbitMQ]
        N7[Spring Batch + Scheduler]
        N8[Structured Logs + Metrics + Traces]
    end
    L1 -->|"upgrade"| N1
    L2 -->|"rewrite"| N2
    L3 -->|"replace"| N3
    L4 -->|"replace"| N4
    L5 -->|"replace"| N5
    L6 -->|"replace"| N6
    L7 -->|"replace"| N7
    L8 -->|"replace"| N8
    </pre>
  </div>

  <!-- Functional Coverage Summary -->
  <h2>Functional Coverage Summary</h2>
  <table>
    <thead><tr><th>Module / Feature</th><th>Legacy</th><th>New</th><th>Status</th></tr></thead>
    <tbody>
      <tr><td>Authentication</td><td>Custom Session</td><td>JWT + OAuth2</td>
          <td class="coverage-full">✅ Full</td></tr>
      <tr><td>[Feature A]</td><td>[Legacy impl]</td><td>[New impl]</td>
          <td class="coverage-full">✅ Full</td></tr>
      <tr><td>[Feature B]</td><td>[Legacy impl]</td><td>[New impl]</td>
          <td class="coverage-partial">⚠️ Partial</td></tr>
      <tr><td>[Feature C]</td><td>[Legacy impl]</td><td>—</td>
          <td class="coverage-missing">❌ Planned</td></tr>
    </tbody>
  </table>

  <!-- Quality Improvements -->
  <h2>Quality Improvements</h2>
  <div class="compare-grid">
    <div class="panel">
      <h3>Changes</h3>
      <span class="badge badge-green">Performance Improved</span>
      <span class="badge badge-green">Security Hardened</span>
      <span class="badge badge-green">Tests Added</span>
      <span class="badge badge-green">CI/CD Automated</span>
      <span class="badge badge-green">API Documented (OpenAPI)</span>
      <span class="badge badge-green">Observability Added</span>
      <span class="badge badge-yellow">UI Redesigned (Retraining Needed)</span>
    </div>
    <div class="panel">
      <h3>Risks Remaining</h3>
      <span class="badge badge-red">Data Migration Not Complete</span>
      <span class="badge badge-yellow">External System Contracts Changed</span>
      <span class="badge badge-yellow">User Acceptance Testing Pending</span>
    </div>
  </div>

</body>
</html>
```

---

## Coverage Status Legend

| Symbol | Meaning |
|---|---|
| ✅ Full | Feature fully implemented and equivalent in new system |
| ⚠️ Partial | Feature implemented but missing edge cases or minor functionality |
| ❌ Missing / Planned | Feature not yet implemented in new system — requires action plan |
| 🗑️ Removed | Feature intentionally removed — sign-off from business required |

---

## Comparison Report Document Structure (`compare_legacy_to_new_system.md`)

```markdown
# Legacy vs New System: Comparison Report

## Executive Summary
[1–2 paragraph summary of migration status and readiness for cutover]

## 1. Functional Coverage Matrix
[Table: every legacy module/feature → new equivalent → ✅/⚠️/❌]

## 2. Architecture Comparison Table
| Dimension | Legacy | New | Change |
| Auth | ... | ... | Improved |
...

## 3. Non-Functional Improvements
[Performance, security, observability, reliability metrics]

## 4. Technology Migration Map
[Legacy tech → New tech with justification]

## 5. Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
...

## 6. Migration Strategy
[Chosen: Big Bang / Strangler Fig / Parallel Run / Feature Flags]
[Justification]

## 7. Cutover Readiness Checklist
[From SKILL.md Step 6]

## 8. Recommendation
[Go / No-Go with conditions]
```
