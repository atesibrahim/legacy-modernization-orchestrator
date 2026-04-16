---
name: frontend-development
description: 'Frontend development skill for legacy modernization. Act as a senior expert frontend developer. Use when: building React 18 TypeScript frontend, implementing design system components, state management Redux Toolkit Zustand TanStack Query, API integration Axios, code splitting lazy loading performance optimization, Jest Cypress Playwright testing, phased frontend development plan. For mobile clients use ios-development or android-development skills instead.'
argument-hint: 'Project name or path to UI/UX design artifacts and system design to implement'
---

# Frontend Development

## Role
**Senior Expert Frontend Developer** — Build a performant, maintainable, accessible React frontend that faithfully implements the UX design system with clean, testable code.

## When to Use
- After `ui-ux-design` skill produces wireframes and design system
- After `target-architecture` confirms API contracts
- Starting or continuing phased frontend implementation

## Prerequisites
- `ai-driven-development/docs/ui_design/ui_ux_pages.md`
- `ai-driven-development/docs/target_architecture/target_architecture.md` (API contracts)
- Backend APIs available or OpenAPI spec for mock generation

## Output Location
Create folder `ai-driven-development/development/frontend_development/{project_name}` — all frontend code here.

---

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | React 18+ |
| Language | TypeScript (strict mode) |
| Build Tool | Vite |
| Package Manager | pnpm (preferred) / npm |
| API Layer | TanStack Query v5 + Axios |
| Routing | React Router v6 |
| Form Handling | React Hook Form + Zod |
| Testing (Unit) | Vitest + React Testing Library |
| Testing (E2E) | Playwright (preferred) / Cypress |
| Code Quality | ESLint + Prettier + TypeScript strict |

### Flexible / User-Selectable (confirm before Phase 1)

| Concern | Options |
|---|---|
| UI Component Library | MUI v5 / shadcn/ui + Tailwind CSS / Chakra UI v3 |
| Global State | Redux Toolkit / Zustand / Jotai / Context API only |
| Animation | Framer Motion / CSS transitions only |
| Charts / Data viz | Recharts / Chart.js / Victory / Nivo |
| Table | TanStack Table v8 / AG Grid Community |
| Rich Text Editor | TipTap / Quill / None |
| Internationalization | react-i18next / None |

---

## Folder Structure & Architecture Rules

> See [STANDARDS.md](./STANDARDS.md) for the project folder structure, TypeScript configuration, ESLint rules, API integration patterns, token storage rules, and phase tracker template.

---

## Procedure

### Step 0 — Create Frontend Phase Tracker
Before writing any code, add the frontend phase checklist from [STANDARDS.md](./STANDARDS.md) to the dev tracking file.

---

### Phase 1 — Project Setup & Tooling
**Goal**: Running project with full tooling configured.

1. **Vite + React + TypeScript scaffold**:
```bash
pnpm create vite frontend -- --template react-ts
```

2. **`tsconfig.json`** with strict mode:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

3. **ESLint + Prettier**:
   - `@typescript-eslint/recommended`
   - `eslint-plugin-react-hooks`
   - `eslint-plugin-jsx-a11y` (accessibility linting)

4. **Vite path aliases**: `@/` maps to `src/`

5. **Environment variables**: `VITE_API_BASE_URL`, `VITE_AUTH_URL` — no secrets in frontend

6. **Proxy config** (dev): Proxy `/api` to backend dev server in `vite.config.ts`

### Phase 2 — Review Phase 1
- [ ] TypeScript compiles with zero errors (strict mode)
- [ ] ESLint passes with zero errors
- [ ] Prettier formatting applied
- [ ] Dev server starts and hot-reloads correctly
- [ ] Proxy to backend works

---

### Phase 3 — Design System & Shared Components
**Goal**: Implement the complete design system before any feature code.

1. **Design tokens** → CSS custom properties in `src/styles/tokens.css`:
   - Colors, typography, spacing, radii, shadows, z-indices (from `ui_ux_pages.md`)

2. **Primitive components** (implement with chosen UI library):
   - `Button` — all variants (primary, secondary, ghost, destructive) + loading state
   - `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Toggle`
   - `Badge`/`Tag`
   - `Spinner`/`Loading`
   - `Avatar`

3. **Layout components**:
   - `PageLayout` — sidebar + header + content area
   - `Card` / `Panel`
   - `Modal` — with focus trap, accessible close handling
   - `Drawer`

4. **Data display**:
   - `DataTable` (with TanStack Table — sorting, pagination, row selection)
   - `EmptyState`
   - `ErrorState`

5. **Storybook stories** (optional but recommended for team):
   - One story per component variant

### Phase 4 — Review Phase 3
- [ ] All components render with no console errors
- [ ] TypeScript props typed strictly (no optional props unless truly optional)
- [ ] All interactive components keyboard accessible
- [ ] Color contrast verified for all text on backgrounds
- [ ] DataTable handles: loading, empty, error states

---

### Phase 5 — Authentication Feature
**Goal**: Working login, token management, protected routes.

1. **Auth API hooks** (`src/features/auth/api/`):
```typescript
// hooks/useLogin.ts
export const useLogin = () => useMutation({
  mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
  onSuccess: (data) => {
    tokenStorage.set(data.accessToken, data.refreshToken);
    queryClient.invalidateQueries();
  },
});
```

2. **Token storage**: `sessionStorage` for access token (never `localStorage` for JWTs), `httpOnly` cookie preferred for refresh token

3. **Axios interceptor**: Auto-attach Bearer token, auto-refresh on 401

4. **Protected Route wrapper**:
```typescript
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
```

5. **Login screen**: Matching wireframe from `ui_ux_pages.html`

6. **LDAP/SSO redirect**: If SSO configured, redirect to provider instead of inline form

---

### Phase 6 — Core Feature Implementation
**Goal**: Implement all domain features from the feature list.

For **each feature**, follow this pattern:

1. **Types** (`types/index.ts`): TypeScript interfaces matching OpenAPI response schemas
2. **API hooks** (`api/`): TanStack Query `useQuery` and `useMutation` hooks
3. **Components** (`components/`): Feature-specific UI, import from `shared/` not other features
4. **Hooks** (`hooks/`): Business logic extracted from components
5. **Page component**: Compose feature components, use layout from shared

**Data fetching pattern**:
```typescript
const { data, isLoading, isError, error } = useQuery({
  queryKey: ['items', filters],
  queryFn: () => itemsApi.getAll(filters),
  staleTime: 5 * 60 * 1000, // 5 min
});

if (isLoading) return <Spinner />;
if (isError) return <ErrorState error={error} />;
if (!data?.length) return <EmptyState />;
```

**Mutation pattern**:
```typescript
const { mutate, isPending } = useMutation({
  mutationFn: itemsApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['items'] });
    toast.success('Item created');
    onClose();
  },
  onError: (error) => toast.error(getApiErrorMessage(error)),
});
```

---

### Phase 7 — Review Phase 5-6
- [ ] Auth flow: login → protected routes → logout works end-to-end
- [ ] Token refresh works without user interruption
- [ ] All features render correct data from backend
- [ ] All forms have validation feedback
- [ ] Loading and error states show in all async operations
- [ ] No `console.error` in browser during normal navigation

---

### Phase 8 — API Integration & Data Layer
**Goal**: Harden the API layer for production.

1. **Centralized Axios instance** (`src/shared/lib/api.ts`):
   - Base URL from env var
   - Request interceptor: attach auth header
   - Response interceptor: handle 401 (refresh), 403 (redirect to error page), 500 (show toast)

2. **TanStack Query configuration**:
   - Global error handler
   - Retry strategy: 1 retry for 5xx, no retry for 4xx
   - Query key factory pattern for consistency

3. **Optimistic updates** for high-frequency mutations (delete, status toggle)

4. **Offline handling**: Show banner when network is unavailable (React Query's `useNetworkMode`)

5. **OpenAPI code generation** (optional but recommended):
```bash
pnpm dlx openapi-typescript http://localhost:8080/v3/api-docs -o src/shared/types/api.d.ts
```

### Phase 9 — Review Phase 8
- [ ] All API errors surface user-friendly messages (no raw JSON shown)
- [ ] Network offline handled gracefully
- [ ] Axios retry configured correctly
- [ ] No duplicate API calls (TanStack Query deduplication working)

---

### Phase 10 — Performance Optimization
**Goal**: Lighthouse score > 80, bundle < 500KB initial.

1. **Code splitting**: Each route lazy-loaded:
```typescript
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'));
```

2. **Image optimization**: Use WebP where possible, `loading="lazy"` on images

3. **Bundle analysis**:
```bash
pnpm run build -- --report # Rollup bundle visualizer
```

4. **React rendering optimization**:
   - `React.memo` on expensive list item components
   - `useMemo` / `useCallback` only where profiling shows benefit (avoid premature optimization)
   - Virtualization for lists > 100 items (TanStack Virtual)

5. **Cache strategy**: Set appropriate `staleTime` and `gcTime` per query type

---

### Phase 11 — Testing
**Goal**: Verified, trustworthy test suite.

**Unit Tests** (Vitest + React Testing Library):
```typescript
describe('Button', () => {
  it('calls onClick when not disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

Coverage targets:
- All shared components: 100%
- All custom hooks: ≥ 80%
- Feature components: ≥ 60%

**E2E Tests** (Playwright):
- Login → access protected page → logout flow
- Critical business workflows (create, update, delete core entities)
- Error state testing (mock API 500 response)

**Accessibility Tests**:
```typescript
import { axe } from 'vitest-axe';
it('has no accessibility violations', async () => {
  const { container } = render(<LoginPage />);
  expect(await axe(container)).toHaveNoViolations();
});
```

### Phase 12 — Final Review & Cleanup
- [ ] Bundle size acceptable (< 500KB initial, total < 2MB)
- [ ] Lighthouse: Performance > 80, Accessibility > 90
- [ ] No `@ts-ignore` or `any` types
- [ ] No `console.log` in production code
- [ ] All environment variables documented in `README.md`
- [ ] `src/features/` structure consistent across all features

---

## Definition of Done (DoD)

### Code Quality
- [ ] TypeScript strict mode — zero errors, zero `any` types
- [ ] Zero critical ESLint errors including a11y rules
- [ ] Consistent folder structure across all features

### Functional
- [ ] All screens implemented matching wireframes
- [ ] All API integrations complete and tested
- [ ] Auth flow working end-to-end with backend

### UX
- [ ] UI matches design system (colors, spacing, typography)
- [ ] Loading states on every async operation
- [ ] Error states with actionable messages
- [ ] Empty states for all lists

### Performance
- [ ] Lighthouse Performance score > 80
- [ ] Initial bundle < 500KB (JS)
- [ ] No memory leaks (verified with React DevTools Profiler)

### Testing
- [ ] Unit test coverage: shared components 100%, hooks 80%+
- [ ] E2E tests cover critical user journeys
- [ ] Accessibility tests pass (axe-core)

### Deployment
- [ ] Production build succeeds
- [ ] Environment variables documented

---

## Related Skills
- Mobile clients: use [`ios-development`](../ios-development/SKILL.md) for native iOS or [`android-development`](../android-development/SKILL.md) for native Android

## Next Skill
When frontend is production-ready, proceed to [`compare-legacy-to-new`](../compare-legacy-to-new/SKILL.md) to validate functional equivalence.
