#!/usr/bin/env node
/**
 * ci-validate.js — Framework self-tests for the legacy-modernization-orchestrator.
 *
 * Complements scripts/validate-roster.js by enforcing structural / hygiene rules
 * that the roster validator does not cover. Designed for PR / CI execution.
 *
 * Usage:
 *   node scripts/ci-validate.js          # run all checks, exit 1 on failure
 *
 * Checks:
 *   A. Frontmatter YAML lint  — every SKILL.md, every .agent.md and the orchestrator
 *                              file has a syntactically valid YAML frontmatter block
 *                              (no tabs in indents, balanced quotes, key:value lines).
 *   B. Relative link resolution — every relative markdown link
 *                              `[text](path)` in tracked .md files resolves to a real
 *                              file or directory on disk. Fragments and query strings
 *                              are stripped before resolution. http(s)://, mailto: and
 *                              pure `#anchor` links are skipped.
 *   C. Required SKILL.md headings — every roster skill that produces an output
 *                              artefact (i.e. non-advisory) contains H2 headings for
 *                              `## Role`, `## Prerequisites (Preflight)` (or
 *                              `## Preflight`) and `## Definition of Done`.
 *                              Advisory skills (no outputs declared in roster) are
 *                              exempt from the Preflight + DoD requirement but must
 *                              still have a Role section. Phase-1 skills (no upstream
 *                              `depends_on`) are exempt from the Preflight requirement
 *                              only — they still must declare DoD.
 *   D. STANDARDS_OUTPUTS coverage — every output path declared by a skill in
 *                              roster.json appears verbatim in
 *                              `.github/skills/STANDARDS_OUTPUTS.md` (either in the
 *                              artefact tree or in the Phase → Artifact Mapping
 *                              Summary table).
 *
 * Exit code: 0 if all checks pass, 1 if any FAIL was emitted. WARN does not fail.
 *
 * Zero runtime dependencies — uses only Node built-ins.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

let errors = 0;
let warnings = 0;
const fail = (check, msg) => { console.error(`  FAIL [${check}] ${msg}`); errors++; };
const warn = (check, msg) => { console.warn(`  WARN [${check}] ${msg}`); warnings++; };
const pass = (check, msg) => { console.log(`  OK   [${check}] ${msg}`); };

// ── Load roster ──────────────────────────────────────────────────────────────
const rosterPath = path.join(ROOT, '.github', 'roster.json');
if (!fs.existsSync(rosterPath)) {
  console.error(`FATAL  .github/roster.json not found at ${rosterPath}`);
  process.exit(1);
}
const roster = JSON.parse(fs.readFileSync(rosterPath, 'utf8'));
const skills = roster.skills;

// ── Helpers ──────────────────────────────────────────────────────────────────
function readIfExists(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

function listMarkdownFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.git')) continue;
      listMarkdownFiles(full, acc);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      acc.push(full);
    }
  }
  return acc;
}

/**
 * Lightweight frontmatter YAML validator. Catches the failure modes that have
 * actually broken this repo in the past:
 *   - missing closing `---`
 *   - tab characters used for indentation
 *   - malformed `key: value` lines (e.g. missing colon)
 *   - unbalanced quotes on a value
 *
 * Not a full YAML parser. Intentional. A full parser would require a runtime
 * dependency; the patterns below catch the realistic 80% case.
 */
function validateFrontmatter(content, label) {
  const issues = [];
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\s*(\r?\n|$)/);
  if (!m) {
    issues.push('no YAML frontmatter block found (must start at line 1 with `---`)');
    return issues;
  }
  const block = m[1];
  const lines = block.split('\n');
  let inBlockScalar = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.length === 0) continue;
    if (/^\t/.test(line)) {
      issues.push(`line ${i + 1}: tab character used for indentation (YAML requires spaces)`);
    }
    if (inBlockScalar) {
      // tolerate continuation lines for `>` / `|` block scalars
      if (/^\s+\S/.test(line)) continue;
      inBlockScalar = false;
    }
    // Allow comments and list items
    if (/^\s*#/.test(line)) continue;
    if (/^\s*-\s/.test(line)) continue;
    // Mapping line must be `key: value` or `key:` (block scalar / nested)
    const kv = line.match(/^([A-Za-z_][\w\-]*)\s*:(\s*)(.*)$/);
    if (!kv) {
      issues.push(`line ${i + 1}: not a valid mapping line — '${line.trim()}'`);
      continue;
    }
    const [, , , raw] = kv;
    const value = raw.trim();
    if (value === '>' || value === '|' || value === '>-' || value === '|-') {
      inBlockScalar = true;
      continue;
    }
    // Unbalanced single or double quotes
    const sq = (value.match(/'/g) || []).length;
    const dq = (value.match(/"/g) || []).length;
    if (sq % 2 !== 0) issues.push(`line ${i + 1}: unbalanced single quote in value`);
    if (dq % 2 !== 0) issues.push(`line ${i + 1}: unbalanced double quote in value`);
  }
  return issues;
}

// ── Check A: Frontmatter YAML lint ───────────────────────────────────────────
console.log('\n[Check A] Frontmatter YAML lint');

const frontmatterTargets = new Set();
for (const s of skills) {
  if (s.skill_path) frontmatterTargets.add(s.skill_path);
  if (s.agent_path) frontmatterTargets.add(s.agent_path);
}
for (const rel of [...frontmatterTargets].sort()) {
  const abs = path.join(ROOT, rel);
  const content = readIfExists(abs);
  if (content == null) {
    fail('A', `${rel} — file missing on disk`);
    continue;
  }
  const issues = validateFrontmatter(content, rel);
  if (issues.length === 0) {
    pass('A', `${rel} frontmatter valid`);
  } else {
    for (const issue of issues) fail('A', `${rel} — ${issue}`);
  }
}

// ── Check B: Relative link resolution ────────────────────────────────────────
console.log('\n[Check B] Relative markdown link resolution');

const linkScanRoots = [
  path.join(ROOT, '.github'),
];
const standaloneMd = ['README.md', 'CONTRIBUTING.md', 'AGENTS.md', 'CLAUDE.md']
  .map(p => path.join(ROOT, p))
  .filter(fs.existsSync);

const mdFiles = [...standaloneMd];
for (const r of linkScanRoots) listMarkdownFiles(r, mdFiles);

// Strip code fences before scanning so that snippet examples don't trigger.
function stripCodeBlocks(s) {
  return s.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
}

const LINK_RE = /\[([^\]\n]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
let brokenLinks = 0;
let scannedLinks = 0;

for (const file of mdFiles) {
  const text = stripCodeBlocks(fs.readFileSync(file, 'utf8'));
  const dir = path.dirname(file);
  let m;
  while ((m = LINK_RE.exec(text)) !== null) {
    const target = m[2].trim();
    if (!target) continue;
    if (/^[a-z][a-z0-9+.\-]*:/i.test(target)) continue; // http://, mailto:, etc.
    if (target.startsWith('#')) continue;               // intra-doc anchor
    scannedLinks++;
    const [pathPart] = target.split('#');
    if (!pathPart) continue; // pure anchor after split
    const cleaned = pathPart.split('?')[0];
    const resolved = path.resolve(dir, cleaned);
    if (!fs.existsSync(resolved)) {
      fail('B', `${path.relative(ROOT, file)} → broken link "${target}"`);
      brokenLinks++;
    }
  }
}
if (brokenLinks === 0) {
  pass('B', `${scannedLinks} relative links resolved across ${mdFiles.length} files`);
}

// ── Check C: Required SKILL.md headings ──────────────────────────────────────
console.log('\n[Check C] Required SKILL.md headings (Role / Preflight / DoD)');

const ROLE_RE = /^##\s+Role\b/m;
const PREFLIGHT_RE = /^##\s+(Prerequisites \(Preflight\)|Preflight|Prerequisites)\b/m;
const DOD_RE = /^##\s+Definition of Done\b/m;

for (const skill of skills) {
  if (!skill.skill_path || !skill.skill_path.endsWith('SKILL.md')) continue;
  const abs = path.join(ROOT, skill.skill_path);
  const content = readIfExists(abs);
  if (content == null) {
    fail('C', `${skill.skill_path} — file missing on disk`);
    continue;
  }
  const advisory = !skill.outputs || skill.outputs.length === 0;
  // Phase-1 skills (no upstream depends_on) are exempt from the Preflight
  // requirement — they have no prior artefacts to depend on. They still must
  // declare Role and Definition of Done.
  const noUpstream = !Array.isArray(skill.depends_on) || skill.depends_on.length === 0;
  const preflightExempt = advisory || noUpstream;
  const dodExempt = advisory;
  const label = `[${skill.name}]`;
  if (!ROLE_RE.test(content)) {
    fail('C', `${label} ${skill.skill_path} — missing '## Role' heading`);
  }
  if (!preflightExempt && !PREFLIGHT_RE.test(content)) {
    fail('C', `${label} ${skill.skill_path} — missing '## Prerequisites (Preflight)' heading`);
  }
  if (!dodExempt && !DOD_RE.test(content)) {
    fail('C', `${label} ${skill.skill_path} — missing '## Definition of Done' heading`);
  }
  const rolePresent = ROLE_RE.test(content);
  const preflightOk = preflightExempt || PREFLIGHT_RE.test(content);
  const dodOk = dodExempt || DOD_RE.test(content);
  if (rolePresent && preflightOk && dodOk) {
    const note = [advisory && 'advisory', noUpstream && !advisory && 'phase-1 — no Preflight required'].filter(Boolean).join(', ');
    pass('C', `${label} headings present${note ? ` (${note})` : ''}`);
  }
}

// ── Check D: STANDARDS_OUTPUTS coverage ──────────────────────────────────────
console.log('\n[Check D] STANDARDS_OUTPUTS.md coverage of roster outputs');

const standardsPath = path.join(ROOT, '.github', 'skills', 'STANDARDS_OUTPUTS.md');
const standards = readIfExists(standardsPath);
if (standards == null) {
  fail('D', `.github/skills/STANDARDS_OUTPUTS.md not found`);
} else {
  // Normalise: keep the full file text. We'll search for the basename or
  // tail-segment of each output path. Doing literal full-path match is too
  // strict because the tree shows nested dirs without the
  // `ai-driven-development/` prefix on every line.
  for (const skill of skills) {
    if (!Array.isArray(skill.outputs) || skill.outputs.length === 0) continue;
    for (const out of skill.outputs) {
      // Match by the last 1-2 path segments — robust against the tree using
      // indentation rather than full paths.
      const tail = out.replace(/^ai-driven-development\//, '');
      const basename = path.basename(tail);
      const segment = path.basename(path.dirname(tail));
      const candidates = [tail, basename, `${segment}/${basename}`].filter(Boolean);
      const found = candidates.some(c => standards.includes(c));
      if (found) {
        pass('D', `[${skill.name}] '${tail}' present in STANDARDS_OUTPUTS.md`);
      } else {
        fail('D', `[${skill.name}] output '${out}' not referenced in STANDARDS_OUTPUTS.md`);
      }
    }
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('');
console.log(`ci-validate: Errors: ${errors} | Warnings: ${warnings}`);
if (errors === 0) {
  console.log('✓ All CI validation checks passed.');
  process.exit(0);
} else {
  console.error(`✗ ${errors} check(s) failed.`);
  process.exit(1);
}
