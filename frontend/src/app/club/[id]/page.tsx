import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { DemoBanner } from '@/components/studio/DemoBanner';
import { StudioNav } from '@/components/studio/StudioNav';
import { UnavailableState } from '@/components/studio/UnavailableState';
import { VenueLinkStatus } from '@/components/studio/VenueLinkStatus';
import { loadEplSnapshot } from '@/lib/epl/loader';
import { getTeamMetrics, type VenueFilter } from '@/lib/epl/metrics';
import type { EplMatch, EplTeam } from '@/lib/epl/types';
import styles from './club.module.css';

interface ClubPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    demo?: string | string[];
    venue?: string | string[];
    opponent?: string | string[];
    side?: string | string[];
  }>;
}

const venues = [
  { value: 'all', label: 'All matches', description: 'All venues' },
  { value: 'home', label: 'Home only', description: 'Home matches' },
  { value: 'away', label: 'Away only', description: 'Away matches' },
] as const;

const performance = [
  { key: 'pointsPerGame', label: 'Points per match', decimals: 2 },
  { key: 'goalsScoredPerMatch', label: 'Goals scored per match', decimals: 2 },
  { key: 'goalsConcededPerMatch', label: 'Goals conceded per match', decimals: 2 },
  { key: 'cleanSheets', label: 'Clean sheets', decimals: 0 },
] as const;

const fixtureDate = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' });

function routed(path: string, query: Record<string, string>) {
  const search = new URLSearchParams(query);
  return search.size ? `${path}?${search}` : path;
}

function clubPath(id: string) {
  return `/club/${encodeURIComponent(id)}`;
}

function fixtureDetails(match: EplMatch, clubId: string, teams: Record<string, EplTeam>) {
  const atHome = match.homeTeamId === clubId;
  const opponentId = atHome ? match.awayTeamId : match.homeTeamId;
  const opponent = Object.hasOwn(teams, opponentId) ? teams[opponentId] : undefined;
  const scored = atHome ? match.score.home : match.score.away;
  const conceded = atHome ? match.score.away : match.score.home;
  const scoreKnown = scored !== null && conceded !== null;
  const outcome = scoreKnown ? (scored === conceded ? 'Draw' : scored > conceded ? 'Win' : 'Loss') : null;

  return {
    opponentId,
    opponent,
    atHome,
    score: scoreKnown ? `${scored}–${conceded}` : 'Unavailable',
    outcome,
  };
}

export default async function ClubPage({ params, searchParams }: ClubPageProps) {
  const [{ id: clubId }, query] = await Promise.all([params, searchParams]);
  const allowDemo = query?.demo === 'true';
  const venue: VenueFilter = query?.venue === 'home' || query?.venue === 'away' ? query.venue : 'all';
  const venueLabel = venues.find(({ value }) => value === venue)?.description;
  const { snapshot, status, isDemo, error } = loadEplSnapshot({ allowDemo });
  const ready = snapshot !== null && status === 'ready';
  const team = ready && Object.hasOwn(snapshot.teams, clubId) ? snapshot.teams[clubId] : null;
  const metrics = ready && team ? getTeamMetrics(snapshot, team.id, venue) : null;
  const demo: Record<string, string> = isDemo ? { demo: 'true' } : {};

  const explore = routed('/', demo);
  const current = clubPath(clubId);
  const requestedOpponent = typeof query?.opponent === 'string' && query.opponent !== clubId
    ? query.opponent
    : null;
  const contextOpponent = ready && requestedOpponent && Object.hasOwn(snapshot.teams, requestedOpponent)
    ? snapshot.teams[requestedOpponent]
    : null;
  const compareOnRight = contextOpponent !== null && query?.side === 'right';
  const context: Record<string, string> = contextOpponent
    ? { opponent: contextOpponent.id, ...(compareOnRight ? { side: 'right' } : {}) }
    : {};
  const clubVenue = (value: VenueFilter, demoEnabled: boolean) =>
    routed(current, { ...context, venue: value, ...(demoEnabled ? { demo: 'true' } : {}) });

  const opponent = contextOpponent?.id ?? Object.keys(snapshot?.teams ?? {}).find((id) => id !== clubId);
  const compare = snapshot && team && opponent
    ? routed('/compare', {
        season: String(snapshot.season.startYear),
        left: compareOnRight ? opponent : team.id,
        right: compareOnRight ? team.id : opponent,
        venue,
        ...(isDemo ? { demo: 'true' } : {}),
      })
    : null;

  const matches = metrics ? [...metrics.completedMatches].sort(
    (a, b) => b.kickoffUtc.localeCompare(a.kickoffUtc) || a.id.localeCompare(b.id)
  ) : [];

  return (
    <main className={styles.report}>
      {ready && isDemo && <DemoBanner currentPath={clubVenue(venue, true)} />}
      <StudioNav currentRoute="club" isDemo={ready ? isDemo : allowDemo}
        seasonLabel={ready ? snapshot.season.label : undefined}
      />
      <div className={styles.shell}>
        <Link href={explore} className={styles.textLink}>
          <ArrowLeft size={15} aria-hidden="true" /> League table
        </Link>

        {!ready ? (
          <div className={styles.unavailable}>
            <UnavailableState reason={error || 'Premier League snapshot is unavailable.'} demoUrl={routed(current, {
              ...(requestedOpponent ? { opponent: requestedOpponent } : {}),
              ...(requestedOpponent && query?.side === 'right' ? { side: 'right' } : {}),
              venue,
              demo: 'true',
            })} />
          </div>
        ) : !team || !metrics ? (
          <section className={styles.selection} aria-labelledby="club-title">
            <h1 id="club-title">Club not found</h1>
            <p>This club is missing from the {snapshot.season.label} snapshot.</p>
          </section>
        ) : (
          <>
            <header className={styles.heading}>
              <div>
                <p className={styles.competition}>{snapshot.competition.name} · {snapshot.season.label}</p>
                <h1 id="club-title">{team.name}</h1>
                {compare && (
                  <Link className={styles.textLink} href={compare}>
                    {contextOpponent ? `Compare with ${contextOpponent.shortName}` : `Compare ${team.shortName}`}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                )}
              </div>
              <div className={styles.identity}>
                <span className={styles.mark} aria-hidden="true">{team.tla}</span>
                {metrics.standing ? (
                  <dl className={styles.standing}>
                    <div><dt>League rank</dt><dd>#{metrics.standing.position}</dd></div>
                    <div><dt>Points</dt><dd>{metrics.standing.points}</dd></div>
                    <div><dt>Played</dt><dd>{metrics.standing.playedGames}</dd></div>
                  </dl>
                ) : <p className={styles.muted}>League standing unavailable.</p>}
              </div>
            </header>

            <div className={styles.filters}>
              <nav className={styles.venues} aria-label="Filter club record by venue">
                {venues.map(({ value, label }) => (
                  <Link key={value} href={clubVenue(value, isDemo)} scroll={false} aria-current={venue === value ? 'true' : undefined}>
                    {label}
                    <VenueLinkStatus />
                  </Link>
                ))}
              </nav>
              <p className={styles.sample}>{venueLabel} · {matches.length} completed {matches.length === 1 ? 'match' : 'matches'}</p>
            </div>

            <div className={styles.desk}>
              <div className={styles.side}>
                <section aria-labelledby="recent-form" className={styles.section}>
                  <h2 id="recent-form">Recent form</h2>
                  <p className={styles.muted}>Last five completed matches in this view</p>
                  {matches.length ? (
                    <ol className={styles.form}>
                      {matches.slice(0, 5).map((match) => {
                        const { opponent, score, outcome } = fixtureDetails(match, clubId, snapshot.teams);
                        return (
                          <li key={match.id}>
                            <a href={`#fixture-${match.id}`}>
                              <span aria-hidden="true" className={styles.outcome} data-result={outcome?.toLowerCase()}>{outcome?.[0] ?? '—'}</span>
                              <span className="sr-only">{outcome ?? 'Result unavailable'}, </span>
                              <strong className="font-mono">{score}</strong>
                              <small>{opponent?.tla ?? 'Opponent'}</small>
                            </a>
                          </li>
                        );
                      })}
                    </ol>
                  ) : <p className={styles.empty}>No recent results for this venue.</p>}
                </section>
                <section aria-labelledby="performance" className={styles.section}>
                  <h2 id="performance">Performance</h2>
                  <dl className={styles.metrics}>
                    {performance.map(({ key, label, decimals }) => {
                      const metric = metrics[key];
                      const value = metric.available ? metric.value?.toFixed(decimals) : undefined;
                      return (
                        <div key={key}>
                          <dt>{label}</dt>
                          <dd className="font-mono">{value ?? 'Unavailable'}</dd>
                          <dd className={styles.muted}>{metric.denominator} {metric.denominator === 1 ? 'match' : 'matches'}</dd>
                        </div>
                      );
                    })}
                  </dl>
                </section>
              </div>

              <section className={styles.section} aria-labelledby="completed-matches">
                <h2 id="completed-matches">Completed matches</h2>
                <p className={styles.muted}>Results behind this club’s metrics. Scores show {team.shortName} first.</p>
                {matches.length ? (
                  <ol className={styles.ledger}>
                    {matches.map((match) => {
                      const { atHome, opponent, opponentId, score, outcome } = fixtureDetails(match, clubId, snapshot.teams);
                      const kickoff = match.kickoffUtc ? new Date(match.kickoffUtc) : null;
                      return (
                        <li key={match.id} id={`fixture-${match.id}`} tabIndex={-1}>
                          <div className={styles.fixtureDate}>
                            {kickoff && Number.isFinite(kickoff.getTime())
                              ? <time dateTime={kickoff.toISOString()}>{fixtureDate.format(kickoff)}</time>
                              : 'Date unavailable'}
                            <span>Matchday {match.matchday} · {atHome ? 'Home' : 'Away'}</span>
                          </div>
                          <div className={styles.opponent}>
                            {opponent ? <Link href={routed(clubPath(opponent.id), demo)}>{opponent.name}</Link> : opponentId}
                          </div>
                          <span className={styles.score}>{score}</span>
                          <span className={styles.result} data-result={outcome?.toLowerCase()}>{outcome ?? 'Unavailable'}</span>
                        </li>
                      );
                    })}
                  </ol>
                ) : <p className={styles.empty}>No completed matches for this venue.</p>}
              </section>
            </div>
            <footer className={styles.source}>{snapshot.attribution}</footer>
          </>
        )}
      </div>
    </main>
  );
}
