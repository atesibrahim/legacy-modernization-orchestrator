#!/usr/bin/env node
/**
 * generate-dod.js — Extract DoD checkboxes from each SKILL.md and emit dod.json
 *
 * Usage:
 *   node scripts/generate-dod.js          # generate / overwrite all dod.json files
 *   node scripts/generate-dod.js --check  # verify dod.json exists and is valid (no write)
 *
 * Output per skill:  .github/skills/<name>/dod.json
 *
 * Schema per item:
 *   id          — <PREFIX>-NN  (e.g. LA-01)
 *   description — full text of the checkbox (without leading "- [ ] ")
 *   verifier    — "glob" | "cmd" | "manual"
 *   glob        — file glob pattern (only when verifier="glob")
 *   cmd         — shell command to run (only when verifier="cmd")
 *   note        — optional human hint for manual items
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CHECK_ONLY = process.argv.includes('--check');

// ── Skill ID prefix mapping ───────────────────────────────────────────────────
const PREFIX = {
  'legacy-analysis':                'LA',
  'legacy-architecture':            'LARCH',
  'tech-stack-selection':           'TSS',
  'target-architecture':            'TA',
  'ui-ux-design':                   'UX',
  'backend-development':            'BE',
  'frontend-development':           'FE',
  'ios-development':                'IOS',
  'android-development':            'AND',
  'data-migration':                 'DM',
  'security-review':                'SR',
  'devops-infra':                   'DI',
  'compare-legacy-to-new':          'CLN',
  'final-validation':               'FV',
  'java-springboot':                'JS',
  'dotnet-aspnetcore':              'DN',
  'python-fastapi':                 'PFA',
  'go-gin-fiber':                   'GGF',
  'quality-playbook':               'QP',
  'agent-governance':               'AG',
};

// ── Verifier classifier ───────────────────────────────────────────────────────
// Extracts a glob pattern from a description if a recognisable artifact path
// is present, otherwise returns null.
const ARTIFACT_GLOB_RE = /`(ai-driven-development\/[^`]+)`/;
const CMD_KEYWORDS = [
  /\bmvnw\b/, /\bgradle\b/, /\bdotnet\b/, /\bnpm run\b/, /\bpytest\b/,
  /\bruff\b/, /\bgo vet\b/, /\bgo test\b/, /\btrivy\b/, /\bdependency-check\b/,
  /\bvitest\b/, /\bplaywright\b/, /\bxctest\b/, /\bespresso\b/,
];

function classifyVerifier(description) {
  // Glob: description contains a backtick-quoted ai-driven-development path
  const globMatch = description.match(ARTIFACT_GLOB_RE);
  if (globMatch) {
    return { verifier: 'glob', glob: globMatch[1] };
  }

  // Glob: description just mentions a known artifact filename pattern
  if (/\.(md|html|json|sql|yaml|yml)\b/.test(description) &&
      /produc|generat|creat|output|exist|present/.test(description.toLowerCase())) {
    return { verifier: 'glob' };
  }

  // Cmd: description references a runnable tool / CLI
  if (CMD_KEYWORDS.some(re => re.test(description))) {
    return { verifier: 'cmd' };
  }

  return { verifier: 'manual' };
}

// ── Extract DoD items from a SKILL.md ─────────────────────────────────────────
function extractDodItems(content, skillName) {
  const prefix = PREFIX[skillName] || skillName.toUpperCase().replace(/-/g, '').slice(0, 4);
  const items = [];
  let inDod = false;
  let seq = 1;

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();

    // Enter DoD section
    if (/^##\s+Definition of Done/.test(line)) { inDod = true; continue; }

    // Exit DoD section at next H2 or horizontal rule (but not H3 subsections)
    if (inDod && /^##\s+/.test(line)) { break; }

    if (!inDod) continue;

    // Match "- [ ] ..." (checked or unchecked)
    const cbMatch = line.match(/^-\s+\[[x ]\]\s+(.+)/i);
    if (!cbMatch) continue;

    const description = cbMatch[1].trim();
    const classification = classifyVerifier(description);
    const id = `${prefix}-${String(seq).padStart(2, '0')}`;
    seq++;

    const item = { id, description, ...classification };
    items.push(item);
  }

  return items;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const skillsDir = path.join(ROOT, '.github', 'skills');
const skillNames = fs.readdirSync(skillsDir).filter(n =>
  fs.statSync(path.join(skillsDir, n)).isDirectory(),
);

let errors = 0;
let written = 0;
let skipped = 0;

for (const skillName of skillNames.sort()) {
  const skillMdPath = path.join(skillsDir, skillName, 'SKILL.md');
  const dodPath = path.join(skillsDir, skillName, 'dod.json');

  if (!fs.existsSync(skillMdPath)) continue;

  const content = fs.readFileSync(skillMdPath, 'utf8');
  const items = extractDodItems(content, skillName);

  if (CHECK_ONLY) {
    if (!fs.existsSync(dodPath)) {
      console.error(`  FAIL  dod.json missing: .github/skills/${skillName}/dod.json`);
      errors++;
    } else {
      let parsed;
      try { parsed = JSON.parse(fs.readFileSync(dodPath, 'utf8')); }
      catch (e) {
        console.error(`  FAIL  dod.json invalid JSON: .github/skills/${skillName}/dod.json — ${e.message}`);
        errors++;
        continue;
      }
      if (!Array.isArray(parsed.items)) {
        console.error(`  FAIL  dod.json missing 'items' array: .github/skills/${skillName}/dod.json`);
        errors++;
      } else {
        for (const item of parsed.items) {
          if (!item.id || !item.description || !item.verifier) {
            console.error(`  FAIL  dod.json item missing id/description/verifier in .github/skills/${skillName}/dod.json`);
            errors++;
            break;
          }
          if (!['glob', 'cmd', 'manual'].includes(item.verifier)) {
            console.error(`  FAIL  dod.json item '${item.id}' has invalid verifier '${item.verifier}'`);
            errors++;
          }
        }
        console.log(`  OK    .github/skills/${skillName}/dod.json (${parsed.items.length} items)`);
      }
    }
    continue;
  }

  // Write mode
  const dodContent = {
    skill: skillName,
    version: '1.0.0',
    generated_from: `SKILL.md — run 'node scripts/generate-dod.js' to regenerate`,
    items,
  };

  fs.writeFileSync(dodPath, JSON.stringify(dodContent, null, 2) + '\n');
  console.log(`  wrote  .github/skills/${skillName}/dod.json (${items.length} items)`);
  written++;
}

console.log('');
if (CHECK_ONLY) {
  if (errors === 0) {
    console.log(`✓ All dod.json files valid.`);
    process.exit(0);
  } else {
    console.error(`✗ ${errors} dod.json check(s) failed.`);
    process.exit(1);
  }
} else {
  console.log(`✓ Done. ${written} dod.json files written, ${skipped} skipped.`);
}
