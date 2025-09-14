import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to validate required environment variables
function validateEnvVars() {
  const required = ['PAYMOB_API_KEY', 'PAYMOB_INTEGRATION_ID', 'PAYMOB_IFRAME_ID'];
  const missing = required.filter(key => !Deno.env.get(key));
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Helper function to make API calls with error handling
async function makePaymobRequest(url: string, body: any, description: string) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${description} failed:`, response.status, errorText);
      throw new Error(`${description} failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in ${description}:`, error);
    throw new Error(`${description} failed: ${error.message}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    validateEnvVars();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    const { amount, currency, orderId, customerEmail, customerName, tier } = requestBody

    // Validate request data
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount provided');
    }
    
    if (!currency || !['EGP', 'USD'].includes(currency)) {
      throw new Error('Invalid currency provided');
    }
    
    if (!orderId || !customerEmail || !customerName || !tier) {
      throw new Error('Missing required fields');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      throw new Error('Invalid email format');
    }

    const paymobApiKey = Deno.env.get('PAYMOB_API_KEY')!
    const paymobIntegrationId = Deno.env.get('PAYMOB_INTEGRATION_ID')!
    const paymobIframeId = Deno.env.get('PAYMOB_IFRAME_ID')!

    console.log('Creating Paymob order:', { 
      amount, 
      currency, 
      orderId, 
      customerEmail: customerEmail.substring(0, 3) + '***', // Log partial email for privacy
      tier 
    })

    // Step 1: Get authentication token
    const authData = await makePaymobRequest(
      'https://accept.paymob.com/api/auth/tokens',
      { api_key: paymobApiKey },
      'Authentication'
    );

    const authToken = authData.token;
    if (!authToken) {
      throw new Error('Failed to get authentication token');
    }

    // Step 2: Create order
    const orderData = await makePaymobRequest(
      'https://accept.paymob.com/api/ecommerce/orders',
      {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amount,
        currency: currency,
        merchant_order_id: orderId,
        items: [{
          name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan Subscription`,
          amount_cents: amount,
          description: `Resume builder ${tier} plan subscription`,
          quantity: 1
        }]
      },
      'Order creation'
    );

    console.log('Paymob order created:', orderData.id)

    if (!orderData.id) {
      throw new Error('Failed to get order ID from Paymob');
    }

    // Step 3: Get payment key
    // Split customer name properly
    const nameParts = customerName.trim().split(' ');
    const firstName = nameParts[0] || customerName;
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const paymentKeyData = await makePaymobRequest(
      'https://accept.paymob.com/api/acceptance/payment_keys',
      {
        auth_token: authToken,
        amount_cents: amount,
        expiration: 3600, // 1 hour
        order_id: orderData.id,
        billing_data: {
          apartment: "NA",
          email: customerEmail,
          floor: "NA",
          first_name: firstName,
          street: "NA",
          building: "NA",
          phone_number: "NA",
          shipping_method: "NA",
          postal_code: "NA",
          city: "NA",
          country: currency === 'EGP' ? "EG" : "US",
          last_name: lastName,
          state: "NA"
        },
        currency: currency,
        integration_id: parseInt(paymobIntegrationId)
      },
      'Payment key generation'
    );

    const paymentKey = paymentKeyData.token;
    if (!paymentKey) {
      throw new Error('Failed to get payment key');
    }

    // Generate payment URL
    const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${paymobIframeId}?payment_token=${paymentKey}`;

    // Store payment record in database
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
        customer_name: customerName,
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Database error:', dbError)
      // Don't throw here as payment URL is already generated
      // The webhook can still handle the payment completion
    }

    console.log('Payment URL generated successfully for order:', orderId)

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
    console.error('Error creating Paymob order:', error)
    
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
