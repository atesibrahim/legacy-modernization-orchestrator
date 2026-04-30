# LLM Recommendations per Agent / Skill

> **Snapshot date:** 30 April 2026
> **Sources:** [Aider Leaderboard](https://aider.chat/docs/leaderboards/) · [Artificial Analysis Leaderboard](https://artificialanalysis.ai/leaderboards/models)
> **Important:** These recommendations reflect the LLM market on the snapshot date above. Before selecting a model for any phase, agents **MUST** verify current alternatives via web search (see Freshness Policy).

---

## How to Use This Document

Each agent section contains:

1. **Cognitive profile** — what kind of reasoning the task actually requires.
2. **Recommended models** — 2–3 concrete options from different providers, ordered by quality.
3. **Model selection guide** — a capability description to use when none of the listed models are available in your environment.

The **selection guide** is the portability anchor. Named models are examples, not requirements.

When an agent starts a phase, it **MUST** follow the Model Selection Protocol below before picking a model.

---

## Freshness Policy

> LLM rankings shift quickly. A model leading a benchmark today may be outperformed next month. The named models here are a starting point, not a permanent truth.

Every time an agent is about to select a model for a phase, it SHOULD:

1. **Search the web** for current rankings relevant to that phase. Suggested queries:
   - `best LLM for code generation [current month year]`
   - `LLM leaderboard reasoning [current month year]`
   - `aider leaderboard [current month year]`
   - `artificial analysis intelligence leaderboard [current month year]`
   - `[provider name] new model release [current month year]`

2. **Compare findings** against the cognitive profile for the current phase. A newer or cheaper model may outperform the one listed here on the relevant benchmark.

3. **Apply the model selection guide** if the specific named models are not available in the current environment.

4. **Present options to the user** using the Model Selection Protocol below — never silently pick.

---

## Model Selection Protocol

> Every agent MUST follow this interaction pattern when more than one model is available for a phase.

After confirming which models are accessible in the current environment, present options to the user **before proceeding**:

```
Before I start [phase name], here are the available model options.
Please choose one before I proceed:

  [A]  <Model Name>  (<Provider>)
       Fit        : Highest reliability for this phase
       Cost       : ~$X.XX / M tokens
       Why        : <one sentence matching this phase cognitive profile>
       Trade-off  : Best output quality; highest cost

  [B]  <Model Name>  (<Provider>)
       Fit        : Best value for this phase
       Cost       : ~$X.XX / M tokens
       Why        : <one sentence matching this phase cognitive profile>
       Trade-off  : Strong quality at roughly half the cost of option A

  [C]  <Model Name>  (<Provider>)
       Fit        : Budget-safe
       Cost       : ~$X.XX / M tokens
       Why        : <one sentence matching this phase cognitive profile>
       Trade-off  : Lowest cost; suitable when inputs are well-scoped and outputs will be reviewed

Which option would you like? (A / B / C)
If unsure, I recommend [A for High Risk / B for Medium / B or C for Low — see Phase Risk table].
```

---

### Phase Risk Table

| Risk Level | Phases | Default to suggest |
|---|---|---|
| **High** — errors propagate downstream or are hard to reverse | `legacy-modernization-orchestrator`, `legacy-analysis`, `target-architecture`, `security-review`, `data-migration` | A |
| **Medium** — errors are local and caught in review | `backend-development`, `frontend-development`, `ios-development`, `android-development`, `cross-platform-mobile`, `compare-legacy-to-new`, `final-validation` | B |
| **Low** — output is structural/templated and easily verified | `legacy-architecture`, `tech-stack-selection`, `ui-ux-design`, `devops-infra`, `quality-playbook`, `agent-governance` | B or C |

---

### What to do if none of the named models are available

1. Read the **Model selection guide** for the current phase.
2. Search the web for models available in your environment that match the described capability profile.
3. Present the best matches found (up to 3) using the same prompt format above.
4. Proceed only after the user confirms a choice.

---

## Benchmark Reference (30 April 2026)

> Verify these figures before use — run the Freshness Policy queries to check for newer models.

| Model | Provider | Coding Score* | Reasoning** | Context | $/M tokens |
|---|---|---|---|---|---|
| GPT-5.5 (high) | OpenAI | 88% | 59 | 922k | $11.25 |
| GPT-5.4 (xhigh) | OpenAI | 82% | 57 | 1.05M | $5.63 |
| GPT-5.3 Codex (xhigh) | OpenAI | — | 54 | 400k | $4.81 |
| GPT-5.4 mini | OpenAI | — | 49 | 400k | $1.69 |
| Claude Opus 4.7 (max) | Anthropic | 72% | 57 | 1M | $10.00 |
| Claude Sonnet 4.6 (max) | Anthropic | 61% | 52 | 1M | $6.00 |
| Gemini 3.1 Pro Preview | Google | 83% | 57 | 1M | $4.50 |
| Gemini 2.5 Pro | Google | 79% | 35 | 1M | $3.44 |
| Gemini 2.5 Flash | Google | 55% | — | 1M | $1.85 |
| DeepSeek V4 Pro (Max) | DeepSeek | — | 52 | 1M | $2.17 |
| DeepSeek V3.2 (Reasoner) | DeepSeek | 74% | 42 | 128k | $1.30 |
| DeepSeek V4 Flash | DeepSeek | — | 47 | 1M | $0.17 |
| Kimi K2.6 | Moonshot | 59% | 54 | 256k | $1.71 |
| Qwen3.6 Plus | Alibaba | — | 50 | 1M | $1.13 |

> \* Aider SWE Bench (edit format, best config as of snapshot date)
> \*\* Artificial Analysis composite intelligence score

---

## Per-Agent Recommendations

---

### 1. `legacy-modernization-orchestrator`

**Phase Risk:** High

**Cognitive profile**
Multi-phase workflow management: tracking which phases are done, applying DoD gates, deciding what runs next, and recovering from partial runs. The model never writes code — it reads artifacts, applies rules, and makes routing decisions. Errors compound across all downstream phases, so instruction-fidelity matters more than raw coding ability.

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | Claude Opus 4.7 (max) | Anthropic | Best instruction-following for complex multi-step rule enforcement |
| B | Gemini 3.1 Pro Preview | Google | 1M context holds full project state; strong reasoning at ~half Opus cost |
| C | DeepSeek V4 Pro (Max) | DeepSeek | Cheapest model still trustworthy for orchestration logic |

**Model selection guide**
You need a model that: (a) follows long, detailed system prompts reliably without drifting; (b) holds and reasons over 50-100k tokens of context; (c) supports structured output or function-calling for gate decisions. Avoid flash/mini models — small routing errors cascade badly. Prioritise instruction fidelity over coding ability.

**Default recommendation:** A — this is a High Risk phase; routing errors cascade across all downstream work.

---

### 2. `legacy-analysis`

**Phase Risk:** High

**Cognitive profile**
Analytical reading of a large, unfamiliar codebase. The model must detect hidden dependencies, reverse-engineer intent from code structure, map business flows, and produce a long structured report. No code is written. The primary demands are a large context window and evidence-based synthesis — connecting observations across many files into coherent findings.

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | Gemini 3.1 Pro Preview | Google | 1M context cleanly handles large legacy repos; strong analytical reasoning |
| B | Claude Opus 4.7 (max) | Anthropic | Excellent multi-section report writing and instruction fidelity |
| C | DeepSeek V4 Pro (Max) | DeepSeek | Solid structured analysis when prompts are tightly scoped |

**Model selection guide**
You need a model that: (a) has a context window of at least 128k tokens (larger is better); (b) produces consistently structured, section-by-section reports; (c) synthesises findings across many files without hallucinating connections. Avoid models optimised only for coding. Reasoning-enabled variants outperform non-reasoning ones here.

**Default recommendation:** A — this is a High Risk phase; analysis quality drives all downstream work.

---

### 3. `legacy-architecture`

**Phase Risk:** Low

**Cognitive profile**
Transformation task: converts a structured analysis report into Mermaid diagrams and HTML documentation. The model reads one document and produces another. Creative reasoning is minimal — accuracy to the source and clean diagram syntax are what matter.

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | Claude Sonnet 4.6 (max) | Anthropic | Very consistent Mermaid and HTML generation with high source fidelity |
| B | Gemini 2.5 Flash | Google | Fast, cheap, and reliable for structured templated generation |
| C | DeepSeek V4 Flash | DeepSeek | Extremely low cost for a straightforward document-to-diagram task |

**Model selection guide**
You need a model that: (a) follows an output template strictly without adding unsolicited content; (b) generates syntactically correct Mermaid and valid HTML; (c) does not hallucinate components not mentioned in the source. Any mid-tier or better model is sufficient — cost optimisation is safe here.

**Default recommendation:** B or C — this is a Low Risk phase; output is easily verified.

---

### 4. `tech-stack-selection`

**Phase Risk:** Low

**Cognitive profile**
Conversational elicitation and structured template filling. The model asks questions, explains tradeoffs briefly, records answers, and writes one well-structured output file. Reasoning depth is low; what matters is clear question phrasing, accurate tradeoff summaries, and strict template adherence.

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | Gemini 2.5 Flash | Google | Fast, conversational, cheap, and reliable for structured template output |
| B | GPT-5.4 mini | OpenAI | Strong instruction-following for guided selection workflows |
| C | DeepSeek V4 Flash | DeepSeek | Adequate and very cheap for templated form completion |

**Model selection guide**
You need a model that: (a) is conversational and clear; (b) handles short Q&A turns well; (c) writes a clean, well-formatted markdown file from collected answers. Deep reasoning is not needed — prefer fast, cheap models here.

**Default recommendation:** B or C — this is a Low Risk phase.

---

### 5. `target-architecture`

**Phase Risk:** High

**Cognitive profile**
High-stakes design work: the model reads legacy analysis artifacts and designs a modern target architecture — ADRs, service boundaries, API contracts, data models, and justification for each decision. Errors here propagate into every downstream development phase. Requires genuine architectural knowledge plus constraint-aware reasoning (existing stack, legacy limitations).

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | GPT-5.4 (xhigh) | OpenAI | Top architecture and coding hybrid; best for complex design decisions |
| B | Gemini 3.1 Pro Preview | Google | Near-premium reasoning with better cost efficiency; handles large input well |
| C | Claude Opus 4.7 (max) | Anthropic | Excellent for constraint-aware design and long structured documentation |

**Model selection guide**
You need a model that: (a) has genuine software architecture knowledge (DDD, clean/hexagonal patterns, API-first design); (b) reasons under constraints (existing stack, legacy limitations); (c) produces long, structured, internally consistent design documents. Do not use flash/mini models — this is the highest-leverage output of the entire framework.

**Default recommendation:** A — this is a High Risk phase; architectural quality drives all of Phase 4.

---

### 6. `ui-ux-design`

**Phase Risk:** Medium

**Cognitive profile**
Mixed creative and technical task: design interfaces from requirements, produce HTML wireframes, define design tokens and component structure, apply accessibility standards. Needs both UX reasoning (hierarchy, flow, affordance) and clean HTML/CSS generation. Outputs are consumed directly by frontend developers.

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | Claude Sonnet 4.6 (max) | Anthropic | Best HTML/CSS quality and UX reasoning in the Sonnet class |
| B | GPT-5.4 (xhigh) | OpenAI | Strong structured UI and component documentation output |
| C | Gemini 2.5 Flash | Google | Cheap and fast for wireframes when design complexity is moderate |

**Model selection guide**
You need a model that: (a) generates syntactically correct, well-structured HTML/CSS; (b) understands UI/UX concepts (hierarchy, flow, accessibility); (c) produces consistent design token and component naming. Avoid models with weak HTML generation.

**Default recommendation:** B — this is a Medium Risk phase.

---

### 7. `backend-development`

**Phase Risk:** Medium

**Cognitive profile**
Large-scale code generation following detailed architectural patterns. The model writes production-grade backend code: domain entities, repositories, service layer, REST controllers, JWT auth, tests, and observability config. Correctness, idiomatic style, and adherence to the architecture contract all matter. This is the highest-volume code output phase.

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | GPT-5.5 (high) | OpenAI | Highest coding benchmark ceiling for multi-file backend generation |
| B | Gemini 2.5 Pro | Google | Best price/performance coder for full backend generation |
| C | DeepSeek V3.2 (Reasoner) | DeepSeek | Outstanding coding cost efficiency at 74% benchmark score |

**Model selection guide**
You need a model that: (a) scores high on coding benchmarks (SWE Bench >= 55%); (b) generates multiple cohesive files in one pass; (c) understands clean architecture and layered design patterns. Coding benchmark score is the primary signal. Reasoning depth is secondary.

**Default recommendation:** B — Gemini 2.5 Pro offers excellent coding per dollar for this phase.

---

### 8. `java-springboot`

**Phase Risk:** Medium

**Cognitive profile**
Framework-specific code extending backend-development. Generates Spring Boot 3 / Java 21 code: entities, repositories, service layer, Spring Security config, Testcontainers integration tests, Maven/Gradle build files, and Dockerfiles. Pattern-following and Java framework fluency matter more than open-ended reasoning.

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | GPT-5.3 Codex (xhigh) | OpenAI | Strong Java/Spring editing profile and framework idiom coverage |
| B | Gemini 2.5 Pro | Google | Very strong Spring Boot generation at competitive cost |
| C | DeepSeek V3.2 (Reasoner) | DeepSeek | Heavily trained on OSS Java; strong Spring patterns at low cost |

**Model selection guide**
You need a model that: (a) knows Spring Boot 3 idioms well (annotations, DI, security config); (b) generates correct Maven/Gradle files; (c) writes JUnit 5 + Mockito + Testcontainers tests. Prioritise models with strong Java/Spring OSS training coverage.

**Default recommendation:** B — this is a Medium Risk phase.

---

### 9. `dotnet-aspnetcore`

**Phase Risk:** Medium

**Cognitive profile**
Framework-specific code for .NET 9 + ASP.NET Core: EF Core 9, xUnit, Testcontainers.NET, Serilog, MSBuild .csproj files, multi-stage Dockerfiles. Same pattern as java-springboot but the C# ecosystem.

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | GPT-5.3 Codex (xhigh) | OpenAI | Best C# generation and project-wide ASP.NET Core editing |
| B | Gemini 2.5 Pro | Google | Good .NET output with solid cost profile |
| C | Kimi K2.6 | Moonshot | Reasonable .NET fallback at lower cost than the top options |

**Model selection guide**
You need a model that: (a) knows C# and ASP.NET Core idioms; (b) generates correct .csproj structure, EF Core configurations, and xUnit tests; (c) understands Minimal API vs Controller-based routing. OpenAI models tend to have stronger .NET coverage due to training data composition.

**Default recommendation:** B — this is a Medium Risk phase.

---

### 10. `python-fastapi`

**Phase Risk:** Medium

**Cognitive profile**
Framework-specific code for Python 3.12 + FastAPI: SQLAlchemy 2 async, Alembic migrations, Pydantic v2 models, pytest-asyncio, structlog, pyproject.toml. Python is the most universally covered language across all model families.

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | GPT-5.3 Codex (xhigh) | OpenAI | Excellent Python refactoring and async API generation |
| B | Gemini 2.5 Pro | Google | Strong FastAPI and test generation at better cost |
| C | DeepSeek V3.2 (Reasoner) | DeepSeek | Very compelling budget option; Python well represented in its training |

**Model selection guide**
You need a model that: (a) knows FastAPI routing, Pydantic v2 patterns, and SQLAlchemy 2 async session management; (b) writes correct Alembic migration files; (c) produces clean pytest-asyncio test structure. Most models scoring above 50% on coding benchmarks perform acceptably — Python is the safest language across all providers.

**Default recommendation:** B or C — Python coverage is broad enough to use budget options confidently.

---

### 11. `go-gin-fiber`

**Phase Risk:** Medium

**Cognitive profile**
Framework-specific code for Go 1.23 + Gin/Fiber: GORM/sqlc, zap/zerolog logging, testcontainers-go, Air live reload, Docker scratch image builds. Go is moderately represented in training data — not as universal as Python.

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | GPT-5.3 Codex (xhigh) | OpenAI | Strong systems/code-editing profile; good Go idiom knowledge |
| B | Gemini 2.5 Pro | Google | Good Go generation at lower token cost |
| C | DeepSeek V3.2 (Reasoner) | DeepSeek | Well-trained on Go OSS patterns; strong budget option |

**Model selection guide**
You need a model that: (a) understands Go module structure and idiomatic error handling; (b) generates GORM models and repository patterns; (c) writes correct Go test files with testcontainers-go. Validate any model on a short Go snippet before a full implementation run — Go idiomatic quality is more training-sensitive than Python.

**Default recommendation:** B — this is a Medium Risk phase.

---

### 12. `frontend-development`

**Phase Risk:** Medium

**Cognitive profile**
Large multi-file TypeScript code generation. The model implements design system components, sets up state management, configures API integration, and writes Vitest/Playwright tests — all consistently with the UI/UX design artifacts and the target architecture API contracts.

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | GPT-5.5 (high) | OpenAI | Best ceiling for multi-file frontend work and complex state management |
| B | Gemini 2.5 Pro | Google | Excellent TypeScript/React generation per dollar |
| C | DeepSeek V3.2 (Reasoner) | DeepSeek | Strong React/TypeScript coverage at low cost |

**Model selection guide**
You need a model that: (a) generates correct TypeScript with strict mode; (b) knows the target framework idioms (React hooks, Vue composition API, Angular signals, Svelte stores); (c) produces multi-file component structures in a single pass. Frontend is more style-sensitive than backend — prefer models known for clean TypeScript output.

**Default recommendation:** B — this is a Medium Risk phase.

---

### 13. `ios-development`

**Phase Risk:** Medium-High

**Cognitive profile**
Swift/SwiftUI MVVM implementation. The model writes ViewModels, Views, Combine/async-await flows, Keychain token storage, CoreData persistence, URLSession networking, and XCTest tests. Swift and Apple SDK coverage varies significantly across model families — this is one of the most provider-dependent phases.

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | Claude Sonnet 4.6 (max) | Anthropic | Best SwiftUI consistency and Apple framework fidelity |
| B | GPT-5.4 (xhigh) | OpenAI | Strong Apple ecosystem knowledge; reliable Swift idioms |
| C | Gemini 2.5 Flash | Google | Cheapest option acceptable for SwiftUI scaffolding; verify output quality first |

**Model selection guide**
You need a model that: (a) writes idiomatic Swift 5.9+ with @Observable, async/await, and SwiftUI lifecycle; (b) knows the Keychain API and URLSession correctly; (c) produces compilable XCTest cases. Strongly prefer Anthropic or OpenAI models — Swift coverage in other providers is less consistent. Always validate with a small SwiftUI view before a full implementation run.

**Default recommendation:** A — Swift ecosystem sensitivity makes this higher risk than other code phases.

---

### 14. `android-development`

**Phase Risk:** Medium

**Cognitive profile**
Kotlin/Jetpack Compose MVVM implementation. The model writes ViewModels, Compose UI, Coroutines/Flow pipelines, Room entities and DAOs, Retrofit services, encrypted storage, FCM integration, and JUnit/Mockk/Turbine tests. Google models have a natural training advantage from Android SDK documentation.

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | Gemini 2.5 Pro | Google | Best Kotlin/Compose fit due to Google Android SDK training data |
| B | Claude Sonnet 4.6 (max) | Anthropic | Reliable Android output with strong instruction fidelity |
| C | DeepSeek V3.2 (Reasoner) | DeepSeek | Good low-cost Kotlin generation for boilerplate-heavy phases |

**Model selection guide**
You need a model that: (a) writes idiomatic Kotlin with coroutines and Flow; (b) generates correct Jetpack Compose composables (not the older XML View system); (c) knows Room, Retrofit, and Hilt DI. For non-Google models, verify Compose generation specifically — many default to the older View approach.

**Default recommendation:** A — Google has a training data advantage for this ecosystem.

---

### 15. `cross-platform-mobile`

**Phase Risk:** Medium

**Cognitive profile**
Flutter (Dart) or React Native (TypeScript) implementation. For Flutter: Riverpod/BLoC, flutter_secure_storage, Dio, integration_test. For React Native: Zustand/Redux Toolkit, react-native-keychain, Axios, Detox. Both frameworks are niche enough that training coverage varies widely across providers.

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | Gemini 2.5 Pro | Google | Best Flutter/Dart output; also strong for React Native TypeScript |
| B | Claude Sonnet 4.6 (max) | Anthropic | Strong React Native/TypeScript; slightly weaker Dart than Gemini |
| C | Kimi K2.6 | Moonshot | Decent mobile scaffolding at low cost; good for iterative work |

**Model selection guide**
You need a model that: (a) for Flutter — writes correct Dart with null safety, Riverpod providers, and BLoC events/states; (b) for React Native — generates correct TypeScript with Expo or bare workflow, navigation, and platform-aware styling. Validate with a small working widget or component before committing to a full implementation run.

**Default recommendation:** B — this is a Medium Risk phase.

---

### 16. `data-migration`

**Phase Risk:** High

**Cognitive profile**
SQL-heavy migration engineering: schema diff scripts (Flyway/Liquibase/Alembic), dual-write reconciliation, row-count/checksum validation, large-table chunking, rollback procedures. The model must reason carefully about data integrity — mistakes can cause irreversible data loss.

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | GPT-5.4 (xhigh) | OpenAI | Best for careful, multi-step migration reasoning |
| B | DeepSeek V3.2 (Reasoner) | DeepSeek | Outstanding SQL and migration script quality per dollar |
| C | Gemini 2.5 Pro | Google | Strong SQL and procedural migration generation |

**Model selection guide**
You need a model that: (a) writes correct SQL DDL and DML with proper transaction boundaries; (b) understands idempotent migration patterns (each script safe to re-run); (c) reasons about rollback scenarios explicitly. Prefer reasoning-enabled variants. Avoid flash/mini models for anything involving key mutations.

**Default recommendation:** A — this is a High Risk phase (data loss potential).

---

### 17. `security-review`

**Phase Risk:** High

**Cognitive profile**
Systematic threat analysis across multiple architectural layers. The model audits code and config for OWASP Top 10 vulnerabilities, reviews JWT validation and rotation, checks CORS and CSP headers, inspects Docker image security, and maps API authorization coverage. Combines deep security domain knowledge with careful cross-artifact reading. Does not generate implementation code.

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | Claude Opus 4.7 (max) | Anthropic | Best security-specific reasoning and OWASP policy fidelity |
| B | GPT-5.4 (xhigh) | OpenAI | Strong security analysis; explains vulnerabilities clearly |
| C | DeepSeek V4 Pro (Max) | DeepSeek | Viable for structured checklist-driven reviews at much lower cost |

**Model selection guide**
You need a model that: (a) has genuine security domain knowledge (OWASP, CVE patterns, JWT pitfalls, secret management); (b) reads config files and code attentively for subtle issues; (c) produces a risk-rated findings report with remediation guidance. Do not use a flash/mini model. This is the phase where the top-tier model is most justified.

**Default recommendation:** A — this is a High Risk phase; missed vulnerabilities have high downstream cost.

---

### 18. `devops-infra`

**Phase Risk:** Low

**Cognitive profile**
Infrastructure-as-code generation: Kubernetes manifests and Helm charts, Terraform/Pulumi modules, GitHub Actions / GitLab CI pipelines, Prometheus alerting rules, Grafana dashboards, secret management. Structured YAML/HCL generation with strong DevOps domain knowledge.

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | GPT-5.3 Codex (xhigh) | OpenAI | Strong code-editing profile well-suited for IaC repo structure |
| B | Gemini 2.5 Pro | Google | Excellent YAML/HCL generation per dollar |
| C | DeepSeek V3.2 (Reasoner) | DeepSeek | Best budget option for structured infra generation |

**Model selection guide**
You need a model that: (a) generates syntactically valid Kubernetes YAML and Helm templating; (b) knows Terraform/Pulumi resource blocks and provider idioms; (c) writes correct GitHub Actions workflow syntax. Test YAML validity after generation — indentation errors are common across all models.

**Default recommendation:** B or C — this is a Low Risk phase (outputs are reviewed before apply).

---

### 19. `quality-playbook`

**Phase Risk:** Low

**Cognitive profile**
Advisory only — no code output. The model answers architectural questions, helps select design patterns, and evaluates testing strategies. Responses are short to medium length. Knowledge breadth and reasoning clarity matter more than coding score or context length.

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | Claude Sonnet 4.6 (max) | Anthropic | Nuanced architectural explanations with strong SE knowledge |
| B | Gemini 2.5 Flash | Google | Cheap and fast; good enough for most advisory questions |
| C | Qwen3.6 Plus | Alibaba | Lower-cost generalist fallback with broad knowledge |

**Model selection guide**
You need a model that: (a) understands software architecture concepts deeply (SOLID, DDD, hexagonal, event-driven); (b) gives clear tradeoff explanations; (c) does not need to write compilable code. Almost any mid-tier or above model works — prioritise conversational quality over coding score.

**Default recommendation:** B or C — this is a Low Risk advisory phase.

---

### 20. `agent-governance`

**Phase Risk:** Low

**Cognitive profile**
Routing and rule-following only. The model reads the agent framework rules and answers questions like "which agent should run next?" or "is this DoD checklist complete?". Short input, short output, strict rule application. No code, no design, no creativity.

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | GPT-5.4 mini | OpenAI | Excellent rule application and instruction tracking at low cost |
| B | Gemini 2.5 Flash | Google | Fast, cheap, and reliable for structured decision logic |
| C | DeepSeek V4 Flash | DeepSeek | Adequate for policy/routing at minimal cost |

**Model selection guide**
You need a model that: (a) follows a fixed rule set accurately; (b) answers short-context questions about process state; (c) does not add unsolicited creative suggestions. This is the safest phase to use your cheapest available model.

**Default recommendation:** B or C — this is a Low Risk phase.

---

### 21. `final-validation`

**Phase Risk:** Medium-High

**Cognitive profile**
Cross-artifact checklist review. The model reads all Phase 4 outputs, the comparison report, and the target architecture, then validates completeness against a fixed checklist, writes a smoke test plan, and produces a go/no-go decision. Structured, disciplined output is essential — this is the release gate.

**Recommended models** *(as of 30 April 2026 — verify via Freshness Policy before use)*

| # | Model | Provider | Rationale |
|---|---|---|---|
| A | Claude Sonnet 4.6 (max) | Anthropic | Best for disciplined, thorough checklist review with structured output |
| B | Gemini 2.5 Flash | Google | Cheap and effective when input artifacts are clean and well-structured |
| C | DeepSeek V4 Flash | DeepSeek | Adequate when validation inputs are complete and well-organised |

**Model selection guide**
You need a model that: (a) reads multiple documents and cross-references them accurately; (b) follows a strict checklist format without skipping items; (c) gives clear pass/fail judgements with evidence. Verify the model handles >= 50k tokens — all Phase 4 artifacts must fit simultaneously.

**Default recommendation:** A — this is the release gate; structured thoroughness is non-negotiable.

---

## Provider-Locked Bundles

If your IDE or agentic platform only exposes one provider, use the corresponding bundle. The selection protocol still applies — present available options within the bundle and ask the user to confirm before proceeding.

### Anthropic-only (e.g. Claude Code)

| Phase Group | Model |
|---|---|
| Orchestration, Analysis, Security | Claude Opus 4.7 (max) |
| Architecture, UI/UX, iOS, Final Validation, Advisory | Claude Sonnet 4.6 (max) |
| All code generation phases | Claude Sonnet 4.6 (max) |
| T4 advisory and routing phases | Claude Sonnet 4.6 non-reasoning |

> Safe and consistent. Higher code-gen cost than Google or mixed setups.

### Google-only

| Phase Group | Model |
|---|---|
| Orchestration, Analysis, Target Architecture | Gemini 3.1 Pro Preview |
| All code generation (backend, frontend, Android, DevOps, cross-platform) | Gemini 2.5 Pro |
| UI/UX, Security, Compare, Final Validation | Gemini 2.5 Pro |
| Legacy Architecture, Tech Stack, Governance, Advisory | Gemini 2.5 Flash |

> Best single-provider price/performance. Recommended default if forced to pick one provider.

### OpenAI-only

| Phase Group | Model |
|---|---|
| Architecture, Security, Migration, iOS | GPT-5.4 (xhigh) |
| Heavy coding phases (backend, frontend) | GPT-5.5 (high) |
| Framework implementation (Java, .NET, Python, Go, DevOps) | GPT-5.3 Codex (xhigh) |
| Routing, template-driven, and advisory phases | GPT-5.4 mini |

> Best raw code quality ceiling. More expensive than Google-first or mixed setups.

### DeepSeek-first (budget)

| Phase Group | Model |
|---|---|
| Orchestration, Analysis, Architecture, Security | DeepSeek V4 Pro (Max) |
| All code generation phases | DeepSeek V3.2 (Reasoner) |
| Lightweight structured phases | DeepSeek V4 Flash |

> Lowest cost. Add manual review gates on all High Risk phases.

---

## Quick Reference Summary

| Agent | Key Demand | Top Pick | Provider | Phase Risk |
|---|---|---|---|---|
| `legacy-modernization-orchestrator` | Instruction fidelity + context | Claude Opus 4.7 | Anthropic | High |
| `legacy-analysis` | Large context + synthesis | Gemini 3.1 Pro | Google | High |
| `legacy-architecture` | Structured diagram gen | Claude Sonnet 4.6 | Anthropic | Low |
| `tech-stack-selection` | Template fill + Q&A | Gemini 2.5 Flash | Google | Low |
| `target-architecture` | Architectural reasoning | GPT-5.4 (xhigh) | OpenAI | High |
| `ui-ux-design` | HTML/CSS + UX reasoning | Claude Sonnet 4.6 | Anthropic | Medium |
| `backend-development` | Code volume + quality | GPT-5.5 (high) | OpenAI | Medium |
| `java-springboot` | Java/Spring idioms | GPT-5.3 Codex | OpenAI | Medium |
| `dotnet-aspnetcore` | C#/ASP.NET idioms | GPT-5.3 Codex | OpenAI | Medium |
| `python-fastapi` | Python/FastAPI idioms | GPT-5.3 Codex | OpenAI | Medium |
| `go-gin-fiber` | Go idioms | GPT-5.3 Codex | OpenAI | Medium |
| `frontend-development` | TypeScript/UI quality | GPT-5.5 (high) | OpenAI | Medium |
| `ios-development` | Swift/SwiftUI fidelity | Claude Sonnet 4.6 | Anthropic | Medium-High |
| `android-development` | Kotlin/Compose fidelity | Gemini 2.5 Pro | Google | Medium |
| `cross-platform-mobile` | Flutter/RN coverage | Gemini 2.5 Pro | Google | Medium |
| `data-migration` | SQL + rollback reasoning | GPT-5.4 (xhigh) | OpenAI | High |
| `security-review` | Security domain knowledge | Claude Opus 4.7 | Anthropic | High |
| `devops-infra` | YAML/HCL generation | GPT-5.3 Codex | OpenAI | Low |
| `quality-playbook` | Architecture advisory | Claude Sonnet 4.6 | Anthropic | Low |
| `agent-governance` | Rule-following + routing | GPT-5.4 mini | OpenAI | Low |
| `final-validation` | Checklist review | Claude Sonnet 4.6 | Anthropic | Medium-High |

---

*Snapshot: 30 April 2026. Run Freshness Policy queries before each project run and review fully every quarter.*
