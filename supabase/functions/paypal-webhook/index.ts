
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get webhook payload
    const payload = await req.json();
    console.log('PayPal webhook received:', JSON.stringify(payload, null, 2));

    // Verify webhook signature (optional but recommended)
    const webhookId = req.headers.get('paypal-transmission-id');
    const signature = req.headers.get('paypal-cert-id');
    
    console.log('Webhook headers:', {
      webhookId,
      signature,
      eventType: payload.event_type
    });

    // Handle different event types
    switch (payload.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(supabase, payload);
        break;
      
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.FAILED':
        await handlePaymentFailed(supabase, payload);
        break;
      
      default:
        console.log('Unhandled event type:', payload.event_type);
    }

    // Log webhook event
    await supabase
      .from('webhook_logs')
      .insert({
        provider: 'paypal',
        event_type: payload.event_type,
        payload: payload,
        processed_at: new Date().toISOString()
      });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('PayPal webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handlePaymentCompleted(supabase: any, payload: any) {
  try {
    const captureData = payload.resource;
    const customId = captureData.custom_id; // This should be the tier
    const amount = captureData.amount.value;
    const currency = captureData.amount.currency_code;
    const transactionId = captureData.id;

    console.log('Processing completed payment:', {
      customId,
      amount,
      currency,
      transactionId
    });

    // You would need to extract user info from the payment
    // This is a simplified example - in practice, you'd need to link the payment to a user
    // Perhaps by storing user_id in the PayPal order's custom_id field

    // Update subscription status
    const scanCount = customId === 'basic' ? 2 : 
                     customId === 'premium' ? 6 : 999;

    // Record the successful payment
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        transaction_id: transactionId,
        amount: parseFloat(amount),
        currency: currency,
        status: 'completed',
        provider: 'paypal',
        tier: customId,
        created_at: new Date().toISOString()
      });

    if (paymentError) {
      console.error('Error recording payment:', paymentError);
    }

    console.log('Payment completed successfully processed');
  } catch (error) {
    console.error('Error handling payment completed:', error);
    throw error;
  }
}

async function handlePaymentFailed(supabase: any, payload: any) {
  try {
    const captureData = payload.resource;
    const transactionId = captureData.id;
    const reason = captureData.status_details?.reason || 'Unknown';

    console.log('Processing failed payment:', {
      transactionId,
      reason
    });

    // Record the failed payment
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        transaction_id: transactionId,
        status: 'failed',
        provider: 'paypal',
        failure_reason: reason,
        created_at: new Date().toISOString()
      });

    if (paymentError) {
      console.error('Error recording failed payment:', paymentError);
    }

    console.log('Failed payment processed');
  } catch (error) {
    console.error('Error handling payment failed:', error);
    throw error;
  }
}
