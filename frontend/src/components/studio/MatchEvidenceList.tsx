import Link from 'next/link';
import { EplMatch, EplTeam } from '@/lib/epl/types';
import { Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

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
  title = 'Completed Match Evidence',
  description = 'Every metric in DataTurf traces back to these real games.',
}: MatchEvidenceListProps) {
  const querySuffix = isDemo ? '?demo=true' : '';

  if (matches.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-white/10 bg-[#12151c]/60 text-center text-sm text-slate-400">
        No matches match the selected criteria.
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-white/10 bg-[#12151c]/90 overflow-hidden shadow-lg">
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="font-semibold text-slate-100 text-sm tracking-wide">{title}</h3>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>

      <div className="divide-y divide-white/5">
        {matches.map((m) => {
          const homeTeam = teams[m.homeTeamId];
          const awayTeam = teams[m.awayTeamId];
          const homeName = homeTeam?.shortName || m.homeTeamId;
          const awayName = awayTeam?.shortName || m.awayTeamId;

          // Format UTC date nicely
          const dateStr = m.kickoffUtc ? m.kickoffUtc.substring(0, 10) : 'Date TBD';

          // Outcome calculation if focusTeamId is provided
          let outcomeBadge = null;
          if (focusTeamId && m.status === 'COMPLETED' && m.score.home !== null && m.score.away !== null) {
            const isHome = m.homeTeamId === focusTeamId;
            const teamScore = isHome ? m.score.home : m.score.away;
            const oppScore = isHome ? m.score.away : m.score.home;

            if (teamScore > oppScore) {
              outcomeBadge = (
                <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                  W
                </span>
              );
            } else if (teamScore === oppScore) {
              outcomeBadge = (
                <span className="w-6 h-6 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                  D
                </span>
              );
            } else {
              outcomeBadge = (
                <span className="w-6 h-6 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-xs">
                  L
                </span>
              );
            }
          }

          return (
            <div
              key={m.id}
              className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                {outcomeBadge}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{dateStr}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
                  MD {m.matchday}
                </span>
              </div>

              <div className="flex items-center gap-3 justify-between sm:justify-end flex-1 max-w-md">
                <Link
                  href={`/club/${m.homeTeamId}${querySuffix}`}
                  className={`text-sm hover:text-emerald-400 transition-colors text-right flex-1 truncate ${
                    focusTeamId === m.homeTeamId ? 'font-bold text-white' : 'text-slate-300'
                  }`}
                >
                  {homeName}
                </Link>

                <div className="px-3 py-1 rounded bg-black/40 border border-white/10 font-mono text-xs sm:text-sm font-bold min-w-[54px] text-center shrink-0">
                  {m.status === 'COMPLETED' ? (
                    <span className="text-emerald-400">
                      {m.score.home} - {m.score.away}
                    </span>
                  ) : m.status === 'POSTPONED' ? (
                    <span className="text-amber-400 text-[11px] flex items-center justify-center gap-1">
                      <AlertCircle className="w-3 h-3" /> PPD
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px] flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" /> SCH
                    </span>
                  )}
                </div>

                <Link
                  href={`/club/${m.awayTeamId}${querySuffix}`}
                  className={`text-sm hover:text-emerald-400 transition-colors text-left flex-1 truncate ${
                    focusTeamId === m.awayTeamId ? 'font-bold text-white' : 'text-slate-300'
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
