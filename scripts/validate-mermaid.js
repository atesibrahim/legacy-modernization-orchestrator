#!/usr/bin/env node
/**
 * validate-mermaid.js — Validate Mermaid diagrams embedded in HTML output files.
 *
 * Usage:
 *   node scripts/validate-mermaid.js           # validate all HTML files
 *   node scripts/validate-mermaid.js --fix     # validate and auto-fix common issues
 *   node scripts/validate-mermaid.js --dir <path>  # scan a specific directory
 *
 * Exit codes:
 *   0 — all diagrams valid (or no diagrams found)
 *   1 — validation errors found
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const fixMode = process.argv.includes('--fix');
const dirArgIdx = process.argv.indexOf('--dir');
const scanDir = dirArgIdx !== -1 ? path.resolve(process.argv[dirArgIdx + 1]) : path.join(ROOT, 'ai-driven-development');

const VALID_DIAGRAM_TYPES = new Set([
  'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
  'stateDiagram-v2', 'erDiagram', 'gantt', 'pie', 'gitGraph', 'journey',
  'mindmap', 'timeline', 'quadrantChart', 'requirementDiagram', 'C4Context',
  'C4Container', 'C4Component', 'C4Dynamic', 'C4Deployment', 'block-beta',
  'architecture-beta', 'xychart-beta', 'sankey-beta', 'packet-beta'
]);

function collectHtmlFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectHtmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

function extractMermaidBlocks(html) {
  const blocks = [];
  // Match <div class="mermaid">...</div>
  const divRe = /<div[^>]*class=["'][^"']*\bmermaid\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi;
  let m;
  while ((m = divRe.exec(html)) !== null) {
    const startLine = html.slice(0, m.index).split('\n').length;
    blocks.push({ code: m[1].trim(), startLine, raw: m[0], index: m.index });
  }
  // Match ```mermaid ... ``` inside <pre><code> or raw
  const fenceRe = /```mermaid\s*\n([\s\S]*?)```/gi;
  while ((m = fenceRe.exec(html)) !== null) {
    const startLine = html.slice(0, m.index).split('\n').length;
    blocks.push({ code: m[1].trim(), startLine, raw: m[0], index: m.index });
  }
  return blocks;
}

function validateMermaid(code, startLine, filePath) {
  const errors = [];
  const lines = code.split('\n');
  if (lines.length === 0 || code.trim() === '') {
    errors.push({ line: startLine, message: 'Empty diagram' });
    return errors;
  }

  const firstLine = lines[0].trim();
  const diagramType = firstLine.split(/[\s({[]/)[0];

  if (!VALID_DIAGRAM_TYPES.has(diagramType)) {
    errors.push({
      line: startLine,
      message: `Unknown diagram type: "${diagramType}". Valid types: ${[...VALID_DIAGRAM_TYPES].join(', ')}`
    });
    return errors;
  }

  // Check bracket balance
  let braces = 0, brackets = 0, parens = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip comment lines
    if (line.trim().startsWith('%%')) continue;
    for (const ch of line) {
      if (ch === '{') braces++; else if (ch === '}') braces--;
      if (ch === '[') brackets++; else if (ch === ']') brackets--;
      if (ch === '(') parens++; else if (ch === ')') parens--;
    }
    if (braces < 0) {
      errors.push({ line: startLine + i, message: 'Unexpected closing brace `}`' });
      braces = 0;
    }
    if (brackets < 0) {
      errors.push({ line: startLine + i, message: 'Unexpected closing bracket `]`' });
      brackets = 0;
    }
    if (parens < 0) {
      errors.push({ line: startLine + i, message: 'Unexpected closing parenthesis `)`' });
      parens = 0;
    }
  }
  if (braces !== 0) errors.push({ line: startLine + lines.length - 1, message: `Unbalanced braces (delta: ${braces})` });
  if (brackets !== 0) errors.push({ line: startLine + lines.length - 1, message: `Unbalanced brackets (delta: ${brackets})` });
  if (parens !== 0) errors.push({ line: startLine + lines.length - 1, message: `Unbalanced parentheses (delta: ${parens})` });

  // Flowchart/graph: check for invalid arrow syntax
  if (diagramType === 'graph' || diagramType === 'flowchart') {
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (/[^-<>]->(?!>)[^>]/.test(line)) {
        errors.push({ line: startLine + i, message: `Possible invalid arrow "->" — use "-->" or "---" in flowcharts (line: "${line.trim()}")` });
      }
    }
  }

  // sequenceDiagram: check for common mistakes
  if (diagramType === 'sequenceDiagram') {
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('loop') && !lines.slice(i).some(l => l.trim() === 'end')) {
        errors.push({ line: startLine + i, message: 'loop block missing "end"' });
      }
      if (line.startsWith('alt') && !lines.slice(i).some(l => l.trim() === 'end')) {
        errors.push({ line: startLine + i, message: 'alt block missing "end"' });
      }
    }
  }

  return errors;
}

function autoFix(code) {
  let fixed = code;
  // Fix single arrow -> to --> in flowchart/graph (but not ==> or --)
  fixed = fixed.replace(/([^-<>])->([\s[({])/g, '$1-->$2');
  // Remove trailing commas after node IDs in graph definitions: A[label], --> becomes A[label] -->
  fixed = fixed.replace(/(\]|\))\s*,(\s*-->)/g, '$1$2');
  // Trim trailing whitespace per line
  fixed = fixed.split('\n').map(l => l.trimEnd()).join('\n');
  return fixed;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const blocks = extractMermaidBlocks(content);
  const fileErrors = [];

  if (blocks.length === 0) return { filePath, blocks: 0, errors: [] };

  let modified = false;
  for (const block of blocks) {
    const errors = validateMermaid(block.code, block.startLine, filePath);
    if (errors.length > 0) {
      fileErrors.push(...errors.map(e => ({ ...e, filePath })));

      if (fixMode) {
        const fixedCode = autoFix(block.code);
        if (fixedCode !== block.code) {
          const fixedRaw = block.raw.replace(block.code, fixedCode);
          content = content.slice(0, block.index) + fixedRaw + content.slice(block.index + block.raw.length);
          modified = true;
        }
      }
    }
  }

  if (fixMode && modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  return { filePath, blocks: blocks.length, errors: fileErrors };
}

// ── Main ──────────────────────────────────────────────────────────────────────

const htmlFiles = collectHtmlFiles(scanDir);

if (htmlFiles.length === 0) {
  console.log(`ℹ  No HTML files found under ${path.relative(ROOT, scanDir) || scanDir}`);
  process.exit(0);
}

let totalDiagrams = 0;
let totalErrors = 0;

for (const file of htmlFiles) {
  const result = processFile(file);
  totalDiagrams += result.blocks;
  totalErrors += result.errors.length;

  if (result.errors.length > 0) {
    console.error(`\n❌  ${path.relative(ROOT, result.filePath)}`);
    for (const err of result.errors) {
      console.error(`   Line ${err.line}: ${err.message}`);
    }
    if (fixMode) {
      console.log(`   🔧 Auto-fix applied`);
    }
  }
}

console.log(`\n${totalErrors === 0 ? '✅' : '❌'}  Scanned ${htmlFiles.length} HTML file(s), ${totalDiagrams} diagram(s) — ${totalErrors} error(s) found.`);
if (totalErrors > 0 && !fixMode) {
  console.log('   Run with --fix to attempt automatic fixes.');
}
process.exit(totalErrors > 0 ? 1 : 0);
