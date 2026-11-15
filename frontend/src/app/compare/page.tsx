import Link from 'next/link';
import { loadEplSnapshot } from '@/lib/epl/loader';
import { compareClubs } from '@/lib/epl/metrics';
import { DemoBanner } from '@/components/studio/DemoBanner';
import { UnavailableState } from '@/components/studio/UnavailableState';
import { StudioNav } from '@/components/studio/StudioNav';
import { MatchEvidenceList } from '@/components/studio/MatchEvidenceList';
import { CompareLauncher } from '@/components/studio/CompareLauncher';
import { PitchArtwork } from '@/components/studio/PitchArtwork';
import { ArrowLeft } from 'lucide-react';

interface ComparePageProps {
  searchParams?: Promise<{
    season?: string;
    left?: string;
    right?: string;
    venue?: string;
    demo?: string;
  }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const resolvedParams = await searchParams;

  const allowDemo = resolvedParams?.demo === 'true';
  const leftId = resolvedParams?.left || 'liverpool';
  const rightId = resolvedParams?.right || 'arsenal';
  const venue = (resolvedParams?.venue as 'all' | 'home' | 'away') || 'all';

  const { snapshot, status, isDemo, error } = loadEplSnapshot({ allowDemo });

  if (!snapshot || status !== 'ready') {
    return (
      <main className="min-h-screen bg-[#080a0d] text-zinc-100 flex flex-col font-sans">
        <StudioNav currentRoute="compare" isDemo={allowDemo} />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <UnavailableState
            reason={error || 'Premier League snapshot is unavailable for comparison.'}
            demoUrl={`/compare?season=2024&left=${leftId}&right=${rightId}&venue=${venue}&demo=true`}
          />
        </div>
      </main>
    );
  }

  const teamsList = Object.values(snapshot.teams);
  const isSameTeam = leftId && rightId && leftId === rightId;
  const leftValid = Boolean(leftId && snapshot.teams[leftId]);
  const rightValid = Boolean(rightId && snapshot.teams[rightId]);
  const canCompare = leftValid && rightValid && !isSameTeam;

  const comparison = canCompare
    ? compareClubs(snapshot, leftId, rightId, venue)
    : null;

  const querySuffix = isDemo ? '&demo=true' : '';

  return (
    <main className="min-h-screen bg-[#080a0d] text-zinc-100 flex flex-col font-sans pb-16 relative overflow-x-clip">
      {isDemo && (
        <DemoBanner
          currentPath={`/compare?season=2024&left=${leftId}&right=${rightId}&venue=${venue}&demo=true`}
        />
      )}
      <StudioNav
        isDemo={isDemo}
        seasonLabel={snapshot.season.label}
        sourceAttribution={snapshot.attribution}
        currentRoute="compare"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href={`/${isDemo ? '?demo=true' : ''}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to League Table</span>
          </Link>
          <span className="text-xs font-mono text-zinc-500">
            Season {snapshot.season.label}
          </span>
        </div>

        {/* Club Comparison Launcher at the top */}
        <CompareLauncher
          teams={teamsList}
          isDemo={isDemo}
          initialLeftId={leftId}
          initialRightId={rightId}
          initialVenue={venue}
          compact={false}
        />

        {/* Validation Errors for Invalid Selections */}
        {isSameTeam && (
          <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs font-mono">
            Select two distinct clubs. Side-by-side comparison requires two different teams.
          </div>
        )}

        {(!leftValid || !rightValid) && !isSameTeam && (
          <div className="p-6 rounded-lg border border-white/[0.08] bg-[#0d1015] text-center text-zinc-400 text-xs font-mono">
            Select two clubs above to launch the side-by-side comparison.
          </div>
        )}

        {/* Valid Comparison Content */}
        {comparison && (
          <div className="space-y-8">
            {/* Matchup Header with Ambient Pitch Background */}
            <div className="relative rounded-lg border border-white/[0.08] bg-[#0d1015] p-5 sm:p-6 overflow-hidden">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none w-96 max-w-none">
                <PitchArtwork variant="tactical" opacity={0.3} />
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                {/* Left Club */}
                <div className="flex items-center gap-3.5">
                  {comparison.left.team.crestUrl && (
                    <img
                      src={comparison.left.team.crestUrl}
                      alt=""
                      className="w-12 h-12 object-contain shrink-0"
                    />
                  )}
                  <div>
                    <Link
                      href={`/club/${comparison.left.team.id}${isDemo ? '?demo=true' : ''}`}
                      className="text-lg sm:text-xl font-semibold text-white hover:text-emerald-400 transition-colors tracking-tight block"
                    >
                      {comparison.left.team.name}
                    </Link>
                    {comparison.left.standing && (
                      <span className="text-xs font-mono text-zinc-400">
                        Rank #{comparison.left.standing.position} • {comparison.left.standing.points} pts
                      </span>
                    )}
                  </div>
                </div>

                {/* VS Center Indicator */}
                <div className="flex flex-col items-center gap-1 font-mono text-zinc-500 text-xs">
                  <span className="px-2 py-0.5 rounded border border-white/[0.08] bg-white/[0.02] uppercase tracking-wider text-[11px]">
                    {venue === 'all' ? 'All Venues' : venue === 'home' ? 'Home Matches' : 'Away Matches'}
                  </span>
                  <span className="text-[11px] text-zinc-600">
                    {comparison.headToHead.length} direct H2H matches
                  </span>
                </div>

                {/* Right Club */}
                <div className="flex items-center gap-3.5 sm:flex-row-reverse text-center sm:text-right">
                  {comparison.right.team.crestUrl && (
                    <img
                      src={comparison.right.team.crestUrl}
                      alt=""
                      className="w-12 h-12 object-contain shrink-0"
                    />
                  )}
                  <div>
                    <Link
                      href={`/club/${comparison.right.team.id}${isDemo ? '?demo=true' : ''}`}
                      className="text-lg sm:text-xl font-semibold text-white hover:text-emerald-400 transition-colors tracking-tight block"
                    >
                      {comparison.right.team.name}
                    </Link>
                    {comparison.right.standing && (
                      <span className="text-xs font-mono text-zinc-400">
                        Rank #{comparison.right.standing.position} • {comparison.right.standing.points} pts
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Venue Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div>
                <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">
                  Shared Benchmark Comparison
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Both clubs aligned against identical metric definitions and sample sizes.
                </p>
              </div>

              {/* Venue Switcher Tabs */}
              <div
                role="group"
                aria-label="Filter comparison by venue"
                className="flex flex-wrap items-center gap-1 bg-[#13171f] p-1 rounded-md border border-white/[0.08] self-start sm:self-auto font-mono text-xs"
              >
                <Link
                  href={`/compare?season=2024&left=${leftId}&right=${rightId}&venue=all${querySuffix}`}
                  className={`px-3 py-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 ${
                    venue === 'all'
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  All Matches
                </Link>
                <Link
                  href={`/compare?season=2024&left=${leftId}&right=${rightId}&venue=home${querySuffix}`}
                  className={`px-3 py-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 ${
                    venue === 'home'
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Home Only
                </Link>
                <Link
                  href={`/compare?season=2024&left=${leftId}&right=${rightId}&venue=away${querySuffix}`}
                  className={`px-3 py-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 ${
                    venue === 'away'
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Away Only
                </Link>
              </div>
            </div>

            {/* Shared Metric Comparison Table */}
            <div className="w-full rounded-lg border border-white/[0.08] bg-[#0d1015] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[480px]" aria-label="Club Metric Comparison Table">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.015] text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    <th scope="col" className="py-2.5 px-4 text-left w-2/5">
                      <div className="flex items-center gap-2">
                        <span>{comparison.left.team.shortName}</span>
                        <span className="text-[10px] text-zinc-500 font-normal lowercase">
                          (n = {comparison.left.pointsPerGame.denominator} {comparison.left.pointsPerGame.denominator === 1 ? 'game' : 'games'})
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="py-2.5 px-4 text-center w-1/5 text-zinc-300">
                      Shared Metric
                    </th>
                    <th scope="col" className="py-2.5 px-4 text-right w-2/5">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[10px] text-zinc-500 font-normal lowercase">
                          (n = {comparison.right.pointsPerGame.denominator} {comparison.right.pointsPerGame.denominator === 1 ? 'game' : 'games'})
                        </span>
                        <span>{comparison.right.team.shortName}</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {/* Row 1: Points Per Match */}
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-left">
                      <div className="font-mono text-base font-bold text-zinc-100 flex items-baseline gap-2">
                        <span className={
                          comparison.left.pointsPerGame.value !== null &&
                          comparison.right.pointsPerGame.value !== null &&
                          comparison.left.pointsPerGame.value > comparison.right.pointsPerGame.value
                            ? 'text-emerald-400'
                            : 'text-zinc-200'
                        }>
                          {comparison.left.pointsPerGame.available
                            ? `${comparison.left.pointsPerGame.value?.toFixed(2)} PPG`
                            : 'Unavailable'}
                        </span>
                        {comparison.left.pointsPerGame.value !== null &&
                         comparison.right.pointsPerGame.value !== null &&
                         comparison.left.pointsPerGame.value > comparison.right.pointsPerGame.value && (
                          <span className="text-[10px] font-mono uppercase text-emerald-400 border border-emerald-500/30 bg-emerald-950/20 px-1 rounded">
                            Ahead
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 block mt-0.5">
                        Sample: {comparison.left.pointsPerGame.denominator} {comparison.left.pointsPerGame.denominator === 1 ? 'match' : 'matches'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-xs font-semibold text-zinc-200">Points Per Match</div>
                      <div className="text-[10px] font-mono text-zinc-500">(3W + D) / completed</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono text-base font-bold text-zinc-100 flex items-baseline justify-end gap-2">
                        {comparison.left.pointsPerGame.value !== null &&
                         comparison.right.pointsPerGame.value !== null &&
                         comparison.right.pointsPerGame.value > comparison.left.pointsPerGame.value && (
                          <span className="text-[10px] font-mono uppercase text-emerald-400 border border-emerald-500/30 bg-emerald-950/20 px-1 rounded">
                            Ahead
                          </span>
                        )}
                        <span className={
                          comparison.left.pointsPerGame.value !== null &&
                          comparison.right.pointsPerGame.value !== null &&
                          comparison.right.pointsPerGame.value > comparison.left.pointsPerGame.value
                            ? 'text-emerald-400'
                            : 'text-zinc-200'
                        }>
                          {comparison.right.pointsPerGame.available
                            ? `${comparison.right.pointsPerGame.value?.toFixed(2)} PPG`
                            : 'Unavailable'}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 block mt-0.5">
                        Sample: {comparison.right.pointsPerGame.denominator} {comparison.right.pointsPerGame.denominator === 1 ? 'match' : 'matches'}
                      </span>
                    </td>
                  </tr>

                  {/* Row 2: Goals Scored Per Match */}
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-left">
                      <div className="font-mono text-base font-bold text-zinc-100 flex items-baseline gap-2">
                        <span className={
                          comparison.left.goalsScoredPerMatch.value !== null &&
                          comparison.right.goalsScoredPerMatch.value !== null &&
                          comparison.left.goalsScoredPerMatch.value > comparison.right.goalsScoredPerMatch.value
                            ? 'text-emerald-400'
                            : 'text-zinc-200'
                        }>
                          {comparison.left.goalsScoredPerMatch.available
                            ? `${comparison.left.goalsScoredPerMatch.value?.toFixed(2)} GPM`
                            : 'Unavailable'}
                        </span>
                        {comparison.left.goalsScoredPerMatch.value !== null &&
                         comparison.right.goalsScoredPerMatch.value !== null &&
                         comparison.left.goalsScoredPerMatch.value > comparison.right.goalsScoredPerMatch.value && (
                          <span className="text-[10px] font-mono uppercase text-emerald-400 border border-emerald-500/30 bg-emerald-950/20 px-1 rounded">
                            Ahead
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 block mt-0.5">
                        Sample: {comparison.left.goalsScoredPerMatch.denominator} {comparison.left.goalsScoredPerMatch.denominator === 1 ? 'match' : 'matches'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-xs font-semibold text-zinc-200">Goals Scored / Match</div>
                      <div className="text-[10px] font-mono text-zinc-500">total goals / completed</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono text-base font-bold text-zinc-100 flex items-baseline justify-end gap-2">
                        {comparison.left.goalsScoredPerMatch.value !== null &&
                         comparison.right.goalsScoredPerMatch.value !== null &&
                         comparison.right.goalsScoredPerMatch.value > comparison.left.goalsScoredPerMatch.value && (
                          <span className="text-[10px] font-mono uppercase text-emerald-400 border border-emerald-500/30 bg-emerald-950/20 px-1 rounded">
                            Ahead
                          </span>
                        )}
                        <span className={
                          comparison.left.goalsScoredPerMatch.value !== null &&
                          comparison.right.goalsScoredPerMatch.value !== null &&
                          comparison.right.goalsScoredPerMatch.value > comparison.left.goalsScoredPerMatch.value
                            ? 'text-emerald-400'
                            : 'text-zinc-200'
                        }>
                          {comparison.right.goalsScoredPerMatch.available
                            ? `${comparison.right.goalsScoredPerMatch.value?.toFixed(2)} GPM`
                            : 'Unavailable'}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 block mt-0.5">
                        Sample: {comparison.right.goalsScoredPerMatch.denominator} {comparison.right.goalsScoredPerMatch.denominator === 1 ? 'match' : 'matches'}
                      </span>
                    </td>
                  </tr>

                  {/* Row 3: Goals Conceded Per Match */}
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-left">
                      <div className="font-mono text-base font-bold text-zinc-100 flex items-baseline gap-2">
                        <span className={
                          comparison.left.goalsConcededPerMatch.value !== null &&
                          comparison.right.goalsConcededPerMatch.value !== null &&
                          comparison.left.goalsConcededPerMatch.value < comparison.right.goalsConcededPerMatch.value
                            ? 'text-emerald-400'
                            : 'text-zinc-200'
                        }>
                          {comparison.left.goalsConcededPerMatch.available
                            ? `${comparison.left.goalsConcededPerMatch.value?.toFixed(2)} GPM`
                            : 'Unavailable'}
                        </span>
                        {comparison.left.goalsConcededPerMatch.value !== null &&
                         comparison.right.goalsConcededPerMatch.value !== null &&
                         comparison.left.goalsConcededPerMatch.value < comparison.right.goalsConcededPerMatch.value && (
                          <span className="text-[10px] font-mono uppercase text-emerald-400 border border-emerald-500/30 bg-emerald-950/20 px-1 rounded">
                            Fewer Conceded
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 block mt-0.5">
                        Sample: {comparison.left.goalsConcededPerMatch.denominator} {comparison.left.goalsConcededPerMatch.denominator === 1 ? 'match' : 'matches'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-xs font-semibold text-zinc-200">Goals Conceded / Match</div>
                      <div className="text-[10px] font-mono text-zinc-500">total conceded / completed</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono text-base font-bold text-zinc-100 flex items-baseline justify-end gap-2">
                        {comparison.left.goalsConcededPerMatch.value !== null &&
                         comparison.right.goalsConcededPerMatch.value !== null &&
                         comparison.right.goalsConcededPerMatch.value < comparison.left.goalsConcededPerMatch.value && (
                          <span className="text-[10px] font-mono uppercase text-emerald-400 border border-emerald-500/30 bg-emerald-950/20 px-1 rounded">
                            Fewer Conceded
                          </span>
                        )}
                        <span className={
                          comparison.left.goalsConcededPerMatch.value !== null &&
                          comparison.right.goalsConcededPerMatch.value !== null &&
                          comparison.right.goalsConcededPerMatch.value < comparison.left.goalsConcededPerMatch.value
                            ? 'text-emerald-400'
                            : 'text-zinc-200'
                        }>
                          {comparison.right.goalsConcededPerMatch.available
                            ? `${comparison.right.goalsConcededPerMatch.value?.toFixed(2)} GPM`
                            : 'Unavailable'}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 block mt-0.5">
                        Sample: {comparison.right.goalsConcededPerMatch.denominator} {comparison.right.goalsConcededPerMatch.denominator === 1 ? 'match' : 'matches'}
                      </span>
                    </td>
                  </tr>

                  {/* Row 4: Clean Sheets */}
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-left">
                      <div className="font-mono text-base font-bold text-zinc-100 flex items-baseline gap-2">
                        <span className={
                          comparison.left.cleanSheets.value !== null &&
                          comparison.right.cleanSheets.value !== null &&
                          comparison.left.cleanSheets.value > comparison.right.cleanSheets.value
                            ? 'text-emerald-400'
                            : 'text-zinc-200'
                        }>
                          {comparison.left.cleanSheets.available
                            ? `${comparison.left.cleanSheets.value} clean sheets`
                            : 'Unavailable'}
                        </span>
                        {comparison.left.cleanSheets.value !== null &&
                         comparison.right.cleanSheets.value !== null &&
                         comparison.left.cleanSheets.value > comparison.right.cleanSheets.value && (
                          <span className="text-[10px] font-mono uppercase text-emerald-400 border border-emerald-500/30 bg-emerald-950/20 px-1 rounded">
                            Ahead
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 block mt-0.5">
                        In {comparison.left.cleanSheets.denominator} {comparison.left.cleanSheets.denominator === 1 ? 'match' : 'matches'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-xs font-semibold text-zinc-200">Clean Sheets</div>
                      <div className="text-[10px] font-mono text-zinc-500">zero goals conceded</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono text-base font-bold text-zinc-100 flex items-baseline justify-end gap-2">
                        {comparison.left.cleanSheets.value !== null &&
                         comparison.right.cleanSheets.value !== null &&
                         comparison.right.cleanSheets.value > comparison.left.cleanSheets.value && (
                          <span className="text-[10px] font-mono uppercase text-emerald-400 border border-emerald-500/30 bg-emerald-950/20 px-1 rounded">
                            Ahead
                          </span>
                        )}
                        <span className={
                          comparison.left.cleanSheets.value !== null &&
                          comparison.right.cleanSheets.value !== null &&
                          comparison.right.cleanSheets.value > comparison.left.cleanSheets.value
                            ? 'text-emerald-400'
                            : 'text-zinc-200'
                        }>
                          {comparison.right.cleanSheets.available
                            ? `${comparison.right.cleanSheets.value} clean sheets`
                            : 'Unavailable'}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 block mt-0.5">
                        In {comparison.right.cleanSheets.denominator} {comparison.right.cleanSheets.denominator === 1 ? 'match' : 'matches'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

            {/* Contributing Matches Directly Below */}
            <div className="space-y-6 pt-2">
              <div className="border-b border-white/[0.08] pb-2">
                <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">
                  Contributing Match Evidence
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Verified games contributing to sample sizes ({comparison.left.team.shortName} n={comparison.left.completedMatches.length}, {comparison.right.team.shortName} n={comparison.right.completedMatches.length}) under venue filter: <span className="font-mono uppercase text-emerald-400">{venue}</span>.
                </p>
              </div>

              {/* Head-to-Head Section if exists */}
              {comparison.headToHead.length > 0 && (
                <section aria-labelledby="h2h-heading" className="space-y-2">
                  <MatchEvidenceList
                    matches={comparison.headToHead}
                    teams={snapshot.teams}
                    isDemo={isDemo}
                    title={`Direct Head-to-Head Matches (${comparison.left.team.shortName} vs ${comparison.right.team.shortName})`}
                    description="Matches played directly between these two clubs."
                  />
                </section>
              )}

              {/* Side-by-Side Contributing Matches Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Club Contributing Matches */}
                <section aria-labelledby="left-matches-heading" className="space-y-2">
                  <MatchEvidenceList
                    matches={comparison.left.completedMatches}
                    teams={snapshot.teams}
                    focusTeamId={comparison.left.team.id}
                    isDemo={isDemo}
                    title={`${comparison.left.team.name} Contributing Matches`}
                    description={`Sample size: n = ${comparison.left.completedMatches.length} (${venue} matches)`}
                  />
                </section>

                {/* Right Club Contributing Matches */}
                <section aria-labelledby="right-matches-heading" className="space-y-2">
                  <MatchEvidenceList
                    matches={comparison.right.completedMatches}
                    teams={snapshot.teams}
                    focusTeamId={comparison.right.team.id}
                    isDemo={isDemo}
                    title={`${comparison.right.team.name} Contributing Matches`}
                    description={`Sample size: n = ${comparison.right.completedMatches.length} (${venue} matches)`}
                  />
                </section>
              </div>
            </div>
          </div>
        )}

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
