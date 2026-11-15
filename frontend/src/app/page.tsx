import { loadEplSnapshot } from '@/lib/epl/loader';
import { DemoBanner } from '@/components/studio/DemoBanner';
import { UnavailableState } from '@/components/studio/UnavailableState';
import { StudioNav } from '@/components/studio/StudioNav';
import { StandingsTable } from '@/components/studio/StandingsTable';
import { MatchEvidenceList } from '@/components/studio/MatchEvidenceList';
import { CompareLauncher } from '@/components/studio/CompareLauncher';
import { PitchArtwork } from '@/components/studio/PitchArtwork';
import { Info } from 'lucide-react';

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

  const teamsList = Object.values(snapshot.teams);
  const completedMatches = snapshot.matches
    .filter((m) => m.status === 'COMPLETED')
    .slice(-8)
    .reverse();

  return (
    <main className="min-h-screen bg-[#080a0d] text-zinc-100 flex flex-col font-sans pb-16 relative">
      {isDemo && <DemoBanner currentPath="/?demo=true" />}
      <StudioNav
        isDemo={isDemo}
        seasonLabel={snapshot.season.label}
        sourceAttribution={snapshot.attribution}
        currentRoute="explore"
      />

      {/* Hero Section with Original Pitch Artwork */}
      <section className="relative border-b border-white/[0.08] overflow-hidden pt-10 pb-8 px-4 sm:px-6">
        {/* Subtle ambient tactical pitch background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-25 -translate-y-8 pointer-events-none">
          <PitchArtwork variant="hero" className="w-[850px] max-w-none" opacity={0.3} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10 space-y-6">
          {/* Stale Warning Banner if needed */}
          {isStale && (
            <div className="p-3 rounded-md bg-amber-950/40 border border-amber-600/30 text-amber-200 text-xs flex items-center gap-2 font-mono">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Snapshot fetched at {new Date(snapshot.fetchedAt).toLocaleString()} (&gt;48h old).
              </span>
            </div>
          )}

          {/* Studio Hero Headline */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 font-mono text-[11px] uppercase tracking-wider mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Premier League Research Studio</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white">
                Season {snapshot.season.label} Evidence
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                Compare club rates side-by-side, filter by venue, and inspect the verified completed games behind every number.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 border border-white/[0.08] bg-[#0c0f14]/80 px-3 py-2 rounded-md shrink-0">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Recorded</span>
                <span className="text-zinc-200 font-semibold">
                  {snapshot.coverage.completedMatches} / {snapshot.coverage.totalMatches} matches
                </span>
              </div>
              <div className="w-px h-6 bg-white/[0.08]" />
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Source</span>
                <span className="text-zinc-200 font-semibold">{snapshot.source}</span>
              </div>
            </div>
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

        {/* Provenance Footer */}
        <footer className="border-t border-white/[0.08] pt-6 text-xs text-zinc-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
            <span>{snapshot.attribution}</span>
          </div>
          <div className="text-[11px] text-zinc-600">
            Fetched: {new Date(snapshot.fetchedAt).toUTCString()}
          </div>
        </footer>
      </div>
    </main>
  );
}
