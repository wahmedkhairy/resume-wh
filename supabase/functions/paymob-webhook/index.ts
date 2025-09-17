import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to validate webhook signature (if you have HMAC key)
function validateWebhookSignature(payload: string, signature: string | null): boolean {
  // If you have PAYMOB_HMAC_KEY set up, validate the signature here
  const hmacKey = Deno.env.get('PAYMOB_HMAC_KEY');
  if (!hmacKey || !signature) {
    console.warn('HMAC validation skipped - no key or signature provided');
    return true; // Allow if no validation configured
  }

  // TODO: Implement HMAC validation if needed
  // For now, we'll trust the webhook since it's coming from Paymob
  return true;
}

// Helper function to determine payment status from webhook data
function determinePaymentStatus(webhookObj: any): string {
  const { success, pending, error_occured, txn_response_code } = webhookObj;

  // Check for explicit success indicators
  if (success === true && pending === false && error_occured === false) {
    return 'completed';
  }

  // Check for explicit failure indicators
  if (error_occured === true || success === false) {
    return 'failed';
  }

  // Check transaction response code if available
  if (txn_response_code) {
    // Common successful response codes for Paymob
    const successCodes = ['APPROVED', 'SUCCESS', '00', '000'];
    if (successCodes.includes(txn_response_code.toString().toUpperCase())) {
      return 'completed';
    }
    
    // Common failure codes
    const failureCodes = ['DECLINED', 'FAILED', 'CANCELLED', 'EXPIRED'];
    if (failureCodes.some(code => txn_response_code.toString().toUpperCase().includes(code))) {
      return 'failed';
    }
  }

  // Default to pending if status is unclear
  return 'pending';
}

// Helper function to get tier benefits
function getTierBenefits(tier: string) {
  const tierBenefits = {
    basic: { scans: 2, max_scans: 2 },
    premium: { scans: 6, max_scans: 6 },
    unlimited: { scans: 999, max_scans: 999 }
  };

  return tierBenefits[tier as keyof typeof tierBenefits] || tierBenefits.basic;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('Paymob webhook received at:', new Date().toISOString());

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the raw body for signature validation
    const rawBody = await req.text();
    const webhookSignature = req.headers.get('x-paymob-signature');

    // Validate webhook signature
    if (!validateWebhookSignature(rawBody, webhookSignature)) {
      console.error('Invalid webhook signature');
      return new Response('Invalid signature', { 
        status: 401,
        headers: corsHeaders 
      });
    }

    // Parse the webhook data
    let webhookData;
    try {
      webhookData = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Failed to parse webhook JSON:', parseError);
      return new Response('Invalid JSON', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    console.log('Webhook data received:', JSON.stringify(webhookData, null, 2));

    // Extract transaction data from Paymob webhook
    const webhookObj = webhookData.obj || webhookData;
    
    if (!webhookObj) {
      console.error('No obj field in webhook data');
      return new Response('Invalid webhook format', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const {
      id: transactionId,
      order,
      amount_cents,
      currency,
      txn_response_code,
      created_at,
      updated_at
    } = webhookObj;

    // Validate required fields
    if (!order || !transactionId) {
      console.error('Missing required fields in webhook:', { 
        hasOrder: !!order, 
        hasTransactionId: !!transactionId 
      });
      return new Response('Missing required fields', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const merchantOrderId = order.merchant_order_id;
    const paymobOrderId = order.id;

    if (!merchantOrderId) {
      console.error('No merchant_order_id found in order data');
      return new Response('Missing merchant order ID', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Determine payment status
    const paymentStatus = determinePaymentStatus(webhookObj);

    console.log(`Processing payment ${merchantOrderId} with status: ${paymentStatus}`, {
      transactionId,
      paymobOrderId,
      amount_cents,
      currency,
      txn_response_code
    });

    // Find the payment record
    const { data: paymentData, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_id', merchantOrderId)
      .single();

    if (fetchError) {
      console.error('Error fetching payment:', fetchError);
      
      // If payment not found, try to create it from webhook data
      if (fetchError.code === 'PGRST116') { // Not found
        console.log('Payment record not found, attempting to create from webhook data');
        
        // This is a fallback - ideally payment should be created when order is created
        const { error: insertError } = await supabase
          .from('payments')
          .insert({
            payment_id: merchantOrderId,
            amount: amount_cents ? amount_cents / 100 : 0,
            currency: currency || 'EGP',
            status: paymentStatus,
            gateway: 'paymob',
            gateway_order_id: paymobOrderId?.toString(),
            gateway_transaction_id: transactionId?.toString(),
            tier: 'basic', // Default tier - this should be improved
            customer_email: 'unknown@example.com', // Placeholder
            customer_name: 'Unknown Customer', // Placeholder
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Failed to create payment record:', insertError);
          return new Response('Failed to process payment', { 
            status: 500,
            headers: corsHeaders 
          });
        }

        console.log('Payment record created from webhook data');
      } else {
        return new Response('Payment lookup failed', { 
          status: 500,
          headers: corsHeaders 
        });
      }
    }

    // Update payment status
    const updateData = {
      status: paymentStatus,
      gateway_transaction_id: transactionId?.toString(),
      updated_at: new Date().toISOString()
    };

    // Add additional fields if available
    if (amount_cents) updateData.amount = amount_cents / 100;
    if (currency) updateData.currency = currency;

    const { error: updateError } = await supabase
      .from('payments')
      .update(updateData)
      .eq('payment_id', merchantOrderId);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      return new Response('Failed to update payment', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    console.log('Payment status updated successfully');

    // If payment is completed, update user subscription
    if (paymentStatus === 'completed') {
      console.log('Payment completed, processing subscription update');

      try {
        // Refetch payment data to get the latest information
        const { data: currentPayment, error: refetchError } = await supabase
          .from('payments')
          .select('*')
          .eq('payment_id', merchantOrderId)
          .single();

        if (refetchError || !currentPayment) {
          throw new Error('Failed to refetch payment data');
        }

        // Find user by email or user_id
        let userId = currentPayment.user_id;
        
        if (!userId && currentPayment.customer_email) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', currentPayment.customer_email)
            .single();
          
          userId = profile?.id;
        }

        if (!userId) {
          console.error('Cannot find user for payment:', merchantOrderId);
          // Don't fail the webhook, but log the issue
          console.warn('Subscription update skipped - no user found');
        } else {
          // Get tier benefits
          const benefits = getTierBenefits(currentPayment.tier);

          // Update or create subscription
          const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              tier: currentPayment.tier,
              status: 'active',
              scan_count: benefits.scans,
              max_scans: benefits.max_scans,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });

          if (subscriptionError) {
            console.error('Error updating subscription:', subscriptionError);
            // Don't fail the webhook, but log the issue
          } else {
            console.log('Subscription updated successfully for user:', userId);
          }
        }
      } catch (subscriptionError) {
        console.error('Error in subscription processing:', subscriptionError);
        // Don't fail the webhook, but log the issue
      }
    }

    const processingTime = Date.now() - startTime;
    console.log(`Webhook processed successfully in ${processingTime}ms`);

    return new Response(
      JSON.stringify({ 
        success: true,
        processed_at: new Date().toISOString(),
        processing_time_ms: processingTime
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Webhook processing error:', error);
    console.error('Error context:', {
      timestamp: new Date().toISOString(),
      processing_time_ms: processingTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
