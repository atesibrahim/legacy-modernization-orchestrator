---
name: cross-platform-mobile
description: 'Cross-platform mobile skill for legacy modernization. Use when: building a Flutter or React Native app for iOS and Android from one codebase with standard state management, secure storage, API networking, push notifications, testing, and store release workflows. Not the default path: use ios-development and android-development for native-first projects. Requires tech_stack_selections.md confirming Flutter or React Native.'
argument-hint: 'Project name or path to UI/UX design artifacts and system design to implement'
version: 1.0.0
last_reviewed: 2026-04-27
status: Active
---

# Cross-Platform Mobile Development

## Role
**Senior Master Cross-Platform Mobile Developer** — Build a performant, maintainable, accessible cross-platform mobile application (Flutter or React Native) that faithfully implements the UX design system, consumes backend APIs, and ships to both the App Store and Google Play from a single codebase.

## When to Use
- After `ui-ux-design` skill produces wireframes and mobile design system
- After `target-architecture` confirms API contracts (OpenAPI spec available)
- `tech_stack_selections.md` § Mobile confirms Flutter **or** React Native as the mobile target
- The project explicitly trades platform-native behaviour for a unified codebase and shared team

> **Default recommendation is still native**: Use `ios-development` + `android-development` when code quality, platform-native UX, and maximum OS integration are priorities. Use this skill only when `tech_stack_selections.md` explicitly selects cross-platform.

## Prerequisites (Preflight)
Before starting, verify the following artifacts exist:

| Artifact | Expected Path | Required? |
|---|---|---|
| UI/UX design | `ai-driven-development/docs/ui_design/ui_ux_pages.md` | Always |
| Target architecture (API contracts) | `ai-driven-development/docs/target_architecture/target_architecture.md` | Always |
| Tech stack selection confirming Flutter or React Native | `ai-driven-development/docs/tech_stack_selections.md` | Always |
| Backend OpenAPI spec or running API | `ai-driven-development/development/backend_development/` or OpenAPI spec URL | Recommended |

**If any required artifact is missing**: Stop. Report which artifact is missing, which phase produces it (Phase 4a: `ui-ux-design`, Phase 3: `target-architecture`, Phase 2.5: `tech-stack-selection`), and offer: (a) Run the prerequisite phase now, (b) Provide the artifact path manually.

## Output Location
Create folder `ai-driven-development/development/mobile_development/cross-platform/{project_name}` — all cross-platform code here.
- `ai-driven-development/development/mobile_development/cross-platform/cross_platform_development_todo.md` — phase tracker with all phases checked off as they complete.

---

## Framework Selection

Read `tech_stack_selections.md` § Mobile to confirm the framework. Do NOT ask the user again. If the selection is not present, stop and run Phase 2.5.

| Framework | Choose when |
|---|---|
| **Flutter** | Team knows Dart; need pixel-perfect custom UI across platforms; performance-critical animations; single widget tree shared 100% |
| **React Native** | Team knows React/TypeScript; brownfield app embedding into existing iOS/Android; large JS ecosystem leverage; Expo managed workflow preferred |

---

## Tech Stack

### Flutter Path

| Concern | Technology |
|---|---|
| Language | Dart 3.3+ |
| SDK | Flutter 3.19+ |
| Minimum iOS | iOS 16.0 |
| Minimum Android | API 26 (Android 8.0) |
| State Management | Riverpod 2 (default) or BLoC 8+ |
| Navigation | go_router 13+ |
| Networking | Dio 5 + Retrofit (dart) |
| Serialization | json_serializable + freezed |
| Secure Storage | flutter_secure_storage |
| Local Persistence | sqflite (SQL) or Isar (NoSQL) |
| Push Notifications | firebase_messaging |
| Dependency Injection | Riverpod providers (no separate DI lib) |
| Testing (Unit/Widget) | flutter_test |
| Testing (Integration) | integration_test package |
| Code Quality | flutter_lints + custom analysis_options.yaml |

### React Native Path

| Concern | Technology |
|---|---|
| Language | TypeScript 5+ |
| Framework | React Native 0.73+ (bare workflow) or Expo SDK 50+ (managed) |
| Minimum iOS | iOS 16.0 |
| Minimum Android | API 26 (Android 8.0) |
| State Management | Zustand (default) or Redux Toolkit |
| Navigation | React Navigation 6 |
| Networking | Axios |
| Secure Storage | react-native-keychain |
| Local Persistence | WatermelonDB (SQL) or MMKV (key-value) |
| Push Notifications | @react-native-firebase/messaging |
| Dependency Injection | React Context + hooks |
| Testing (Unit) | Jest + React Native Testing Library |
| Testing (Integration) | Detox |
| Code Quality | ESLint (airbnb-typescript) + Prettier |

### Confirmed Tech Choices (read from `tech_stack_selections.md`)

> **Do NOT ask the user for these** — all choices were confirmed in Phase 2.5 and saved to `ai-driven-development/docs/tech_stack_selections.md`. Read that file before Phase 1 and apply the confirmed selections throughout.

| Concern | `tech_stack_selections.md` key |
|---|---|
| Framework (Flutter / React Native) | § Mobile → Framework |
| Minimum iOS target | § Mobile → Minimum iOS Target |
| Minimum Android SDK | § Mobile → Minimum SDK |
| Local persistence strategy | § Mobile → Local Persistence |
| Crash reporting | § Mobile → Crash Reporting |
| Analytics | § Mobile → Analytics |

---

## Procedure

### Step 0 — Create Cross-Platform Phase Tracker

Before writing any code, create `cross_platform_development_todo.md` with each phase below as an unchecked checkbox. Update checkboxes as each phase completes.

---

### Phase 1 — Project Setup & Tooling

**Goal**: Cross-platform project builds and runs on both iOS simulator and Android emulator.

#### Flutter
1. `flutter create --org com.{company} --project-name {project_name} .` inside output folder
2. Add all dependencies to `pubspec.yaml` (Riverpod, go_router, Dio, json_serializable, freezed, flutter_secure_storage, firebase_messaging, flutter_lints)
3. Configure `analysis_options.yaml` extending `flutter_lints`
4. Set up `flutter_flavorizr` or manual flavor config for dev/staging/prod environments
5. Initialize Firebase project; add `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) — store originals outside version control

#### React Native
1. `npx @react-native-community/cli init {ProjectName} --template react-native-template-typescript` (bare) **or** `npx create-expo-app {ProjectName} --template expo-template-typescript` (Expo)
2. Add all dependencies (`zustand`, `@react-navigation/native`, `axios`, `react-native-keychain`, `@react-native-firebase/app`, `@react-native-firebase/messaging`, `watermelondb` or `mmkv`, `detox`)
3. Configure ESLint + Prettier (`.eslintrc.js`, `.prettierrc`)
4. Set up multiple environment configs (`react-native-config` or Expo's `.env` + `eas.json`)
5. Initialize Firebase; add platform config files as above

**Phase 1 checklist**:
- [ ] `flutter run` / `npx react-native run-ios` and `run-android` succeed on clean checkout
- [ ] Lint passes with zero warnings
- [ ] No API keys, credentials, or Firebase config files committed
- [ ] Environment switching (dev/staging/prod) works

---

### Phase 2 — Design System & Shared Components

**Goal**: Full design system implemented from `ui_ux_pages.md` design tokens before feature code.

#### Flutter
1. **Theme** (`lib/core/theme/`): `AppColors`, `AppTypography`, `AppSpacing`, `AppThemeData` — map all tokens from `tokens.json`
2. **Shared widgets** (`lib/shared/widgets/`): `PrimaryButton`, `SecondaryButton`, `AppTextField`, `LoadingView`, `ErrorView`, `EmptyStateView`, `AppSnackBar`
3. Apply `ThemeData` app-wide; verify light + dark mode support via `MediaQuery.platformBrightness`

#### React Native
1. **Theme** (`src/theme/`): `colors.ts`, `typography.ts`, `spacing.ts`, `shadows.ts` — map from `tokens.json`
2. **Shared components** (`src/components/`): `PrimaryButton`, `SecondaryButton`, `AppTextInput`, `LoadingOverlay`, `ErrorView`, `EmptyState`, `Toast`
3. Apply theme via React Context `ThemeProvider`; support system dark mode via `useColorScheme()`

**Phase 2 checklist**:
- [ ] All design tokens mapped (zero hardcoded color/font values in component code)
- [ ] Components render correctly on both iOS and Android
- [ ] Dark mode supported
- [ ] VoiceOver / TalkBack labels on all interactive components
- [ ] Lint zero warnings

---

### Phase 3 — Navigation Structure

**Goal**: Full navigation skeleton navigates between all screens with correct transitions.

#### Flutter (go_router)
```dart
// lib/core/router/app_router.dart
final appRouter = GoRouter(
  initialLocation: '/splash',
  routes: [
    GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
    GoRoute(path: '/login',  builder: (_, __) => const LoginScreen()),
    ShellRoute(
      builder: (_, __, child) => MainScaffold(child: child),
      routes: [
        GoRoute(path: '/home',    builder: (_, __) => const HomeScreen()),
        GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
      ],
    ),
  ],
  redirect: (context, state) => authGuard(context, state),
);
```

#### React Native (React Navigation)
```tsx
// src/navigation/AppNavigator.tsx
const Stack = createNativeStackNavigator<RootStackParamList>();
export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Splash"   component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login"    component={LoginScreen}  options={{ headerShown: false }} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  </NavigationContainer>
);
```

**Phase 3 checklist**:
- [ ] All screens reachable via navigation
- [ ] Back-stack behaviour correct on both platforms
- [ ] Deep link URLs mapped to routes (test with `xcrun simctl openurl` / `adb shell am start`)
- [ ] Auth guard redirects unauthenticated users to login

---

### Phase 4 — Authentication

**Goal**: Login, token storage, silent refresh, and logout working end-to-end.

1. **Login screen** — calls `POST /api/v1/auth/token`, validates required fields, shows loading state, handles error responses per RFC 9457
2. **Token storage** — access token + refresh token stored in `flutter_secure_storage` / `react-native-keychain` **never** in `SharedPreferences` / `AsyncStorage`
3. **HTTP client interceptor** — attach `Authorization: Bearer <token>` to every request; on 401 → trigger silent refresh; on refresh failure → redirect to login
4. **Session persistence** — on app restart, read tokens from secure storage, attempt silent refresh before showing main screen
5. **Logout** — clear secure storage, invalidate server session, navigate to login

**Phase 4 checklist**:
- [ ] Login works against real backend
- [ ] Tokens stored only in secure storage (not in plain key-value store)
- [ ] Silent refresh works; 401 cascades correctly to logout
- [ ] Biometric unlock wired to secure storage retrieval (optional, if in scope)

---

### Phase 5 — Core Feature Screens

**Goal**: All primary screens from `ui_ux_pages.md` implemented and connected to backend APIs.

For each screen in scope (read from `ui_ux_pages.md`):
1. Create screen widget/component in `features/{feature_name}/`
2. Create ViewModel / StateNotifier (Flutter) or Zustand slice (React Native)
3. Implement repository calling backend API (Dio/Axios)
4. Map API response to domain model
5. Handle loading, empty, error, and success states
6. Write at least one widget/component test per screen

> Refer to [quality-playbook/SKILL.md](../quality-playbook/SKILL.md) §2.4 (Anemic Domain Model) and §2.7 (N+1 Query) before finalising data-fetching strategy.

**Feature architecture (Flutter example)**:
```
lib/features/orders/
  ├── data/
  │   ├── order_repository.dart        ← interface
  │   ├── order_repository_impl.dart   ← Dio implementation
  │   └── order_dto.dart               ← JSON ↔ domain mapping
  ├── domain/
  │   ├── order.dart                   ← freezed domain model
  │   └── order_status.dart
  └── presentation/
      ├── orders_screen.dart
      ├── orders_notifier.dart         ← Riverpod AsyncNotifier
      └── widgets/
          └── order_card.dart
```

**Feature architecture (React Native example)**:
```
src/features/orders/
  ├── api/         ordersApi.ts      ← Axios calls
  ├── store/       ordersStore.ts    ← Zustand slice
  ├── screens/     OrdersScreen.tsx
  └── components/  OrderCard.tsx
```

---

### Phase 6 — Local Persistence & Offline Support

**Goal**: Key data cached locally; app usable in degraded network conditions.

#### Flutter (sqflite / Isar)
- Define local schema mirroring read-heavy API responses
- Repository pattern: check local cache first, fetch remote on miss or stale TTL
- Background sync via `WorkManager` plugin for data refresh

#### React Native (WatermelonDB / MMKV)
- WatermelonDB for relational data, MMKV for scalar config / user preferences
- Same cache-first repository pattern
- Background fetch via `react-native-background-fetch`

**Phase 6 checklist**:
- [ ] App renders last-known data when offline
- [ ] Stale-while-revalidate strategy implemented for list screens
- [ ] Local DB migrations handled (schema version increments, no data loss)

---

### Phase 7 — Push Notifications & Deep Linking

1. **Firebase Cloud Messaging** — configure both `google-services.json` and `GoogleService-Info.plist`; handle foreground / background / terminated states
2. **Notification payload routing** — notification tap navigates to correct screen using deep link URL in payload
3. **Deep linking**:
   - Flutter: `go_router` `GoRoute` with URI templates + `flutter_app_links`
   - React Native: `Linking` API + React Navigation `linking` config
4. **Permission request** — request notification permission at contextually appropriate moment (not on first launch)

**Phase 7 checklist**:
- [ ] FCM token registered on backend after login
- [ ] Tapping notification opens correct screen on both platforms
- [ ] Deep links open correct screen from browser / email
- [ ] Notification permission prompt shown at correct UX moment

---

### Phase 8 — Testing

**Goal**: Reliable test suite covering critical paths.

#### Flutter
- **Widget tests** (`test/widget/`): every shared component + one test per screen's loading/error/success states
- **Unit tests** (`test/unit/`): every repository method, every StateNotifier state transition
- **Integration tests** (`integration_test/`): login → main flow (happy path), at least one critical user journey
- Coverage target: ≥ 70% line coverage (`flutter test --coverage`)

#### React Native
- **Component tests** (`__tests__/components/`): every shared component
- **Store tests** (`__tests__/store/`): every Zustand slice action
- **Screen tests** (`__tests__/screens/`): loading/error/success states per screen
- **Detox E2E** (`e2e/`): login → main flow, at least one critical journey on iOS simulator + Android emulator
- Coverage target: ≥ 70% (`jest --coverage`)

**Phase 8 checklist**:
- [ ] `flutter test --coverage` / `jest --coverage` achieves ≥ 70%
- [ ] Integration / E2E tests pass on both iOS and Android
- [ ] All tests deterministic (no flaky async waits without proper guards)

---

### Phase 9 — Performance & Accessibility

**Performance**:
- Flutter: profile with DevTools; verify 60fps (120fps on ProMotion) scrolling in Release mode; use `const` constructors everywhere possible
- React Native: profile with Flipper / Hermes profiler; enable `FlatList` `removeClippedSubviews`, `keyExtractor`, `getItemLayout` on all lists; avoid anonymous function renders in JSX

**Accessibility**:
- Flutter: `Semantics` widget on all interactive elements; test with `flutter_test` `SemanticsController`
- React Native: `accessibilityLabel`, `accessibilityRole`, `accessibilityHint` on all interactive components; test with NVDA/TalkBack

**Phase 9 checklist**:
- [ ] Render thread stays at 60fps during scroll on mid-range device (no jank)
- [ ] All interactive elements have accessibility labels
- [ ] Dynamic font size (system font scale) does not break layouts
- [ ] Images have `alt` / semantic descriptions

---

### Phase 10 — Store Deployment

**Flutter**:
1. `flutter build ipa --release` → upload to TestFlight via Transporter or Fastlane
2. `flutter build appbundle --release` → upload to Play Console internal track
3. Configure Fastlane `Matchfile` (iOS) and `Supplyfile` (Android) for signing

**React Native / Expo**:
1. `eas build --platform ios --profile production` → submit to TestFlight
2. `eas build --platform android --profile production` → submit to Play Console
3. Configure `eas.json` with `submit` profiles for both platforms

**Phase 10 checklist**:
- [ ] iOS archive passes App Store Connect validation (zero errors)
- [ ] Android bundle passes Play Console pre-launch report (no blockers)
- [ ] App icon and splash screen correct on all device sizes
- [ ] Privacy manifest / permissions descriptions match actual usage

---

## Definition of Done (DoD)

> 📋 **Quality review**: Before marking this phase complete, consult [quality-playbook/SKILL.md](../quality-playbook/SKILL.md) §3 — Phase 4d/4e quality gates (mobile), §4 — Cross-Cutting Concerns checklist, and §7 — Code Review Checklist.

### Code Quality
- [ ] Lint zero warnings (flutter_lints / ESLint-airbnb-typescript)
- [ ] Clean architecture layers respected (domain has zero framework/platform imports)
- [ ] All repositories behind interfaces (mockable in tests)

### Functional
- [ ] All screens implemented matching wireframes from Phase 4a
- [ ] All API integrations complete and tested against real backend
- [ ] Auth flow (login, token refresh, logout) working end-to-end on both platforms

### Security
- [ ] Tokens stored only in secure storage (flutter_secure_storage / react-native-keychain)
- [ ] No secrets or API keys committed to version control
- [ ] Certificate pinning configured for production API calls (if required by security policy)
- [ ] Dependency scan passes (OWASP / `npm audit` / `flutter pub audit`) — zero CVSS ≥ 7

### Performance
- [ ] 60fps scroll on mid-range device (Flutter Release / Hermes-enabled RN) — verified in profiler
- [ ] App cold start < 3 seconds on mid-range device

### Testing
- [ ] Line coverage ≥ 70%
- [ ] E2E / integration test covers login → primary user journey on both iOS and Android

### Deployment
- [ ] Builds produced for both iOS and Android without errors
- [ ] Signing configured; TestFlight / Play internal track upload succeeds
- [ ] All config externalized via environment flavors / `eas.json` — no hardcoded URLs

---

## Next Skill
When cross-platform mobile is production-ready, proceed to [`compare-legacy-to-new`](../compare-legacy-to-new/SKILL.md) to validate equivalence and improvements.
