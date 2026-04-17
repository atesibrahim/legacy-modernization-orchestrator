---
name: ios-development
description: 'iOS mobile development skill for legacy modernization. Act as a senior expert iOS developer. Use when: building Swift SwiftUI iOS mobile app, implementing MVVM architecture, Combine async-await, Keychain token storage, URLSession networking, CoreData local persistence, push notifications, deep linking, unit testing XCTest, UI testing, App Store deployment, phased iOS development plan.'
argument-hint: 'Project name or path to UI/UX design artifacts and system design to implement'
---

# iOS Development

## Role
**Senior Master iOS Developer** — Build a performant, maintainable, accessible native iOS application in Swift/SwiftUI that faithfully implements the UX design system and consumes backend APIs.

## When to Use
- After `ui-ux-design` skill produces wireframes and mobile design system
- After `target-architecture` confirms API contracts (OpenAPI spec available)
- Starting or continuing phased iOS mobile implementation

## Prerequisites (Preflight)
Before starting, verify the following artifacts exist:

| Artifact | Expected Path | Required? |
|---|---|---|
| UI/UX design | `ai-driven-development/docs/ui_design/ui_ux_pages.md` | Always |
| Target architecture (API contracts) | `ai-driven-development/docs/target_architecture/target_architecture.md` | Always |
| Backend OpenAPI spec or running API | `ai-driven-development/development/backend_development/` or OpenAPI spec URL | Recommended |

**If any required artifact is missing**: Stop. Report which artifact is missing, which phase produces it (Phase 4a: `ui-ux-design`, Phase 3: `target-architecture`, Phase 4b: `backend-development`), and offer: (a) Run the prerequisite phase now, (b) Provide the artifact path manually.

## Output Location
Create folder `ai-driven-development/development/mobile_development/ios/{project_name}` — all iOS code here.
- `ai-driven-development/development/ios_development_todo.md` — phase tracker with all iOS phases checked off as they complete.

---

## Tech Stack (Fixed)

| Concern | Technology |
|---|---|
| Language | Swift 5.9+ |
| UI Framework | SwiftUI (iOS 16+) |
| Minimum iOS | iOS 16.0 |
| Architecture | MVVM + Clean Architecture |
| Async | Swift Concurrency (async/await + actors) |
| Reactive | Combine (for data streams / bindings) |
| Networking | URLSession + async/await |
| Serialization | Codable (JSONDecoder/JSONEncoder) |
| Secure Storage | Keychain (via KeychainAccess or Security framework) |
| Local Persistence | CoreData / SwiftData (iOS 17+) |
| Navigation | NavigationStack (iOS 16+) |
| Dependency Injection | Manual DI via initializer injection / custom container |
| Testing (Unit) | XCTest |
| Testing (UI) | XCUITest |
| Code Quality | SwiftLint |

### Confirmed Tech Choices (read from `tech_stack_selections.md`)

> **Do NOT ask the user for these** — all choices were confirmed in Phase 2.5 and saved to `ai-driven-development/docs/tech_stack_selections.md`. Read that file before Phase 1 and apply the confirmed selections throughout.

| Concern | `tech_stack_selections.md` key |
|---|---|
| Local DB | § iOS → Local Persistence |
| Image Loading | § iOS → Image Loading |
| Crash Reporting | § iOS → Crash Reporting |
| Analytics | § iOS → Analytics |
| Push Notifications | § iOS → Push Notifications |
| Package Manager | § iOS → Package Manager |

---

## Folder Structure & Architecture Rules

> See [STANDARDS.md](./STANDARDS.md) for the project folder structure, SwiftLint configuration, core code patterns, architecture rules, Xcode setup checklist, and phase tracker template.

---

## Procedure

### Step 0 — Create iOS Phase Tracker
Before writing any code, add the iOS phase checklist from [STANDARDS.md](./STANDARDS.md) to the dev tracking file.

---

### Phase 1 — Project Setup & Tooling
**Goal**: Xcode project with all tooling configured and running on simulator.

1. **Create Xcode project** — SwiftUI lifecycle, iOS 16+ deployment target
2. **Swift Package Manager** — add all required dependencies in `Package.swift`
3. **SwiftLint** — add as SPM plugin or build phase, configure `.swiftlint.yml`:
   ```yaml
   disabled_rules:
     - trailing_whitespace
   opt_in_rules:
     - force_unwrapping
     - implicitly_unwrapped_optional
   ```
4. **xcconfig files** — `Debug.xcconfig`, `Release.xcconfig` for environment variables (API URLs, keys)
5. **Folder structure** — create all folders per structure above (no code yet)
6. **Git setup** — `.gitignore` (exclude `*.xcuserstate`, `Config.plist` with secrets), `README.md`

### Phase 2 — Review Phase 1
- [ ] Project builds and runs on iOS 16 simulator
- [ ] SwiftLint runs with zero errors
- [ ] All xcconfig vars referenced correctly (not hardcoded)
- [ ] Folder structure matches specification
- [ ] Secrets not committed to git

---

### Phase 3 — Design System & Shared Components
**Goal**: Full design system implemented before feature code.

1. **Color tokens** (`DesignSystem/Colors.swift`) — map from `ui_ux_pages.md`:
   ```swift
   extension Color {
       static let primaryAction = Color("PrimaryAction") // Asset catalog
       static let backgroundPrimary = Color("BackgroundPrimary")
   }
   ```

2. **Typography** (`DesignSystem/Typography.swift`):
   ```swift
   extension Font {
       static let heading1 = Font.system(size: 28, weight: .bold)
       static let bodyRegular = Font.system(size: 16, weight: .regular)
   }
   ```

3. **Spacing** (`DesignSystem/Spacing.swift`):
   ```swift
   enum Spacing {
       static let xs: CGFloat = 4
       static let sm: CGFloat = 8
       static let md: CGFloat = 16
       static let lg: CGFloat = 24
       static let xl: CGFloat = 32
   }
   ```

4. **Shared UI Components** (`Shared/Components/`):
   - `PrimaryButton` — with loading state, disabled state
   - `SecondaryButton`, `DestructiveButton`
   - `InputField` — with validation error display
   - `LoadingView` — full-screen and inline variants
   - `ErrorView` — with retry action
   - `EmptyStateView`
   - `ConfirmationDialog`
   - `ToastView` / overlay notification

5. **Custom ViewModifiers** (`Shared/Modifiers/`):
   - `CardModifier` — shadow, border, rounded corners
   - `LoadingModifier` — overlay spinner on any view

### Phase 4 — Review Phase 3
- [ ] All components render on both iPhone and iPad simulators
- [ ] Dark mode support verified for all color tokens
- [ ] VoiceOver labels set on all interactive components
- [ ] SwiftLint zero warnings
- [ ] No hardcoded colors/fonts in component code

---

### Phase 5 — Networking Layer & Authentication
**Goal**: Complete, secure networking layer with authentication.

1. **APIClient** (`Core/Network/APIClient.swift`):
   ```swift
   actor APIClient {
       static let shared = APIClient()
       private let session = URLSession.shared

       func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T {
           let urlRequest = try endpoint.asURLRequest()
           let (data, response) = try await session.data(for: urlRequest)
           guard let httpResponse = response as? HTTPURLResponse else {
               throw APIError.invalidResponse
           }
           try handleStatusCode(httpResponse.statusCode)
           return try JSONDecoder.iso8601.decode(T.self, from: data)
       }
   }
   ```

2. **Endpoint protocol** — type-safe endpoint definitions:
   ```swift
   protocol Endpoint {
       var path: String { get }
       var method: HTTPMethod { get }
       var headers: [String: String] { get }
       var body: Encodable? { get }
       var queryItems: [URLQueryItem]? { get }
   }
   ```

3. **Auth token management** (`Core/Security/KeychainManager.swift`):
   - Store/retrieve access token and refresh token in Keychain
   - Never log token values
   - Auto-clear on logout

4. **Token refresh logic**: On 401, attempt token refresh before failing. On refresh failure, redirect to login.

5. **AuthService** (`Features/Auth/Services/AuthService.swift`):
   ```swift
   protocol AuthServiceProtocol {
       func login(username: String, password: String) async throws -> AuthResponse
       func refreshToken() async throws -> TokenResponse
       func logout() async
   }
   ```

6. **AuthViewModel** (`Features/Auth/ViewModels/AuthViewModel.swift`):
   - Use `@Observable` (iOS 17+) or `ObservableObject`
   - Handle loading, error, and success states
   - Coordinate token storage and navigation post-login

7. **Login View** — implement per wireframe from `ui_ux_pages.html`

8. **App-level auth state** — `@EnvironmentObject` or actor-isolated auth state observable

### Phase 6 — Review Phase 5
- [ ] Login works end-to-end against real or mocked backend
- [ ] Tokens stored in Keychain (verified with Keychain viewer)
- [ ] Token refresh triggers on 401 without user interruption
- [ ] Logout clears all tokens from Keychain
- [ ] API errors surface user-readable messages
- [ ] No token values logged to console

---

### Phase 6.5 — Feature Decomposition Check

> **Run after Phase 6 (Networking/Auth) completes.** For apps with many screens, implementing one feature domain per sub-task avoids overloading a single agent context.

**Measure:**
- List all feature modules from `ui_ux_pages.md`
- Count distinct domain features excluding Auth

**Choose a strategy:**

| Scale | Signal | Strategy |
|---|---|---|
| **Small** | ≤ 4 features | Implement all features sequentially in Phase 7 |
| **Medium** | 5–10 features | Group into 2–3 batches; each batch = one sub-task |
| **Large** | 10+ features | One sub-task per feature domain; run in parallel |

**Feature sub-task breakdown (medium/large):**

Each feature sub-task implements for its domain:
- Models: `Codable` structs matching OpenAPI schemas
- Service protocol + implementation (`async throws`)
- ViewModel (`@Observable` / `ObservableObject`) with loading/error/empty states
- SwiftUI Views matching wireframes from `ui_ux_pages.html`

**Prerequisites that must complete before any feature sub-task starts:**
- Phase 3 (Design System + Shared Components) ✅
- Phase 5 (APIClient + Auth flow + Keychain + NavigationStack root) ✅

After all feature sub-tasks complete, continue with Phase 9 (persistence), Phase 10 (push/deep link), Phase 11 (testing), Phase 12 (release).

Record the feature-to-sub-task assignment in the phase tracker before starting.

---

### Phase 7 — Core Feature Implementation
**Goal**: All domain features implemented per wireframes.

For **each feature**, follow this pattern:

1. **Models** — `Codable` structs matching OpenAPI response schemas
2. **Service protocol + implementation** — async throws methods, injected into ViewModel
3. **ViewModel** — `@Observable` (iOS 17+) or `ObservableObject`:
   ```swift
   @Observable
   final class ItemsViewModel {
       var items: [Item] = []
       var isLoading = false
       var error: Error?

       private let service: ItemsServiceProtocol

       init(service: ItemsServiceProtocol = ItemsService()) {
           self.service = service
       }

       func loadItems() async {
           isLoading = true
           defer { isLoading = false }
           do {
               items = try await service.fetchAll()
           } catch {
               self.error = error
           }
       }
   }
   ```
4. **Views** — `task {}` modifier for async loads, `.refreshable` for pull-to-refresh
5. **Navigation** — use `NavigationStack` + `NavigationPath` for programmatic navigation

**List screen pattern**:
```swift
struct ItemsView: View {
    @State private var vm = ItemsViewModel()

    var body: some View {
        Group {
            if vm.isLoading { LoadingView() }
            else if let error = vm.error { ErrorView(error: error, retry: { Task { await vm.loadItems() } }) }
            else if vm.items.isEmpty { EmptyStateView() }
            else { List(vm.items) { item in ItemRow(item: item) } }
        }
        .task { await vm.loadItems() }
        .refreshable { await vm.loadItems() }
        .navigationTitle("Items")
    }
}
```

### Phase 8 — Review Phase 7
- [ ] All screens implemented matching wireframes
- [ ] All features load real data from backend (or OpenAPI mock)
- [ ] Pull-to-refresh works on all list screens
- [ ] Loading and error states visible on all screens
- [ ] VoiceOver navigation works through all main flows
- [ ] No force-unwraps (`!`) in feature code

---

### Phase 9 — Local Persistence (if required)
**Goal**: Offline-capable data layer.

1. **CoreData / SwiftData stack** — background context for writes, view context for reads
2. **Repository pattern** — abstract persistence behind protocol:
   ```swift
   protocol ItemRepositoryProtocol {
       func fetchAll() async throws -> [Item]
       func save(_ item: Item) async throws
       func delete(id: UUID) async throws
   }
   ```
3. **Sync strategy** — fetch from API → update local store → publish updates to UI
4. **Conflict resolution** — server-wins strategy (document if using other strategy)
5. **Cache invalidation** — timestamp-based expiry for cached data

---

### Phase 10 — Performance & Accessibility
**Goal**: Smooth 60fps, VoiceOver-complete, Dynamic Type ready.

1. **Performance**:
   - Profile with Instruments (Time Profiler, Memory Graph)
   - Lazy loading for heavy list cells
   - Image caching (SDWebImage/Kingfisher) — never fetch same image twice
   - Background tasks for heavy operations (avoid main thread)

2. **Accessibility**:
   - `.accessibilityLabel()` on all non-text interactive elements
   - `.accessibilityHint()` for non-obvious actions
   - `.accessibilityValue()` for progress/status indicators
   - Dynamic Type: all text uses `.font(.body)` style (scalable), not fixed sizes
   - Minimum tap target: 44×44pt

3. **Deep Linking** (if required):
   - Universal Links (`apple-app-site-association`)
   - URL scheme handler in `AppDelegate` / `.onOpenURL`

---

### Phase 11 — Testing
**Goal**: Verified, trustworthy test suite.

**Unit Tests** (XCTest):
```swift
final class ItemsViewModelTests: XCTestCase {
    var sut: ItemsViewModel!
    var mockService: MockItemsService!

    override func setUp() {
        mockService = MockItemsService()
        sut = ItemsViewModel(service: mockService)
    }

    func testLoadItems_success_populatesItems() async {
        mockService.stubbedItems = [Item.mock()]
        await sut.loadItems()
        XCTAssertEqual(sut.items.count, 1)
        XCTAssertFalse(sut.isLoading)
    }

    func testLoadItems_failure_setsError() async {
        mockService.shouldThrow = true
        await sut.loadItems()
        XCTAssertNotNil(sut.error)
    }
}
```

Coverage targets:
- All ViewModels: ≥ 80%
- All Services: ≥ 70%
- All Core utilities: 100%

**UI Tests** (XCUITest):
- Login → access main screen → logout
- Critical business workflows (create, update, delete core entities)
- Network error handling (mock with URLProtocol stub)

**Accessibility audit**: Run Accessibility Inspector on all main screens — zero critical issues.

---

### Phase 12 — Final Review & Release Prep
- [ ] App builds and archives successfully (Release scheme)
- [ ] No SwiftLint warnings
- [ ] No force-unwraps, no `try!`, no `fatalError` in feature code
- [ ] No hardcoded URLs or secrets
- [ ] All strings in `Localizable.strings` (if i18n enabled)
- [ ] App icon and launch screen configured
- [ ] Privacy manifest (`PrivacyInfo.xcprivacy`) complete with all API usage reasons
- [ ] App Store metadata: screenshots, description, keywords prepared
- [ ] TestFlight build uploaded and tested by at least 2 people

---

### Phase 12.5 — Platform Extensions *(only if required by product scope)*

Implement iOS platform extension features for the project. Skip any item not required.

#### WidgetKit (Home Screen & Lock Screen Widgets)
- **Decision**: Use WidgetKit (iOS 14+) for all widget surfaces (home screen, lock screen, standby mode)
- Create a Widget Extension target: `File > New > Target > Widget Extension`
- Implement `TimelineProvider` for data updates: `getSnapshot()` (preview), `getTimeline()` (live updates), `relevances()` (Smart Stack ranking)
- Use `@AppStorage` or App Group `UserDefaults` (suite: `group.{bundle-id}`) to share data between app and widget
- Widget sizes: `.systemSmall`, `.systemMedium`, `.systemLarge`, `.accessoryCircular`, `.accessoryRectangular` (lock screen iOS 16+)
- For interactive widgets (iOS 17+): use `AppIntent` + `Button` / `Toggle` with `widgetURL` or `Link`
- **Live Activities** (iOS 16.1+): implement `ActivityAttributes` struct + `ActivityContent`; start via `Activity.request()`; update via `Activity.update()`; end via `Activity.end()`; add `NSSupportsLiveActivities = YES` to Info.plist
- Test widgets with Xcode Widget Simulator and Timeline preview

#### BackgroundTasks Framework (iOS 13+)
- Register task identifiers in Info.plist `BGTaskSchedulerPermittedIdentifiers` array
- Use `BGAppRefreshTask` for lightweight data refresh (≤30s, opportunistic scheduling)
- Use `BGProcessingTask` for long-running work (data sync, ML model updates) — requires `requiresNetworkConnectivity` / `requiresExternalPower` flags
- Schedule in `applicationDidEnterBackground` via `BGTaskScheduler.shared.submit()`
- Implement expiry handler: call `task.setTaskCompleted(success:)` before expiry to avoid kill
- Test via `e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"com.example.refresh"]` in LLDB

#### App Shortcuts & Siri Integration (App Intents — iOS 16+)
- Replace SiriKit Intents with **App Intents framework** (preferred for iOS 16+)
- Define `AppIntent` structs with `@Parameter` properties and `perform()` async method
- Register shortcuts via `AppShortcutsProvider` returning `AppShortcut` array
- Add `AppIntents` to the App Intents extension target (or app target for simple intents)
- Spotlight donation: implement `IndexedEntity` on domain models for `CSSearchableItem` donations

#### CoreData vs SwiftData Decision
| Criteria | CoreData | SwiftData (iOS 17+) |
|---|---|---|
| iOS deployment target | iOS 13+ | iOS 17+ only |
| Existing schema | Use CoreData (migration path) | SwiftData if greenfield |
| CloudKit sync | `NSPersistentCloudKitContainer` | `modelContainer(for:cloudKitDatabase:)` |
| Preference | Use for projects targeting < iOS 17 | Use for projects targeting iOS 17+ |

**If using CoreData**: `NSPersistentContainer`, `NSFetchedResultsController`, `NSManagedObject` subclasses generated from `.xcdatamodeld`  
**If using SwiftData**: `@Model` macro, `ModelContainer`, `@Query` property wrapper, migrations via `VersionedSchema`

---

## Definition of Done (DoD)

### Code Quality
- [ ] SwiftLint zero warnings
- [ ] No force-unwraps, `try!`, or `fatalError` in production code
- [ ] All services behind protocols (mockable)

### Functional
- [ ] All screens implemented matching wireframes
- [ ] All API integrations complete and tested against real backend
- [ ] Auth flow (login, token refresh, logout) working end-to-end

### UX
- [ ] UI matches design system (colors, typography, spacing)
- [ ] Loading, error, and empty states on every async screen
- [ ] Dark mode fully supported
- [ ] Dynamic Type supported (all text scales)
- [ ] VoiceOver navigation complete

### Performance
- [ ] Smooth 60fps scrolling (verified with Instruments)
- [ ] No memory leaks (verified with Memory Graph)
- [ ] App launch time < 2s on iPhone 11 (oldest supported hardware for iOS 16)

### Testing
- [ ] ViewModel unit test coverage ≥ 80%
- [ ] Service unit test coverage ≥ 70%
- [ ] UI tests cover login and 2+ critical journeys
- [ ] Accessibility Inspector: zero critical issues

### Release
- [ ] Release build archives cleanly
- [ ] Privacy manifest complete
- [ ] TestFlight build validated

---

## Next Skill
When iOS app is production-ready, proceed to [`compare-legacy-to-new`](../compare-legacy-to-new/SKILL.md) to validate functional equivalence.
