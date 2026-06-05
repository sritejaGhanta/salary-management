'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/auth.context';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0d0e12] text-white">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0d0e12] relative overflow-hidden px-4">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[150px]" />

      <div className="z-10 text-center max-w-md space-y-6">
        <h1 className="text-gray-200 text-9xl font-bold tracking-tighter select-none">
          404
        </h1>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-700">
            Page Not Found
          </h2>
          <p className="text-gray-500 text-sm">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto px-6 py-3 text-xs font-semibold text-gray-400 hover:text-white bg-transparent hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl transition"
          >
            Go Back
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-lg shadow-blue-600/20 text-center"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
