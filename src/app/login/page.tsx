'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail, Building2, Shield, User, CheckCircle2 } from 'lucide-react';
import { setStoredSession, UserRole, formatRepNameFromEmail } from '@/lib/session';

const KNOWN_TENANTS: Record<string, { name: string; code: string; defaultRep: string }> = {
  'appointmentlyy.com': { name: 'Appointmentlyy', code: 'APPOINTMENTLYY', defaultRep: 'Emil Halili' },
  'apexglobalbpo.ph': { name: 'Apex Global BPO', code: 'APEX-GLOBAL', defaultRep: 'Julian Vance' },
  'apexglobal.ph': { name: 'Apex Global BPO', code: 'APEX-GLOBAL', defaultRep: 'Julian Vance' },
  'shorepartners.ph': { name: 'ShorePartners BPO', code: 'SHORE-PARTNERS', defaultRep: 'Sarah Jenkins' },
  'cloudstaff.ph': { name: 'CloudStaff Outsourcing', code: 'CLOUD-STAFF', defaultRep: 'Marcus Vance' },
  'vanguard.ph': { name: 'Vanguard BPO Solutions', code: 'VANGUARD-PH', defaultRep: 'Paolo Reyes' },
  'taskforce.ph': { name: 'TaskForce Manila', code: 'TASKFORCE-MNL', defaultRep: 'Nicole Bautista' },
};

function resolveTenant(email: string) {
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length < 2) {
    return { name: 'Appointmentlyy', code: 'APPOINTMENTLYY', defaultRep: 'Emil Halili' };
  }
  const domain = parts[1];
  if (KNOWN_TENANTS[domain]) {
    return KNOWN_TENANTS[domain];
  }
  const root = domain.split('.')[0];
  const formatted = root.charAt(0).toUpperCase() + root.slice(1);
  return {
    name: `${formatted} BPO`,
    code: `${root.toUpperCase()}-TENANT`,
    defaultRep: formatRepNameFromEmail(email),
  };
}

export default function SdrLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('emil@appointmentlyy.com');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRole] = useState<UserRole>('Super Admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    const tenant = resolveTenant(email);
    const repName = formatRepNameFromEmail(email) || tenant.defaultRep;

    setStoredSession({
      role,
      tenantName: tenant.name,
      tenantCode: tenant.code,
      email: email.trim(),
      repName,
      isAuthenticated: true,
    });

    setSuccessMsg(`Welcome, ${repName}. Launching ${tenant.name}...`);

    setTimeout(() => {
      if (role === 'Super Admin' || role === 'Admin') {
        router.push('/admin');
      } else {
        router.push('/cockpit');
      }
    }, 400);
  };

  const setQuickDemo = (demoEmail: string, demoRole: UserRole) => {
    setEmail(demoEmail);
    setRole(demoRole);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col justify-between font-sans px-4">
      {/* Top minimal header */}
      <header className="w-full max-w-md mx-auto pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
            A
          </div>
          <span className="font-bold text-sm tracking-tight text-zinc-900">
            APPOINTMENTLYY <span className="text-zinc-500 font-normal">SDR</span>
          </span>
        </div>
        <Link
          href="http://localhost:3000"
          className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          ← Main website
        </Link>
      </header>

      {/* Main card */}
      <main className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-white rounded-2xl p-7 border border-zinc-200 shadow-sm">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight text-zinc-950">
              Sign in to Workspace
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Access AI Boris calling floor, sparring arena, and management controls.
            </p>
          </div>

          {/* Quick Demo Segmented Buttons */}
          <div className="mb-5 p-2 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-600 px-1">
              <span>Quick Demo Workspaces</span>
              <span className="text-[10px] text-zinc-400 font-mono">1-click fill</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setQuickDemo('emil@appointmentlyy.com', 'Super Admin')}
                className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors border ${
                  email.includes('emil') && role === 'Super Admin'
                    ? 'bg-zinc-900 text-white border-zinc-900 font-medium'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                <div className="font-semibold truncate">Appointmentlyy</div>
                <div className="text-[10px] opacity-70">CEO / Super Admin</div>
              </button>

              <button
                type="button"
                onClick={() => setQuickDemo('julian.vance@apexglobalbpo.ph', 'Super Admin')}
                className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors border ${
                  email.includes('julian') && role === 'Super Admin'
                    ? 'bg-zinc-900 text-white border-zinc-900 font-medium'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                <div className="font-semibold truncate">Apex Global</div>
                <div className="text-[10px] opacity-70">Floor Admin</div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Active Role
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 rounded-lg text-xs font-medium">
                {(['Rep', 'Manager', 'Super Admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-1.5 rounded-md transition-all text-center ${
                      role === r
                        ? 'bg-white text-zinc-950 font-bold shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-950'
                    }`}
                  >
                    {r === 'Super Admin' ? 'Admin' : r}
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 transition-colors"
                />
              </div>
            </div>

            {successMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {role}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full max-w-md mx-auto py-6 text-center text-xs text-zinc-400">
        © 2026 Appointmentlyy AI • Ultra-Minimalist Outbound Systems
      </footer>
    </div>
  );
}
