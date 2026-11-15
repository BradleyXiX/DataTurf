'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EplTeam } from '@/lib/epl/types';
import { ArrowRight } from 'lucide-react';

interface CompareLauncherProps {
  teams: EplTeam[];
  isDemo?: boolean;
  initialLeftId?: string;
  initialRightId?: string;
  initialVenue?: 'all' | 'home' | 'away';
  compact?: boolean;
}

export function CompareLauncher({
  teams,
  isDemo = false,
  initialLeftId = '',
  initialRightId = '',
  initialVenue = 'all',
  compact = false,
}: CompareLauncherProps) {
  const router = useRouter();
  const [leftId, setLeftId] = useState(initialLeftId || (teams[0]?.id ?? ''));
  const [rightId, setRightId] = useState(
    initialRightId || (teams[1]?.id ?? teams[0]?.id ?? '')
  );
  const [venue, setVenue] = useState<'all' | 'home' | 'away'>(initialVenue);
  const [validationError, setValidationError] = useState<string | null>(null);

  const navigateToComparison = (left: string, right: string, v: 'all' | 'home' | 'away') => {
    if (!left || !right) {
      setValidationError('Select two clubs to compare.');
      return;
    }
    if (left === right) {
      setValidationError('Select two distinct clubs.');
      return;
    }
    setValidationError(null);

    const params = new URLSearchParams();
    params.set('season', '2024');
    params.set('left', left);
    params.set('right', right);
    if (v !== 'all') {
      params.set('venue', v);
    }
    if (isDemo) {
      params.set('demo', 'true');
    }

    router.push(`/compare?${params.toString()}`);
  };

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToComparison(leftId, rightId, venue);
  };

  const setMatchup = (left: string, right: string) => {
    setLeftId(left);
    setRightId(right);
    navigateToComparison(left, right, venue);
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleCompare}
        className="p-4 sm:p-5 rounded-lg border border-white/[0.08] bg-[#0d1015] shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          {/* Club A */}
          <div className="flex-1 min-w-0">
            <label
              htmlFor="select-left-club"
              className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5"
            >
              Club A
            </label>
            <select
              id="select-left-club"
              value={leftId}
              onChange={(e) => {
                setLeftId(e.target.value);
                setValidationError(null);
              }}
              className="w-full bg-[#13171f] border border-white/[0.12] text-zinc-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id} disabled={t.id === rightId}>
                  {t.name} {t.id === rightId ? '(Selected as B)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* VS Divider on desktop */}
          <div className="hidden md:flex items-center justify-center pb-2.5 text-zinc-500 text-xs font-mono">
            vs
          </div>

          {/* Club B */}
          <div className="flex-1 min-w-0">
            <label
              htmlFor="select-right-club"
              className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5"
            >
              Club B
            </label>
            <select
              id="select-right-club"
              value={rightId}
              onChange={(e) => {
                setRightId(e.target.value);
                setValidationError(null);
              }}
              className="w-full bg-[#13171f] border border-white/[0.12] text-zinc-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id} disabled={t.id === leftId}>
                  {t.name} {t.id === leftId ? '(Selected as A)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Venue */}
          <div className="w-full md:w-44 min-w-0">
            <label
              htmlFor="select-venue"
              className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5"
            >
              Venue
            </label>
            <select
              id="select-venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value as any)}
              className="w-full bg-[#13171f] border border-white/[0.12] text-zinc-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Matches</option>
              <option value="home">Home Matches</option>
              <option value="away">Away Matches</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shrink-0 h-[38px]"
          >
            <span>Compare</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {validationError && (
          <p className="mt-2.5 text-xs text-rose-400 font-mono" role="alert">
            {validationError}
          </p>
        )}

        {/* Quick Matchup Presets */}
        {!compact && (
          <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-zinc-500 font-mono text-[11px]">Quick Matchups:</span>
            <button
              type="button"
              onClick={() => setMatchup('liverpool', 'arsenal')}
              className="px-2 py-0.5 rounded border border-white/[0.08] hover:border-emerald-500/40 hover:bg-white/[0.03] text-zinc-300 transition-colors font-mono text-[11px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
            >
              Liverpool vs Arsenal
            </button>
            <button
              type="button"
              onClick={() => setMatchup('man-city', 'arsenal')}
              className="px-2 py-0.5 rounded border border-white/[0.08] hover:border-emerald-500/40 hover:bg-white/[0.03] text-zinc-300 transition-colors font-mono text-[11px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
            >
              Man City vs Arsenal
            </button>
            <button
              type="button"
              onClick={() => setMatchup('chelsea', 'liverpool')}
              className="px-2 py-0.5 rounded border border-white/[0.08] hover:border-emerald-500/40 hover:bg-white/[0.03] text-zinc-300 transition-colors font-mono text-[11px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
            >
              Chelsea vs Liverpool
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
