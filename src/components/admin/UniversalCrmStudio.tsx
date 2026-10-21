'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Zap, 
  ArrowRight,
  Sliders,
  Check,
  RotateCcw
} from 'lucide-react';

interface FieldMapping {
  id: string;
  lmsField: string;
  crmField: string;
  direction: 'Two-Way' | 'LMS-to-CRM' | 'CRM-to-LMS';
  syncTrigger: 'On Call Finished' | 'On Cert Passed' | 'Immediate';
}

interface CrmConnector {
  id: string;
  name: string;
  logo: string;
  category: string;
  isConnected: boolean;
  locationId?: string;
  syncFrequency: string;
  recordsSynced: number;
}

export default function UniversalCrmStudio() {
  const [activeTab, setActiveTab] = useState<'connectors' | 'mapper' | 'stream'>('mapper');
  const [retryingDlq, setRetryingDlq] = useState(false);
  const [dlqSuccess, setDlqSuccess] = useState(false);
  const [savedMappings, setSavedMappings] = useState(false);

  const [connectors, setConnectors] = useState<CrmConnector[]>([
    {
      id: 'ghl',
      name: 'GoHighLevel (GHL)',
      logo: '⚡',
      category: 'Agency Multi-Location CRM',
      isConnected: true,
      locationId: 'loc_apex_bpo_88192',
      syncFrequency: 'Real-time Webhook',
      recordsSynced: 342
    },
    {
      id: 'hubspot',
      name: 'HubSpot CRM',
      logo: '🟧',
      category: 'Enterprise Sales & Deal Pipeline',
      isConnected: true,
      locationId: 'portal_2948102',
      syncFrequency: 'Every 5 mins',
      recordsSynced: 128
    },
    {
      id: 'salesforce',
      name: 'Salesforce Enterprise',
      logo: '☁️',
      category: 'Global Enterprise CRM',
      isConnected: false,
      syncFrequency: 'OAuth 2.0 Webhook',
      recordsSynced: 0
    },
    {
      id: 'activecampaign',
      name: 'ActiveCampaign',
      logo: '🔵',
      category: 'Marketing Automation & Tags',
      isConnected: false,
      syncFrequency: 'REST API v3',
      recordsSynced: 0
    }
  ]);

  const [mappings, setMappings] = useState<FieldMapping[]>([
    {
      id: 'map-1',
      lmsField: 'Rep Name (Sales Representative)',
      crmField: 'contact.owner_name',
      direction: 'LMS-to-CRM',
      syncTrigger: 'On Call Finished'
    },
    {
      id: 'map-2',
      lmsField: 'AI Sparring Score (0 - 100%)',
      crmField: 'contact.custom_field_ai_sparring_score',
      direction: 'LMS-to-CRM',
      syncTrigger: 'On Call Finished'
    },
    {
      id: 'map-3',
      lmsField: 'Boris Certification Status',
      crmField: 'contact.tags ("BORIS_CERTIFIED_SDR")',
      direction: 'LMS-to-CRM',
      syncTrigger: 'On Cert Passed'
    },
    {
      id: 'map-4',
      lmsField: 'Lead Phone & Contact Name',
      crmField: 'contact.phone & contact.name',
      direction: 'Two-Way',
      syncTrigger: 'Immediate'
    },
    {
      id: 'map-5',
      lmsField: 'Objection History & ARM Audit Log',
      crmField: 'contact.notes / timeline_activity',
      direction: 'LMS-to-CRM',
      syncTrigger: 'On Call Finished'
    },
    {
      id: 'map-6',
      lmsField: 'WebRTC Call Recording Audio Link',
      crmField: 'contact.custom_field_call_recording_url',
      direction: 'LMS-to-CRM',
      syncTrigger: 'On Call Finished'
    }
  ]);

  const [syncLogs, setSyncLogs] = useState([
    { id: '1', time: '1 min ago', crm: 'GoHighLevel', event: 'contact.sparring_score.updated', rep: 'Alex Mercer', status: '200 OK', error: null },
    { id: '2', time: '4 mins ago', crm: 'HubSpot', event: 'deal.pipeline_stage.updated', rep: 'Jordan Smith', status: '200 OK', error: null },
    { id: '3', time: '12 mins ago', crm: 'GoHighLevel', event: 'contact.tag.added ("BORIS_CERTIFIED")', rep: 'Elena Rostova', status: '200 OK', error: null },
    { id: '4', time: '28 mins ago', crm: 'GoHighLevel', event: 'contact.sparring_score.updated', rep: 'Marcus Brody', status: '429 Rate Limited', error: 'API token bucket depleted. Event rerouted to Dead Letter Queue (DLQ).' },
  ]);

  const toggleConnector = (id: string) => {
    setConnectors(prev =>
      prev.map(c => c.id === id ? { ...c, isConnected: !c.isConnected } : c)
    );
  };

  const handleRetryDlq = () => {
    setRetryingDlq(true);
    setTimeout(() => {
      setRetryingDlq(false);
      setDlqSuccess(true);
      setSyncLogs(prev =>
        prev.map(l => l.status.includes('429') ? { ...l, status: '200 OK (Retried from DLQ)', error: null } : l)
      );
      setTimeout(() => setDlqSuccess(false), 3000);
    }, 1200);
  };

  const handleSaveMappings = () => {
    setSavedMappings(true);
    setTimeout(() => setSavedMappings(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#222021]/10 rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ED1C24]/10 border border-[#ED1C24]/20 text-[#ED1C24] text-[10px] font-bold tracking-wide uppercase mb-1.5">
            <Zap className="h-3 w-3" />
            <span>Canonical Data Normalization Layer</span>
          </div>
          <h2 className="text-xl font-black text-[#222021] tracking-tight">
            Universal CRM Integration & Field Mapping Studio
          </h2>
          <p className="text-xs text-[#6b6968]">
            Bi-directionally synchronize reps, call telemetry, AI sparring scores, and buyer objections across any external CRM.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 bg-[#F2F0EF] p-1 rounded-xl">
          {[
            { id: 'mapper', label: 'Field Schema Mapper' },
            { id: 'connectors', label: 'CRM Gateways' },
            { id: 'stream', label: 'Sync Stream & DLQ' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-[#222021] shadow-2xs'
                  : 'text-[#6b6968] hover:text-[#222021]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: FIELD SCHEMA MAPPER */}
      {activeTab === 'mapper' && (
        <div className="bg-white border border-[#222021]/10 rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#222021]">LMS Canonical Schema ➔ CRM Field Mapper</h3>
              <p className="text-xs text-[#6b6968] mt-0.5">
                Controls exact payload transformation whenever an AI sparring session concludes or a Boris certificate is generated.
              </p>
            </div>

            <button
              onClick={handleSaveMappings}
              className="px-4 py-2 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {savedMappings ? <Check className="h-4 w-4" /> : null}
              <span>{savedMappings ? 'Mappings Saved!' : 'Save Field Mappings'}</span>
            </button>
          </div>

          <div className="border border-[#222021]/10 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F2F0EF] border-b border-[#222021]/10 text-[11px] font-mono font-bold text-[#6b6968] uppercase">
                <tr>
                  <th className="py-3 px-4">LMS Entity / Metric</th>
                  <th className="py-3 px-4">Direction</th>
                  <th className="py-3 px-4">External CRM Field Name</th>
                  <th className="py-3 px-4">Automation Trigger</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222021]/10">
                {mappings.map((m) => (
                  <tr key={m.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#222021]">
                      {m.lmsField}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {m.direction}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#ED1C24] font-semibold">
                      {m.crmField}
                    </td>
                    <td className="py-3 px-4 text-[#6b6968]">
                      {m.syncTrigger}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>ACTIVE SYNC</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CRM GATEWAYS */}
      {activeTab === 'connectors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {connectors.map((c) => (
            <div 
              key={c.id}
              className={`bg-white border rounded-2xl p-5 shadow-2xs space-y-4 transition-all ${
                c.isConnected ? 'border-emerald-300' : 'border-[#222021]/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-[#F2F0EF] flex items-center justify-center text-xl shadow-2xs shrink-0">
                    {c.logo}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#222021]">{c.name}</h3>
                    <p className="text-[11px] text-[#6b6968]">{c.category}</p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  c.isConnected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-stone-100 text-stone-600 border-stone-200'
                }`}>
                  {c.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>

              {c.isConnected && (
                <div className="p-3 rounded-xl bg-[#F2F0EF] border border-[#222021]/10 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-[#6b6968]">
                    <span>Location / Portal ID:</span>
                    <span className="font-bold text-[#222021]">{c.locationId}</span>
                  </div>
                  <div className="flex justify-between text-[#6b6968]">
                    <span>Sync Frequency:</span>
                    <span>{c.syncFrequency}</span>
                  </div>
                  <div className="flex justify-between text-[#6b6968]">
                    <span>Records Synchronized:</span>
                    <span className="font-bold text-emerald-700">{c.recordsSynced} records</span>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-[#222021]/10 flex items-center justify-between">
                <span className="text-[11px] text-[#6b6968] font-mono">
                  HMAC Signature Verified
                </span>
                <button
                  onClick={() => toggleConnector(c.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    c.isConnected
                      ? 'bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 border border-stone-300'
                      : 'bg-[#222021] hover:bg-stone-800 text-white'
                  }`}
                >
                  {c.isConnected ? 'Disconnect' : 'Connect Gateway'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SYNC STREAM & DEAD LETTER QUEUE (DLQ) */}
      {activeTab === 'stream' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#222021]">Real-Time CRM Synchronization Stream</h3>
              <p className="text-xs text-[#6b6968]">Audit log of outgoing webhook dispatches and BullMQ worker deliveries.</p>
            </div>

            <button
              onClick={handleRetryDlq}
              disabled={retryingDlq}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${retryingDlq ? 'animate-spin' : ''}`} />
              <span>{retryingDlq ? 'Retrying DLQ Events...' : 'Retry Failed DLQ Queue'}</span>
            </button>
          </div>

          {dlqSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Dead Letter Queue (DLQ) successfully cleared! All 1 event dispatched with 200 OK response.</span>
            </div>
          )}

          <div className="bg-white border border-[#222021]/10 rounded-2xl overflow-hidden shadow-2xs divide-y divide-[#222021]/10 text-xs">
            {syncLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF9F5] transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                      {log.crm}
                    </span>
                    <span className="font-bold text-[#222021]">{log.event}</span>
                    <span className="text-[#6b6968]">&bull; Rep: {log.rep}</span>
                  </div>
                  {log.error && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-mono mt-1">
                      ⚠️ {log.error}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    log.status.includes('200')
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                  }`}>
                    {log.status}
                  </span>
                  <span className="text-[11px] font-mono text-[#6b6968]">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
