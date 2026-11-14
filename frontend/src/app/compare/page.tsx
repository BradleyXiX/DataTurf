import Link from 'next/link';
import { loadEplSnapshot } from '@/lib/epl/loader';
import { compareClubs } from '@/lib/epl/metrics';
import { DemoBanner } from '@/components/studio/DemoBanner';
import { UnavailableState } from '@/components/studio/UnavailableState';
import { StudioNav } from '@/components/studio/StudioNav';
import { MatchEvidenceList } from '@/components/studio/MatchEvidenceList';
import { CompareLauncher } from '@/components/studio/CompareLauncher';
import { Scale, ArrowLeft, Swords, ShieldCheck, Trophy } from 'lucide-react';

interface ComparePageProps {
  searchParams?: Promise<{
    season?: string;
    left?: string;
    right?: string;
    venue?: string;
    demo?: string;
  }> | {
    season?: string;
    left?: string;
    right?: string;
    venue?: string;
    demo?: string;
  };
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const resolvedParams = await Promise.resolve(searchParams);

  const allowDemo = resolvedParams?.demo === 'true';
  const leftId = resolvedParams?.left || '';
  const rightId = resolvedParams?.right || '';
  const venue = (resolvedParams?.venue as 'all' | 'home' | 'away') || 'all';

  const { snapshot, status, isDemo, error } = loadEplSnapshot({ allowDemo });

  if (!snapshot || status !== 'ready') {
    return (
      <main className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col font-sans">
        <StudioNav currentRoute="compare" isDemo={allowDemo} />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <UnavailableState
            reason={error || 'Premier League snapshot is unavailable for comparison.'}
            demoUrl={`/compare?season=2024&left=${leftId || 'liverpool'}&right=${rightId || 'arsenal'}&venue=${venue}&demo=true`}
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
    <main className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col font-sans pb-16">
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-8">
        {/* Navigation & Title */}
        <div className="flex items-center justify-between">
          <Link
            href={`/${isDemo ? '?demo=true' : ''}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to League Standings</span>
          </Link>
          <span className="text-xs font-mono text-slate-500">
            Season {snapshot.season.label}
          </span>
        </div>

        {/* Club Comparison Selector */}
        <section aria-labelledby="selector-heading">
          <CompareLauncher
            teams={teamsList}
            isDemo={isDemo}
            initialLeftId={leftId || teamsList[0]?.id}
            initialRightId={rightId || teamsList[1]?.id}
            initialVenue={venue}
          />
        </section>

        {/* Validation Errors for Invalid Selections */}
        {isSameTeam && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-sm">
            Please select two distinct clubs. Side-by-side comparison requires two different teams.
          </div>
        )}

        {(!leftValid || !rightValid) && !isSameTeam && (
          <div className="p-6 rounded-xl bg-[#12151c] border border-white/10 text-center text-slate-400 text-sm">
            Select two clubs above to launch the side-by-side evidence comparison.
          </div>
        )}

        {/* Side-by-Side Comparison Output */}
        {comparison && (
          <div className="space-y-8">
            {/* Clubs Matchup Header */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#12151c] to-[#0c0e12] border border-white/10 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center">
              {/* Left Club */}
              <div className="flex flex-col items-center gap-2">
                {comparison.left.team.crestUrl && (
                  <img
                    src={comparison.left.team.crestUrl}
                    alt=""
                    className="w-16 h-16 object-contain"
                  />
                )}
                <Link
                  href={`/club/${comparison.left.team.id}${isDemo ? '?demo=true' : ''}`}
                  className="text-xl font-bold text-white hover:text-emerald-400 transition-colors"
                >
                  {comparison.left.team.name}
                </Link>
                {comparison.left.standing && (
                  <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                    Rank #{comparison.left.standing.position} • {comparison.left.standing.points} pts
                  </span>
                )}
              </div>

              {/* VS Divider */}
              <div className="flex flex-col items-center gap-1.5 py-2">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                  <Swords className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
                  Venue: {venue.toUpperCase()}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {comparison.headToHead.length} direct H2H matches
                </span>
              </div>

              {/* Right Club */}
              <div className="flex flex-col items-center gap-2">
                {comparison.right.team.crestUrl && (
                  <img
                    src={comparison.right.team.crestUrl}
                    alt=""
                    className="w-16 h-16 object-contain"
                  />
                )}
                <Link
                  href={`/club/${comparison.right.team.id}${isDemo ? '?demo=true' : ''}`}
                  className="text-xl font-bold text-white hover:text-emerald-400 transition-colors"
                >
                  {comparison.right.team.name}
                </Link>
                {comparison.right.standing && (
                  <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                    Rank #{comparison.right.standing.position} • {comparison.right.standing.points} pts
                  </span>
                )}
              </div>
            </div>

            {/* Side-by-Side Metric Rates with Denominators */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-200 text-sm tracking-wide">
                Side-by-Side Rate Comparison
              </h3>

              <div className="space-y-3 font-mono text-sm">
                {/* 1. Points Per Game */}
                <div className="p-4 rounded-xl bg-[#12151c]/90 border border-white/10 shadow-md">
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                    <span className="text-left">{comparison.left.team.shortName}</span>
                    <span className="font-sans font-semibold text-slate-200">Points Per Game</span>
                    <span className="text-right">{comparison.right.team.shortName}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center text-center">
                    <div className="text-xl font-extrabold text-emerald-400 text-left">
                      {comparison.left.pointsPerGame.available
                        ? comparison.left.pointsPerGame.value?.toFixed(2)
                        : 'Unavailable'}
                      <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                        {comparison.left.pointsPerGame.denominator} games
                      </span>
                    </div>
                    <div className="text-xs font-sans text-slate-500">
                      (3W + D) / completed
                    </div>
                    <div className="text-xl font-extrabold text-emerald-400 text-right">
                      {comparison.right.pointsPerGame.available
                        ? comparison.right.pointsPerGame.value?.toFixed(2)
                        : 'Unavailable'}
                      <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                        {comparison.right.pointsPerGame.denominator} games
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Goals Scored Per Match */}
                <div className="p-4 rounded-xl bg-[#12151c]/90 border border-white/10 shadow-md">
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                    <span className="text-left">{comparison.left.team.shortName}</span>
                    <span className="font-sans font-semibold text-slate-200">Goals Scored / Match</span>
                    <span className="text-right">{comparison.right.team.shortName}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center text-center">
                    <div className="text-xl font-extrabold text-slate-100 text-left">
                      {comparison.left.goalsScoredPerMatch.available
                        ? comparison.left.goalsScoredPerMatch.value?.toFixed(2)
                        : 'Unavailable'}
                      <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                        {comparison.left.goalsScoredPerMatch.denominator} games
                      </span>
                    </div>
                    <div className="text-xs font-sans text-slate-500">
                      total goals / completed
                    </div>
                    <div className="text-xl font-extrabold text-slate-100 text-right">
                      {comparison.right.goalsScoredPerMatch.available
                        ? comparison.right.goalsScoredPerMatch.value?.toFixed(2)
                        : 'Unavailable'}
                      <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                        {comparison.right.goalsScoredPerMatch.denominator} games
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Goals Conceded Per Match */}
                <div className="p-4 rounded-xl bg-[#12151c]/90 border border-white/10 shadow-md">
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                    <span className="text-left">{comparison.left.team.shortName}</span>
                    <span className="font-sans font-semibold text-slate-200">Goals Conceded / Match</span>
                    <span className="text-right">{comparison.right.team.shortName}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center text-center">
                    <div className="text-xl font-extrabold text-slate-100 text-left">
                      {comparison.left.goalsConcededPerMatch.available
                        ? comparison.left.goalsConcededPerMatch.value?.toFixed(2)
                        : 'Unavailable'}
                      <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                        {comparison.left.goalsConcededPerMatch.denominator} games
                      </span>
                    </div>
                    <div className="text-xs font-sans text-slate-500">
                      conceded / completed
                    </div>
                    <div className="text-xl font-extrabold text-slate-100 text-right">
                      {comparison.right.goalsConcededPerMatch.available
                        ? comparison.right.goalsConcededPerMatch.value?.toFixed(2)
                        : 'Unavailable'}
                      <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                        {comparison.right.goalsConcededPerMatch.denominator} games
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Clean Sheets */}
                <div className="p-4 rounded-xl bg-[#12151c]/90 border border-white/10 shadow-md">
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                    <span className="text-left">{comparison.left.team.shortName}</span>
                    <span className="font-sans font-semibold text-slate-200">Clean Sheets</span>
                    <span className="text-right">{comparison.right.team.shortName}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center text-center">
                    <div className="text-xl font-extrabold text-emerald-400 text-left">
                      {comparison.left.cleanSheets.available ? comparison.left.cleanSheets.value : 'Unavailable'}
                      <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                        in {comparison.left.cleanSheets.denominator} games
                      </span>
                    </div>
                    <div className="text-xs font-sans text-slate-500">
                      zero conceded
                    </div>
                    <div className="text-xl font-extrabold text-emerald-400 text-right">
                      {comparison.right.cleanSheets.available ? comparison.right.cleanSheets.value : 'Unavailable'}
                      <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                        in {comparison.right.cleanSheets.denominator} games
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Head to Head Matches */}
            <section aria-labelledby="h2h-heading" className="space-y-3">
              <MatchEvidenceList
                matches={comparison.headToHead}
                teams={snapshot.teams}
                isDemo={isDemo}
                title={`Head-to-Head Matches (${comparison.left.team.shortName} vs ${comparison.right.team.shortName})`}
                description="Direct match evidence between these two clubs."
              />
            </section>

            {/* Underlying Matches for Club A */}
            <section aria-labelledby="left-matches-heading" className="space-y-3">
              <MatchEvidenceList
                matches={comparison.left.completedMatches}
                teams={snapshot.teams}
                focusTeamId={comparison.left.team.id}
                isDemo={isDemo}
                title={`${comparison.left.team.name} Completed Matches`}
                description={`Underlying evidence matches for ${comparison.left.team.shortName}.`}
              />
            </section>

            {/* Underlying Matches for Club B */}
            <section aria-labelledby="right-matches-heading" className="space-y-3">
              <MatchEvidenceList
                matches={comparison.right.completedMatches}
                teams={snapshot.teams}
                focusTeamId={comparison.right.team.id}
                isDemo={isDemo}
                title={`${comparison.right.team.name} Completed Matches`}
                description={`Underlying evidence matches for ${comparison.right.team.shortName}.`}
              />
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
