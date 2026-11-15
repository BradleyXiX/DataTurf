import Link from 'next/link';
import { PitchArtwork } from './PitchArtwork';

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
    <header className="border-b border-white/[0.08] bg-[#090b0e]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link
            href={`/${querySuffix}`}
            className="flex items-center gap-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-400/80 rounded py-1 px-1 transition-opacity hover:opacity-90"
            aria-label="DataTurf Premier League Research Studio Home"
          >
            <PitchArtwork variant="mark" className="w-7 h-7 shrink-0" />
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-white text-sm tracking-tight">
                DataTurf
              </span>
              <span className="text-[10px] text-emerald-400/90 font-mono tracking-wider uppercase hidden xs:inline">
                Research Studio
              </span>
            </div>
          </Link>

          <nav aria-label="Studio Navigation" className="flex items-center gap-1 text-xs">
            <Link
              href={`/${querySuffix}`}
              className={`px-2.5 py-1 rounded transition-colors ${
                currentRoute === 'explore'
                  ? 'bg-white/[0.08] text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              Explore
            </Link>
            <Link
              href={`/compare${querySuffix}`}
              className={`px-2.5 py-1 rounded transition-colors ${
                currentRoute === 'compare'
                  ? 'bg-white/[0.08] text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              Compare
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-zinc-400 border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 rounded text-[11px]">
            EPL {seasonLabel}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-zinc-500">
            <span className={`w-1.5 h-1.5 rounded-full ${isDemo ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <span>{isDemo ? 'Demo Fixtures' : 'football-data.org'}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
