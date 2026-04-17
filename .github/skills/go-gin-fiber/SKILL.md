---
name: go-gin-fiber
description: 'Go 1.23 + Gin or Fiber backend — clean/hexagonal architecture, GORM/sqlc, zap/zerolog, testcontainers-go, Air live reload, Docker scratch image. Apply when tech_stack_selections.md confirms Go + Gin or Go + Fiber as the backend stack.'
argument-hint: 'Project name or path to system design artifacts to base backend implementation on'
---

# Go 1.23 + Gin / Fiber — Backend Implementation

> These are the Go-specific implementation steps that complement [`backend-development/SKILL.md`](../backend-development/SKILL.md). Apply these when `tech_stack_selections.md` confirms `Go + Gin` or `Go + Fiber` as the backend stack.

See also: [`STANDARDS.md`](./STANDARDS.md) for Go-specific architecture rules, project folder structure, and Docker image template.

---

## Best Practices

### Project Setup & Structure

- **`go.mod`** with `module` path matching the repository URL — e.g., `module github.com/{org}/{project}`.
- **Go 1.23+** — use `toolchain` directive in `go.mod` to pin the toolchain version.
- **`internal/` package** for all application code — prevents external imports of implementation details.
- **No `init()` functions** — use explicit dependency wiring in `main.go`.
- **`cmd/{app}/main.go`** — entry point only; all business logic elsewhere.

### Error Handling

- **`errors.New` / `fmt.Errorf("... %w", err)`** — always wrap errors with context.
- **Sentinel errors** with `errors.Is` checks — no string comparison on error messages.
- **Never ignore errors** — `_` discard of error returns is forbidden (enforced by `errcheck` linter).
- **Domain errors** as typed structs implementing `error` — translate to HTTP status codes at the handler layer only.

### Concurrency

- **Context propagation** — every function that does I/O accepts `context.Context` as the first parameter.
- **`sync.WaitGroup` / `errgroup.Group`** for concurrent fan-out — never raw goroutine leaks.
- **Channels** for signalling, not for data pipelines where a slice suffices.

### Configuration

- **`github.com/spf13/viper`** or **`github.com/caarlos0/env`** for environment-based config with struct binding.
- All secrets via environment variables — never hardcoded, never in version control.
- Validate config at startup — fail fast if required values are missing.

### Data Layer

**GORM** (ORM approach):
- One `*gorm.DB` per application, injected via constructor — never a global `db` variable.
- `AutoMigrate` only in development — use SQL migration files (Flyway / Goose) in production.
- `Preload` and `Joins` explicitly — no N+1 by accident.

**sqlc** (code-generation approach — preferred for performance-critical paths):
- Write SQL queries in `.sql` files; `sqlc generate` produces type-safe Go code.
- `sqlc.yaml` pins the schema and query directories.
- Use `pgx/v5` driver directly with `sqlc` for best PostgreSQL performance.

### Logging

- **`go.uber.org/zap`** (high performance) or **`github.com/rs/zerolog`** (zero allocation) — never `fmt.Println` or `log.Printf` in production code.
- Structured fields: `zap.String("request_id", id)` — no free-form string interpolation.
- Log level via `LOG_LEVEL` environment variable.
- Include `trace_id`, `user_id`, `request_id` in context-bound logger.

### Testing

- **`testing` standard library** + **`github.com/stretchr/testify`** for assertions.
- **`testcontainers-go`** for real PostgreSQL/Redis containers in integration tests.
- **Table-driven tests** for unit tests — `t.Run(tc.name, ...)`.
- **`net/http/httptest`** for handler tests — no live server.
- Coverage via `go test -coverprofile=coverage.out ./...` — target ≥ 70%.

### Security

- **`golang-jwt/jwt/v5`** for JWT — always verify `alg`, `exp`, `iss`, `aud`.
- **`golang.org/x/crypto/bcrypt`** for password hashing — minimum cost 12.
- SQL injection: use GORM parameterized queries or `sqlc` generated code only — never `fmt.Sprintf` in SQL strings.
- Input validation: **`github.com/go-playground/validator/v10`** on request structs.

---

## Phase 1 — Project Setup (Go / Gin or Fiber)

**`go.mod`** — module definition and toolchain pin:
```
module github.com/{org}/{project}

go 1.23.0
toolchain go1.23.4
```

**Required dependencies** (`go get`):

| Category | Package |
|---|---|
| HTTP framework (Gin) | `github.com/gin-gonic/gin` |
| HTTP framework (Fiber) | `github.com/gofiber/fiber/v2` |
| ORM | `gorm.io/gorm` + `gorm.io/driver/postgres` |
| SQL codegen | `github.com/sqlc-dev/sqlc` (dev tool) + `github.com/jackc/pgx/v5` |
| Migrations | `github.com/pressly/goose/v3` |
| Config | `github.com/caarlos0/env/v11` |
| Logging | `go.uber.org/zap` |
| JWT | `github.com/golang-jwt/jwt/v5` |
| Validation | `github.com/go-playground/validator/v10` |
| UUID | `github.com/google/uuid` |
| Testing | `github.com/stretchr/testify` + `github.com/testcontainers/testcontainers-go` |
| Live reload | `github.com/air-verse/air` (dev tool) |

**Configuration files**:
- `.air.toml` — live reload for local development
- `config/config.go` — typed config struct bound from environment
- `migrations/` — SQL migration files (Goose format)

---

## Phase 5 — Application & Infrastructure Layers (Go)

**Application Layer** — use case struct with interface dependency:
```go
// internal/order/application/create_order.go
package application

import (
    "context"
    "github.com/{org}/{project}/internal/order/domain"
)

type CreateOrderUseCase struct {
    repo domain.OrderRepository
}

func NewCreateOrderUseCase(repo domain.OrderRepository) *CreateOrderUseCase {
    return &CreateOrderUseCase{repo: repo}
}

func (uc *CreateOrderUseCase) Execute(ctx context.Context, req CreateOrderRequest) (CreateOrderResponse, error) {
    order, err := domain.NewOrder(req.CustomerID, req.Lines)
    if err != nil {
        return CreateOrderResponse{}, fmt.Errorf("create order: %w", err)
    }
    saved, err := uc.repo.Save(ctx, order)
    if err != nil {
        return CreateOrderResponse{}, fmt.Errorf("save order: %w", err)
    }
    return toResponse(saved), nil
}
```

**Infrastructure Layer** — GORM repository:
```go
// internal/order/infrastructure/order_repository.go
package infrastructure

import (
    "context"
    "gorm.io/gorm"
    "github.com/{org}/{project}/internal/order/domain"
)

type GormOrderRepository struct {
    db *gorm.DB
}

func NewGormOrderRepository(db *gorm.DB) *GormOrderRepository {
    return &GormOrderRepository{db: db}
}

func (r *GormOrderRepository) Save(ctx context.Context, order domain.Order) (domain.Order, error) {
    result := r.db.WithContext(ctx).Create(&order)
    return order, result.Error
}
```

**Gin handler** (thin — delegates to use case):
```go
// internal/order/api/handler.go
func (h *OrderHandler) CreateOrder(c *gin.Context) {
    var req application.CreateOrderRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, errorResponse(err))
        return
    }
    resp, err := h.createOrder.Execute(c.Request.Context(), req)
    if err != nil {
        h.handleError(c, err)
        return
    }
    c.JSON(http.StatusCreated, resp)
}
```

---

## Phase 7 — Security Configuration (Go)

**JWT middleware** (Gin example):
```go
func JWTMiddleware(cfg AuthConfig) gin.HandlerFunc {
    return func(c *gin.Context) {
        tokenStr := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
        token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (any, error) {
            if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
                return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
            }
            return cfg.PublicKey, nil
        }, jwt.WithExpirationRequired(), jwt.WithAudience(cfg.Audience))
        if err != nil || !token.Valid {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
            return
        }
        c.Set("claims", token.Claims)
        c.Next()
    }
}
```

**CORS** (Gin — exact origins only, never `*` in production):
```go
import "github.com/gin-contrib/cors"

r.Use(cors.New(cors.Config{
    AllowOrigins:     cfg.CORSAllowedOrigins,
    AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
    AllowHeaders:     []string{"Authorization", "Content-Type"},
    ExposeHeaders:    []string{"Content-Length"},
    MaxAge:           12 * time.Hour,
}))
```

---

## Phase 9 — Integrations (Go)

- **Scheduling**: `github.com/robfig/cron/v3` for cron-style jobs, or `github.com/riverqueue/river` for database-backed job queues.
- **Task queue**: `github.com/hibiken/asynq` (Redis-backed) or `github.com/riverqueue/river` (PostgreSQL-backed).
- **Email**: `github.com/wneessen/go-mail` (idiomatic Go, no CGO).
- **HTTP clients**: `net/http` with explicit timeouts — never use `http.DefaultClient` in production.

---

## Phase 11 — Observability (Go)

**Logging** (zap in `main.go`):
```go
logger, _ := zap.NewProduction()
if os.Getenv("APP_ENV") == "development" {
    logger, _ = zap.NewDevelopment()
}
defer logger.Sync()
zap.ReplaceGlobals(logger)
```

**Metrics**: `github.com/prometheus/client_golang` — register custom metrics; expose `/metrics` endpoint.

**Tracing**: `go.opentelemetry.io/otel` + `go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin`.

**Health checks**:
```go
r.GET("/health/live",  func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })
r.GET("/health/ready", func(c *gin.Context) {
    if err := db.Ping(); err != nil {
        c.JSON(503, gin.H{"status": "unavailable", "detail": err.Error()})
        return
    }
    c.JSON(200, gin.H{"status": "ok"})
})
```

---

## Phase 12 — Quality Gate (Go)

- **Coverage**: `go test -coverprofile=coverage.out ./...` → `go tool cover -func=coverage.out` — target ≥ 70%.
- **Linting**: `golangci-lint run` with `errcheck`, `staticcheck`, `gosec`, `revive` enabled — zero warnings in CI.
- **Dependency security**: `govulncheck ./...` (official Go vulnerability database) — fail on any known vulnerability.
- **Build verification**: `go build ./...` + `go vet ./...` must pass with zero output.
- **Race detector**: `go test -race ./...` — zero races allowed.
