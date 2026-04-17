# Python 3.12 + FastAPI — Standards

> **Tier 2 (language-specific) — Skill-local standards.** Extends [Core Standards (Tier 1)](../../standards/core.md) and [Backend Development Standards (Tier 2)](../backend-development/STANDARDS.md). Core and backend-agnostic standards always take precedence; this file adds Python/FastAPI–specific rules only.

Python and FastAPI specific standards for backend development.
These accompany the language-agnostic [backend-development/STANDARDS.md](../backend-development/STANDARDS.md) and [SKILL.md](../backend-development/SKILL.md).

---

## Architecture Rules

- **No SQLAlchemy in route handlers** — queries belong in repositories only.
- **No mutable global state** — use `app.state` or dependency injection; never module-level singletons that hold DB connections.
- **`async def` everywhere** — no synchronous blocking calls on the event loop (`time.sleep`, `requests.get`, `open()`).
- **Pydantic v2 models as the API contract** — never pass ORM models to response serializers.
- **`from __future__ import annotations`** at the top of every module.
- **`ABC` for repository interfaces** — infrastructure implementations must not leak into application or domain layers.
- **`UUID` primary keys** — never expose auto-increment integer IDs in the API.

---

## Project Folder Structure

```
{project_name}/
├── pyproject.toml
├── .env.example
├── alembic.ini
├── alembic/
│   ├── env.py
│   └── versions/
├── src/
│   └── {project_name}/
│       ├── main.py                  ← FastAPI app factory + lifespan
│       ├── config.py                ← Pydantic BaseSettings
│       ├── domain/
│       │   ├── models.py            ← SQLAlchemy mapped classes (pure domain)
│       │   └── repositories.py      ← Abstract repository interfaces (ABC)
│       ├── application/
│       │   ├── schemas.py           ← Pydantic v2 request/response models
│       │   └── use_cases/           ← One file per use case
│       ├── infrastructure/
│       │   ├── database.py          ← AsyncEngine, AsyncSession factory
│       │   └── repositories/        ← Concrete SQLAlchemy implementations
│       └── api/
│           ├── dependencies.py      ← FastAPI Depends() factories
│           ├── middleware.py        ← Request ID, correlation ID
│           └── v1/                  ← Router modules per domain
└── tests/
    ├── conftest.py                  ← pytest fixtures (DB, client, factories)
    ├── unit/
    └── integration/
```

---

## Alembic Configuration

`alembic/env.py` — async migration runner:
```python
from sqlalchemy.ext.asyncio import async_engine_from_config
from sqlalchemy import pool
from alembic import context
from {project_name}.domain.models import Base
from {project_name}.config import get_settings

def run_migrations_online() -> None:
    settings = get_settings()
    config.set_main_option("sqlalchemy.url", settings.database_url)
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    # ... run migrations
```

---

## Docker Image Template

```dockerfile
FROM python:3.12-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN addgroup --system appgroup && adduser --system --group appuser

FROM base AS builder
WORKDIR /build
RUN pip install uv
COPY pyproject.toml .
RUN uv pip install --system --no-dev .

FROM base AS final
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12 /usr/local/lib/python3.12
COPY --from=builder /usr/local/bin /usr/local/bin
COPY src/ ./src/
USER appuser
EXPOSE 8000
CMD ["uvicorn", "{project_name}.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Rules:
- Multi-stage build — build tools never in final image.
- Non-root user (`appuser`) — mandatory.
- `python:3.12-slim` base — no dev tools, minimal attack surface.
- `PYTHONDONTWRITEBYTECODE=1` + `PYTHONUNBUFFERED=1` — container-friendly behaviour.
- No `latest` tags — always pin base image version.

---

## Standard Error Response Format

All errors must follow the project's Problem Details convention. Use a FastAPI exception handler:
```python
from fastapi.responses import JSONResponse

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "type": exc.error_type,
            "title": exc.title,
            "status": exc.status_code,
            "detail": exc.detail,
            "instance": str(request.url),
        },
    )
```
