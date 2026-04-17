# Frontend Development Standards

> **Tier 2 — Skill-local standards.** Extends [Core Standards (Tier 1)](../../standards/core.md). Core standards apply universally; this file adds frontend-specific architecture rules, component conventions, and testing standards.

These are the **non-negotiable, project-independent** standards for all React TypeScript frontend implementations.
The SKILL.md procedure references these. Do not deviate — justify any exception in a code comment or ADR.

---

## Architecture Rules (Non-Negotiable)

- **TypeScript strict mode**: `"strict": true` in `tsconfig.json` — zero `any` types permitted
- **Feature isolation**: Features cannot import directly from other features — use `shared/` only
- **Co-located tests**: Test files next to source (`Button.test.tsx` beside `Button.tsx`)
- **No prop drilling > 2 levels**: Use context or state management instead
- **Centralized API layer**: All HTTP calls through TanStack Query hooks — never raw `fetch` in components
- **No business logic in components**: Extract to custom hooks
- **Error boundaries**: Required around every route and every major feature
- **Loading states**: Every async operation must show a loading indicator
- **Empty states**: Every list must handle the zero-item case

---

## Project Folder Structure (Feature-Based)

```
src/
├── app/                    ← App entry, providers, router
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
├── features/               ← Domain features — one folder per feature
│   ├── auth/
│   │   ├── api/            ← TanStack Query hooks + Axios calls
│   │   ├── components/     ← Feature-specific UI components
│   │   ├── hooks/          ← Feature custom hooks
│   │   ├── types/          ← TypeScript interfaces for this feature
│   │   └── index.ts        ← Public API of this feature (barrel export)
│   └── [feature-name]/
│       └── (same structure)
├── shared/
│   ├── components/
│   │   ├── ui/             ← Design system primitives (Button, Input, etc.)
│   │   └── layout/         ← Layout components (Sidebar, Header, PageLayout)
│   ├── hooks/              ← Global custom hooks
│   ├── lib/                ← Third-party wrappers (axios instance, queryClient)
│   ├── types/              ← Global TypeScript types
│   └── utils/              ← Pure utility functions (no side effects)
├── styles/                 ← Global CSS, design tokens (CSS custom properties)
└── test/                   ← Vitest setup, global mocks
```

---

## TypeScript Configuration (`tsconfig.json`)

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
    "paths": { "@/*": ["./src/*"] },
    "jsx": "react-jsx"
  }
}
```

---

## ESLint Rules (must-have)

```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

---

## Token Storage Rules

| Token | Storage | Rationale |
|---|---|---|
| Access token | `sessionStorage` (or in-memory) | Never `localStorage` — XSS risk |
| Refresh token | `httpOnly` cookie (preferred) | Not accessible to JS |
| User preferences | `localStorage` | Non-sensitive only |

---

## API Integration Patterns

### Axios instance
```typescript
// src/shared/lib/api.ts
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

### TanStack Query key factory
```typescript
export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (filters: Filters) => [...itemKeys.lists(), filters] as const,
  detail: (id: string) => [...itemKeys.all, 'detail', id] as const,
};
```

---

## Environment Variables Naming Convention

| Variable | Example |
|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` |
| `VITE_AUTH_URL` | `http://localhost:8080/api/v1/auth` |
| `VITE_APP_NAME` | `PSA GUI` |

Rules: Always prefixed with `VITE_`. Never include secrets. Document all in `README.md`.

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

Verify with: `pnpm run build && pnpm dlx vite-bundle-visualizer`
