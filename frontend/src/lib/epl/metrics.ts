/**
 * Pure deterministic metrics calculations for Premier League Analysis
 * Formulas follow dataturf-gemini-playbook.md:
 * - Points per game: (3W + D) / completed matches
 * - Goals per match: total goals / completed matches
 * - Uses completed matches only
 * - Form/last five: sorted by actual match date with stable ID tiebreaker
 * - Returns unavailable (null value, available=false) when completed matches = 0
 */

import type { EplMatch, EplSnapshotV1, EplTeam, MetricResult, TeamComparison, TeamMetrics } from './types';

export type VenueFilter = 'all' | 'home' | 'away';

/**
 * Filter matches for a specific team, respecting venue and completion status.
 */
export function getTeamMatches(
  matches: EplMatch[],
  teamId: string,
  venue: VenueFilter = 'all',
  completedOnly: boolean = true
): EplMatch[] {
  return matches.filter((m) => {
    if (completedOnly && m.status !== 'COMPLETED') {
      return false;
    }
    if (venue === 'home') {
      return m.homeTeamId === teamId;
    }
    if (venue === 'away') {
      return m.awayTeamId === teamId;
    }
    return m.homeTeamId === teamId || m.awayTeamId === teamId;
  });
}

/**
 * Computes points per game: (3W + D) / completedMatches.
 * Strictly uses completed matches only.
 */
export function computePointsPerGame(
  matches: EplMatch[],
  teamId: string,
  venue: VenueFilter = 'all'
): MetricResult<number> {
  const completed = getTeamMatches(matches, teamId, venue, true);
  const denominator = completed.length;

  if (denominator === 0) {
    return {
      value: null,
      denominator: 0,
      label: 'Points per game',
      available: false,
    };
  }

  let points = 0;
  for (const m of completed) {
    const isHome = m.homeTeamId === teamId;
    const teamGoals = isHome ? m.score.home : m.score.away;
    const oppGoals = isHome ? m.score.away : m.score.home;

    if (teamGoals === null || oppGoals === null) {
      continue;
    }

    if (teamGoals > oppGoals) {
      points += 3;
    } else if (teamGoals === oppGoals) {
      points += 1;
    }
  }

  const ppg = points / denominator;
  return {
    value: Number(ppg.toFixed(2)),
    denominator,
    label: 'Points per game',
    available: true,
  };
}

/**
 * Computes goals scored per match: total goals scored / completedMatches.
 */
export function computeGoalsPerMatch(
  matches: EplMatch[],
  teamId: string,
  venue: VenueFilter = 'all'
): MetricResult<number> {
  const completed = getTeamMatches(matches, teamId, venue, true);
  const denominator = completed.length;

  if (denominator === 0) {
    return {
      value: null,
      denominator: 0,
      label: 'Goals scored per game',
      available: false,
    };
  }

  let totalGoals = 0;
  for (const m of completed) {
    const isHome = m.homeTeamId === teamId;
    const teamGoals = isHome ? m.score.home : m.score.away;
    if (teamGoals !== null && typeof teamGoals === 'number') {
      totalGoals += teamGoals;
    }
  }

  const gpm = totalGoals / denominator;
  return {
    value: Number(gpm.toFixed(2)),
    denominator,
    label: 'Goals scored per game',
    available: true,
  };
}

/**
 * Computes goals conceded per match: total goals conceded / completedMatches.
 */
export function computeGoalsConcededPerMatch(
  matches: EplMatch[],
  teamId: string,
  venue: VenueFilter = 'all'
): MetricResult<number> {
  const completed = getTeamMatches(matches, teamId, venue, true);
  const denominator = completed.length;

  if (denominator === 0) {
    return {
      value: null,
      denominator: 0,
      label: 'Goals conceded per game',
      available: false,
    };
  }

  let totalConceded = 0;
  for (const m of completed) {
    const isHome = m.homeTeamId === teamId;
    const oppGoals = isHome ? m.score.away : m.score.home;
    if (oppGoals !== null && typeof oppGoals === 'number') {
      totalConceded += oppGoals;
    }
  }

  const gcpm = totalConceded / denominator;
  return {
    value: Number(gcpm.toFixed(2)),
    denominator,
    label: 'Goals conceded per game',
    available: true,
  };
}

/**
 * Computes clean sheets count and rate among completed matches.
 */
export function computeCleanSheets(
  matches: EplMatch[],
  teamId: string,
  venue: VenueFilter = 'all'
): MetricResult<number> {
  const completed = getTeamMatches(matches, teamId, venue, true);
  const denominator = completed.length;

  if (denominator === 0) {
    return {
      value: null,
      denominator: 0,
      label: 'Clean sheets',
      available: false,
    };
  }

  let count = 0;
  for (const m of completed) {
    const isHome = m.homeTeamId === teamId;
    const oppGoals = isHome ? m.score.away : m.score.home;
    if (oppGoals === 0) {
      count += 1;
    }
  }

  return {
    value: count,
    denominator,
    label: 'Clean sheets',
    available: true,
  };
}

/**
 * Retrieves up to five most recent completed matches, sorted chronologically descending
 * with a deterministic match ID tiebreaker.
 */
export function getLastFiveMatches(matches: EplMatch[], teamId: string): EplMatch[] {
  const completed = getTeamMatches(matches, teamId, 'all', true);

  const sorted = [...completed].sort((a, b) => {
    if (b.kickoffUtc !== a.kickoffUtc) {
      return b.kickoffUtc.localeCompare(a.kickoffUtc);
    }
    return b.id.localeCompare(a.id);
  });

  return sorted.slice(0, 5);
}

/**
 * Computes full metric suite for a specific team.
 */
export function getTeamMetrics(
  snapshot: EplSnapshotV1,
  teamId: string,
  venue: VenueFilter = 'all'
): TeamMetrics | null {
  const team = snapshot.teams[teamId];
  if (!team) {
    return null;
  }

  const standing = snapshot.standings.find((s) => s.teamId === teamId) || null;
  const completed = getTeamMatches(snapshot.matches, teamId, venue, true);

  return {
    team,
    standing,
    pointsPerGame: computePointsPerGame(snapshot.matches, teamId, venue),
    goalsScoredPerMatch: computeGoalsPerMatch(snapshot.matches, teamId, venue),
    goalsConcededPerMatch: computeGoalsConcededPerMatch(snapshot.matches, teamId, venue),
    cleanSheets: computeCleanSheets(snapshot.matches, teamId, venue),
    lastFiveMatches: getLastFiveMatches(snapshot.matches, teamId),
    completedMatches: completed,
  };
}

/**
 * Compare two distinct clubs side-by-side using the validated snapshot.
 */
export function compareClubs(
  snapshot: EplSnapshotV1,
  leftTeamId: string,
  rightTeamId: string,
  venue: VenueFilter = 'all'
): TeamComparison | null {
  if (leftTeamId === rightTeamId) {
    return null;
  }

  const leftMetrics = getTeamMetrics(snapshot, leftTeamId, venue);
  const rightMetrics = getTeamMetrics(snapshot, rightTeamId, venue);

  if (!leftMetrics || !rightMetrics) {
    return null;
  }

  // Head to head matches between these two teams
  const headToHead = snapshot.matches.filter(
    (m) =>
      (m.homeTeamId === leftTeamId && m.awayTeamId === rightTeamId) ||
      (m.homeTeamId === rightTeamId && m.awayTeamId === leftTeamId)
  );

  const fetchedTime = new Date(snapshot.fetchedAt).getTime();
  const isStale = Date.now() - fetchedTime > 48 * 60 * 60 * 1000;

  return {
    seasonLabel: snapshot.season.label,
    venueFilter: venue,
    left: leftMetrics,
    right: rightMetrics,
    headToHead,
    sourceAttribution: snapshot.attribution,
    fetchedAt: snapshot.fetchedAt,
    isStale,
  };
}
