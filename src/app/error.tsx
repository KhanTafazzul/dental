'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ShieldCheck } from 'lucide-react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled runtime application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 selection:bg-teal-500 selection:text-slate-950 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-400 mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-white mb-2">Unexpected Application Event</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            An unexpected glitch occurred while rendering this view. Your patient records and appointments remain entirely secure.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" /> Try Reloading
          </button>

          <Link
            href="/"
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" /> Return Home
          </Link>
        </div>

        <div className="pt-4 border-t border-white/10 text-xs text-slate-400 flex items-center justify-center gap-3 flex-wrap">
          <Link href="/support" className="text-teal-400 font-semibold hover:underline flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Contact Patient Support & FAQ
          </Link>
          <span className="text-slate-600">•</span>
          <Link href="/dpdp" className="text-slate-400 hover:underline">DPDP Center</Link>
        </div>
      </div>
    </div>
  );
}
