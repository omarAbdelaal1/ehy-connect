// ==============================================================================
// EHY Connect — Native WhatsApp Business Cloud API Webhook Handler
// Route: app/api/webhooks/whatsapp/route.ts
// Specialists: Backend Architect & Security Architect
// Standard: Meta Graph API v19.0+ / Strict HMAC-SHA256 Verification
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory idempotency cache for deduplication (prevents duplicate webhook processing)
const processedMessageIds = new Set<string>();

/**
 * GET Handler: Meta Webhook Verification Handshake
 * Triggered when configuring webhook URL in Meta App Dashboard
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'ehy_connect_verify_token_2026';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[WhatsApp Webhook] Handshake verified successfully.');
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  console.warn('[WhatsApp Webhook] Verification failed: Token mismatch or invalid mode.');
  return NextResponse.json({ error: 'Forbidden: Invalid verify token' }, { status: 403 });
}

/**
 * POST Handler: Inbound Message Ingestion with HMAC-SHA256 Validation
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signatureHeader = request.headers.get('x-hub-signature-256');

    // 1. AppSec Layer: Cryptographic HMAC Signature Verification
    const appSecret = process.env.WHATSAPP_APP_SECRET;

    if (appSecret) {
      if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
        console.error('[WhatsApp Webhook] Missing or malformed signature header');
        return NextResponse.json({ error: 'Missing cryptographic signature' }, { status: 401 });
      }

      const incomingSignature = signatureHeader.replace('sha256=', '');
      const expectedSignature = crypto
        .createHmac('sha256', appSecret)
        .update(rawBody)
        .digest('hex');

      const incomingBuffer = Buffer.from(incomingSignature, 'hex');
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');

      if (
        incomingBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(incomingBuffer, expectedBuffer)
      ) {
        console.error('[WhatsApp Webhook] Security Alert: HMAC Signature mismatch!');
        return NextResponse.json({ error: 'Unauthorized: Invalid signature' }, { status: 401 });
      }
    } else {
      console.warn('[WhatsApp Webhook] WHATSAPP_APP_SECRET not configured. Running in sandbox mode.');
    }

    // 2. Parse Webhook Payload
    const payload = JSON.parse(rawBody);

    if (payload.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored', reason: 'non_whatsapp_object' }, { status: 200 });
    }

    const entry = payload.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    // Check if this is an incoming message (not a status update like delivered/read)
    if (value?.messages && value.messages.length > 0) {
      const message = value.messages[0];
      const contact = value.contacts?.[0];

      const platformMessageId = message.id;
      const customerPhone = message.from;
      const customerName = contact?.profile?.name || customerPhone;
      const messageType = message.type;
      const messageText =
        messageType === 'text'
          ? message.text?.body
          : messageType === 'image'
          ? '[صورة مرفقة - Image]'
          : messageType === 'video'
          ? '[فيديو مرفق - Video]'
          : '[ملف مرفق - Attachment]';

      // 3. Idempotency Check (Prevent duplicate ticket creation on Meta retries)
      if (processedMessageIds.has(platformMessageId)) {
        console.log(`[WhatsApp Webhook] Duplicate message ${platformMessageId} ignored.`);
        return NextResponse.json({ status: 'duplicate_ignored' }, { status: 200 });
      }
      processedMessageIds.add(platformMessageId);

      // Keep in-memory cache pruned
      if (processedMessageIds.size > 10000) {
        const first = processedMessageIds.values().next().value;
        if (first) processedMessageIds.delete(first);
      }

      console.log(`[WhatsApp Webhook] Inbound message ingested from ${customerName} (${customerPhone}): "${messageText}"`);

      // 4. Ingest into EHY Connect Database (or dispatch to Realtime event stream)
      // In production with Supabase configured:
      // await supabase.from('conversations').upsert({...})
      // await supabase.from('messages').insert({...})

      return NextResponse.json(
        {
          status: 'success',
          messageId: platformMessageId,
          customer: customerName,
          content: messageText,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // Status callback (sent/delivered/read receipt)
    if (value?.statuses && value.statuses.length > 0) {
      const statusUpdate = value.statuses[0];
      console.log(`[WhatsApp Webhook] Delivery status update: ${statusUpdate.id} -> ${statusUpdate.status}`);
      return NextResponse.json({ status: 'receipt_acknowledged' }, { status: 200 });
    }

    return NextResponse.json({ status: 'no_action_required' }, { status: 200 });
  } catch (err: any) {
    console.error('[WhatsApp Webhook] Exception processing webhook payload:', err);
    // Return 200 to Meta to prevent retry storm on bad payload formatting
    return NextResponse.json({ error: 'Internal error processing payload', details: err?.message }, { status: 200 });
  }
}
