import { NextResponse } from 'next/server'
import { processWahaIncomingWebhook } from '@/lib/waha'

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({}))
    
    // Process incoming message with WAHA Chatbot Engine
    const botResult = await processWahaIncomingWebhook(payload)

    return NextResponse.json({
      success: true,
      handled: botResult.handled,
      replySent: botResult.replySent || false,
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Webhook error'
    console.error('[WAHA Webhook Endpoint Exception]:', err)
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'WAHA WhatsApp Chatbot Webhook Receiver',
    timestamp: new Date().toISOString(),
  })
}
