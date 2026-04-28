#!/usr/bin/env node
/**
 * validate-roster.js — Validate that all roster sources agree with .github/roster.json
 *
 * Usage:
 *   node scripts/validate-roster.js          # check and report
 *
 * Checks:
 *   1. bin/install.js        — AGENTS array matches all installer:true entries in roster
 *   2. AGENTS.md             — phase table references every phased Tier-1 skill
 *   3. CLAUDE.md             — Agent Roster section references every phased Tier-1 skill
 *   4. Orchestrator agent    — phase table in .github/agents/legacy-modernization-orchestrator.agent.md
 *                              has a row for every phased Tier-1 skill
 *   5. README.md             — agent section mentions every installer:true skill name
 *   6. STANDARDS_OUTPUTS.md  — output directories listed in roster appear in the artifact tree
 *   7. Disk                  — every skill_path and agent_path from roster exists on disk
 *   8. Frontmatter schema    — every SKILL.md has name/description/argument-hint per core.md §12
 *   9. Version metadata      — every SKILL.md has version/last_reviewed per core.md §12
 *  10. Deprecation status    — warns on Deprecated skills, fails on Retired skills per agent-governance §9
 *  11. dod.json presence     — every skill with a SKILL.md has a valid dod.json per core.md §3
 *
 * Exit code: 0 if all checks pass, 1 if any divergence found.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Load roster ───────────────────────────────────────────────────────────────
const rosterPath = path.join(ROOT, '.github', 'roster.json');
if (!fs.existsSync(rosterPath)) {
  console.error(`FATAL  .github/roster.json not found at ${rosterPath}`);
  process.exit(1);
}
const roster = JSON.parse(fs.readFileSync(rosterPath, 'utf8'));
const skills = roster.skills;

let errors = 0;
let warnings = 0;

function fail(check, msg) {
  console.error(`  FAIL [${check}] ${msg}`);
  errors++;
}

function warn(check, msg) {
  console.warn(`  WARN [${check}] ${msg}`);
  warnings++;
}

function pass(check, msg) {
  console.log(`  OK   [${check}] ${msg}`);
}

// Helpers
const phasedTier1 = skills.filter(
  s => s.tier === '1' && s.phase !== 'orchestrator',
);
const installerEntries = skills.filter(s => s.installer);

// ── Check 1: bin/install.js AGENTS array ─────────────────────────────────────
console.log('\n[Check 1] bin/install.js — AGENTS array');

const installJsPath = path.join(ROOT, 'bin', 'install.js');
const installJs = fs.readFileSync(installJsPath, 'utf8');
const agentsMatch = installJs.match(/const AGENTS\s*=\s*\[([\s\S]*?)\];/);

if (!agentsMatch) {
  fail('1', 'Could not find AGENTS array in bin/install.js');
} else {
  const foundNames = [...agentsMatch[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
  const expectedNames = installerEntries.map(s => s.name);

  for (const name of expectedNames) {
    if (foundNames.includes(name)) {
      pass('1', `'${name}' present`);
    } else {
      fail('1', `bin/install.js AGENTS missing: '${name}'`);
    }
  }
  for (const name of foundNames) {
    if (!expectedNames.includes(name)) {
      fail('1', `bin/install.js AGENTS has extra entry not in roster: '${name}'`);
    }
  }
}

// ── Check 2: AGENTS.md phase table ────────────────────────────────────────────
console.log('\n[Check 2] AGENTS.md — phase table coverage');

const agentsMdPath = path.join(ROOT, 'AGENTS.md');
const agentsMd = fs.readFileSync(agentsMdPath, 'utf8');

for (const skill of phasedTier1) {
  if (agentsMd.includes(`\`${skill.name}\``)) {
    pass('2', `AGENTS.md references '${skill.name}'`);
  } else {
    fail('2', `AGENTS.md missing reference to '${skill.name}'`);
  }
}

// ── Check 3: CLAUDE.md Agent Roster section ───────────────────────────────────
console.log('\n[Check 3] CLAUDE.md — Agent Roster section');

const claudeMdPath = path.join(ROOT, 'CLAUDE.md');
const claudeMd = fs.readFileSync(claudeMdPath, 'utf8');

for (const skill of phasedTier1) {
  if (claudeMd.includes(`\`${skill.name}\``)) {
    pass('3', `CLAUDE.md references '${skill.name}'`);
  } else {
    fail('3', `CLAUDE.md missing reference to '${skill.name}'`);
  }
}

// ── Check 4: Orchestrator agent phase table ────────────────────────────────────
console.log('\n[Check 4] Orchestrator agent — phase table');

const orchestratorPath = path.join(
  ROOT,
  '.github',
  'agents',
  'legacy-modernization-orchestrator.agent.md',
);
const orchestratorMd = fs.readFileSync(orchestratorPath, 'utf8');

for (const skill of phasedTier1) {
  if (orchestratorMd.includes(`\`${skill.name}\``)) {
    pass('4', `Orchestrator references '${skill.name}'`);
  } else {
    fail('4', `Orchestrator agent missing reference to '${skill.name}'`);
  }
}

// ── Check 5: README.md agent mentions ─────────────────────────────────────────
console.log('\n[Check 5] README.md — all installer skills mentioned');

const readmePath = path.join(ROOT, 'README.md');
const readmeMd = fs.readFileSync(readmePath, 'utf8');

for (const skill of installerEntries) {
  if (readmeMd.includes(skill.name)) {
    pass('5', `README.md mentions '${skill.name}'`);
  } else {
    warn('5', `README.md does not mention '${skill.name}' — consider adding it to the agent table`);
  }
}

// ── Check 6: STANDARDS_OUTPUTS.md — output dirs present ──────────────────────
console.log('\n[Check 6] STANDARDS_OUTPUTS.md — output paths present');

const standardsPath = path.join(ROOT, '.github', 'skills', 'STANDARDS_OUTPUTS.md');
const standardsMd = fs.readFileSync(standardsPath, 'utf8');

const allOutputPaths = skills.flatMap(s => s.outputs);
const uniqueOutputDirs = [
  ...new Set(
    allOutputPaths.map(p => {
      // Strip trailing slash and filename, keep directory key
      const parts = p.replace(/\/$/, '').split('/');
      return parts[parts.length - 1]; // last segment as a presence check
    }),
  ),
];

for (const dir of uniqueOutputDirs) {
  if (standardsMd.includes(dir)) {
    pass('6', `STANDARDS_OUTPUTS.md mentions '${dir}'`);
  } else {
    warn('6', `STANDARDS_OUTPUTS.md may be missing output key '${dir}'`);
  }
}

// ── Check 7: Disk file existence ───────────────────────────────────────────────
console.log('\n[Check 7] Disk — skill_path and agent_path exist');

for (const skill of skills) {
  const skillAbsPath = path.join(ROOT, skill.skill_path);
  if (fs.existsSync(skillAbsPath)) {
    pass('7', `skill_path exists: ${skill.skill_path}`);
  } else {
    fail('7', `skill_path NOT FOUND: ${skill.skill_path}`);
  }

  if (skill.agent_path) {
    const agentAbsPath = path.join(ROOT, skill.agent_path);
    if (fs.existsSync(agentAbsPath)) {
      pass('7', `agent_path exists: ${skill.agent_path}`);
    } else {
      fail('7', `agent_path NOT FOUND: ${skill.agent_path}`);
    }
  }
}

// ── Check 8: Skill frontmatter schema (core.md §12) ──────────────────────────
console.log('\n[Check 8] SKILL.md frontmatter schema — name / description / argument-hint');

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\S+):\s*['"]?(.*?)['"]?\s*$/);
    if (kv) fields[kv[1]] = kv[2];
  }
  return fields;
}

for (const skill of skills) {
  // Only lint SKILL.md files (not agent files used as skill_path for the orchestrator)
  if (!skill.skill_path.endsWith('SKILL.md')) continue;

  const absPath = path.join(ROOT, skill.skill_path);
  if (!fs.existsSync(absPath)) continue; // already caught by Check 7

  const content = fs.readFileSync(absPath, 'utf8');
  const fm = parseFrontmatter(content);
  const slug = skill.name;
  const label = `[${skill.skill_path}]`;

  if (!fm) {
    fail('8', `${label} — no YAML frontmatter block found`);
    continue;
  }

  // name field
  if (!fm.name) {
    fail('8', `${label} — 'name' field missing from frontmatter`);
  } else if (fm.name !== slug) {
    fail('8', `${label} — 'name' is '${fm.name}' but directory slug is '${slug}'`);
  } else {
    pass('8', `${label} name='${fm.name}' matches slug`);
  }

  // description field
  if (!fm.description) {
    fail('8', `${label} — 'description' field missing from frontmatter`);
  } else {
    const len = fm.description.length;
    if (len > 800) {
      fail('8', `${label} — description is ${len} chars (limit 800)`);
    } else if (len > 500) {
      warn('8', `${label} — description is ${len} chars (recommended ≤ 500)`);
    } else {
      pass('8', `${label} description present (${len} chars)`);
    }
  }

  // argument-hint field
  if (!fm['argument-hint']) {
    fail('8', `${label} — 'argument-hint' field missing from frontmatter`);
  } else {
    pass('8', `${label} argument-hint present`);
  }
}

// ── Check 9: version and last_reviewed fields (core.md §12) ──────────────────
console.log('\n[Check 9] SKILL.md frontmatter — version / last_reviewed');

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const now = Date.now();

for (const skill of skills) {
  if (!skill.skill_path.endsWith('SKILL.md')) continue;

  const absPath = path.join(ROOT, skill.skill_path);
  if (!fs.existsSync(absPath)) continue;

  const content = fs.readFileSync(absPath, 'utf8');
  const fm = parseFrontmatter(content);
  const label = `[${skill.skill_path}]`;

  if (!fm) continue; // already flagged in Check 8

  // version
  if (!fm.version) {
    warn('9', `${label} — 'version' field missing (add: version: 1.0.0)`);
  } else if (!/^\d+\.\d+\.\d+$/.test(fm.version)) {
    warn('9', `${label} — 'version' value '${fm.version}' is not valid semver (expected MAJOR.MINOR.PATCH)`);
  } else {
    pass('9', `${label} version=${fm.version}`);
  }

  // last_reviewed
  if (!fm.last_reviewed) {
    warn('9', `${label} — 'last_reviewed' field missing (add: last_reviewed: YYYY-MM-DD)`);
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.last_reviewed)) {
    warn('9', `${label} — 'last_reviewed' value '${fm.last_reviewed}' is not YYYY-MM-DD`);
  } else {
    const reviewedAt = new Date(fm.last_reviewed).getTime();
    if (now - reviewedAt > ONE_YEAR_MS) {
      warn('9', `${label} — last_reviewed=${fm.last_reviewed} is more than 365 days ago — schedule a review`);
    } else {
      pass('9', `${label} last_reviewed=${fm.last_reviewed}`);
    }
  }
}

// ── Check 10: Deprecation status (core.md §12, agent-governance §9) ──────────
console.log('\n[Check 10] SKILL.md frontmatter — status / deprecation fields');

const VALID_STATUSES = new Set(['Active', 'Deprecated', 'Retired']);

for (const skill of skills) {
  if (!skill.skill_path.endsWith('SKILL.md')) continue;

  const absPath = path.join(ROOT, skill.skill_path);
  if (!fs.existsSync(absPath)) continue;

  const content = fs.readFileSync(absPath, 'utf8');
  const fm = parseFrontmatter(content);
  const label = `[${skill.skill_path}]`;

  if (!fm) continue;

  const status = fm.status;

  if (!status) {
    // Absence defaults to Active — just note it
    pass('10', `${label} status not set (defaults to Active)`);
    continue;
  }

  if (!VALID_STATUSES.has(status)) {
    fail('10', `${label} — status '${status}' is not valid; must be Active, Deprecated, or Retired`);
    continue;
  }

  if (status === 'Active') {
    pass('10', `${label} status=Active`);
  } else if (status === 'Deprecated') {
    warn('10', `${label} — skill is Deprecated; callers should migrate to successor before sunset`);
    if (!fm.deprecated_since) warn('10', `${label} — Deprecated skill missing 'deprecated_since' field`);
    if (!fm.sunset_date)      warn('10', `${label} — Deprecated skill missing 'sunset_date' field`);
    if (!fm.successor)        warn('10', `${label} — Deprecated skill missing 'successor' field`);
  } else if (status === 'Retired') {
    fail('10', `${label} — skill is Retired and should be removed from the roster and installer`);
  }
}

// ── Check 11: dod.json presence and structure (core.md §3) ───────────────────
console.log('\n[Check 11] dod.json — presence and structure per skill');

const VALID_VERIFIERS = new Set(['glob', 'cmd', 'manual']);

for (const skill of skills) {
  if (!skill.skill_path.endsWith('SKILL.md')) continue;

  const dodPath = path.join(ROOT, path.dirname(skill.skill_path), 'dod.json');
  const label = `[${skill.name}]`;

  if (!fs.existsSync(dodPath)) {
    fail('11', `${label} — dod.json missing at ${path.dirname(skill.skill_path)}/dod.json`);
    continue;
  }

  let dod;
  try {
    dod = JSON.parse(fs.readFileSync(dodPath, 'utf8'));
  } catch (e) {
    fail('11', `${label} — dod.json is not valid JSON: ${e.message}`);
    continue;
  }

  if (!Array.isArray(dod.items)) {
    fail('11', `${label} — dod.json missing top-level 'items' array`);
    continue;
  }

  let itemErrors = 0;
  for (const item of dod.items) {
    if (!item.id || !item.description || !item.verifier) {
      fail('11', `${label} — dod.json item missing required field (id/description/verifier): ${JSON.stringify(item)}`);
      itemErrors++;
    } else if (!VALID_VERIFIERS.has(item.verifier)) {
      fail('11', `${label} — dod.json item '${item.id}' has invalid verifier '${item.verifier}'`);
      itemErrors++;
    }
  }

  if (itemErrors === 0) {
    pass('11', `${label} dod.json valid (${dod.items.length} items)`);
  }
}

// ── Summary ────────────────────────────────────────────────────────────────────
console.log('');
console.log(`Roster: ${skills.length} skills | Errors: ${errors} | Warnings: ${warnings}`);
if (errors === 0) {
  console.log(`✓ All roster checks passed.`);
  process.exit(0);
} else {
  console.error(
    `✗ ${errors} check(s) failed. Update the diverging source files to match .github/roster.json.`,
  );
  process.exit(1);
}
