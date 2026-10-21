'use client';

import React from 'react';
import AppSidebar from '@/components/AppSidebar';
import GlobalTopHeader from '@/components/GlobalTopHeader';
import LiveMonitoringCenter from '@/components/LiveMonitoringCenter';

export default function LiveMonitoringPage() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F2F0EF] font-sans antialiased text-[#222021]">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <GlobalTopHeader />
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <LiveMonitoringCenter />
        </main>
      </div>
    </div>
  );
}
