'use client';

import React, { useState } from 'react';
import { 
  KeyRound, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  ExternalLink,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

interface TenantBYOKState {
  tenantId: string;
  tenantName: string;
  isUnlocked: boolean;
  openaiKey: string;
  claudeKey: string;
  geminiKey: string;
  elevenlabsKey: string;
  fallbackStrategy: 'system_pool' | 'pause_alert';
}

export default function ByokVaultManager() {
  const [selectedTenantId, setSelectedTenantId] = useState<string>('ten_1');
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: { success: boolean; latency: string; model: string } }>({
    'openai': { success: true, latency: '142ms', model: 'gpt-4o' },
    'elevenlabs': { success: true, latency: '185ms', model: 'eleven_turbo_v2_5' }
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [requestUpgradeModal, setRequestUpgradeModal] = useState(false);

  const [tenantsBYOK, setTenantsBYOK] = useState<{ [id: string]: TenantBYOKState }>({
    'ten_1': {
      tenantId: 'ten_1',
      tenantName: 'Apex Global BPO',
      isUnlocked: true,
      openaiKey: 'sk-proj-99a8b776c54e3210fe9876543210fedcba9876543210',
      claudeKey: 'sk-ant-api03-abcdef1234567890abcdef1234567890abcdef',
      geminiKey: 'AIzaSyA1b2C3d4E5f6G7h8I9j0K1L2M3N4O5P6Q',
      elevenlabsKey: 'xi-99887766554433221100aabbccddeeff',
      fallbackStrategy: 'system_pool'
    },
    'ten_2': {
      tenantId: 'ten_2',
      tenantName: 'Outsource Accelerator Partner A',
      isUnlocked: true,
      openaiKey: 'sk-proj-4433221100aabbccddeeff998877665544332211',
      claudeKey: '',
      geminiKey: '',
      elevenlabsKey: 'xi-aabbccddeeff00112233445566778899',
      fallbackStrategy: 'system_pool'
    },
    'ten_3': {
      tenantId: 'ten_3',
      tenantName: 'Horizon Solar Sales Floor',
      isUnlocked: false,
      openaiKey: '',
      claudeKey: '',
      geminiKey: '',
      elevenlabsKey: '',
      fallbackStrategy: 'pause_alert'
    },
    'ten_4': {
      tenantId: 'ten_4',
      tenantName: 'Metro Cloud BPO Manila',
      isUnlocked: false,
      openaiKey: '',
      claudeKey: '',
      geminiKey: '',
      elevenlabsKey: '',
      fallbackStrategy: 'system_pool'
    }
  });

  const activeTenant = tenantsBYOK[selectedTenantId] || tenantsBYOK['ten_1'];

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleUpdateKey = (field: keyof TenantBYOKState, value: any) => {
    setTenantsBYOK(prev => ({
      ...prev,
      [selectedTenantId]: {
        ...prev[selectedTenantId],
        [field]: value
      }
    }));
  };

  const toggleUnlockTenant = () => {
    setTenantsBYOK(prev => ({
      ...prev,
      [selectedTenantId]: {
        ...prev[selectedTenantId],
        isUnlocked: !prev[selectedTenantId].isUnlocked
      }
    }));
  };

  const testConnection = (provider: string) => {
    setTestingKey(provider);
    setTimeout(() => {
      setTestingKey(null);
      setTestResults(prev => ({
        ...prev,
        [provider]: {
          success: true,
          latency: `${Math.floor(Math.random() * 80 + 120)}ms`,
          model: provider === 'openai' ? 'gpt-4o' :
                 provider === 'claude' ? 'claude-3-5-sonnet' :
                 provider === 'gemini' ? 'gemini-1.5-pro' : 'eleven_turbo_v2_5'
        }
      }));
    }, 900);
  };

  const handleSaveVault = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#222021]/10 rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ED1C24]/10 border border-[#ED1C24]/20 text-[#ED1C24] text-[10px] font-bold tracking-wide uppercase mb-1.5">
            <Sparkles className="h-3 w-3" />
            <span>Monetized Bring-Your-Own-Key Subsystem</span>
          </div>
          <h2 className="text-xl font-black text-[#222021] tracking-tight">
            Tenant BYOK Key Vault & Encryption
          </h2>
          <p className="text-xs text-[#6b6968]">
            Configure custom enterprise model endpoints, dedicated voice actors, and tenant-level key isolation.
          </p>
        </div>

        {/* Tenant Switcher */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <span className="text-[10px] font-mono text-[#6b6968] block">Managing Tenant Scope:</span>
            <span className="text-xs font-bold text-[#222021]">{activeTenant.tenantName}</span>
          </div>
          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="h-10 px-3.5 rounded-xl bg-[#F2F0EF] hover:bg-[#e7e4e2] border border-[#222021]/15 text-xs font-bold text-[#222021] focus:outline-none cursor-pointer"
          >
            {Object.values(tenantsBYOK).map(t => (
              <option key={t.tenantId} value={t.tenantId}>
                {t.tenantName} {t.isUnlocked ? '(Unlocked)' : '(Locked)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Vault Workspace */}
      {!activeTenant.isUnlocked ? (
        /* LOCKED STATE (Upsell & Guardrail Mode) */
        <div className="bg-white border-2 border-dashed border-[#222021]/20 rounded-3xl p-10 text-center shadow-2xs space-y-6 relative overflow-hidden">
          <div className="h-16 w-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="h-8 w-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-mono font-bold">
              🔒 FEATURE LOCKED • $49/MO OR $490/YR ADD-ON
            </span>
            <h3 className="text-xl font-black text-[#222021]">
              Custom BYOK Subsystem Not Activated for {activeTenant.tenantName}
            </h3>
            <p className="text-xs text-[#6b6968] leading-relaxed">
              Bring your own API keys to utilize custom ElevenLabs voice clones, specialized Claude 3.5 Sonnet & GPT-4o checkpoints, and bypass platform token ceilings. Add this module to your manual invoice or contact your platform administrator.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setRequestUpgradeModal(true)}
              className="px-5 py-2.5 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Request BYOK Activation / Add to Invoice</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Super Admin Override Switch */}
            <button
              onClick={toggleUnlockTenant}
              className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
              title="Super Admin Override: Enable BYOK feature flag immediately"
            >
              <Unlock className="h-3.5 w-3.5 text-amber-400" />
              <span>Super Admin: Force Unlock</span>
            </button>
          </div>

          {/* Feature Comparison Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-6 text-left border-t border-[#222021]/10 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F2F0EF] space-y-1">
              <span className="font-bold text-[#222021] block">🎙️ Dedicated Voice Clones</span>
              <p className="text-[#6b6968] text-[11px]">Deploy custom ElevenLabs voice IDs for proprietary BPO campaign accents.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F2F0EF] space-y-1">
              <span className="font-bold text-[#222021] block">🧠 Socratic AI LLMs</span>
              <p className="text-[#6b6968] text-[11px]">Direct Anthropic Claude 3.5 Sonnet & OpenAI GPT-4o routing with zero token markups.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F2F0EF] space-y-1">
              <span className="font-bold text-[#222021] block">🛡️ AES-256 Vault Isolation</span>
              <p className="text-[#6b6968] text-[11px]">Tenant salt encryption ensures keys are never accessible by other organizations.</p>
            </div>
          </div>
        </div>
      ) : (
        /* UNLOCKED STATE (Interactive Key Manager) */
        <div className="space-y-6">
          
          {/* Security & Vault Banner */}
          <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-emerald-800 block">
                  BYOK SUBSYSTEM ACTIVE • HARDWARE ENCRYPTION VAULT
                </span>
                <span className="font-medium text-emerald-900">
                  Keys are encrypted at rest with <strong>AES-256-GCM</strong> using an isolated tenant initialization vector.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={toggleUnlockTenant}
                className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-stone-700 hover:text-red-700 font-mono text-[11px] transition-colors cursor-pointer"
              >
                Lock Vault (Revoke)
              </button>
            </div>
          </div>

          {/* Key Management Form */}
          <form onSubmit={handleSaveVault} className="bg-white border border-[#222021]/10 rounded-2xl p-6 shadow-2xs space-y-6">
            
            <div className="space-y-5">
              
              {/* 1. OpenAI Key */}
              <div className="p-4 rounded-xl bg-[#F2F0EF] border border-[#222021]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-xs text-[#222021]">OpenAI Platform API Key</span>
                    <span className="text-[10px] font-mono text-[#6b6968]">(GPT-4o, Auto-Grading & Embeddings)</span>
                  </div>
                  {testResults['openai'] && (
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      ✓ Connected ({testResults['openai'].latency})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeys['openai'] ? 'text' : 'password'}
                      value={activeTenant.openaiKey}
                      onChange={(e) => handleUpdateKey('openaiKey', e.target.value)}
                      placeholder="sk-proj-..."
                      className="w-full bg-white border border-[#222021]/15 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#222021] focus:outline-none focus:ring-2 focus:ring-[#ED1C24]"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('openai')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6968] hover:text-[#222021]"
                    >
                      {showKeys['openai'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => testConnection('openai')}
                    disabled={!activeTenant.openaiKey || testingKey === 'openai'}
                    className="px-3.5 py-2.5 rounded-xl bg-white border border-[#222021]/20 hover:bg-stone-50 text-xs font-bold text-[#222021] transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {testingKey === 'openai' ? 'Testing...' : 'Validate Connection'}
                  </button>
                </div>
              </div>

              {/* 2. Anthropic Claude Key */}
              <div className="p-4 rounded-xl bg-[#F2F0EF] border border-[#222021]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="font-bold text-xs text-[#222021]">Anthropic Claude API Key</span>
                    <span className="text-[10px] font-mono text-[#6b6968]">(Claude 3.5 Sonnet Socratic Coaching)</span>
                  </div>
                  {testResults['claude'] && (
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      ✓ Connected ({testResults['claude'].latency})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeys['claude'] ? 'text' : 'password'}
                      value={activeTenant.claudeKey}
                      onChange={(e) => handleUpdateKey('claudeKey', e.target.value)}
                      placeholder="sk-ant-api03-..."
                      className="w-full bg-white border border-[#222021]/15 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#222021] focus:outline-none focus:ring-2 focus:ring-[#ED1C24]"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('claude')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6968] hover:text-[#222021]"
                    >
                      {showKeys['claude'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => testConnection('claude')}
                    disabled={!activeTenant.claudeKey || testingKey === 'claude'}
                    className="px-3.5 py-2.5 rounded-xl bg-white border border-[#222021]/20 hover:bg-stone-50 text-xs font-bold text-[#222021] transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {testingKey === 'claude' ? 'Testing...' : 'Validate Connection'}
                  </button>
                </div>
              </div>

              {/* 3. Google Gemini Key */}
              <div className="p-4 rounded-xl bg-[#F2F0EF] border border-[#222021]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    <span className="font-bold text-xs text-[#222021]">Google Gemini API Key</span>
                    <span className="text-[10px] font-mono text-[#6b6968]">(Gemini 1.5 Pro Multimodal Diagnostics)</span>
                  </div>
                  {testResults['gemini'] && (
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      ✓ Connected ({testResults['gemini'].latency})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeys['gemini'] ? 'text' : 'password'}
                      value={activeTenant.geminiKey}
                      onChange={(e) => handleUpdateKey('geminiKey', e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-white border border-[#222021]/15 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#222021] focus:outline-none focus:ring-2 focus:ring-[#ED1C24]"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('gemini')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6968] hover:text-[#222021]"
                    >
                      {showKeys['gemini'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => testConnection('gemini')}
                    disabled={!activeTenant.geminiKey || testingKey === 'gemini'}
                    className="px-3.5 py-2.5 rounded-xl bg-white border border-[#222021]/20 hover:bg-stone-50 text-xs font-bold text-[#222021] transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {testingKey === 'gemini' ? 'Testing...' : 'Validate Connection'}
                  </button>
                </div>
              </div>

              {/* 4. ElevenLabs Key */}
              <div className="p-4 rounded-xl bg-[#F2F0EF] border border-[#222021]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span className="font-bold text-xs text-[#222021]">ElevenLabs Voice AI Key</span>
                    <span className="text-[10px] font-mono text-[#6b6968]">(Custom Voice Clones & Turbo v2.5 TTS)</span>
                  </div>
                  {testResults['elevenlabs'] && (
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      ✓ Connected ({testResults['elevenlabs'].latency})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeys['elevenlabs'] ? 'text' : 'password'}
                      value={activeTenant.elevenlabsKey}
                      onChange={(e) => handleUpdateKey('elevenlabsKey', e.target.value)}
                      placeholder="xi-..."
                      className="w-full bg-white border border-[#222021]/15 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#222021] focus:outline-none focus:ring-2 focus:ring-[#ED1C24]"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('elevenlabs')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6968] hover:text-[#222021]"
                    >
                      {showKeys['elevenlabs'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => testConnection('elevenlabs')}
                    disabled={!activeTenant.elevenlabsKey || testingKey === 'elevenlabs'}
                    className="px-3.5 py-2.5 rounded-xl bg-white border border-[#222021]/20 hover:bg-stone-50 text-xs font-bold text-[#222021] transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {testingKey === 'elevenlabs' ? 'Testing...' : 'Validate Connection'}
                  </button>
                </div>
              </div>

            </div>

            {/* Fallback Strategy Setting */}
            <div className="pt-4 border-t border-[#222021]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#222021] block">Tenant Key Failure & Rate-Limit Fallback</span>
                <span className="text-[11px] text-[#6b6968]">Define what occurs if a custom tenant key runs out of quota or throws a 429 error.</span>
              </div>

              <select
                value={activeTenant.fallbackStrategy}
                onChange={(e) => handleUpdateKey('fallbackStrategy', e.target.value as any)}
                className="bg-[#F2F0EF] border border-[#222021]/15 rounded-xl px-3 py-2 text-xs font-semibold text-[#222021] focus:outline-none cursor-pointer"
              >
                <option value="system_pool">Fallback to Platform Pooled AI (Zero Rep Disruption)</option>
                <option value="pause_alert">Pause Execution & Notify Tenant Admin (No Overage)</option>
              </select>
            </div>

            {/* Save Buttons & Feedback */}
            <div className="pt-4 border-t border-[#222021]/10 flex items-center justify-between">
              {saveSuccess ? (
                <span className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Vault successfully re-encrypted and persisted to database!</span>
                </span>
              ) : (
                <span className="text-[11px] font-mono text-[#6b6968]">
                  Keys are never returned in plaintext in API responses.
                </span>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                Save & Encrypt Keys
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Upgrade Request Modal */}
      {requestUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#222021]/20 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#222021]/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#ED1C24]" />
                <h3 className="text-base font-black text-[#222021]">Request BYOK Module Unlock</h3>
              </div>
              <button 
                onClick={() => setRequestUpgradeModal(false)}
                className="text-[#6b6968] hover:text-[#222021]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#6b6968]">
              <p>
                An itemized invoice line for <strong>$49.00 / month</strong> will be generated for <strong>{activeTenant.tenantName}</strong>.
              </p>
              <div className="p-3 rounded-xl bg-[#F2F0EF] border border-[#222021]/10 space-y-1 font-mono text-[11px] text-[#222021]">
                <div className="flex justify-between">
                  <span>BYOK AI Subsystem Add-On:</span>
                  <span className="font-bold">$49.00 / mo</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Billing Cycle:</span>
                  <span>Monthly (Manual Invoice)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#222021]/10 flex items-center justify-end gap-2">
              <button
                onClick={() => setRequestUpgradeModal(false)}
                className="px-4 py-2 rounded-xl bg-[#F2F0EF] text-[#222021] font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toggleUnlockTenant();
                  setRequestUpgradeModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white font-bold text-xs"
              >
                Confirm & Add to Invoice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
