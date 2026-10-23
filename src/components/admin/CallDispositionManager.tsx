'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  PhoneCall,
  Plus,
  Pencil,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Voicemail,
  Filter,
  Layers,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  RefreshCw,
  FolderPlus,
  ArrowRight
} from 'lucide-react';
import {
  CallDisposition,
  DispositionCategory,
  ActionTrigger,
  getStoredDispositions,
  saveStoredDispositions,
  addStoredDisposition,
  updateStoredDisposition,
  deleteStoredDisposition,
  resetStoredDispositions,
  subscribeToDispositions,
  INITIAL_DEFAULT_DISPOSITIONS
} from '@/lib/dispositionStore';

const DEFAULT_CAMPAIGNS = [
  'All Campaigns (Global)',
  'Apex Global BPO',
  'Enterprise Outbound Q4',
  'Fintech Scaleups',
  'SaaS SMB Pipeline'
];

export default function CallDispositionManager() {
  const [dispositions, setDispositions] = useState<CallDisposition[]>(INITIAL_DEFAULT_DISPOSITIONS);
  const [campaignList, setCampaignList] = useState<string[]>(DEFAULT_CAMPAIGNS);

  // Sync with persistent store on mount and react to updates
  useEffect(() => {
    setDispositions(getStoredDispositions());
    const unsubscribe = subscribeToDispositions((updated) => {
      setDispositions(updated);
    });
    return unsubscribe;
  }, []);

  // Filters
  const [selectedCampaignFilter, setSelectedCampaignFilter] = useState<string>('All Campaigns (Global)');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCampaign, setFormCampaign] = useState('All Campaigns (Global)');
  const [formCategory, setFormCategory] = useState<DispositionCategory>('Positive');
  const [formActionTrigger, setFormActionTrigger] = useState<ActionTrigger>('mark_booked');
  const [formRebuttalPrompt, setFormRebuttalPrompt] = useState('');
  const [formRequiresNote, setFormRequiresNote] = useState(true);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formColor, setFormColor] = useState('#10B981');
  const [customCampaignInput, setCustomCampaignInput] = useState('');
  const [showCustomCampaignField, setShowCustomCampaignField] = useState(false);

  // Delete Confirmation State
  const [deleteCandidate, setDeleteCandidate] = useState<CallDisposition | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Filtered Dispositions
  const filteredDispositions = useMemo(() => {
    return dispositions.filter((disp) => {
      // Campaign filter: if "All Campaigns (Global)" is selected, show everything.
      // Otherwise match exact campaign or items assigned to "All Campaigns (Global)"
      const matchesCampaign =
        selectedCampaignFilter === 'All Campaigns (Global)' ||
        disp.campaign === selectedCampaignFilter ||
        disp.campaign === 'All Campaigns (Global)';

      const matchesCategory =
        selectedCategoryFilter === 'all' || disp.category === selectedCategoryFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        disp.name.toLowerCase().includes(q) ||
        disp.code.toLowerCase().includes(q) ||
        disp.campaign.toLowerCase().includes(q) ||
        disp.rebuttalScriptPrompt.toLowerCase().includes(q);

      return matchesCampaign && matchesCategory && matchesSearch;
    });
  }, [dispositions, selectedCampaignFilter, selectedCategoryFilter, searchQuery]);

  // Open Modal to Add
  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setFormName('');
    setFormCode('');
    setFormCampaign(
      selectedCampaignFilter === 'All Campaigns (Global)' ? 'Apex Global BPO' : selectedCampaignFilter
    );
    setFormCategory('Positive');
    setFormActionTrigger('mark_booked');
    setFormRebuttalPrompt('');
    setFormRequiresNote(true);
    setFormIsActive(true);
    setFormColor('#10B981');
    setShowCustomCampaignField(false);
    setCustomCampaignInput('');
    setIsModalOpen(true);
  };

  // Open Modal to Edit
  const handleOpenEditModal = (disp: CallDisposition) => {
    setModalMode('edit');
    setEditingId(disp.id);
    setFormName(disp.name);
    setFormCode(disp.code);
    setFormCampaign(disp.campaign);
    setFormCategory(disp.category);
    setFormActionTrigger(disp.actionTrigger);
    setFormRebuttalPrompt(disp.rebuttalScriptPrompt || '');
    setFormRequiresNote(disp.requiresNote);
    setFormIsActive(disp.isActive);
    setFormColor(disp.color || '#10B981');
    setShowCustomCampaignField(false);
    setCustomCampaignInput('');
    setIsModalOpen(true);
  };

  // Handle Save (Add / Edit)
  const handleSaveDisposition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    let finalCampaign = formCampaign;
    if (showCustomCampaignField && customCampaignInput.trim()) {
      finalCampaign = customCampaignInput.trim();
      if (!campaignList.includes(finalCampaign)) {
        setCampaignList((prev) => [...prev, finalCampaign]);
      }
    }

    const autoCode =
      formCode.trim() !== ''
        ? formCode.toUpperCase().replace(/\s+/g, '_')
        : formName.toUpperCase().replace(/[^A-Z0-9]+/g, '_').slice(0, 24);

    if (modalMode === 'add') {
      const newDisp: CallDisposition = {
        id: `disp-${Date.now()}`,
        code: autoCode,
        name: formName.trim(),
        campaign: finalCampaign,
        category: formCategory,
        actionTrigger: formActionTrigger,
        rebuttalScriptPrompt: formRebuttalPrompt.trim(),
        requiresNote: formRequiresNote,
        isActive: formIsActive,
        color: formColor,
        updatedAt: 'Just now'
      };
      const updated = addStoredDisposition(newDisp);
      setDispositions(updated);
      fetch('/api/dispositions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disposition: newDisp })
      }).catch(() => {});
      showFeedback(`Disposition "${newDisp.name}" added and assigned to ${newDisp.campaign}`);
    } else if (modalMode === 'edit' && editingId) {
      const existing = dispositions.find(d => d.id === editingId);
      const updatedDisp: CallDisposition = {
        id: editingId,
        code: autoCode,
        name: formName.trim(),
        campaign: finalCampaign,
        category: formCategory,
        actionTrigger: formActionTrigger,
        rebuttalScriptPrompt: formRebuttalPrompt.trim(),
        requiresNote: formRequiresNote,
        isActive: formIsActive,
        color: formColor,
        updatedAt: 'Just now'
      };
      const updated = updateStoredDisposition(updatedDisp);
      setDispositions(updated);
      fetch('/api/dispositions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disposition: updatedDisp })
      }).catch(() => {});
      showFeedback(`Disposition "${formName.trim()}" updated successfully`);
    }

    setIsModalOpen(false);
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    const name = deleteCandidate.name;
    const updated = deleteStoredDisposition(deleteCandidate.id);
    setDispositions(updated);
    fetch(`/api/dispositions?id=${deleteCandidate.id}`, { method: 'DELETE' }).catch(() => {});
    setDeleteCandidate(null);
    showFeedback(`Disposition "${name}" permanently deleted`);
  };

  // Quick Inline Campaign Switch
  const handleQuickCampaignChange = (id: string, newCampaign: string) => {
    const target = dispositions.find(d => d.id === id);
    if (target) {
      const updatedTarget: CallDisposition = { ...target, campaign: newCampaign, updatedAt: 'Just now' };
      const updated = updateStoredDisposition(updatedTarget);
      setDispositions(updated);
      fetch('/api/dispositions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disposition: updatedTarget })
      }).catch(() => {});
    }
    showFeedback(`Reassigned disposition to ${newCampaign}`);
  };

  // Clean Slate Preset Reset
  const handleResetToCleanSlate = () => {
    if (window.confirm('Reset call dispositions to a clean slate starting set for new tenant onboarding?')) {
      const reset = resetStoredDispositions();
      setDispositions(reset);
      fetch('/api/dispositions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispositions: reset })
      }).catch(() => {});
      showFeedback('Reset call dispositions to default turnkey template');
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => {
      setFeedbackNotice(null);
    }, 3500);
  };

  const getCategoryBadge = (category: DispositionCategory) => {
    switch (category) {
      case 'Positive':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Follow-up':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Negative':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Compliance':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Unreached':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getActionBadge = (action: ActionTrigger) => {
    switch (action) {
      case 'mark_booked':
        return { label: 'Mark Booked & Sync CRM', color: 'text-emerald-700 bg-emerald-100/60' };
      case 'schedule_callback':
        return { label: 'Prompt Calendar Callback', color: 'text-amber-700 bg-amber-100/60' };
      case 'dnc_quarantine':
        return { label: 'TCPA DNC Quarantine', color: 'text-purple-700 bg-purple-100/60' };
      case 'resend_email_120s':
        return { label: 'Dispatch Follow-Up Email in 120s', color: 'text-indigo-700 bg-indigo-100/60' };
      case 'recycle_cadence':
        return { label: 'Recycle to Cadence Day +3', color: 'text-blue-700 bg-blue-100/60' };
      case 'none':
      default:
        return { label: 'Note Logging Only', color: 'text-stone-600 bg-stone-100' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Toast */}
      {feedbackNotice && (
        <div className="p-3 bg-stone-900 text-white rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedbackNotice}</span>
          </div>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="text-stone-400 hover:text-white text-xs font-mono"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-50 text-[#ED1C24] border border-red-100">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                <span>Call Disposition & Campaign Rules Manager</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                  {dispositions.length} Dispositions
                </span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Add, edit, or delete call outcome buttons and bind them to specific client campaigns. AI Boris will automatically apply these objection rules and teleprompter cues to SDRs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleResetToCleanSlate}
            className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Reset dispositions to standard clean default template"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
            <span>Clean State Template</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Call Disposition</span>
          </button>
        </div>
      </div>

      {/* Filter & Controls Toolbar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dispositions by label, code (e.g. BOOKED_QUALIFIED), or AI rebuttal cue..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#ED1C24] focus:bg-white transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Campaign Selector */}
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Campaign:</span>
            <select
              value={selectedCampaignFilter}
              onChange={(e) => setSelectedCampaignFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-900 focus:outline-none cursor-pointer"
            >
              <option value="All Campaigns (Global)">All Campaigns (Global)</option>
              {campaignList
                .filter((c) => c !== 'All Campaigns (Global)')
                .map((camp) => (
                  <option key={camp} value={camp}>
                    {camp}
                  </option>
                ))}
            </select>
          </div>

          {/* Category Selector */}
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Type:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-900 focus:outline-none cursor-pointer"
            >
              <option value="all">All Outcomes</option>
              <option value="Positive">Positive (Conversions)</option>
              <option value="Follow-up">Follow-up (Callbacks)</option>
              <option value="Negative">Negative (Objections)</option>
              <option value="Compliance">Compliance (DNC/Opt-Out)</option>
              <option value="Unreached">Unreached (Gatekeeper/VM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dispositions Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Disposition Label & Code</th>
                <th className="py-3.5 px-4">Assigned Campaign</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Automated Action Trigger</th>
                <th className="py-3.5 px-4">Boris AI Script Rebuttal Cue</th>
                <th className="py-3.5 px-4 text-center">Note Req.</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredDispositions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <HelpCircle className="w-8 h-8 text-stone-300" />
                      <p className="font-semibold text-stone-600">No call dispositions match your filter.</p>
                      <button
                        onClick={handleOpenAddModal}
                        className="mt-2 text-[#ED1C24] font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add a new disposition for this campaign
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDispositions.map((disp) => {
                  const actionBadge = getActionBadge(disp.actionTrigger);
                  return (
                    <tr
                      key={disp.id}
                      className="hover:bg-stone-50/80 transition-colors group"
                    >
                      {/* Name & Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: disp.color || '#ED1C24' }}
                          />
                          <div>
                            <div className="font-bold text-stone-900 flex items-center gap-1.5">
                              <span>{disp.name}</span>
                              {!disp.isActive && (
                                <span className="text-[9px] font-mono font-normal uppercase px-1.5 py-0.5 rounded bg-stone-200 text-stone-600">
                                  Disabled
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[10px] text-stone-400 mt-0.5 tracking-wider">
                              {disp.code}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Campaign Assignment */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <select
                            value={disp.campaign}
                            onChange={(e) => handleQuickCampaignChange(disp.id, e.target.value)}
                            className="text-xs font-semibold text-stone-800 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#ED1C24] cursor-pointer"
                          >
                            {campaignList.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getCategoryBadge(
                            disp.category
                          )}`}
                        >
                          {disp.category}
                        </span>
                      </td>

                      {/* Action Trigger */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${actionBadge.color}`}
                        >
                          {actionBadge.label}
                        </span>
                      </td>

                      {/* Boris Prompt Cue */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {disp.rebuttalScriptPrompt ? (
                          <div className="flex items-start gap-1.5 text-stone-600 text-[11px] line-clamp-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{disp.rebuttalScriptPrompt}</span>
                          </div>
                        ) : (
                          <span className="text-stone-400 italic text-[11px]">No script cue attached</span>
                        )}
                      </td>

                      {/* Requires Note */}
                      <td className="py-3.5 px-4 text-center">
                        {disp.requiresNote ? (
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            Required
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-stone-400">Optional</span>
                        )}
                      </td>

                      {/* Actions: Edit, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(disp)}
                            className="p-1.5 rounded-lg border border-stone-200 hover:border-stone-400 hover:bg-white text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                            title="Edit this disposition & rules"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(disp)}
                            className="p-1.5 rounded-lg border border-stone-200 hover:border-rose-300 hover:bg-rose-50 text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete this disposition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT CALL DISPOSITION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-[#ED1C24] border border-red-100">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {modalMode === 'add' ? 'Add New Call Disposition' : 'Edit Call Disposition'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Configure outcome label, campaign assignment, automated triggers, and AI Boris hints.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDisposition} className="p-5 space-y-4">
              {/* Disposition Label */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Disposition Label / Outcome Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Booked: Executive Pilot Discovery"
                  className="w-full h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#ED1C24] focus:bg-white"
                />
              </div>

              {/* Disposition Code & Color Picker */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    System Code (Uppercase)
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. BOOKED_PILOT"
                    className="w-full h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono font-semibold text-stone-900 uppercase focus:outline-none focus:ring-2 focus:ring-[#ED1C24]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Badge Color Accent
                  </label>
                  <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-stone-50 border border-stone-200">
                    <input
                      type="color"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="font-mono text-xs text-stone-600">{formColor}</span>
                  </div>
                </div>
              </div>

              {/* Campaign Assignment */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Assign to Campaign *
                </label>
                {!showCustomCampaignField ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={formCampaign}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setShowCustomCampaignField(true);
                        } else {
                          setFormCampaign(e.target.value);
                        }
                      }}
                      className="flex-1 h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#ED1C24] cursor-pointer"
                    >
                      {campaignList.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="__custom__">+ Create New Campaign...</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter new campaign name..."
                      value={customCampaignInput}
                      onChange={(e) => setCustomCampaignInput(e.target.value)}
                      className="flex-1 h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#ED1C24]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCustomCampaignField(false)}
                      className="h-10 px-3 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-stone-400 mt-1">
                  Choose "All Campaigns (Global)" to make this disposition available across every SDR seat.
                </p>
              </div>

              {/* Category & Action Trigger */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Outcome Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as DispositionCategory)}
                    className="w-full h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#ED1C24] cursor-pointer"
                  >
                    <option value="Positive">Positive (Converts Quota)</option>
                    <option value="Follow-up">Follow-up (Requires Callback)</option>
                    <option value="Negative">Negative (Objection / Unqualified)</option>
                    <option value="Compliance">Compliance (DNC / Suppress)</option>
                    <option value="Unreached">Unreached (Gatekeeper / VM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Automated Workflow Trigger
                  </label>
                  <select
                    value={formActionTrigger}
                    onChange={(e) => setFormActionTrigger(e.target.value as ActionTrigger)}
                    className="w-full h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#ED1C24] cursor-pointer"
                  >
                    <option value="mark_booked">Mark Booked & Sync CRM</option>
                    <option value="schedule_callback">Schedule Calendar Callback</option>
                    <option value="dnc_quarantine">TCPA DNC Quarantine</option>
                    <option value="resend_email_120s">Dispatch Recap Email in 120s</option>
                    <option value="recycle_cadence">Recycle to Cadence Day +3</option>
                    <option value="none">Note Logging Only</option>
                  </select>
                </div>
              </div>

              {/* Boris AI Rebuttal Cue */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>AI Boris Script Rebuttal & Guidance Cue</span>
                  </span>
                  <span className="text-[10px] text-stone-400">Optional</span>
                </label>
                <textarea
                  rows={2}
                  value={formRebuttalPrompt}
                  onChange={(e) => setFormRebuttalPrompt(e.target.value)}
                  placeholder="e.g. When prospect states competitor contract, guide rep to ask about renewal month..."
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#ED1C24] resize-none"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formRequiresNote}
                    onChange={(e) => setFormRequiresNote(e.target.checked)}
                    className="w-4 h-4 text-[#ED1C24] rounded border-stone-300 focus:ring-[#ED1C24]"
                  />
                  <span className="text-xs font-semibold text-stone-700">
                    Mandatory Call Notes
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#ED1C24] rounded border-stone-300 focus:ring-[#ED1C24]"
                  />
                  <span className="text-xs font-semibold text-stone-700">
                    Active & Available to SDRs
                  </span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  {modalMode === 'add' ? 'Add Disposition' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Delete Call Disposition?
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Are you sure you want to delete disposition{' '}
                  <strong className="text-stone-900">"{deleteCandidate.name}"</strong>?
                  Reps dialing under{' '}
                  <strong className="text-stone-900">"{deleteCandidate.campaign}"</strong> will
                  no longer have access to this outcome button.
                </p>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-[11px] font-mono text-stone-600 space-y-1">
              <div>Code: {deleteCandidate.code}</div>
              <div>Campaign: {deleteCandidate.campaign}</div>
              <div>Category: {deleteCandidate.category}</div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
