#!/usr/bin/env node
/**
 * check-adr-prompts.js — Scan skill file changes for decision-language keywords
 * and prompt the author to consider filing an ADR.
 *
 * Usage:
 *   node scripts/check-adr-prompts.js              # scan git-staged changes (pre-commit mode)
 *   node scripts/check-adr-prompts.js --all        # scan all .github/skills/**\/*.md files
 *   node scripts/check-adr-prompts.js --pr         # scan HEAD vs main (CI/PR mode)
 *   node scripts/check-adr-prompts.js --file <f>   # scan a single file
 *
 * Exit code: always 0 — this is advisory only and never blocks a commit or CI run.
 * Findings are printed as prompts; the author decides whether an ADR is warranted.
 *
 * Install as a git pre-commit hook:
 *   echo 'node scripts/check-adr-prompts.js' >> .git/hooks/pre-commit
 *   chmod +x .git/hooks/pre-commit
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Decision-language patterns ────────────────────────────────────────────────
// Each entry: { label, pattern }
// pattern is tested against individual diff/file lines (case-insensitive).
// Patterns are tuned to fire on deliberate-choice language, not neutral prose.
const PATTERNS = [
  { label: 'choice verb',      pattern: /\b(chose|we choose|choosing between|we selected|we picked)\b/i },
  { label: 'decided / decide', pattern: /\b(decided|we decided|decision was|decision is)\b/i },
  { label: 'adopted',          pattern: /\b(adopted|we adopt|adopting)\b/i },
  { label: 'prefer / preferred', pattern: /\b(preferred over|we prefer|preferred approach)\b/i },
  { label: 'instead of',       pattern: /\binstead of\b/i },
  { label: 'rather than',      pattern: /\brather than\b/i },
  { label: 'over (X over Y)',  pattern: /\b\w[\w\s]{0,20}\s+over\s+\w[\w\s]{0,20}\b/i },
  { label: 'going with',       pattern: /\bgoing with\b/i },
  { label: 'use X not Y',      pattern: /\buse\s+\S+.*?\bnot\b|\bnever use\b|\bavoid\b.*\buse\b/i },
  { label: 'selected/chosen',  pattern: /\b(selected|chosen) (because|as|for|to|over|since)\b/i },
];

// Only scan these file extensions within .github/skills/
const SKILL_FILE_GLOB = /\.github[/\\]skills[/\\].+\.(md)$/;

// Lines to skip: code fences, table separators, list markers without prose
const SKIP_LINE_RE = /^(\s*```|\s*\|[-|]+\||\s*[-*+]\s*$|^\s*$)/;

// ── Helpers ───────────────────────────────────────────────────────────────────
function matchLine(line) {
  if (SKIP_LINE_RE.test(line)) return [];
  return PATTERNS.filter(p => p.pattern.test(line)).map(p => p.label);
}

function scanLines(lines, filePath) {
  const hits = [];
  lines.forEach((line, i) => {
    const labels = matchLine(line);
    if (labels.length) hits.push({ lineNo: i + 1, line: line.trim(), labels });
  });
  return hits;
}

function scanFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  return scanLines(lines, filePath);
}

function getStagedSkillFiles() {
  try {
    const out = execSync('git diff --cached --name-only', { cwd: ROOT, encoding: 'utf8' });
    return out.trim().split('\n').filter(f => SKILL_FILE_GLOB.test(f));
  } catch { return []; }
}

function getPrSkillFiles() {
  try {
    // Compare HEAD against merge-base with main/master
    const base = execSync('git merge-base HEAD origin/main 2>/dev/null || git merge-base HEAD origin/master 2>/dev/null || echo HEAD~1', {
      cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    const out = execSync(`git diff --name-only ${base} HEAD`, { cwd: ROOT, encoding: 'utf8' });
    return out.trim().split('\n').filter(f => SKILL_FILE_GLOB.test(f));
  } catch { return []; }
}

function getAllSkillFiles() {
  const skillsDir = path.join(ROOT, '.github', 'skills');
  const files = [];
  for (const skill of fs.readdirSync(skillsDir)) {
    const dir = path.join(skillsDir, skill);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith('.md')) files.push(path.join('.github', 'skills', skill, file));
    }
  }
  return files;
}

// ── Argument parsing ──────────────────────────────────────────────────────────
const args = process.argv.slice(2);
let mode = 'staged';
let singleFile = null;

if (args.includes('--all'))       mode = 'all';
else if (args.includes('--pr'))   mode = 'pr';
else if (args.includes('--file')) { mode = 'file'; singleFile = args[args.indexOf('--file') + 1]; }

let filesToScan = [];
if (mode === 'staged')     filesToScan = getStagedSkillFiles();
else if (mode === 'pr')    filesToScan = getPrSkillFiles();
else if (mode === 'all')   filesToScan = getAllSkillFiles();
else if (mode === 'file')  filesToScan = singleFile ? [singleFile] : [];

// ── Scan ──────────────────────────────────────────────────────────────────────
const allFindings = [];

for (const relPath of filesToScan) {
  const absPath = path.join(ROOT, relPath);
  const hits = scanFile(absPath);
  if (hits.length) allFindings.push({ file: relPath, hits });
}

// ── Report ────────────────────────────────────────────────────────────────────
if (allFindings.length === 0) {
  if (mode !== 'staged' || filesToScan.length > 0) {
    console.log('✓ No ADR-trigger language detected in changed skill files.');
  }
  process.exit(0);
}

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  ADR PROMPT — Decision-language detected in skill file(s)   ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');
console.log('The lines below contain language that often signals an architectural');
console.log('decision. Consider whether an ADR should document this choice.');
console.log('ADR template: .github/standards/core.md §2');
console.log('ADR location: ai-driven-development/docs/adr/ADR-{NNN}-{title}.md');
console.log('');

for (const { file, hits } of allFindings) {
  console.log(`  FILE: ${file}`);
  for (const { lineNo, line, labels } of hits) {
    const tag = labels.join(', ');
    const preview = line.length > 100 ? line.slice(0, 97) + '...' : line;
    console.log(`    L${String(lineNo).padEnd(5)} [${tag}]`);
    console.log(`           ${preview}`);
  }
  console.log('');
}

console.log('This check is advisory — no action required if the change is not');
console.log('a new architectural decision (e.g. just clarifying existing text).');
console.log('');

// Always exit 0 — advisory only, never blocks commit or CI
process.exit(0);
