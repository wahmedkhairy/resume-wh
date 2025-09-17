import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to verify payment with Paymob API
async function verifyPaymentWithPaymob(transactionId: string): Promise<boolean> {
  try {
    const paymobApiKey = Deno.env.get('PAYMOB_API_KEY');
    if (!paymobApiKey) {
      console.error('PAYMOB_API_KEY not configured');
      return false;
    }

    // Step 1: Get auth token
    const authResponse = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: paymobApiKey })
    });

    if (!authResponse.ok) {
      console.error('Failed to get auth token from Paymob');
      return false;
    }

    const authData = await authResponse.json();
    const authToken = authData.token;

    if (!authToken) {
      console.error('No auth token received from Paymob');
      return false;
    }

    // Step 2: Get transaction details
    const transactionResponse = await fetch(
      `https://accept.paymob.com/api/acceptance/transactions/${transactionId}?token=${authToken}`
    );

    if (!transactionResponse.ok) {
      console.error('Failed to fetch transaction from Paymob');
      return false;
    }

    const transactionData = await transactionResponse.json();
    
    // Verify transaction is successful
    return transactionData.success === true && 
           transactionData.pending === false && 
           transactionData.error_occured === false;

  } catch (error) {
    console.error('Error verifying payment with Paymob:', error);
    return false;
  }
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
    );

    const { transactionId, orderId } = await req.json();

    if (!transactionId?.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Transaction ID is required'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('Verifying payment:', { transactionId, orderId });

    // First, check our database
    let paymentQuery = supabase
      .from('payments')
      .select('*');

    if (orderId) {
      paymentQuery = paymentQuery.eq('payment_id', orderId);
    } else {
      paymentQuery = paymentQuery.eq('gateway_transaction_id', transactionId);
    }

    const { data: paymentData, error: paymentError } = await paymentQuery.single();

    if (paymentError) {
      console.error('Payment not found in database:', paymentError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payment not found'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // If payment is already completed in our database, return success
    if (paymentData.status === 'completed') {
      console.log('Payment already completed in database');
      return new Response(
        JSON.stringify({
          success: true,
          status: 'completed',
          verified: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // If payment is pending, verify with Paymob
    if (paymentData.status === 'pending') {
      console.log('Payment pending, verifying with Paymob API');
      
      const isVerified = await verifyPaymentWithPaymob(transactionId);
      
      if (isVerified) {
        console.log('Payment verified with Paymob, updating status');
        
        // Update payment status to completed
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: 'completed',
            gateway_transaction_id: transactionId,
            updated_at: new Date().toISOString()
          })
          .eq('payment_id', paymentData.payment_id);

        if (updateError) {
          console.error('Error updating payment status:', updateError);
        } else {
          console.log('Payment status updated to completed');
          
          // Update subscription if user found
          if (paymentData.user_id || paymentData.customer_email) {
            let userId = paymentData.user_id;
            
            // If no user_id, try to find by email
            if (!userId && paymentData.customer_email) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', paymentData.customer_email)
                .single();
              
              userId = profile?.id;
            }

            if (userId) {
              // Define tier benefits
              const tierBenefits = {
                basic: { scans: 2, max_scans: 2 },
                premium: { scans: 6, max_scans: 6 },
                unlimited: { scans: 999, max_scans: 999 }
              };

              const benefits = tierBenefits[paymentData.tier as keyof typeof tierBenefits] || tierBenefits.basic;

              const { error: subscriptionError } = await supabase
                .from('subscriptions')
                .upsert({
                  user_id: userId,
                  tier: paymentData.tier,
                  status: 'active',
                  scan_count: benefits.scans,
                  max_scans: benefits.max_scans,
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'user_id'
                });

              if (subscriptionError) {
                console.error('Error updating subscription:', subscriptionError);
              } else {
                console.log('Subscription updated successfully');
              }
            }
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            status: 'completed',
            verified: true
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      } else {
        console.log('Payment verification failed with Paymob');
        return new Response(
          JSON.stringify({
            success: false,
            status: 'pending',
            verified: false,
            error: 'Payment not verified with payment gateway'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
    }

    // If payment failed, return failed status
    if (paymentData.status === 'failed') {
      return new Response(
        JSON.stringify({
          success: false,
          status: 'failed',
          verified: true,
          error: 'Payment failed'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Unknown status
    return new Response(
      JSON.stringify({
        success: false,
        status: paymentData.status,
        verified: false,
        error: 'Unknown payment status'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in payment verification:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
