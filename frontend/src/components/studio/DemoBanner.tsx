import Link from 'next/link';
import { AlertTriangle, X } from 'lucide-react';

interface DemoBannerProps {
  currentPath?: string;
}

export function DemoBanner({ currentPath = '/' }: DemoBannerProps) {
  // Strip demo=true from current path to allow exiting demo mode
  const exitUrl = currentPath.includes('?')
    ? currentPath.replace(/[?&]demo=true/, '').replace(/\?$/, '') || '/'
    : currentPath;

  return (
    <div
      role="alert"
      className="bg-amber-950/80 border-b border-amber-600/40 text-amber-200 px-4 py-2 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 sticky top-0 z-50 backdrop-blur-md"
    >
      <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
        <span className="font-semibold text-amber-300">DEMO MODE ACTIVE:</span>
        <span className="text-amber-200/90 text-xs sm:text-sm">
          Viewing local deterministic fixture records. Real Premier League live snapshot is not imported.
        </span>
      </div>
      <Link
        href={exitUrl}
        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-amber-900/60 hover:bg-amber-800/80 text-amber-100 border border-amber-600/30 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
        title="Exit Demo Mode"
      >
        <span>Exit Demo</span>
        <X className="w-3 h-3" aria-hidden="true" />
      </Link>
    </div>
  );
}
