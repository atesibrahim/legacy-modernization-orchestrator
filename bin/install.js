#!/usr/bin/env node
// bin/install.js — Legacy Modernization Orchestrator installer
// Usage:
//   npx legacy-modernization-orchestrator               (interactive)
//   npx legacy-modernization-orchestrator --global      (global, all runtimes)
//   npx legacy-modernization-orchestrator --local       (current project)
//   npx legacy-modernization-orchestrator --claude      (Claude Code only)
//   npx legacy-modernization-orchestrator --codex       (Codex CLI only)
//   npx legacy-modernization-orchestrator --uninstall   (remove)

import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, '..');

// Stable directory name used to store the full skill/agent files globally
const INSTALL_DIRNAME = 'legacy-modernization-orchestrator';

const AGENTS = [
  'legacy-analysis',
  'legacy-architecture',
  'target-architecture',
  'ui-ux-design',
  'backend-development',
  'frontend-development',
  'ios-development',
  'android-development',
  'compare-legacy-to-new',
  'legacy-modernization-orchestrator',
  // Tech-stack specific backend skills
  'java-springboot',
  'dotnet-aspnetcore',
  'python-fastapi',
  'go-gin-fiber',
  // Optional phase skills
  'data-migration',
  'security-review',
  'devops-infra',
  'final-validation',
  // Cross-cutting reference skills
  'agent-governance',
  'quality-playbook',
];

const args = process.argv.slice(2);
const isUninstall = args.includes('--uninstall');
const isGlobal    = args.includes('--global') || args.includes('-g');
const isLocal     = args.includes('--local')  || args.includes('-l');
const claudeOnly  = args.includes('--claude');
const codexOnly   = args.includes('--codex');
const allRuntime  = args.includes('--all') || (!claudeOnly && !codexOnly);
const runtimes    = allRuntime ? ['claude', 'codex'] : (claudeOnly ? ['claude'] : ['codex']);

// ── helpers ──────────────────────────────────────────────────────────────────

function ask(rl, question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return 0;
  fs.mkdirSync(dest, { recursive: true });
  let count = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }
  return count;
}

function removeIfExists(p) {
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    return true;
  }
  return false;
}

/**
 * Copy a file, replacing all occurrences of relative `.github/skills/` and
 * `.github/agents/` paths with the absolute paths where those files are installed.
 */
function copyWithPatchedPaths(src, dest, skillsInstallDir, agentsInstallDir) {
  let content = fs.readFileSync(src, 'utf8');
  content = content.replaceAll('.github/skills/', skillsInstallDir + '/');
  content = content.replaceAll('.github/agents/', agentsInstallDir + '/');
  fs.writeFileSync(dest, content, 'utf8');
}

// ── resolve base dirs ─────────────────────────────────────────────────────────

function resolveBases(scope) {
  const claudeBase = process.env.CLAUDE_CONFIG_DIR
    ? process.env.CLAUDE_CONFIG_DIR
    : scope === 'global' ? path.join(os.homedir(), '.claude') : path.join(process.cwd(), '.claude');
  const codexBase = scope === 'global'
    ? path.join(os.homedir(), '.codex')
    : path.join(process.cwd(), '.codex');
  // Full skill and agent files are installed here so references always resolve
  const installBase      = scope === 'global'
    ? path.join(os.homedir(), '.claude', INSTALL_DIRNAME)
    : path.join(process.cwd(), '.github');
  const skillsInstallDir = scope === 'global' ? path.join(installBase, 'skills') : path.join(installBase, 'skills');
  const agentsInstallDir = scope === 'global' ? path.join(installBase, 'agents') : path.join(installBase, 'agents');
  return { claudeBase, codexBase, skillsInstallDir, agentsInstallDir };
}

// ── install ───────────────────────────────────────────────────────────────────

function install(scope, selectedRuntimes) {
  const { claudeBase, codexBase, skillsInstallDir, agentsInstallDir } = resolveBases(scope);

  console.log('');
  console.log('══════════════════════════════════════════════════════════');
  console.log('  Legacy Modernization Orchestrator — Installer');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  Scope  : ${scope === 'global' ? `global (${claudeBase})` : `local (${process.cwd()})`}`);
  console.log(`  Runtime: ${selectedRuntimes.join(', ')}`);
  console.log('══════════════════════════════════════════════════════════');
  console.log('');

  // ── Step 1: Copy .github/skills/ and .github/agents/ to stable install location
  console.log('▶ Installing skill definitions...');
  const ghSkillsSrc = path.join(PACKAGE_ROOT, '.github', 'skills');
  for (const agent of AGENTS) {
    const src  = path.join(ghSkillsSrc, agent);
    const dest = path.join(skillsInstallDir, agent);
    if (fs.existsSync(src)) { copyDir(src, dest); console.log(`  ✓ skills/${agent}`); }
  }
  console.log(`  → ${skillsInstallDir}`);

  console.log('');
  console.log('▶ Installing agent definitions...');
  const ghAgentsSrc = path.join(PACKAGE_ROOT, '.github', 'agents');
  for (const agent of AGENTS) {
    const src  = path.join(ghAgentsSrc, `${agent}.agent.md`);
    const dest = path.join(agentsInstallDir, `${agent}.agent.md`);
    if (fs.existsSync(src)) {
      fs.mkdirSync(agentsInstallDir, { recursive: true });
      fs.copyFileSync(src, dest);
      console.log(`  ✓ agents/${agent}.agent.md`);
    }
  }
  console.log(`  → ${agentsInstallDir}`);
  console.log('');

  // ── Step 2: Install per-runtime wrappers with patched absolute paths
  for (const runtime of selectedRuntimes) {
    if (runtime === 'claude') {
      console.log('▶ Installing Claude Code agents...');
      const agentSrc  = path.join(PACKAGE_ROOT, '.claude', 'agents');
      const agentDest = path.join(claudeBase, 'agents');
      fs.mkdirSync(agentDest, { recursive: true });
      for (const agent of AGENTS) {
        const src  = path.join(agentSrc, `${agent}.md`);
        const dest = path.join(agentDest, `${agent}.md`);
        if (fs.existsSync(src)) {
          copyWithPatchedPaths(src, dest, skillsInstallDir, agentsInstallDir);
          console.log(`  ✓ agent : ${agent}`);
        }
      }

      console.log('');
      console.log('▶ Installing Claude Code skills...');
      const skillSrc  = path.join(PACKAGE_ROOT, '.claude', 'skills');
      const skillDest = path.join(claudeBase, 'skills');
      for (const agent of AGENTS) {
        const src  = path.join(skillSrc, agent, 'SKILL.md');
        const dest = path.join(skillDest, agent, 'SKILL.md');
        if (fs.existsSync(src)) {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          copyWithPatchedPaths(src, dest, skillsInstallDir, agentsInstallDir);
          console.log(`  ✓ skill : ${agent}`);
        }
      }

      console.log('');
      console.log(`  Claude Code → ${claudeBase}`);
      console.log('  Usage: /legacy-analysis  or  @legacy-analysis');
    }

    if (runtime === 'codex') {
      console.log('▶ Installing Codex skills...');
      const skillSrc  = path.join(PACKAGE_ROOT, '.codex', 'skills');
      const skillDest = path.join(codexBase, 'skills');
      for (const agent of AGENTS) {
        const src  = path.join(skillSrc, agent, 'SKILL.md');
        const dest = path.join(skillDest, agent, 'SKILL.md');
        if (fs.existsSync(src)) {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          copyWithPatchedPaths(src, dest, skillsInstallDir, agentsInstallDir);
          console.log(`  ✓ skill : ${agent}`);
        }
      }

      console.log('');
      console.log(`  Codex CLI → ${codexBase}`);
      console.log('  Usage: $legacy-analysis');
    }

    console.log('');
  }

  console.log('══════════════════════════════════════════════════════════');
  console.log('  Installation complete!');
  console.log('══════════════════════════════════════════════════════════');
  console.log('');
}

// ── uninstall ─────────────────────────────────────────────────────────────────

function uninstall(scope, selectedRuntimes) {
  const { claudeBase, codexBase, skillsInstallDir, agentsInstallDir } = resolveBases(scope);

  console.log('');
  console.log('══════════════════════════════════════════════════════════');
  console.log('  Legacy Modernization Orchestrator — Uninstaller');
  console.log('══════════════════════════════════════════════════════════');
  console.log('');

  // Remove the full skill + agent definitions dir
  const installBase = path.dirname(skillsInstallDir);
  if (removeIfExists(installBase)) {
    console.log(`  ✓ removed definitions: ${installBase}`);
  }

  for (const runtime of selectedRuntimes) {
    if (runtime === 'claude') {
      console.log('▶ Removing Claude Code agents...');
      for (const agent of AGENTS) {
        const p = path.join(claudeBase, 'agents', `${agent}.md`);
        if (removeIfExists(p)) console.log(`  ✓ removed agent : ${agent}`);
      }
      console.log('▶ Removing Claude Code skills...');
      for (const agent of AGENTS) {
        const p = path.join(claudeBase, 'skills', agent);
        if (removeIfExists(p)) console.log(`  ✓ removed skill : ${agent}`);
      }
    }

    if (runtime === 'codex') {
      console.log('▶ Removing Codex skills...');
      for (const agent of AGENTS) {
        const p = path.join(codexBase, 'skills', agent);
        if (removeIfExists(p)) console.log(`  ✓ removed skill : ${agent}`);
      }
    }
    console.log('');
  }

  console.log('  Uninstall complete.');
  console.log('══════════════════════════════════════════════════════════');
  console.log('');
}

// ── interactive prompt ────────────────────────────────────────────────────────

async function interactive() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('');
  console.log('  Legacy Modernization Orchestrator');
  console.log('');

  const scopeAnswer = await ask(rl, '  Install where?\n  [1] Global — available in all projects (recommended)\n  [2] Local  — current project only\n  > ');
  const scope = scopeAnswer === '2' ? 'local' : 'global';

  const runtimeAnswer = await ask(rl, '\n  Install for which runtimes?\n  [1] All (Claude Code + Codex CLI) (recommended)\n  [2] Claude Code only\n  [3] Codex CLI only\n  > ');
  const selected = runtimeAnswer === '2' ? ['claude'] : runtimeAnswer === '3' ? ['codex'] : ['claude', 'codex'];

  rl.close();
  install(scope, selected);
}

// ── entry point ───────────────────────────────────────────────────────────────

const hasFlags = isGlobal || isLocal || claudeOnly || codexOnly || args.includes('--all');

if (isUninstall) {
  const scope = isLocal ? 'local' : 'global';
  uninstall(scope, runtimes);
} else if (hasFlags) {
  const scope = isLocal ? 'local' : 'global';
  install(scope, runtimes);
} else {
  interactive();
}
