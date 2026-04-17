---
name: android-development
description: 'Android mobile development skill for legacy modernization. Act as a senior expert Android developer. Use when: building Kotlin Jetpack Compose Android mobile app, implementing MVVM Clean Architecture, Kotlin Coroutines Flow, EncryptedSharedPreferences Keystore token storage, Retrofit OkHttp networking, Room local persistence, push notifications FCM, deep linking, unit testing JUnit Mockk Turbine, UI testing Espresso Compose, Play Store deployment, phased Android development plan.'
argument-hint: 'Project name or path to UI/UX design artifacts and system design to implement'
---

# Android Development

## Role
**Senior Master Android Developer** — Build a performant, maintainable, accessible native Android application in Kotlin/Jetpack Compose that faithfully implements the UX design system and consumes backend APIs.

## When to Use
- After `ui-ux-design` skill produces wireframes and mobile design system
- After `target-architecture` confirms API contracts (OpenAPI spec available)
- Starting or continuing phased Android mobile implementation

## Prerequisites (Preflight)
Before starting, verify the following artifacts exist:

| Artifact | Expected Path | Required? |
|---|---|---|
| UI/UX design | `ai-driven-development/docs/ui_design/ui_ux_pages.md` | Always |
| Target architecture (API contracts) | `ai-driven-development/docs/target_architecture/target_architecture.md` | Always |
| Backend OpenAPI spec or running API | `ai-driven-development/development/backend_development/` or OpenAPI spec URL | Recommended |

**If any required artifact is missing**: Stop. Report which artifact is missing, which phase produces it (Phase 4a: `ui-ux-design`, Phase 3: `target-architecture`, Phase 4b: `backend-development`), and offer: (a) Run the prerequisite phase now, (b) Provide the artifact path manually.

## Output Location
Create folder `ai-driven-development/development/mobile_development/android/{project_name}` — all Android code here.

---

## Tech Stack (Fixed)

| Concern | Technology |
|---|---|
| Language | Kotlin |
| Minimum SDK | API 26 (Android 8.0) |
| Target SDK | API 35 (Android 15) |
| UI Framework | Jetpack Compose (Material 3) |
| Architecture | MVVM + Clean Architecture (Domain layer) |
| Async | Kotlin Coroutines + Flow |
| Networking | Retrofit 2 + OkHttp 4 + Gson/Moshi |
| Secure Storage | EncryptedSharedPreferences + Android Keystore |
| Local Persistence | Room |
| Dependency Injection | Hilt (Dagger Hilt) |
| Navigation | Navigation Compose (Jetpack) |
| Image Loading | Coil |
| Testing (Unit) | JUnit 5 + Mockk + Turbine |
| Testing (UI) | Compose UI Testing |
| Code Quality | Detekt + Ktlint |
| Build | Gradle (Kotlin DSL) |

### Confirmed Tech Choices (read from `tech_stack_selections.md`)

> **Do NOT ask the user for these** — all choices were confirmed in Phase 2.5 and saved to `ai-driven-development/docs/tech_stack_selections.md`. Read that file before Phase 1 and apply the confirmed selections throughout.

| Concern | `tech_stack_selections.md` key |
|---|---|
| JSON Serialization | § Android → JSON Serialization |
| Crash Reporting | § Android → Crash Reporting |
| Analytics | § Android → Analytics |
| Push Notifications | § Android → Push Notifications |
| Paging | § Android → Paging Strategy |
| WorkManager | § Android → Background Sync (WorkManager) |

---

## Folder Structure & Architecture Rules

> See [STANDARDS.md](./STANDARDS.md) for the project folder structure, architecture rules, core code patterns (Result sealed class, AuthInterceptor, ViewModel pattern), Detekt configuration, and phase tracker template.

---

## Procedure

### Step 0 — Create Android Phase Tracker
Before writing any code, add the Android phase checklist from [STANDARDS.md](./STANDARDS.md) to the dev tracking file.

---

### Phase 1 — Project Setup & Tooling
**Goal**: Android Studio project with all tooling configured and running on emulator.

1. **New Android project** — Empty Activity, Kotlin, min SDK 26, Kotlin DSL build files
2. **Add Hilt** — `hilt-android` plugin, `@HiltAndroidApp` on Application class
3. **Gradle version catalog** — `libs.versions.toml` for all dependency versions
4. **Detekt** — `detekt.yml` config, `detekt` Gradle plugin, zero-violation policy
5. **Ktlint** — `ktlint` Gradle plugin, format on build
6. **BuildConfig fields** — `API_BASE_URL`, `AUTH_URL` from `local.properties`:
   ```kotlin
   // build.gradle.kts
   buildConfigField("String", "API_BASE_URL", "\"${localProperties["api.base.url"]}\"")
   ```
7. **Folder structure** — create all packages per structure above (no logic yet)
8. **Git setup** — `.gitignore` (exclude `local.properties`, `*.keystore`), `README.md`

### Phase 2 — Review Phase 1
- [ ] App builds and runs on API 26 emulator
- [ ] Detekt and Ktlint run with zero violations
- [ ] Hilt injection verified (inject a test string, log on launch)
- [ ] No secrets or API URLs in committed code
- [ ] Version catalog used consistently

---

### Phase 3 — Design System & Shared Components
**Goal**: Full Material 3 design system implemented before feature code.

1. **Color tokens** (`shared/design/Color.kt`) — map from `ui_ux_pages.md`:
   ```kotlin
   val PrimaryColor = Color(0xFF1976D2)
   val PrimaryContainer = Color(0xFFBBDEFB)
   // ... full light + dark palette
   ```

2. **MaterialTheme** (`shared/design/Theme.kt`) — light + dark `ColorScheme`:
   ```kotlin
   @Composable
   fun AppTheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
       val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
       MaterialTheme(colorScheme = colorScheme, typography = AppTypography, content = content)
   }
   ```

3. **Typography** (`shared/design/Type.kt`) — `MaterialTheme.typography` overrides from design tokens

4. **Shared Composables** (`shared/components/`):
   - `PrimaryButton` — with loading state, `CircularProgressIndicator`, disabled
   - `SecondaryButton`, `OutlinedButton`, `DestructiveButton`
   - `AppTextField` — with validation error text, leading/trailing icons
   - `LoadingScreen` — full-screen centered `CircularProgressIndicator`
   - `ErrorScreen` — with message + retry `Button`
   - `EmptyStateScreen` — with icon + message
   - `ConfirmationDialog`
   - `SnackbarHost` wrapper

5. **Navigation constants** (`shared/navigation/`) — sealed class for routes

### Phase 4 — Review Phase 3
- [ ] All components render on API 26 emulator
- [ ] Dark mode support verified (toggle system dark mode)
- [ ] TalkBack navigation complete for all interactive components
- [ ] Zero Detekt/Ktlint violations
- [ ] No hardcoded colors or text in component code

---

### Phase 5 — Networking Layer & Authentication
**Goal**: Complete, secure networking layer with authentication.

1. **Retrofit + OkHttp setup** (`core/network/ApiClient.kt`):
   ```kotlin
   @Provides @Singleton
   fun provideOkHttpClient(authInterceptor: AuthInterceptor): OkHttpClient =
       OkHttpClient.Builder()
           .addInterceptor(authInterceptor)
           .addInterceptor(HttpLoggingInterceptor().apply {
               level = if (BuildConfig.DEBUG) BODY else NONE
           })
           .connectTimeout(30, SECONDS)
           .readTimeout(30, SECONDS)
           .build()
   ```

2. **AuthInterceptor** — attaches `Authorization: Bearer <token>` on every request:
   ```kotlin
   class AuthInterceptor @Inject constructor(
       private val tokenManager: TokenManager
   ) : Interceptor {
       override fun intercept(chain: Chain): Response {
           val token = tokenManager.accessToken
           val request = chain.request().newBuilder()
               .apply { if (token != null) header("Authorization", "Bearer $token") }
               .build()
           return chain.proceed(request)
       }
   }
   ```

3. **TokenAuthenticator** — handles 401 token refresh using OkHttp `Authenticator` (avoids `runBlocking` deadlock):
   ```kotlin
   class TokenAuthenticator @Inject constructor(
       private val tokenManager: TokenManager
   ) : Authenticator {
       private val mutex = Mutex()

       override fun authenticate(route: Route?, response: Response): Request? {
           // Avoid infinite retry loops
           if (response.request.header("Authorization") == null) return null

           val newToken = runCatching {
               runBlocking { // safe here: OkHttp calls Authenticator on its own thread, not a coroutine dispatcher
                   mutex.withLock {
                       // Re-check after acquiring lock in case another thread already refreshed
                       val refreshed = tokenManager.accessToken
                       if (refreshed != null && refreshed != response.request.header("Authorization")?.removePrefix("Bearer ")) {
                           refreshed
                       } else {
                           tokenManager.refresh()
                       }
                   }
               }
           }.getOrNull() ?: return null  // refresh failed — propagate 401

           return response.request.newBuilder()
               .header("Authorization", "Bearer $newToken")
               .build()
       }
   }
   ```
   Register in `NetworkModule`:
   ```kotlin
   @Provides @Singleton
   fun provideOkHttpClient(
       authInterceptor: AuthInterceptor,
       tokenAuthenticator: TokenAuthenticator
   ): OkHttpClient =
       OkHttpClient.Builder()
           .addInterceptor(authInterceptor)
           .authenticator(tokenAuthenticator)
           .addInterceptor(HttpLoggingInterceptor().apply {
               level = if (BuildConfig.DEBUG) BODY else NONE
           })
           .connectTimeout(30, SECONDS)
           .readTimeout(30, SECONDS)
           .build()
   ```

3. **TokenManager** (`core/security/TokenManager.kt`) — EncryptedSharedPreferences:
   ```kotlin
   class TokenManager @Inject constructor(@ApplicationContext context: Context) {
       private val prefs = EncryptedSharedPreferences.create(
           context, "secure_prefs",
           MasterKey.Builder(context).setKeyScheme(AES256_GCM).build(),
           PrefKeyEncryptionScheme.AES256_SIV,
           PrefValueEncryptionScheme.AES256_GCM
       )
       var accessToken: String? get() = prefs.getString("access_token", null)
           set(v) { prefs.edit().putString("access_token", v).apply() }
       fun clear() { prefs.edit().clear().apply() }
   }
   ```

4. **Result sealed class** (`core/network/Result.kt`):
   ```kotlin
   sealed class Result<out T> {
       data class Success<T>(val data: T) : Result<T>()
       data class Error(val exception: AppException) : Result<Nothing>()
       data object Loading : Result<Nothing>()
   }
   ```

5. **AuthRepository + LoginUseCase**

6. **AuthViewModel** with `StateFlow<AuthUiState>`:
   ```kotlin
   @HiltViewModel
   class AuthViewModel @Inject constructor(
       private val loginUseCase: LoginUseCase
   ) : ViewModel() {
       private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
       val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

       fun login(username: String, password: String) {
           viewModelScope.launch {
               _uiState.value = AuthUiState.Loading
               _uiState.value = when (val result = loginUseCase(username, password)) {
                   is Result.Success -> AuthUiState.Success
                   is Result.Error -> AuthUiState.Error(result.exception.message)
               }
           }
       }
   }
   ```

7. **Login Screen** — implement per wireframe from `ui_ux_pages.html`

8. **Navigation guard** `NavGraph`:
   - Unauthenticated routes: `auth/login`
   - Authenticated routes: everything else, redirect to login if token missing

### Phase 6 — Review Phase 5
- [ ] Login works end-to-end against real or mocked backend
- [ ] Tokens stored in EncryptedSharedPreferences (verify with Device File Explorer)
- [ ] Token refresh triggers on 401 without user interruption
- [ ] Logout clears all tokens
- [ ] API errors display readable messages in UI
- [ ] No tokens logged in Logcat (even in DEBUG)

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

Each feature sub-task implements the full Clean Architecture slice for its domain:
- `data/`: Retrofit API interface + DTOs + `RepositoryImpl`
- `domain/`: models (pure Kotlin) + Repository interface + UseCases
- `presentation/`: `ViewModel` (StateFlow + UiState sealed class) + Screen Composable
- `di/`: Hilt module binding all layers

**Prerequisites that must complete before any feature sub-task starts:**
- Phase 3 (Design System + Shared Composables + Theme) ✅
- Phase 5 (Retrofit/OkHttp + AuthInterceptor + TokenManager + Hilt base modules) ✅

After all feature sub-tasks complete, continue with Phase 9 (persistence), Phase 10 (push/deep link), Phase 11 (testing), Phase 12 (release).

Record the feature-to-sub-task assignment in the phase tracker before starting.

---

### Phase 7 — Core Feature Implementation
**Goal**: All domain features implemented per wireframes.

For **each feature**, follow this Clean Architecture pattern:

**Data layer**:
```kotlin
interface ItemApi {
    @GET("items")
    suspend fun getItems(@Query("page") page: Int): ItemsResponse
}

class ItemRepositoryImpl @Inject constructor(
    private val api: ItemApi
) : ItemRepository {
    override suspend fun getItems(page: Int): Result<List<Item>> = runCatching {
        api.getItems(page).toDomain()
    }.fold(
        onSuccess = { Result.Success(it) },
        onFailure = { Result.Error(it.toAppException()) }
    )
}
```

**ViewModel with UiState**:
```kotlin
data class ItemsUiState(
    val items: List<Item> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class ItemsViewModel @Inject constructor(
    private val getItemsUseCase: GetItemsUseCase
) : ViewModel() {
    private val _uiState = MutableStateFlow(ItemsUiState())
    val uiState: StateFlow<ItemsUiState> = _uiState.asStateFlow()

    init { loadItems() }

    fun loadItems() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            when (val result = getItemsUseCase()) {
                is Result.Success -> _uiState.update { it.copy(items = result.data, isLoading = false) }
                is Result.Error -> _uiState.update { it.copy(error = result.exception.message, isLoading = false) }
            }
        }
    }
}
```

**Screen Composable**:
```kotlin
@Composable
fun ItemsScreen(vm: ItemsViewModel = hiltViewModel()) {
    val uiState by vm.uiState.collectAsStateWithLifecycle()

    when {
        uiState.isLoading -> LoadingScreen()
        uiState.error != null -> ErrorScreen(message = uiState.error!!, onRetry = vm::loadItems)
        uiState.items.isEmpty() -> EmptyStateScreen()
        else -> ItemsList(items = uiState.items)
    }
}
```

**Pull-to-refresh**: Use `PullRefreshIndicator` (Material3 `pullRefresh` modifier) or `SwipeRefresh`.

### Phase 8 — Review Phase 7
- [ ] All screens implemented matching wireframes
- [ ] All features load real data from backend or OpenAPI mock
- [ ] Pull-to-refresh implemented on all list screens
- [ ] Loading, error, and empty states visible
- [ ] TalkBack navigation through all main flows
- [ ] No direct API calls from Composables — all through ViewModel

---

### Phase 9 — Local Persistence (if required)
**Goal**: Offline-capable data layer with Room.

1. **Room entities and DAOs**:
   ```kotlin
   @Entity(tableName = "items")
   data class ItemEntity(@PrimaryKey val id: String, val name: String, val updatedAt: Long)

   @Dao
   interface ItemDao {
       @Query("SELECT * FROM items ORDER BY updatedAt DESC")
       fun observeAll(): Flow<List<ItemEntity>>

       @Upsert
       suspend fun upsertAll(items: List<ItemEntity>)

       @Query("DELETE FROM items")
       suspend fun clearAll()
   }
   ```

2. **Repository with cache-then-network**:
   ```kotlin
   override fun observeItems(): Flow<Result<List<Item>>> = flow {
       emit(Result.Loading)
       dao.observeAll().collect { cached ->
           emit(Result.Success(cached.toDomain()))
       }
   }.onStart {
       runCatching { api.getItems() }
           .onSuccess { dao.upsertAll(it.toEntities()) }
           .onFailure { /* emit error only if cache empty */ }
   }
   ```

3. **Database migration strategy** — `Room.databaseBuilder(...).addMigrations(...)`, never `fallbackToDestructiveMigration` in production

---

### Phase 10 — Performance & Accessibility
**Goal**: Smooth 60fps on mid-range hardware, TalkBack-complete.

1. **Performance**:
   - Profile with Android Studio Profiler (CPU, Memory)
   - Use `key(item.id)` in `LazyColumn` for stable item identity
   - `derivedStateOf` to avoid recomposition on scroll position
   - Coil image caching: `ImageRequest` with `memoryCachePolicy` and `diskCachePolicy`
   - Background work with `WorkManager` (sync, cleanup) — never long-running coroutines in ViewModel

2. **Accessibility**:
   - `semantics { contentDescription = "..." }` on all non-text elements
   - `semantics { role = Role.Button }` on custom clickable Composables
   - Minimum touch target: 48×48dp (`Modifier.minimumInteractiveComponentSize()`)
   - Test with TalkBack enabled — verify all interactive elements are reachable and labeled
   - Support system font size scaling (avoid fixed `sp` sizes — use Material Typography)

3. **Deep Linking** (if required):
   - `<intent-filter>` with `<data android:scheme="https">` in manifest
   - NavDeepLink in NavGraph for each deep-linkable screen

---

### Phase 11 — Testing
**Goal**: Verified, trustworthy test suite.

**Unit Tests** (JUnit 5 + Mockk + Turbine):
```kotlin
@ExtendWith(CoroutineTestExtension::class)
class ItemsViewModelTest {
    private val useCase: GetItemsUseCase = mockk()
    private lateinit var sut: ItemsViewModel

    @BeforeEach
    fun setUp() { sut = ItemsViewModel(useCase) }

    @Test
    fun `loadItems success updates state`() = runTest {
        coEvery { useCase() } returns Result.Success(listOf(Item.fixture()))
        sut.uiState.test {
            val loaded = awaitItem() // loading state
            val success = awaitItem()
            assertThat(success.items).hasSize(1)
            assertThat(success.isLoading).isFalse()
        }
    }
}
```

Coverage targets:
- All ViewModels: ≥ 80%
- All UseCases: 100%
- All Repositories: ≥ 70%

**UI Tests** (Compose Testing):
```kotlin
@HiltAndroidTest
class LoginScreenTest {
    @get:Rule(order = 0) val hiltRule = HiltAndroidRule(this)
    @get:Rule(order = 1) val composeRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun loginWithCorrectCredentials_navigatesToHome() {
        composeRule.onNodeWithTag("username_field").performTextInput("user")
        composeRule.onNodeWithTag("password_field").performTextInput("pass")
        composeRule.onNodeWithTag("login_button").performClick()
        composeRule.onNodeWithText("Home").assertIsDisplayed()
    }
}
```

**Accessibility audit**: Enable `Modifier.semantics(mergeDescendants = true)` checks, run `AccessibilityChecks.enable()` in test setup.

---

### Phase 12 — Final Review & Release Prep
- [ ] Release build compiles with R8/ProGuard enabled, no runtime crashes
- [ ] Detekt and Ktlint zero violations
- [ ] No `Log.d/e/i` in production code (replaced with Timber, disabled in release)
- [ ] No hardcoded secrets or URLs in source
- [ ] All strings in `strings.xml`
- [ ] App icon (adaptive icon: foreground + background layers) configured
- [ ] Signing config with release keystore (keystore outside source control)
- [ ] Proguard rules for Retrofit, Hilt, Room, Moshi/Gson added
- [ ] Internal test track uploaded to Play Store and tested on 3+ physical devices
- [ ] Privacy Policy URL added in Play Console

---

### Phase 12.5 — Platform Extensions *(only if required by product scope)*

Implement Android platform extension features for the project. Skip any item not required.

#### AppWidget (Glance API)
- Use **Glance** (`androidx.glance:glance-appwidget`) — Jetpack Compose-based widget API (preferred over `RemoteViews` for new development)
- Create `GlanceAppWidget` subclass with `@Composable` `Content()` function
- Create `GlanceAppWidgetReceiver` subclass and register in `AndroidManifest.xml` with `<receiver>` + `APPWIDGET_UPDATE` intent filter
- Define `appwidget-provider` XML in `res/xml/` with `minWidth`, `minHeight`, `updatePeriodMillis`, `previewLayout`
- Widget sizes: use `SizeMode.Exact` (re-renders per size) or `SizeMode.Responsive` (predefined sizes)
- Data: share via `GlanceStateDefinition` with `DataStore` (preferred), or App-specific `DataStore` file
- Actions: use `actionRunCallback<ActionCallback>()` or `actionStartActivity<MyActivity>()`
- Update widget programmatically: `GlanceAppWidgetManager.requestPinAppWidget()` / `GlanceAppWidget.update(context, glanceId)`

#### WorkManager (Background Tasks)
- Use `WorkManager` (`androidx.work:work-runtime-ktx`) for deferrable, guaranteed background work
- `OneTimeWorkRequest`: for single-run tasks with input/output data
- `PeriodicWorkRequest`: minimum interval 15 minutes; use `Constraints` (network, charging, battery not low)
- Implement `CoroutineWorker` (preferred over `Worker`) with `doWork(): Result` returning `Result.success()`, `Result.retry()`, or `Result.failure()`
- Chain work with `WorkManager.beginWith().then().enqueue()`
- Tag work for cancellation: `cancelAllWorkByTag(tag)` / `cancelUniqueWork(name)`
- Observe: `WorkManager.getWorkInfoByIdLiveData(id)` or Flow equivalent
- Expedited work (immediate foreground-service-equivalent): implement `getForegroundInfo()` in `CoroutineWorker`

#### App Actions & Shortcuts (App Intents)
- **Built-in intents**: implement `capability` declarations in `shortcuts.xml` (via `res/xml/shortcuts.xml`) for Google Assistant integration
- **Shortcuts**: `ShortcutInfoCompat` with `addDynamicShortcuts()` via `ShortcutManagerCompat`
  - Static shortcuts: declared in `shortcuts.xml` (`<shortcut>` elements)
  - Dynamic shortcuts: `ShortcutInfoCompat.Builder().setId().setShortLabel().setIntent().build()`
  - Max 15 shortcuts (5 visible in launcher long-press)
- **Pinned shortcuts**: `ShortcutManagerCompat.requestPinShortcut()`
- **Android 12+ capability reporting**: use `UiModeManager.setApplicationNightMode()` for per-app dark mode shortcuts

#### Notification Styles (Rich Notifications)
- `NotificationCompat.BigTextStyle`: expanded multi-line text
- `NotificationCompat.BigPictureStyle`: image with summary text
- `NotificationCompat.InboxStyle`: list of up to 5 text rows
- `NotificationCompat.MessagingStyle`: conversation thread with avatars (use for chat apps; required for Bubbles API)
- **Bubbles** (Android 11+): `BubbleMetadata` attached to `MessagingStyle` notification; requires `CATEGORY_MESSAGE` + conversation shortcut
- **Notification channels**: group related notifications; set `IMPORTANCE_DEFAULT` / `IMPORTANCE_HIGH` appropriately; do not change importance after channel creation (user controls it)
- **Direct Reply**: `RemoteInput.Builder()` + `NotificationCompat.Action` with `addRemoteInput()`
- Android 13+: `POST_NOTIFICATIONS` runtime permission — request with `ActivityResultContracts.RequestPermission()`

---

## Definition of Done (DoD)

### Code Quality
- [ ] Detekt and Ktlint zero violations
- [ ] Clean Architecture layers respected (domain has zero Android imports)
- [ ] All repositories and services behind interfaces (mockable)

### Functional
- [ ] All screens implemented matching wireframes
- [ ] All API integrations complete and tested against real backend
- [ ] Auth flow (login, token refresh, logout) working end-to-end

### UX
- [ ] UI matches design system (colors, typography, spacing) via MaterialTheme
- [ ] Loading, error, and empty states on every async screen
- [ ] Dark mode fully supported
- [ ] Font scaling supported
- [ ] TalkBack navigation complete and labeled

### Performance
- [ ] Smooth scrolling (no jank in Profiler)
- [ ] No memory leaks (verified with Memory Profiler)
- [ ] App startup < 2s on API 26 mid-range emulator

### Testing
- [ ] ViewModel unit test coverage ≥ 80%
- [ ] UseCase unit test coverage 100%
- [ ] UI tests cover login and 2+ critical journeys
- [ ] Accessibility checks enabled in UI tests

### Release
- [ ] Release AAB archives cleanly with R8
- [ ] ProGuard rules verified (no missing keeps)
- [ ] Internal test track validated

---

## Next Skill
When Android app is production-ready, proceed to [`compare-legacy-to-new`](../compare-legacy-to-new/SKILL.md) to validate functional equivalence.