// Guard: keep loader strictly out of client/browser bundles
if (typeof window !== 'undefined') {
  throw new Error('EPL snapshot loader is server-only and cannot be imported or executed in browser bundles.');
}

import fs from 'fs';
import path from 'path';
import type { EplSnapshotV1 } from './types';

export const SUPPORTED_SCHEMA_VERSION = '1.0.0';

export type SnapshotLoadStatus = 'ready' | 'unavailable' | 'demo_rejected' | 'error';

export interface EplSnapshotResult {
  snapshot: EplSnapshotV1 | null;
  status: SnapshotLoadStatus;
  isStale: boolean;
  isDemo: boolean;
  error?: string;
}

export interface LoadEplSnapshotOptions {
  allowDemo?: boolean; // Requires explicit opt-in to load demo snapshot
  customPath?: string;
  maxAgeHours?: number;
}

const DEFAULT_STALE_THRESHOLD_HOURS = 48;

/**
 * Checks whether the snapshot is older than the configured threshold (default 48 hours).
 */
export function isSnapshotStale(snapshot: EplSnapshotV1, maxAgeHours: number = DEFAULT_STALE_THRESHOLD_HOURS): boolean {
  if (!snapshot.fetchedAt) {
    return true;
  }
  const fetchedTime = new Date(snapshot.fetchedAt).getTime();
  if (isNaN(fetchedTime)) {
    return true;
  }
  const ageMs = Date.now() - fetchedTime;
  return ageMs > maxAgeHours * 60 * 60 * 1000;
}

/**
 * Resolves candidate file paths for real or demo snapshot files.
 * Stored strictly outside frontend/public/.
 */
function resolveSnapshotFilePath(isDemoTarget: boolean, customPath?: string): string | null {
  if (customPath && fs.existsSync(customPath)) {
    return path.resolve(customPath);
  }

  const fileName = isDemoTarget ? 'demo-snapshot.json' : 'snapshot.json';
  const envVar = isDemoTarget ? process.env.EPL_DEMO_SNAPSHOT_PATH : process.env.EPL_SNAPSHOT_PATH;

  if (envVar && fs.existsSync(envVar)) {
    return path.resolve(envVar);
  }

  const candidatePaths = [
    path.resolve(process.cwd(), `data/snapshots/epl/${fileName}`),
    path.resolve(process.cwd(), `../data/snapshots/epl/${fileName}`),
    path.resolve(process.cwd(), `../../data/snapshots/epl/${fileName}`),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(/*turbopackIgnore: true*/ p)) {
      return p;
    }
  }

  return null;
}

/**
 * Validates a snapshot object against the contract requirements.
 * Every normal read requires:
 * 1. Exact supported schema version ("1.0.0")
 * 2. provenance: "provider"
 * 3. isDemo: false
 */
function validateSnapshot(
  parsed: any,
  allowDemo: boolean
): { valid: boolean; status: SnapshotLoadStatus; error?: string } {
  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, status: 'error', error: 'Snapshot data is not an object.' };
  }

  // 1. Exact schema version check
  if (parsed.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    return {
      valid: false,
      status: 'error',
      error: `Unsupported schema version: ${parsed.schemaVersion || 'none'}. Expected exact version ${SUPPORTED_SCHEMA_VERSION}.`,
    };
  }

  const isDemo = parsed.isDemo === true || parsed.provenance === 'fixture-demo';

  // 2. Normal read gate: require exact schema version, provenance: "provider", and isDemo: false
  if (!allowDemo) {
    if (isDemo) {
      return {
        valid: false,
        status: 'demo_rejected',
        error: 'Demo snapshot detected. Normal routes reject demo data without explicit opt-in.',
      };
    }
    if (parsed.provenance !== 'provider' || parsed.isDemo !== false) {
      return {
        valid: false,
        status: 'error',
        error: `Invalid provenance or demo flag for normal read. Expected provenance "provider" and isDemo false, got provenance "${parsed.provenance}" and isDemo ${parsed.isDemo}.`,
      };
    }
  }

  // 3. Required domain structure check
  if (!parsed.competition || !parsed.teams || !parsed.matches || !parsed.standings) {
    return {
      valid: false,
      status: 'error',
      error: 'Snapshot payload is missing required domain fields (competition, teams, matches, standings).',
    };
  }

  return { valid: true, status: 'ready' };
}

/**
 * Server-only snapshot loader with Gate checks:
 * 1. Normal routes (allowDemo: false) strictly require:
 *    - exact supported schemaVersion ("1.0.0")
 *    - provenance: "provider"
 *    - isDemo: false
 *    Applies to both standard paths and custom paths.
 * 2. Explicit opt-in (allowDemo: true) required to load demo snapshot.
 * 3. Never leaks server filesystem paths.
 */
export function loadEplSnapshot(options?: LoadEplSnapshotOptions): EplSnapshotResult {
  const allowDemo = options?.allowDemo === true;

  // 1. If customPath was supplied, check it directly
  if (options?.customPath) {
    if (!fs.existsSync(options.customPath)) {
      return {
        snapshot: null,
        status: 'unavailable',
        isStale: false,
        isDemo: false,
        error: 'Specified snapshot file not found.',
      };
    }
    try {
      const raw = fs.readFileSync(options.customPath, 'utf-8');
      const parsed = JSON.parse(raw) as EplSnapshotV1;

      const validation = validateSnapshot(parsed, allowDemo);
      if (!validation.valid) {
        return {
          snapshot: null,
          status: validation.status,
          isStale: false,
          isDemo: false,
          error: validation.error,
        };
      }

      const isStale = isSnapshotStale(parsed, options?.maxAgeHours);
      return {
        snapshot: parsed,
        status: 'ready',
        isStale,
        isDemo: parsed.isDemo === true,
      };
    } catch {
      return {
        snapshot: null,
        status: 'error',
        isStale: false,
        isDemo: false,
        error: 'Failed to read or parse snapshot.',
      };
    }
  }

  // 2. Normal resolution for real snapshot path
  const realPath = resolveSnapshotFilePath(false);

  if (realPath) {
    try {
      const raw = fs.readFileSync(/*turbopackIgnore: true*/ realPath, 'utf-8');
      const parsed = JSON.parse(raw) as EplSnapshotV1;

      const validation = validateSnapshot(parsed, allowDemo);
      if (!validation.valid) {
        return {
          snapshot: null,
          status: validation.status,
          isStale: false,
          isDemo: false,
          error: validation.error,
        };
      }

      return {
        snapshot: parsed,
        status: 'ready',
        isStale: isSnapshotStale(parsed, options?.maxAgeHours),
        isDemo: parsed.isDemo === true,
      };
    } catch {
      // Real file corrupted or unparseable, fall through
    }
  }

  // 3. If real snapshot is missing or rejected:
  // If demo is explicitly opted-in, try loading demo snapshot
  if (allowDemo) {
    const demoPath = resolveSnapshotFilePath(true);
    if (demoPath) {
      try {
        const raw = fs.readFileSync(/*turbopackIgnore: true*/ demoPath, 'utf-8');
        const parsed = JSON.parse(raw) as EplSnapshotV1;
        const validation = validateSnapshot(parsed, true);
        if (validation.valid) {
          return {
            snapshot: parsed,
            status: 'ready',
            isStale: isSnapshotStale(parsed, options?.maxAgeHours),
            isDemo: true,
          };
        }
      } catch {
        // Fall through
      }
    }
  }

  // 4. Missing real snapshot -> unavailable
  return {
    snapshot: null,
    status: 'unavailable',
    isStale: false,
    isDemo: false,
    error: 'Premier League live snapshot is unavailable. Live provider data has not been imported.',
  };
}
