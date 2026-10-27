'use client';

import React from 'react';
import AppSidebar from '@/components/AppSidebar';
import GlobalTopHeader from '@/components/GlobalTopHeader';
import GtmVideoTeaserCinema from '@/components/teaser/GtmVideoTeaserCinema';

export default function TeaserCinemaPage() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50/70 font-sans antialiased text-zinc-900">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <GlobalTopHeader />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          <GtmVideoTeaserCinema />
        </main>
      </div>
    </div>
  );
}
