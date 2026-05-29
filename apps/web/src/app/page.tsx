'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/auth.context';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0d0e12] text-white">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
      <span className="text-gray-400 text-sm">Redirecting to session...</span>
    </div>
  );
}
