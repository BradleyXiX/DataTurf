import { loadEplSnapshot } from '@/lib/epl/loader';
import { DemoBanner } from '@/components/studio/DemoBanner';
import { UnavailableState } from '@/components/studio/UnavailableState';
import { StudioNav } from '@/components/studio/StudioNav';
import { StandingsTable } from '@/components/studio/StandingsTable';
import { MatchEvidenceList } from '@/components/studio/MatchEvidenceList';
import { CompareLauncher } from '@/components/studio/CompareLauncher';
import { ShieldCheck, Calendar, Activity, Info } from 'lucide-react';

interface PageProps {
  searchParams?: Promise<{ demo?: string }> | { demo?: string };
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedParams = await Promise.resolve(searchParams);
  const allowDemo = resolvedParams?.demo === 'true';

  const { snapshot, status, isStale, isDemo, error } = loadEplSnapshot({
    allowDemo,
  });

  // If no snapshot is available, display truthful unavailable state
  if (!snapshot || status !== 'ready') {
    return (
      <main className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col font-sans">
        <StudioNav currentRoute="explore" isDemo={allowDemo} />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
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
    <main className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col font-sans pb-16">
      {isDemo && <DemoBanner currentPath="/?demo=true" />}
      <StudioNav
        isDemo={isDemo}
        seasonLabel={snapshot.season.label}
        sourceAttribution={snapshot.attribution}
        currentRoute="explore"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-8">
        {/* Stale Warning Banner */}
        {isStale && (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/30 text-amber-200 text-xs sm:text-sm flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Snapshot is older than 48 hours (fetched at {new Date(snapshot.fetchedAt).toLocaleString()}). Showing cached season state.
            </span>
          </div>
        )}

        {/* Studio Header / Season Summary */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>Premier League Analysis Studio</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Season {snapshot.season.label}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Inspect club form, compare two sides side-by-side, and trace every metric to real games.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 bg-white/[0.02] border border-white/10 p-3 rounded-xl">
            <div>
              <span className="text-slate-500 block">Matches</span>
              <span className="text-slate-200 font-bold">
                {snapshot.coverage.completedMatches} / {snapshot.coverage.totalMatches} completed
              </span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div>
              <span className="text-slate-500 block">Source</span>
              <span className="text-slate-200 font-bold">{snapshot.source}</span>
            </div>
          </div>
        </div>

        {/* Comparison Engine Launcher */}
        <section aria-labelledby="compare-heading">
          <CompareLauncher
            teams={teamsList}
            isDemo={isDemo}
            initialLeftId="liverpool"
            initialRightId="arsenal"
          />
        </section>

        {/* Standings Table */}
        <section aria-labelledby="standings-heading" className="space-y-3">
          <StandingsTable
            standings={snapshot.standings}
            teams={snapshot.teams}
            isDemo={isDemo}
          />
        </section>

        {/* Recent Match Evidence */}
        <section aria-labelledby="evidence-heading" className="space-y-3">
          <MatchEvidenceList
            matches={completedMatches}
            teams={snapshot.teams}
            isDemo={isDemo}
            title="Recent Completed Match Evidence"
            description="Verified completed games recorded in the current season snapshot."
          />
        </section>

        {/* Provenance & Manifest Footer */}
        <footer className="border-t border-white/10 pt-6 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{snapshot.attribution}</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            <span>Snapshot fetched: {new Date(snapshot.fetchedAt).toUTCString()}</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
