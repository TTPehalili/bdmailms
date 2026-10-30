'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  LifeBuoy, 
  Loader2, 
  Sparkles, 
  Mail, 
  Building2, 
  User, 
  Compass, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useSession } from '@/lib/session';
import { TICKET_CATEGORIES, TicketCategory, TicketPriority, TroubleTicket } from '@/lib/ticketTypes';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: (ticket: TroubleTicket) => void;
  initialCategory?: TicketCategory;
}

export default function NewTicketModal({
  isOpen,
  onClose,
  onTicketCreated,
  initialCategory = 'bug_general'
}: NewTicketModalProps) {
  const { session, tenantName, repName, email, tenantCode } = useSession();

  const [requesterName, setRequesterName] = useState(repName || 'Customer User');
  const [requesterEmail, setRequesterEmail] = useState(email || '');
  const [tenant, setTenant] = useState(tenantName || 'Appointmentlyy Workspace');
  const [category, setCategory] = useState<TicketCategory>(initialCategory);
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [affectedUrl, setAffectedUrl] = useState('');
  const [sendEmailConfirmation, setSendEmailConfirmation] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<TroubleTicket | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRequesterName(repName || 'Customer User');
      setRequesterEmail(email || 'customer@company.com');
      setTenant(tenantName || 'Appointmentlyy Workspace');
      setError(null);
      setCreatedTicket(null);
      if (typeof window !== 'undefined') {
        setAffectedUrl(window.location.pathname);
      }
    }
  }, [isOpen, repName, email, tenantName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError('Please provide a subject line for your trouble ticket.');
      return;
    }
    if (!description.trim()) {
      setError('Please describe what issue or friction you experienced.');
      return;
    }
    if (!requesterEmail.trim() || !requesterEmail.includes('@')) {
      setError('A valid email address is required so we can notify you.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const systemInfo = typeof window !== 'undefined' ? {
      browser: navigator.userAgent.slice(0, 120),
      os: navigator.platform || 'Unknown OS',
      screenResolution: `${window.innerWidth}x${window.innerHeight}`,
    } : undefined;

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantName: tenant,
          tenantCode: tenantCode,
          requesterName,
          requesterEmail,
          subject,
          description,
          category,
          priority,
          affectedUrl,
          systemInfo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit trouble ticket');
      }

      setCreatedTicket(data.ticket);
      onTicketCreated(data.ticket);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between shrink-0 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight text-white">Submit Trouble Ticket</h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 font-semibold uppercase">
                  Appointmentlyy SLA
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Direct incident triage with Emil Halili & the core engineering team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Area */}
        {createdTicket ? (
          // Success State
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50/50">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                {createdTicket.id}
              </span>
              <h4 className="text-lg font-bold text-zinc-900">Trouble Ticket Logged & Assigned</h4>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                We have received your ticket regarding <strong className="text-zinc-800">&ldquo;{createdTicket.subject}&rdquo;</strong>.
              </p>
            </div>

            <div className="w-full max-w-md bg-zinc-50 rounded-xl p-4 border border-zinc-200 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-zinc-700">
                <Mail className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Confirmation email dispatched to <strong className="font-semibold text-zinc-900">{createdTicket.requesterEmail}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-zinc-700">
                <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                <span>Incident alert dispatched to <strong className="font-semibold text-zinc-900">Emil Halili (CEO/Founder)</strong></span>
              </div>
              <div className="flex items-center gap-2 text-zinc-700">
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Status is set to <strong className="font-semibold text-zinc-900">In Progress</strong> — live updates will appear in your dashboard</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>View Ticket in Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          // Form State
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Submission Error</div>
                  <div className="text-[11px] mt-0.5">{error}</div>
                </div>
              </div>
            )}

            {/* Tenant and Submitter Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/80">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Tenant / Company</span>
                </label>
                <input
                  type="text"
                  value={tenant}
                  onChange={(e) => setTenant(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Requester Name</span>
                </label>
                <input
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Notification Email</span>
                </label>
                <input
                  type="email"
                  value={requesterEmail}
                  onChange={(e) => setRequesterEmail(e.target.value)}
                  required
                  placeholder="your.email@company.com"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Issue Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 font-medium"
                >
                  {TICKET_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-zinc-400 mt-1">
                  {TICKET_CATEGORIES.find(c => c.value === category)?.description}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Priority / Impact
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['low', 'medium', 'high', 'urgent'] as TicketPriority[]).map((p) => {
                    const isSelected = priority === p;
                    const colors = {
                      low: 'border-zinc-200 hover:bg-zinc-50 text-zinc-700',
                      medium: 'border-blue-200 hover:bg-blue-50 text-blue-700',
                      high: 'border-orange-200 hover:bg-orange-50 text-orange-700',
                      urgent: 'border-rose-200 hover:bg-rose-50 text-rose-700',
                    };
                    const selectedColors = {
                      low: 'bg-zinc-800 text-white border-zinc-800 font-bold',
                      medium: 'bg-blue-600 text-white border-blue-600 font-bold',
                      high: 'bg-orange-600 text-white border-orange-600 font-bold',
                      urgent: 'bg-rose-600 text-white border-rose-600 font-bold ring-2 ring-rose-200',
                    };
                    return (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] capitalize border transition-all text-center ${
                          isSelected ? selectedColors[p] : colors[p]
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">
                  {priority === 'urgent' && '🔴 Critical SLA: Immediate engineering notification sent to Emil Halili.'}
                  {priority === 'high' && '🟠 Major impairment: Responded within 30 minutes.'}
                  {priority === 'medium' && '🔵 Standard triage: Normal business hours review.'}
                  {priority === 'low' && '⚪ Minor inquiry or workflow suggestion.'}
                </p>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Subject / Issue Summary <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Telephony latency spike when calling Australian numbers"
                required
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 placeholder:text-zinc-400"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Detailed Problem Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                placeholder="What occurred? What steps lead up to the issue? Include any specific error codes or callers affected..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 placeholder:text-zinc-400 resize-none leading-relaxed"
              />
            </div>

            {/* Affected URL / Page */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-zinc-400" />
                <span>Affected Page or Feature Route (Optional)</span>
              </label>
              <input
                type="text"
                value={affectedUrl}
                onChange={(e) => setAffectedUrl(e.target.value)}
                placeholder="/cockpit, /email, /admin/frameworks..."
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 font-mono text-[11px]"
              />
            </div>

            {/* Email Checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sendEmailConfirmation}
                  onChange={(e) => setSendEmailConfirmation(e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 h-3.5 w-3.5"
                />
                <span className="text-[11px] text-zinc-600">
                  Send email receipt & live tracking link to <strong className="text-zinc-800">{requesterEmail || 'my email'}</strong>
                </span>
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors font-medium text-xs"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Transmitting & Dispatching Alert...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Trouble Ticket</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
