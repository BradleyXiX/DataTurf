import Link from 'next/link';
import { EplStandingRow, EplTeam } from '@/lib/epl/types';
import { ArrowUpRight } from 'lucide-react';

interface StandingsTableProps {
  standings: EplStandingRow[];
  teams: Record<string, EplTeam>;
  isDemo?: boolean;
}

export function StandingsTable({ standings, teams, isDemo = false }: StandingsTableProps) {
  const querySuffix = isDemo ? '?demo=true' : '';

  return (
    <div className="w-full rounded-lg border border-white/[0.08] bg-[#0d1015] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">
          League Table
        </h2>
        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
          Official Standings
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[580px]" aria-label="Premier League Standings">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.015] text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              <th scope="col" className="py-2 px-3 w-10 text-center">#</th>
              <th scope="col" className="py-2 px-4">Club</th>
              <th scope="col" className="py-2 px-2.5 text-right w-10"><abbr title="Played Games" className="no-underline cursor-help">P</abbr></th>
              <th scope="col" className="py-2 px-2.5 text-right w-10"><abbr title="Won" className="no-underline cursor-help">W</abbr></th>
              <th scope="col" className="py-2 px-2.5 text-right w-10"><abbr title="Drawn" className="no-underline cursor-help">D</abbr></th>
              <th scope="col" className="py-2 px-2.5 text-right w-10"><abbr title="Lost" className="no-underline cursor-help">L</abbr></th>
              <th scope="col" className="py-2 px-2.5 text-right w-12 hidden sm:table-cell"><abbr title="Goals For" className="no-underline cursor-help">GF</abbr></th>
              <th scope="col" className="py-2 px-2.5 text-right w-12 hidden sm:table-cell"><abbr title="Goals Against" className="no-underline cursor-help">GA</abbr></th>
              <th scope="col" className="py-2 px-2.5 text-right w-12"><abbr title="Goal Difference" className="no-underline cursor-help">GD</abbr></th>
              <th scope="col" className="py-2 px-3 text-right w-12 font-bold text-zinc-200"><abbr title="Points" className="no-underline cursor-help">Pts</abbr></th>
              <th scope="col" className="py-2 px-4 text-right w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] font-mono text-xs">
            {standings.map((row) => {
              const team = teams[row.teamId];
              const clubName = team ? team.name : row.teamId;
              const shortName = team ? team.shortName : row.teamId;

              return (
                <tr
                  key={row.teamId}
                  className="hover:bg-white/[0.025] transition-colors group"
                >
                  <td className="py-2.5 px-3 text-center text-zinc-400 font-medium">
                    {row.position}
                  </td>
                  <td className="py-2.5 px-4 font-sans font-medium text-zinc-200">
                    <Link
                      href={`/club/${row.teamId}${querySuffix}`}
                      className="inline-flex items-center gap-2.5 hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 rounded py-0.5"
                    >
                      {team?.crestUrl && (
                        <img
                          src={team.crestUrl}
                          alt=""
                          className="w-4 h-4 object-contain shrink-0"
                          aria-hidden="true"
                          loading="lazy"
                        />
                      )}
                      <span>{shortName}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-zinc-400 transition-opacity" />
                    </Link>
                  </td>
                  <td className="py-2.5 px-2.5 text-right text-zinc-300">{row.playedGames}</td>
                  <td className="py-2.5 px-2.5 text-right text-zinc-300">{row.won}</td>
                  <td className="py-2.5 px-2.5 text-right text-zinc-300">{row.draw}</td>
                  <td className="py-2.5 px-2.5 text-right text-zinc-300">{row.lost}</td>
                  <td className="py-2.5 px-2.5 text-right text-zinc-400 hidden sm:table-cell">{row.goalsFor}</td>
                  <td className="py-2.5 px-2.5 text-right text-zinc-400 hidden sm:table-cell">{row.goalsAgainst}</td>
                  <td className={`py-2.5 px-2.5 text-right font-medium ${
                    row.goalDifference > 0 ? 'text-emerald-400' : row.goalDifference < 0 ? 'text-rose-400' : 'text-zinc-400'
                  }`}>
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-zinc-100">
                    {row.points}
                  </td>
                  <td className="py-2.5 px-4 text-right font-sans">
                    <Link
                      href={`/compare${querySuffix ? `${querySuffix}&` : '?'}left=${row.teamId}`}
                      className="text-xs text-zinc-400 hover:text-emerald-400 px-2 py-0.5 rounded border border-white/[0.08] hover:border-emerald-500/40 transition-colors inline-block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                      title={`Compare ${shortName}`}
                    >
                      Compare
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
