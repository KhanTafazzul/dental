import { NextResponse } from 'next/server'
import { sendWahaTextMessage, DEFAULT_TARGET_TEST_NUMBER } from '@/lib/waha'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const phone = (body.phone || body.targetNumber)?.toString().trim()
    const text = (body.text || body.message)?.toString().trim()
    const session = (body.session || 'default')?.toString().trim()

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Recipient phone number is required.' },
        { status: 400 }
      )
    }

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Message text is required.' },
        { status: 400 }
      )
    }

    const result = await sendWahaTextMessage({
      phone,
      text,
      session,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, chatId: result.chatId, details: result.data },
        { status: result.status || 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp text dispatched via WAHA engine successfully',
      chatId: result.chatId,
      data: result.data,
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
