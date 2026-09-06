'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <h1 className="text-2xl font-bold text-white">Critical System Reset Needed</h1>
          <p className="text-xs text-slate-400">
            A critical framework rendering issue occurred. Please click below to refresh the application state.
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-3 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs"
          >
            Reset Application
          </button>
        </div>
      </body>
    </html>
  );
}
