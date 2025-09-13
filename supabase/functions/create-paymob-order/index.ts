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

    const { amount, currency, orderId, customerEmail, customerName, tier } = await req.json()

    const paymobApiKey = Deno.env.get('PAYMOB_API_KEY')
    const paymobIntegrationId = Deno.env.get('PAYMOB_INTEGRATION_ID')
    const paymobIframeId = Deno.env.get('PAYMOB_IFRAME_ID')

    if (!paymobApiKey || !paymobIntegrationId || !paymobIframeId) {
      throw new Error('Paymob configuration is missing')
    }

    console.log('Creating Paymob order:', { amount, currency, orderId, customerEmail, tier })

    // Step 1: Get authentication token
    const authResponse = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: paymobApiKey
      })
    })

    if (!authResponse.ok) {
      throw new Error('Failed to authenticate with Paymob')
    }

    const authData = await authResponse.json()
    const authToken = authData.token

    // Step 2: Create order
    const orderResponse = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amount,
        currency: currency,
        merchant_order_id: orderId,
        items: [{
          name: `${tier} Plan Subscription`,
          amount_cents: amount,
          description: `Resume builder ${tier} plan`,
          quantity: 1
        }]
      })
    })

    if (!orderResponse.ok) {
      throw new Error('Failed to create Paymob order')
    }

    const orderData = await orderResponse.json()
    console.log('Paymob order created:', orderData.id)

    // Step 3: Get payment key
    const paymentKeyResponse = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: amount,
        expiration: 3600,
        order_id: orderData.id,
        billing_data: {
          apartment: "NA",
          email: customerEmail,
          floor: "NA",
          first_name: customerName.split(' ')[0] || customerName,
          street: "NA",
          building: "NA",
          phone_number: "NA",
          shipping_method: "NA",
          postal_code: "NA",
          city: "NA",
          country: "EG",
          last_name: customerName.split(' ').slice(1).join(' ') || customerName,
          state: "NA"
        },
        currency: currency,
        integration_id: parseInt(paymobIntegrationId)
      })
    })

    if (!paymentKeyResponse.ok) {
      throw new Error('Failed to get payment key')
    }

    const paymentKeyData = await paymentKeyResponse.json()
    const paymentKey = paymentKeyData.token

    // Generate payment URL
    const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${paymobIframeId}?payment_token=${paymentKey}`

    // Store payment record
    const { error: dbError } = await supabase
      .from('payments')
      .insert({
        payment_id: orderId,
        amount: amount / 100, // Convert back to actual amount
        currency: currency,
        status: 'pending',
        tier: tier,
        gateway: 'paymob',
        gateway_order_id: orderData.id.toString(),
        customer_email: customerEmail,
        customer_name: customerName
      })

    if (dbError) {
      console.error('Database error:', dbError)
    }

    console.log('Payment URL generated successfully')

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: paymentUrl,
        orderId: orderData.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error)
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