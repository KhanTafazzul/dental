'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Paperclip, Image as ImageIcon, Search, Check, CheckCheck, Smile,
  FileText, Receipt, Stethoscope, User, ShieldCheck, Phone, Video, MoreVertical,
  ChevronDown, Download, AlertCircle, Clock, Sparkles, Plus, Share2
} from 'lucide-react'
import SharePatientRecordModal, { PatientAttachmentRecord } from './SharePatientRecordModal'

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  senderRole?: 'doctor' | 'admin'
  recipientId: string
  text: string
  timestamp: string // ISO string
  isRead: boolean
  attachments?: Array<{
    type: 'image' | 'file' | 'patient_record'
    url?: string
    name?: string
    record?: PatientAttachmentRecord
  }>
  reactions?: Record<string, string[]> // emoji -> array of senderIds
}

export interface DoctorUser {
  id: string
  name: string
  slug: string
  specialty: string
  branchName?: string
  avatarUrl?: string
  isOnline?: boolean
  lastSeen?: string
}

interface DoctorChatPortalProps {
  currentUser: {
    id: string
    name: string
    role: 'doctor' | 'admin'
    avatarUrl?: string
  }
  doctorsList: DoctorUser[]
  appointments?: any[]
}

const EMOJI_OPTIONS = ['👍', '❤️', '💡', '🦷', '😂', '👏']

export default function DoctorChatPortal({
  currentUser,
  doctorsList = [],
  appointments = []
}: DoctorChatPortalProps) {
  // State
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctorsList[0]?.id || '')
  const [searchDoctorQuery, setSearchDoctorQuery] = useState('')
  const [inputText, setInputText] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [activeReactionMsgId, setActiveReactionMsgId] = useState<string | null>(null)

  // Demo messages database in local state (persisted per conversation in localStorage)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('falix_doctor_chat_messages')
      if (saved) {
        try { return JSON.parse(saved) } catch (e) {}
      }
    }
    // Default initial mock conversation
    const now = new Date()
    return [
      {
        id: 'm1',
        senderId: doctorsList[0]?.id || 'doc-1',
        senderName: doctorsList[0]?.name || 'Dr. Sarah Jenkins',
        senderRole: 'doctor',
        recipientId: currentUser.id,
        text: 'Hello! I reviewed the root canal diagnosis for patient Priya Sharma.',
        timestamp: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
        isRead: true,
        reactions: { '👍': [currentUser.id] }
      },
      {
        id: 'm2',
        senderId: doctorsList[0]?.id || 'doc-1',
        senderName: doctorsList[0]?.name || 'Dr. Sarah Jenkins',
        senderRole: 'doctor',
        recipientId: currentUser.id,
        text: 'Attaching the digital OPG X-ray and procedure bill for reference.',
        timestamp: new Date(now.getTime() - 1000 * 60 * 42).toISOString(),
        isRead: true,
        attachments: [
          {
            type: 'patient_record',
            record: {
              id: 'rec-sample',
              patientName: 'Priya Sharma',
              type: 'invoice',
              title: 'Root Canal & Ceramic Crown Invoice #INV-8821',
              date: '2026-09-08',
              amount: 4500,
              doctorName: doctorsList[0]?.name || 'Dr. Sarah Jenkins',
              notes: 'Subtotal Rs. 5000, 10% Discount Applied'
            }
          }
        ]
      },
      {
        id: 'm3',
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        recipientId: doctorsList[0]?.id || 'doc-1',
        text: 'Thank you Dr. Sarah! The crown fitting looks perfect.',
        timestamp: new Date(now.getTime() - 1000 * 60 * 20).toISOString(),
        isRead: true,
        reactions: { '❤️': [doctorsList[0]?.id || 'doc-1'] }
      }
    ]
  })

  // Persist messages to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('falix_doctor_chat_messages', JSON.stringify(messages))
    }
  }, [messages])

  // Active target doctor
  const targetDoctor = useMemo(() => {
    return doctorsList.find(d => d.id === selectedDoctorId) || doctorsList[0]
  }, [doctorsList, selectedDoctorId])

  // Filter messages for current thread
  const currentThreadMessages = useMemo(() => {
    if (!targetDoctor) return []
    return messages.filter(
      m => (m.senderId === currentUser.id && m.recipientId === targetDoctor.id) ||
           (m.senderId === targetDoctor.id && m.recipientId === currentUser.id)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }, [messages, currentUser.id, targetDoctor])

  // Checkbox 1: Auto-scrolling to latest message on load/new message (without interrupting scrolling up)
  const chatThreadRef = useRef<HTMLDivElement>(null)
  const isUserScrollingUpRef = useRef(false)

  const handleScroll = () => {
    if (!chatThreadRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = chatThreadRef.current
    // User is scrolling up if not near bottom (within 80px)
    isUserScrollingUpRef.current = scrollHeight - scrollTop - clientHeight > 80
  }

  useEffect(() => {
    if (chatThreadRef.current && !isUserScrollingUpRef.current) {
      chatThreadRef.current.scrollTop = chatThreadRef.current.scrollHeight
    }
  }, [currentThreadMessages])

  // Send Message logic
  const handleSendMessage = (textToSend?: string, attachmentPayload?: any) => {
    const content = textToSend !== undefined ? textToSend : inputText
    if (!content.trim() && !attachmentPayload) return
    if (!targetDoctor) return

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      recipientId: targetDoctor.id,
      text: content.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
      attachments: attachmentPayload ? [attachmentPayload] : undefined,
      reactions: {}
    }

    setMessages(prev => [...prev, newMsg])
    setInputText('')
    isUserScrollingUpRef.current = false // Reset scroll to auto-scroll down for new message
  }

  // Handle Multi-line Shift + Enter key down
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle Emoji Reaction Toggle
  const handleToggleReaction = (msgId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m
      const reactions = { ...(m.reactions || {}) }
      const existing = reactions[emoji] || []
      const hasReacted = existing.includes(currentUser.id)
      if (hasReacted) {
        reactions[emoji] = existing.filter(id => id !== currentUser.id)
        if (reactions[emoji].length === 0) delete reactions[emoji]
      } else {
        reactions[emoji] = [...existing, currentUser.id]
      }
      return { ...m, reactions }
    }))
    setActiveReactionMsgId(null)
  }

  // Send Attached Patient Record / Bill
  const handleAttachRecord = (record: PatientAttachmentRecord) => {
    handleSendMessage(
      `Shared ${record.type === 'invoice' ? 'Bill/Invoice' : record.type === 'prescription' ? 'Prescription Report' : 'X-Ray Scan'} for patient ${record.patientName}`,
      {
        type: 'patient_record',
        record
      }
    )
  }

  // File upload simulation
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    const fileUrl = URL.createObjectURL(file)
    handleSendMessage(`Attached file: ${file.name}`, {
      type: file.type.startsWith('image/') ? 'image' : 'file',
      url: fileUrl,
      name: file.name
    })
  }

  // Group consecutive messages within 5 minutes from same sender
  const groupedMessages = useMemo(() => {
    return currentThreadMessages.map((msg, index) => {
      const prevMsg = currentThreadMessages[index - 1]
      let isFirstInGroup = true
      if (prevMsg && prevMsg.senderId === msg.senderId) {
        const diffMinutes = (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime()) / (1000 * 60)
        if (diffMinutes < 5) {
          isFirstInGroup = false
        }
      }
      return { ...msg, isFirstInGroup }
    })
  }, [currentThreadMessages])

  // Format timestamp (Relative for recent, full date for older)
  const formatMsgTimestamp = (isoDate: string) => {
    const date = new Date(isoDate)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  // Filtered Doctors list
  const filteredDoctors = doctorsList.filter(d =>
    d.name.toLowerCase().includes(searchDoctorQuery.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchDoctorQuery.toLowerCase())
  )

  return (
    <div className="w-full h-[82vh] bg-slate-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row text-sans">
      
      {/* ════ LEFT COLUMN: DOCTOR DIRECTORY ════ */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-white/10 bg-slate-900/90 flex flex-col shrink-0">
        
        {/* Directory Header */}
        <div className="p-4 border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-serif font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-400" />
              Doctor Consultations
            </h2>
            <span className="text-[10px] font-mono font-semibold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
              {doctorsList.length} Active
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search doctor or specialty..."
              value={searchDoctorQuery}
              onChange={e => setSearchDoctorQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>

        {/* Doctor List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No doctors found.
            </div>
          ) : (
            filteredDoctors.map(doc => {
              const isSelected = targetDoctor?.id === doc.id
              // Get last message in thread
              const docMsgs = messages.filter(
                m => (m.senderId === currentUser.id && m.recipientId === doc.id) ||
                     (m.senderId === doc.id && m.recipientId === currentUser.id)
              )
              const lastMsg = docMsgs[docMsgs.length - 1]

              return (
                <button
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoctorId(doc.id)
                    isUserScrollingUpRef.current = false
                  }}
                  className={`w-full p-3 rounded-2xl transition-all text-left flex items-start gap-3 relative cursor-pointer ${
                    isSelected ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 border border-teal-500/40' : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {/* Doctor Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {doc.name.replace(/^Dr\.\s*/i, '').charAt(0)}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                      doc.isOnline !== false ? 'bg-emerald-400' : 'bg-slate-500'
                    }`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xs font-semibold truncate ${isSelected ? 'text-teal-300' : 'text-slate-200'}`}>
                        {doc.name}
                      </h3>
                      {lastMsg && (
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {formatMsgTimestamp(lastMsg.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {doc.specialty}
                    </p>
                    {lastMsg && (
                      <p className="text-[11px] text-slate-400 truncate mt-1 italic">
                        {lastMsg.text || 'Shared record'}
                      </p>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ════ RIGHT COLUMN: ACTIVE CONVERSATION THREAD ════ */}
      <div className="flex-1 flex flex-col bg-slate-950 min-w-0 relative">
        
        {/* Chat Thread Header */}
        {targetDoctor ? (
          <div className="p-4 border-b border-white/10 bg-slate-900/60 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-700 flex items-center justify-center text-white font-bold text-sm">
                  {targetDoctor.name.replace(/^Dr\.\s*/i, '').charAt(0)}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                  targetDoctor.isOnline !== false ? 'bg-emerald-400' : 'bg-slate-500'
                }`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  {targetDoctor.name}
                  <span className="text-[10px] text-emerald-400 font-normal bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Online
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {targetDoctor.specialty} • {targetDoctor.branchName || 'Hazara & Family Dental'}
                </p>
              </div>
            </div>

            {/* Action button: Share Patient Record / Bill */}
            <button
              onClick={() => setShowShareModal(true)}
              className="px-3 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-teal-500/10"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Share Patient Bill / Report</span>
            </button>
          </div>
        ) : (
          <div className="p-4 border-b border-white/10 text-slate-400 text-xs">
            Select a doctor to start conversation
          </div>
        )}

        {/* ═══ MESSAGE THREAD CONTAINER ═══ */}
        <div
          ref={chatThreadRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-3 relative"
        >
          {groupedMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 text-xs space-y-2">
              <Stethoscope className="w-10 h-10 text-teal-500/30 mb-2 animate-bounce" />
              <p className="font-semibold text-slate-300">No Messages Yet</p>
              <p className="max-w-xs text-slate-400">
                Start a consultation with {targetDoctor?.name} by typing a message below or sharing a patient diagnosis report.
              </p>
            </div>
          ) : (
            groupedMessages.map(msg => {
              const isSelf = msg.senderId === currentUser.id
              const hasReactions = msg.reactions && Object.keys(msg.reactions).length > 0

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 group relative ${isSelf ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Sender Avatar (Only on first in consecutive group) */}
                  {!isSelf && (
                    <div className="w-7 h-7 rounded-lg bg-teal-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mb-1 opacity-90">
                      {msg.isFirstInGroup ? msg.senderName.charAt(0) : ''}
                    </div>
                  )}

                  <div className={`max-w-[78%] flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                    
                    {/* Sender Name header if first in group */}
                    {!isSelf && msg.isFirstInGroup && (
                      <span className="text-[10px] font-semibold text-teal-400 mb-1 ml-1">
                        {msg.senderName}
                      </span>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`relative p-3.5 rounded-2xl text-xs leading-relaxed shadow-md transition-all ${
                        isSelf
                          ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-br-none border border-teal-400/30'
                          : 'bg-slate-900 text-slate-200 rounded-bl-none border border-white/10'
                      }`}
                    >
                      {/* Attached Patient Record Card Preview */}
                      {msg.attachments?.map((att, attIdx) => {
                        if (att.type === 'patient_record' && att.record) {
                          const r = att.record
                          return (
                            <div
                              key={`att-${attIdx}`}
                              className="mb-2 p-3 rounded-xl bg-slate-950/70 border border-white/15 space-y-2 text-left"
                            >
                              <div className="flex items-center justify-between text-[11px]">
                                <span className={`font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                  r.type === 'invoice' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                }`}>
                                  {r.type === 'invoice' ? <Receipt className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                  {r.type === 'invoice' ? 'Patient Invoice' : 'Medical Report'}
                                </span>
                                <span className="text-slate-400 text-[10px]">{r.date}</span>
                              </div>

                              <div>
                                <h5 className="font-bold text-white text-xs">{r.title}</h5>
                                <p className="text-[11px] text-slate-300 mt-0.5">
                                  Patient: <strong className="text-teal-300">{r.patientName}</strong>
                                </p>
                                {r.amount !== undefined && (
                                  <p className="text-xs font-mono font-bold text-emerald-400 mt-1">
                                    Total Amount: Rs. {r.amount.toLocaleString()}
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => alert(`Opening ${r.title} for patient ${r.patientName}`)}
                                className="w-full py-1.5 px-3 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Download className="w-3 h-3" /> View & Download PDF
                              </button>
                            </div>
                          )
                        }

                        if (att.type === 'image' && att.url) {
                          return (
                            <div key={`img-${attIdx}`} className="mb-2 overflow-hidden rounded-xl border border-white/10">
                              <img src={att.url} alt={att.name || 'Attachment'} className="max-h-48 object-cover w-full" />
                            </div>
                          )
                        }

                        return null
                      })}

                      {/* Text Content */}
                      {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

                      {/* Time & Read Receipts */}
                      <div className={`flex items-center gap-1.5 mt-1.5 text-[9px] ${
                        isSelf ? 'text-teal-100 justify-end' : 'text-slate-400'
                      }`}>
                        <span>{formatMsgTimestamp(msg.timestamp)}</span>
                        {isSelf && (
                          <span title={msg.isRead ? "Read by recipient" : "Sent"}>
                            {msg.isRead ? (
                              <CheckCheck className="w-3.5 h-3.5 text-cyan-300 inline" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-teal-200 inline" />
                            )}
                          </span>
                        )}
                      </div>

                      {/* Hover Reaction Trigger */}
                      <button
                        type="button"
                        onClick={() => setActiveReactionMsgId(activeReactionMsgId === msg.id ? null : msg.id)}
                        className={`absolute -top-3 ${isSelf ? '-left-7' : '-right-7'} p-1 rounded-full bg-slate-800 border border-white/20 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer`}
                      >
                        <Smile className="w-3.5 h-3.5" />
                      </button>

                      {/* Emoji Picker Popup */}
                      {activeReactionMsgId === msg.id && (
                        <div className={`absolute -top-10 ${isSelf ? 'right-0' : 'left-0'} p-1.5 rounded-2xl bg-slate-900 border border-white/20 shadow-2xl flex items-center gap-1.5 z-20`}>
                          {EMOJI_OPTIONS.map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleToggleReaction(msg.id, emoji)}
                              className="hover:scale-125 transition-transform text-sm p-1"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reaction Badges below message */}
                    {hasReactions && (
                      <div className="flex items-center gap-1 mt-1">
                        {Object.entries(msg.reactions!).map(([emoji, senders]) => (
                          <span
                            key={emoji}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/90 border border-white/15 text-[10px] text-slate-200 shadow-sm"
                          >
                            <span>{emoji}</span>
                            <span className="font-mono font-bold">{senders.length}</span>
                          </span>
                        ))}
                      </div>
                    )}

                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* ═══ MESSAGE INPUT COMPOSER ═══ */}
        <div className="p-3.5 border-t border-white/10 bg-slate-900/80 backdrop-blur-md">
          <div className="relative flex items-end gap-2 bg-slate-950 border border-white/15 rounded-2xl p-2 focus-within:border-teal-400 transition-all">
            
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />

            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach File or Image"
              className="p-2 text-slate-400 hover:text-teal-400 hover:bg-white/5 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Patient Record Button */}
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              title="Share Patient Bill or Report"
              className="p-2 text-slate-400 hover:text-teal-400 hover:bg-white/5 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Auto-expanding Multi-line Textarea */}
            <textarea
              rows={1}
              placeholder={`Message ${targetDoctor?.name || 'Doctor'}... (Press Enter to send, Shift+Enter for new line)`}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-none py-2 px-1 max-h-32"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="p-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5 text-right px-2">
            💡 Press <kbd className="px-1 bg-slate-800 rounded border border-white/10 text-slate-400">Enter</kbd> to send • <kbd className="px-1 bg-slate-800 rounded border border-white/10 text-slate-400">Shift + Enter</kbd> for multi-line
          </p>
        </div>
      </div>

      {/* Share Patient Record Modal */}
      <SharePatientRecordModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onSelectRecord={handleAttachRecord}
        appointments={appointments}
      />
    </div>
  )
}
