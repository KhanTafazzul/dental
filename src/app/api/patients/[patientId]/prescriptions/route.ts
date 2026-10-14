/**
 * @file api/patients/[patientId]/prescriptions/route.ts
 * @description Chronological Prescription History Endpoint for Patients and Doctors.
 * 
 * Fetches all past prescriptions for a specific patient, computes fresh short-lived S3
 * presigned URLs, and formats the repeat-visit timeline for consultation or patient viewing.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase'
import { BackblazeB2Service } from '@/lib/services/backblazeB2Service'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'Patient ID is required.' },
        { status: 400 }
      )
    }

    const adminDb = getAdminSupabase()

    // Query all prescriptions for this patient ordered by visit_number descending
    const { data: prescriptions, error } = await adminDb
      .from('prescriptions')
      .select('*')
      .eq('patient_id', patientId)
      .order('visit_number', { ascending: false })

    if (error) {
      console.error('[Patient Prescriptions API Error]:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Generate fresh presigned URLs for each past prescription
    const prescriptionsWithUrls = await Promise.all(
      (prescriptions || []).map(async (rx) => {
        let presignedUrl = ''
        if (rx.b2_object_key) {
          try {
            presignedUrl = await BackblazeB2Service.generatePresignedGetUrl(
              rx.b2_object_key,
              3600, // 1 hour validity
              `Prescription_Visit_${rx.visit_number}_${rx.patient_name || 'Patient'}.pdf`
            )
          } catch (e) {
            console.warn(`[Presigned URL error for ${rx.id}]:`, e)
          }
        }

        return {
          ...rx,
          presignedUrl,
        }
      })
    )

    const isRepeatPatient = (prescriptions || []).length > 1
    const totalVisits = (prescriptions || []).length

    return NextResponse.json({
      success: true,
      patientId,
      isRepeatPatient,
      totalVisits,
      prescriptions: prescriptionsWithUrls,
    })
  } catch (error: any) {
    console.error('[Patient Prescriptions API Exception]:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch patient prescriptions.' },
      { status: 500 }
    )
  }
}
