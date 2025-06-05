
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency, description, tier } = await req.json();
    
    // Use your PayPal credentials from environment variables
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    
    if (!paypalClientId || !paypalClientSecret) {
      throw new Error('PayPal credentials not configured');
    }

    console.log('Creating PayPal order for:', { amount, currency, tier });

    // Get PayPal access token
    const authResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`
      },
      body: 'grant_type=client_credentials'
    });

    const authData = await authResponse.json();
    
    if (!authData.access_token) {
      console.error('Failed to get PayPal access token:', authData);
      throw new Error('Failed to get PayPal access token');
    }

    // Create PayPal order
    const orderResponse = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount
          },
          description: description,
          custom_id: tier
        }],
        application_context: {
          return_url: `${req.headers.get('origin')}/payment-success`,
          cancel_url: `${req.headers.get('origin')}/payment-cancelled`
        }
      })
    });

    const orderData = await orderResponse.json();
    
    if (!orderData.id) {
      console.error('Failed to create PayPal order:', orderData);
      throw new Error('Failed to create PayPal order');
    }

    console.log('PayPal order created successfully:', orderData.id);

    return new Response(JSON.stringify({ orderId: orderData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
