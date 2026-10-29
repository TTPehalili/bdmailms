'use client';

import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Send, 
  Mail, 
  Search, 
  Reply, 
  Star, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  ArrowUpRight, 
  ArrowDownLeft, 
  RotateCw, 
  Sparkles, 
  User, 
  Building, 
  Tag, 
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  Zap,
  MoreVertical,
  Trash2,
  Share2
} from 'lucide-react';
import { 
  EmailMessage, 
  getStoredEmails, 
  saveEmailToStore, 
  deleteEmailById, 
  deleteThreadById, 
  clearAllEmails, 
  resetToInitialSeeds,
  getConversationThreadKey,
  extractCleanEmailAddress
} from '@/lib/emailStore';
import { useSession } from '@/lib/session';

export default function UnifiedEmailInbox() {
  const { session } = useSession();
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'inbound' | 'outbound' | 'unread'>('all');
  
  // Dynamic sender based on authenticated session
  const senderDisplayName = session?.repName || 'Emil Halili';
  const senderEmailRaw = session?.email || 'emil@appointmentlyy.com';
  const verifiedSenderEmail = senderEmailRaw.toLowerCase().endsWith('@appointmentlyy.com')
    ? senderEmailRaw
    : 'emil@appointmentlyy.com';
  const senderFrom = `${senderDisplayName} <${verifiedSenderEmail}>`;

  // Compose / Reply State
  const [replyText, setReplyText] = useState<string>('');
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);
  const [sendSuccessKey, setSendSuccessKey] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);

  const [showConfirmDeleteThread, setShowConfirmDeleteThread] = useState<boolean>(false);
  const [showConfirmClearAll, setShowConfirmClearAll] = useState<boolean>(false);
  const [isSyncingInbound, setIsSyncingInbound] = useState<boolean>(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<string | null>(null);
  const [showIngestModal, setShowIngestModal] = useState<boolean>(false);
  const [ingestBody, setIngestBody] = useState<string>('');

  // Sync inbound replies from Resend receiving API
  const handleSyncInbound = async () => {
    setIsSyncingInbound(true);
    try {
      const res = await fetch('/api/email/inbound');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.emails) && data.emails.length > 0) {
          let updated = getStoredEmails();
          let countAdded = 0;
          let changed = false;
          for (const item of data.emails) {
            const existingIdx = updated.findIndex(m => m.id === item.id);
            if (existingIdx === -1) {
              updated = saveEmailToStore(item);
              countAdded++;
            } else if (
              updated[existingIdx].threadId !== item.threadId || 
              updated[existingIdx].leadName !== item.leadName ||
              updated[existingIdx].leadCompany !== item.leadCompany
            ) {
              updated[existingIdx] = { ...updated[existingIdx], ...item };
              changed = true;
            }
          }
          if (changed) {
            localStorage.setItem('sdr_unified_inbox_emails', JSON.stringify(updated));
            setEmails(updated);
          } else if (countAdded > 0) {
            setEmails(updated);
          }

          if (countAdded > 0) {
            setLastSyncStatus(`+${countAdded} new reply`);
            setTimeout(() => setLastSyncStatus(null), 4000);
          } else {
            setLastSyncStatus('Synced');
            setTimeout(() => setLastSyncStatus(null), 2500);
          }
        } else {
          setLastSyncStatus('Up to date');
          setTimeout(() => setLastSyncStatus(null), 2500);
        }
      }
    } catch (e) {
      console.warn('Sync failed:', e);
      setLastSyncStatus('Sync error');
    } finally {
      setIsSyncingInbound(false);
    }
  };

  // Load emails from localStorage or initial seeds & start live inbound sync
  useEffect(() => {
    const loaded = getStoredEmails();
    setEmails(loaded);
    if (loaded.length > 0 && !selectedThreadId) {
      setSelectedThreadId(getConversationThreadKey(loaded[0]));
    }
    handleSyncInbound();
    const interval = setInterval(handleSyncInbound, 12000);
    return () => clearInterval(interval);
  }, []);

  // Filtered emails list
  const filteredEmails = emails.filter((email) => {
    // Filter by tab
    if (activeFilter === 'inbound' && email.direction !== 'inbound') return false;
    if (activeFilter === 'outbound' && email.direction !== 'outbound') return false;
    if (activeFilter === 'unread' && email.read !== false) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = email.leadName.toLowerCase().includes(q);
      const matchCompany = email.leadCompany.toLowerCase().includes(q);
      const matchSubject = email.subject.toLowerCase().includes(q);
      const matchBody = email.body.toLowerCase().includes(q);
      return matchName || matchCompany || matchSubject || matchBody;
    }
    return true;
  });

  // Group emails by canonical conversation thread key
  const threadMap = new Map<string, EmailMessage[]>();
  emails.forEach(email => {
    const threadKey = getConversationThreadKey(email);
    const list = threadMap.get(threadKey) || [];
    list.push({ ...email, threadId: threadKey });
    threadMap.set(threadKey, list);
  });

  // Distinct thread summaries for left rail
  const threadSummaries: { threadId: string; latestEmail: EmailMessage; messageCount: number }[] = [];
  const seenThreads = new Set<string>();

  filteredEmails.forEach(email => {
    const threadKey = getConversationThreadKey(email);
    if (!seenThreads.has(threadKey)) {
      seenThreads.add(threadKey);
      const allInThread = (threadMap.get(threadKey) || []).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      threadSummaries.push({
        threadId: threadKey,
        latestEmail: allInThread[0],
        messageCount: allInThread.length
      });
    }
  });

  // Active thread messages sorted chronologically (oldest to newest)
  const activeThreadMessages = (threadMap.get(selectedThreadId) || []).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const activeThreadLead = activeThreadMessages[0] || emails[0];

  // Send Reply Handler
  const handleSendReply = async () => {
    if (!replyText.trim() || !activeThreadLead) return;
    setIsSendingReply(true);
    setReplyError(null);
    try {
      const targetTo = extractCleanEmailAddress(
        activeThreadLead.direction === 'inbound' ? activeThreadLead.from : activeThreadLead.to
      );
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetTo,
          from: senderFrom,
          subject: activeThreadLead.subject.startsWith('Re:') ? activeThreadLead.subject : `Re: ${activeThreadLead.subject}`,
          body: replyText.trim(),
          leadName: activeThreadLead.leadName,
          leadCompany: activeThreadLead.leadCompany,
          leadTitle: activeThreadLead.leadTitle,
          threadId: selectedThreadId
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.email) {
          const updated = saveEmailToStore(data.email);
          setEmails(updated);
          setReplyText('');
          setSendSuccessKey('reply_sent');
          setTimeout(() => setSendSuccessKey(null), 4000);
          return;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setReplyError(errData.error || 'Failed to dispatch reply via Resend');
        return;
      }
    } catch (e: any) {
      setReplyError(e.message || 'Network error');
      return;
    } finally {
      setIsSendingReply(false);
      setTimeout(() => setReplyError(null), 6000);
    }
  };

  // Delete a single email message
  const handleDeleteMessage = (id: string) => {
    const updated = deleteEmailById(id);
    setEmails(updated);
    
    // Check if the current thread still has messages left
    const remainingInThread = updated.filter(m => m.threadId === selectedThreadId);
    if (remainingInThread.length === 0) {
      const nextThread = updated[0]?.threadId || '';
      setSelectedThreadId(nextThread);
    }
  };

  // Delete entire conversation thread
  const handleConfirmDeleteThread = () => {
    if (!selectedThreadId) return;
    const updated = deleteThreadById(selectedThreadId);
    setEmails(updated);
    setShowConfirmDeleteThread(false);
    
    // Switch to first remaining thread or empty
    const nextThread = updated[0]?.threadId || '';
    setSelectedThreadId(nextThread);
  };

  // Clear all stored emails
  const handleConfirmClearAll = () => {
    const updated = clearAllEmails();
    setEmails(updated);
    setSelectedThreadId('');
    setShowConfirmClearAll(false);
  };

  // Reset demo emails
  const handleResetSeeds = () => {
    const updated = resetToInitialSeeds();
    setEmails(updated);
    if (updated.length > 0) {
      setSelectedThreadId(updated[0].threadId);
    }
  };

  // Ingest custom lead reply into active thread
  const handleIngestReply = async (presetText?: string) => {
    const textToIngest = presetText || ingestBody;
    if (!textToIngest.trim() || !activeThreadLead) return;

    const fromAddress = activeThreadLead.direction === 'inbound' 
      ? activeThreadLead.from 
      : activeThreadLead.to;

    const leadName = activeThreadLead.leadName;
    const leadCompany = activeThreadLead.leadCompany;

    try {
      const res = await fetch('/api/email/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromAddress,
          to: 'emil@appointmentlyy.com',
          subject: activeThreadLead.subject.startsWith('Re:') ? activeThreadLead.subject : `Re: ${activeThreadLead.subject}`,
          body: textToIngest.trim(),
          leadName: leadName,
          leadCompany: leadCompany,
          threadId: selectedThreadId
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          const updated = saveEmailToStore(data.message);
          setEmails(updated);
          setShowIngestModal(false);
          setIngestBody('');
        }
      }
    } catch (e) {
      console.error('Ingest reply error:', e);
    }
  };

  // AI Quick Reply Presets
  const handleApplyAiReplyPreset = (presetType: 'demo' | 'objection' | 'pricing') => {
    const signOff = `Best,\n${senderDisplayName}`;
    if (presetType === 'demo') {
      setReplyText(
        `Hi ${activeThreadLead.leadName.split(' ')[0]},\n\nGlad this resonated. I just uploaded the 2-minute unscripted rebuttal video here: https://appointmentlyy.com/demo/sparring-150ms\n\nWould Thursday 2:00 PM or 3:30 PM EST work best for a quick 15-minute screen share with you and your floor QA lead? I'll show live objection telemetry on your exact campaign.\n\n${signOff}`
      );
    } else if (presetType === 'pricing') {
      setReplyText(
        `Hi ${activeThreadLead.leadName.split(' ')[0]},\n\nFor a 50-seat floor on Salesforce and Twilio, we run on a direct per-seat model ($85/seat/month) that pays for itself on day 3 when reps stop burning accounts.\n\nAre you free for 10 minutes Wednesday morning to look at the exact ROI calculator for your seat count?\n\n${signOff}`
      );
    } else {
      setReplyText(
        `Hi ${activeThreadLead.leadName.split(' ')[0]},\n\nFair question on sounding robotic—that is why traditional static scripts fail. Our system is an agile situational teleprompter that detects the prospect's exact objection in 150ms and displays consultative reframes, so reps sound like peer partners rather than script readers.\n\nWorth a 10-minute look, or are you guys set for this quarter?\n\n${signOff}`
      );
    }
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return 'recent';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs overflow-hidden flex flex-col flex-1 min-h-0 text-zinc-900">
      
      {/* ========================================================================= */}
      {/* 1. TOP INBOX TOOLBAR (Compact)                                            */}
      {/* ========================================================================= */}
      <div className="px-3.5 py-2 border-b border-zinc-200 bg-zinc-50/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold shadow-2xs">
            <Inbox className="h-4 w-4 text-zinc-100" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-zinc-900 tracking-tight">
              Unified Communications Inbox
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 flex items-center gap-1" title={`Live sender: ${senderFrom}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {senderDisplayName} &bull; {verifiedSenderEmail}
            </span>
          </div>
        </div>

        {/* Search, Filter Pills & Clear */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3 w-3 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter emails..."
              className="text-[11px] py-1 pl-7 pr-2.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 w-36 sm:w-48 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-0.5 p-0.5 bg-zinc-200/60 rounded-lg border border-zinc-300/60">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                activeFilter === 'all' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              All ({emails.length})
            </button>
            <button
              onClick={() => setActiveFilter('inbound')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                activeFilter === 'inbound' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <ArrowDownLeft className="h-3 w-3 text-emerald-600" />
              <span>Replies</span>
            </button>
            <button
              onClick={() => setActiveFilter('outbound')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                activeFilter === 'outbound' ? 'bg-white text-blue-800 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <ArrowUpRight className="h-3 w-3 text-blue-600" />
              <span>Outbound</span>
            </button>
          </div>

          {/* Live Inbound Sync from Resend Button */}
          <button
            onClick={handleSyncInbound}
            disabled={isSyncingInbound}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors shadow-2xs cursor-pointer"
            title="Sync incoming email replies live from Resend Inbound (reply@estuegai.resend.app)"
          >
            <RotateCw className={`h-3 w-3 ${isSyncingInbound ? 'animate-spin text-emerald-600' : 'text-zinc-500'}`} />
            <span>{isSyncingInbound ? 'Syncing...' : (lastSyncStatus || 'Sync Replies')}</span>
          </button>

          {/* Clear All Trigger */}
          {emails.length > 0 && (
            showConfirmClearAll ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-xs animate-in fade-in">
                <span className="text-rose-700 font-semibold text-[10px]">Clear all {emails.length}?</span>
                <button
                  onClick={handleConfirmClearAll}
                  className="px-1.5 py-0.2 rounded bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-700"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowConfirmClearAll(false)}
                  className="px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-700 text-[10px] hover:bg-zinc-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClearAll(true)}
                className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 transition-colors"
                title="Clear all stored emails"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DUAL-PANE INBOX WORKSTATION (Compact Grid/Flex)                        */}
      {/* ========================================================================= */}
      <div className="flex flex-1 min-h-0 overflow-hidden divide-x divide-zinc-200">
        
        {/* ======================================================================= */}
        {/* LEFT PANE: THREAD LIST (Compact Rail)                                   */}
        {/* ======================================================================= */}
        <div className="w-72 sm:w-80 shrink-0 overflow-y-auto divide-y divide-zinc-100 bg-zinc-50/40">
          {threadSummaries.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-400 space-y-1">
              <Mail className="h-5 w-5 mx-auto text-zinc-300" />
              <p>No messages match your filter.</p>
            </div>
          ) : (
            threadSummaries.map(({ threadId, latestEmail, messageCount }) => {
              const isSelected = selectedThreadId === threadId;
              const hasUnreadInbound = latestEmail.direction === 'inbound' && latestEmail.read === false;

              return (
                <div
                  key={threadId}
                  onClick={() => setSelectedThreadId(threadId)}
                  className={`px-3 py-2.5 cursor-pointer transition-all text-left space-y-1 ${
                    isSelected
                      ? 'bg-white border-l-[3px] border-zinc-950 shadow-2xs'
                      : 'hover:bg-zinc-100/70 border-l-[3px] border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {latestEmail.direction === 'inbound' ? (
                        <span className="p-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                          <ArrowDownLeft className="h-2.5 w-2.5" />
                        </span>
                      ) : (
                        <span className="p-0.5 rounded bg-zinc-200 text-zinc-700 shrink-0">
                          <ArrowUpRight className="h-2.5 w-2.5" />
                        </span>
                      )}
                      <span className={`text-[11px] truncate ${hasUnreadInbound ? 'font-bold text-zinc-950' : 'font-semibold text-zinc-800'}`}>
                        {latestEmail.leadName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono shrink-0">
                      <span>{formatTimeAgo(latestEmail.timestamp)}</span>
                      {hasUnreadInbound && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 inline-block" />
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] font-medium text-zinc-900 truncate">
                    {latestEmail.subject}
                  </div>

                  <p className="text-[10px] text-zinc-500 truncate leading-snug">
                    {latestEmail.body}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5">
                    <span className="truncate max-w-[150px] font-medium text-zinc-500">
                      {latestEmail.leadCompany}
                    </span>
                    <span className="font-mono text-[9px] px-1 rounded bg-zinc-100 text-zinc-500">
                      {messageCount} {messageCount === 1 ? 'msg' : 'msgs'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ======================================================================= */}
        {/* RIGHT PANE: ACTIVE THREAD & COMPOSER (Flex-1)                           */}
        {/* ======================================================================= */}
        <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-white">
          
          {activeThreadLead ? (
            <>
              {/* Compact Thread Header Dossier */}
              <div className="px-4 py-2 border-b border-zinc-200 bg-zinc-50/60 flex items-center justify-between flex-wrap gap-2 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    {activeThreadLead.leadName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs">
                      <strong className="font-bold text-zinc-900 truncate">{activeThreadLead.leadName}</strong>
                      <span className="text-[11px] text-zinc-500 truncate">• {activeThreadLead.leadCompany}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono truncate">
                      {activeThreadLead.direction === 'inbound' ? activeThreadLead.from : activeThreadLead.to}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                    {selectedThreadId}
                  </span>

                  <button
                    onClick={() => setShowIngestModal(true)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
                    title="Ingest / paste a lead reply into this thread"
                  >
                    <ArrowDownLeft className="h-3 w-3 text-emerald-600" />
                    <span>+ Ingest Reply</span>
                  </button>

                  {showConfirmDeleteThread ? (
                    <div className="flex items-center gap-1 animate-in fade-in text-xs">
                      <span className="text-[10px] text-rose-600 font-semibold">Delete thread?</span>
                      <button
                        onClick={handleConfirmDeleteThread}
                        className="px-2 py-0.5 text-[10px] rounded bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setShowConfirmDeleteThread(false)}
                        className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowConfirmDeleteThread(true)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-zinc-500 hover:text-rose-600 hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 transition-colors"
                      title="Delete this conversation thread"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Thread Message Stream (Compact & Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-zinc-50/30">
                {activeThreadMessages.map((msg) => {
                  const isInbound = msg.direction === 'inbound';
                  return (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl border text-left space-y-1.5 max-w-xl ${
                        isInbound
                          ? 'bg-white border-emerald-200 shadow-2xs ml-0 mr-auto ring-1 ring-emerald-100'
                          : 'bg-zinc-900 text-white border-zinc-800 shadow-2xs ml-auto mr-0'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/40 text-[11px]">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            isInbound ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {isInbound ? '📥 Reply' : '📤 Sent'}
                          </span>
                          <span className={`font-semibold truncate text-[11px] ${isInbound ? 'text-zinc-900' : 'text-zinc-100'}`}>
                            {msg.from}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono text-zinc-400">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className={`p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity ${
                              isInbound 
                                ? 'text-zinc-400 hover:text-rose-600 hover:bg-rose-50' 
                                : 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-800'
                            }`}
                            title="Delete this message"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className={`text-[11px] font-bold ${isInbound ? 'text-zinc-900' : 'text-zinc-100'}`}>
                        {msg.subject}
                      </div>

                      <div className={`text-xs whitespace-pre-line leading-relaxed ${isInbound ? 'text-zinc-800' : 'text-zinc-200'}`}>
                        {msg.body}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[9px] text-zinc-400 font-mono">
                        <span>{msg.provider === 'resend_live' ? 'Resend Live' : 'Sandbox'}</span>
                        <span>{msg.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Compact AI Boris Quick Reply & Composer */}
              <div className="p-3 px-4 border-t border-zinc-200 bg-white space-y-2 shrink-0">
                {/* AI Preset Chips */}
                <div className="flex items-center justify-between flex-wrap gap-1.5">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>Boris Copilot:</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleApplyAiReplyPreset('demo')}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-medium transition-colors"
                    >
                      📅 Demo 15m
                    </button>
                    <button
                      onClick={() => handleApplyAiReplyPreset('pricing')}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-medium transition-colors"
                    >
                      💰 Pricing 50-Seat
                    </button>
                    <button
                      onClick={() => handleApplyAiReplyPreset('objection')}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 font-medium transition-colors"
                    >
                      ⚡ Rebuttals
                    </button>
                  </div>
                </div>

                {/* Reply Composer */}
                <div className="space-y-1.5">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a direct reply... (or click a Boris copilot preset above)"
                    className="w-full text-xs font-sans rounded-lg border border-zinc-200 p-2 text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 resize-none leading-relaxed"
                  />

                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[10px] text-zinc-500 truncate">
                      {sendSuccessKey === 'reply_sent' ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Reply dispatched via Resend!
                        </span>
                      ) : replyError ? (
                        <span className="text-rose-600 font-semibold flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          Error: {replyError}
                        </span>
                      ) : (
                        <span className="truncate">
                          From: <strong className="font-mono text-zinc-700">emil@appointmentlyy.com</strong> &rarr; To: <strong>{activeThreadLead.leadName}</strong>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={handleSendReply}
                      disabled={isSendingReply || !replyText.trim()}
                      className="px-3 py-1.5 rounded-lg bg-zinc-950 text-white font-bold text-xs hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {isSendingReply ? (
                        <>
                          <RotateCw className="h-3 w-3 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3 w-3" />
                          <span>Send Reply</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-zinc-400 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-zinc-100 text-zinc-400 flex items-center justify-center shadow-2xs">
                <Inbox className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-zinc-800 text-xs">Inbox is clear</p>
                <p className="text-zinc-500 text-[11px] max-w-xs">
                  All emails and threads have been pruned.
                </p>
              </div>
              <button
                onClick={handleResetSeeds}
                className="mt-1 px-3 py-1 rounded-lg bg-zinc-950 text-white font-medium hover:bg-zinc-800 transition-colors shadow-2xs text-[11px]"
              >
                Restore Demo Threads
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Ingest Inbound Reply Modal */}
      {showIngestModal && activeThreadLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <ArrowDownLeft className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900">
                    Ingest Inbound Lead Reply
                  </h3>
                  <p className="text-[10px] text-zinc-500">
                    From: <strong className="font-mono text-zinc-700">{activeThreadLead.direction === 'inbound' ? activeThreadLead.from : activeThreadLead.to}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIngestModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                1-Click Preset Replies (Click to auto-inject):
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={() => handleIngestReply("Hey Emil,\n\nSaw your email. Send over that 2-minute video. If it looks solid, I'm open to a 15-minute screen share with my floor QA lead Thursday.\n\nBest,\n" + activeThreadLead.leadName)}
                  className="text-left p-2 rounded-lg bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 transition-colors text-[11px] text-emerald-950 font-medium"
                >
                  <strong className="text-emerald-800 font-bold block text-[10px]">🔥 Positive / Ready for Video:</strong>
                  "Send over that 2-minute video. Open to a 15-minute screen share Thursday."
                </button>
                <button
                  onClick={() => handleIngestReply("Hi Emil,\n\nFair question on price. We are currently locked into an annual contract with another vendor. What is the typical seat cost for a 50-seat team?\n\nBest,\n" + activeThreadLead.leadName)}
                  className="text-left p-2 rounded-lg bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 transition-colors text-[11px] text-blue-950 font-medium"
                >
                  <strong className="text-blue-800 font-bold block text-[10px]">💰 Price & Competitor Lock-in:</strong>
                  "What is the typical seat cost for a 50-seat team?"
                </button>
                <button
                  onClick={() => handleIngestReply("Hey Emil,\n\nWe just restructured our outbound floor. Bad timing right now, please ping me back in Q1.\n\n" + activeThreadLead.leadName)}
                  className="text-left p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-colors text-[11px] text-zinc-800 font-medium"
                >
                  <strong className="text-zinc-600 font-bold block text-[10px]">⏰ Timing Constraint:</strong>
                  "Bad timing right now, please ping me back in Q1."
                </button>
              </div>
            </div>

            {/* Custom Paste Textarea */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Or Paste Custom Reply (From Gmail / Callview AI):
              </span>
              <textarea
                rows={3}
                value={ingestBody}
                onChange={(e) => setIngestBody(e.target.value)}
                placeholder="Paste the reply body you sent from Callview AI email here..."
                className="w-full text-xs font-sans rounded-lg border border-zinc-300 p-2 text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setShowIngestModal(false)}
                className="px-3 py-1.5 text-xs rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleIngestReply()}
                disabled={!ingestBody.trim()}
                className="px-3.5 py-1.5 text-xs rounded-lg bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-bold transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <ArrowDownLeft className="h-3 w-3" />
                <span>Inject Reply into Thread</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
