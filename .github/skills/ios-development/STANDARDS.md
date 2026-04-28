# iOS Development Standards

> **Tier 2 — Skill-local standards.** Extends [Core Standards (Tier 1)](../../standards/core.md). Core standards apply universally; this file adds Swift/SwiftUI–specific architecture rules, MVVM conventions, and App Store compliance standards.

These are the **non-negotiable, project-independent** standards for all Swift/SwiftUI iOS implementations.
The SKILL.md procedure references these. Do not deviate — justify any exception with a code comment.

---

## Architecture Rules (Non-Negotiable)

- **MVVM**: Views are dumb — zero business logic in `View`. All logic lives in `ViewModel` or `Service`.
- **Protocol-driven**: Services are defined as protocols — implementations are injected, enabling mocking in tests.
- **No Singleton abuse**: Use DI container or SwiftUI `@Environment` — avoid `static shared`.
- **Actor isolation**: `NetworkService` and `PersistenceController` must be `actor`-isolated.
- **No hardcoded strings**: All user-facing text via `LocalizedStringKey` or `Localizable.strings`.
- **No secrets in code**: API base URLs from `Config.plist` (excluded from git) or `.xcconfig` files.
- **Keychain only**: Never store tokens, session identifiers, or credentials in `UserDefaults`.
- **SwiftLint**: Zero warning policy — all rules configured in `.swiftlint.yml` and enforced in CI.

---

## Project Folder Structure (Feature-Based)

```
{project_name}/
├── App/
│   ├── {ProjectName}App.swift          ← @main entry, DI container setup
│   ├── AppDelegate.swift               ← Push notifications, deep links
│   └── ContentView.swift               ← Root navigation / tab container
├── Core/
│   ├── Network/
│   │   ├── APIClient.swift             ← URLSession wrapper, base request builder
│   │   ├── AuthInterceptor.swift       ← Token attach + refresh logic
│   │   ├── APIError.swift              ← Typed error enum
│   │   └── Endpoints/                  ← Endpoint definitions per domain
│   ├── Security/
│   │   └── KeychainManager.swift       ← Secure token storage/retrieval
│   ├── Storage/
│   │   └── PersistenceController.swift ← CoreData / SwiftData stack
│   ├── Extensions/                     ← Swift type extensions (Date, String, etc.)
│   └── Utils/                          ← Pure helpers, formatters
├── Features/                           ← One folder per domain feature
│   ├── Auth/
│   │   ├── Models/                     ← Codable DTOs
│   │   ├── Services/                   ← AuthService protocol + implementation
│   │   ├── ViewModels/                 ← AuthViewModel (@Observable / ObservableObject)
│   │   └── Views/                      ← SwiftUI Views (LoginView, etc.)
│   └── [FeatureName]/
│       └── (same structure)
├── Shared/
│   ├── Components/                     ← Reusable SwiftUI components
│   ├── DesignSystem/
│   │   ├── Colors.swift                ← Color tokens (from ui_ux_pages.md)
│   │   ├── Typography.swift            ← Font tokens
│   │   └── Spacing.swift               ← Spacing constants
│   └── Modifiers/                      ← Custom ViewModifiers
└── Resources/
    ├── Assets.xcassets                 ← Images, app icon, catalog colors
    ├── Localizable.strings             ← i18n strings (default: en)
    └── Info.plist
```

---

## SwiftLint Configuration Template (`.swiftlint.yml`)

```yaml
included:
  - {project_name}
excluded:
  - Pods
  - .build
opt_in_rules:
  - array_init
  - closure_spacing
  - empty_count
  - empty_string
  - force_unwrapping
  - implicitly_unwrapped_optional
  - prefer_self_in_static_references
  - sorted_imports
disabled_rules:
  - trailing_whitespace
line_length:
  warning: 120
  error: 160
```

---

## Core Code Patterns

### APIClient (actor-isolated)
```swift
actor APIClient {
    private let session: URLSession
    private let baseURL: URL

    func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T {
        let request = try endpoint.urlRequest(baseURL: baseURL)
        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw APIError.noResponse }
        guard (200...299).contains(http.statusCode) else {
            throw APIError.httpError(http.statusCode)
        }
        return try JSONDecoder().decode(T.self, from: data)
    }
}
```

### ViewModel pattern
```swift
@MainActor
@Observable
final class ExampleViewModel {
    var state: ViewState = .idle

    private let service: ExampleServiceProtocol

    init(service: ExampleServiceProtocol) { self.service = service }

    func load() async {
        state = .loading
        do {
            let data = try await service.fetchData()
            state = .loaded(data)
        } catch {
            state = .error(error.localizedDescription)
        }
    }
}

enum ViewState { case idle, loading, loaded([Item]), error(String) }
```

---

## Xcode Project Setup Checklist

- [ ] Minimum deployment target matches design spec (iOS 16+ recommended)
- [ ] `Config.plist` added to `.gitignore`
- [ ] `Localizable.strings` created for `en` locale (required even if no i18n planned)
- [ ] SwiftLint build phase script added: `swiftlint lint --strict`
- [ ] Signing certificates configured (Team / Provisioning Profile)
- [ ] Capabilities added: Push Notifications, Background Fetch (if needed)

---

## Phase Tracker Template

```markdown
## iOS Development Phases
- [ ] Phase 1: Project Setup & Tooling
- [ ] Phase 2: Review Phase 1
- [ ] Phase 3: Design System & Shared Components
- [ ] Phase 4: Review Phase 3
- [ ] Phase 5: Networking Layer & Auth
- [ ] Phase 6: Review Phase 5
- [ ] Phase 6.5: Feature Decomposition Check
- [ ] Phase 7: Core Feature Implementation
- [ ] Phase 8: Review Phase 7
- [ ] Phase 9: Persistence & Offline Support
- [ ] Phase 10: Push Notifications & Deep Linking
- [ ] Phase 11: Testing
- [ ] Phase 12: Release Preparation & App Store
- [ ] Phase 12.5: Platform Extensions (if required)
```

---

## App Store Submission Standards

| Item | Requirement |
|---|---|
| Privacy manifest | `PrivacyInfo.xcprivacy` required since iOS 17 |
| API declarations | Declare all required reason APIs |
| App Privacy labels | All data collection declared on App Store Connect |
| Screenshot sizes | 6.9" (required), 6.5", 5.5" |
| Age rating | Completed in App Store Connect |
| Export compliance | HTTPS: No (unless using non-standard encryption) |
