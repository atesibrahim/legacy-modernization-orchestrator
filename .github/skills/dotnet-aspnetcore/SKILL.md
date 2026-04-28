---
name: dotnet-aspnetcore
description: '.NET 9 + ASP.NET Core backend — clean/hexagonal architecture, EF Core, Serilog, xUnit, Testcontainers.NET, MSBuild, Dockerfile. Apply when tech_stack_selections.md confirms .NET + ASP.NET Core as the backend stack.'
argument-hint: 'Project name or path to system design artifacts to base backend implementation on'
version: 1.0.0
last_reviewed: 2026-04-27
status: Active
---

# .NET 9 + ASP.NET Core — Backend Implementation

> These are the .NET-specific implementation steps that complement [`backend-development/SKILL.md`](../backend-development/SKILL.md). Apply these when `tech_stack_selections.md` confirms `.NET + ASP.NET Core` as the backend stack.

See also: [`STANDARDS.md`](./STANDARDS.md) for .NET-specific architecture rules, project folder structure, and Docker image template.

## Role
**Senior .NET / ASP.NET Core Backend Engineer** — Implement a production-ready, clean/hexagonal architecture backend using .NET 9 and ASP.NET Core, following all standards in `core.md` and `backend-development/STANDARDS.md`.

## Prerequisites (Preflight)
Before starting, verify the following artifacts exist:

| Artifact | Expected Path | Required? |
|---|---|---|
| Tech stack selections | `ai-driven-development/docs/tech_stack_selections.md` | Always — must confirm `.NET + ASP.NET Core` |
| Target architecture | `ai-driven-development/docs/target_architecture/target_architecture.md` | Always |
| Backend todo tracker | `ai-driven-development/development/backend_development/be_development_todo.md` | If continuing an in-progress phase |

**If any required artifact is missing**: Stop. Report which artifact is missing, which phase produces it (Phase 2.5: Tech Stack Selection, Phase 3: `target-architecture`), and offer: (a) Run the prerequisite phase now, (b) Provide the artifact path manually.

---

## Best Practices

### Project Setup & Structure

- **SDK Style csproj**: Use SDK-style `.csproj` files — minimal XML, `<Nullable>enable</Nullable>`, `<ImplicitUsings>enable</ImplicitUsings>`.
- **Solution structure**: One `.sln` at the root. One project per architectural layer per module (`{Module}.Domain`, `{Module}.Application`, `{Module}.Infrastructure`, `{Module}.API`).
- **`Directory.Build.props`**: Centralise target framework, nullable, warnings, and package versions across all projects.
- **`global.json`**: Pin the .NET SDK version (`"rollForward": "latestPatch"`).

### Dependency Injection

- **Constructor injection only** — never `ServiceLocator` or `IServiceLocator`.
- **Minimal API or Controller** — prefer Minimal API for new services; use Controllers when complex filter pipelines are needed.
- **Scrutor** for assembly scanning — avoid manually registering every service.

### Configuration

- `appsettings.json` + `appsettings.{Environment}.json` for environment overrides.
- **`IOptions<T>`** with `DataAnnotations` validation (`ValidateDataAnnotations()`, `ValidateOnStart()`).
- **Never hardcode secrets** — use `dotnet user-secrets` locally, Azure Key Vault / AWS Secrets Manager in production.

### Web Layer

- **DTOs with FluentValidation** or `DataAnnotations` — never expose EF Core entities over the API.
- **Problem Details** (`IProblemDetailsService`) for RFC 9457 error responses — shape defined in `core.md §10`.
- **Minimal API** endpoint grouping with `MapGroup` and typed `TypedResults`.

### Data Layer

- **EF Core** with `DbContext` per bounded context — not a single global context.
- **Repository + Unit of Work** on top of EF Core for testability.
- **`AsNoTracking()`** for read-only queries.
- **Migrations**: `dotnet ef migrations add <Name> --project Infrastructure --startup-project API`.

### Logging

- **Serilog** with structured JSON output in production — `UseSerilog()` in `Program.cs`.
- **Enrichers**: `FromLogContext`, `WithMachineName`, `WithThreadId`.
- Sinks: `Console` (dev), `File` rolling (local), `Seq` / `Elasticsearch` / `Azure App Insights` (prod).
- Include `CorrelationId`, `UserId`, `RequestId` in log context via middleware.

### Testing

- **xUnit** + **Moq** for unit tests.
- **`WebApplicationFactory<TProgram>`** for integration tests.
- **Testcontainers.NET** for real database/broker containers in integration tests.
- **FluentAssertions** for readable assertions.
- `coverlet` for coverage reports; target ≥ 70% line coverage.

### Security

- **ASP.NET Core Identity** or **external OIDC provider** (Keycloak, Azure AD, Auth0).
- **JWT Bearer** middleware: `AddAuthentication().AddJwtBearer(...)`.
- **HTTPS enforcement**: `UseHsts()` + `UseHttpsRedirection()` in production.
- **CORS**: explicit allowlist — never `AllowAnyOrigin` in production.
- **Anti-forgery** tokens for browser-facing endpoints.

---

## Phase 1 — Project Setup (.NET 9 / ASP.NET Core)

**`Directory.Build.props`** — root-level shared settings:
```xml
<Project>
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <LangVersion>latest</LangVersion>
  </PropertyGroup>
</Project>
```

**`global.json`**:
```json
{
  "sdk": {
    "version": "9.0.100",
    "rollForward": "latestPatch"
  }
}
```

**Required NuGet packages** (per project):

| Project | Key packages |
|---|---|
| API | `Microsoft.AspNetCore.OpenApi`, `Swashbuckle.AspNetCore`, `Serilog.AspNetCore`, `FluentValidation.AspNetCore` |
| Application | `MediatR`, `FluentValidation`, `AutoMapper` |
| Infrastructure | `Microsoft.EntityFrameworkCore`, `<<EF Core DB provider from tech_stack_selections.md>>` (e.g. `Npgsql.EntityFrameworkCore.PostgreSQL` for PostgreSQL, `Microsoft.EntityFrameworkCore.SqlServer` for MSSQL, `Oracle.EntityFrameworkCore` for Oracle), `Microsoft.EntityFrameworkCore.Design` |
| Tests | `xunit`, `Moq`, `FluentAssertions`, `<<Testcontainers DB module from tech_stack_selections.md>>` (e.g. `Testcontainers.PostgreSql`, `Testcontainers.MsSql`, `Testcontainers.Oracle`), `Microsoft.AspNetCore.Mvc.Testing` |

**Configuration files**:
- `appsettings.json` — common config (no secrets)
- `appsettings.Development.json` — local overrides (local DB, debug level)
- `appsettings.Production.json` — production (all sensitive values via env vars)

---

## Phase 5 — Application & Infrastructure Layers (.NET)

**Application Layer** — MediatR CQRS:
```csharp
// Command
public record CreateOrderCommand(Guid CustomerId, List<OrderLineDto> Lines) : IRequest<Guid>;

// Handler
public class CreateOrderCommandHandler(IOrderRepository repo, IUnitOfWork uow)
    : IRequestHandler<CreateOrderCommand, Guid>
{
    public async Task<Guid> Handle(CreateOrderCommand cmd, CancellationToken ct)
    {
        var order = Order.Create(cmd.CustomerId, cmd.Lines.Select(l => l.ToDomain()));
        await repo.AddAsync(order, ct);
        await uow.CommitAsync(ct);
        return order.Id;
    }
}
```

**Infrastructure Layer** — EF Core DbContext:
```csharp
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder mb)
        => mb.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
}
```

---

## Phase 7 — ASP.NET Core Security Configuration

```csharp
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Auth:Authority"];
        options.Audience  = builder.Configuration["Auth:Audience"];
        options.TokenValidationParameters = new()
        {
            ValidateIssuerSigningKey = true,
            ValidateLifetime         = true,
            ClockSkew                = TimeSpan.FromSeconds(30),
        };
    });

builder.Services.AddAuthorization(opts =>
    opts.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser().Build());
```

**CORS**:
```csharp
builder.Services.AddCors(opts => opts.AddPolicy("AllowFrontend", p =>
    p.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()!)
     .AllowAnyMethod()
     .AllowAnyHeader()));
app.UseCors("AllowFrontend");
```

---

## Phase 9 — Integrations (.NET)

- **Scheduling**: `Quartz.NET` for distributed job scheduling with database persistence, or `BackgroundService` + `IHostedService` for simple tasks.
- **Email**: `MailKit` with `MimeMessage`; template rendering via `Scriban` or `RazorLight`.
- **HTTP clients**: `IHttpClientFactory` with named/typed clients and Polly resilience policies.
- **Messaging**: MassTransit over RabbitMQ or Azure Service Bus.

---

## Phase 11 — Observability (.NET)

**Logging** (Serilog in `Program.cs`):
```csharp
builder.Host.UseSerilog((ctx, lc) => lc
    .ReadFrom.Configuration(ctx.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithCorrelationId()
    .WriteTo.Console(new RenderedCompactJsonFormatter()));
```

**Metrics**: OpenTelemetry → `AddOpenTelemetry().WithMetrics(...)` → Prometheus exporter.

**Tracing**: `AddOpenTelemetry().WithTracing(t => t.AddAspNetCoreInstrumentation().AddEntityFrameworkCoreInstrumentation())`.

**Health checks**:
```csharp
builder.Services.AddHealthChecks()
    // Add the DB health check that matches tech_stack_selections.md:
    // PostgreSQL:  .AddNpgSql(connectionString, name: "postgres")
    // MSSQL:       .AddSqlServer(connectionString, name: "sqlserver")
    // Oracle:      .AddOracle(connectionString, name: "oracle")
    // MongoDB:     .AddMongoDb(connectionString, name: "mongodb")
    .AddRedis(redisConnection, name: "redis"); // remove if Redis not in stack
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready", new() { Predicate = r => r.Tags.Contains("ready") });
```

---

## Phase 12 — Quality Gate (.NET)

- **Coverage**: `coverlet.collector` + `dotnet test --collect:"XPlat Code Coverage"` → Cobertura report; target ≥ 70%.
- **Dependency security**: `dotnet list package --vulnerable` (MSBuild audit) + Trivy image scan — fail on CVSS ≥ 7.
- **Static analysis**: `dotnet-format` + `Roslynator` analyzer set.
- **Mutation testing**: Stryker.NET (`dotnet stryker`) — mutation score ≥ 60%.

---

## Definition of Done (DoD)

> 📋 **Quality review**: Before marking this phase complete, consult [quality-playbook/SKILL.md](../quality-playbook/SKILL.md) §2 — Common Anti-Patterns (§2.4 Anemic Domain Model, §2.7 N+1 Query) and §7 — Code Review Checklist.

### Inherited from `backend-development`
All DoD items in [`backend-development/SKILL.md`](../backend-development/SKILL.md) must be ✅ before this DoD is evaluated.

### Additional DoD — .NET / ASP.NET Core

#### Build & Quality
- [ ] `dotnet build` completes with zero errors and zero warnings (`<TreatWarningsAsErrors>true</TreatWarningsAsErrors>`)
- [ ] `dotnet format --verify-no-changes` exits clean
- [ ] `dotnet test` passes with line coverage ≥ 70% (Cobertura report via `coverlet`)

#### Static Analysis
- [ ] Roslynator analyzer set reports zero warnings in CI
- [ ] Stryker.NET mutation score ≥ 60% (if configured)

#### Security
- [ ] `dotnet list package --vulnerable` reports zero vulnerable packages
- [ ] Trivy image scan passes — zero CVSS ≥ 7 vulnerabilities in the published image

#### Runtime Correctness
- [ ] `/health` returns `{"status":"Healthy"}` in local run
- [ ] `/metrics` returns Prometheus-format metrics
- [ ] `dotnet publish` produces a self-contained runnable artifact or Docker image

#### Next Skill
When all items above are ✅, proceed to [`compare-legacy-to-new`](../compare-legacy-to-new/SKILL.md) (Phase 5).
