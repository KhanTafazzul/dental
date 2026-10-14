/**
 * @file api/prescriptions/route.ts
 * @description API route handler for Prescription Lifecycle:
 * POST: Upload/Generate -> Compress -> Backblaze B2 Private Storage -> DB Record -> WAHA & Email Dispatch
 * GET: Admin/Doctor Master Prescription List with filtering and fresh presigned URLs
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase'
import { PdfCompressionService } from '@/lib/services/pdfCompressionService'
import { BackblazeB2Service } from '@/lib/services/backblazeB2Service'
import { NotificationService } from '@/lib/services/notificationService'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      pdfBase64,
      patientId,
      patientName,
      patientPhone,
      patientEmail,
      doctorId,
      doctorName,
      appointmentId,
      visitDate = new Date().toISOString().split('T')[0],
      diagnosisSummary = {},
      medicines = [],
      channels = { whatsapp: true, email: true },
    } = body

    if (!patientId || !patientName) {
      return NextResponse.json(
        { success: false, error: 'Patient ID and Name are required.' },
        { status: 400 }
      )
    }

    if (!pdfBase64) {
      return NextResponse.json(
        { success: false, error: 'PDF data is missing.' },
        { status: 400 }
      )
    }

    // 1. Decode base64 to Buffer
    const cleanBase64 = pdfBase64.includes(',') ? pdfBase64.split(',')[1] : pdfBase64
    const rawBuffer = Buffer.from(cleanBase64, 'base64')

    // 2. Pass through Server-Side PDF Compression Pipeline
    const compression = await PdfCompressionService.compressPdf(rawBuffer)

    // 3. Deterministic S3 Key for Backblaze B2
    const timestamp = Date.now()
    const objectKey = BackblazeB2Service.buildDeterministicKey(
      patientId,
      appointmentId || 'walkin',
      timestamp
    )

    // 4. Upload to Private Backblaze B2 Bucket
    const uploadResult = await BackblazeB2Service.uploadPrescriptionPdf(
      compression.compressedBuffer,
      objectKey,
      {
        patientId,
        doctorId: doctorId || '',
        appointmentId: appointmentId || '',
      }
    )

    // 5. Generate fresh short-lived S3 Presigned URL (1 hour)
    const downloadFilename = `Prescription_${(patientName || 'Patient').replace(/\s+/g, '_')}_${visitDate}.pdf`
    const presignedUrl = await BackblazeB2Service.generatePresignedGetUrl(
      objectKey,
      3600,
      downloadFilename
    )

    // 6. Calculate Visit Number for Repeat-Visit History Tracking
    const adminDb = getAdminSupabase()
    let visitNumber = 1

    try {
      const { count, error: countErr } = await adminDb
        .from('prescriptions')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', patientId)

      if (!countErr && typeof count === 'number') {
        visitNumber = count + 1
      }
    } catch (e) {
      console.warn('[Prescriptions API] Notice calculating visit number:', e)
    }

    // 7. Insert Prescription Record into Database
    const initialDeliveryStatus = {
      whatsapp: patientPhone && channels.whatsapp ? 'pending' : 'skipped',
      email: patientEmail && channels.email ? 'pending' : 'skipped',
      last_attempt: new Date().toISOString(),
    }

    const { data: prescriptionRecord, error: dbError } = await adminDb
      .from('prescriptions')
      .insert({
        patient_id: patientId,
        doctor_id: doctorId || null,
        appointment_id: appointmentId || null,
        visit_number: visitNumber,
        b2_object_key: objectKey,
        file_size_kb: Math.round(compression.compressedSizeBytes / 1024),
        original_size_bytes: compression.originalSizeBytes,
        compressed_size_bytes: compression.compressedSizeBytes,
        diagnosis_summary: typeof diagnosisSummary === 'string' ? { notes: diagnosisSummary, medicines } : { ...diagnosisSummary, medicines },
        delivery_status: initialDeliveryStatus,
        patient_name: patientName,
        patient_phone: patientPhone || null,
        patient_email: patientEmail || null,
        doctor_name: doctorName || null,
      })
      .select()
      .single()

    if (dbError || !prescriptionRecord) {
      console.error('[Prescriptions API] Database insertion error:', dbError)
      return NextResponse.json(
        { success: false, error: dbError?.message || 'Failed to save prescription record in database.' },
        { status: 500 }
      )
    }

    const prescriptionId = prescriptionRecord.id

    // 8. Trigger Asynchronous Background Multi-Channel Dispatch (Non-Blocking)
    // Runs in the background without freezing UI response
    void (async () => {
      try {
        await NotificationService.dispatchPrescriptionNotification(
          {
            prescriptionId,
            patientName,
            patientPhone,
            patientEmail,
            doctorName,
            visitDate,
            presignedUrl,
            pdfBuffer: compression.compressedBuffer,
            medicines,
            diagnosisText: typeof diagnosisSummary === 'string' ? diagnosisSummary : JSON.stringify(diagnosisSummary),
          },
          channels
        )
      } catch (notifyErr) {
        console.error('[Prescriptions API] Asynchronous dispatch error:', notifyErr)
      }
    })()

    return NextResponse.json({
      success: true,
      prescription: prescriptionRecord,
      presignedUrl,
      compression: {
        originalSizeBytes: compression.originalSizeBytes,
        compressedSizeBytes: compression.compressedSizeBytes,
        savingsPercent: compression.compressionRatioPercent,
      },
      storage: uploadResult,
    })
  } catch (error: any) {
    console.error('[Prescriptions API POST Error]:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process prescription.' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const patientSearch = searchParams.get('patientSearch') || ''
    const doctorId = searchParams.get('doctorId') || ''
    const deliveryStatus = searchParams.get('deliveryStatus') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '25', 10)
    const offset = (page - 1) * limit

    const adminDb = getAdminSupabase()
    let query = adminDb
      .from('prescriptions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    const sanitizedSearch = patientSearch.replace(/[,()]/g, '').trim()
    if (sanitizedSearch) {
      query = query.or(`patient_name.ilike.%${sanitizedSearch}%,patient_phone.ilike.%${sanitizedSearch}%`)
    }

    if (deliveryStatus) {
      query = query.eq('delivery_status', deliveryStatus)
    }

    if (doctorId) {
      query = query.eq('doctor_id', doctorId)
    }

    if (startDate) {
      query = query.gte('created_at', `${startDate}T00:00:00Z`)
    }

    if (endDate) {
      query = query.lte('created_at', `${endDate}T23:59:59Z`)
    }

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Generate fresh presigned URLs for each prescription
    const prescriptionsWithUrls = await Promise.all(
      (data || []).map(async (rx) => {
        let presignedUrl = ''
        if (rx.b2_object_key) {
          try {
            presignedUrl = await BackblazeB2Service.generatePresignedGetUrl(rx.b2_object_key, 3600)
          } catch (e) {
            console.warn('[Prescriptions API] Error generating presigned URL:', e)
          }
        }
        return {
          ...rx,
          presignedUrl,
        }
      })
    )

    // Total Storage Metrics calculation
    const totalStorageKb = (data || []).reduce((acc, curr) => acc + (curr.file_size_kb || 0), 0)
    const totalOriginalBytes = (data || []).reduce((acc, curr) => acc + (curr.original_size_bytes || 0), 0)
    const totalCompressedBytes = (data || []).reduce((acc, curr) => acc + (curr.compressed_size_bytes || 0), 0)

    return NextResponse.json({
      success: true,
      prescriptions: prescriptionsWithUrls,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
      metrics: {
        totalStorageKb,
        totalOriginalBytes,
        totalCompressedBytes,
        savingsBytes: Math.max(0, totalOriginalBytes - totalCompressedBytes),
      },
    })
  } catch (error: any) {
    console.error('[Prescriptions API GET Error]:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch prescriptions.' },
      { status: 500 }
    )
  }
}
