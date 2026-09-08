import React from 'react'
import InventoryClient from './InventoryClient'
import { getInventoryItems } from '@/app/admin/actions'
import { getAdminSupabase } from '@/lib/supabase'
import { fetchServerInventoryStats } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  let initialItems: any[] = []
  let initialStats: any = null
  let branches: any[] = [
    { id: 'hazara', name: 'Hazara Clinic', slug: 'hazara' },
    { id: 'family', name: 'Family Dental Clinic', slug: 'family' }
  ]

  try {
    const adminDb = getAdminSupabase()

    const [inventoryRes, statsRes, branchRes] = await Promise.allSettled([
      getInventoryItems('hazara'),
      fetchServerInventoryStats('hazara'),
      adminDb.from('branches').select('id, name, slug').order('name', { ascending: true })
    ])

    if (inventoryRes.status === 'fulfilled' && inventoryRes.value?.success) {
      initialItems = inventoryRes.value.data || []
    }

    if (statsRes.status === 'fulfilled') {
      initialStats = statsRes.value
    }

    if (branchRes.status === 'fulfilled' && branchRes.value?.data && branchRes.value.data.length > 0) {
      branches = branchRes.value.data
    }
  } catch (error) {
    console.error('Error fetching inventory page data:', error)
  }

  // Fallback demo inventory items if DB is empty or uninitialized
  if (initialItems.length === 0) {
    initialItems = [
      { id: 'inv-1', name: 'Amoxicillin 500mg', generic_name: 'Amoxicillin', category: 'Antibiotics', stock: 140, reorderLevel: 30, unitPrice: 15, costPrice: 8, mrp: 20, supplier: 'Apex Pharma' },
      { id: 'inv-2', name: 'Composite Dental Resin A2', generic_name: 'Resin Composite', category: 'Restorative', stock: 8, reorderLevel: 15, unitPrice: 450, costPrice: 320, mrp: 550, supplier: '3M Dental Care' },
      { id: 'inv-3', name: 'Lignocaine 2% Injection', generic_name: 'Lidocaine HCl', category: 'Anesthesia', stock: 65, reorderLevel: 25, unitPrice: 40, costPrice: 22, mrp: 55, supplier: 'Zydus Healthcare' },
      { id: 'inv-4', name: 'Sterile Nitrile Examination Gloves (M)', generic_name: 'Nitrile Gloves', category: 'PPE & Consumables', stock: 12, reorderLevel: 20, unitPrice: 350, costPrice: 220, mrp: 400, supplier: 'Meditech Supplies' }
    ]
  }

  return (
    <InventoryClient 
      initialItems={initialItems} 
      initialStats={initialStats}
      branches={branches} 
    />
  )
}
