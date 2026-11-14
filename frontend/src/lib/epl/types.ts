/**
 * DataTurf Premier League Snapshot v1 Contract & Domain Types
 */

export type MatchStatus = 'COMPLETED' | 'SCHEDULED' | 'POSTPONED' | 'CANCELLED' | 'UNKNOWN';

export interface Score {
  home: number | null;
  away: number | null;
  halfTime?: {
    home: number | null;
    away: number | null;
  };
}

export interface EplMatch {
  id: string; // e.g. "PL-2024-M1001"
  providerMatchId: number;
  matchday: number;
  kickoffUtc: string; // ISO 8601 UTC
  status: MatchStatus;
  homeTeamId: string; // stable slug e.g. "arsenal"
  awayTeamId: string; // stable slug e.g. "chelsea"
  score: Score;
}

export interface EplTeam {
  id: string; // stable slug e.g. "arsenal"
  providerTeamId: number;
  name: string; // "Arsenal FC"
  shortName: string; // "Arsenal"
  tla: string; // "ARS"
  crestUrl: string | null;
}

export interface EplStandingRow {
  position: number;
  teamId: string;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form: string | null;
}

export interface EplCoverage {
  windowStart: string | null;
  windowEnd: string | null;
  totalMatches: number;
  completedMatches: number;
  scheduledMatches: number;
  postponedMatches: number;
  cancelledMatches: number;
  unknownMatches: number;
}

export interface EplSnapshotV1 {
  schemaVersion: string; // "1.0.0"
  provenance: 'provider' | 'fixture-demo';
  isDemo: boolean;
  competition: {
    id: string;
    name: string;
    code: string;
  };
  season: {
    startYear: number;
    endYear: number;
    label: string; // "2024/2025"
  };
  source: string; // "football-data.org"
  attribution: string; // "Data provided by football-data.org"
  fetchedAt: string; // ISO 8601 UTC
  sourceUpdatedAt: string | null;
  coverage: EplCoverage;
  teams: Record<string, EplTeam>;
  standings: EplStandingRow[];
  matches: EplMatch[];
}

export interface MetricResult<T> {
  value: T | null;
  denominator: number;
  label: string;
  available: boolean;
}

export interface TeamMetrics {
  team: EplTeam;
  standing: EplStandingRow | null;
  pointsPerGame: MetricResult<number>;
  goalsScoredPerMatch: MetricResult<number>;
  goalsConcededPerMatch: MetricResult<number>;
  cleanSheets: MetricResult<number>;
  lastFiveMatches: EplMatch[];
  completedMatches: EplMatch[];
}

export interface TeamComparison {
  seasonLabel: string;
  venueFilter: 'all' | 'home' | 'away';
  left: TeamMetrics;
  right: TeamMetrics;
  headToHead: EplMatch[];
  sourceAttribution: string;
  fetchedAt: string;
  isStale: boolean;
}
