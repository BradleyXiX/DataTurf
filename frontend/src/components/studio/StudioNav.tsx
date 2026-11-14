import Link from 'next/link';
import { Compass, Scale, ShieldCheck } from 'lucide-react';

interface StudioNavProps {
  isDemo?: boolean;
  seasonLabel?: string;
  sourceAttribution?: string;
  currentRoute?: 'explore' | 'compare' | 'club';
}

export function StudioNav({
  isDemo = false,
  seasonLabel = '2024/2025',
  sourceAttribution = 'Data provided by football-data.org',
  currentRoute = 'explore',
}: StudioNavProps) {
  const querySuffix = isDemo ? '?demo=true' : '';

  return (
    <header className="border-b border-white/10 bg-[#0e1117]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link
            href={`/${querySuffix}`}
            className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-lg py-1 px-1.5"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base">
              DT
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-100 text-sm tracking-wide leading-none">
                DataTurf
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                PL Research Studio
              </span>
            </div>
          </Link>

          <nav aria-label="Studio Navigation" className="hidden sm:flex items-center gap-1 text-sm font-medium">
            <Link
              href={`/${querySuffix}`}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentRoute === 'explore'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore</span>
            </Link>
            <Link
              href={`/compare${querySuffix}`}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentRoute === 'compare'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Compare</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-mono text-slate-300">
            {seasonLabel}
          </span>
          <span
            className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-500"
            title={sourceAttribution}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>{isDemo ? 'Demo Fixtures' : 'football-data.org'}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
