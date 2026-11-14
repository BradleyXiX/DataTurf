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
    <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-[#12151c] border border-white/10 shadow-2xl text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-6">
        <ShieldAlert className="w-7 h-7" aria-hidden="true" />
      </div>

      <h2 className="text-2xl font-bold text-slate-100 tracking-tight mb-3">
        Real Premier League Snapshot Unavailable
      </h2>

      <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
        {reason} DataTurf is configured for zero-budget production safety: we never invent live data and require an
        authorized provider snapshot to publish live standings and game-trace evidence.
      </p>

      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-left text-xs sm:text-sm text-slate-400 mb-8 space-y-2">
        <div className="font-semibold text-slate-300 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Production Isolation & Policy:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-400">
          <li>Fixture imports cannot write to the real snapshot path (<code className="text-slate-300">snapshot.json</code>).</li>
          <li>Normal routes reject demo fixtures without explicit user opt-in.</li>
          <li>To import live records, configure <code className="text-slate-300">FOOTBALL_DATA_API_KEY</code> and run the importer.</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href={demoUrl}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-lg shadow-emerald-950/40"
        >
          <span>Explore with Labeled Demo Fixtures</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          <span>Retry Live Check</span>
        </Link>
      </div>
    </div>
  );
}
