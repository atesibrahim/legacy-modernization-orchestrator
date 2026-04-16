# Android Development Standards

These are the **non-negotiable, project-independent** standards for all Kotlin/Jetpack Compose Android implementations.
The SKILL.md procedure references these. Do not deviate — justify any exception with a code comment.

---

## Architecture Rules (Non-Negotiable)

- **Clean Architecture layers**: `data` → `domain` → `presentation`. Domain layer has **zero** Android dependencies.
- **Repository pattern**: `presentation` layer never calls Retrofit directly — always through a Repository interface.
- **Use cases**: One use case = one business operation. Injected into ViewModels, never called from UI.
- **Sealed Result type**: All repository methods return `Result<T>` — never throw from repository layer.
- **StateFlow for UI state**: ViewModels expose `StateFlow<UiState>` — no `LiveData`.
- **Unidirectional data flow**: ViewModel receives UI events, updates state, UI observes and renders state.
- **Hilt everywhere**: No manual DI, no exposed `object` singletons — all dependencies via Hilt modules.
- **No hardcoded strings**: All user-facing text in `strings.xml`.
- **No secrets in source**: API keys/URLs in `local.properties` (gitignored) → `BuildConfig`.
- **Detekt + Ktlint**: Zero violations in CI — configured as pre-merge quality gate.

---

## Project Folder Structure

```
app/
├── src/main/
│   ├── AndroidManifest.xml
│   └── java/com/{company}/{project}/
│       ├── App.kt                              ← @HiltAndroidApp Application class
│       ├── MainActivity.kt                     ← Single activity, hosts NavHost
│       ├── core/
│       │   ├── network/
│       │   │   ├── ApiClient.kt                ← Retrofit + OkHttp builder
│       │   │   ├── AuthInterceptor.kt          ← Token attach + refresh
│       │   │   ├── ApiError.kt                 ← Sealed class for API errors
│       │   │   └── Result.kt                   ← sealed class Result<T>
│       │   ├── security/
│       │   │   └── TokenManager.kt             ← EncryptedSharedPreferences wrapper
│       │   ├── db/
│       │   │   └── AppDatabase.kt              ← Room @Database
│       │   ├── di/
│       │   │   ├── NetworkModule.kt            ← Hilt @Module for Retrofit/OkHttp
│       │   │   ├── DatabaseModule.kt           ← Hilt @Module for Room
│       │   │   └── SecurityModule.kt           ← Hilt @Module for TokenManager
│       │   └── utils/
│       │       └── (extensions, formatters, helpers)
│       ├── features/                           ← One package per domain feature
│       │   ├── auth/
│       │   │   ├── data/
│       │   │   │   ├── remote/                 ← Retrofit API interface + DTOs
│       │   │   │   ├── local/                  ← Room DAO + entities (optional)
│       │   │   │   └── AuthRepositoryImpl.kt
│       │   │   ├── domain/
│       │   │   │   ├── model/                  ← Domain models (pure Kotlin, no Android)
│       │   │   │   ├── repository/             ← AuthRepository interface
│       │   │   │   └── usecase/                ← LoginUseCase, RefreshTokenUseCase
│       │   │   ├── presentation/
│       │   │   │   ├── AuthViewModel.kt        ← @HiltViewModel
│       │   │   │   ├── LoginScreen.kt          ← Composable
│       │   │   │   └── AuthUiState.kt          ← Sealed class
│       │   │   └── di/
│       │   │       └── AuthModule.kt           ← Hilt bindings
│       │   └── [feature-name]/
│       │       └── (same structure)
│       └── shared/
│           ├── components/                     ← Reusable Composables
│           ├── design/
│           │   ├── Theme.kt                    ← MaterialTheme, color scheme
│           │   ├── Color.kt                    ← Color tokens
│           │   ├── Type.kt                     ← Typography tokens
│           │   └── Shape.kt                    ← Shape tokens
│           └── navigation/
│               └── AppNavGraph.kt              ← Centralized navigation graph
├── src/test/                                   ← Unit tests
└── src/androidTest/                            ← Instrumented / UI tests
```

---

## Core Code Patterns

### `Result.kt` — Sealed type for all repository returns
```kotlin
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val exception: Throwable, val message: String? = null) : Result<Nothing>()
    object Loading : Result<Nothing>()
}
```

### `AuthInterceptor.kt` — Token attach + refresh
```kotlin
class AuthInterceptor @Inject constructor(
    private val tokenManager: TokenManager
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = tokenManager.getAccessToken()
        val request = chain.request().newBuilder()
            .addHeader("Authorization", "Bearer $token")
            .build()
        val response = chain.proceed(request)
        if (response.code == 401) { /* trigger refresh */ }
        return response
    }
}
```

### ViewModel with StateFlow
```kotlin
@HiltViewModel
class ExampleViewModel @Inject constructor(
    private val useCase: GetExampleUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow<ExampleUiState>(ExampleUiState.Loading)
    val uiState: StateFlow<ExampleUiState> = _uiState.asStateFlow()

    fun load() {
        viewModelScope.launch {
            useCase().collect { result ->
                _uiState.value = when (result) {
                    is Result.Success -> ExampleUiState.Success(result.data)
                    is Result.Error   -> ExampleUiState.Error(result.message ?: "Unknown error")
                    Result.Loading    -> ExampleUiState.Loading
                }
            }
        }
    }
}
```

---

## Detekt Configuration (`.detekt.yml` key rules)

```yaml
complexity:
  LongMethod:
    threshold: 60
  LongParameterList:
    functionThreshold: 6
  TooManyFunctions:
    thresholdInClasses: 15
style:
  MagicNumber:
    active: true
    ignoreNumbers: [-1, 0, 1, 2]
coroutines:
  GlobalCoroutineUsage:
    active: true
  RedundantSuspendModifier:
    active: true
```

---

## `local.properties` Template (Gitignored)

```properties
# local.properties — DO NOT commit. Add to .gitignore
sdk.dir=/Users/{user}/Library/Android/sdk
API_BASE_URL="https://api.yourserver.com"
API_KEY="your-api-key-here"
```

Access via `BuildConfig.API_BASE_URL` (configured in `build.gradle.kts`).

---

## Phase Tracker Template

```markdown
## Android Development Phases
- [ ] Phase 1: Project Setup & Tooling
- [ ] Phase 2: Review Phase 1
- [ ] Phase 3: Design System & Shared Components
- [ ] Phase 4: Review Phase 3
- [ ] Phase 5: Networking Layer & Auth
- [ ] Phase 6: Review Phase 5
- [ ] Phase 7: Core Feature Implementation
- [ ] Phase 8: Review Phase 7
- [ ] Phase 9: Persistence & Offline Support
- [ ] Phase 10: Push Notifications & Deep Linking
- [ ] Phase 11: Testing
- [ ] Phase 12: Release Preparation & Play Store
```

---

## Play Store Submission Standards

| Item | Requirement |
|---|---|
| Target API level | `targetSdk` must meet current Play Store requirement (currently API 35) |
| `minSdk` | Match business requirement — minimum API 26 recommended |
| ProGuard / R8 | Enabled for release builds — rules must not strip necessary classes |
| App signing | Upload key stored in password manager + backup; Google Play App Signing enabled |
| Release type | Internal → Closed testing → Open testing → Production (phased rollout) |
| Data safety form | Fully completed on Play Console before each release |
