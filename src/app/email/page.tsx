'use client';

import React, { Suspense } from 'react';
import AppSidebar from '@/components/AppSidebar';
import GlobalTopHeader from '@/components/GlobalTopHeader';
import ColdEmailStudio from '@/components/email/ColdEmailStudio';

export default function ColdEmailPage() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50/70 font-sans antialiased text-zinc-900">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <GlobalTopHeader />
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={
            <div className="p-8 flex items-center justify-center text-xs text-zinc-400">
              Loading Cold Email Studio...
            </div>
          }>
            <ColdEmailStudio />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
