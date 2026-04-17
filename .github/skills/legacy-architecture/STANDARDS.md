# Legacy System Design Standards

> **Tier 2 — Skill-local standards.** Extends [Core Standards (Tier 1)](../../standards/core.md). Core standards apply universally; this file adds legacy-architecture–specific HTML templates and diagram conventions.

Reference templates for producing the `legacy_architecture.html` file.
Use these as starting points — **replace all placeholder node labels** with the actual legacy system components discovered during analysis.

> ⚠️ **CRITICAL FILE RULE**: Always **overwrite** `legacy_architecture.html` completely — NEVER append to it.
> If the file already exists, replace its entire contents. Two complete HTML documents in one file will break rendering.

---

## HTML + Mermaid.js Page Template

This is the base HTML structure for `legacy_architecture.html`. Populate all `<pre class="mermaid">` blocks with diagrams from the analysis.

Use the **warm light design system** — warm cream/amber palette: `#7c4a1e` primary, `#b97230` secondary, `#d4872a` accent, `#fdfaf5` background, no dark backgrounds anywhere. Mermaid uses `theme: 'default'` with `fontFamily: 'system-ui, Segoe UI, sans-serif'`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Legacy Architecture</title>
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
      --primary: #7c4a1e; --secondary: #b97230; --accent: #d4872a;
      --bg: #fdfaf5; --card-bg: #ffffff; --text: #2c1a0e;
      --border: #e8d9c4; --warn: #b91c1c;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
    header { background: #fdf2e0; color: #3d1f0a; padding: 32px 48px; border-bottom: 3px solid var(--accent); }
    header h1 { font-size: 2rem; font-weight: 700; }
    header p { margin-top: 8px; opacity: 0.75; font-size: 1.05rem; }
    main { max-width: 1400px; margin: 0 auto; padding: 32px 48px; }
    .section { margin-bottom: 48px; }
    .section h2 { font-size: 1.5rem; color: var(--primary); border-left: 5px solid var(--accent); padding-left: 16px; margin-bottom: 16px; }
    .section h3 { font-size: 1.1rem; color: var(--secondary); margin: 24px 0 8px; }
    .diagram-wrap { background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; padding: 24px 32px; box-shadow: 0 2px 8px rgba(124,74,30,0.08); margin-bottom: 24px; overflow: hidden; position: relative; min-height: 140px; }
    .diagram-title { font-size: 1.0rem; font-weight: 600; color: var(--primary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .diagram-title::before { content: "▶"; color: var(--accent); }
    .mermaid { min-width: 400px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
    th { background: #f5e4c8; color: #5a3010; padding: 10px 14px; text-align: left; font-weight: 600; }
    td { padding: 8px 14px; border-bottom: 1px solid var(--border); }
    tr:nth-child(even) td { background: #fdfaf5; }
    tr:hover td { background: #fdf0d8; }
    footer { background: #fdf2e0; color: var(--secondary); text-align: center; padding: 20px; font-size: 0.85rem; margin-top: 48px; }
    @media (max-width: 768px) { main { padding: 20px 16px; } header { padding: 24px 20px; } }
  </style>
</head>
<body>

<header>
  <h1>Legacy System Architecture</h1>
  <p>Legacy architecture diagrams — produced by legacy-architecture skill</p>
</header>

<main>

  <div class="section" id="arch">
    <h2>1. High-Level Architecture</h2>
    <div class="diagram-wrap">
      <div class="diagram-title">System Boundary Overview</div>
      <pre class="mermaid">
graph TB
    subgraph "Clients"
        UI[Web UI - Legacy]
        Mobile[Mobile Client]
    end
    subgraph "Application Server"
        APP[Monolithic Application]
        BIZ[Business Logic Layer]
        DAL[Data Access Layer]
    end
    subgraph "Infrastructure"
        DB[(Relational Database)]
        FS[File System]
        MQ[Message Queue]
    end
    subgraph "External Systems"
        LDAP["LDAP / SSO"]
        EXT[External APIs]
        EMAIL[Email Server]
    end
    UI --> APP
    Mobile --> APP
    APP --> BIZ
    BIZ --> DAL
    DAL --> DB
    DAL --> FS
    BIZ --> MQ
    APP --> LDAP
    BIZ --> EXT
    BIZ --> EMAIL
      </pre>
    </div>
  </div>

  <div class="section" id="component">
    <h2>2. Component Dependency Diagram</h2>
    <div class="diagram-wrap">
      <div class="diagram-title">Module Dependencies</div>
      <pre class="mermaid">
graph LR
    subgraph "Core Modules"
        AUTH[Auth Module]
        CORE[Core Business Module]
        REPORT[Reporting Module]
    end
    subgraph "Supporting"
        UTIL["Utility / Helpers"]
        CONFIG[Config Module]
        LOG[Logging Module]
    end
    CORE --> AUTH
    CORE --> UTIL
    CORE --> CONFIG
    REPORT --> CORE
    AUTH --> LDAP_INT[LDAP Integration]
    LOG -.->|cross-cutting| CORE
    LOG -.->|cross-cutting| AUTH
    LOG -.->|cross-cutting| REPORT
      </pre>
    </div>
  </div>

  <div class="section" id="dataflow">
    <h2>3. Data Flow Diagram</h2>
    <div class="diagram-wrap">
      <div class="diagram-title">Request Processing Flow</div>
      <pre class="mermaid">
flowchart TD
    INPUT[User Request] --> VALIDATION[Input Validation]
    VALIDATION --> AUTH_CHK{"Authorized?"}
    AUTH_CHK -- No --> ERROR["Return 401/403"]
    AUTH_CHK -- Yes --> BUSINESS[Business Processing]
    BUSINESS --> DB_READ[(DB Read)]
    BUSINESS --> DB_WRITE[(DB Write)]
    BUSINESS --> EXT_CALL[External System Call]
    DB_WRITE --> RESPONSE[Response to Client]
    EXT_CALL --> RESPONSE
      </pre>
    </div>
  </div>

  <div class="section" id="auth">
    <h2>4. Authentication Flow</h2>
    <div class="diagram-wrap">
      <div class="diagram-title">Login & Session Sequence</div>
      <pre class="mermaid">
sequenceDiagram
    participant U as User
    participant APP as Application
    participant LDAP as "LDAP Server"
    participant DB as Database
    U->>APP: Login Request (username/password)
    APP->>LDAP: Bind + Authenticate
    LDAP-->>APP: Auth Result
    alt Auth Success
        APP->>DB: Load User Roles
        DB-->>APP: Roles / Permissions
        APP-->>U: Session Token / Cookie
    else Auth Failure
        APP-->>U: 401 Unauthorized
    end
      </pre>
    </div>
  </div>

</main>

<footer>
  <p>Legacy System Architecture — produced by legacy-architecture skill</p>
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

### Rule 3 — Node ID Rules

| Rule | Correct | Incorrect |
|---|---|---|
| No spaces in IDs | `AUTH_SRV[Auth Service]` | `AUTH SRV[Auth Service]` |
| Reserved words as IDs | `END_NODE[End]` | `end[End]` (reserved keyword) |
| Special chars in labels | `A["My (Node)"]` | `A[My (Node)]` |
| Slash in labels | `A["LDAP / SSO"]` | `A[LDAP / SSO]` |
| Question mark in diamond | `A{"Done?"}` | `A{Done?}` |
| Slash in diamond | `A{"401/403"}` | `A{401/403}` |

### Rule 4 — Participant Names with Special Characters (sequenceDiagram)

Quote participant display names that contain parentheses, commas, slashes, spaces, or any other characters that could be ambiguous:

✅ `participant LDAP as "LDAP Server"`  
✅ `participant IDP as "Identity Provider (LDAP/Keycloak)"`  
❌ `participant LDAP as LDAP Server`  
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

1. **File exists** — confirm `create_file` succeeded at the exact path (e.g., `ai-driven-development/docs/legacy_architecture/legacy_architecture.html`)
2. **Single HTML document** — `<!DOCTYPE html>` appears exactly **once** in the file
3. **Use `<pre class="mermaid">`** — no `<div class="mermaid">` elements exist in the file
4. **Tag balance** — every `<pre class="mermaid">` has a matching `</pre>` on its own line
5. **Diagram count** — number of `<pre class="mermaid">` blocks matches the planned number of diagrams
6. **No `\n` in labels** — no `\n` appears inside quoted Mermaid node labels; replace with `<br/>`
7. **Quoted special chars** — all node labels and participant display names containing `()`, `/`, `?`, `,`, or spaces are double-quoted
8. **All blocks closed** — every `subgraph`, `alt`, `loop`, `opt` has a matching `end`
9. **No empty diagram blocks** — each `<pre class="mermaid">` contains actual diagram content

If any check fails, **overwrite the entire file** with corrected content using `create_file` — never patch individual lines.

---

## Output Document Structure (`legacy_architecture.md`)

```markdown
# Legacy System Architecture

## 1. Architectural Style
[Describe: monolith / distributed / client-server / SOA / etc.]

## 2. Module Inventory
### 2.1 Module List with Responsibilities
| Module | Responsibility | Technology | Owner |
|---|---|---|---|

### 2.2 Module Dependency Matrix
[Table: which modules depend on which]

## 3. Communication Patterns
### 3.1 Synchronous Calls
### 3.2 Asynchronous Flows
### 3.3 Database Coupling Points

## 4. Cross-Cutting Concerns
[Logging, Auth, Error Handling, Config]

## 5. Architectural Weaknesses
| # | Weakness | Evidence | Impact | Migration Risk |
|---|---|---|---|---|

## 6. Coupling Hotspots
[List tightest dependencies]

## 7. Constraints for New Design
[Hard constraints that must be respected]
```

---

## Architectural Weakness Table Template

| # | Weakness | Evidence | Impact | Migration Risk |
|---|---|---|---|---|
| 1 | Shared database between modules | Multiple modules write to `USERS` table | High coupling | High |
| 2 | Business logic in stored procedures | 40+ stored procs with complex logic | Hard to test/migrate | High |
| 3 | Hard-coded configuration | DB URLs in source code | Security risk | Medium |

Use `High / Medium / Low` for Impact and Migration Risk columns.