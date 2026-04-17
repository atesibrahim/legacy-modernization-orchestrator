# Target System Design Standards

> **Tier 2 — Skill-local standards.** Extends [Core Standards (Tier 1)](../../standards/core.md). Core standards apply universally; this file adds target-architecture–specific HTML templates and diagram conventions.

Reference templates for producing `target_architecture.html` and `target_architecture.md`.
Use these as starting points — **replace all placeholder names, services, and labels** with the actual system components.

> ⚠️ **CRITICAL FILE RULE**: Always **overwrite** `target_architecture.html` completely — NEVER append to it.
> If the file already exists, replace its entire contents. Two complete HTML documents in one file will break rendering.

---

## HTML + Mermaid.js Page Template

Base HTML structure for `target_architecture.html`. Add diagram sections as needed per project scope.

Use the **warm light design system** — warm off-white/terracotta palette: `#1e3a5f` primary, `#2d6da3` secondary, `#e07840` accent, `#f8f7f5` background, no dark backgrounds anywhere. Mermaid uses `theme: 'default'` with `fontFamily: 'system-ui, Segoe UI, sans-serif'`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Target System Architecture</title>
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
    :root {
      --primary: #1e3a5f; --secondary: #2d6da3; --accent: #e07840;
      --green: #3a8a5c; --red: #c0392b; --bg: #f8f7f5;
      --card-bg: #ffffff; --text: #1a1a1a; --border: #e5e0d9; --code-bg: #f3f0eb;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); line-height: 1.65; }
    header { background: #f2f5f9; color: #0d2440; padding: 36px 48px; border-bottom: 3px solid var(--accent); }
    header h1 { font-size: 2.2rem; font-weight: 800; letter-spacing: -0.5px; }
    header .subtitle { margin-top: 10px; color: #3a5070; font-size: 1.05rem; }
    main { max-width: 1440px; margin: 0 auto; padding: 36px 48px; }
    .section { margin-bottom: 56px; }
    .section h2 { font-size: 1.6rem; color: var(--primary); border-left: 5px solid var(--accent); padding-left: 16px; margin-bottom: 20px; padding-bottom: 8px; }
    .section h3 { font-size: 1.1rem; color: var(--secondary); margin: 28px 0 10px; font-weight: 600; }
    .diagram-wrap { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 24px 32px; box-shadow: 0 1px 6px rgba(0,0,0,0.05); margin-bottom: 28px; overflow: hidden; position: relative; min-height: 140px; }
    .diagram-title { font-size: 1.0rem; font-weight: 700; color: var(--primary); margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    .diagram-title::before { content: "⬡"; color: var(--accent); font-size: 1.2rem; }
    .mermaid { min-width: 400px; }
    .adr { background: #fef6f0; border-left: 4px solid var(--accent); padding: 1rem 1.2rem; border-radius: 0 8px 8px 0; margin-bottom: 1rem; border-top: 1px solid var(--border); border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    table { width: 100%; border-collapse: collapse; font-size: 0.91rem; }
    th { background: #e8eef5; color: var(--primary); padding: 11px 16px; text-align: left; font-weight: 600; }
    td { padding: 9px 16px; border-bottom: 1px solid var(--border); }
    tr:nth-child(even) td { background: #f8f7f5; }
    tr:hover td { background: #f0ebe3; }
    footer { background: #f2f5f9; color: var(--secondary); text-align: center; padding: 24px; font-size: 0.85rem; margin-top: 56px; }
    @media (max-width: 768px) { main { padding: 20px 16px; } header { padding: 24px 20px; } }
  </style>
</head>
<body>

<header>
  <h1>Target System Architecture</h1>
  <div class="subtitle">New system design — produced by target-architecture skill</div>
</header>

<main>

  <div class="section" id="arch">
    <h2>1. High-Level Target Architecture</h2>
    <div class="diagram-wrap">
      <div class="diagram-title">Full System Architecture Overview</div>
      <pre class="mermaid">
graph TB
    subgraph "Clients"
        WEB[React 18 Web App]
        IOS[iOS App - Swift]
        AND[Android App - Kotlin]
    end
    subgraph "API Gateway Layer"
        GW[API Gateway]
        AUTH_SRV["Auth Service - OAuth2/JWT"]
    end
    subgraph "Domain Services"
        SVC1[Domain Service A]
        SVC2[Domain Service B]
        SVC3[Domain Service C]
    end
    subgraph "Infrastructure"
        MQ[Message Broker]
        CACHE[Cache - Redis]
        DB1[(Domain DB A)]
        DB2[(Domain DB B)]
    end
    subgraph "Observability"
        LOG[Centralized Logging]
        METRICS[Metrics - Prometheus]
        TRACE[Tracing - OpenTelemetry]
    end
    WEB --> GW
    IOS --> GW
    AND --> GW
    GW --> AUTH_SRV
    GW --> SVC1
    GW --> SVC2
    GW --> SVC3
    SVC1 --> DB1
    SVC2 --> DB2
    SVC1 --> MQ
    SVC2 --> CACHE
    SVC1 -.->|"metrics/logs"| LOG
    SVC2 -.->|"metrics/logs"| METRICS
      </pre>
    </div>
  </div>

  <div class="section" id="context">
    <h2>2. Bounded Context Map</h2>
    <div class="diagram-wrap">
      <div class="diagram-title">DDD Context Relationships</div>
      <pre class="mermaid">
graph LR
    subgraph "Core Domain"
        BC1["Bounded Context A<br/>(Core Business)"]
        BC2["Bounded Context B<br/>(Secondary)"]
    end
    subgraph "Supporting Domain"
        BC3["Auth Context<br/>(Supporting)"]
        BC4["Notification Context<br/>(Generic)"]
    end
    subgraph "Generic Subdomain"
        BC5["Reporting Context<br/>(Generic)"]
    end
    BC1 -->|"Customer-Supplier"| BC2
    BC3 -->|"Anticorruption Layer"| BC1
    BC1 -->|"Published Language"| BC4
    BC2 -->|"Published Language"| BC5
      </pre>
    </div>
  </div>

  <div class="section" id="auth">
    <h2>3. Authentication Flow (OAuth2/JWT)</h2>
    <div class="diagram-wrap">
      <div class="diagram-title">JWT + Identity Provider Authorization Sequence</div>
      <pre class="mermaid">
sequenceDiagram
    participant U as User
    participant FE as "React Frontend"
    participant GW as "API Gateway"
    participant AUTH as "Auth Service"
    participant IDP as "Identity Provider (LDAP/Keycloak)"
    participant SVC as "Domain Service"

    U->>FE: Login (username/password)
    FE->>AUTH: POST /auth/token
    AUTH->>IDP: Authenticate credentials
    IDP-->>AUTH: User identity + roles
    AUTH-->>FE: access_token + refresh_token (JWT)
    FE->>GW: API Request (Bearer token)
    GW->>AUTH: Validate token (introspection)
    AUTH-->>GW: Token valid + claims
    GW->>SVC: Forward request + user context
    SVC-->>GW: Response
    GW-->>FE: Response
      </pre>
    </div>
  </div>

  <div class="section" id="deploy">
    <h2>4. Deployment Architecture</h2>
    <div class="diagram-wrap">
      <div class="diagram-title">Docker + CI/CD Pipeline</div>
      <pre class="mermaid">
graph TB
    subgraph "CI/CD Pipeline"
        GIT[Git Repository]
        CI[CI - Build + Test]
        REG[Container Registry]
    end
    subgraph "Runtime Environment"
        subgraph "Kubernetes / Docker"
            POD1[Service A Pod]
            POD2[Service B Pod]
            POD3[Auth Service Pod]
            GW_POD[API Gateway Pod]
        end
        subgraph "Managed Services"
            DB_MANAGED[(Managed Database)]
            CACHE_MANAGED[(Managed Redis)]
            MQ_MANAGED[Managed Broker]
        end
    end
    GIT --> CI
    CI --> REG
    REG --> POD1
    REG --> POD2
    REG --> POD3
    REG --> GW_POD
    POD1 --> DB_MANAGED
    POD2 --> CACHE_MANAGED
    POD1 --> MQ_MANAGED
      </pre>
    </div>
  </div>

</main>

<footer>
  <p>Target System Architecture — produced by target-architecture skill</p>
</footer>

<script>
  (async function() {
    await mermaid.run({ querySelector: '.mermaid' });
    document.querySelectorAll('.diagram-wrap').forEach(function(wrap) {
      var svg = wrap.querySelector('svg');
      if (!svg) return;
      var tb = document.createElement('div');
      tb.style.cssText = 'display:flex;gap:6px;margin-bottom:10px;';
      [['＋','zoomIn'],['－','zoomOut'],['⊙ Reset','reset']].forEach(function(pair) {
        var btn = document.createElement('button');
        btn.textContent = pair[0];
        btn.style.cssText = 'background:#e8eef5;color:#1e3a5f;border:1px solid #2d6da3;border-radius:4px;padding:3px 10px;cursor:pointer;font-size:0.82rem;font-family:inherit;';
        btn.onmouseover = function(){ this.style.background='#e07840'; this.style.color='#fff'; this.style.borderColor='#e07840'; };
        btn.onmouseout  = function(){ this.style.background='#e8eef5'; this.style.color='#1e3a5f'; this.style.borderColor='#2d6da3'; };
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

## Mermaid Syntax Rules & Common Errors

Follow these rules strictly when populating diagram blocks to prevent rendering failures.

### Rule 1 — Use `<pre class="mermaid">` (not `<div>`)

✅ Correct:
```html
<pre class="mermaid">
graph TB
    A --> B
</pre>
```
❌ Incorrect — browser may HTML-parse content before Mermaid processes it:
```html
<div class="mermaid">
graph TB
    A --> B
</div>
```

### Rule 2 — Line Breaks in Node Labels

With `htmlLabels: true`, use `<br/>` not `\n` for line breaks inside quoted node labels.

✅ `A["Line One<br/>Line Two"]`  
❌ `A["Line One\nLine Two"]` — renders as the literal characters `\n`

### Rule 3 — Node ID and Edge Label Rules

| Rule | Correct | Incorrect |
|---|---|---|
| No spaces in IDs | `AUTH_SRV[Auth Service]` | `AUTH SRV[Auth Service]` |
| Reserved words as IDs | `END_NODE[End]` | `end[End]` (reserved keyword) |
| Special chars in node labels | `A["OAuth2/JWT"]` | `A[OAuth2/JWT]` |
| Slash in edge labels | `A -.->|"metrics/logs"| B` | `A -.->|metrics/logs| B` |
| Question mark in diamond | `A{"Done?"}` | `A{Done?}` |

### Rule 4 — Participant Names with Special Characters (sequenceDiagram)

Quote all participant display names that contain parentheses, commas, slashes, or multiple words:

✅ `participant FE as "React Frontend"`  
✅ `participant GW as "API Gateway"`  
✅ `participant IDP as "Identity Provider (LDAP/Keycloak)"`  
❌ `participant FE as React Frontend`  
❌ `participant IDP as Identity Provider (LDAP/Keycloak)`

### Rule 5 — Always Close `subgraph` and `alt`/`loop` Blocks

Every `subgraph` must end with `end`.  
Every `alt`, `else`, `loop`, `opt` in sequenceDiagram must have a matching `end`.

### Rule 6 — One Diagram Type Per Block

Each `<pre class="mermaid">` block must contain exactly one diagram.  
Valid openers: `graph TB`, `graph LR`, `flowchart TD`, `sequenceDiagram`, `classDiagram`, `erDiagram`

---

## File Creation Validation Checklist

After generating the HTML file with `create_file`, verify all items before marking the step complete:

1. **File exists** — confirm `create_file` succeeded at the exact path (e.g., `ai-driven-development/docs/target_architecture/target_architecture.html`)
2. **Single HTML document** — `<!DOCTYPE html>` appears exactly **once** in the file
3. **Use `<pre class="mermaid">`** — no `<div class="mermaid">` elements exist in the file
4. **Tag balance** — every `<pre class="mermaid">` has a matching `</pre>` on its own line
5. **Diagram count** — number of `<pre class="mermaid">` blocks matches the planned number of diagrams
6. **No `\n` in labels** — no `\n` appears inside quoted Mermaid node labels; replace with `<br/>`
7. **Quoted special chars** — all node labels, edge labels, and participant display names containing `()`, `/`, `?`, `,`, or multiple words are double-quoted
8. **All blocks closed** — every `subgraph`, `alt`, `loop`, `opt` has a matching `end`
9. **No empty diagram blocks** — each `<pre class="mermaid">` contains actual diagram content

If any check fails, **overwrite the entire file** with corrected content using `create_file` — never patch individual lines.

---

## Architecture Decision Record (ADR) Template

Use for each major architectural decision. Required ADRs: architecture style, auth approach, DB strategy, message broker, mobile strategy.

```markdown
## ADR-00X: [Decision Title]

### Status
[Proposed / Accepted / Deprecated / Superseded by ADR-00Y]

### Context
[What situation or constraint forces this decision? What are the alternatives?]

### Decision
[What was decided.]

### Rationale
- [Reason 1]
- [Reason 2]

### Consequences
- [Positive trade-off]
- [Negative trade-off / limitation accepted]
```

---

## Non-Functional Requirements (NFR) Table Template

| NFR | Target | Measurement Method |
|---|---|---|
| Availability | 99.9% uptime | Uptime monitoring (Prometheus + Alertmanager) |
| API Latency (P95) | < 200 ms | APM / distributed tracing |
| Throughput | X req/sec per service | Load testing (k6 / Gatling) |
| Horizontal Scalability | N instances via HPA | Kubernetes HPA configuration |
| Recovery Time Objective (RTO) | < 30 min | DR drill |
| Recovery Point Objective (RPO) | < 5 min | Backup frequency validation |
| Test Coverage (Unit) | >= 80% | JaCoCo / Vitest coverage report |

---

## Output Document Structure (`target_architecture.md`)

```markdown
# Target System Architecture

## 1. Architecture Style Decision
[ADR-001 summary inline]

## 2. Domain Model (DDD)
### 2.1 Bounded Contexts
### 2.2 Context Relationships
### 2.3 Aggregates + Ubiquitous Language

## 3. Service / Module Design
| Module | Responsibility | Owns Data? | Exposes API? | Consumes Events? | Publishes Events? |

## 4. API Design
### 4.1 API-First Contracts (OpenAPI 3.1 specs)
### 4.2 Error Model
### 4.3 Versioning + Pagination

## 5. Data Architecture
### 5.1 Data Ownership per Bounded Context
### 5.2 Migration Strategy from Legacy

## 6. Security Architecture
### 6.1 Authentication (OAuth2 / LDAP)
### 6.2 Authorization (RBAC)
### 6.3 Secret Management

## 7. Non-Functional Requirements
[NFR table]

## 8. Architecture Decision Records
[ADR-001 through ADR-005]

## 9. Technology Stack (Confirmed Choices)
[Final confirmed selections from flexibles]
```