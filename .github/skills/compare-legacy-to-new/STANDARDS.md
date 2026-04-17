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
  <script src="https://cdn.jsdelivr.net/npm/panzoom@9/dist/panzoom.min.js"></script>
  <script>
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'system-ui, Segoe UI, sans-serif',
      fontSize: 15,
      flowchart: { curve: 'basis', htmlLabels: true },
      sequence: { actorMargin: 80, boxMargin: 10 }
    });
  </script>
  <style>
    body { font-family: system-ui, 'Segoe UI', sans-serif; padding: 2rem; background: #fdfaf5; color: #1a1a1a; }
    h1 { color: #7c4a1e; font-size: 1.8rem; font-weight: 700; margin-bottom: 1.5rem; }
    h2 { color: #1e3a5f; border-bottom: 2px solid #e8d9c4; padding-bottom: 0.4rem; margin-top: 2rem; }
    .compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
    .panel { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .panel.legacy { border-top: 4px solid #e07070; }
    .panel.new    { border-top: 4px solid #5db882; }
    .panel h3 { margin-bottom: 1rem; }
    .panel.legacy h3 { color: #9b2c2c; }
    .panel.new h3    { color: #276749; }
    .badge { display: inline-flex; padding: 0.125rem 0.6rem; border-radius: 9999px;
             font-size: 0.75rem; font-weight: 700; margin: 0.125rem; }
    .badge-green  { background: #d1fae5; color: #065f46; }
    .badge-red    { background: #fee2e2; color: #9b2c2c; }
    .badge-yellow { background: #fef9c3; color: #713f12; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.875rem; }
    th { background: #f5e4c8; color: #5a3010; padding: 0.75rem; text-align: left; border-bottom: 2px solid #e8d9c4; font-weight: 600; }
    td { padding: 0.75rem; border-bottom: 1px solid #e8d9c4; }
    tr:hover td { background: #fdf5e8; }
    .diagram { background: white; padding: 1.5rem; border-radius: 8px;
               box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 2rem;
               overflow: hidden; position: relative; min-height: 140px; }
    .coverage-full    { color: #276749; font-weight: bold; }
    .coverage-partial { color: #713f12; font-weight: bold; }
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

<script>
  (async function() {
    await mermaid.run({ querySelector: '.mermaid' });
    document.querySelectorAll('.diagram').forEach(function(wrap) {
      var svg = wrap.querySelector('svg');
      if (!svg) return;
      var tb = document.createElement('div');
      tb.style.cssText = 'display:flex;gap:6px;margin-bottom:10px;';
      [['＋','zoomIn'],['－','zoomOut'],['⊙ Reset','reset']].forEach(function(pair) {
        var btn = document.createElement('button');
        btn.textContent = pair[0];
        btn.style.cssText = 'background:#f5e4c8;color:#5a3010;border:1px solid #d4872a;border-radius:4px;padding:3px 10px;cursor:pointer;font-size:0.82rem;font-family:inherit;';
        btn.onmouseover = function(){ this.style.background='#d4872a'; this.style.color='#fff'; };
        btn.onmouseout  = function(){ this.style.background='#f5e4c8'; this.style.color='#5a3010'; };
        btn._act = pair[1];
        tb.appendChild(btn);
      });
      wrap.insertBefore(tb, wrap.firstChild);
      svg.style.cursor = 'grab';
      var pz = panzoom(svg, { maxZoom: 5, minZoom: 0.15, zoomDoubleClickSpeed: 1 });
      tb.querySelectorAll('button').forEach(function(btn) {
        btn.addEventListener('click', function() { pz[btn._act](); });
      });
    });
  })();
</script>
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
