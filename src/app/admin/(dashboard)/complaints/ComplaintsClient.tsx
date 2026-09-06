'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LifeBuoy, Search, Filter, RefreshCw, CheckCircle2, Clock, 
  AlertCircle, MessageSquare, Phone, Mail, User, ShieldCheck, 
  ChevronRight, Send, Edit3, X, Sparkles, MapPin, ExternalLink
} from 'lucide-react';
import { getComplaintsAction, updateComplaintStatusAction } from '@/app/admin/actions';

interface ComplaintItem {
  id: string;
  ticket_id: string;
  request_type: string;
  full_name: string;
  email: string;
  phone: string;
  branch: string;
  category: string;
  details: string;
  status: 'received' | 'in_progress' | 'resolved' | 'rejected' | string;
  submitted_at: string;
  admin_notes: string | null;
}

export default function ComplaintsClient() {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  // Selected Complaint Details Modal State
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>('resolved');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getComplaintsAction();
      if (res.success && res.data) {
        setComplaints(res.data);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleUpdateStatus = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setUpdating(true);
    try {
      const res = await updateComplaintStatusAction(selectedComplaint.ticket_id, newStatus, adminNotes);
      if (res.success) {
        setComplaints(prev => prev.map(c => 
          c.ticket_id === selectedComplaint.ticket_id 
            ? { ...c, status: newStatus, admin_notes: adminNotes } 
            : c
        ));
        setSelectedComplaint(prev => prev ? { ...prev, status: newStatus, admin_notes: adminNotes } : null);
        setToastMsg(`Ticket ${selectedComplaint.ticket_id} updated to ${newStatus.toUpperCase()}`);
        setTimeout(() => setToastMsg(null), 3000);
      }
    } catch (err: any) {
      console.error('Failed to update ticket status:', err);
    } finally {
      setUpdating(false);
    }
  }, [selectedComplaint, newStatus, adminNotes]);

  // Quick mark resolved shortcut
  const handleQuickResolve = useCallback(async (comp: ComplaintItem) => {
    try {
      const res = await updateComplaintStatusAction(comp.ticket_id, 'resolved', 'Quickly marked as resolved by Clinic Admin.');
      if (res.success) {
        setComplaints(prev => prev.map(c => 
          c.ticket_id === comp.ticket_id 
            ? { ...c, status: 'resolved', admin_notes: 'Quickly marked as resolved by Clinic Admin.' } 
            : c
        ));
        setToastMsg(`Ticket ${comp.ticket_id} marked as RESOLVED`);
        setTimeout(() => setToastMsg(null), 3000);
      }
    } catch (err) {
      console.error('Quick resolve failed:', err);
    }
  }, []);

  // Filter complaints logic wrapped in useMemo to prevent render freezing!
  const filteredComplaints = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return complaints.filter(item => {
      const matchesSearch = !q ||
        item.ticket_id.toLowerCase().includes(q) ||
        item.full_name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.details.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || item.category.toLowerCase().includes(categoryFilter.toLowerCase());
      const matchesBranch = branchFilter === 'all' || item.branch.toLowerCase().includes(branchFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesCategory && matchesBranch;
    });
  }, [complaints, searchQuery, statusFilter, categoryFilter, branchFilter]);

  // KPI Calculations wrapped in useMemo
  const { totalCount, receivedCount, inProgressCount, resolvedCount } = useMemo(() => ({
    totalCount: complaints.length,
    receivedCount: complaints.filter(c => c.status === 'received').length,
    inProgressCount: complaints.filter(c => c.status === 'in_progress').length,
    resolvedCount: complaints.filter(c => c.status === 'resolved').length,
  }), [complaints]);

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'received':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Action Required
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Resolved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold">
            <X className="w-3.5 h-3.5 text-rose-400" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-semibold">
            {status}
          </span>
        );
    }
  }, []);

  return (
    <div className="p-4 sm:p-8 space-y-8 text-slate-100 max-w-7xl mx-auto selection:bg-teal-500 selection:text-slate-950 font-sans transform-gpu">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Patient Complaints & Support Desk
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-medium ml-12">
            Review patient issues, DPDP subject access requests, prescription inquiries, and resolution logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchComplaints}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-white/10 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Desk
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total Tickets Logged</span>
            <span className="text-2xl font-bold text-white mt-1 block">{totalCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800 text-teal-400">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-300 font-medium block">Pending Action</span>
            <span className="text-2xl font-bold text-amber-400 mt-1 block">{receivedCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-cyan-300 font-medium block">Under Investigation</span>
            <span className="text-2xl font-bold text-cyan-400 mt-1 block">{inProgressCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-300 font-medium block">Resolved & Closed</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">{resolvedCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ticket ID, patient name, email, or keywords..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
          >
            <option value="all">All Statuses</option>
            <option value="received">Pending / Received</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
          >
            <option value="all">All Categories</option>
            <option value="prescription">Prescription & X-Ray</option>
            <option value="dpdp">DPDP Privacy</option>
            <option value="appointment">Appointment Booking</option>
            <option value="billing">Billing & Payment</option>
            <option value="general">General Support</option>
          </select>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
          >
            <option value="all">All Branches</option>
            <option value="hazara">Hazara Branch</option>
            <option value="family">Family Branch</option>
          </select>

        </div>

      </div>

      {/* Complaints List Table / Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 bg-slate-900 rounded-3xl border border-white/10 text-slate-400 text-xs">
            Loading patient tickets and complaints...
          </div>
        ) : filteredComplaints.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredComplaints.map((comp) => (
              <div
                key={comp.id}
                className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-white/10 hover:border-teal-500/40 transition-all shadow-lg space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-3 py-1 rounded-xl bg-slate-950 border border-teal-500/30 text-teal-300">
                      {comp.ticket_id}
                    </span>
                    {getStatusBadge(comp.status)}
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-[10px] font-semibold text-slate-300">
                      {comp.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>{new Date(comp.submitted_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Patient Details</span>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-teal-400" />
                      {comp.full_name}
                    </div>
                    <div className="text-slate-400 flex items-center gap-1.5 font-mono">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      {comp.email}
                    </div>
                    <div className="text-slate-400 flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      {comp.phone}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Clinic & Scope</span>
                    <div className="text-slate-200 font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      {comp.branch}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Request Type: <strong className="text-slate-200 uppercase">{comp.request_type}</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-1">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Complaint Summary</span>
                    <p className="text-slate-300 line-clamp-2 italic font-light">
                      &quot;{comp.details}&quot;
                    </p>
                  </div>
                </div>

                {/* Admin Notes Preview */}
                {comp.admin_notes && (
                  <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-200 space-y-1">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Admin Resolution Note:
                    </span>
                    <p className="text-[11px] text-slate-300 font-light">{comp.admin_notes}</p>
                  </div>
                )}

                {/* Action Buttons Footer */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${comp.email}?subject=Regarding%20Ticket%20${comp.ticket_id}%20-%20Dental%20Clinic`}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-teal-400" /> Reply Email
                    </a>
                    {comp.phone && comp.phone !== 'N/A' && (
                      <a
                        href={`https://wa.me/${comp.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(comp.full_name)},%20regarding%20your%20clinic%20ticket%20${comp.ticket_id}:`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {comp.status !== 'resolved' && (
                      <button
                        onClick={() => handleQuickResolve(comp)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1 hover:opacity-90 transition-opacity"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedComplaint(comp);
                        setNewStatus(comp.status);
                        setAdminNotes(comp.admin_notes || '');
                      }}
                      className="px-4 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> View & Manage Ticket
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900 rounded-3xl border border-white/10 text-slate-400 text-xs space-y-2">
            <LifeBuoy className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-white font-semibold">No complaints match your filter criteria.</p>
          </div>
        )}
      </div>

      {/* Ticket Management Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-teal-500/30 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-teal-300 bg-slate-950 px-3 py-1 rounded-xl border border-teal-500/30">
                    {selectedComplaint.ticket_id}
                  </span>
                  <h2 className="text-lg font-bold text-white">Ticket Resolution Control</h2>
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-white/10 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block">Patient Name</span>
                    <span className="text-white font-bold">{selectedComplaint.full_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Email Address</span>
                    <span className="text-white font-mono">{selectedComplaint.email}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block">Complete Message</span>
                  <p className="text-slate-200 mt-1 leading-relaxed">{selectedComplaint.details}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Update Status</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['received', 'in_progress', 'resolved', 'rejected'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setNewStatus(st)}
                        className={`py-2 px-3 rounded-xl font-bold uppercase text-[10px] border transition-all ${
                          newStatus === st
                            ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-lg shadow-teal-500/20'
                            : 'bg-slate-950 text-slate-400 border-white/10 hover:text-white'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Admin Resolution Notes</label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter resolution notes, doctor dispatch details, or DPO response..."
                    className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updating}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                  >
                    {updating ? 'Saving Changes...' : 'Update & Save Resolution'}
                  </button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
