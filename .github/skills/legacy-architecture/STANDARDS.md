# Legacy System Design Standards

Reference templates for producing the `legacy_architecture.html` file.
Use these as starting points — **replace all placeholder node labels** with the actual legacy system components discovered during analysis.

> ⚠️ **CRITICAL FILE RULE**: Always **overwrite** `legacy_architecture.html` completely — NEVER append to it.
> If the file already exists, replace its entire contents. Two complete HTML documents in one file will break rendering.

---

## HTML + Mermaid.js Page Template

This is the base HTML structure for `legacy_architecture.html`. Populate all `<pre class="mermaid">` blocks with diagrams from the analysis.

Use the **professional navy/blue design system** — matching the reference `example_legacy_architecture.html` visual style: `#0a2540` primary, `#1a56db` secondary, `#f59e0b` accent, `#f8fafc` background. Mermaid uses `theme: 'default'` with `fontFamily: 'Segoe UI, Arial, sans-serif'`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Legacy Architecture</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      flowchart: { curve: 'basis', htmlLabels: true },
      sequence: { actorMargin: 80, boxMargin: 10 }
    });
  </script>
  <style>
    :root {
      --primary: #0a2540; --secondary: #1a56db; --accent: #f59e0b;
      --green: #10b981; --red: #ef4444; --bg: #f8fafc;
      --card-bg: #ffffff; --text: #1e293b; --border: #e2e8f0; --code-bg: #f1f5f9;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: var(--bg); color: var(--text); line-height: 1.65; }
    header { background: linear-gradient(135deg, var(--primary), #1e3a5f, var(--secondary)); color: white; padding: 36px 48px; border-bottom: 4px solid var(--accent); }
    header h1 { font-size: 2.2rem; font-weight: 800; letter-spacing: -0.5px; }
    header .subtitle { margin-top: 10px; opacity: 0.85; font-size: 1.05rem; }
    main { max-width: 1440px; margin: 0 auto; padding: 36px 48px; }
    .section { margin-bottom: 56px; }
    .section h2 { font-size: 1.6rem; color: var(--primary); border-left: 5px solid var(--accent); padding-left: 16px; margin-bottom: 20px; padding-bottom: 8px; }
    .section h3 { font-size: 1.1rem; color: var(--secondary); margin: 28px 0 10px; font-weight: 600; }
    .diagram-wrap { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 24px 32px; box-shadow: 0 1px 6px rgba(0,0,0,0.05); margin-bottom: 28px; overflow-x: auto; }
    .diagram-title { font-size: 1.0rem; font-weight: 700; color: var(--primary); margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    .diagram-title::before { content: "⬡"; color: var(--accent); font-size: 1.2rem; }
    .mermaid { min-width: 400px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.91rem; }
    th { background: var(--primary); color: white; padding: 11px 16px; text-align: left; font-weight: 600; }
    td { padding: 9px 16px; border-bottom: 1px solid var(--border); }
    tr:nth-child(even) td { background: #f8fafc; }
    tr:hover td { background: #eff6ff; }
    footer { background: var(--primary); color: #64748b; text-align: center; padding: 24px; font-size: 0.85rem; margin-top: 56px; }
    @media (max-width: 768px) { main { padding: 20px 16px; } header { padding: 24px 20px; } }
  </style>
</head>
<body>

<header>
  <h1>Legacy System Architecture</h1>
  <div class="subtitle">Legacy architecture diagrams — produced by legacy-architecture skill</div>
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
        LDAP[LDAP / SSO]
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
        UTIL[Utility / Helpers]
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
    VALIDATION --> AUTH_CHK{Authorized?}
    AUTH_CHK -- No --> ERROR[Return 401/403]
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
    participant LDAP as LDAP Server
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

### Rule 4 — Participant Names with Special Characters (sequenceDiagram)

Quote participant display names that contain parentheses, commas, slashes, or spaces that could be ambiguous:

✅ `participant IDP as "Identity Provider (LDAP/Keycloak)"`  
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
7. **Quoted special chars** — participant names and labels containing `()`, `/`, or `,` are double-quoted
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
