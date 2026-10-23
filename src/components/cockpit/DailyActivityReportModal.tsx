'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  PhoneCall, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  FileText,
  User,
  Building2,
  Sparkles
} from 'lucide-react';
import LinkedinIcon from '@/components/icons/LinkedinIcon';
import { 
  getStoredActivities, 
  getDailyActivitySummary, 
  INITIAL_DAILY_SUMMARY,
  DailyActivitySummary, 
  CadenceActivityRecord 
} from '@/lib/activityStore';

interface DailyActivityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  repName: string;
}

export default function DailyActivityReportModal({
  isOpen,
  onClose,
  repName
}: DailyActivityReportModalProps) {
  const [summary, setSummary] = useState<DailyActivitySummary>(INITIAL_DAILY_SUMMARY);
  const [copiedSlack, setCopiedSlack] = useState(false);
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<'All' | 'Phone' | 'Email' | 'LinkedIn'>('All');

  useEffect(() => {
    if (isOpen) {
      setSummary(getDailyActivitySummary(repName));
    }
  }, [isOpen, repName]);

  if (!isOpen) return null;

  const filteredActivities = summary.activities.filter(a => {
    if (selectedChannelFilter === 'All') return true;
    return a.channel === selectedChannelFilter;
  });

  // Generate End-of-Day Markdown / Slack summary for managers
  const generateEodReportText = (): string => {
    return `*📋 END-OF-DAY SDR CADENCE ACTIVITY REPORT*
*Rep:* ${repName}
*Date:* ${summary.date}
----------------------------------------
*📊 OUTREACH & PRODUCTION SUMMARY:*
• Total Completed Activities: *${summary.totalActivities}*
• Cold Calls & Phone Dials: *${summary.callsMade}*
• Cadence Emails Dispatched: *${summary.emailsSent}*
• LinkedIn Touches Logged: *${summary.linkedInTouches}*
• Appointments Booked: *${summary.appointmentsBooked}* 🎯
• Callbacks Scheduled: *${summary.callbacksScheduled}* 🔄
• DNC Quarantined: *${summary.dncFlagged}* 🚫
• Not Interested: *${summary.notInterested}*

*📝 COMPLETED CADENCE TOUCHPOINTS AUDIT:*
${summary.activities.map((a, idx) => `${idx + 1}. [${a.timestamp}] *${a.prospectName}* (${a.companyName}) — *${a.channel}* | ${a.stepName} | Disp: _${a.disposition}_`).join('\n')}

_Generated via Appointmentlyy AI Boris Calling Cockpit_`;
  };

  const handleCopySlackReport = () => {
    navigator.clipboard.writeText(generateEodReportText());
    setCopiedSlack(true);
    setTimeout(() => setCopiedSlack(false), 2000);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Rep', 'Prospect', 'Company', 'Channel', 'Cadence Day', 'Touch #', 'Step Name', 'Disposition', 'Website', 'LinkedIn', 'Notes'];
    const rows = summary.activities.map(a => [
      `"${a.timestamp}"`,
      `"${a.repName}"`,
      `"${a.prospectName}"`,
      `"${a.companyName}"`,
      `"${a.channel}"`,
      a.cadenceDay,
      a.touchNumber,
      `"${a.stepName}"`,
      `"${a.disposition}"`,
      `"${a.website || ''}"`,
      `"${a.linkedinUrl || ''}"`,
      `"${(a.notesSnippet || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SDR_Daily_Activity_Report_${repName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#222021]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-[#222021]/15 flex flex-col overflow-hidden text-[#222021]"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-6 py-4 bg-[#222021] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#ED1C24] text-white">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ED1C24] bg-white/10 px-2 py-0.5 rounded">
                  OFFICIAL DAILY ACTIVITY REPORT
                </span>
                <span className="text-xs text-white/60 font-mono">{summary.date}</span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
                {repName} — Completed Cadence Activities
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySlackReport}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
              title="Copy formatted summary to paste into Slack, Discord, or Email to manager"
            >
              {copiedSlack ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copiedSlack ? 'Copied Report!' : 'Copy for Slack / Email'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="p-6 bg-[#F2F0EF] border-b border-[#222021]/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 shrink-0">
          <div className="bg-white p-3 rounded-xl border border-[#222021]/10 shadow-2xs">
            <span className="text-[10px] font-mono font-bold uppercase text-[#6b6968] block">TOTAL OUTREACH</span>
            <span className="text-2xl font-black text-[#222021]">{summary.totalActivities}</span>
            <span className="text-[10px] text-[#6b6968] block mt-0.5">Touches completed</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#222021]/10 shadow-2xs">
            <span className="text-[10px] font-mono font-bold uppercase text-[#6b6968] block">PHONE DIALS</span>
            <span className="text-2xl font-black text-[#222021]">{summary.callsMade}</span>
            <span className="text-[10px] text-[#6b6968] block mt-0.5">Calls logged</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#222021]/10 shadow-2xs">
            <span className="text-[10px] font-mono font-bold uppercase text-[#6b6968] block">EMAILS SENT</span>
            <span className="text-2xl font-black text-[#222021]">{summary.emailsSent}</span>
            <span className="text-[10px] text-[#6b6968] block mt-0.5">Dispatches sent</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#222021]/10 shadow-2xs">
            <span className="text-[10px] font-mono font-bold uppercase text-[#6b6968] block">LINKEDIN TOUCHES</span>
            <span className="text-2xl font-black text-[#222021]">{summary.linkedInTouches}</span>
            <span className="text-[10px] text-[#6b6968] block mt-0.5">Profiles engaged</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-emerald-500/30 bg-emerald-50/20 shadow-2xs">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 block">MEETINGS BOOKED</span>
            <span className="text-2xl font-black text-emerald-700">{summary.appointmentsBooked} 🎯</span>
            <span className="text-[10px] text-emerald-800 block mt-0.5">Appointments set</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#222021]/10 shadow-2xs">
            <span className="text-[10px] font-mono font-bold uppercase text-[#6b6968] block">CALLBACKS</span>
            <span className="text-2xl font-black text-[#222021]">{summary.callbacksScheduled} 🔄</span>
            <span className="text-[10px] text-[#6b6968] block mt-0.5">Carry-overs queued</span>
          </div>
        </div>

        {/* CHANNEL FILTER TABS */}
        <div className="px-6 py-3 border-b border-[#222021]/10 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#6b6968] mr-2">Filter Channel:</span>
            {(['All', 'Phone', 'Email', 'LinkedIn'] as const).map(ch => (
              <button
                key={ch}
                type="button"
                onClick={() => setSelectedChannelFilter(ch)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedChannelFilter === ch
                    ? 'bg-[#222021] text-white shadow-xs'
                    : 'bg-stone-100 text-[#6b6968] hover:bg-stone-200'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
          <span className="text-xs font-mono text-[#6b6968]">
            Showing {filteredActivities.length} of {summary.activities.length} activities
          </span>
        </div>

        {/* ACTIVITY TABLE */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-[#6b6968]">
              <Clock className="h-8 w-8 mx-auto text-stone-400 mb-2" />
              <p className="text-sm font-semibold">No activities logged for {selectedChannelFilter} today yet.</p>
              <p className="text-xs text-stone-500 mt-1">Mark cadence steps as completed or dispose calls in Boris Cockpit to build your report.</p>
            </div>
          ) : (
            <div className="border border-[#222021]/15 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#222021] text-white font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3 font-bold">Time</th>
                    <th className="py-2.5 px-3 font-bold">Prospect & Account</th>
                    <th className="py-2.5 px-3 font-bold">Channel</th>
                    <th className="py-2.5 px-3 font-bold">Cadence Touchpoint</th>
                    <th className="py-2.5 px-3 font-bold">Call Disposition</th>
                    <th className="py-2.5 px-3 font-bold">Notes / CRM Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222021]/10">
                  {filteredActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-[#6b6968] whitespace-nowrap">
                        {act.timestamp}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#222021]">
                        <div className="font-bold">{act.prospectName}</div>
                        <div className="text-[11px] text-[#6b6968]">{act.companyName}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                          act.channel === 'Phone' ? 'bg-amber-100 text-amber-900' :
                          act.channel === 'Email' ? 'bg-blue-100 text-blue-900' :
                          'bg-indigo-100 text-indigo-900'
                        }`}>
                          {act.channel === 'Phone' && <PhoneCall className="h-3 w-3" />}
                          {act.channel === 'Email' && <Mail className="h-3 w-3" />}
                          {act.channel === 'LinkedIn' && <LinkedinIcon className="h-3 w-3" />}
                          <span>{act.channel}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#222021]">
                        <div className="font-semibold">{act.stepName}</div>
                        <div className="text-[10px] font-mono text-[#6b6968]">Day {act.cadenceDay} • Touch #{act.touchNumber}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          act.disposition.toLowerCase().includes('meeting') || act.disposition.toLowerCase().includes('booked') ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          act.disposition.toLowerCase().includes('dnc') ? 'bg-rose-100 text-rose-800' :
                          act.disposition.toLowerCase().includes('callback') ? 'bg-blue-100 text-blue-800' :
                          'bg-stone-100 text-[#222021]'
                        }`}>
                          {act.disposition}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#333130] max-w-xs truncate" title={act.notesSnippet}>
                        {act.notesSnippet}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-[#F2F0EF] border-t border-[#222021]/10 flex items-center justify-between text-xs text-[#6b6968]">
          <span>Activities persist locally and sync across open tabs automatically.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#222021] text-white font-bold hover:bg-black transition-colors cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
