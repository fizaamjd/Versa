import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');
const baseline = JSON.parse(fs.readFileSync(path.join(root, 'eslint-baseline.json'), 'utf8')).issues;
const result = spawnSync(process.execPath, [path.join(root, 'node_modules/eslint/bin/eslint.js'), '.', '--format', 'json'], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
if (result.error || result.status > 1) throw result.error || new Error(result.stderr || 'ESLint execution failed');
const files = JSON.parse(result.stdout);
const counts = {};
let errors = 0, warnings = 0;
for (const file of files) {
  errors += file.errorCount; warnings += file.warningCount;
  for (const finding of file.messages) {
    if (finding.fatal) throw new Error(`${file.filePath}: ${finding.message}`);
    const key = `${path.relative(root, file.filePath).replaceAll(path.sep, '/')}|${finding.ruleId}|${finding.severity}`;
    counts[key] = (counts[key] || 0) + 1;
  }
}
const regressions = Object.entries(counts).filter(([key, count]) => count > (baseline[key] || 0));
if (regressions.length) {
  console.error('New lint violations:', regressions);
  process.exit(1);
}
console.log(`No lint regressions. Tracked legacy debt: ${errors} errors and ${warnings} warnings. Raw npm run lint remains strict.`);
