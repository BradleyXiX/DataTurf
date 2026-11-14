import Link from 'next/link';
import { EplStandingRow, EplTeam } from '@/lib/epl/types';
import { Scale, ArrowUpRight } from 'lucide-react';

interface StandingsTableProps {
  standings: EplStandingRow[];
  teams: Record<string, EplTeam>;
  isDemo?: boolean;
}

export function StandingsTable({ standings, teams, isDemo = false }: StandingsTableProps) {
  const querySuffix = isDemo ? '?demo=true' : '';

  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-[#12151c]/90 shadow-xl">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <h3 className="font-semibold text-slate-100 text-sm tracking-wide">
          Official Premier League Standings
        </h3>
        <span className="text-xs text-slate-400">
          Rankings are official table order
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[620px]" aria-label="Premier League Standings">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">
              <th scope="col" className="py-2.5 px-3 w-12 text-center">Pos</th>
              <th scope="col" className="py-2.5 px-4">Club</th>
              <th scope="col" className="py-2.5 px-3 text-center w-12">P</th>
              <th scope="col" className="py-2.5 px-3 text-center w-12">W</th>
              <th scope="col" className="py-2.5 px-3 text-center w-12">D</th>
              <th scope="col" className="py-2.5 px-3 text-center w-12">L</th>
              <th scope="col" className="py-2.5 px-3 text-center w-14">GF</th>
              <th scope="col" className="py-2.5 px-3 text-center w-14">GA</th>
              <th scope="col" className="py-2.5 px-3 text-center w-14">GD</th>
              <th scope="col" className="py-2.5 px-3 text-center w-16 font-bold text-slate-200">Pts</th>
              <th scope="col" className="py-2.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-xs sm:text-sm">
            {standings.map((row) => {
              const team = teams[row.teamId];
              const clubName = team ? team.name : row.teamId;
              const shortName = team ? team.shortName : row.teamId;

              return (
                <tr
                  key={row.teamId}
                  className="hover:bg-white/[0.03] transition-colors group"
                >
                  <td className="py-3 px-3 text-center font-bold text-slate-300">
                    {row.position}
                  </td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-100">
                    <Link
                      href={`/club/${row.teamId}${querySuffix}`}
                      className="inline-flex items-center gap-2 hover:text-emerald-400 transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-400 rounded px-1 -mx-1"
                    >
                      {team?.crestUrl && (
                        <img
                          src={team.crestUrl}
                          alt=""
                          className="w-5 h-5 object-contain shrink-0"
                          aria-hidden="true"
                          loading="lazy"
                        />
                      )}
                      <span>{shortName}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity" />
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-300">{row.playedGames}</td>
                  <td className="py-3 px-3 text-center text-slate-300">{row.won}</td>
                  <td className="py-3 px-3 text-center text-slate-300">{row.draw}</td>
                  <td className="py-3 px-3 text-center text-slate-300">{row.lost}</td>
                  <td className="py-3 px-3 text-center text-slate-400">{row.goalsFor}</td>
                  <td className="py-3 px-3 text-center text-slate-400">{row.goalsAgainst}</td>
                  <td className={`py-3 px-3 text-center font-semibold ${row.goalDifference > 0 ? 'text-emerald-400' : row.goalDifference < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-base text-emerald-400">
                    {row.points}
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <div className="flex items-center justify-center gap-1.5">
                      <Link
                        href={`/club/${row.teamId}${querySuffix}`}
                        className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                      >
                        Inspect
                      </Link>
                      <Link
                        href={`/compare${querySuffix ? `${querySuffix}&` : '?'}left=${row.teamId}`}
                        className="text-xs px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-colors inline-flex items-center gap-1"
                        title={`Compare ${shortName}`}
                      >
                        <Scale className="w-3 h-3" />
                        <span>Compare</span>
                      </Link>
                    </div>
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
