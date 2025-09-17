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

// Helper function to make API calls with better error handling and retry logic
async function makePaymobRequest(url: string, body: any, description: string, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`${description} - Attempt ${attempt + 1}/${retries + 1}`);
      
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
        
        if (attempt === retries) {
          throw new Error(`${description} failed with status ${response.status}: ${errorText}`);
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }

      const result = await response.json();
      console.log(`${description} successful:`, { success: true, hasData: !!result });
      return result;
    } catch (error) {
      if (attempt === retries) {
        console.error(`Final attempt failed for ${description}:`, error);
        throw new Error(`${description} failed: ${error.message}`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
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
    const { amount, currency, orderId, customerEmail, customerName, tier, userId } = requestBody

    console.log('Received payment request:', {
      amount,
      currency,
      orderId,
      customerEmail: customerEmail?.substring(0, 3) + '***',
      tier,
      userId: userId?.substring(0, 8) + '***'
    });

    // Enhanced validation
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount provided');
    }
    
    if (!currency || !['EGP', 'USD'].includes(currency)) {
      throw new Error('Invalid currency provided. Only EGP and USD are supported.');
    }
    
    if (!orderId?.trim() || orderId.length < 5) {
      throw new Error('Invalid order ID provided');
    }
    
    if (!customerEmail?.trim() || !customerName?.trim() || !tier?.trim()) {
      throw new Error('Missing required customer information');
    }

    if (!['basic', 'premium', 'unlimited'].includes(tier)) {
      throw new Error('Invalid subscription tier');
    }

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      throw new Error('Invalid email format');
    }

    // Validate amount ranges (basic sanity check)
    const minAmount = currency === 'EGP' ? 50 : 1; // Minimum amounts
    const maxAmount = currency === 'EGP' ? 100000 : 1000; // Maximum amounts
    
    if (amount < minAmount || amount > maxAmount) {
      throw new Error(`Amount must be between ${minAmount} and ${maxAmount} ${currency}`);
    }

    const paymobApiKey = Deno.env.get('PAYMOB_API_KEY')!
    const paymobIntegrationId = Deno.env.get('PAYMOB_INTEGRATION_ID')!
    const paymobIframeId = Deno.env.get('PAYMOB_IFRAME_ID')!

    console.log('Starting Paymob order creation process');

    // Step 1: Get authentication token
    console.log('Step 1: Getting authentication token');
    const authData = await makePaymobRequest(
      'https://accept.paymob.com/api/auth/tokens',
      { api_key: paymobApiKey },
      'Authentication'
    );

    const authToken = authData.token;
    if (!authToken) {
      throw new Error('Failed to get authentication token from Paymob');
    }

    // Step 2: Create order
    console.log('Step 2: Creating order');
    const orderPayload = {
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
    };

    const orderData = await makePaymobRequest(
      'https://accept.paymob.com/api/ecommerce/orders',
      orderPayload,
      'Order creation'
    );

    if (!orderData?.id) {
      throw new Error('Failed to get order ID from Paymob response');
    }

    console.log('Order created successfully:', { paymobOrderId: orderData.id });

    // Step 3: Get payment key
    console.log('Step 3: Generating payment key');
    
    // Better name splitting
    const nameParts = customerName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const paymentKeyPayload = {
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
      integration_id: parseInt(paymobIntegrationId),
      lock_order_when_paid: true
    };

    const paymentKeyData = await makePaymobRequest(
      'https://accept.paymob.com/api/acceptance/payment_keys',
      paymentKeyPayload,
      'Payment key generation'
    );

    const paymentKey = paymentKeyData.token;
    if (!paymentKey) {
      throw new Error('Failed to get payment key from Paymob response');
    }

    // Generate payment URL
    const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${paymobIframeId}?payment_token=${paymentKey}`;

    console.log('Payment key generated successfully');

    // Step 4: Store payment record in database with better error handling
    console.log('Step 4: Storing payment record');
    
    const paymentRecord = {
      payment_id: orderId,
      amount: amount / 100, // Convert back to actual amount
      currency: currency,
      status: 'pending',
      tier: tier,
      gateway: 'paymob',
      gateway_order_id: orderData.id.toString(),
      customer_email: customerEmail,
      customer_name: customerName,
      user_id: userId || null,
      created_at: new Date().toISOString()
    };

    const { error: dbError } = await supabase
      .from('payments')
      .insert(paymentRecord);

    if (dbError) {
      console.error('Database error:', dbError);
      // Don't fail the payment creation, but log the error
      // The webhook can still handle the payment completion
      console.warn('Payment record not stored in database, but payment URL generated. Webhook will handle completion.');
    } else {
      console.log('Payment record stored successfully');
    }

    console.log('Payment URL generated successfully for order:', orderId);

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: paymentUrl,
        orderId: orderData.id,
        merchantOrderId: orderId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error creating Paymob order:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    // Log additional context for debugging
    console.error('Error context:', {
      timestamp: new Date().toISOString(),
      error: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
