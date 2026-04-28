# .NET 9 + ASP.NET Core — Standards

> **Tier 2 (language-specific) — Skill-local standards.** Extends [Core Standards (Tier 1)](../../standards/core.md) and [Backend Development Standards (Tier 2)](../backend-development/STANDARDS.md). Core and backend-agnostic standards always take precedence; this file adds .NET/ASP.NET Core–specific rules only.

.NET and ASP.NET Core specific standards for backend development.
These accompany the language-agnostic [backend-development/STANDARDS.md](../backend-development/STANDARDS.md) and [SKILL.md](../backend-development/SKILL.md).

---

## Architecture Rules

- **No service locator** — `IServiceProvider.GetService<T>()` is banned outside composition root.
- **Domain layer is framework-free** — no EF Core, no ASP.NET Core, no Serilog in `{Module}.Domain`.
- **`IRequest<T>` (MediatR)** for all application layer entry points — never call use cases directly from controllers.
- **Sealed records for DTOs** — `public sealed record CreateOrderRequest(...)`.
- **`ValueObject` base class** for value objects — implement `EqualityComponents`.
- **No `async void`** — always `async Task` or `async Task<T>`.
- **Cancellation tokens** — every async method accepts `CancellationToken ct = default`.

---

## Solution Folder Structure

```
{ProjectName}.sln
├── Directory.Build.props              ← Shared MSBuild settings
├── global.json                        ← Pinned SDK version
├── src/
│   ├── {Module}/
│   │   ├── {Module}.Domain/           ← Entities, Value Objects, Repository interfaces
│   │   ├── {Module}.Application/      ← Commands, Queries, Handlers (MediatR), DTOs
│   │   ├── {Module}.Infrastructure/   ← EF Core DbContext, Repos, External clients
│   │   └── {Module}.API/              ← Minimal API endpoints / Controllers
│   └── Shared/                        ← Cross-cutting: exceptions, middleware, utils
└── tests/
    ├── {Module}.UnitTests/
    └── {Module}.IntegrationTests/
```

---

## Configuration Template

`appsettings.json`:
```json
{
  "Auth": {
    "Authority": "",
    "Audience": ""
  },
  "Cors": {
    "AllowedOrigins": []
  },
  "ConnectionStrings": {
    "Default": ""
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft.AspNetCore": "Warning",
        "Microsoft.EntityFrameworkCore": "Warning"
      }
    }
  }
}
```

---

## EF Core Migration Convention

- Migrations live in `{Module}.Infrastructure/Migrations/`.
- One `DbContext` per bounded context — never a shared cross-module context.
- Always generate migrations with explicit project flags:
  ```bash
  dotnet ef migrations add InitialCreate \
    --project src/{Module}/{Module}.Infrastructure \
    --startup-project src/{Module}/{Module}.API
  dotnet ef database update \
    --project src/{Module}/{Module}.Infrastructure \
    --startup-project src/{Module}/{Module}.API
  ```

---

## Docker Image Template

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS base
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /src
COPY ["src/{Module}/{Module}.API/{Module}.API.csproj", "src/{Module}/{Module}.API/"]
RUN dotnet restore "src/{Module}/{Module}.API/{Module}.API.csproj"
COPY . .
RUN dotnet publish "src/{Module}/{Module}.API/{Module}.API.csproj" \
    -c Release -o /app/publish --no-restore

FROM base AS final
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "{Module}.API.dll"]
```

Rules:
- Multi-stage build — SDK image never ships to production.
- Non-root user (`appuser`) — mandatory.
- Alpine base — minimal attack surface.
- No `latest` tags — always pin base image version.

---

## Problem Details Error Response Format

All errors must follow the RFC 9457 canonical shape defined in [core.md §10](../../standards/core.md#10-standard-error-response-format-rfc-9457). Register in `Program.cs`:
```csharp
builder.Services.AddProblemDetails();
```

ASP.NET Core's `ProblemDetails` covers `type`, `title`, `status`, `detail`, `instance`. Add `traceId` as a mandatory extension and `errors` for validation failures:
```json
{
  "type": "https://tools.ietf.org/html/rfc9457",
  "title": "Validation failed",
  "status": 422,
  "detail": "One or more fields failed validation.",
  "instance": "/api/v1/orders",
  "traceId": "abc-123-def-456",
  "errors": {
    "customerId": ["'CustomerId' must not be empty."]
  }
}
```
