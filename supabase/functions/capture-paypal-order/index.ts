
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
    const { orderId } = await req.json();
    
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    
    if (!paypalClientId || !paypalClientSecret) {
      throw new Error('PayPal credentials not configured');
    }

    console.log('Capturing PayPal order:', orderId);

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

    // Capture PayPal order
    const captureResponse = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`
      }
    });

    const captureData = await captureResponse.json();
    
    if (captureData.status !== 'COMPLETED') {
      console.error('PayPal payment capture failed:', captureData);
      throw new Error('PayPal payment capture failed');
    }

    console.log('PayPal payment captured successfully:', captureData.id);

    return new Response(JSON.stringify({ 
      success: true, 
      transactionId: captureData.id,
      status: captureData.status 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
