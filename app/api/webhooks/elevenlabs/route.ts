import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Service role client for bypassing RLS
function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Validate HMAC signature from ElevenLabs
function validateSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Parse signature header: "t=timestamp,v0=hash"
    const parts = signature.split(',');
    const timestampPart = parts.find((p) => p.startsWith('t='));
    const hashPart = parts.find((p) => p.startsWith('v0='));

    if (!timestampPart || !hashPart) {
      return false;
    }

    const timestamp = timestampPart.split('=')[1];
    const receivedHash = hashPart.split('=')[1];

    // Validate timestamp (30 minute tolerance)
    const currentTime = Math.floor(Date.now() / 1000);
    const requestTime = parseInt(timestamp, 10);
    const timeDifference = Math.abs(currentTime - requestTime);
    const THIRTY_MINUTES = 30 * 60;

    if (timeDifference > THIRTY_MINUTES) {
      console.error('Timestamp validation failed: request too old or too far in future');
      return false;
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    // Compare signatures
    return crypto.timingSafeEqual(
      Buffer.from(expectedHash),
      Buffer.from(receivedHash)
    );
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
}

// ElevenLabs webhook payload types
interface TranscriptEntry {
  role: string;
  message: string;
  time_in_call_secs: number;
}

interface WebhookPayload {
  type: string;
  event_timestamp: number;
  data: {
    agent_id: string;
    conversation_id: string;
    transcript: TranscriptEntry[];
    conversation_initiation_client_data: {
      dynamic_variables: {
        user_id: string;
      };
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get webhook secret
    const webhookSecret = process.env.ELEVENLABS_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('ELEVENLABS_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Get signature header
    const signature = request.headers.get('ElevenLabs-Signature');
    if (!signature) {
      console.error('Missing ElevenLabs-Signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Read and validate request body
    const rawBody = await request.text();
    const isValid = validateSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      console.error('Invalid signature or timestamp');
      return NextResponse.json(
        { error: 'Invalid signature or timestamp' },
        { status: 401 }
      );
    }

    // Parse payload
    const payload: WebhookPayload = JSON.parse(rawBody);

    // Only handle post_call_transcription events
    if (payload.type !== 'post_call_transcription') {
      console.log(`Ignoring event type: ${payload.type}`);
      return NextResponse.json({ received: true });
    }

    // Extract required data
    const {
      agent_id,
      conversation_id,
      transcript,
      conversation_initiation_client_data,
    } = payload.data;

    const user_id =
      conversation_initiation_client_data?.dynamic_variables?.user_id;

    if (!user_id) {
      console.error('Missing user_id in webhook payload');
      return NextResponse.json(
        { error: 'Missing user_id in payload' },
        { status: 400 }
      );
    }

    // Insert into Supabase
    const supabase = getSupabaseServiceClient();
    const { error: dbError } = await supabase
      .from('conversation_transcripts')
      .insert({
        user_id,
        session_id: conversation_id,
        agent_id,
        transcript: JSON.stringify(transcript),
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error', details: dbError.message },
        { status: 500 }
      );
    }

    console.log(`Successfully saved transcript for session ${conversation_id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
