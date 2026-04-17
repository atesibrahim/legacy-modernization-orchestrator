---
name: python-fastapi
description: 'Python 3.12 + FastAPI backend — clean/hexagonal architecture, SQLAlchemy 2, Alembic, Pydantic v2, pytest-asyncio, structlog, pyproject.toml. Apply when tech_stack_selections.md confirms Python + FastAPI as the backend stack.'
argument-hint: 'Project name or path to system design artifacts to base backend implementation on'
---

# Python 3.12 + FastAPI — Backend Implementation

> These are the Python-specific implementation steps that complement [`backend-development/SKILL.md`](../backend-development/SKILL.md). Apply these when `tech_stack_selections.md` confirms `Python + FastAPI` as the backend stack.

See also: [`STANDARDS.md`](./STANDARDS.md) for Python-specific architecture rules, project folder structure, and Docker image template.

---

## Best Practices

### Project Setup & Structure

- **`pyproject.toml`** as the single project manifest — no `setup.py` or `requirements.txt` in the source tree.
- **`uv`** or **`poetry`** for dependency management and virtual environment — pin exact versions in lock file.
- **`src/` layout** — source code lives in `src/{project_name}/`, not at the repo root. Prevents accidental imports of the editable package.
- **`python-dotenv`** for local environment variables — never commit `.env` files.

### Type Safety

- **`from __future__ import annotations`** — deferred evaluation at the top of every module.
- **Pydantic v2** for all data models, request/response schemas, and settings.
- **`mypy` + `pyright`** in strict mode — CI fails on type errors.
- **`ruff`** for linting and formatting — replaces `flake8`, `isort`, `black`.

### Dependency Injection

- **FastAPI `Depends()`** for all injectable dependencies (DB session, current user, services).
- **Repository pattern** behind abstract base classes (`abc.ABC`) — no SQLAlchemy queries in route handlers.
- **`lifespan` context manager** (not deprecated `@app.on_event`) for startup/shutdown.

### Configuration

- **Pydantic `BaseSettings`** for typed, validated settings loaded from environment.
- Separate settings classes per concern: `DatabaseSettings`, `AuthSettings`, `RedisSettings`.
- `model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_")`.

### Data Layer

- **SQLAlchemy 2.x async** with `AsyncSession` + `async_sessionmaker`.
- **`DeclarativeBase`** with type annotations (`Mapped[T]`, `mapped_column()`).
- **`AsyncAttrs` mixin** for lazy-loading safety in async context.
- One `AsyncSession` per request — injected via `Depends(get_db)`.

### Logging

- **`structlog`** for structured JSON logging — never bare `print()` or stdlib `logging.info()`.
- Bind `request_id`, `user_id`, `trace_id` into the context processor chain.
- Log level via `APP_LOG_LEVEL` environment variable.

### Testing

- **`pytest`** + **`pytest-asyncio`** — all tests `async def`.
- **`httpx.AsyncClient`** with `ASGITransport` for integration tests — no live server.
- **Testcontainers** (`testcontainers-python`) for real PostgreSQL/Redis in integration tests.
- **`factory_boy`** for test data factories.
- Coverage via `pytest-cov` — target ≥ 70%.

### Security

- **`python-jose`** or **`authlib`** for JWT decoding.
- **`passlib[bcrypt]`** for password hashing — never MD5/SHA1.
- **`slowapi`** (Starlette rate limiter) for API rate limiting.
- SQL injection prevention: always use SQLAlchemy ORM or parameterized `text()` — never f-strings in queries.

---

## Phase 1 — Project Setup (Python / FastAPI)

**`pyproject.toml`** — required dependencies:
```toml
[project]
name = "{project-name}"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.115",
    "uvicorn[standard]>=0.32",
    "pydantic>=2.9",
    "pydantic-settings>=2.6",
    "sqlalchemy[asyncio]>=2.0",
    "asyncpg>=0.30",
    "alembic>=1.14",
    "structlog>=24.4",
    "python-jose[cryptography]>=3.3",
    "passlib[bcrypt]>=1.7",
    "httpx>=0.27",
]

[dependency-groups]
dev = [
    "pytest>=8.3",
    "pytest-asyncio>=0.24",
    "pytest-cov>=6.0",
    "httpx>=0.27",
    "factory-boy>=3.3",
    "testcontainers[postgres]>=4.8",
    "mypy>=1.13",
    "ruff>=0.7",
]
```

**Configuration files**:
- `.env` — local development secrets (gitignored)
- `.env.example` — template with all required keys, no values
- `alembic.ini` + `alembic/env.py` — migration configuration

---

## Phase 5 — Application & Infrastructure Layers (Python)

**Application Layer** — use cases as plain async functions or classes:
```python
# application/use_cases/create_order.py
from domain.models import Order
from domain.repositories import OrderRepository
from application.schemas import CreateOrderRequest, OrderResponse

async def create_order(
    request: CreateOrderRequest,
    repo: OrderRepository,
) -> OrderResponse:
    order = Order.create(customer_id=request.customer_id, lines=request.lines)
    saved = await repo.save(order)
    return OrderResponse.model_validate(saved)
```

**Infrastructure Layer** — SQLAlchemy async repository:
```python
# infrastructure/repositories/order_repository.py
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from domain.models import Order
from domain.repositories import OrderRepository

class SqlOrderRepository(OrderRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save(self, order: Order) -> Order:
        self._session.add(order)
        await self._session.flush()
        return order

    async def find_by_id(self, order_id: UUID) -> Order | None:
        result = await self._session.execute(
            select(Order).where(Order.id == order_id)
        )
        return result.scalar_one_or_none()
```

**FastAPI route handler** (thin — delegates to use case):
```python
# api/v1/orders.py
from fastapi import APIRouter, Depends, status
from application.use_cases.create_order import create_order
from application.schemas import CreateOrderRequest, OrderResponse
from api.dependencies import get_order_repository

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order_endpoint(
    request: CreateOrderRequest,
    repo = Depends(get_order_repository),
) -> OrderResponse:
    return await create_order(request, repo)
```

---

## Phase 7 — FastAPI Security Configuration

```python
# api/security.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

bearer_scheme = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    settings: AuthSettings = Depends(get_auth_settings),
) -> TokenPayload:
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.public_key,
            algorithms=[settings.algorithm],
            audience=settings.audience,
        )
        return TokenPayload(**payload)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
```

**CORS** (set exact origins — never `allow_origins=["*"]` in production):
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

---

## Phase 9 — Integrations (Python)

- **Scheduling**: `APScheduler` with `AsyncIOScheduler` and a persistent job store (PostgreSQL), or `Celery Beat` for task queues.
- **Task queue**: `Celery` with Redis or RabbitMQ broker; `arq` for simpler async background jobs.
- **Email**: `fastapi-mail` with `aiosmtplib`.
- **HTTP clients**: `httpx.AsyncClient` (never `requests` in async code) — use as a context manager.

---

## Phase 11 — Observability (Python)

**Logging** (structlog in `main.py`):
```python
import structlog

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
)
```

**Metrics**: `prometheus-fastapi-instrumentator` — auto-instruments all routes; exposes `/metrics`.

**Tracing**: `opentelemetry-instrumentation-fastapi` + `opentelemetry-instrumentation-sqlalchemy`.

**Health checks**:
```python
@app.get("/health/live")
async def liveness() -> dict:
    return {"status": "ok"}

@app.get("/health/ready")
async def readiness(db: AsyncSession = Depends(get_db)) -> dict:
    await db.execute(text("SELECT 1"))
    return {"status": "ok"}
```

---

## Phase 12 — Quality Gate (Python)

- **Coverage**: `pytest-cov` — `pytest --cov=src --cov-fail-under=70`.
- **Dependency security**: `pip-audit` — fail on CVSS ≥ 7.
- **Linting / formatting**: `ruff check . --fix` + `ruff format .` — zero warnings allowed in CI.
- **Type checking**: `mypy src/ --strict` or `pyright` — zero errors in CI.
- **Alembic**: `alembic check` — fail CI if there are unapplied model changes without a migration.
