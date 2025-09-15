import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const webhookData = await req.json()
    console.log('Paymob webhook received:', JSON.stringify(webhookData, null, 2))

    // Extract transaction data from Paymob webhook
    const {
      id: transactionId,
      order,
      success,
      amount_cents,
      currency,
      pending,
      error_occured
    } = webhookData.obj || webhookData

    if (!order || !transactionId) {
      console.error('Invalid webhook data received')
      return new Response('Invalid webhook data', { status: 400 })
    }

    const orderId = order.merchant_order_id
    const paymobOrderId = order.id

    // Determine payment status
    let paymentStatus = 'pending'
    if (success && !pending && !error_occured) {
      paymentStatus = 'completed'
    } else if (error_occured) {
      paymentStatus = 'failed'
    }

    console.log(`Processing payment ${orderId} with status: ${paymentStatus}`)

    // Update payment record
    const { data: paymentData, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_id', orderId)
      .single()

    if (fetchError) {
      console.error('Error fetching payment:', fetchError)
      return new Response('Payment not found', { status: 404 })
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        gateway_transaction_id: transactionId.toString(),
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', orderId)

    if (updateError) {
      console.error('Error updating payment:', updateError)
      return new Response('Failed to update payment', { status: 500 })
    }

    // If payment is successful, update user subscription
    if (paymentStatus === 'completed') {
      console.log('Payment completed, updating subscription')

      // Get user ID from payment record (you may need to store this when creating the payment)
      const { data: userData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', paymentData.customer_email)
        .single()

      if (userData) {
        // Determine scan limits based on tier
        let maxScans = 2
        if (paymentData.tier === 'premium') maxScans = 5
        if (paymentData.tier === 'unlimited') maxScans = 999

        // Update or create subscription
        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userData.id,
            tier: paymentData.tier,
            status: 'active',
            max_scans: maxScans,
            scan_count: 0,
            updated_at: new Date().toISOString()
          })

        if (subError) {
          console.error('Error updating subscription:', subError)
        } else {
          console.log('Subscription updated successfully')
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Webhook error:', error)
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