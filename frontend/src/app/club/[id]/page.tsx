import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadEplSnapshot } from '@/lib/epl/loader';
import { getTeamMetrics, getTeamMatches } from '@/lib/epl/metrics';
import { DemoBanner } from '@/components/studio/DemoBanner';
import { UnavailableState } from '@/components/studio/UnavailableState';
import { StudioNav } from '@/components/studio/StudioNav';
import { MatchEvidenceList } from '@/components/studio/MatchEvidenceList';
import { ArrowLeft, Scale, Trophy, Flame } from 'lucide-react';

interface ClubPageProps {
  params: Promise<{ id: string }> | { id: string };
  searchParams?: Promise<{ demo?: string; venue?: string }> | { demo?: string; venue?: string };
}

export default async function ClubPage({ params, searchParams }: ClubPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);

  const clubId = resolvedParams.id;
  const allowDemo = resolvedSearchParams?.demo === 'true';
  const venue = (resolvedSearchParams?.venue as 'all' | 'home' | 'away') || 'all';

  const { snapshot, status, isDemo, error } = loadEplSnapshot({ allowDemo });

  if (!snapshot || status !== 'ready') {
    return (
      <main className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col font-sans">
        <StudioNav currentRoute="club" isDemo={allowDemo} />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <UnavailableState
            reason={error || 'Premier League snapshot is unavailable.'}
            demoUrl={`/club/${clubId}?demo=true`}
          />
        </div>
      </main>
    );
  }

  const team = snapshot.teams[clubId];
  if (!team) {
    return (
      <main className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col font-sans">
        <StudioNav currentRoute="club" isDemo={isDemo} />
        <div className="max-w-2xl mx-auto my-16 p-8 rounded-2xl bg-[#12151c] border border-white/10 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Club Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">
            The club identifier <code className="text-emerald-400 font-mono">"{clubId}"</code> was not found in the current season snapshot.
          </p>
          <Link
            href={`/${isDemo ? '?demo=true' : ''}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Explore</span>
          </Link>
        </div>
      </main>
    );
  }

  const metrics = getTeamMetrics(snapshot, clubId, venue);
  const filteredMatches = getTeamMatches(snapshot.matches, clubId, venue, true);
  const querySuffix = isDemo ? '&demo=true' : '';

  return (
    <main className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col font-sans pb-16">
      {isDemo && <DemoBanner currentPath={`/club/${clubId}?demo=true`} />}
      <StudioNav
        isDemo={isDemo}
        seasonLabel={snapshot.season.label}
        sourceAttribution={snapshot.attribution}
        currentRoute="club"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/${isDemo ? '?demo=true' : ''}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to League Standings</span>
          </Link>

          <Link
            href={`/compare?season=${snapshot.season.startYear}&left=${clubId}${isDemo ? '&demo=true' : ''}`}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-colors font-medium"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Compare {team.shortName}</span>
          </Link>
        </div>

        {/* Club Header Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#12151c] to-[#0c0e12] border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {team.crestUrl ? (
              <img
                src={team.crestUrl}
                alt=""
                className="w-16 h-16 object-contain shrink-0 drop-shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-bold font-mono text-xl text-slate-400">
                {team.tla}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {team.name}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                  {team.tla}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Premier League Season {snapshot.season.label} Record & Analysis
              </p>
            </div>
          </div>

          {metrics?.standing && (
            <div className="flex items-center gap-3 font-mono text-center shrink-0">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 min-w-[70px]">
                <span className="text-[10px] text-slate-500 uppercase block">Rank</span>
                <span className="text-xl font-bold text-slate-200">#{metrics.standing.position}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 min-w-[70px]">
                <span className="text-[10px] text-emerald-400/80 uppercase block">Points</span>
                <span className="text-xl font-bold text-emerald-400">{metrics.standing.points}</span>
              </div>
            </div>
          )}
        </div>

        {/* Venue Filter Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono">
            <Link
              href={`/club/${clubId}?venue=all${querySuffix}`}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                venue === 'all' ? 'bg-white/10 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Matches
            </Link>
            <Link
              href={`/club/${clubId}?venue=home${querySuffix}`}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                venue === 'home' ? 'bg-white/10 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Home Splits
            </Link>
            <Link
              href={`/club/${clubId}?venue=away${querySuffix}`}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                venue === 'away' ? 'bg-white/10 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Away Splits
            </Link>
          </div>

          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Sample: {metrics?.completedMatches.length || 0} completed matches
          </span>
        </div>

        {/* Verified Computed Metric Cards with Exact Denominators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#12151c]/90 border border-white/10 shadow-lg">
            <span className="text-xs text-slate-400 font-mono block">Points Per Game</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              {metrics?.pointsPerGame.available ? metrics.pointsPerGame.value?.toFixed(2) : 'Unavailable'}
            </div>
            <span className="text-[11px] text-slate-500 font-mono block mt-1">
              Denominator: {metrics?.pointsPerGame.denominator || 0} completed
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#12151c]/90 border border-white/10 shadow-lg">
            <span className="text-xs text-slate-400 font-mono block">Goals Scored / Match</span>
            <div className="text-2xl font-extrabold text-slate-100 mt-1">
              {metrics?.goalsScoredPerMatch.available ? metrics.goalsScoredPerMatch.value?.toFixed(2) : 'Unavailable'}
            </div>
            <span className="text-[11px] text-slate-500 font-mono block mt-1">
              Denominator: {metrics?.goalsScoredPerMatch.denominator || 0} completed
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#12151c]/90 border border-white/10 shadow-lg">
            <span className="text-xs text-slate-400 font-mono block">Goals Conceded / Match</span>
            <div className="text-2xl font-extrabold text-slate-100 mt-1">
              {metrics?.goalsConcededPerMatch.available ? metrics.goalsConcededPerMatch.value?.toFixed(2) : 'Unavailable'}
            </div>
            <span className="text-[11px] text-slate-500 font-mono block mt-1">
              Denominator: {metrics?.goalsConcededPerMatch.denominator || 0} completed
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#12151c]/90 border border-white/10 shadow-lg">
            <span className="text-xs text-slate-400 font-mono block">Clean Sheets</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              {metrics?.cleanSheets.available ? metrics.cleanSheets.value : 'Unavailable'}
            </div>
            <span className="text-[11px] text-slate-500 font-mono block mt-1">
              In {metrics?.cleanSheets.denominator || 0} completed games
            </span>
          </div>
        </div>

        {/* Last Five Form Evidence */}
        <section aria-labelledby="form-heading" className="space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 id="form-heading" className="font-semibold text-slate-200 text-sm tracking-wide">
              Recent Form (Last 5 Completed Matches)
            </h3>
          </div>
          <MatchEvidenceList
            matches={metrics?.lastFiveMatches || []}
            teams={snapshot.teams}
            focusTeamId={clubId}
            isDemo={isDemo}
            title=""
            description=""
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
            description={`Every game behind ${team.name}'s statistical profile.`}
          />
        </section>
      </div>
    </main>
  );
}
