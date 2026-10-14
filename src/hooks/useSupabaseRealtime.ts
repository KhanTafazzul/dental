'use client'

/**
 * @file hooks/useSupabaseRealtime.ts
 * @description Custom hook for subscribing to Supabase Realtime postgres_changes.
 * Automatically handles channel subscription, events, and clean teardown on unmount.
 */

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export interface RealtimeOptions<T extends { [key: string]: any } = { [key: string]: any }> {
  table: string
  schema?: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  filter?: string
  onData: (payload: RealtimePostgresChangesPayload<T>) => void
  enabled?: boolean
}

/**
 * Subscribes to Supabase Realtime postgres changes on a given table.
 *
 * @example
 * useSupabaseRealtime({
 *   table: 'appointments',
 *   event: '*',
 *   onData: (payload) => console.log('Appointment changed:', payload)
 * })
 */
export function useSupabaseRealtime<T extends { [key: string]: any } = { [key: string]: any }>({
  table,
  schema = 'public',
  event = '*',
  filter,
  onData,
  enabled = true,
}: RealtimeOptions<T>) {
  const onDataRef = useRef(onData)
  useEffect(() => {
    onDataRef.current = onData
  }, [onData])

  useEffect(() => {
    if (!enabled) return

    const channelName = `realtime_${table}_${Math.random().toString(36).substring(2, 7)}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema,
          table,
          filter,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          onDataRef.current(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, schema, event, filter, enabled])
}
