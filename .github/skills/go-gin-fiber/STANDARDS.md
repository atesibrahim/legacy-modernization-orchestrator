# Go 1.23 + Gin / Fiber — Standards

> **Tier 2 (language-specific) — Skill-local standards.** Extends [Core Standards (Tier 1)](../../standards/core.md) and [Backend Development Standards (Tier 2)](../backend-development/STANDARDS.md). Core and backend-agnostic standards always take precedence; this file adds Go/Gin/Fiber–specific rules only.

Go-specific standards for backend development.
These accompany the language-agnostic [backend-development/STANDARDS.md](../backend-development/STANDARDS.md) and [SKILL.md](../backend-development/SKILL.md).

---

## Architecture Rules

- **No global `db` variable** — pass `*gorm.DB` / `*pgxpool.Pool` via constructor injection.
- **`internal/` enforced** — all application packages under `internal/`; only `cmd/` and public SDK packages outside.
- **Interface segregation** — define interfaces at the consumer site (in the `application` or `domain` package), not at the provider site.
- **No `init()` functions** — all initialization is explicit in `main.go` or `wire.go`.
- **Error wrapping mandatory** — `fmt.Errorf("context: %w", err)` on every error return up the call stack.
- **Context as first parameter** — every exported function that performs I/O: `func Foo(ctx context.Context, ...) (T, error)`.
- **Immutable config structs** — config is read once at startup; never modified at runtime.

---

## Project Folder Structure

```
{project}/
├── go.mod
├── go.sum
├── .air.toml                        ← Live reload (dev only)
├── .golangci.yaml                   ← Linter configuration
├── cmd/
│   └── api/
│       └── main.go                  ← Entry point — wiring only
├── internal/
│   ├── {module}/
│   │   ├── domain/                  ← Entities, value objects, repo interfaces
│   │   ├── application/             ← Use cases, DTOs (no framework deps)
│   │   ├── infrastructure/          ← GORM/sqlc repos, external HTTP clients
│   │   └── api/                     ← Gin/Fiber handlers, middleware
│   └── shared/                      ← Errors, pagination, middleware, utils
├── config/
│   └── config.go                    ← Typed env-bound config struct
├── migrations/                      ← Goose SQL migration files
│   ├── 00001_init.sql
│   └── ...
└── tests/
    ├── integration/                 ← Testcontainers-based tests
    └── fixtures/
```

---

## `.air.toml` Template (Local Development)

```toml
root = "."
tmp_dir = "tmp"

[build]
  cmd = "go build -o ./tmp/main ./cmd/api"
  bin = "./tmp/main"
  delay = 1000
  exclude_dir = ["tmp", "vendor", "tests"]
  include_ext = ["go", "yaml", "env"]
  kill_delay = "0s"

[log]
  time = false

[color]
  main = "magenta"
  watcher = "cyan"
  build = "yellow"
  runner = "green"
```

---

## `.golangci.yaml` — Required Linters

```yaml
linters:
  enable:
    - errcheck
    - staticcheck
    - gosimple
    - govet
    - ineffassign
    - unused
    - gosec
    - revive
    - gocyclo
    - misspell

linters-settings:
  gocyclo:
    min-complexity: 15
  gosec:
    excludes:
      - G404   # weak random — acceptable for non-security use

issues:
  exclude-rules:
    - path: "_test\\.go"
      linters:
        - errcheck
```

---

## Docker Image Template (scratch / distroless)

```dockerfile
FROM golang:1.23-alpine AS builder
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -trimpath -o app ./cmd/api

FROM gcr.io/distroless/static-debian12:nonroot AS final
COPY --from=builder /build/app /app
EXPOSE 8080
ENTRYPOINT ["/app"]
```

Rules:
- `CGO_ENABLED=0` — fully static binary, no libc dependency.
- `-ldflags="-s -w"` — strip debug symbols; `-trimpath` removes build paths.
- `distroless/static:nonroot` — no shell, no package manager, non-root by default.
- No `latest` tags — always pin base image version.

---

## Standard Error Response Format

All HTTP errors must follow the RFC 9457 canonical shape defined in [core.md §10](../../standards/core.md#10-standard-error-response-format-rfc-9457). Go implementation:

```go
type ErrorResponse struct {
    Type     string            `json:"type"`
    Title    string            `json:"title"`
    Status   int               `json:"status"`
    Detail   string            `json:"detail,omitempty"`
    Instance string            `json:"instance,omitempty"`
    TraceID  string            `json:"traceId,omitempty"`
    Errors   map[string][]string `json:"errors,omitempty"`
}
```

Map domain errors to HTTP status codes in a central handler function — never in individual route handlers.

---

## Goose Migration Convention

- Migration files: `migrations/{sequence}_{description}.sql` (e.g., `00001_create_orders.sql`).
- Always include `-- +goose Up` and `-- +goose Down` sections.
- Apply at startup (dev/test) or via CI step (production): `goose -dir migrations postgres "$DATABASE_URL" up`.
