'use client';

import React from 'react';
import Sidebar from '../../components/layout/sidebar';
import Navbar from '../../components/layout/navbar';
import { useAuth } from '../../context/auth.context';
import { Loader2 } from 'lucide-react';

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0d0e12] text-white">
        <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
        <span>Loading portal session...</span>
      </div>
    );
  }

  if (!user) {
    return null; // Let middleware redirect
  }

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white flex">
      {/* Sidebar - Fixed Left */}
      <Sidebar />

      {/* Main Panel Content Area */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar />

        {/* Dynamic Content */}
        <main className="p-6 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
