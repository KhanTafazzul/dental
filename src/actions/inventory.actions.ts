'use server'

/**
 * @file actions/inventory.actions.ts
 * @description Server Actions for medicine inventory management (TiDB Cloud).
 *
 * Covers: Search medicines, get all medicines, get inventory items,
 * save medicine stock (scan/receive), delete inventory item,
 * get medicine by barcode.
 *
 * Stock is stored in TiDB Cloud (MySQL-compatible).
 * Supabase is used only for branch passcode verification.
 */

import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getAdminSupabase } from '@/lib/supabase'
import { queryTiDB } from '@/lib/tidb'
import { randomUUID } from 'crypto'
import { updateTag } from 'next/cache'
import type { ActionResponse, Medicine } from '@/types/common.types'

// ─── Auth Helper ──────────────────────────────────────────────────────────────

/** Verifies admin session or camera passcode for capture-mode access. */
async function verifyInventoryAccess(
  branchSlug?: string,
  passcode?: string
): Promise<boolean> {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('dental_admin_token')?.value
  const verifiedAdmin = await verifyToken(adminToken)
  if (verifiedAdmin === 'admin') return true

  if (!branchSlug || !passcode) return false

  const adminDb = getAdminSupabase()
  const { data: branch } = await adminDb
    .from('branches')
    .select('camera_passcode')
    .eq('slug', branchSlug)
    .single()

  return !!(branch && branch.camera_passcode === passcode)
}

// ─── Search Medicines ─────────────────────────────────────────────────────────

/**
 * Searches medicines in TiDB by name, generic name, or barcode.
 * Returns up to 30 matches with active batch information.
 *
 * @param query - Search term (name fragment or barcode)
 * @param branchSlug - Optional branch filter for stock levels
 */
export async function searchMedicines(
  query: string,
  branchSlug?: string
): Promise<ActionResponse<Medicine[]>> {
  try {
    const rawQuery = query.trim().toLowerCase()
    const searchQuery = `%${rawQuery}%`

    let sql: string
    let params: unknown[]

    if (branchSlug) {
      sql = `
        SELECT m.id, m.name, m.generic_name, m.barcode, m.tablets_per_patch, m.created_at,
               COALESCE(SUM(b.stock), 0) as stock
        FROM medicines m
        LEFT JOIN medicine_batches b ON m.id = b.medicine_id AND b.branch_slug = ?
          AND b.stock > 0 AND b.expiry_date >= CURDATE()
        WHERE LOWER(m.name) LIKE ? OR LOWER(m.generic_name) LIKE ? OR LOWER(m.barcode) = ?
        GROUP BY m.id, m.name, m.generic_name, m.barcode, m.tablets_per_patch, m.created_at
        LIMIT 30
      `
      params = [branchSlug, searchQuery, searchQuery, rawQuery]
    } else {
      sql = `
        SELECT m.id, m.name, m.generic_name, m.barcode, m.tablets_per_patch, m.created_at,
               COALESCE(SUM(b.stock), 0) as stock
        FROM medicines m
        LEFT JOIN medicine_batches b ON m.id = b.medicine_id
          AND b.stock > 0 AND b.expiry_date >= CURDATE()
        WHERE LOWER(m.name) LIKE ? OR LOWER(m.generic_name) LIKE ? OR LOWER(m.barcode) = ?
        GROUP BY m.id, m.name, m.generic_name, m.barcode, m.tablets_per_patch, m.created_at
        LIMIT 30
      `
      params = [searchQuery, searchQuery, rawQuery]
    }

    const medicines = await queryTiDB(sql, params)
    if (!medicines || medicines.length === 0) return { success: true, data: [] }

    // Batch-fetch all batches in a single query (avoids N+1)
    const medIds = medicines.map((m: any) => m.id)
    const placeholders = medIds.map(() => '?').join(',')

    const batchSql = branchSlug
      ? `SELECT id, medicine_id, batch_number, expiry_date, price, cost_price, mrp, stock
         FROM medicine_batches
         WHERE medicine_id IN (${placeholders}) AND stock > 0 AND expiry_date >= CURDATE() AND branch_slug = ?
         ORDER BY expiry_date ASC`
      : `SELECT id, medicine_id, batch_number, expiry_date, price, cost_price, mrp, stock
         FROM medicine_batches
         WHERE medicine_id IN (${placeholders}) AND stock > 0 AND expiry_date >= CURDATE()
         ORDER BY expiry_date ASC`

    const batchParams = branchSlug ? [...medIds, branchSlug] : [...medIds]
    const allBatches = await queryTiDB(batchSql, batchParams)

    const batchMap = new Map<string, any[]>()
    for (const b of allBatches) {
      const list = batchMap.get(b.medicine_id) || []
      list.push(b)
      batchMap.set(b.medicine_id, list)
    }

    for (const med of medicines) {
      med.batches = batchMap.get(med.id) || []
    }

    return { success: true, data: medicines }
  } catch (err: any) {
    console.error('[Inventory] Error searching medicines:', err)
    return { success: false, error: err.message || 'Failed to search medicines.' }
  }
}

// ─── Get All Medicines ────────────────────────────────────────────────────────

/**
 * Fetches all medicines with active batch details for a branch.
 * Ordered alphabetically.
 */
export async function getAllMedicines(
  branchSlug: string = 'hazara'
): Promise<ActionResponse<Medicine[]>> {
  try {
    const sql = `
      SELECT m.id, m.name, m.generic_name, m.barcode, m.tablets_per_patch, m.created_at,
             COALESCE(SUM(b.stock), 0) as stock
      FROM medicines m
      LEFT JOIN medicine_batches b ON m.id = b.medicine_id
        AND (b.branch_slug = ? OR b.branch_slug IS NULL) AND b.stock > 0 AND b.expiry_date >= CURDATE()
      GROUP BY m.id, m.name, m.generic_name, m.barcode, m.tablets_per_patch, m.created_at
      ORDER BY m.name ASC
    `
    const medicines = await queryTiDB(sql, [branchSlug])
    if (!medicines || medicines.length === 0) return { success: true, data: [] }

    const medIds = medicines.map((m: any) => m.id)
    const placeholders = medIds.map(() => '?').join(',')
    const batchSql = `
      SELECT id, medicine_id, batch_number, expiry_date, price, cost_price, mrp, stock, branch_slug
      FROM medicine_batches
      WHERE medicine_id IN (${placeholders}) AND stock > 0 AND (branch_slug = ? OR branch_slug IS NULL)
      ORDER BY expiry_date ASC
    `
    const allBatches = await queryTiDB(batchSql, [...medIds, branchSlug])

    const batchMap = new Map<string, any[]>()
    for (const b of allBatches) {
      const list = batchMap.get(b.medicine_id) || []
      list.push(b)
      batchMap.set(b.medicine_id, list)
    }

    for (const med of medicines) {
      med.batches = batchMap.get(med.id) || []
    }

    return { success: true, data: medicines }
  } catch (err: any) {
    console.error('[Inventory] Error fetching all medicines:', err)
    return { success: false, error: err.message || 'Failed to fetch medicines.' }
  }
}

// ─── Get Inventory Items (enriched) ──────────────────────────────────────────

const SUPPLIER_LIST = [
  'Urban Deals', 'DealZone', 'BuyRight Dental',
  'DentalCorp', 'Trendline', 'MetroShop', 'MediCare Labs',
]

const CATEGORY_LIST = [
  'Medicines', 'Surgical & Clinical Supplies', 'Consumables',
  'PPE & Safety', 'Equipment', 'Dental Implants',
]

/**
 * Fetches all inventory items enriched with category, supplier,
 * reorder level, and stock status metadata.
 */
export async function getInventoryItems(
  branchSlug: string = 'hazara'
): Promise<ActionResponse<Medicine[]>> {
  try {
    const sql = `
      SELECT m.id, m.name, m.generic_name, m.barcode, m.tablets_per_patch, m.created_at,
             COALESCE(SUM(b.stock), 0) as stock
      FROM medicines m
      LEFT JOIN medicine_batches b ON m.id = b.medicine_id
        AND (b.branch_slug = ? OR b.branch_slug IS NULL)
      GROUP BY m.id, m.name, m.generic_name, m.barcode, m.tablets_per_patch, m.created_at
      ORDER BY stock ASC, m.name ASC
    `
    const medicines = await queryTiDB(sql, [branchSlug])
    if (!medicines || medicines.length === 0) return { success: true, data: [] }

    const medIds = medicines.map((m: any) => m.id)
    const placeholders = medIds.map(() => '?').join(',')
    const batchSql = `
      SELECT id, medicine_id, batch_number, expiry_date, price, cost_price, mrp, stock, branch_slug
      FROM medicine_batches
      WHERE medicine_id IN (${placeholders}) AND (branch_slug = ? OR branch_slug IS NULL)
      ORDER BY expiry_date ASC
    `
    const allBatches = await queryTiDB(batchSql, [...medIds, branchSlug])

    const batchMap = new Map<string, any[]>()
    for (const b of allBatches) {
      const list = batchMap.get(b.medicine_id) || []
      list.push(b)
      batchMap.set(b.medicine_id, list)
    }

    for (let idx = 0; idx < medicines.length; idx++) {
      const med = medicines[idx]
      const batches = batchMap.get(med.id) || []
      const latestBatch = batches[0] || {}
      const stockNum = Number(med.stock || 0)

      med.batches = batches
      med.unitPrice = Number(latestBatch.price || 15)
      med.costPrice = Number(latestBatch.cost_price || 10)
      med.mrp = Number(latestBatch.mrp || 20)
      med.category = CATEGORY_LIST[idx % CATEGORY_LIST.length]
      med.supplier = SUPPLIER_LIST[idx % SUPPLIER_LIST.length]
      med.reorderLevel = 20

      if (stockNum === 0) med.stockStatus = 'Out of Stock'
      else if (stockNum <= 30) med.stockStatus = 'Low'
      else if (stockNum <= 100) med.stockStatus = 'Medium'
      else med.stockStatus = 'High'
    }

    return { success: true, data: medicines }
  } catch (err: any) {
    console.error('[Inventory] Error fetching inventory items:', err)
    return { success: false, error: err.message || 'Failed to fetch inventory items.' }
  }
}

// ─── Save Medicine Stock ──────────────────────────────────────────────────────

export interface SaveStockDetails {
  name: string
  genericName?: string
  batchNumber: string
  expiryDate: string
  patchPrice: number
  costPrice?: number
  mrp?: number
  tabletsPerPatch: number
  branchSlug?: string
}

/**
 * Receives/scans new stock for a medicine. Inserts or updates the TiDB batch record.
 * Requires admin session or valid branch camera passcode.
 *
 * @param barcode - Barcode of the medicine (auto-generated if empty)
 * @param quantityPatches - Number of patches/boxes received
 * @param details - Product details for new/existing medicine
 * @param passcode - Camera passcode (required when not in admin session)
 */
export async function saveMedicineStock(
  barcode: string,
  quantityPatches: number,
  details: SaveStockDetails,
  passcode?: string
): Promise<ActionResponse<{ medicineId: string }>> {
  try {
    const authorized = await verifyInventoryAccess(details.branchSlug, passcode)
    if (!authorized) {
      return { success: false, error: 'Unauthorized: Missing or invalid session credentials.' }
    }

    const branchSlug = details.branchSlug || 'hazara'
    let barcodeToUse = barcode?.trim()
    let medicineId: string

    // 1. Look up existing medicine
    let medicines: any[] = []
    if (barcodeToUse) {
      medicines = await queryTiDB('SELECT id FROM medicines WHERE barcode = ?', [barcodeToUse])
    } else {
      const existingByName = await queryTiDB(
        'SELECT id, barcode FROM medicines WHERE LOWER(name) = ?',
        [details.name.trim().toLowerCase()]
      )
      if (existingByName.length > 0) {
        medicineId = existingByName[0].id
        barcodeToUse = existingByName[0].barcode
        medicines = [{ id: medicineId }]
      } else {
        barcodeToUse = `AUTO-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      }
    }

    const tabletsPerPatch = Number(details.tabletsPerPatch || 1)

    if (medicines.length > 0) {
      medicineId = medicines[0].id
      await queryTiDB(
        'UPDATE medicines SET name = ?, generic_name = ?, tablets_per_patch = ? WHERE id = ?',
        [details.name, details.genericName || null, tabletsPerPatch, medicineId]
      )
    } else {
      medicineId = randomUUID()
      await queryTiDB(
        'INSERT INTO medicines (id, name, generic_name, barcode, tablets_per_patch) VALUES (?, ?, ?, ?, ?)',
        [medicineId, details.name, details.genericName || null, barcodeToUse, tabletsPerPatch]
      )
    }

    // 2. Convert patches → tablets and compute per-tablet pricing
    const totalTablets = Number(quantityPatches) * tabletsPerPatch
    const singleTabletPrice = Number(details.patchPrice) / tabletsPerPatch
    const singleTabletCost = Number(details.costPrice || 0) / tabletsPerPatch
    const singleTabletMrp = Number(details.mrp || 0) / tabletsPerPatch

    // 3. Upsert batch record
    const existingBatches = await queryTiDB(
      'SELECT id, stock FROM medicine_batches WHERE medicine_id = ? AND batch_number = ? AND branch_slug = ?',
      [medicineId, details.batchNumber, branchSlug]
    )

    if (existingBatches.length > 0) {
      const newStock = Number(existingBatches[0].stock) + totalTablets
      await queryTiDB(
        'UPDATE medicine_batches SET stock = ?, price = ?, cost_price = ?, mrp = ?, expiry_date = ? WHERE id = ?',
        [newStock, singleTabletPrice, singleTabletCost, singleTabletMrp, details.expiryDate, existingBatches[0].id]
      )
    } else {
      const batchId = randomUUID()
      await queryTiDB(
        'INSERT INTO medicine_batches (id, medicine_id, batch_number, expiry_date, price, cost_price, mrp, stock, branch_slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [batchId, medicineId, details.batchNumber, details.expiryDate, singleTabletPrice, singleTabletCost, singleTabletMrp, totalTablets, branchSlug]
      )
    }

    updateTag('inventory-stats')
    return { success: true, data: { medicineId } }
  } catch (err: any) {
    console.error('[Inventory] Error saving medicine stock:', err)
    return { success: false, error: err.message || 'Failed to save medicine stock.' }
  }
}

// ─── Get Medicine By Barcode ──────────────────────────────────────────────────

/**
 * Looks up a medicine by barcode. Requires admin session or camera passcode.
 */
export async function getMedicineByBarcode(
  barcode: string,
  branchSlug?: string,
  passcode?: string
): Promise<ActionResponse<Medicine | null>> {
  try {
    const authorized = await verifyInventoryAccess(branchSlug, passcode)
    if (!authorized) {
      return { success: false, error: 'Unauthorized: Missing or invalid session credentials.' }
    }

    const rows = await queryTiDB('SELECT * FROM medicines WHERE barcode = ?', [barcode.trim()])
    return { success: true, data: rows.length > 0 ? rows[0] : null }
  } catch (err: any) {
    console.error('[Inventory] Error fetching medicine by barcode:', err)
    return { success: false, error: err.message || 'Failed to look up medicine.' }
  }
}

// ─── Delete Inventory Item ────────────────────────────────────────────────────

/**
 * Permanently deletes a medicine and all its batch records from TiDB.
 */
export async function deleteInventoryItem(medicineId: string): Promise<ActionResponse> {
  try {
    await queryTiDB('DELETE FROM medicine_batches WHERE medicine_id = ?', [medicineId])
    await queryTiDB('DELETE FROM medicines WHERE id = ?', [medicineId])
    return { success: true }
  } catch (err: any) {
    console.error('[Inventory] Error deleting inventory item:', err)
    return { success: false, error: err.message || 'Failed to delete inventory item.' }
  }
}
