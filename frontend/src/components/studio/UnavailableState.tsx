import Link from 'next/link';
import { Database, ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react';

interface UnavailableStateProps {
  reason?: string;
  demoUrl?: string;
}

export function UnavailableState({
  reason = 'Live Premier League snapshot is currently unavailable.',
  demoUrl = '/?demo=true',
}: UnavailableStateProps) {
  return (
    <div className="max-w-2xl mx-auto my-8 sm:my-12 p-5 sm:p-8 rounded-lg bg-[#0d1015] border border-white/[0.08] text-center">
      <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-5">
        <ShieldAlert className="w-6 h-6" aria-hidden="true" />
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 tracking-tight mb-2.5">
        Real Premier League Snapshot Unavailable
      </h2>

      <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6 font-mono">
        {reason} DataTurf is configured for zero-budget production safety: we never invent live data and require an
        authorized provider snapshot to publish live standings and game-trace evidence.
      </p>

      <div className="p-4 rounded-md bg-white/[0.02] border border-white/[0.06] text-left text-xs text-zinc-400 mb-6 space-y-2 font-mono">
        <div className="font-semibold text-zinc-300 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Production Isolation & Policy:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-zinc-400">
          <li>Fixture imports cannot write to the real snapshot path (<code className="text-zinc-300">snapshot.json</code>).</li>
          <li>Normal routes reject demo fixtures without explicit user opt-in.</li>
          <li>To import live records, configure <code className="text-zinc-300">FOOTBALL_DATA_API_KEY</code> and run the importer.</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href={demoUrl}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs font-mono transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
        >
          <span>Explore with Labeled Demo Fixtures</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] text-xs font-mono transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          <span>Retry Live Check</span>
        </Link>
      </div>
    </div>
  );
}
