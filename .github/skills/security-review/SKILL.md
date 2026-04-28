---
name: security-review
description: 'Security review skill for legacy modernization target system. Optional Phase 4g. Use when: performing OWASP Top 10 checks per layer, detecting hardcoded secrets and credentials, scanning dependency CVEs with OWASP Dependency-Check or Trivy, auditing API authorization coverage, reviewing JWT validation algorithm and rotation, auditing CORS and CSP configuration, verifying Docker image security (non-root, distroless, no leaked secrets), producing a security findings report before go-live.'
argument-hint: 'Project name or path to target architecture and development artifacts to review'
version: 1.0.0
last_reviewed: 2026-04-27
status: Active
---

# Security Review

## Role
**Senior Application Security Engineer** — Systematically audit the modernized system against the OWASP Top 10 and security best practices before go-live.

## When to Use
- Before cutover to production — mandatory security gate
- After a major feature addition or dependency update
- As part of Phase 6 (Final Validation) prerequisites

## Prerequisites (Preflight)
Before starting, verify the following artifacts exist:

| Artifact | Expected Path | Required? |
|---|---|---|
| Target architecture | `ai-driven-development/docs/target_architecture/target_architecture.md` | Always |
| Tech stack selections | `ai-driven-development/docs/tech_stack_selections.md` | Always |
| Backend code | `ai-driven-development/development/backend_development/` | If backend in scope |
| Frontend code | `ai-driven-development/development/frontend_development/` | If web frontend in scope |
| iOS code | `ai-driven-development/development/mobile_development/ios/` | If iOS in scope |
| Android code | `ai-driven-development/development/mobile_development/android/` | If Android in scope |
| Cross-platform mobile code | `ai-driven-development/development/mobile_development/cross-platform/` | If Flutter or React Native is in scope |

**At least one Phase 4 implementation artifact must exist (`4b`, `4c`, `4d`, `4e`, or `4i`).** If none are present, stop and report which Phase 4 development agents must run first.

**If any always-required artifact is missing**: Stop. Report which artifact is missing, which phase produces it (Phase 3: `target-architecture`, Phase 2.5: Tech Stack Selection Gate), and offer: (a) Run the prerequisite phase now, (b) Provide the artifact path manually.

---

## Output Artifacts

All outputs go to `ai-driven-development/docs/security_review/`:

```
security_review/
├── security_review_report.md     ← Full findings report (always)
└── security_review_report.html   ← HTML summary with severity colour-coding (always)
```

---

## Procedure

### Step 0 — Create Report Structure

Create `security_review_report.md` with this shell:

```markdown
# Security Review Report
**Project**: [name]
**Reviewer**: [agent / human]
**Date**: YYYY-MM-DD
**Scope**: [Backend / Frontend / Native iOS / Native Android / Cross-Platform Mobile / Infrastructure]

## Summary
| Severity | Count |
|---|---|
| 🔴 Critical | 0 |
| 🟠 High | 0 |
| 🟡 Medium | 0 |
| 🟢 Low / Info | 0 |

## Findings
<!-- populated per section below -->

## DoD Gate
- [ ] Zero Critical findings
- [ ] Zero High findings unmitigated (accepted risk documented)
- [ ] All tool scans passed with no CVSS ≥ 7 vulnerabilities
```

---

### Phase 1 — Threat Model (STRIDE)

**Goal**: Identify the highest-risk trust-boundary crossings before applying OWASP controls. Threat modelling ensures controls are applied where they matter most, rather than uniformly.

> **Complete this phase before Phase 2 (OWASP audit).** The threat model output is used to prioritise and scope the OWASP checks.

#### 1.1 — Identify Trust Boundaries

Read `target_architecture.md` and identify every point where data or control crosses a trust boundary:

| Trust Boundary | From | To | Protocol | Auth? |
|---|---|---|---|---|
| TB-01 | End user (browser/mobile) | API Gateway | HTTPS | JWT Bearer |
| TB-02 | API Gateway | Backend Service | HTTPS (internal TLS) | Service-to-service mTLS or internal JWT |
| TB-03 | Backend Service | Database | PostgreSQL TLS | DB credentials (Vault/secret manager) |
| TB-04 | Backend Service | External Payment API | HTTPS | API key |
| TB-05 | CI/CD Pipeline | Container Registry | HTTPS | Registry token |
| TB-06 | Admin user | Admin API / console | HTTPS | MFA-enforced JWT |

_Populate this table from `target_architecture.md`. Add or remove rows to match the actual system._

#### 1.2 — STRIDE Analysis per Trust Boundary

For each trust boundary, assess all six STRIDE threat categories. Record findings in `security_review_report.md` under a new **Threat Model** section.

| STRIDE Category | Description | Applies to |
|---|---|---|
| **S**poofing | Attacker impersonates a user, service, or component | Auth tokens, service identities |
| **T**ampering | Attacker modifies data in transit or at rest | API payloads, DB records, log files |
| **R**epudiation | Actor denies performing an action (no audit trail) | Admin actions, financial transactions |
| **I**nformation Disclosure | Sensitive data exposed to unauthorised parties | Error messages, logs, API responses |
| **D**enial of Service | Service made unavailable | Auth endpoints, resource-intensive APIs |
| **E**levation of Privilege | Attacker gains higher permissions than granted | Role boundaries, IDOR, JWT scope |

**STRIDE threat table template** (complete one per trust boundary):

| TB | Threat | STRIDE | Likelihood (H/M/L) | Impact (H/M/L) | Risk | Mitigating Control |
|---|---|---|---|---|---|---|
| TB-01 | Stolen JWT used from another device | S | M | H | **High** | Short-lived tokens (≤15 min) + refresh token rotation |
| TB-01 | Attacker replays expired token | S | L | H | **Medium** | `exp` claim validated on every request; clock skew ≤ 60 s |
| TB-01 | User modifies `role` claim in JWT payload | T | M | H | **High** | Backend validates claims server-side; never trusts client-supplied role |
| TB-01 | User denies placing a high-value order | R | M | M | **Medium** | All order mutations logged with authenticated user ID and timestamp |
| TB-01 | API returns other users' data via IDOR | I | M | H | **High** | Owner check in use-case layer; automated IDOR tests in CI |
| TB-01 | Credential-stuffing attack on `/auth/login` | D | H | H | **Critical** | Rate limiting (≤ 5 req/min per IP), exponential backoff, CAPTCHA |
| TB-01 | Regular user accesses admin endpoint | E | M | H | **High** | Role-based `@PreAuthorize` on every admin endpoint; integration test coverage |
| TB-03 | SQL injection via malformed API input | T | M | H | **High** | ORM parameterized queries only; semgrep injection rule in CI |
| TB-04 | SSRF to internal metadata service | I | M | H | **High** | URL allowlist for external calls; block 169.254.x and RFC1918 ranges |

_Complete the full table for all trust boundaries before proceeding to Phase 2._

#### 1.3 — Risk Prioritisation

After completing the STRIDE table, extract the **Critical** and **High** risks and add them to the report summary as the prioritised control targets. These findings must have explicit mitigating controls in Phase 2.

Risk scoring guide:

| Likelihood | Impact H | Impact M | Impact L |
|---|---|---|---|
| **H** | Critical | High | Medium |
| **M** | High | Medium | Low |
| **L** | Medium | Low | Info |

#### 1.4 — Threat Model Sign-Off

Before proceeding to Phase 2, the threat model must be reviewed:

- [ ] Threat model reviewed by lead developer or security champion
- [ ] All Critical and High risks have at least one proposed mitigating control
- [ ] Trust boundaries match `target_architecture.md` — no undocumented data flows
- [ ] Threat model section committed to `security_review_report.md`

> **Tip**: If the architecture has not changed significantly from a previous review cycle, reuse the existing threat model and mark unchanged boundaries as "Reviewed — no change" with the review date.

---

### Phase 2 — OWASP Top 10 Layer-by-Layer Audit

For each OWASP category, check every in-scope layer and record findings.

#### A01 — Broken Access Control
- [ ] All API endpoints have explicit authorization (no "allow all" fallback)
- [ ] Authorization enforced at the service/use-case layer, not only at the controller
- [ ] IDOR (Insecure Direct Object Reference): user-supplied IDs validated against the authenticated user's permissions
- [ ] Privilege escalation: non-admin users cannot call admin endpoints
- [ ] Missing function-level access control: list all unprotected endpoints and verify each is intentionally public

**Backend check**:
```bash
# grep for endpoints missing auth annotations (Spring Boot example)
grep -r "@GetMapping\|@PostMapping\|@PutMapping\|@DeleteMapping" src/ \
  | grep -v "@PreAuthorize\|@Secured\|permitAll" \
  | grep -v "health\|metrics\|swagger"
```

#### A02 — Cryptographic Failures
- [ ] No sensitive data (passwords, PII, tokens) stored or transmitted in plaintext
- [ ] Passwords hashed with bcrypt / Argon2 / scrypt — minimum cost factor 12 (bcrypt) or equivalent
- [ ] Database connections use TLS (`sslmode=require` for PostgreSQL)
- [ ] All inter-service communication over HTTPS/TLS in production
- [ ] JWT secrets/private keys are at least 256 bits; RSA keys are at least 2048 bits
- [ ] No MD5 or SHA1 used for security purposes

#### A03 — Injection
- [ ] **SQL injection**: all database queries use ORM parameterized queries or prepared statements — no string concatenation in SQL
- [ ] **NoSQL injection**: queries use safe driver APIs; user input never interpolated into query documents
- [ ] **Command injection**: no `Runtime.exec()`, `os.system()`, `subprocess.run(shell=True)` with user-supplied input
- [ ] **LDAP injection**: LDAP queries use escaped input
- [ ] **Template injection**: template engines escape output by default; user input never used as template source

**Automated check** (run in CI):
```bash
# semgrep - injection rules
semgrep --config=p/owasp-top-ten .
```

#### A04 — Insecure Design
- [ ] Threat model documented for high-value flows (auth, payments, admin actions)
- [ ] Rate limiting on authentication endpoints (login, registration, password reset)
- [ ] Account lockout / exponential backoff on failed login attempts
- [ ] Mass assignment protection: API request DTOs have explicit allow-lists, never `@RequestBody Entity`

#### A05 — Security Misconfiguration
- [ ] No default credentials left in place (DB, message brokers, admin consoles)
- [ ] Error responses do not expose stack traces, file paths, or internal implementation details
- [ ] HTTP security headers present (see checklist below)
- [ ] Unnecessary HTTP methods disabled (TRACE, OPTIONS where not needed)
- [ ] Debug endpoints disabled in production (`/actuator/*` restricted, Django DEBUG=False, etc.)
- [ ] Directory listing disabled on web server

**HTTP security headers checklist**:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'; ...
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=()
```

Verify with:
```bash
curl -I https://your-app.example.com/api/v1/health
```

#### A06 — Vulnerable and Outdated Components
Run dependency vulnerability scans — **block deployment if CVSS ≥ 7**:

| Stack | Tool | Command |
|---|---|---|
| Java | OWASP Dependency-Check | `mvn dependency-check:check` |
| .NET | MSBuild audit | `dotnet list package --vulnerable` |
| Python | pip-audit | `pip-audit` |
| Go | govulncheck | `govulncheck ./...` |
| All (containers) | Trivy | `trivy image your-image:tag` |
| Frontend (npm) | npm audit | `npm audit --audit-level=high` |

#### A07 — Identification and Authentication Failures
- [ ] JWT validation checklist:
  - [ ] Algorithm explicitly set and verified (never accept `alg: none`)
  - [ ] `exp` (expiration) claim validated on every request
  - [ ] `iss` (issuer) and `aud` (audience) claims validated
  - [ ] Access token lifetime ≤ 15 minutes
  - [ ] Refresh token rotation on each use (detect refresh token reuse attacks)
  - [ ] Refresh tokens stored securely (HttpOnly cookie or EncryptedSharedPreferences — never localStorage)
- [ ] Password reset tokens are single-use and expire after 15 minutes
- [ ] Multi-factor authentication available for admin accounts

#### A08 — Software and Data Integrity Failures
- [ ] Dependency lock files committed (`pom.xml`/`go.sum`/`poetry.lock`/`package-lock.json`) — reproducible builds
- [ ] CI pipeline verifies lock file integrity before building
- [ ] No unverified dynamic plugin loading or deserialization of untrusted data
- [ ] Signed container images (Cosign) in production pipelines

#### A09 — Security Logging and Monitoring Failures
- [ ] All authentication events logged (login, logout, failed attempts, MFA events)
- [ ] All authorization failures logged with user ID and resource attempted
- [ ] All admin actions logged with actor, action, and affected resource
- [ ] Logs do not contain sensitive data (passwords, full credit card numbers, tokens)
- [ ] Log alerting configured: N failed logins in M minutes triggers alert
- [ ] Logs shipped to a tamper-evident, centralised store (not only local disk)

#### A10 — Server-Side Request Forgery (SSRF)
- [ ] Any feature that fetches a URL based on user input validates against an allowlist of trusted domains
- [ ] Internal network ranges (10.x, 172.16.x, 192.168.x, 169.254.x, localhost) blocked in URL allowlist
- [ ] Cloud metadata endpoints (169.254.169.254) blocked
- [ ] HTTP redirect following disabled or limited in HTTP client configurations

---

### Phase 3 — Secrets Detection

**Goal**: Ensure no credentials, API keys, tokens, or private keys are committed to the repository or baked into container images.

```bash
# truffleHog — scan git history for secrets
trufflehog git file://. --only-verified

# gitleaks — fast regex-based scan
gitleaks detect --source . --verbose

# detect-secrets — baseline approach
detect-secrets scan --baseline .secrets.baseline
```

Checklist:
- [ ] No hardcoded database passwords in source code or config files
- [ ] No hardcoded API keys (AWS, Stripe, Twilio, SendGrid, etc.)
- [ ] No private keys or certificates committed (`.pem`, `.key`, `.p12`, `.pfx`)
- [ ] `.env` files in `.gitignore`; `.env.example` has placeholder values only
- [ ] CI/CD secrets stored in the platform secret store (GitHub Actions secrets, GitLab CI variables) — not in repository files
- [ ] Docker images do not contain secrets — verified with `docker history --no-trunc image:tag`

---

### Phase 4 — CORS & CSP Configuration Review

**CORS checklist**:
- [ ] `Access-Control-Allow-Origin` uses an explicit domain allowlist — never `*` in production
- [ ] `Access-Control-Allow-Credentials: true` only set when cookies are required and origin is explicitly trusted
- [ ] Allowed methods restricted to those actually used
- [ ] Preflight caching (`Access-Control-Max-Age`) set to avoid excessive OPTIONS requests

**CSP checklist**:
- [ ] `default-src 'self'` — no wildcard sources
- [ ] `script-src` does not include `'unsafe-inline'` or `'unsafe-eval'`
- [ ] External CDN domains explicitly listed
- [ ] `report-uri` or `report-to` configured for violation reporting
- [ ] CSP tested with [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

---

### Phase 5 — Docker Image Security

Run for every image that ships to production:

```bash
# Trivy vulnerability scan
trivy image --severity HIGH,CRITICAL --exit-code 1 your-image:tag

# Check for running as root
docker inspect your-image:tag | jq '.[0].Config.User'
# Expected: non-empty (e.g. "appuser" or numeric UID like "1000")

# Check for exposed secrets in image layers
docker history --no-trunc your-image:tag | grep -iE "password|secret|key|token"
# Expected: no matches
```

Checklist:
- [ ] Base image is minimal (Alpine, slim, distroless) — not `ubuntu:latest` or `debian:latest`
- [ ] Base image version pinned — no `latest` tags
- [ ] Application runs as a non-root user (`USER appuser` in Dockerfile)
- [ ] No package managers (`apt`, `apk`, `pip`) in the final image layer
- [ ] Build secrets not present in final image (use multi-stage builds)
- [ ] HEALTHCHECK instruction defined
- [ ] Image signed with Cosign (production)

---

## Definition of Done

> 📋 **Quality review**: Before marking this phase complete, consult [quality-playbook/SKILL.md](../quality-playbook/SKILL.md) §2.5 — Hardcoded Configuration, §2.8 — Logging Sensitive Data, and §4 — Cross-Cutting Concerns Security checklist.

- [ ] Threat model (STRIDE) completed for all trust boundaries; all Critical and High risks have mitigating controls; threat model signed off
- [ ] All OWASP Top 10 categories audited for every in-scope layer
- [ ] Zero Critical findings remaining unmitigated
- [ ] Zero High findings without documented accepted-risk justification
- [ ] All dependency vulnerability scans pass with CVSS < 7
- [ ] Secrets scan reports zero verified secrets in codebase or image history
- [ ] CORS and CSP configurations reviewed and compliant
- [ ] All Docker images pass Trivy scan and run as non-root
- [ ] `security_review_report.md` and `security_review_report.html` committed to `ai-driven-development/docs/security_review/`
- [ ] Report reviewed and signed off by lead developer before go-live
