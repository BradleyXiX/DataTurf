import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const apiKey = (process.env.FOOTBALL_DATA_API_KEY || process.env.X_AUTH_TOKEN || '').trim();

if (!apiKey) {
  console.log('[generate-snapshot] Notice: FOOTBALL_DATA_API_KEY not configured in build environment.');
  console.log('[generate-snapshot] Skipping live Premier League snapshot generation.');
  console.log('[generate-snapshot] Normal routes will render unavailable state; explicit demo mode (?demo=true) remains available.');
  process.exit(0);
}

console.log('[generate-snapshot] FOOTBALL_DATA_API_KEY detected. Starting 2026–27 snapshot generation...');

const cwd = process.cwd();
const isFrontendCwd = fs.existsSync(path.join(cwd, 'src/lib/epl'));
const frontendDir = isFrontendCwd ? cwd : path.join(cwd, 'frontend');
const repoRootDir = isFrontendCwd ? path.resolve(cwd, '..') : cwd;

const importerPath = path.resolve(repoRootDir, 'data-ingestion/snapshot_importer.py');
if (!fs.existsSync(importerPath)) {
  console.error(`[generate-snapshot] Error: Importer script not found at ${importerPath}`);
  process.exit(1);
}

const frontendSnapshotPath = path.resolve(frontendDir, 'data/snapshots/epl/snapshot.json');
const rootSnapshotPath = path.resolve(repoRootDir, 'data/snapshots/epl/snapshot.json');

// Ensure demo snapshot is also mirrored to frontend/data/snapshots/epl if present at repo root
const rootDemoPath = path.resolve(repoRootDir, 'data/snapshots/epl/demo-snapshot.json');
const frontendDemoPath = path.resolve(frontendDir, 'data/snapshots/epl/demo-snapshot.json');
if (fs.existsSync(rootDemoPath) && !fs.existsSync(frontendDemoPath)) {
  fs.mkdirSync(path.dirname(frontendDemoPath), { recursive: true });
  fs.copyFileSync(rootDemoPath, frontendDemoPath);
}

// Reuse freshly generated snapshot if generated in the last 60 seconds (prevents double API fetch in prebuild + build)
if (fs.existsSync(frontendSnapshotPath)) {
  const stat = fs.statSync(frontendSnapshotPath);
  const ageSeconds = (Date.now() - stat.mtimeMs) / 1000;
  if (ageSeconds < 60) {
    console.log(`[generate-snapshot] Validated snapshot generated ${Math.round(ageSeconds)}s ago in this build run. Reusing existing snapshot.`);
    if (!fs.existsSync(rootSnapshotPath)) {
      fs.mkdirSync(path.dirname(rootSnapshotPath), { recursive: true });
      fs.copyFileSync(frontendSnapshotPath, rootSnapshotPath);
    }
    process.exit(0);
  }
}

function getPythonCommand() {
  const candidates = ['python3', 'python', 'py'];
  for (const cmd of candidates) {
    try {
      const res = spawnSync(cmd, ['--version'], { stdio: 'pipe', encoding: 'utf-8' });
      if (res.status === 0) {
        return cmd;
      }
    } catch {
      // try next
    }
  }
  return null;
}

const pythonCmd = getPythonCommand();
if (!pythonCmd) {
  console.error('[generate-snapshot] Error: Python 3 executable not found on PATH. Ensure Python is available in build environment.');
  process.exit(1);
}

console.log(`[generate-snapshot] Executing ${pythonCmd} ${importerPath} --season 2026 --output ${frontendSnapshotPath}`);

const run = spawnSync(
  pythonCmd,
  [importerPath, '--season', '2026', '--output', frontendSnapshotPath],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      FOOTBALL_DATA_API_KEY: apiKey,
    },
  }
);

if (run.status !== 0) {
  console.error(`[generate-snapshot] Importer exited with code ${run.status}`);
  process.exit(run.status || 1);
}

if (!fs.existsSync(frontendSnapshotPath)) {
  console.error(`[generate-snapshot] Error: Output file was not created at ${frontendSnapshotPath}`);
  process.exit(1);
}

try {
  const raw = fs.readFileSync(frontendSnapshotPath, 'utf-8');
  const data = JSON.parse(raw);
  if (data.schemaVersion !== '1.0.0' || data.provenance !== 'provider' || data.isDemo !== false) {
    console.error('[generate-snapshot] Error: Generated snapshot failed contract validation.');
    process.exit(1);
  }

  // Atomically mirror to repo root snapshot path
  fs.mkdirSync(path.dirname(rootSnapshotPath), { recursive: true });
  fs.copyFileSync(frontendSnapshotPath, rootSnapshotPath);

  console.log('[generate-snapshot] Validated 2026–27 snapshot generated successfully:');
  console.log(`  - Competition: ${data.competition?.name || 'Premier League'}`);
  console.log(`  - Season: ${data.season}`);
  console.log(`  - Provenance: ${data.provenance} (isDemo: ${data.isDemo})`);
  console.log(`  - Teams count: ${data.teams?.length || 0}`);
  console.log(`  - Matches count: ${data.matches?.length || 0}`);
  console.log(`  - Output paths:`);
  console.log(`    ${frontendSnapshotPath}`);
  console.log(`    ${rootSnapshotPath}`);
} catch (err) {
  console.error(`[generate-snapshot] Validation error: ${err.message}`);
  process.exit(1);
}
