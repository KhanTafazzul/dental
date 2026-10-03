'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  sendBroadcastCampaignAction, 
  triggerSameDayRemindersAction, 
  triggerBirthdayWishesAction, 
  getMessageLogsAction,
  triggerDoctorMorningDigestAction,
  testWahaWhatsAppAction,
  getWahaStatusAction
} from '@/app/admin/actions'
import { 
  MessageSquare, Send, Gift, Bell, 
  CheckCircle, Loader2, RefreshCw, FileText, Users, Paperclip,
  Server, Sun, Phone, AlertTriangle
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

  // Trigger states
  const [runningReminders, setRunningReminders] = useState(false)
  const [runningBirthdays, setRunningBirthdays] = useState(false)
  const [runningDoctorDigest, setRunningDoctorDigest] = useState(false)
  const [triggerMsg, setTriggerMsg] = useState<string | null>(null)

  // WAHA Test Sender states
  const [testPhone, setTestPhone] = useState('+91 8418878491')
  const [testMessage, setTestMessage] = useState('👋 Hello! Greeting from Dental Clinic via WAHA WhatsApp GOWS engine.')
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
      console.error('Error checking WAHA status:', err)
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
    if (!campaignText) return
    setSendingBroadcast(true)
    setBroadcastResult(null)
    try {
      const res = await sendBroadcastCampaignAction(targetAudience, campaignText, attachmentUrl)
      if (res.success) {
        setBroadcastResult(`Campaign sent successfully to ${res.count} patients via active WhatsApp & Email channels!`)
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

  const handleRunReminders = async () => {
    setRunningReminders(true)
    setTriggerMsg(null)
    try {
      const res = await triggerSameDayRemindersAction()
      if (res.success) {
        setTriggerMsg(`Same-day reminders processed! Sent to ${res.count} patients.`)
        await fetchLogs()
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error triggering reminders.'
      alert(errorMsg)
    } finally {
      setRunningReminders(false)
    }
  }

  const handleRunBirthdays = async () => {
    setRunningBirthdays(true)
    setTriggerMsg(null)
    try {
      const res = await triggerBirthdayWishesAction()
      if (res.success) {
        setTriggerMsg(`Birthday wishes processed! Sent greetings to ${res.count} patients today.`)
        await fetchLogs()
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error triggering birthday wishes.'
      alert(errorMsg)
    } finally {
      setRunningBirthdays(false)
    }
  }

  const handleRunDoctorDigest = async () => {
    setRunningDoctorDigest(true)
    setTriggerMsg(null)
    try {
      const res = await triggerDoctorMorningDigestAction()
      if (res.success) {
        setTriggerMsg(`Daily Morning Doctor Appointment Digest dispatched via WAHA to ${res.count} doctor(s)!`)
        await fetchLogs()
      } else {
        alert('Failed to send morning doctor digest.')
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error triggering doctor digest.'
      alert(errorMsg)
    } finally {
      setRunningDoctorDigest(false)
    }
  }

  const handleSendWahaTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testPhone || !testMessage) return
    setSendingTest(true)
    setTestResult(null)
    try {
      const res = await testWahaWhatsAppAction(testPhone, testMessage)
      setTestResult(res as WahaTestResult)
      if (res.success) {
        await fetchLogs()
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send test message'
      setTestResult({ success: false, error: errorMsg })
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12 }}
      className="perspective-stage space-y-7 font-sans max-w-6xl"
    >
      
      {/* ══ HEADER ══ */}
      <div className="clay p-6 border border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-emerald-900 to-teal-800 rounded-2xl text-emerald-400 shadow-md">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-2">
              WhatsApp Engine & Messaging Terminal
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              WAHA GOWS engine (Render hosted), automated doctor morning appointment digests & patient broadcasts.
            </p>
          </div>
        </div>

        {/* WAHA Engine Status Badge */}
        <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-md">
          <Server className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="text-left">
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">WAHA Render Engine</p>
            <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              GOWS Engine Active
            </p>
          </div>
        </div>
      </div>

      {/* ══ WAHA ENGINE CONFIG & APPOINTMENT DIGEST CARDS ══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Morning Doctor Digest Card */}
        <div className="clay p-5 border border-amber-200/70 bg-gradient-to-br from-amber-50/50 to-orange-50/20 flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-sm">
              <Sun className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Daily Automation
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Doctor Morning Digest</h4>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Automatically formats and dispatches daily appointment lists to respective doctors every morning.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRunDoctorDigest}
            disabled={runningDoctorDigest}
            className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            {runningDoctorDigest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sun className="w-3.5 h-3.5" />}
            Send Doctor Digest Now
          </button>
        </div>

        {/* Same-Day Reminders */}
        <div className="clay p-5 border border-cyan-200/70 bg-gradient-to-br from-cyan-50/50 to-teal-50/20 flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="p-3 bg-cyan-600 text-white rounded-2xl shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 bg-cyan-100 text-cyan-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Patient Alerts
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Same-Day Reminders</h4>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Dispatches WhatsApp appointment reminders & token details to scheduled patients today.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRunReminders}
            disabled={runningReminders}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            {runningReminders ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
            Run Patient Reminders
          </button>
        </div>

        {/* Birthday Greetings */}
        <div className="clay p-5 border border-rose-200/70 bg-gradient-to-br from-rose-50/50 to-pink-50/20 flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-sm">
              <Gift className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Wishes & Offers
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Birthday Wishes</h4>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Send personalized birthday wishes with promotional dental discount vouchers to patients.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRunBirthdays}
            disabled={runningBirthdays}
            className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            {runningBirthdays ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Gift className="w-3.5 h-3.5" />}
            Send Birthday Wishes
          </button>
        </div>

      </div>

      {triggerMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          {triggerMsg}
        </div>
      )}

      {/* ══ WAHA TEST SENDER & BROADCAST COMPOSER ══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
        
        {/* WAHA Quick Test Sender */}
        <div className="md:col-span-1">
          <div className="clay p-6 border border-emerald-200/80 bg-emerald-50/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                WAHA Engine Quick Dispatch Test
              </h3>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-lg">
                GOWS Engine
              </span>
            </div>

            {testResult && (
              <div className={`p-3.5 rounded-2xl text-xs font-semibold ${
                testResult.success 
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}>
                {testResult.success ? (
                  <div>
                    <p className="font-bold flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle className="w-4 h-4" /> Message Sent Successfully!
                    </p>
                    <p className="text-[11px] mt-1 font-mono">Chat ID: {testResult.chatId}</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold flex items-center gap-1.5 text-rose-700">
                      <AlertTriangle className="w-4 h-4" /> Dispatch Failed
                    </p>
                    <p className="text-[11px] mt-1">{testResult.error}</p>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSendWahaTest} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Target Mobile Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 8418878491"
                  value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono bg-white text-slate-900 font-semibold focus:outline-none focus:border-emerald-500 shadow-sm"
                />
                <p className="text-[10px] text-slate-500">Auto-formatted for WAHA as: <span className="font-mono font-bold text-emerald-700">918418878491@c.us</span></p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Sample Text Payload
                </label>
                <textarea
                  required
                  rows={3}
                  value={testMessage}
                  onChange={e => setTestMessage(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 font-medium focus:outline-none focus:border-emerald-500 shadow-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sendingTest}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send WAHA WhatsApp Test
              </button>
            </form>

            <div className="pt-2 border-t border-emerald-200/60 text-[10px] text-slate-500 font-mono space-y-1">
              <p>📍 Endpoint: <span className="text-slate-800 font-bold">https://your-waha-app.onrender.com/api/sendText</span></p>
              <p>🔑 Header Key: <span className="text-slate-800 font-bold">X-Api-Key: KhanAman@9807</span></p>
              <p>⚡ Session: <span className="text-slate-800 font-bold">default</span></p>
              <p>⏱️ Pinged every 5 min via UptimeRobot to avoid Render free tier sleep.</p>
            </div>
          </div>
        </div>

        {/* Broadcast Campaign Composer */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="clay p-6 border border-slate-200/60 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-200/60 flex items-center gap-2">
              <Send className="w-4 h-4 text-teal-600" />
              Compose Patient Broadcast Campaign
            </h3>

            {broadcastResult && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl">
                {broadcastResult}
              </div>
            )}

            <form onSubmit={handleSendCampaign} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" /> Target Audience
                  </label>
                  <select
                    value={targetAudience}
                    onChange={e => setTargetAudience(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl text-xs bg-white text-slate-800 font-semibold focus:outline-none focus:border-emerald-500 shadow-sm"
                  >
                    <option value="all">All Clinic Patients</option>
                    <option value="hazara">Hazara Branch Patients Only</option>
                    <option value="family">Family Branch Patients Only</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Paperclip className="w-3 h-3 text-slate-400" /> Attachment URL (Optional Banner / Offer PDF)
                  </label>
                  <input
                    type="url"
                    placeholder="https://... image or offer banner link"
                    value={attachmentUrl}
                    onChange={e => setAttachmentUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl text-xs bg-white text-slate-800 font-semibold focus:outline-none focus:border-emerald-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Campaign Message Body</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type broadcast text (e.g. Special 20% discount on Dental Scaling & Polishing this week!)..."
                  value={campaignText}
                  onChange={e => setCampaignText(e.target.value)}
                  className="w-full p-3.5 border border-slate-200 rounded-2xl text-xs bg-white text-slate-800 font-medium focus:outline-none focus:border-emerald-500 shadow-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sendingBroadcast || !campaignText}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-2xl text-xs font-bold shadow-xl shadow-slate-900/15 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sendingBroadcast ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <Send className="w-4 h-4" />}
                Dispatch Broadcast Campaign via WAHA
              </button>
            </form>
          </div>

          {/* WhatsApp Webhook Status Banner */}
          <div className="clay p-5 border border-indigo-200 bg-indigo-50/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-sm">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">WhatsApp Webhook Listener Active</h4>
                <p className="text-[10px] text-slate-600 font-medium">
                  Endpoint: <span className="font-mono font-bold text-indigo-700">/api/whatsapp/webhook</span> — Listens for incoming WAHA message events.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-xl border border-indigo-200 shrink-0">
              Webhook Active
            </span>
          </div>

        </div>

      </div>

      {/* ══ MESSAGE DELIVERY AUDIT LOGS ══ */}
      <div className="clay p-6 border border-slate-200/60 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Live Messaging Delivery & Audit Logs
          </h3>
          <button
            onClick={fetchLogs}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
            title="Refresh Audit Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loadingLogs ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loadingLogs ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-emerald-600 animate-spin" /></div>
        ) : (
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden text-xs shadow-sm bg-white/80 max-h-[500px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                  <th className="p-3.5">Recipient Info</th>
                  <th className="p-3.5">Message Type</th>
                  <th className="p-3.5">WhatsApp Delivery Status</th>
                  <th className="p-3.5">Sent Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400 font-light">
                      No recent message delivery records logged. Test dispatches or morning digests will appear here.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, idx) => (
                    <tr key={log.id || idx} className="hover:bg-slate-50/70 transition text-slate-800">
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900">{log.recipient_name || 'WhatsApp Recipient'}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{log.recipient_phone || log.recipient_email}</p>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700 uppercase text-[10px]">
                        {log.message_type?.replace(/_/g, ' ')}
                      </td>
                      <td className="p-3.5 font-mono">
                        <span className={`px-2 py-0.5 rounded-xl text-[10px] font-bold border ${
                          String(log.whatsapp_status).includes('sent') 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                        }`}>
                          {log.whatsapp_status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[10px] text-slate-500">
                        {log.sent_at ? new Date(log.sent_at).toLocaleString() : 'Just now'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </motion.div>
  )
}
