'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EplTeam } from '@/lib/epl/types';
import { Scale, ArrowRight } from 'lucide-react';

interface CompareLauncherProps {
  teams: EplTeam[];
  isDemo?: boolean;
  initialLeftId?: string;
  initialRightId?: string;
  initialVenue?: 'all' | 'home' | 'away';
}

export function CompareLauncher({
  teams,
  isDemo = false,
  initialLeftId = '',
  initialRightId = '',
  initialVenue = 'all',
}: CompareLauncherProps) {
  const router = useRouter();
  const [leftId, setLeftId] = useState(initialLeftId || (teams[0]?.id ?? ''));
  const [rightId, setRightId] = useState(
    initialRightId || (teams[1]?.id ?? teams[0]?.id ?? '')
  );
  const [venue, setVenue] = useState<'all' | 'home' | 'away'>(initialVenue);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leftId || !rightId) {
      setValidationError('Please select two clubs to compare.');
      return;
    }
    if (leftId === rightId) {
      setValidationError('Please select two distinct clubs.');
      return;
    }
    setValidationError(null);

    const params = new URLSearchParams();
    params.set('season', '2024');
    params.set('left', leftId);
    params.set('right', rightId);
    if (venue !== 'all') {
      params.set('venue', venue);
    }
    if (isDemo) {
      params.set('demo', 'true');
    }

    router.push(`/compare?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleCompare}
      className="p-5 rounded-xl border border-white/10 bg-[#12151c]/90 shadow-xl space-y-4"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
        <Scale className="w-4 h-4 text-emerald-400" />
        <span>Compare Evidence Engine</span>
      </div>

      {validationError && (
        <div className="text-xs text-rose-300 bg-rose-950/60 border border-rose-800/40 px-3 py-2 rounded-lg">
          {validationError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label htmlFor="select-left-club" className="block text-xs font-mono text-slate-400 mb-1">
            Club A
          </label>
          <select
            id="select-left-club"
            value={leftId}
            onChange={(e) => {
              setLeftId(e.target.value);
              setValidationError(null);
            }}
            className="w-full bg-[#0a0c10] border border-white/15 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id} disabled={t.id === rightId}>
                {t.name} {t.id === rightId ? '(Selected as Club B)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="select-right-club" className="block text-xs font-mono text-slate-400 mb-1">
            Club B
          </label>
          <select
            id="select-right-club"
            value={rightId}
            onChange={(e) => {
              setRightId(e.target.value);
              setValidationError(null);
            }}
            className="w-full bg-[#0a0c10] border border-white/15 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id} disabled={t.id === leftId}>
                {t.name} {t.id === leftId ? '(Selected as Club A)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="select-venue" className="block text-xs font-mono text-slate-400 mb-1">
            Venue Filter
          </label>
          <select
            id="select-venue"
            value={venue}
            onChange={(e) => setVenue(e.target.value as any)}
            className="w-full bg-[#0a0c10] border border-white/15 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="all">All Matches</option>
            <option value="home">Home Matches Only</option>
            <option value="away">Away Matches Only</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-md shadow-emerald-950/40"
        >
          <span>Launch Side-by-Side Comparison</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
