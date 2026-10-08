'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  sendBroadcastCampaignAction, 
  getMessageLogsAction,
  testWahaWhatsAppAction,
  getWahaStatusAction
} from '@/app/admin/actions'
import { 
  MessageSquare, Send, Bell, 
  CheckCircle, Loader2, RefreshCw, Paperclip,
  Server, Phone, AlertTriangle, Users, History,
  Sparkles, CheckCircle2, Shield
} from 'lucide-react'

export interface WahaLogItem {
  id?: string
  recipient_name?: string
  recipient_phone?: string
  recipient_email?: string
  message_type?: string
  whatsapp_status?: string
  sent_at?: string
}

export interface WahaTestResult {
  success: boolean
  chatId?: string
  error?: string
}

export default function MessagingCampaignPage() {
  // Broadcast state
  const [targetAudience, setTargetAudience] = useState('all')
  const [campaignText, setCampaignText] = useState('')
  const [attachmentUrl, setAttachmentUrl] = useState('')
  const [sendingBroadcast, setSendingBroadcast] = useState(false)
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null)

  // Direct Quick Sender states
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('👋 Hello! Important notification from Hazara & Family Dental Clinic.')
  const [sendingTest, setSendingTest] = useState(false)
  const [testResult, setTestResult] = useState<WahaTestResult | null>(null)

  // Message Logs state
  const [logs, setLogs] = useState<WahaLogItem[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true)
    try {
      const res = await getMessageLogsAction()
      if (res.success && res.data) {
        setLogs(res.data as WahaLogItem[])
      }
    } catch (err: unknown) {
      console.error('Error fetching logs:', err)
    } finally {
      setLoadingLogs(false)
    }
  }, [])

  const fetchWahaStatus = useCallback(async () => {
    try {
      await getWahaStatusAction()
    } catch (err: unknown) {
      console.error('Error checking messaging status:', err)
    }
  }, [])

  useEffect(() => {
    const initData = async () => {
      await fetchLogs()
      await fetchWahaStatus()
    }
    const timer = setTimeout(() => {
      void initData()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchLogs, fetchWahaStatus])

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!campaignText.trim()) return
    setSendingBroadcast(true)
    setBroadcastResult(null)
    try {
      const res = await sendBroadcastCampaignAction(targetAudience, campaignText, attachmentUrl)
      if (res.success) {
        setBroadcastResult(`Campaign sent successfully to ${res.count} patients!`)
        setCampaignText('')
        setAttachmentUrl('')
        await fetchLogs()
      } else {
        alert(res.error || 'Failed to send broadcast campaign.')
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred.'
      alert(errorMsg)
    } finally {
      setSendingBroadcast(false)
    }
  }

  const handleSendQuickMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testPhone.trim() || !testMessage.trim()) return
    setSendingTest(true)
    setTestResult(null)
    try {
      const res = await testWahaWhatsAppAction(testPhone, testMessage)
      setTestResult(res as WahaTestResult)
      if (res.success) {
        setTestMessage('')
        await fetchLogs()
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send message'
      setTestResult({ success: false, error: errorMsg })
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="space-y-8 font-sans max-w-7xl mx-auto p-4 sm:p-6"
    >
      
      {/* ══ HEADER BANNER ══ */}
      <div className="bg-white border border-[#E4E7D3] rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-[#E4E7D3] rounded-2xl text-[#4A5D23] border border-[#4A5D23]/20">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3325] tracking-tight" style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif' }}>
              Patient Messaging & Campaign Console
            </h1>
            <p className="text-xs text-[#8A9380] font-medium mt-1">
              Dispatch bulk WhatsApp broadcasts, direct patient notices, and track real-time message delivery logs.
            </p>
          </div>
        </div>

        {/* Engine Active Pill */}
        <div className="flex items-center gap-2.5 bg-[#4A5D23] text-white px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-sm shrink-0">
          <Server className="w-4 h-4 text-[#E4E7D3]" />
          <div>
            <p className="text-[10px] text-[#E4E7D3] font-mono uppercase tracking-wider">Gateway Status</p>
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              WhatsApp Gateway Active
            </p>
          </div>
        </div>
      </div>

      {/* ══ MAIN GRID: BROADCAST COMPOSER & DIRECT QUICK SENDER ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Broadcast Campaign Composer (2 Cols) */}
        <div className="lg:col-span-2">
          <div className="p-6 sm:p-8 rounded-[24px] bg-white border border-[#E4E7D3] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#F4F6F0] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#E4E7D3] text-[#4A5D23]">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#2C3325]">Patient Broadcast Campaign Composer</h2>
                  <p className="text-xs text-[#8A9380]">Send official announcements, offer vouchers, or clinic notices to patients</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-[#F4F6F0] text-[#4A5D23] border border-[#E4E7D3] rounded-full text-xs font-bold flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Bulk Dispatch
              </span>
            </div>

            {broadcastResult && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                {broadcastResult}
              </div>
            )}

            <form onSubmit={handleSendCampaign} className="space-y-5 text-xs">
              
              {/* Audience Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2C3325]">Select Target Patient Audience</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'all', label: 'All Registered Patients', desc: 'Full patient directory' },
                    { id: 'active', label: 'Active Dental Patients', desc: 'Patients with recent visits' },
                    { id: 'recent', label: 'Recent 30 Days', desc: 'Booked in last 30 days' },
                  ].map((aud) => (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => setTargetAudience(aud.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        targetAudience === aud.id
                          ? 'bg-[#4A5D23] text-white border-[#4A5D23] shadow-md'
                          : 'bg-[#F4F6F0] text-[#2C3325] border-[#E4E7D3] hover:bg-[#E4E7D3]/50'
                      }`}
                    >
                      <p className="font-bold text-xs">{aud.label}</p>
                      <p className={`text-[10px] mt-0.5 ${targetAudience === aud.id ? 'text-[#E4E7D3]' : 'text-[#8A9380]'}`}>
                        {aud.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campaign Message Area */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2C3325]">Campaign Message Content</label>
                <textarea
                  rows={5}
                  required
                  value={campaignText}
                  onChange={(e) => setCampaignText(e.target.value)}
                  placeholder="Type your WhatsApp message template here... e.g. Dear Patient, Hazara Dental Clinic will remain open this Sunday for free consultations."
                  className="w-full p-4 bg-[#F4F6F0] border border-[#E4E7D3] rounded-2xl text-xs text-[#2C3325] placeholder-[#8A9380] focus:outline-none focus:border-[#4A5D23] transition-colors leading-relaxed"
                />
              </div>

              {/* Optional Attachment URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2C3325] flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-[#4A5D23]" /> Optional Image Banner or Document URL
                </label>
                <input
                  type="url"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="https://example.com/banner.png (Optional)"
                  className="w-full p-3 bg-[#F4F6F0] border border-[#E4E7D3] rounded-xl text-xs text-[#2C3325] placeholder-[#8A9380] focus:outline-none focus:border-[#4A5D23] font-mono"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={sendingBroadcast}
                  className="px-6 py-3.5 rounded-xl bg-[#4A5D23] hover:bg-[#3D4D1D] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {sendingBroadcast ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" /> Dispatching Broadcast...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Dispatch WhatsApp Broadcast
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Direct Quick WhatsApp Sender (1 Col) */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-[24px] bg-white border border-[#E4E7D3] shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#F4F6F0]">
              <h3 className="text-sm font-bold text-[#2C3325] flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#4A5D23]" />
                Direct Quick Message
              </h3>
              <span className="px-2 py-0.5 bg-[#E4E7D3] text-[#4A5D23] text-[10px] font-mono font-bold rounded-lg">
                1-on-1 Notice
              </span>
            </div>

            {testResult && (
              <div className={`p-3.5 rounded-2xl text-xs font-semibold ${
                testResult.success 
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}>
                {testResult.success ? (
                  <div>
                    <p className="font-bold flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" /> Message Delivered!
                    </p>
                    <p className="text-[10px] mt-1 font-mono text-emerald-800">Chat ID: {testResult.chatId}</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold flex items-center gap-1.5 text-rose-700">
                      <AlertTriangle className="w-4 h-4" /> Send Failed
                    </p>
                    <p className="text-[10px] mt-1 font-mono text-rose-800">{testResult.error}</p>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSendQuickMessage} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#2C3325] mb-1">Patient Phone Number</label>
                <input
                  type="text"
                  required
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-3 bg-[#F4F6F0] border border-[#E4E7D3] rounded-xl text-xs text-[#2C3325] placeholder-[#8A9380] focus:outline-none focus:border-[#4A5D23] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3325] mb-1">Message Content</label>
                <textarea
                  rows={4}
                  required
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Type message..."
                  className="w-full p-3 bg-[#F4F6F0] border border-[#E4E7D3] rounded-xl text-xs text-[#2C3325] focus:outline-none focus:border-[#4A5D23]"
                />
              </div>

              <button
                type="submit"
                disabled={sendingTest}
                className="w-full py-3 rounded-xl bg-[#4A5D23] hover:bg-[#3D4D1D] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors disabled:opacity-50"
              >
                {sendingTest ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4" />}
                Send Direct Message
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* ══ MESSAGE DELIVERY LOGS TABLE ══ */}
      <div className="p-6 sm:p-8 rounded-[24px] bg-white border border-[#E4E7D3] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F4F6F0] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#2C3325] flex items-center gap-2">
              <History className="w-5 h-5 text-[#4A5D23]" /> Message Delivery Audit Log
            </h2>
            <p className="text-xs text-[#8A9380]">Real-time history of dispatched WhatsApp patient notices, invoices, and campaign messages</p>
          </div>

          <button
            type="button"
            onClick={fetchLogs}
            disabled={loadingLogs}
            className="px-4 py-2 rounded-xl bg-[#F4F6F0] hover:bg-[#E4E7D3] text-[#4A5D23] text-xs font-bold border border-[#E4E7D3] flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
            Refresh Logs
          </button>
        </div>

        {loadingLogs ? (
          <div className="text-center py-12 text-xs text-[#8A9380] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#4A5D23]" /> Loading delivery audit log...
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 bg-[#F4F6F0] rounded-2xl border border-dashed border-[#E4E7D3] text-xs text-[#8A9380]">
            No message dispatch logs recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#E4E7D3] rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4F6F0] text-[#2C3325] font-bold border-b border-[#E4E7D3]">
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Message Type</th>
                  <th className="py-3 px-4">Delivery Status</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F6F0]">
                {logs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-[#F4F6F0]/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#2C3325]">
                      {log.recipient_name || 'Patient'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#8A9380]">
                      {log.recipient_phone || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E4E7D3] text-[#4A5D23] font-bold text-[10px] uppercase tracking-wider">
                        {log.message_type || 'WhatsApp'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        {log.whatsapp_status || 'DELIVERED'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-[#8A9380]">
                      {log.sent_at ? new Date(log.sent_at).toLocaleString('en-IN') : 'Just now'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </motion.div>
  )
}
