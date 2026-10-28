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
  resetToInitialSeeds 
} from '@/lib/emailStore';

export default function UnifiedEmailInbox() {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'inbound' | 'outbound' | 'unread'>('all');
  
  // Compose / Reply State
  const [replyText, setReplyText] = useState<string>('');
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);
  const [sendSuccessKey, setSendSuccessKey] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Deletion Confirmation States
  const [showConfirmDeleteThread, setShowConfirmDeleteThread] = useState<boolean>(false);
  const [showConfirmClearAll, setShowConfirmClearAll] = useState<boolean>(false);

  // Load emails from localStorage or initial seeds
  useEffect(() => {
    const loaded = getStoredEmails();
    setEmails(loaded);
    if (loaded.length > 0 && !selectedThreadId) {
      setSelectedThreadId(loaded[0].threadId);
    }
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

  // Group emails by threadId
  const threadMap = new Map<string, EmailMessage[]>();
  emails.forEach(email => {
    const list = threadMap.get(email.threadId) || [];
    list.push(email);
    threadMap.set(email.threadId, list);
  });

  // Distinct thread summaries for left rail
  const threadSummaries: { threadId: string; latestEmail: EmailMessage; messageCount: number }[] = [];
  const seenThreads = new Set<string>();

  filteredEmails.forEach(email => {
    if (!seenThreads.has(email.threadId)) {
      seenThreads.add(email.threadId);
      const allInThread = (threadMap.get(email.threadId) || []).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      threadSummaries.push({
        threadId: email.threadId,
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
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: activeThreadLead.direction === 'inbound' ? activeThreadLead.from : activeThreadLead.to,
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

  // AI Quick Reply Presets
  const handleApplyAiReplyPreset = (presetType: 'demo' | 'objection' | 'pricing') => {
    if (presetType === 'demo') {
      setReplyText(
        `Hi ${activeThreadLead.leadName.split(' ')[0]},\n\nGlad this resonated. I just uploaded the 2-minute unscripted rebuttal video here: https://appointmentlyy.com/demo/sparring-150ms\n\nWould Thursday 2:00 PM or 3:30 PM EST work best for a quick 15-minute screen share with you and your floor QA lead? I'll show live objection telemetry on your exact campaign.\n\nBest,\nEmil`
      );
    } else if (presetType === 'pricing') {
      setReplyText(
        `Hi ${activeThreadLead.leadName.split(' ')[0]},\n\nFor a 50-seat floor on Salesforce and Twilio, we run on a direct per-seat model ($85/seat/month) that pays for itself on day 3 when reps stop burning accounts.\n\nAre you free for 10 minutes Wednesday morning to look at the exact ROI calculator for your seat count?\n\nBest,\nEmil`
      );
    } else {
      setReplyText(
        `Hi ${activeThreadLead.leadName.split(' ')[0]},\n\nFair question on sounding robotic—that is why traditional static scripts fail. Our system is an agile situational teleprompter that detects the prospect's exact objection in 150ms and displays consultative reframes, so reps sound like peer partners rather than script readers.\n\nWorth a 10-minute look, or are you guys set for this quarter?\n\nBest,\nEmil`
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
    <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)] min-h-[600px] text-zinc-900">
      
      {/* ========================================================================= */}
      {/* 1. TOP INBOX TOOLBAR                                                      */}
      {/* ========================================================================= */}
      <div className="p-4 px-6 border-b border-zinc-200 bg-zinc-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold shadow-xs">
            <Inbox className="h-5 w-5 text-zinc-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900">
                Unified Communications &amp; Email Inbox
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Inbound &amp; Dispatches
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              View all outbound campaign dispatches, live prospect replies, and send replies via Resend API.
            </p>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emails or leads..."
              className="text-xs py-1.5 pl-8 pr-3 rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 w-44 sm:w-56"
            />
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-zinc-200/70 rounded-lg border border-zinc-300/80">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                activeFilter === 'all' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              All ({emails.length})
            </button>
            <button
              onClick={() => setActiveFilter('inbound')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
                activeFilter === 'inbound' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <ArrowDownLeft className="h-3 w-3 text-emerald-600" />
              <span>Replies</span>
            </button>
            <button
              onClick={() => setActiveFilter('outbound')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
                activeFilter === 'outbound' ? 'bg-white text-blue-800 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <ArrowUpRight className="h-3 w-3 text-blue-600" />
              <span>Outbound</span>
            </button>
          </div>

          {/* Clear All Trigger */}
          {emails.length > 0 && (
            showConfirmClearAll ? (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-xs">
                <span className="text-rose-700 font-semibold text-[11px]">Clear all {emails.length}?</span>
                <button
                  onClick={handleConfirmClearAll}
                  className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-700"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowConfirmClearAll(false)}
                  className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-700 text-[10px] hover:bg-zinc-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClearAll(true)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 transition-colors"
                title="Clear all emails in inbox"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DUAL-PANE INBOX WORKSTATION                                            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
        
        {/* ======================================================================= */}
        {/* LEFT PANE: THREAD LIST (4 COLS)                                         */}
        {/* ======================================================================= */}
        <div className="md:col-span-4 border-r border-zinc-200 overflow-y-auto divide-y divide-zinc-100 bg-zinc-50/40">
          {threadSummaries.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400 space-y-1">
              <Mail className="h-6 w-6 mx-auto text-zinc-300" />
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
                  className={`p-4 cursor-pointer transition-all text-left space-y-1.5 ${
                    isSelected
                      ? 'bg-white border-l-4 border-zinc-950 shadow-2xs'
                      : 'hover:bg-zinc-100/70 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {latestEmail.direction === 'inbound' ? (
                        <span className="p-1 rounded bg-emerald-100 text-emerald-800 shrink-0">
                          <ArrowDownLeft className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="p-1 rounded bg-zinc-200 text-zinc-700 shrink-0">
                          <ArrowUpRight className="h-3 w-3" />
                        </span>
                      )}
                      <span className={`text-xs truncate ${hasUnreadInbound ? 'font-bold text-zinc-950' : 'font-semibold text-zinc-800'}`}>
                        {latestEmail.leadName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono shrink-0">
                      <span>{formatTimeAgo(latestEmail.timestamp)}</span>
                      {hasUnreadInbound && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] font-bold text-zinc-900 truncate">
                    {latestEmail.subject}
                  </div>

                  <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                    {latestEmail.body}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="text-zinc-500 font-medium truncate max-w-[140px]">
                      {latestEmail.leadCompany}
                    </span>
                    <span className="font-mono text-zinc-400">
                      {messageCount} {messageCount === 1 ? 'msg' : 'msgs'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ======================================================================= */}
        {/* RIGHT PANE: ACTIVE THREAD & AI REPLY COPILOT (8 COLS)                    */}
        {/* ======================================================================= */}
        <div className="md:col-span-8 flex flex-col h-full overflow-hidden bg-white">
          
          {activeThreadLead ? (
            <>
              {/* Thread Header Dossier */}
              <div className="p-4 px-6 border-b border-zinc-200 bg-zinc-50/60 flex items-center justify-between flex-wrap gap-2 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                    {activeThreadLead.leadName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-zinc-900">
                        {activeThreadLead.leadName}
                      </h3>
                      <span className="text-xs text-zinc-500">• {activeThreadLead.leadTitle || 'Executive'}</span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {activeThreadLead.leadCompany} &lt;{activeThreadLead.direction === 'inbound' ? activeThreadLead.from : activeThreadLead.to}&gt;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-bold border border-zinc-200">
                    Thread ID: {selectedThreadId}
                  </span>

                  {showConfirmDeleteThread ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in">
                      <span className="text-[11px] text-rose-600 font-semibold">Delete thread?</span>
                      <button
                        onClick={handleConfirmDeleteThread}
                        className="px-2 py-0.5 text-[11px] rounded bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors shadow-2xs"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setShowConfirmDeleteThread(false)}
                        className="px-1.5 py-0.5 text-[11px] rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowConfirmDeleteThread(true)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-500 hover:text-rose-600 hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 transition-colors"
                      title="Delete this entire conversation thread"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Thread</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Thread Message Stream (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/30">
                {activeThreadMessages.map((msg) => {
                  const isInbound = msg.direction === 'inbound';
                  return (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-2xl border text-left space-y-2 max-w-2xl ${
                        isInbound
                          ? 'bg-white border-emerald-200 shadow-xs ml-0 mr-auto ring-1 ring-emerald-100'
                          : 'bg-zinc-900 text-white border-zinc-800 shadow-xs ml-auto mr-0'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200/50 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            isInbound ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {isInbound ? '📥 Inbound Reply' : '📤 Outbound Dispatched'}
                          </span>
                          <span className={`font-semibold ${isInbound ? 'text-zinc-900' : 'text-zinc-100'}`}>
                            {msg.from}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono ${isInbound ? 'text-zinc-400' : 'text-zinc-400'}`}>
                            {new Date(msg.timestamp).toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className={`p-1 rounded opacity-50 hover:opacity-100 transition-opacity ${
                              isInbound 
                                ? 'text-zinc-400 hover:text-rose-600 hover:bg-rose-50' 
                                : 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-800'
                            }`}
                            title="Delete this message"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className={`text-xs font-bold ${isInbound ? 'text-zinc-900' : 'text-zinc-200'}`}>
                        Subject: {msg.subject}
                      </div>

                      <div className={`text-xs whitespace-pre-line leading-relaxed ${isInbound ? 'text-zinc-800' : 'text-zinc-200'}`}>
                        {msg.body}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <span className={`${isInbound ? 'text-emerald-700 font-semibold' : 'text-zinc-400 font-mono'}`}>
                          Provider: {msg.provider === 'resend_live' ? 'Resend Live API' : 'Resend Sandbox Simulated'}
                        </span>
                        <span className={`font-mono ${isInbound ? 'text-zinc-400' : 'text-zinc-400'}`}>
                          Status: {msg.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI Boris Quick Reply Copilot & Compose Bar */}
              <div className="p-4 px-6 border-t border-zinc-200 bg-white space-y-3 shrink-0">
                
                {/* AI Reply Assistant Presets */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>AI Reply Copilot (1-Click Strategy Drafts):</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleApplyAiReplyPreset('demo')}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-medium transition-colors"
                    >
                      📅 Book 15-min Demo Sit
                    </button>
                    <button
                      onClick={() => handleApplyAiReplyPreset('pricing')}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-medium transition-colors"
                    >
                      💰 Address 50-Seat Pricing
                    </button>
                    <button
                      onClick={() => handleApplyAiReplyPreset('objection')}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 font-medium transition-colors"
                    >
                      ⚡ Deconstruct Script Pushback
                    </button>
                  </div>
                </div>

                {/* Reply Input Box */}
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a direct reply to this prospect... (or click an AI copilot preset above)"
                    className="w-full text-xs font-sans rounded-xl border border-zinc-200 p-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 resize-none leading-relaxed"
                  />

                  <div className="flex items-center justify-between">
                    <div className="text-[11px] text-zinc-500">
                      {sendSuccessKey === 'reply_sent' ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" />
                          Reply dispatched successfully via Resend API!
                        </span>
                      ) : replyError ? (
                        <span className="text-rose-600 font-semibold flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          Error: {replyError}
                        </span>
                      ) : (
                        <span>Dispatches to: <strong>{activeThreadLead.leadName}</strong> &lt;{activeThreadLead.direction === 'inbound' ? activeThreadLead.from : activeThreadLead.to}&gt;</span>
                      )}
                    </div>

                    <button
                      onClick={handleSendReply}
                      disabled={isSendingReply || !replyText.trim()}
                      className="px-4 py-2 rounded-xl bg-zinc-950 text-white font-bold text-xs hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {isSendingReply ? (
                        <>
                          <RotateCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Sending via Resend...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Send Reply (via Resend API)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-zinc-400 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center shadow-2xs">
                <Inbox className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-zinc-800 text-sm">Inbox is completely clear</p>
                <p className="text-zinc-500 text-xs max-w-xs">
                  All past emails and threads have been removed. Any new incoming or outbound emails will appear here.
                </p>
              </div>
              <button
                onClick={handleResetSeeds}
                className="mt-2 px-3.5 py-1.5 rounded-xl bg-zinc-950 text-white font-medium hover:bg-zinc-800 transition-colors shadow-2xs text-xs"
              >
                Restore Demo Threads
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
