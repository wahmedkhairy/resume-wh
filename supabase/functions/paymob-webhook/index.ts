import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHash, createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to verify webhook signature (if Paymob provides HMAC)
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = createHmac('sha256', secret).update(payload).digest('hex');
    return signature === expectedSignature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// Helper function to determine subscription limits based on tier
function getSubscriptionLimits(tier: string) {
  const tierLimits: Record<string, number> = {
    'basic': 2,
    'premium': 5,
    'unlimited': 999,
    'pro': 10 // Add more tiers as needed
  };
  
  return tierLimits[tier.toLowerCase()] || 2; // Default to basic if tier not found
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.text();
    let webhookData;
    
    try {
      webhookData = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('Invalid JSON in webhook payload:', parseError);
      return new Response('Invalid JSON payload', { status: 400 });
    }

    console.log('Paymob webhook received:', JSON.stringify(webhookData, null, 2))

    // Verify webhook signature if secret is available
    const webhookSecret = Deno.env.get('PAYMOB_WEBHOOK_SECRET');
    const signature = req.headers.get('x-paymob-signature');
    
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(requestBody, signature, webhookSecret);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return new Response('Invalid signature', { status: 401 });
      }
    }

    // Extract transaction data from Paymob webhook
    // Paymob can send data in different formats, handle both
    const transactionData = webhookData.obj || webhookData;
    
    const {
      id: transactionId,
      order,
      success,
      amount_cents,
      currency,
      pending,
      error_occured,
      data_message
    } = transactionData;

    // Validate required webhook data
    if (!transactionId || !order) {
      console.error('Missing required webhook data:', { transactionId, order });
      return new Response('Missing required webhook data', { status: 400 });
    }

    const orderId = order.merchant_order_id;
    const paymobOrderId = order.id;

    if (!orderId) {
      console.error('Missing merchant order ID');
      return new Response('Missing merchant order ID', { status: 400 });
    }

    // Determine payment status based on Paymob response
    let paymentStatus = 'pending';
    
    if (success === true && !pending && !error_occured) {
      paymentStatus = 'completed';
    } else if (error_occured === true || success === false) {
      paymentStatus = 'failed';
    } else if (pending === true) {
      paymentStatus = 'pending';
    }

    console.log(`Processing payment ${orderId} with status: ${paymentStatus}, transaction: ${transactionId}`);

    // Fetch existing payment record
    const { data: paymentData, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_id', orderId)
      .single();

    if (fetchError) {
      console.error('Error fetching payment:', fetchError);
      
      // If payment not found, create a new record (backup mechanism)
      if (fetchError.code === 'PGRST116') {
        console.log('Payment record not found, creating new one');
        
        const { error: insertError } = await supabase
          .from('payments')
          .insert({
            payment_id: orderId,
            amount: (amount_cents || 0) / 100,
            currency: currency || 'EGP',
            status: paymentStatus,
            tier: 'unknown',
            gateway: 'paymob',
            gateway_order_id: paymobOrderId?.toString(),
            gateway_transaction_id: transactionId?.toString(),
            customer_email: 'unknown@example.com',
            customer_name: 'Unknown',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.error('Error creating payment record:', insertError);
          return new Response('Failed to create payment record', { status: 500 });
        }
        
        return new Response(JSON.stringify({ success: true, message: 'Payment record created' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      return new Response('Payment not found', { status: 404 });
    }

    // Prevent duplicate processing of completed payments
    if (paymentData.status === 'completed' && paymentStatus === 'completed') {
      console.log('Payment already processed, skipping');
      return new Response(JSON.stringify({ success: true, message: 'Already processed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        gateway_transaction_id: transactionId?.toString(),
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', orderId);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      return new Response('Failed to update payment', { status: 500 });
    }

    console.log(`Payment ${orderId} updated to status: ${paymentStatus}`);

    // If payment is successful, update user subscription
    if (paymentStatus === 'completed') {
      console.log('Payment completed, updating subscription for email:', paymentData.customer_email);

      try {
        // Get user ID from payment record
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', paymentData.customer_email)
          .single();

        if (userError || !userData) {
          console.error('User not found for email:', paymentData.customer_email, userError);
          // Don't return error here, payment is still successful
        } else {
          // Calculate subscription expiry (30 days from now)
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
          
          // Get scan limits based on tier
          const maxScans = getSubscriptionLimits(paymentData.tier);

          // Update or create subscription
          const { error: subError } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userData.id,
              tier: paymentData.tier,
              status: 'active',
              max_scans: maxScans,
              scan_count: 0,
              expires_at: expiryDate.toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });

          if (subError) {
            console.error('Error updating subscription:', subError);
          } else {
            console.log(`Subscription updated successfully for user ${userData.id}: ${paymentData.tier} plan with ${maxScans} scans`);
          }
        }
      } catch (subscriptionError) {
        console.error('Error processing subscription update:', subscriptionError);
        // Don't fail the webhook, payment processing is more important
      }
    }

    // Log webhook completion
    console.log(`Webhook processed successfully for payment ${orderId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Payment ${paymentStatus}`,
        transactionId: transactionId 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Webhook processing error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
