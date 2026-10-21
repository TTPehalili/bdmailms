'use client';

import React, { useState } from 'react';
import { 
  KeyRound, 
  Terminal, 
  Copy, 
  Check, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Radio, 
  ExternalLink,
  Sparkles,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function McpDeveloperGateway() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState('Apex Global BPO');

  const mcpToken = 'mcp_tok_apex-global_e8910b2f9014a678c432d';
  const apiKey = 'lms_live_sk_899201a4e7c3b29910d554';
  const webhookUrl = 'https://appointmentlyy-sdr.up.railway.app/api/webhooks/inbound/apex-global/universal';

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#222021]/10 rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ED1C24]/10 border border-[#ED1C24]/20 text-[#ED1C24] text-[10px] font-bold tracking-wide uppercase mb-1.5">
            <Cpu className="h-3 w-3" />
            <span>Developer Ingress & Autonomous Agent Bridge</span>
          </div>
          <h2 className="text-xl font-black text-[#222021] tracking-tight">
            Multi-Tenant Model Context Protocol (MCP) & API Gateway
          </h2>
          <p className="text-xs text-[#6b6968]">
            Grant Cursor, Claude Desktop, and autonomous SDR AI agents isolated access to query sparring scores, assigned leads, and curriculum battlecards.
          </p>
        </div>

        <select
          value={selectedTenant}
          onChange={(e) => setSelectedTenant(e.target.value)}
          className="h-10 px-3.5 rounded-xl bg-[#F2F0EF] border border-[#222021]/15 text-xs font-bold text-[#222021] cursor-pointer"
        >
          <option value="Apex Global BPO">Apex Global BPO</option>
          <option value="Outsource Accelerator Partner A">Outsource Accelerator Partner A</option>
          <option value="Horizon Solar Sales Floor">Horizon Solar</option>
        </select>
      </div>

      {/* 1. MODEL CONTEXT PROTOCOL (MCP) CARD */}
      <div className="bg-white border border-[#222021]/10 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-lg shrink-0">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-[#222021]">Model Context Protocol (MCP) Server Handshake</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#6b6968] mt-0.5">
                Bearer handshake token bound strictly to <strong>{selectedTenant}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Token Box */}
        <div className="p-3.5 rounded-xl bg-[#F2F0EF] border border-[#222021]/10 flex items-center justify-between gap-3">
          <div className="font-mono text-xs text-[#222021] truncate">
            <span className="text-[#6b6968] mr-2">Authorization: Bearer</span>
            <span className="font-bold">{mcpToken}</span>
          </div>

          <button
            onClick={() => copyText(mcpToken, 'mcp')}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#222021]/15 hover:bg-stone-50 text-xs font-bold text-[#222021] flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            {copiedToken === 'mcp' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedToken === 'mcp' ? 'Copied' : 'Copy Bearer'}</span>
          </button>
        </div>

        {/* Exposed MCP Resources Grid */}
        <div className="pt-2 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase text-[#6b6968] block">
            Exposed MCP URIs & Autonomous Agent Capabilities:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#222021]/10 space-y-1">
              <span className="font-mono font-bold text-purple-700 block text-[11px]">lms://{selectedTenant.toLowerCase().replace(/[^a-z0-9]/g, '-')}/leads</span>
              <p className="text-[11px] text-[#6b6968]">Fetch assigned B2B leads, company tech stacks, and current cadence stages.</p>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#222021]/10 space-y-1">
              <span className="font-mono font-bold text-purple-700 block text-[11px]">lms://{selectedTenant.toLowerCase().replace(/[^a-z0-9]/g, '-')}/sparring-sessions</span>
              <p className="text-[11px] text-[#6b6968]">Stream real-time sales rep objections, rubric scorecards, and ARM feedback.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PUBLIC REST API KEYS */}
      <div className="bg-white border border-[#222021]/10 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-[#222021]">Tenant REST API Credentials</h3>
            <p className="text-xs text-[#6b6968]">Public API keys for server-to-server integration with external dialers and CRMs.</p>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Rate Limit: 60 req/min
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F2F0EF] border border-[#222021]/10 flex items-center justify-between gap-3">
          <div className="font-mono text-xs text-[#222021] truncate">
            <span className="text-[#6b6968] mr-2">API Secret:</span>
            <span className="font-bold">{apiKey}</span>
          </div>

          <button
            onClick={() => copyText(apiKey, 'api')}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#222021]/15 hover:bg-stone-50 text-xs font-bold text-[#222021] flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            {copiedToken === 'api' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedToken === 'api' ? 'Copied' : 'Copy Key'}</span>
          </button>
        </div>
      </div>

      {/* 3. INBOUND WEBHOOK INGRESS GATEWAY */}
      <div className="bg-white border border-[#222021]/10 rounded-2xl p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-black text-[#222021]">Inbound Webhook Ingress Gateway</h3>
          <p className="text-xs text-[#6b6968]">Endpoint URL for receiving inbound events from GoHighLevel, HubSpot, or custom external dialers.</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F2F0EF] border border-[#222021]/10 flex items-center justify-between gap-3">
          <div className="font-mono text-xs text-[#222021] truncate">
            <span className="text-emerald-700 font-bold mr-2">POST</span>
            <span>{webhookUrl}</span>
          </div>

          <button
            onClick={() => copyText(webhookUrl, 'wh')}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#222021]/15 hover:bg-stone-50 text-xs font-bold text-[#222021] flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            {copiedToken === 'wh' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedToken === 'wh' ? 'Copied' : 'Copy URL'}</span>
          </button>
        </div>

        <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-700 text-[11px] font-mono">
          🔒 Verification Header: <span className="text-[#ED1C24]">X-Appointmentlyy-Signature: sha256=...</span> (Payloads validated in under 15ms).
        </div>
      </div>

    </div>
  );
}
