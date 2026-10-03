import { NextResponse } from 'next/server'
import { sendDailyDoctorAppointmentDigest } from '@/lib/waha'

export async function POST() {
  return handleDigestTrigger()
}

export async function GET() {
  return handleDigestTrigger()
}

async function handleDigestTrigger() {
  try {
    const digestResult = await sendDailyDoctorAppointmentDigest()

    return NextResponse.json({
      success: digestResult.success,
      timestamp: new Date().toISOString(),
      sentCount: digestResult.count,
      sentDoctors: digestResult.sentDoctors,
      details: digestResult.details,
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to dispatch daily morning digest'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
