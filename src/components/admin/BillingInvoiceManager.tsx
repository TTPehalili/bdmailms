'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Plus, 
  Send, 
  Clock, 
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  X,
  FileCheck
} from 'lucide-react';

interface ManualInvoice {
  id: string;
  invoiceNumber: string;
  tenantName: string;
  tenantSlug: string;
  amount: string;
  dueDate: string;
  issueDate: string;
  status: 'Paid' | 'Sent' | 'Past Due' | 'Draft';
  daysOverdue?: number;
  lineItems: { description: string; amount: string }[];
}

export default function BillingInvoiceManager() {
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const [invoices, setInvoices] = useState<ManualInvoice[]>([
    {
      id: 'inv-1',
      invoiceNumber: 'INV-2026-001',
      tenantName: 'Apex Global BPO',
      tenantSlug: 'apex-global',
      amount: '$9,049.00',
      dueDate: 'Oct 31, 2026',
      issueDate: 'Oct 01, 2026',
      status: 'Paid',
      lineItems: [
        { description: '250x GTM Rep Licenses (@ $36/seat bulk)', amount: '$9,000.00' },
        { description: 'Monetized BYOK AI Subsystem Add-On', amount: '$49.00' }
      ]
    },
    {
      id: 'inv-2',
      invoiceNumber: 'INV-2026-002',
      tenantName: 'Outsource Accelerator Partner A',
      tenantSlug: 'oa-partner-a',
      amount: '$3,000.00',
      dueDate: 'Nov 05, 2026',
      issueDate: 'Oct 10, 2026',
      status: 'Paid',
      lineItems: [
        { description: '60x AI LMS Software Rep Licenses (@ $50/rep)', amount: '$3,000.00' }
      ]
    },
    {
      id: 'inv-3',
      invoiceNumber: 'INV-2026-003',
      tenantName: 'Horizon Solar Sales Floor',
      tenantSlug: 'horizon-solar',
      amount: '$1,250.00',
      dueDate: 'Oct 14, 2026',
      issueDate: 'Sep 30, 2026',
      status: 'Past Due',
      daysOverdue: 7,
      lineItems: [
        { description: '25x Qualifier Gate Rep Licenses (@ $50/rep)', amount: '$1,250.00' }
      ]
    },
    {
      id: 'inv-4',
      invoiceNumber: 'INV-2026-004',
      tenantName: 'Metro Cloud BPO Manila',
      tenantSlug: 'metro-cloud-bpo',
      amount: '$0.00 (Trial)',
      dueDate: 'Nov 01, 2026',
      issueDate: 'Oct 18, 2026',
      status: 'Draft',
      lineItems: [
        { description: '15x Rep Sandbox Evaluation (14-Day Pilot)', amount: '$0.00' }
      ]
    }
  ]);

  const handleMarkAsPaid = (id: string) => {
    setInvoices(prev =>
      prev.map(inv => inv.id === id ? { ...inv, status: 'Paid', daysOverdue: undefined } : inv)
    );
  };

  const handleDownloadInvoice = (invoiceNumber: string) => {
    setDownloadSuccess(invoiceNumber);
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#222021]/10 rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ED1C24]/10 border border-[#ED1C24]/20 text-[#ED1C24] text-[10px] font-bold tracking-wide uppercase mb-1.5">
            <DollarSign className="h-3 w-3" />
            <span>Manual Invoicing & Stripe Drop-In</span>
          </div>
          <h2 className="text-xl font-black text-[#222021] tracking-tight">
            Tenant Billing & Invoicing Lifecycle
          </h2>
          <p className="text-xs text-[#6b6968]">
            Manage client subscription invoices, track offline wire transfers, and monitor automated 7/14-day past-due suspensions.
          </p>
        </div>

        <button
          onClick={() => setShowNewInvoiceModal(true)}
          className="px-4 py-2 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create Manual Invoice</span>
        </button>
      </div>

      {/* Financial Telemetry (4 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#6b6968] block">Consolidated MRR</span>
          <span className="text-2xl font-black text-[#222021] font-mono">$13,299.00</span>
          <p className="text-[11px] text-emerald-700 font-medium">+18.4% this quarter</p>
        </div>

        <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#6b6968] block">Average ARPU</span>
          <span className="text-2xl font-black text-[#222021] font-mono">$3,324.75</span>
          <p className="text-[11px] text-[#6b6968]">4 Client Tenants Billed</p>
        </div>

        <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#6b6968] block">Past Due Outstanding</span>
          <span className="text-2xl font-black text-amber-700 font-mono">$1,250.00</span>
          <p className="text-[11px] text-amber-700 font-medium">1 Tenant (7 Days Overdue)</p>
        </div>

        <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#6b6968] block">Active Paid Seats</span>
          <span className="text-2xl font-black text-purple-700 font-mono">335 Seats</span>
          <p className="text-[11px] text-[#6b6968]">Across Manila & Cebu Floors</p>
        </div>
      </div>

      {/* Suspension Policy Alert Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0" />
          <div>
            <strong className="block font-mono text-[11px] uppercase tracking-wider text-amber-900">
              AUTOMATED OVERDUE SUSPENSION ENGINE ACTIVE
            </strong>
            <span className="text-amber-800">
              Horizon Solar is currently <strong>7 days overdue</strong>. An amber warning banner is being displayed on their cockpit. At <strong>14 days overdue</strong>, AI voice dialing and workflow executions will freeze automatically.
            </span>
          </div>
        </div>

        <button 
          onClick={() => handleMarkAsPaid('inv-3')}
          className="px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shrink-0 cursor-pointer"
        >
          Verify Payment & Clear Past Due
        </button>
      </div>

      {/* Invoices Ledger Table */}
      <div className="bg-white border border-[#222021]/10 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-[#222021]">Client Invoice Ledger</h3>
            <p className="text-xs text-[#6b6968]">Itemized invoices with seat allocations, BYOK subscriptions, and payment receipts.</p>
          </div>
          {downloadSuccess && (
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ✓ Downloaded {downloadSuccess}.pdf
            </span>
          )}
        </div>

        <div className="border border-[#222021]/10 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#F2F0EF] border-b border-[#222021]/10 text-[11px] font-mono font-bold text-[#6b6968] uppercase">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Client Tenant</th>
                <th className="py-3 px-4">Itemized Breakdown</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222021]/10 font-mono">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#222021]">{inv.invoiceNumber}</td>
                  <td className="py-3.5 px-4 font-sans text-xs font-bold text-[#222021]">
                    {inv.tenantName}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-[11px] text-[#6b6968]">
                    {inv.lineItems.map((item, idx) => (
                      <div key={idx}>&bull; {item.description} ({item.amount})</div>
                    ))}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#222021]">{inv.amount}</td>
                  <td className="py-3.5 px-4 text-[#6b6968]">
                    {inv.dueDate}
                    {inv.daysOverdue && (
                      <span className="block text-red-600 font-bold text-[10px]">
                        ({inv.daysOverdue} days past due)
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                      inv.status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : inv.status === 'Past Due'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}>
                      {inv.status === 'Paid' && <CheckCircle2 className="h-3 w-3" />}
                      {inv.status === 'Past Due' && <AlertTriangle className="h-3 w-3" />}
                      <span>{inv.status.toUpperCase()}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {inv.status !== 'Paid' && (
                        <button
                          onClick={() => handleMarkAsPaid(inv.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadInvoice(inv.invoiceNumber)}
                        className="p-1.5 rounded-lg bg-[#F2F0EF] hover:bg-[#e7e4e2] text-[#222021] transition-colors cursor-pointer"
                        title="Download PDF Invoice"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
