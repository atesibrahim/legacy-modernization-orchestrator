#!/usr/bin/env node
/**
 * sync-wrappers.js — Sync .claude/skills/ and .codex/skills/ wrapper descriptions
 * from the canonical source-of-truth definitions in this file.
 *
 * Usage:
 *   node scripts/sync-wrappers.js          # sync all wrappers
 *   node scripts/sync-wrappers.js --check  # validate only (exit 1 if drift detected)
 *
 * Add to package.json scripts:
 *   "sync:wrappers": "node scripts/sync-wrappers.js"
 *   "check:wrappers": "node scripts/sync-wrappers.js --check"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Canonical wrapper metadata ────────────────────────────────────────────────
// Single source of truth for name, description, and argument-hint.
// When .github/skills/ descriptions change, update here and run sync.

const WRAPPERS = [
  {
    name: 'legacy-analysis',
    description:
      'Legacy system deep-dive analysis for modernization projects. ' +
      'Trigger phrases: "analyse legacy codebase", "reverse engineer legacy architecture", "inventory legacy database schema", "find technical debt", "map business flows in legacy system", "detect hidden dependencies", "assess legacy security posture", "catalogue stored procedures and triggers", "produce table ownership matrix", "data quality assessment before migration". ' +
      'Outputs: legacy_analyse.md with technology profile, DB schema inventory, risk matrix, integration map, security findings, and UI screen inventory. ' +
      'Run this FIRST — all other phases depend on its output.',
    argumentHint: 'Path or description of the legacy project to analyze',
    claudeAgentDescription:
      'Run first in any modernization project. Use when: analysing a legacy codebase, reverse engineering legacy architecture, finding technical debt, mapping business flows, detecting hidden dependencies, assessing legacy security posture, inventorying database schema / stored procedures / triggers / tables, producing table ownership matrix, data quality assessment, UI screen inventory before any redesign or migration. Produces legacy_analyse.md. Required by all subsequent phases.',
  },
  {
    name: 'legacy-architecture',
    description:
      'Legacy system architecture visualization via Mermaid.js HTML diagrams. ' +
      'Trigger phrases: "diagram legacy system", "visualize legacy architecture", "map legacy component dependencies", "document legacy data flows", "create legacy architecture diagrams", "identify architectural weaknesses in legacy system", "produce legacy system HTML diagrams". ' +
      'Outputs: legacy_architecture.md + legacy_architecture.html with 6 diagrams: high-level architecture, component dependency, data flow, auth flow, DB architecture, deployment topology. ' +
      'NOT for designing the new target system — use target-architecture for that. ' +
      'Requires legacy-analysis output to exist.',
    argumentHint: 'Legacy system name or path to analysis report to base diagrams from',
    claudeAgentDescription:
      'Use when: visualizing legacy architecture, diagramming legacy system components and dependencies, mapping legacy data flows, documenting legacy architectural weaknesses, producing Mermaid.js HTML diagrams (high-level, component, data flow, auth, DB, deployment). NOT for new system design — use target-architecture for that. Requires legacy-analysis output.',
  },
  {
    name: 'target-architecture',
    description:
      'Modern target system architecture design using Clean / Hexagonal / DDD patterns. ' +
      'Trigger phrases: "design modern replacement system", "create target architecture", "define bounded contexts", "design microservices", "API-first architecture design", "produce architecture diagrams for new system", "define service boundaries". ' +
      'Tech stack: Java Spring Boot / .NET ASP.NET Core / Python FastAPI / Go Gin-Fiber backend; React / Vue / Angular / Svelte frontend; Kotlin mobile. ' +
      'Outputs: target_architecture.md + target_architecture.html with architecture diagrams and ADRs. ' +
      'NOT for legacy system documentation — use legacy-analysis and legacy-architecture for that. ' +
      'Requires legacy-analysis + legacy-architecture + tech_stack_selections.md to exist.',
    argumentHint: 'Project name or path to legacy analysis and legacy design artifacts',
    claudeAgentDescription:
      'Use when: designing the new modern system architecture, creating target state design, applying Clean/Hexagonal/DDD/microservices patterns, defining service boundaries and bounded contexts, API-first design, producing Mermaid architecture diagrams. NOT for legacy system documentation. Requires legacy-analysis + legacy-architecture + tech stack confirmed in Phase 2.5.',
  },
  {
    name: 'ui-ux-design',
    description:
      'UI/UX design for modernized web and mobile applications. ' +
      'Trigger phrases: "design new user interface", "create wireframes for modernized app", "build design system", "define user journeys", "design React web app screens", "design iOS Android screens", "apply WCAG accessibility", "create design tokens", "produce component library", "design-to-code handoff". ' +
      'Outputs: ui_ux_pages.md + ui_ux_pages.html wireframes + tokens.json (W3C format) + component_api.md + Storybook stubs + design-implementation-checklist.md. ' +
      'NOT for backend-only projects (skip if no UI layer). ' +
      'Requires target-architecture to exist.',
    argumentHint: 'Application name and list of primary user roles or workflows to design for',
    claudeAgentDescription:
      'Use when: designing user interfaces for modernized application, creating wireframes and mockups, defining design systems and component tokens, mapping user journeys for web and mobile, applying WCAG accessibility, producing design-to-code handoff artifacts (tokens.json, component API, Storybook stubs). NOT needed for backend-only projects. Requires target-architecture.',
  },
  {
    name: 'backend-development',
    description:
      'Backend API and service implementation for modernized systems. ' +
      'Trigger phrases: "implement backend", "build REST API", "build Spring Boot service", "build ASP.NET Core API", "build FastAPI service", "build Go API", "implement clean architecture backend", "set up DDD modules", "implement JWT authentication", "implement database repositories", "add Testcontainers integration tests", "set up observability tracing metrics". ' +
      'Supports: Java Spring Boot, .NET ASP.NET Core, Python FastAPI, Go Gin/Fiber. ' +
      'Outputs: be_development_todo.md + full backend project under development/backend_development/. ' +
      'NOT for frontend or mobile — use frontend-development, ios-development, android-development for those. ' +
      'Requires target-architecture + tech_stack_selections.md.',
    argumentHint: 'Project name or path to system design artifacts to base backend implementation on',
    claudeAgentDescription:
      'Use when: implementing the backend service (Java Spring Boot / .NET ASP.NET Core / Python FastAPI / Go Gin-Fiber), building REST APIs with OpenAPI + JWT/OAuth2, implementing clean/hexagonal architecture with DDD, setting up ORM repositories, unit + integration tests with Testcontainers, observability (metrics, tracing, logging). NOT for frontend or mobile. Requires target-architecture + tech stack confirmed.',
  },
  {
    name: 'frontend-development',
    description:
      'Web frontend implementation for modernized applications. ' +
      'Trigger phrases: "implement web frontend", "build React app", "build Vue app", "build Angular app", "build Svelte app", "implement design system in code", "set up TanStack Query", "set up Zustand state", "set up Pinia state", "API integration with Axios", "Vitest unit tests", "Playwright e2e tests", "frontend performance optimization". ' +
      'Outputs: fe_development_todo.md + full frontend project under development/frontend_development/. ' +
      'NOT for mobile apps — use ios-development (Swift/SwiftUI) or android-development (Kotlin/Compose) instead. ' +
      'Requires ui-ux-design + target-architecture.',
    argumentHint: 'Project name or path to UI/UX design artifacts and system design to implement',
    claudeAgentDescription:
      'Use when: building web frontend in React / Vue / Angular / Svelte with TypeScript, implementing design system components, setting up state management (TanStack Query / Zustand / Pinia / NgRx), API integration with Axios, Vitest + Playwright testing, performance optimization. NOT for mobile — use ios-development or android-development for native mobile. Requires ui-ux-design + target-architecture.',
  },
  {
    name: 'ios-development',
    description:
      'Native iOS app development for modernized systems. ' +
      'Trigger phrases: "build iOS app", "implement Swift SwiftUI app", "build native iPhone app", "implement iOS MVVM", "iOS Keychain token storage", "iOS URLSession networking", "iOS CoreData persistence", "iOS push notifications APNs", "iOS deep linking", "XCTest unit tests", "submit to App Store", "iOS WidgetKit widget", "iOS BackgroundTasks", "iOS App Intents Siri". ' +
      'Outputs: ios_development_todo.md + full Xcode project under development/mobile_development/ios/. ' +
      'NOT for Android — use android-development. NOT for cross-platform (Flutter/RN not supported). ' +
      'Requires ui-ux-design + target-architecture.',
    argumentHint: 'Project name or path to UI/UX design artifacts and system design to implement',
    claudeAgentDescription:
      'Use when: building native Swift SwiftUI iOS app, implementing MVVM with Combine/async-await, Keychain token storage, URLSession networking, CoreData/SwiftData persistence, APNs push notifications, deep linking, XCTest unit + UI testing, App Store deployment, WidgetKit, BackgroundTasks, App Intents. NOT for Android or cross-platform. Requires ui-ux-design + target-architecture.',
  },
  {
    name: 'android-development',
    description:
      'Native Android app development for modernized systems. ' +
      'Trigger phrases: "build Android app", "implement Kotlin Jetpack Compose app", "build native Android app", "Android MVVM Clean Architecture", "Android EncryptedSharedPreferences token storage", "Retrofit OkHttp networking", "Room database persistence", "FCM push notifications", "Android deep linking", "JUnit Mockk Turbine tests", "Espresso Compose UI tests", "submit to Play Store", "Glance AppWidget widget", "WorkManager background tasks". ' +
      'Outputs: android_development_todo.md + full Gradle project under development/mobile_development/android/. ' +
      'NOT for iOS — use ios-development. NOT for cross-platform (Flutter/RN not supported). ' +
      'Requires ui-ux-design + target-architecture.',
    argumentHint: 'Project name or path to UI/UX design artifacts and system design to implement',
    claudeAgentDescription:
      'Use when: building native Kotlin Jetpack Compose Android app, implementing MVVM Clean Architecture with Coroutines/Flow, EncryptedSharedPreferences/Keystore token storage, Retrofit + OkHttp networking, Room persistence, FCM push notifications, deep linking, JUnit + Mockk + Turbine + Espresso testing, Play Store deployment, Glance AppWidget, WorkManager. NOT for iOS or cross-platform. Requires ui-ux-design + target-architecture.',
  },
  {
    name: 'compare-legacy-to-new',
    description:
      'Gap analysis and migration strategy comparing the legacy system to the redesigned system. ' +
      'Trigger phrases: "compare legacy to new system", "validate feature parity", "gap analysis legacy vs new", "map legacy components to new equivalents", "create migration strategy", "before-after architecture diagrams", "check that all legacy features are covered", "identify improvements and regressions", "performance baseline comparison", "cutover readiness". ' +
      'Outputs: compare_legacy_to_new_system.md + .html with functional coverage table, architecture evolution diagram, technology migration map, performance comparison, and risk/migration strategy. ' +
      'Requires legacy-analysis + legacy-architecture + target-architecture + at least one Phase 4 development artifact.',
    argumentHint: 'Path to legacy analysis and new system design artifacts to compare',
    claudeAgentDescription:
      'Use when: comparing legacy system to redesigned system, validating feature parity, performing gap analysis, mapping legacy components to new equivalents, creating migration strategy, producing before-after Mermaid HTML diagrams, checking all legacy functionality is covered, identifying improvements and regressions, performance baseline comparison. Requires legacy-analysis + legacy-architecture + target-architecture + at least one Phase 4 artifact.',
  },
  {
    name: 'legacy-modernization-orchestrator',
    description:
      'Master orchestrator for complete end-to-end legacy system modernization from analysis to go-live. ' +
      'Trigger phrases: "modernize legacy system", "full legacy redesign", "end-to-end modernization project", "start legacy modernization workflow", "run all modernization phases", "orchestrate full redesign from legacy to production-ready", "legacy system transformation". ' +
      'Executes phases in strict order with DoD gates: Phase 1 (analysis) → Phase 2 (legacy diagrams) → Phase 2.5 (tech stack selection) → Phase 3 (target architecture) → Phase 4a–4g (optional parallel: UI/UX, backend, frontend, iOS, Android, data migration, security review) → Phase 5 (comparison) → Phase 6 (final validation + go/no-go). ' +
      'Use standalone sub-agents (legacy-analysis, target-architecture, etc.) when you only need a single phase, not the full workflow.',
    argumentHint: 'Legacy project path or name to begin full end-to-end redesign workflow',
    claudeAgentDescription:
      'Use when starting or continuing a full end-to-end legacy modernization project. Orchestrates all phases in order with DoD gates: legacy-analysis → legacy-architecture → tech stack selection → target-architecture → ui-ux-design → backend/frontend/ios/android-development (optional parallel) → compare-legacy-to-new → final-validation. Use individual sub-agents when only a single phase is needed.',
  },
];

// ── helpers ───────────────────────────────────────────────────────────────────

function readFrontmatterField(content, field) {
  const match = content.match(new RegExp(`^${field}:\\s*["']?(.+?)["']?\\s*$`, 'm'));
  return match ? match[1].trim() : null;
}

function replaceFrontmatterField(content, field, newValue) {
  // Replace single-line frontmatter field (handles quoted and unquoted values)
  return content.replace(
    new RegExp(`^(${field}:\\s*)["']?.*?["']?\\s*$`, 'm'),
    `$1"${newValue}"`,
  );
}

function replaceFrontmatterFieldUnquoted(content, field, newValue) {
  return content.replace(
    new RegExp(`^(${field}:\\s*)["']?.*?["']?\\s*$`, 'm'),
    `$1${newValue}`,
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

const checkOnly = process.argv.includes('--check');
let driftCount = 0;
let updateCount = 0;

for (const wrapper of WRAPPERS) {
  const skillName = wrapper.name === 'legacy-analysis' ? 'legacy-analysis' : wrapper.name;

  // .claude/skills/<name>/SKILL.md
  const claudeSkillPath = path.join(ROOT, '.claude', 'skills', skillName, 'SKILL.md');
  if (fs.existsSync(claudeSkillPath)) {
    let content = fs.readFileSync(claudeSkillPath, 'utf8');
    const currentDesc = readFrontmatterField(content, 'description');
    const currentHint = readFrontmatterField(content, 'argument-hint');
    const expectedDesc = wrapper.description;
    const expectedHint = wrapper.argumentHint;

    const descDrifted = currentDesc !== expectedDesc;
    const hintDrifted = currentHint !== expectedHint;

    if (descDrifted || hintDrifted) {
      driftCount++;
      if (checkOnly) {
        if (descDrifted) console.error(`DRIFT  ${claudeSkillPath}\n  description mismatch`);
        if (hintDrifted) console.error(`DRIFT  ${claudeSkillPath}\n  argument-hint mismatch`);
      } else {
        if (descDrifted) content = replaceFrontmatterField(content, 'description', expectedDesc);
        if (hintDrifted) content = replaceFrontmatterField(content, 'argument-hint', expectedHint);
        fs.writeFileSync(claudeSkillPath, content, 'utf8');
        updateCount++;
        console.log(`SYNCED ${claudeSkillPath}`);
      }
    } else {
      console.log(`OK     ${claudeSkillPath}`);
    }
  }

  // .codex/skills/<name>/SKILL.md (uses same skillName mapping)
  const codexSkillPath = path.join(ROOT, '.codex', 'skills', skillName, 'SKILL.md');
  if (fs.existsSync(codexSkillPath)) {
    let content = fs.readFileSync(codexSkillPath, 'utf8');
    const currentDesc = readFrontmatterField(content, 'description');
    const currentHint = readFrontmatterField(content, 'argument-hint');
    const expectedDesc = wrapper.description;
    const expectedHint = wrapper.argumentHint;

    const descDrifted = currentDesc !== expectedDesc;
    const hintDrifted = currentHint !== expectedHint;

    if (descDrifted || hintDrifted) {
      driftCount++;
      if (checkOnly) {
        if (descDrifted) console.error(`DRIFT  ${codexSkillPath}\n  description mismatch`);
        if (hintDrifted) console.error(`DRIFT  ${codexSkillPath}\n  argument-hint mismatch`);
      } else {
        if (descDrifted) content = replaceFrontmatterField(content, 'description', expectedDesc);
        if (hintDrifted) content = replaceFrontmatterField(content, 'argument-hint', expectedHint);
        fs.writeFileSync(codexSkillPath, content, 'utf8');
        updateCount++;
        console.log(`SYNCED ${codexSkillPath}`);
      }
    } else {
      console.log(`OK     ${codexSkillPath}`);
    }
  }

  // .claude/agents/<name>.md — check description field only
  const claudeAgentPath = path.join(ROOT, '.claude', 'agents', `${wrapper.name}.md`);
  if (fs.existsSync(claudeAgentPath)) {
    let content = fs.readFileSync(claudeAgentPath, 'utf8');
    const currentDesc = readFrontmatterField(content, 'description');
    const expectedDesc = wrapper.claudeAgentDescription;

    if (currentDesc !== expectedDesc) {
      driftCount++;
      if (checkOnly) {
        console.error(`DRIFT  ${claudeAgentPath}\n  description mismatch`);
      } else {
        content = replaceFrontmatterField(content, 'description', expectedDesc);
        fs.writeFileSync(claudeAgentPath, content, 'utf8');
        updateCount++;
        console.log(`SYNCED ${claudeAgentPath}`);
      }
    } else {
      console.log(`OK     ${claudeAgentPath}`);
    }
  }
}

console.log('');
if (checkOnly) {
  if (driftCount === 0) {
    console.log(`✓ All wrappers are in sync.`);
    process.exit(0);
  } else {
    console.error(`✗ ${driftCount} wrapper(s) have drifted from canonical definitions. Run 'npm run sync:wrappers' to fix.`);
    process.exit(1);
  }
} else {
  console.log(`✓ Done. ${updateCount} file(s) updated, ${WRAPPERS.length * 3 - updateCount} already in sync.`);
}
