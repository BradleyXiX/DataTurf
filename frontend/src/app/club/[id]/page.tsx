import Link from 'next/link';
import { loadEplSnapshot } from '@/lib/epl/loader';
import { getTeamMetrics, getTeamMatches } from '@/lib/epl/metrics';
import { DemoBanner } from '@/components/studio/DemoBanner';
import { UnavailableState } from '@/components/studio/UnavailableState';
import { StudioNav } from '@/components/studio/StudioNav';
import { MatchEvidenceList } from '@/components/studio/MatchEvidenceList';
import { PitchArtwork } from '@/components/studio/PitchArtwork';
import { ArrowLeft, ArrowUpRight, Flame, Scale } from 'lucide-react';

interface ClubPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ demo?: string; venue?: string }>;
}

export default async function ClubPage({ params, searchParams }: ClubPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const clubId = resolvedParams.id;
  const allowDemo = resolvedSearchParams?.demo === 'true';
  const venue = (resolvedSearchParams?.venue as 'all' | 'home' | 'away') || 'all';

  const { snapshot, status, isDemo, error } = loadEplSnapshot({ allowDemo });

  if (!snapshot || status !== 'ready') {
    return (
      <main className="min-h-screen bg-[#080a0d] text-zinc-100 flex flex-col font-sans">
        <StudioNav currentRoute="club" isDemo={allowDemo} />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <UnavailableState
            reason={
              status === 'demo_rejected'
                ? 'Demo data was detected at the real snapshot location. Normal routes reject demo data without explicit opt-in.'
                : error || 'Premier League snapshot is unavailable.'
            }
            demoUrl={`/club/${clubId}?demo=true`}
          />
        </div>
      </main>
    );
  }

  const team = snapshot.teams[clubId];
  const querySuffix = isDemo ? '&demo=true' : '';

  if (!team) {
    return (
      <main className="min-h-screen bg-[#080a0d] text-zinc-100 flex flex-col font-sans">
        <StudioNav currentRoute="club" isDemo={isDemo} />
        <div className="max-w-xl mx-auto my-16 p-8 rounded-lg border border-white/[0.08] bg-[#0d1015] text-center">
          <span className="inline-block px-2 py-0.5 rounded border border-rose-500/30 bg-rose-950/20 text-rose-400 font-mono text-[11px] uppercase tracking-wider mb-3">
            Unknown Club
          </span>
          <h2 className="text-xl font-semibold text-white tracking-tight mb-2">Club Not Found</h2>
          <p className="text-xs text-zinc-400 mb-6 font-mono">
            Identifier <code className="text-emerald-400">"{clubId}"</code> was not found in the current season snapshot.
          </p>
          <Link
            href={`/${isDemo ? '?demo=true' : ''}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-white text-xs font-mono transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to League Table</span>
          </Link>
        </div>
      </main>
    );
  }

  const metrics = getTeamMetrics(snapshot, clubId, venue);
  const filteredMatches = getTeamMatches(snapshot.matches, clubId, venue, true);

  return (
    <main className="min-h-screen bg-[#080a0d] text-zinc-100 flex flex-col font-sans pb-16 relative">
      {isDemo && <DemoBanner currentPath={`/club/${clubId}?demo=true`} />}
      <StudioNav
        isDemo={isDemo}
        seasonLabel={snapshot.season.label}
        sourceAttribution={snapshot.attribution}
        currentRoute="club"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-6">
        {/* Navigation Breadcrumb & Quick Actions */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/${isDemo ? '?demo=true' : ''}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 rounded"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to League Table</span>
          </Link>

          <Link
            href={`/compare?season=${snapshot.season.startYear}&left=${clubId}${isDemo ? '&demo=true' : ''}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Compare {team.shortName}</span>
          </Link>
        </div>

        {/* Club Header / Hero Panel with Tactical Pitch Background */}
        <section
          aria-labelledby="club-header-title"
          className="relative rounded-lg border border-white/[0.08] bg-[#0d1015] p-5 sm:p-6 overflow-hidden"
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none w-96 max-w-none">
            <PitchArtwork variant="tactical" opacity={0.3} />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {team.crestUrl ? (
                <img
                  src={team.crestUrl}
                  alt={`${team.name} crest`}
                  className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0 drop-shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center font-bold font-mono text-xl text-zinc-300">
                  {team.tla}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1
                    id="club-header-title"
                    className="text-2xl sm:text-3xl font-semibold tracking-tight text-white"
                  >
                    {team.name}
                  </h1>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-white/[0.08] bg-white/[0.04] text-zinc-400">
                    {team.tla}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 font-mono">
                  Premier League Season {snapshot.season.label} Profile & Match Evidence
                </p>
              </div>
            </div>

            {metrics?.standing && (
              <div className="flex items-center gap-3 font-mono shrink-0">
                <div className="px-3 py-2 rounded-md border border-white/[0.08] bg-[#080a0d] text-center min-w-[70px]">
                  <span className="text-[10px] text-zinc-500 uppercase block">Rank</span>
                  <span className="text-lg font-bold text-zinc-100">#{metrics.standing.position}</span>
                </div>
                <div className="px-3 py-2 rounded-md border border-emerald-500/20 bg-emerald-950/20 text-center min-w-[70px]">
                  <span className="text-[10px] text-emerald-400/80 uppercase block">Points</span>
                  <span className="text-lg font-bold text-emerald-400">{metrics.standing.points}</span>
                </div>
                <div className="px-3 py-2 rounded-md border border-white/[0.08] bg-[#080a0d] text-center min-w-[70px] hidden sm:block">
                  <span className="text-[10px] text-zinc-500 uppercase block">Played</span>
                  <span className="text-lg font-bold text-zinc-100">{metrics.standing.playedGames}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Venue Filter Bar with Real-Time Sample Size */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div
            role="group"
            aria-label="Filter club record by venue"
            className="inline-flex items-center gap-1 p-1 rounded-md bg-[#0d1015] border border-white/[0.08] text-xs font-mono"
          >
            <Link
              href={`/club/${clubId}?venue=all${querySuffix}`}
              className={`px-3 py-1.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 ${
                venue === 'all' ? 'bg-white/10 text-white font-medium' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Matches
            </Link>
            <Link
              href={`/club/${clubId}?venue=home${querySuffix}`}
              className={`px-3 py-1.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 ${
                venue === 'home' ? 'bg-white/10 text-white font-medium' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Home Splits
            </Link>
            <Link
              href={`/club/${clubId}?venue=away${querySuffix}`}
              className={`px-3 py-1.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 ${
                venue === 'away' ? 'bg-white/10 text-white font-medium' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Away Splits
            </Link>
          </div>

          <span className="text-xs font-mono text-zinc-500">
            Sample size: {metrics?.completedMatches.length || 0} completed matches ({venue.toUpperCase()})
          </span>
        </div>

        {/* Verified Computed Metric Cards with Exact Denominators */}
        <section aria-label="Computed Performance Rates" className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-lg border border-white/[0.08] bg-[#0d1015]">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
              Points / Game
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {metrics?.pointsPerGame.available ? metrics.pointsPerGame.value?.toFixed(2) : '—'}
            </div>
            <span className="text-[11px] font-mono text-zinc-500 block mt-1.5">
              n = {metrics?.pointsPerGame.denominator || 0} completed
            </span>
          </div>

          <div className="p-4 rounded-lg border border-white/[0.08] bg-[#0d1015]">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
              Goals Scored / Match
            </span>
            <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
              {metrics?.goalsScoredPerMatch.available ? metrics.goalsScoredPerMatch.value?.toFixed(2) : '—'}
            </div>
            <span className="text-[11px] font-mono text-zinc-500 block mt-1.5">
              n = {metrics?.goalsScoredPerMatch.denominator || 0} completed
            </span>
          </div>

          <div className="p-4 rounded-lg border border-white/[0.08] bg-[#0d1015]">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
              Goals Conceded / Match
            </span>
            <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
              {metrics?.goalsConcededPerMatch.available ? metrics.goalsConcededPerMatch.value?.toFixed(2) : '—'}
            </div>
            <span className="text-[11px] font-mono text-zinc-500 block mt-1.5">
              n = {metrics?.goalsConcededPerMatch.denominator || 0} completed
            </span>
          </div>

          <div className="p-4 rounded-lg border border-white/[0.08] bg-[#0d1015]">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
              Clean Sheets
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {metrics?.cleanSheets.available ? metrics.cleanSheets.value : '—'}
            </div>
            <span className="text-[11px] font-mono text-zinc-500 block mt-1.5">
              in {metrics?.cleanSheets.denominator || 0} matches
            </span>
          </div>
        </section>

        {/* Recent Form (Last 5 Completed Matches) */}
        <section aria-labelledby="form-heading" className="space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h2 id="form-heading" className="text-sm font-semibold text-zinc-100 tracking-tight">
              Recent Form (Last 5 Completed Matches)
            </h2>
          </div>
          <MatchEvidenceList
            matches={metrics?.lastFiveMatches || []}
            teams={snapshot.teams}
            focusTeamId={clubId}
            isDemo={isDemo}
            title="Last 5 Outings"
            description={`Chronological match evidence with ID tiebreaker order.`}
          />
        </section>

        {/* Full Season Completed Match Evidence */}
        <section aria-labelledby="all-evidence-heading" className="space-y-3">
          <MatchEvidenceList
            matches={filteredMatches}
            teams={snapshot.teams}
            focusTeamId={clubId}
            isDemo={isDemo}
            title={`Completed Match Records (${venue.toUpperCase()})`}
            description={`Every verified game contributing to ${team.name}'s statistical profile.`}
          />
        </section>
      </div>
    </main>
  );
}
