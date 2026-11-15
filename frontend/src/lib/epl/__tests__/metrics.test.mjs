import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';

import {
  computePointsPerGame,
  computeGoalsPerMatch,
  computeGoalsConcededPerMatch,
  computeCleanSheets,
  getLastFiveMatches,
  getTeamMetrics,
  compareClubs,
} from '../metrics.ts';

import { loadEplSnapshot, isSnapshotStale, SUPPORTED_SCHEMA_VERSION } from '../loader.ts';

const isFrontendDir = fs.existsSync(path.resolve(process.cwd(), 'src/lib/epl'));
const SNAPSHOTS_BASE_DIR = isFrontendDir
  ? (fs.existsSync(path.resolve(process.cwd(), 'data/snapshots/epl/demo-snapshot.json'))
      ? path.resolve(process.cwd(), 'data/snapshots/epl')
      : path.resolve(process.cwd(), '../data/snapshots/epl'))
  : path.resolve(process.cwd(), 'data/snapshots/epl');

const DEMO_SNAPSHOT_PATH = path.resolve(SNAPSHOTS_BASE_DIR, 'demo-snapshot.json');
const REAL_SNAPSHOT_PATH = path.resolve(SNAPSHOTS_BASE_DIR, 'snapshot.json');
const SCRATCH_DIR = path.resolve(SNAPSHOTS_BASE_DIR, 'scratch-tests');

test('EPL Snapshot Loader, Gate Verification & Metrics Suite', async (t) => {
  // Setup scratch test directory for temporary test fixtures
  if (!fs.existsSync(SCRATCH_DIR)) {
    fs.mkdirSync(SCRATCH_DIR, { recursive: true });
  }

  t.after(() => {
    if (fs.existsSync(SCRATCH_DIR)) {
      fs.rmSync(SCRATCH_DIR, { recursive: true, force: true });
    }
  });

  await t.test('1. Gate Check: Normal loader rejects demo data and missing real snapshot yields unavailable', () => {
    // Ensure real snapshot does NOT exist
    if (fs.existsSync(REAL_SNAPSHOT_PATH)) {
      fs.unlinkSync(REAL_SNAPSHOT_PATH);
    }

    // Normal loader call without allowDemo
    const normalResult = loadEplSnapshot();
    assert.equal(normalResult.snapshot, null);
    assert.equal(normalResult.status, 'unavailable');
    assert.equal(normalResult.isDemo, false);
    // Security check: no internal filesystem path leaked
    assert.equal('sourcePath' in normalResult, false);
  });

  await t.test('2. Gate Check: Reject demo data even if placed at the real snapshot path', () => {
    fs.copyFileSync(DEMO_SNAPSHOT_PATH, REAL_SNAPSHOT_PATH);
    try {
      // Normal route load without explicit allowDemo must REJECT it
      const result = loadEplSnapshot({ allowDemo: false });
      assert.equal(result.snapshot, null);
      assert.equal(result.status, 'demo_rejected');
      assert.match(result.error || '', /Demo snapshot detected|Demo data detected/);
    } finally {
      fs.unlinkSync(REAL_SNAPSHOT_PATH);
    }
  });

  await t.test('3. Regression: Older fixture snapshot without provenance is rejected on normal reads (customPath)', () => {
    const rawDemo = JSON.parse(fs.readFileSync(DEMO_SNAPSHOT_PATH, 'utf-8'));
    // Create older fixture copy lacking provenance field
    const legacyFixture = { ...rawDemo };
    delete legacyFixture.provenance;
    legacyFixture.isDemo = false; // Even if claiming isDemo: false, missing provenance must be rejected

    const legacyPath = path.join(SCRATCH_DIR, 'legacy-no-provenance.json');
    fs.writeFileSync(legacyPath, JSON.stringify(legacyFixture, null, 2));

    // Normal read via customPath must reject it
    const result = loadEplSnapshot({ customPath: legacyPath, allowDemo: false });
    assert.equal(result.snapshot, null);
    assert.equal(result.status, 'error');
    assert.match(result.error || '', /Invalid provenance or demo flag for normal read/);
  });

  await t.test('4. Regression: Older fixture snapshot without provenance placed at real path is rejected on normal route', () => {
    const rawDemo = JSON.parse(fs.readFileSync(DEMO_SNAPSHOT_PATH, 'utf-8'));
    const legacyFixture = { ...rawDemo };
    delete legacyFixture.provenance;
    delete legacyFixture.isDemo; // Older fixture without provenance or isDemo field

    fs.writeFileSync(REAL_SNAPSHOT_PATH, JSON.stringify(legacyFixture, null, 2));
    try {
      const result = loadEplSnapshot({ allowDemo: false });
      assert.equal(result.snapshot, null);
      assert.equal(result.status, 'error');
      assert.match(result.error || '', /Invalid provenance or demo flag for normal read/);
    } finally {
      fs.unlinkSync(REAL_SNAPSHOT_PATH);
    }
  });

  await t.test('5. Regression: Snapshot with mismatched schemaVersion is rejected on normal reads', () => {
    const rawDemo = JSON.parse(fs.readFileSync(DEMO_SNAPSHOT_PATH, 'utf-8'));
    const wrongVersionSnapshot = {
      ...rawDemo,
      schemaVersion: '0.9.0',
      provenance: 'provider',
      isDemo: false,
    };

    const wrongVersionPath = path.join(SCRATCH_DIR, 'wrong-version.json');
    fs.writeFileSync(wrongVersionPath, JSON.stringify(wrongVersionSnapshot, null, 2));

    const result = loadEplSnapshot({ customPath: wrongVersionPath, allowDemo: false });
    assert.equal(result.snapshot, null);
    assert.equal(result.status, 'error');
    assert.match(result.error || '', /Unsupported schema version: 0\.9\.0/);
  });

  await t.test('6. Regression: Demo snapshot is rejected on normal reads when passed via customPath', () => {
    const result = loadEplSnapshot({ customPath: DEMO_SNAPSHOT_PATH, allowDemo: false });
    assert.equal(result.snapshot, null);
    assert.equal(result.status, 'demo_rejected');
    assert.match(result.error || '', /Demo snapshot detected/);
  });

  await t.test('7. Gate Check: Explicit opt-in (allowDemo: true) loads demo snapshot with explicit provenance', () => {
    assert.ok(fs.existsSync(DEMO_SNAPSHOT_PATH), `Demo snapshot must exist at ${DEMO_SNAPSHOT_PATH}`);

    const result = loadEplSnapshot({ allowDemo: true });
    assert.ok(result.snapshot, `Failed to load demo snapshot: ${result.error}`);
    assert.equal(result.status, 'ready');
    assert.equal(result.isDemo, true);
    assert.equal(result.snapshot.provenance, 'fixture-demo');
    assert.equal(result.snapshot.source, 'fixture-demo');
    assert.equal(result.snapshot.schemaVersion, SUPPORTED_SCHEMA_VERSION);
    assert.equal(result.snapshot.competition.code, 'PL');
    // Ensure no filesystem path leaked
    assert.equal('sourcePath' in result, false);
  });

  await t.test('8. Normal route succeeds when snapshot has exact schemaVersion 1.0.0, provenance "provider", and isDemo false', () => {
    const rawDemo = JSON.parse(fs.readFileSync(DEMO_SNAPSHOT_PATH, 'utf-8'));
    const validProviderSnapshot = {
      ...rawDemo,
      schemaVersion: '1.0.0',
      provenance: 'provider',
      isDemo: false,
      source: 'football-data.org',
      attribution: 'Data provided by football-data.org',
    };

    const providerPath = path.join(SCRATCH_DIR, 'valid-provider.json');
    fs.writeFileSync(providerPath, JSON.stringify(validProviderSnapshot, null, 2));

    const result = loadEplSnapshot({ customPath: providerPath, allowDemo: false });
    assert.ok(result.snapshot);
    assert.equal(result.status, 'ready');
    assert.equal(result.isDemo, false);
    assert.equal(result.snapshot.provenance, 'provider');
    assert.equal(result.snapshot.schemaVersion, '1.0.0');
  });

  await t.test('9. Server-only boundary verification: client-side import guard and component isolation', () => {
    const srcDir = isFrontendDir ? path.resolve(process.cwd(), 'src') : path.resolve(process.cwd(), 'frontend/src');
    // 9a. Verify client-side import guard: if typeof window !== 'undefined', loader code execution throws
    const loaderCode = fs.readFileSync(path.join(srcDir, 'lib/epl/loader.ts'), 'utf-8');
    assert.match(loaderCode, /if\s*\(typeof window !== 'undefined'\)\s*\{\s*throw new Error/);

    // 9b. Verify no client component imports loader.ts
    const studioComponentsDir = path.join(srcDir, 'components/studio');
    const componentFiles = fs.readdirSync(studioComponentsDir);
    for (const file of componentFiles) {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(path.join(studioComponentsDir, file), 'utf-8');
        assert.equal(
          content.includes('loader'),
          false,
          `Client component ${file} must not import or reference loader.ts`
        );
        assert.equal(
          content.includes("from 'fs'") || content.includes('from "fs"'),
          false,
          `Component ${file} must not import Node fs`
        );
      }
    }
  });

  await t.test('10. computePointsPerGame accurately calculates PPG from completed matches only', () => {
    const { snapshot } = loadEplSnapshot({ allowDemo: true });
    assert.ok(snapshot);

    // Arsenal: 2 completed matches, 4 points -> 4/2 = 2.0 PPG
    const arsenalPpg = computePointsPerGame(snapshot.matches, 'arsenal');
    assert.equal(arsenalPpg.available, true);
    assert.equal(arsenalPpg.denominator, 2);
    assert.equal(arsenalPpg.value, 2.0);

    // Liverpool: 2 completed matches, 6 points -> 6/2 = 3.0 PPG
    const livPpg = computePointsPerGame(snapshot.matches, 'liverpool');
    assert.equal(livPpg.available, true);
    assert.equal(livPpg.denominator, 2);
    assert.equal(livPpg.value, 3.0);

    // Team with 0 completed matches returns available=false and null value
    const emptyPpg = computePointsPerGame([], 'arsenal');
    assert.equal(emptyPpg.available, false);
    assert.equal(emptyPpg.value, null);
    assert.equal(emptyPpg.denominator, 0);
  });

  await t.test('11. computeGoalsPerMatch computes total goals / completed matches', () => {
    const { snapshot } = loadEplSnapshot({ allowDemo: true });
    assert.ok(snapshot);

    // Liverpool: 5 goals in 2 matches = 2.5 GPM
    const livGpm = computeGoalsPerMatch(snapshot.matches, 'liverpool');
    assert.equal(livGpm.available, true);
    assert.equal(livGpm.denominator, 2);
    assert.equal(livGpm.value, 2.5);

    // Chelsea: 0 goals in 2 matches = 0.0 GPM
    const cheGpm = computeGoalsPerMatch(snapshot.matches, 'chelsea');
    assert.equal(cheGpm.available, true);
    assert.equal(cheGpm.denominator, 2);
    assert.equal(cheGpm.value, 0.0);
  });

  await t.test('12. computeGoalsConcededPerMatch and cleanSheets', () => {
    const { snapshot } = loadEplSnapshot({ allowDemo: true });
    assert.ok(snapshot);

    const arsConceded = computeGoalsConcededPerMatch(snapshot.matches, 'arsenal');
    assert.equal(arsConceded.value, 0.0);
    assert.equal(arsConceded.denominator, 2);

    const arsCleanSheets = computeCleanSheets(snapshot.matches, 'arsenal');
    assert.equal(arsCleanSheets.value, 2);
    assert.equal(arsCleanSheets.denominator, 2);
  });

  await t.test('13. getLastFiveMatches sorts chronologically descending with ID tiebreaker', () => {
    const { snapshot } = loadEplSnapshot({ allowDemo: true });
    assert.ok(snapshot);

    const lastMatches = getLastFiveMatches(snapshot.matches, 'arsenal');
    assert.equal(lastMatches.length, 2);
    assert.ok(lastMatches[0].kickoffUtc >= lastMatches[1].kickoffUtc);
    assert.equal(lastMatches[0].homeTeamId, 'man-city');
    assert.equal(lastMatches[1].homeTeamId, 'arsenal');
  });

  await t.test('14. compareClubs provides side-by-side rates, denominators, and head-to-head', () => {
    const { snapshot } = loadEplSnapshot({ allowDemo: true });
    assert.ok(snapshot);

    // Valid comparison
    const comparison = compareClubs(snapshot, 'arsenal', 'chelsea');
    assert.ok(comparison);
    assert.equal(comparison.left.team.name, 'Arsenal FC');
    assert.equal(comparison.right.team.name, 'Chelsea FC');
    assert.equal(comparison.headToHead.length, 1);
    assert.equal(comparison.headToHead[0].homeTeamId, 'arsenal');
    assert.equal(comparison.headToHead[0].awayTeamId, 'chelsea');

    // Identical IDs rejected
    const invalidComp = compareClubs(snapshot, 'arsenal', 'arsenal');
    assert.equal(invalidComp, null);
  });

  await t.test('15. Stale detection works properly based on 48-hour threshold', () => {
    const nowIso = new Date().toISOString();
    const freshSnapshot = { fetchedAt: nowIso };
    assert.equal(isSnapshotStale(freshSnapshot, 48), false);

    const oldDate = new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString();
    const staleSnapshot = { fetchedAt: oldDate };
    assert.equal(isSnapshotStale(staleSnapshot, 48), true);
  });
});
