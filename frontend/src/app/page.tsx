import { loadEplSnapshot } from '@/lib/epl/loader';
import { DemoBanner } from '@/components/studio/DemoBanner';
import { UnavailableState } from '@/components/studio/UnavailableState';
import { StudioNav } from '@/components/studio/StudioNav';
import { StandingsTable } from '@/components/studio/StandingsTable';
import { MatchEvidenceList } from '@/components/studio/MatchEvidenceList';
import { CompareLauncher } from '@/components/studio/CompareLauncher';
import { StadiumSignature } from '@/components/studio/StadiumSignature';


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

      {/* Hero Section with Refined Stadium Signature Moment */}
      <section className="relative border-b border-white/[0.08] overflow-hidden pt-10 pb-8 px-4 sm:px-6">
        {/* Signature Stadium Visual: static isometric poster with progressive 3D enhancement */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -translate-y-6 sm:-translate-y-8">
          <StadiumSignature className="w-[1050px] max-w-none" opacity={0.32} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10 space-y-6">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_17rem] md:items-end lg:gap-12">
            <div>
              <p className="mb-2 flex items-center gap-2.5 text-sm font-medium tracking-wide text-zinc-300">
                <span aria-hidden="true" className="h-px w-5 bg-emerald-400/70" />
                {snapshot.competition.name}
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white">
                Season {snapshot.season.label} Evidence
              </h1>
              <p className="mt-2 max-w-xl text-sm text-zinc-300">
                Compare club rates side-by-side, filter by venue, and inspect the verified completed games behind every number.
              </p>
            </div>

            <section aria-labelledby="snapshot-record-heading" className="min-w-0 border-y border-white/15 py-2.5">
              <h2 id="snapshot-record-heading" className="mb-1.5 text-sm font-semibold text-zinc-100">
                Snapshot record
              </h2>
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1.5 text-sm">
                <dt className="text-zinc-400">Coverage</dt>
                <dd className="font-mono text-xs text-zinc-200">
                  {snapshot.coverage.completedMatches} / {snapshot.coverage.totalMatches} matches
                </dd>
                <dt className="text-zinc-400">Source</dt>
                <dd className="break-words text-zinc-200">{isDemo ? 'Demo fixtures' : snapshot.source}</dd>
                <dt className="text-zinc-400">Imported</dt>
                <dd className="text-zinc-200">
                  {validImportTime ? (
                    <time dateTime={importedAt.toISOString()} className="font-mono text-xs">
                      {snapshotDate.format(importedAt)} UTC
                    </time>
                  ) : 'Time unavailable'}
                  {isStale && (
                    <span className="block text-sm font-medium text-amber-200">
                      {validImportTime ? 'Snapshot over 48 hours old' : 'Snapshot freshness unknown'}
                    </span>
                  )}
                </dd>
              </dl>
            </section>
          </div>

          {/* Near-the-Top Club Picker & Comparison Launcher */}
          <div className="pt-2">
            <CompareLauncher
              teams={teamsList}
              isDemo={isDemo}
              initialLeftId="liverpool"
              initialRightId="arsenal"
            />
          </div>
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
