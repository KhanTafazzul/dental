/**
 * @file api/prescriptions/[id]/resend/route.ts
 * @description Manual retry endpoint for Admin and Doctor:
 * POST /api/prescriptions/:id/resend
 * Triggers re-dispatch via WAHA WhatsApp and/or SMTP Email with fresh presigned URL.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase'
import { BackblazeB2Service } from '@/lib/services/backblazeB2Service'
import { NotificationService } from '@/lib/services/notificationService'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const { channel = 'both' } = body // 'whatsapp' | 'email' | 'both'

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Prescription ID is required.' },
        { status: 400 }
      )
    }

    const adminDb = getAdminSupabase()
    const { data: rx, error } = await adminDb
      .from('prescriptions')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !rx) {
      return NextResponse.json(
        { success: false, error: 'Prescription record not found.' },
        { status: 404 }
      )
    }

    // Generate fresh presigned URL
    const presignedUrl = await BackblazeB2Service.generatePresignedGetUrl(
      rx.b2_object_key,
      3600,
      `Prescription_${rx.patient_name || 'Patient'}.pdf`
    )

    const medicines = Array.isArray(rx.diagnosis_summary?.medicines)
      ? rx.diagnosis_summary.medicines
      : []

    const channelsToDispatch = {
      whatsapp: channel === 'whatsapp' || channel === 'both',
      email: channel === 'email' || channel === 'both',
    }

    const result = await NotificationService.dispatchPrescriptionNotification(
      {
        prescriptionId: rx.id,
        patientName: rx.patient_name || 'Patient',
        patientPhone: rx.patient_phone || undefined,
        patientEmail: rx.patient_email || undefined,
        doctorName: rx.doctor_name || 'Dr. Falix',
        visitDate: rx.created_at ? new Date(rx.created_at).toISOString().split('T')[0] : '',
        presignedUrl,
        medicines,
        diagnosisText: typeof rx.diagnosis_summary === 'string' ? rx.diagnosis_summary : JSON.stringify(rx.diagnosis_summary),
      },
      channelsToDispatch
    )

    return NextResponse.json({
      success: true,
      message: `Prescription notification re-dispatched via ${channel}.`,
      deliveryStatus: result,
      presignedUrl,
    })
  } catch (error: any) {
    console.error('[Prescription Resend API Error]:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to resend prescription notification.' },
      { status: 500 }
    )
  }
}
