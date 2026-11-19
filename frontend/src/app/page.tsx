import { loadEplSnapshot } from '@/lib/epl/loader';
import { DemoBanner } from '@/components/studio/DemoBanner';
import { UnavailableState } from '@/components/studio/UnavailableState';
import { StudioNav } from '@/components/studio/StudioNav';
import { StandingsTable } from '@/components/studio/StandingsTable';
import { MatchEvidenceList } from '@/components/studio/MatchEvidenceList';
import { CompareLauncher } from '@/components/studio/CompareLauncher';
import { StadiumSignature } from '@/components/studio/StadiumSignature';
import styles from './explore.module.css';


const snapshotDate = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
});

interface PageProps {
  searchParams?: Promise<{ demo?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const allowDemo = resolvedParams?.demo === 'true';

  const { snapshot, status, isStale, isDemo, error } = loadEplSnapshot({
    allowDemo,
  });

  // Truthful unavailable state when no valid provider snapshot exists
  if (!snapshot || status !== 'ready') {
    return (
      <main className="min-h-screen bg-[#080a0d] text-zinc-100 flex flex-col font-sans">
        <StudioNav currentRoute="explore" isDemo={allowDemo} />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <UnavailableState
            reason={
              status === 'demo_rejected'
                ? 'Demo data was detected at the real snapshot location. Normal routes reject demo data without explicit opt-in.'
                : error || 'Live Premier League snapshot is currently unavailable.'
            }
            demoUrl="/?demo=true"
          />
        </div>
      </main>
    );
  }

  const importedAt = snapshot.fetchedAt ? new Date(snapshot.fetchedAt) : null;
  const validImportTime = importedAt !== null && Number.isFinite(importedAt.getTime());
  const teamsList = Object.values(snapshot.teams);
  const completedMatches = snapshot.matches
    .filter((m) => m.status === 'COMPLETED')
    .slice(-8)
    .reverse();

  return (
    <main className="min-h-screen bg-[#080a0d] text-zinc-100 flex flex-col font-sans pb-16 relative overflow-x-clip">
      {isDemo && <DemoBanner currentPath="/?demo=true" />}
      <StudioNav
        isDemo={isDemo}
        seasonLabel={snapshot.season.label}
        sourceAttribution={snapshot.attribution}
        currentRoute="explore"
      />

      <section id="explore-opening" aria-labelledby="explore-title" className={styles.opening}>
        <div className={styles.shell}>
          <div className={styles.hero}>
            <div className={styles.copy}>
              <p className={styles.competition}>{snapshot.competition.name}</p>
              <h1 id="explore-title" className={styles.title}>Every number has a match.</h1>
              <p className={styles.intro}>
                Compare clubs, filter by venue, and see the matches behind each metric.
              </p>
              <a className={styles.jump} href="#matchup">
                Compare clubs <span aria-hidden="true">↓</span>
              </a>
            </div>
            <StadiumSignature />
          </div>

          <div className={styles.handoff} aria-hidden="true"><span /></div>

          <section id="matchup" aria-labelledby="matchup-heading" className={styles.matchup}>
            <div className={styles.matchupHeader}>
              <div>
                <h2 id="matchup-heading" className={styles.matchupTitle}>Build a matchup</h2>
                <p className={styles.season}>{snapshot.competition.name} · {snapshot.season.label}</p>
              </div>
              <section aria-labelledby="snapshot-record-heading" className={styles.record}>
                <h3 id="snapshot-record-heading" className={styles.recordTitle}>Snapshot record</h3>
                <dl>
                  <dt>Coverage</dt>
                  <dd className="font-mono">{snapshot.coverage.completedMatches} / {snapshot.coverage.totalMatches} matches</dd>
                  <dt>Source</dt>
                  <dd>{isDemo ? 'Demo fixtures' : snapshot.source}</dd>
                  <dt>Imported</dt>
                  <dd>
                    {validImportTime ? (
                      <time dateTime={importedAt.toISOString()} className="font-mono">
                        {snapshotDate.format(importedAt)} UTC
                      </time>
                    ) : 'Time unavailable'}
                    {isStale && (
                      <span className={styles.freshness}>
                        {validImportTime ? 'Snapshot over 48 hours old' : 'Snapshot freshness unknown'}
                      </span>
                    )}
                  </dd>
                </dl>
              </section>
            </div>
            <CompareLauncher
              teams={teamsList}
              isDemo={isDemo}
              initialLeftId="liverpool"
              initialRightId="arsenal"
            />
          </section>
        </div>
      </section>

      {/* Main Studio Body: Standings & Evidence */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full mt-8 space-y-8">
        {/* League Standings Table */}
        <section aria-labelledby="standings-heading" className="space-y-2">
          <StandingsTable
            standings={snapshot.standings}
            teams={snapshot.teams}
            isDemo={isDemo}
          />
        </section>

        {/* Recent Match Evidence */}
        <section aria-labelledby="evidence-heading" className="space-y-2">
          <MatchEvidenceList
            matches={completedMatches}
            teams={snapshot.teams}
            isDemo={isDemo}
            title="Recent Completed Match Evidence"
            description="Verified completed games in the current season snapshot."
          />
        </section>

        <footer className="border-t border-white/[0.08] pt-4 text-xs text-zinc-400">
          {snapshot.attribution}
        </footer>
      </div>
    </main>
  );
}
