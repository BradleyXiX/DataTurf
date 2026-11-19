import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { DemoBanner } from '@/components/studio/DemoBanner';
import { UnavailableState } from '@/components/studio/UnavailableState';
import { StudioNav } from '@/components/studio/StudioNav';
import { CompareLauncher } from '@/components/studio/CompareLauncher';
import { loadEplSnapshot } from '@/lib/epl/loader';
import { compareClubs, type VenueFilter } from '@/lib/epl/metrics';
import type { EplMatch, EplTeam, MetricResult, TeamMetrics } from '@/lib/epl/types';

import { VenueLinkStatus } from './VenueLinkStatus';
import styles from './compare.module.css';

interface ComparePageProps {
  searchParams?: Promise<{
    left?: string | string[];
    right?: string | string[];
    venue?: string | string[];
    demo?: string | string[];
  }>;
}

const venues = [
  { id: 'all', label: 'All Matches', sample: 'All venues' },
  { id: 'home', label: 'Home Only', sample: 'Home matches' },
  { id: 'away', label: 'Away Only', sample: 'Away matches' },
] as const;

const benchmarks = [
  { key: 'pointsPerGame', name: 'Points per match', definition: '(3W + D) / completed', decimals: 2 },
  { key: 'goalsScoredPerMatch', name: 'Goals scored / match', definition: 'Total scored / completed', decimals: 2 },
  { key: 'goalsConcededPerMatch', name: 'Goals conceded / match', definition: 'Total conceded / completed', decimals: 2 },
  { key: 'cleanSheets', name: 'Clean sheets', definition: 'Zero goals conceded', decimals: 0 },
] as const;

function matchCount(count: number) {
  return `${count} ${count === 1 ? 'match' : 'matches'}`;
}

function ClubHeading({ club, side, clubSuffix }: {
  club: TeamMetrics;
  side: 'A' | 'B';
  clubSuffix: string;
}) {
  return (
    <th scope="col" className={side === 'A' ? styles.clubA : styles.clubB}>
      <span className={styles.clubLabel}>Club {side} <span aria-hidden="true">/</span> {club.team.tla}</span>
      <Link className={styles.clubName} href={`/club/${club.team.id}${clubSuffix}`}>
        {club.team.name}
      </Link>
      <span className={styles.sample}>{matchCount(club.completedMatches.length)} in sample</span>
      {club.standing && (
        <span className={styles.standing}>League #{club.standing.position} · {club.standing.points} pts</span>
      )}
    </th>
  );
}

function BenchmarkValue({ metric, decimals, edge }: {
  metric: MetricResult<number>;
  decimals: number;
  edge?: string;
}) {
  const value = metric.available ? metric.value?.toFixed(decimals) : undefined;
  return (
    <td>
      <span className={value === undefined ? styles.missing : styles.metricValue}>
        {value ?? 'Unavailable'}
      </span>
      {edge && <span className={styles.edge}>{edge}</span>}
      <span className={styles.sample}>{matchCount(metric.denominator)}</span>
    </td>
  );
}

function MatchLedger({ title, matches, teams, clubSuffix, focusTeamId, open }: {
  title: string;
  matches: EplMatch[];
  teams: Record<string, EplTeam>;
  clubSuffix: string;
  focusTeamId?: string;
  open?: boolean;
}) {
  const orderedMatches = [...matches].sort(
    (a, b) => b.kickoffUtc.localeCompare(a.kickoffUtc) || a.id.localeCompare(b.id)
  );

  return (
    <details className={styles.ledger} open={open}>
      <summary>
        <span>{title}</span>
        <span className={styles.ledgerCount}>
          {matches.length}<ChevronDown size={15} aria-hidden="true" />
        </span>
      </summary>
      {orderedMatches.length === 0 ? (
        <p className={styles.empty}>
          {focusTeamId ? 'No completed matches for this venue.' : 'No head-to-head fixtures in this snapshot.'}
        </p>
      ) : (
        <ol className={styles.matchList}>
          {orderedMatches.map((match) => {
            const { homeTeamId, awayTeamId, score: { home, away }, status } = match;
            const hasScore = status === 'COMPLETED' && home !== null && away !== null;
            const result = focusTeamId && hasScore
              ? Math.sign((home - away) * (focusTeamId === homeTeamId ? 1 : -1))
              : null;
            const scoreLabel = hasScore ? `${home} – ${away}` : status === 'COMPLETED' ? 'Score unavailable' : status.toLowerCase();
            const outcome = result === null ? null : result > 0 ? 'Win' : result < 0 ? 'Loss' : 'Draw';
            const date = match.kickoffUtc.slice(0, 10);
            return (
              <li key={match.id}>
                <div className={styles.matchMeta}>
                  {date ? <time dateTime={match.kickoffUtc}>{date}</time> : 'Date TBD'}
                  <span>Matchday {match.matchday}</span>
                  {outcome && <abbr title={outcome} aria-label={outcome}>{outcome[0]}</abbr>}
                </div>
                <div className={styles.matchResult}>
                  <Link href={`/club/${homeTeamId}${clubSuffix}`}>
                    {teams[homeTeamId]?.shortName || homeTeamId}
                  </Link>
                  <span className={styles.score}>
                    {scoreLabel}
                  </span>
                  <Link href={`/club/${awayTeamId}${clubSuffix}`}>
                    {teams[awayTeamId]?.shortName || awayTeamId}
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </details>
  );
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const resolvedParams = await searchParams;
  const allowDemo = resolvedParams?.demo === 'true';
  const leftId = typeof resolvedParams?.left === 'string' && resolvedParams.left ? resolvedParams.left : 'liverpool';
  const rightId = typeof resolvedParams?.right === 'string' && resolvedParams.right ? resolvedParams.right : 'arsenal';
  const venue: VenueFilter = resolvedParams?.venue === 'home' || resolvedParams?.venue === 'away' ? resolvedParams.venue : 'all';
  const { snapshot, status, isDemo, error } = loadEplSnapshot({ allowDemo });

  const pair = new URLSearchParams({ season: '2024', left: leftId, right: rightId });
  const comparisonUrl = `/compare?${pair}&venue=`;
  const demoUrl = `${comparisonUrl}${venue}&demo=true`;
  const isReady = snapshot && status === 'ready';
  const sameTeam = leftId === rightId;
  const hasBothTeams = isReady && Object.hasOwn(snapshot.teams, leftId) && Object.hasOwn(snapshot.teams, rightId);
  const comparison = isReady && hasBothTeams && !sameTeam ? compareClubs(snapshot, leftId, rightId, venue) : null;
  const importedAt = snapshot?.fetchedAt ? new Date(snapshot.fetchedAt) : null;
  const validImportTime = importedAt !== null && Number.isFinite(importedAt.getTime());
  const venueLabel = venues.find(({ id }) => id === venue)?.sample ?? 'All venues';
  const clubSuffix = isDemo ? '?demo=true' : '';

  return (
    <main className={styles.desk}>
      {isReady && isDemo && <div className={styles.demo}><DemoBanner currentPath={demoUrl} /></div>}
      <div className={styles.nav}>
        <StudioNav
          currentRoute="compare"
          isDemo={isReady ? isDemo : allowDemo}
          seasonLabel={isReady ? snapshot.season.label : undefined}
          sourceAttribution={isReady ? snapshot.attribution : undefined}
        />
      </div>

      <div className={styles.shell}>
        <div className={styles.intro}>
          <div>
            <p className={styles.kicker}>{isReady ? snapshot.competition.name : 'Premier League'}</p>
            <h1>Club comparison</h1>
            {comparison && <p className={styles.vs}>{comparison.left.team.shortName} <span>vs</span> {comparison.right.team.shortName}</p>}
          </div>
          {isReady && <p className={styles.season}>Season <strong>{snapshot.season.label}</strong></p>}
        </div>

        {!isReady ? (
          <div className={styles.unavailable}>
            <UnavailableState
              reason={error || 'Premier League snapshot is unavailable for comparison.'}
              demoUrl={demoUrl}
            />
          </div>
        ) : (
          <>
            <section className={styles.filters} aria-labelledby="comparison-filters">
              <h2 id="comparison-filters">Build a matchup</h2>
              <CompareLauncher
                teams={Object.values(snapshot.teams)}
                isDemo={isDemo}
                initialLeftId={leftId}
                initialRightId={rightId}
                initialVenue={venue}
                followAppliedFilters
              />
            </section>

            {comparison ? (
              <div className={styles.workspace}>
                <section className={styles.benchmarks} aria-labelledby="benchmarks">
                  <div className={styles.sectionHead}>
                    <div>
                      <h2 id="benchmarks">Shared benchmarks</h2>
                      <p>Completed matches · {venueLabel}</p>
                    </div>
                    <a className={styles.jump} href="#match-evidence">
                      Match evidence <ArrowDownRight size={15} aria-hidden="true" />
                    </a>
                  </div>
                  <div className={styles.venues} role="group" aria-label="Filter comparison by venue">
                    {venues.map(({ id, label }) => (
                      <Link
                        key={id}
                        href={`${comparisonUrl}${id}${isDemo ? '&demo=true' : ''}`}
                        aria-current={venue === id ? 'true' : undefined}
                        scroll={false}
                      >
                        {label}
                        <VenueLinkStatus />
                      </Link>
                    ))}
                  </div>
                  <table className={styles.table} aria-labelledby="benchmarks">
                    <colgroup><col /><col /><col /></colgroup>
                    <thead>
                      <tr>
                        <th scope="col" className={styles.metricHeading}>Metric</th>
                        <ClubHeading club={comparison.left} side="A" clubSuffix={clubSuffix} />
                        <ClubHeading club={comparison.right} side="B" clubSuffix={clubSuffix} />
                      </tr>
                    </thead>
                    <tbody>
                      {benchmarks.map(({ key, name, definition, decimals }) => {
                        const left = comparison.left[key];
                        const right = comparison.right[key];
                        const edge = key === 'goalsConcededPerMatch' ? 'Fewer conceded' : 'Ahead';
                        const difference = left.available && right.available && left.value !== null && right.value !== null
                          ? (left.value - right.value) * (key === 'goalsConcededPerMatch' ? -1 : 1)
                          : 0;
                        return (
                          <tr key={key}>
                            <th scope="row">
                              {name}
                              <span className={styles.definition}>{definition}</span>
                            </th>
                            <BenchmarkValue metric={left} decimals={decimals} edge={difference > 0 ? edge : undefined} />
                            <BenchmarkValue metric={right} decimals={decimals} edge={difference < 0 ? edge : undefined} />
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </section>

                <section className={styles.evidence} aria-labelledby="match-evidence">
                  <div className={styles.sectionHead}>
                    <div>
                      <h2 id="match-evidence" tabIndex={-1}>Match evidence</h2>
                      <p>Club samples <span aria-hidden="true">·</span> {venueLabel}</p>
                    </div>
                  </div>
                  <MatchLedger
                    key={comparison.left.team.id + '-a'}
                    title={`Club A · ${comparison.left.team.shortName}`}
                    matches={comparison.left.completedMatches}
                    teams={snapshot.teams}
                    focusTeamId={comparison.left.team.id}
                    clubSuffix={clubSuffix}
                    open
                  />
                  <MatchLedger
                    key={comparison.right.team.id + '-b'}
                    title={`Club B · ${comparison.right.team.shortName}`}
                    matches={comparison.right.completedMatches}
                    teams={snapshot.teams}
                    focusTeamId={comparison.right.team.id}
                    clubSuffix={clubSuffix}
                  />
                  <MatchLedger
                    title="Head-to-head · all venues"
                    matches={comparison.headToHead}
                    teams={snapshot.teams}
                    clubSuffix={clubSuffix}
                  />
                </section>
              </div>
            ) : (
              <p className={styles.selectionError} role="status">
                {sameTeam
                  ? 'Select two distinct clubs. Side-by-side comparison requires two different teams.'
                  : 'Select two clubs above to launch the side-by-side comparison.'}
              </p>
            )}

            <footer className={styles.provenance}>
              <Link href={`/${clubSuffix}`}>League table <ArrowUpRight size={14} aria-hidden="true" /></Link>
              <span>{snapshot.attribution}</span>
              <span>
                {validImportTime ? <>Imported <time dateTime={importedAt.toISOString()}>{importedAt.toUTCString()}</time></> : 'Import time unavailable'}
                {validImportTime && comparison?.isStale && ' · Snapshot over 48 hours old'}
              </span>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
