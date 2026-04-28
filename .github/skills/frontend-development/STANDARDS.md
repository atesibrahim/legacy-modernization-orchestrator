# Frontend Development Standards

> **Tier 2 — Skill-local standards.** Extends [Core Standards (Tier 1)](../../standards/core.md). Core standards apply universally; this file adds frontend-specific architecture rules, component conventions, and testing standards.

These are the **non-negotiable, project-independent** standards for all web frontend implementations (React / Vue / Angular / Svelte + TypeScript).
Where a rule or example is framework-specific it is marked _(React)_, _(Vue)_, _(Angular)_, or _(Svelte)_. All other rules apply to every framework.
The SKILL.md procedure references these. Do not deviate — justify any exception in a code comment or ADR.

---

## Architecture Rules (Non-Negotiable)

- **TypeScript strict mode**: `"strict": true` in `tsconfig.json` — zero `any` types permitted
- **Feature isolation**: Features cannot import directly from other features — use `shared/` only
- **Co-located tests**: Test files next to source (`Button.test.tsx` beside `Button.tsx`)
- **No prop drilling > 2 levels**: Use context or state management instead
- **Centralized API layer**: All HTTP calls through the framework's declared data-fetching layer — never raw `fetch` in components. _(React / Vue / Svelte: TanStack Query hooks + Axios; Angular: `HttpClient` via injectable services, optionally wrapped in NgRx effects.)_
- **No business logic in components**: Extract to custom hooks / composables / services (per framework)
- **Error boundaries / error handling**: Every route and every major feature must handle errors gracefully. _(React: `ErrorBoundary` component; Vue: `errorCaptured` hook or `app.config.errorHandler`; Angular: `ErrorHandler` service override; Svelte: `{:catch}` in `{#await}` blocks.)_
- **Loading states**: Every async operation must show a loading indicator
- **Empty states**: Every list must handle the zero-item case

---

## Project Folder Structure (Feature-Based)

> The tree below uses React file extensions as the reference. Substitute `.vue` for Vue single-file components, `.component.ts` / `.component.html` for Angular, and `.svelte` for Svelte. Angular projects follow the Angular CLI workspace layout; adapt the `features/` grouping within `src/app/`.

```
src/
├── app/                    ← App entry, providers, router
│   ├── App.tsx             ← (React) root component; Vue: App.vue; Angular: app.component.ts
│   ├── router.tsx          ← (React Router / Vue Router); Angular: app.routes.ts
│   └── providers.tsx       ← (React) context/query providers; Angular: app.config.ts
├── features/               ← Domain features — one folder per feature
│   ├── auth/
│   │   ├── api/            ← Data-fetching layer (TanStack Query hooks + Axios; Angular: services)
│   │   ├── components/     ← Feature-specific UI components
│   │   ├── hooks/          ← Custom hooks / composables / Angular services
│   │   ├── types/          ← TypeScript interfaces for this feature
│   │   └── index.ts        ← Public API of this feature (barrel export)
│   └── [feature-name]/
│       └── (same structure)
├── shared/
│   ├── components/
│   │   ├── ui/             ← Design system primitives (Button, Input, etc.)
│   │   └── layout/         ← Layout components (Sidebar, Header, PageLayout)
│   ├── hooks/              ← Global custom hooks / composables
│   ├── lib/                ← Third-party wrappers (axios instance, queryClient, Angular providers)
│   ├── types/              ← Global TypeScript types
│   └── utils/              ← Pure utility functions (no side effects)
├── styles/                 ← Global CSS, design tokens (CSS custom properties)
└── test/                   ← Test setup, global mocks (Vitest / Jest / Angular TestBed config)
```

---

## TypeScript Configuration (`tsconfig.json`)

Required options for all frameworks:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Framework-specific additions:
- _React_: add `"jsx": "react-jsx"`
- _Vue_: Vite handles JSX transform via `@vitejs/plugin-vue`; no `jsx` key needed
- _Angular_: Angular CLI generates its own `tsconfig.app.json` / `tsconfig.spec.json`; add `paths` alias manually
- _Svelte_: `svelte-check` handles type checking; Vite config drives TS transform

---

## ESLint Rules (must-have)

All frameworks require `@typescript-eslint/recommended` plus the framework-specific plugins below:

```json
{
  "extends": ["@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

Framework-specific additions (extend the config above):
- _React_: extend `"plugin:react-hooks/recommended"`, `"plugin:jsx-a11y/recommended"`; add rules `"@typescript-eslint/no-unused-vars": "error"`, `"react-hooks/exhaustive-deps": "warn"`
- _Vue_: extend `"plugin:vue/vue3-recommended"`, `"plugin:vuejs-accessibility/recommended"`
- _Angular_: extend `"plugin:@angular-eslint/recommended"`, `"plugin:@angular-eslint/template/recommended"`
- _Svelte_: extend `"plugin:svelte/recommended"`, `"plugin:jsx-a11y/recommended"`

---

## Token Storage Rules

| Token | Storage | Rationale |
|---|---|---|
| Access token | `sessionStorage` (or in-memory) | Never `localStorage` — XSS risk |
| Refresh token | `httpOnly` cookie (preferred) | Not accessible to JS |
| User preferences | `localStorage` | Non-sensitive only |

---

## API Integration Patterns

### HTTP client setup

_React / Vue / Svelte_ — Axios instance (`src/shared/lib/api.ts`):
```typescript
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401) { /* refresh token logic */ }
    return Promise.reject(error);
  }
);
```

_Angular_ — use `HttpInterceptor` instead of Axios:
```typescript
// src/shared/interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenStorageService).get();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  return next(authReq);
};
```

### TanStack Query key factory _(React / Vue / Svelte)_
```typescript
export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (filters: Filters) => [...itemKeys.lists(), filters] as const,
  detail: (id: string) => [...itemKeys.all, 'detail', id] as const,
};
```
_Angular_: use a typed service method returning `Observable<T>`; caching is handled by HTTP caching headers or a dedicated cache service.

---

## Environment Variables Naming Convention

_React / Vue / Svelte (Vite-based)_ — prefix `VITE_`:

| Variable | Example |
|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` |
| `VITE_AUTH_URL` | `http://localhost:8080/api/v1/auth` |
| `VITE_APP_NAME` | `PSA GUI` |

_Angular (Angular CLI)_ — use `src/environments/environment.ts` and `environment.prod.ts`; inject via `environment.apiBaseUrl`. Never expose secrets. Document all in `README.md`.

---

## Phase Tracker Template (`fe_development_todo.md`)

```markdown
# Frontend Development Todo

## Progress Tracker
- [ ] Phase 1: Project Setup & Tooling
- [ ] Phase 2: Review Phase 1
- [ ] Phase 3: Design System & Shared Components
- [ ] Phase 4: Review Phase 3
- [ ] Phase 5: Auth Feature
- [ ] Phase 5.5: Feature Decomposition Check
- [ ] Phase 6: Core Feature(s) Implementation
- [ ] Phase 7: Review Phase 5-6
- [ ] Phase 8: API Integration & Data Layer
- [ ] Phase 9: Review Phase 8
- [ ] Phase 10: Performance Optimization
- [ ] Phase 11: Testing
- [ ] Phase 12: Final Review & Cleanup
```

---

## Bundle Size Targets

| Bundle | Target |
|---|---|
| Initial JS | < 500 KB (gzipped < 150 KB) |
| Total JS | < 2 MB |
| Largest route chunk | < 200 KB |

Verify with:
- _React / Vue / Svelte_: `pnpm run build && pnpm dlx vite-bundle-visualizer`
- _Angular_: `ng build --stats-json && npx webpack-bundle-analyzer dist/stats.json`
