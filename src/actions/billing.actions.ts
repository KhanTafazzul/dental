'use server'

/**
 * @file actions/billing.actions.ts
 * @description Server Actions for billing, invoicing, and treatment management.
 *
 * Covers: Create invoice (with FIFO stock deduction), get invoice details,
 * trigger deliver-and-cleanup edge function, treatments CRUD, update finances.
 */

import { getAdminSupabase } from '@/lib/supabase'
import { queryTiDB } from '@/lib/tidb'
import { updateTag } from 'next/cache'
import { requireAdmin, requireAdminOrDoctor } from '@/actions/auth.actions'
import type { ActionResponse, InvoiceDetails, InvoiceItem } from '@/types/common.types'

// ─── Treatments CRUD ──────────────────────────────────────────────────────────

/** Fetches all treatment/procedure records ordered by name. */
export async function getTreatments(): Promise<ActionResponse> {
  const adminDb = getAdminSupabase()
  try {
    const { data, error } = await adminDb
      .from('treatments')
      .select('*')
      .order('name', { ascending: true })
    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    console.error('[Billing] Error fetching treatments:', err)
    return { success: false, error: err.message || 'Failed to fetch treatments.' }
  }
}

/**
 * Adds a new treatment/procedure with a price and cost.
 * @param name - Procedure name (required)
 * @param price - Selling price charged to patient
 * @param cost - Internal cost price (defaults to 0)
 */
export async function addTreatment(
  name: string,
  price: number,
  cost: number = 0
): Promise<ActionResponse> {
  await requireAdmin()
  if (!name || name.trim() === '') return { success: false, error: 'Procedure name is required.' }
  if (isNaN(price) || price < 0) return { success: false, error: 'Price must be a positive number.' }
  if (isNaN(cost) || cost < 0) return { success: false, error: 'Cost must be a positive number.' }

  const adminDb = getAdminSupabase()
  try {
    const { data, error } = await adminDb
      .from('treatments')
      .insert([{ name: name.trim(), price, cost }])
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    console.error('[Billing] Error adding treatment:', err)
    return { success: false, error: err.message || 'Failed to add procedure.' }
  }
}

/**
 * Updates price and cost for an existing treatment.
 * @param id - Treatment UUID
 * @param price - New selling price
 * @param cost - New cost price
 */
export async function updateTreatmentPrice(
  id: string,
  price: number,
  cost: number = 0
): Promise<ActionResponse> {
  await requireAdmin()
  if (!id) return { success: false, error: 'Procedure ID is required.' }
  if (isNaN(price) || price < 0) return { success: false, error: 'Price must be a positive number.' }
  if (isNaN(cost) || cost < 0) return { success: false, error: 'Cost must be a positive number.' }

  const adminDb = getAdminSupabase()
  try {
    const { data, error } = await adminDb
      .from('treatments')
      .update({ price, cost })
      .eq('id', id)
      .select()
    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    console.error('[Billing] Error updating treatment:', err)
    return { success: false, error: err.message || 'Failed to update procedure details.' }
  }
}

/**
 * Permanently deletes a treatment/procedure.
 * @param id - Treatment UUID
 */
export async function deleteTreatment(id: string): Promise<ActionResponse> {
  await requireAdmin()
  if (!id) return { success: false, error: 'Treatment ID is required.' }

  const adminDb = getAdminSupabase()
  try {
    const { error } = await adminDb.from('treatments').delete().eq('id', id)
    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('[Billing] Error deleting treatment:', err)
    return { success: false, error: err.message || 'Failed to delete treatment.' }
  }
}

// ─── Update Appointment Finances ──────────────────────────────────────────────

/**
 * Updates the amount_charged and treatment_cost fields on an appointment.
 */
export async function updateAppointmentFinances(
  appointmentId: string,
  amountCharged: number,
  treatmentCost: number
): Promise<ActionResponse> {
  await requireAdminOrDoctor()
  const adminDb = getAdminSupabase()
  try {
    const { data, error } = await adminDb
      .from('appointments')
      .update({ amount_charged: amountCharged, treatment_cost: treatmentCost })
      .eq('id', appointmentId)
      .select()
    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    console.error('[Billing] Error updating appointment finances:', err)
    return { success: false, error: err.message || 'Failed to update financials.' }
  }
}

// ─── Create Invoice ────────────────────────────────────────────────────────────

/**
 * Creates an invoice in Supabase and performs FIFO stock deduction for medicines in TiDB.
 *
 * @param appointmentId - The appointment being billed
 * @param items - Line items: medicines, treatments, or custom entries
 * @param subtotal - Sum before discounts
 * @param treatmentDiscountPercent - % off for treatments/custom items
 * @param medicineDiscountPercent - % off for medicines
 * @param total - Final amount after discounts
 */
export async function createInvoice(
  appointmentId: string,
  items: InvoiceItem[],
  subtotal: number,
  treatmentDiscountPercent: number = 0,
  medicineDiscountPercent: number = 0,
  total: number
): Promise<ActionResponse<{ invoiceId: string }>> {
  await requireAdminOrDoctor()
  const adminDb = getAdminSupabase()
  try {
    // 1. Fetch appointment with branch slug
    const { data: appt, error: apptErr } = await adminDb
      .from('appointments')
      .select('id, patient_id, branch_id, patient_name, patient_mobile, branches(slug)')
      .eq('id', appointmentId)
      .maybeSingle()

    if (apptErr || !appt) {
      throw new Error(`Appointment not found: ${apptErr?.message || 'Appointment record does not exist.'}`)
    }

    let patientId = (appt as any).patient_id
    if (!patientId && (appt as any).patient_mobile) {
      const { data: matchedPatient } = await adminDb
        .from('patients')
        .select('id')
        .eq('mobile', (appt as any).patient_mobile)
        .maybeSingle()
      if (matchedPatient) {
        patientId = matchedPatient.id
      }
    }

    const branchSlug = (appt as any).branches?.slug || 'hazara'

    // 2. Compute weighted overall discount
    const treatmentSubtotal = items
      .filter(i => i.type === 'treatment' || i.type === 'custom')
      .reduce((sum, i) => sum + i.price * i.quantity, 0)
    const medicineSubtotal = items
      .filter(i => i.type === 'medicine')
      .reduce((sum, i) => sum + i.price * i.quantity, 0)

    const treatmentDiscountVal = treatmentSubtotal * (treatmentDiscountPercent / 100)
    const medicineDiscountVal = medicineSubtotal * (medicineDiscountPercent / 100)
    const totalDiscountVal = treatmentDiscountVal + medicineDiscountVal
    const overallDiscountPercent = subtotal > 0 ? (totalDiscountVal / subtotal) * 100 : 0

    // 3. Insert invoice row (with schema fallback for older DB schemas)
    const insertObj: Record<string, unknown> = {
      appointment_id: appointmentId,
      patient_id: patientId || null,
      subtotal,
      discount_percentage: overallDiscountPercent,
      treatment_discount_percentage: treatmentDiscountPercent,
      medicine_discount_percentage: medicineDiscountPercent,
      total,
    }

    let { data: invoice, error: invoiceErr } = await adminDb
      .from('invoices')
      .insert(insertObj)
      .select('id')
      .single()

    if (invoiceErr?.code === '42703') {
      // Older schema without split discount columns — retry without them
      console.warn('[Billing] Fallback: split discount columns missing in schema.')
      delete insertObj.treatment_discount_percentage
      delete insertObj.medicine_discount_percentage
      const retry = await adminDb.from('invoices').insert(insertObj).select('id').single()
      invoice = retry.data
      invoiceErr = retry.error
    }

    if (invoiceErr || !invoice) {
      throw invoiceErr || new Error('Failed to create invoice row in database.')
    }

    const invoiceId = (invoice as any).id

    // 4. Process each line item — FIFO deduction for medicines
    for (const item of items) {
      if (item.type === 'medicine') {
        const medicineId = item.id || item.medicine_id
        let remainingQty = item.quantity
        let batchCost = 0

        try {
          let batches: any[] = []
          if (item.batchId) {
            batches = await queryTiDB('SELECT id, stock, cost_price FROM medicine_batches WHERE id = ?', [item.batchId])
          } else {
            batches = await queryTiDB(
              'SELECT id, stock, cost_price FROM medicine_batches WHERE medicine_id = ? AND stock > 0 AND expiry_date >= CURDATE() AND branch_slug = ? ORDER BY expiry_date ASC',
              [medicineId, branchSlug]
            )
            if (!batches || batches.length === 0) {
              batches = await queryTiDB(
                'SELECT id, stock, cost_price FROM medicine_batches WHERE medicine_id = ? AND stock > 0 ORDER BY expiry_date ASC',
                [medicineId]
              )
            }
          }

          if (batches && batches.length > 0) {
            batchCost = Number(batches[0].cost_price || 0)
            for (const batch of batches) {
              if (remainingQty <= 0) break
              const deduct = Math.min(Number(batch.stock), remainingQty)
              const updateResult: any = await queryTiDB(
                'UPDATE medicine_batches SET stock = stock - ? WHERE id = ? AND stock >= ?',
                [deduct, batch.id, deduct]
              )
              if (updateResult?.affectedRows > 0) {
                remainingQty -= deduct
              }
            }
          }
        } catch (tidbErr: any) {
          console.warn('[Billing] TiDB stock update warning (non-fatal):', tidbErr?.message || tidbErr)
        }

        let { error: itemErr } = await adminDb.from('invoice_items').insert({
          invoice_id: invoiceId,
          item_type: 'medicine',
          medicine_id: medicineId,
          custom_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          unit_cost: batchCost,
          total_price: item.quantity * item.price,
        })

        if (itemErr?.code === '42703') {
          // Retry without unit_cost for older schemas
          const retry = await adminDb.from('invoice_items').insert({
            invoice_id: invoiceId,
            item_type: 'medicine',
            medicine_id: medicineId,
            custom_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.quantity * item.price,
          })
          itemErr = retry.error
        }
        if (itemErr) {
          await adminDb.from('invoices').delete().eq('id', invoiceId)
          throw itemErr
        }

      } else if (item.type === 'treatment') {
        let treatmentCost = 0
        try {
          const { data: treatData } = await adminDb
            .from('treatments')
            .select('cost')
            .eq('id', item.id || item.treatment_id)
            .single()
          treatmentCost = treatData ? Number((treatData as any).cost || 0) : 0
        } catch (tErr) {
          console.warn('[Billing] Treatment cost fetch notice:', tErr)
        }

        let { error: itemErr } = await adminDb.from('invoice_items').insert({
          invoice_id: invoiceId,
          item_type: 'treatment',
          treatment_id: item.id || item.treatment_id,
          custom_name: item.name,
          quantity: 1,
          unit_price: item.price,
          unit_cost: treatmentCost,
          total_price: item.price,
        })

        if (itemErr?.code === '42703') {
          const retry = await adminDb.from('invoice_items').insert({
            invoice_id: invoiceId,
            item_type: 'treatment',
            treatment_id: item.id || item.treatment_id,
            custom_name: item.name,
            quantity: 1,
            unit_price: item.price,
            total_price: item.price,
          })
          itemErr = retry.error
        }
        if (itemErr) {
          await adminDb.from('invoices').delete().eq('id', invoiceId)
          throw itemErr
        }

      } else if (item.type === 'custom') {
        let { error: itemErr } = await adminDb.from('invoice_items').insert({
          invoice_id: invoiceId,
          item_type: 'custom',
          custom_name: item.name,
          quantity: 1,
          unit_price: item.price,
          unit_cost: 0,
          total_price: item.price,
        })

        if (itemErr?.code === '42703') {
          const retry = await adminDb.from('invoice_items').insert({
            invoice_id: invoiceId,
            item_type: 'custom',
            custom_name: item.name,
            quantity: 1,
            unit_price: item.price,
            total_price: item.price,
          })
          itemErr = retry.error
        }
        if (itemErr) {
          await adminDb.from('invoices').delete().eq('id', invoiceId)
          throw itemErr
        }
      }
    }

    // 5. Mark appointment as completed
    const { error: statusErr } = await adminDb
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', appointmentId)

    if (statusErr) console.error('[Billing] Failed to mark appointment completed:', statusErr)

    updateTag('financial-analytics')
    updateTag('inventory-stats')

    return { success: true, invoiceId, data: { invoiceId } }
  } catch (err: any) {
    console.error('[Billing] Error creating invoice:', err)
    return { success: false, error: err.message || 'Failed to create invoice.' }
  }
}

// ─── Get Invoice Details ──────────────────────────────────────────────────────

/**
 * Fetches complete invoice details for receipt rendering.
 * Includes patient, doctor, branch, and all line items.
 */
export async function getInvoiceDetails(
  invoiceId: string
): Promise<ActionResponse<InvoiceDetails>> {
  await requireAdminOrDoctor()
  const adminDb = getAdminSupabase()
  try {
    const { data: invoice, error } = await adminDb
      .from('invoices')
      .select(`
        id, subtotal, discount_percentage, treatment_discount_percentage,
        medicine_discount_percentage, total, created_at, appointment_id, patient_id,
        patients ( name, mobile, email, age ),
        appointments (
          appointment_date, appointment_time,
          doctors ( name ),
          branches ( name, slug )
        ),
        invoice_items ( id, item_type, custom_name, quantity, unit_price, total_price, medicine_id, treatment_id )
      `)
      .eq('id', invoiceId)
      .single()

    if (error || !invoice) throw new Error(error?.message || 'Invoice not found')

    const appt = (invoice as any).appointments || {}
    const patient = (invoice as any).patients || {}
    const rawItems: InvoiceItem[] = ((invoice as any).invoice_items || []).map((i: any) => ({
      type: i.item_type as InvoiceItem['type'],
      name: i.custom_name || 'Item',
      quantity: i.quantity,
      price: Number(i.unit_price || 0),
    }))

    const rawSubtotal = Number((invoice as any).subtotal || 0)
    const grandTotal = Number((invoice as any).total || 0)
    const treatmentDiscPercent = Number(
      (invoice as any).treatment_discount_percentage ?? (invoice as any).discount_percentage ?? 0
    )
    const medicineDiscPercent = Number(
      (invoice as any).medicine_discount_percentage ?? (invoice as any).discount_percentage ?? 0
    )

    const treatmentItems = rawItems.filter(i => i.type === 'treatment' || i.type === 'custom')
    const medicineItems = rawItems.filter(i => i.type === 'medicine')

    const treatmentSubtotal = treatmentItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const medicineSubtotal = medicineItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const treatmentDiscountVal = treatmentSubtotal * (treatmentDiscPercent / 100)
    const medicineDiscountVal = medicineSubtotal * (medicineDiscPercent / 100)
    const totalDiscountSaved = treatmentDiscountVal + medicineDiscountVal
    const overallDiscountPercent = rawSubtotal > 0 ? (totalDiscountSaved / rawSubtotal) * 100 : 0

    const details: InvoiceDetails = {
      invoiceId: (invoice as any).id,
      date: new Date((invoice as any).created_at || Date.now()).toLocaleDateString('en-US'),
      branchName: appt.branches?.name || 'Family Dental Clinic',
      doctorName: appt.doctors?.name || 'Dr. Nadeem',
      patientName: patient.name || 'Patient',
      patientAge: patient.age || '18',
      patientMobile: patient.mobile || 'N/A',
      patientEmail: patient.email || 'N/A',
      items: rawItems,
      subtotal: rawSubtotal,
      treatmentSubtotal,
      treatmentDiscountPercent: treatmentDiscPercent,
      treatmentDiscountVal,
      medicineSubtotal,
      medicineDiscountPercent: medicineDiscPercent,
      medicineDiscountVal,
      totalDiscountSaved,
      overallDiscountPercent,
      grandTotal,
    }

    return { success: true, data: details }
  } catch (err: any) {
    console.error('[Billing] Error fetching invoice details:', err)
    return { success: false, error: err.message || 'Failed to fetch invoice details.' }
  }
}

// ─── Deliver & Cleanup Edge Function ─────────────────────────────────────────

/**
 * Triggers the Supabase Edge Function "deliver-and-cleanup" to send the
 * invoice to the patient and clean up temporary records.
 */
export async function triggerDeliverAndCleanup(
  appointmentId: string,
  invoiceId: string
): Promise<ActionResponse> {
  await requireAdminOrDoctor()
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in environment.')

    const response = await fetch(`${supabaseUrl}/functions/v1/deliver-and-cleanup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ appointmentId, invoiceId }),
    })

    const result = await response.json()
    if (!response.ok) throw new Error(`Edge function failed: ${result.error || JSON.stringify(result)}`)

    return { success: true, data: result }
  } catch (err: any) {
    console.error('[Billing] Error triggering deliver & cleanup:', err)
    return { success: false, error: err.message || 'Failed to run delivery and cleanup pipeline.' }
  }
}
