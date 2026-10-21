'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppSidebar from '@/components/AppSidebar';
import GlobalTopHeader from '@/components/GlobalTopHeader';
import WorkflowAutomationStudio from '@/components/admin/WorkflowAutomationStudio';
import { ShieldAlert, Lock, ArrowLeft, KeyRound } from 'lucide-react';

export default function WorkflowsStandalonePage() {
  const [userRole, setUserRole] = useState<string>('Super Admin');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check saved role from localStorage
    const savedRole = localStorage.getItem('user_role');
    if (savedRole) {
      setUserRole(savedRole);
    } else {
      // Default to Super Admin so admins have immediate access
      localStorage.setItem('user_role', 'Super Admin');
      setUserRole('Super Admin');
    }
    setIsLoading(false);
  }, []);

  const isAdmin = userRole === 'Super Admin' || userRole === 'Admin' || userRole === 'Manager';

  const handleElevateToAdmin = () => {
    localStorage.setItem('user_role', 'Super Admin');
    setUserRole('Super Admin');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F2F0EF] font-sans antialiased text-[#222021]">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <GlobalTopHeader />

        <main className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <span className="h-6 w-6 rounded-full border-2 border-[#ED1C24] border-t-transparent animate-spin" />
            </div>
          ) : !isAdmin ? (
            /* ACCESS RESTRICTED GATE FOR NON-ADMIN USERS */
            <div className="max-w-md mx-auto my-auto py-16 text-center space-y-5 bg-white border border-[#222021]/15 rounded-3xl p-8 shadow-sm">
              <div className="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="h-7 w-7" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Role Restricted: {userRole}
                </span>
                <h2 className="text-xl font-black text-[#222021] mt-2">Admin Clearance Required</h2>
                <p className="text-xs text-[#6b6968] mt-1.5 leading-relaxed">
                  The Workflow Automation Studio executes live webhook triggers, CRM synchronization, and LLM evaluations. Only tenant Administrators and Managers can access this pipeline builder.
                </p>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2">
                <Link
                  href="/"
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-[#222021] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Return to Mission</span>
                </Link>

                <button
                  onClick={handleElevateToAdmin}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <KeyRound className="h-4 w-4" />
                  <span>Elevate to Super Admin</span>
                </button>
              </div>
            </div>
          ) : (
            /* FULL WORKFLOW STUDIO FOR ADMIN USERS */
            <div className="space-y-6">
              {/* Standalone Breadcrumb & Access Pill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-[#6b6968]">
                  <Link href="/admin" className="hover:text-[#222021] font-semibold transition-colors">
                    Admin
                  </Link>
                  <span>/</span>
                  <span className="font-bold text-[#222021]">Workflow Automation Studio</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Admin Clearance: {userRole}</span>
                  </span>
                </div>
              </div>

              {/* n8n Workflow Studio Component */}
              <WorkflowAutomationStudio />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
