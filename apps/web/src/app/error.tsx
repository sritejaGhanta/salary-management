'use client';

import React, { useEffect } from 'react';
import { AlertOctagon } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Captured error boundary exception:', error);
  }, [error]);

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0d0e12] relative overflow-hidden px-4">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-red-500/5 blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-violet-600/5 blur-[150px]" />

      <div className="z-10 text-center max-w-md space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 mb-2">
          <AlertOctagon size={32} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Something went wrong!
          </h1>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            An unexpected error occurred. Please try again or return to the dashboard.
          </p>
        </div>

        {error && error.message && (
          <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400/80 font-mono text-[11px] max-w-sm mx-auto overflow-auto max-h-24">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 text-xs font-semibold text-gray-400 hover:text-white bg-transparent hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl transition"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-lg shadow-blue-600/20 text-center"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
