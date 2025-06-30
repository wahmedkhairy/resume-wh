
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency = 'USD', description, tier } = await req.json();
    
    // Validate required fields
    if (!amount || !tier) {
      throw new Error('Amount and tier are required');
    }

    // Use the correct PayPal credentials - make sure these match your frontend Client ID
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID') || 'ATW52HhFLL9GSuqaUlDiXLhjc6puky0HqmKdmPGAhYRFcdZIu9qV5XowN4wT1td5GgwpQFgQvcq069V2';
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    
    if (!paypalClientSecret) {
      console.error('PayPal Client Secret not configured in environment variables');
      throw new Error('PayPal credentials not properly configured');
    }

    console.log('Creating PayPal order:', { 
      amount, 
      currency, 
      tier, 
      clientId: paypalClientId.substring(0, 10) + '...' // Log partial ID for debugging
    });

    // Determine PayPal API base URL (sandbox vs production)
    const isProduction = paypalClientId.startsWith('A') && !paypalClientId.includes('sandbox');
    const baseURL = isProduction 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';
    
    console.log(`Using PayPal ${isProduction ? 'Production' : 'Sandbox'} API: ${baseURL}`);

    // Get PayPal access token
    const authResponse = await fetch(`${baseURL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`
      },
      body: 'grant_type=client_credentials'
    });

    const authData = await authResponse.json();
    
    if (!authResponse.ok || !authData.access_token) {
      console.error('Failed to get PayPal access token:', {
        status: authResponse.status,
        data: authData
      });
      throw new Error(`Failed to authenticate with PayPal: ${authData.error_description || 'Unknown error'}`);
    }

    console.log('PayPal access token obtained successfully');

    // Create PayPal order with enhanced configuration
    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: `${tier}_${Date.now()}`,
        amount: {
          currency_code: currency,
          value: parseFloat(amount).toFixed(2)
        },
        description: description || `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
        custom_id: tier,
        soft_descriptor: 'Resume Builder'
      }],
      application_context: {
        brand_name: 'Resume Builder',
        locale: 'en-US',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: `${req.headers.get('origin') || 'http://localhost:3000'}/payment-success`,
        cancel_url: `${req.headers.get('origin') || 'http://localhost:3000'}/payment-cancelled`
      }
    };

    console.log('Creating order with payload:', JSON.stringify(orderPayload, null, 2));

    const orderResponse = await fetch(`${baseURL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`,
        'PayPal-Request-Id': `${tier}_${Date.now()}_${Math.random().toString(36).substring(7)}`
      },
      body: JSON.stringify(orderPayload)
    });

    const orderData = await orderResponse.json();
    
    if (!orderResponse.ok || !orderData.id) {
      console.error('Failed to create PayPal order:', {
        status: orderResponse.status,
        data: orderData
      });
      throw new Error(`Failed to create PayPal order: ${orderData.message || orderData.error_description || 'Unknown error'}`);
    }

    console.log('PayPal order created successfully:', {
      orderId: orderData.id,
      status: orderData.status
    });

    // Return success response
    return new Response(JSON.stringify({ 
      success: true,
      orderId: orderData.id,
      status: orderData.status
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-paypal-order function:', error);
    
    // Return detailed error for debugging
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});