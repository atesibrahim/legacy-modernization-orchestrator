---
name: security-review
description: 'Security review skill for legacy modernization target system. Optional Phase 4g. Use when: performing OWASP Top 10 checks per layer, detecting hardcoded secrets and credentials, scanning dependency CVEs with OWASP Dependency-Check or Trivy, auditing API authorization coverage, reviewing JWT validation algorithm and rotation, auditing CORS and CSP configuration, verifying Docker image security (non-root, distroless, no leaked secrets), producing a security findings report before go-live.'
argument-hint: 'Project name or path to target architecture and development artifacts to review'
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

**At least one Phase 4 code artifact must exist.** If none are present, stop and report which Phase 4 development agents must run first.

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
**Scope**: [Backend / Frontend / iOS / Android / Infrastructure]

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

### Phase 1 — OWASP Top 10 Layer-by-Layer Audit

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

### Phase 2 — Secrets Detection

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

### Phase 3 — CORS & CSP Configuration Review

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

### Phase 4 — Docker Image Security

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

- [ ] All OWASP Top 10 categories audited for every in-scope layer
- [ ] Zero Critical findings remaining unmitigated
- [ ] Zero High findings without documented accepted-risk justification
- [ ] All dependency vulnerability scans pass with CVSS < 7
- [ ] Secrets scan reports zero verified secrets in codebase or image history
- [ ] CORS and CSP configurations reviewed and compliant
- [ ] All Docker images pass Trivy scan and run as non-root
- [ ] `security_review_report.md` and `security_review_report.html` committed to `ai-driven-development/docs/security_review/`
- [ ] Report reviewed and signed off by lead developer before go-live
