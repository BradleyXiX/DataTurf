import Link from 'next/link';
import type { EplMatch, EplTeam } from '@/lib/epl/types';

interface MatchEvidenceListProps {
  matches: EplMatch[];
  teams: Record<string, EplTeam>;
  focusTeamId?: string;
  isDemo?: boolean;
  title?: string;
  description?: string;
}

export function MatchEvidenceList({
  matches,
  teams,
  focusTeamId,
  isDemo = false,
  title = 'Completed Matches',
  description,
}: MatchEvidenceListProps) {
  const querySuffix = isDemo ? '?demo=true' : '';

  if (matches.length === 0) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-[#0d1015] p-6 text-center text-xs font-mono text-zinc-400">
        No completed matches found for the selected criteria.
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border border-white/[0.08] bg-[#0d1015] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">{title}</h3>
          {description && <p className="text-xs text-zinc-400 mt-0.5">{description}</p>}
        </div>
        <span className="text-[11px] font-mono text-zinc-400">
          {matches.length} {matches.length === 1 ? 'match' : 'matches'}
        </span>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {matches.map((m) => {
          const homeTeam = teams[m.homeTeamId];
          const awayTeam = teams[m.awayTeamId];
          const homeName = homeTeam?.shortName || m.homeTeamId;
          const awayName = awayTeam?.shortName || m.awayTeamId;

          const dateStr = m.kickoffUtc ? m.kickoffUtc.substring(0, 10) : 'Date TBD';

          // Outcome badge if focusTeamId is supplied
          let outcome = null;
          if (focusTeamId && m.status === 'COMPLETED' && m.score.home !== null && m.score.away !== null) {
            const isHome = m.homeTeamId === focusTeamId;
            const teamScore = isHome ? m.score.home : m.score.away;
            const oppScore = isHome ? m.score.away : m.score.home;

            if (teamScore > oppScore) {
              outcome = (
                <span className="w-5 h-5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  W
                </span>
              );
            } else if (teamScore === oppScore) {
              outcome = (
                <span className="w-5 h-5 rounded text-[11px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center justify-center shrink-0">
                  D
                </span>
              );
            } else {
              outcome = (
                <span className="w-5 h-5 rounded text-[11px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                  L
                </span>
              );
            }
          }

          return (
            <div
              key={m.id}
              className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-white/[0.02] transition-colors"
            >
              {/* Date & Details */}
              <div className="flex items-center gap-2.5 font-mono text-zinc-400 shrink-0">
                {outcome}
                <span>{dateStr}</span>
                <span className="hidden sm:inline text-zinc-400">•</span>
                <span className="hidden sm:inline text-zinc-400">MD {m.matchday}</span>
              </div>

              {/* Matchup & Score */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end max-w-sm">
                <Link
                  href={`/club/${m.homeTeamId}${querySuffix}`}
                  className={`text-right truncate hover:text-emerald-400 transition-colors ${
                    focusTeamId === m.homeTeamId ? 'font-semibold text-white' : 'text-zinc-300'
                  }`}
                >
                  {homeName}
                </Link>

                <div className="px-2 py-0.5 rounded bg-black/40 border border-white/[0.08] font-mono text-[11px] font-semibold text-zinc-200 shrink-0 min-w-[42px] text-center">
                  {m.status === 'COMPLETED' ? (
                    `${m.score.home} - ${m.score.away}`
                  ) : m.status === 'POSTPONED' ? (
                    <span className="text-amber-400">PPD</span>
                  ) : (
                    <span className="text-zinc-400">SCH</span>
                  )}
                </div>

                <Link
                  href={`/club/${m.awayTeamId}${querySuffix}`}
                  className={`text-left truncate hover:text-emerald-400 transition-colors ${
                    focusTeamId === m.awayTeamId ? 'font-semibold text-white' : 'text-zinc-300'
                  }`}
                >
                  {awayName}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
