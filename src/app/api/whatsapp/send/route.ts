import { NextResponse } from 'next/server'
import { sendWahaTextMessage, DEFAULT_TARGET_TEST_NUMBER } from '@/lib/waha'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const phone = body.phone || body.targetNumber || DEFAULT_TARGET_TEST_NUMBER
    const text = body.text || body.message || '👋 Hello! Testing WAHA WhatsApp GOWS engine integration.'
    const session = body.session || 'default'

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
