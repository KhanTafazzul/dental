import React from 'react'
import InventoryClient from './InventoryClient'
import { getInventoryItems } from '@/app/admin/actions'
import { getAdminSupabase } from '@/lib/supabase'
import { fetchServerInventoryStats } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const adminDb = getAdminSupabase()
  
  // 1. Fetch initial inventory items and pre-calculated server stats in parallel
  const [inventoryRes, initialStats, { data: branchesData }] = await Promise.all([
    getInventoryItems('hazara'),
    fetchServerInventoryStats('hazara'),
    adminDb.from('branches').select('id, name, slug').order('name', { ascending: true })
  ])

  const initialItems = inventoryRes.success ? (inventoryRes.data || []) : []

  const branches = branchesData || [
    { id: 'hazara', name: 'Hazara Clinic', slug: 'hazara' },
    { id: 'family', name: 'Family Dental Clinic', slug: 'family' }
  ]

  return (
    <InventoryClient 
      initialItems={initialItems} 
      initialStats={initialStats}
      branches={branches} 
    />
  )
}

