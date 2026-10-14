'use client'

/**
 * @file hooks/useAppointments.ts
 * @description State management hook for appointments listing, filtering, searching, and caching.
 */

import { useState, useMemo, useEffect, useCallback } from 'react'
import { getClientCache, saveClientCache } from '@/lib/clientCache'
import type { Appointment, AppointmentStatus } from '@/types/common.types'

export interface UseAppointmentsOptions {
  initialAppointments?: Appointment[]
  cacheKey?: string
}

export function useAppointments({
  initialAppointments = [],
  cacheKey = 'admin_appointments',
}: UseAppointmentsOptions = {}) {
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = getClientCache<Appointment[]>(cacheKey)
      if (cached && cached.length > 0) return cached
    }
    return initialAppointments
  })

  useEffect(() => {
    if (initialAppointments && initialAppointments.length > 0) {
      setAppointments(initialAppointments)
      saveClientCache(cacheKey, initialAppointments)
    }
  }, [initialAppointments, cacheKey])

  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filtered & searched appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      // Branch filter
      if (selectedBranch !== 'all') {
        const branchMatch =
          appt.branch_id === selectedBranch ||
          (appt as any).branches?.id === selectedBranch ||
          (appt as any).branches?.slug === selectedBranch
        if (!branchMatch) return false
      }

      // Date filter
      if (selectedDate && appt.appointment_date !== selectedDate) {
        return false
      }

      // Status filter
      if (statusFilter !== 'all' && appt.status !== statusFilter) {
        return false
      }

      // Search query (matches patient name, mobile, doctor name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const patientName = (appt as any).patients?.name?.toLowerCase() || ''
        const patientMobile = (appt as any).patients?.mobile || ''
        const doctorName = (appt as any).doctors?.name?.toLowerCase() || ''
        const notes = (appt as any).problem_description?.toLowerCase() || ''

        const matches =
          patientName.includes(q) ||
          patientMobile.includes(q) ||
          doctorName.includes(q) ||
          notes.includes(q)

        if (!matches) return false
      }

      return true
    })
  }, [appointments, selectedBranch, selectedDate, statusFilter, searchQuery])

  // Local state update helpers
  const updateLocalStatus = useCallback((id: string, newStatus: AppointmentStatus) => {
    setAppointments(prev =>
      prev.map(a => (a.id === id ? { ...a, status: newStatus } : a))
    )
  }, [])

  const removeLocalAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id))
  }, [])

  const addLocalAppointment = useCallback((newAppt: Appointment) => {
    setAppointments(prev => [newAppt, ...prev])
  }, [])

  return {
    appointments,
    filteredAppointments,
    setAppointments,
    selectedBranch,
    setSelectedBranch,
    selectedDate,
    setSelectedDate,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    updateLocalStatus,
    removeLocalAppointment,
    addLocalAppointment,
  }
}
