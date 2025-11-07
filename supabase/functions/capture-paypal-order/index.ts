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
    const { orderId } = await req.json();
    
    // Validate required fields
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    // Use secure PayPal credentials from environment variables
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    
    if (!paypalClientId || !paypalClientSecret) {
      console.error('PayPal credentials not configured in environment variables');
      throw new Error('PayPal credentials not properly configured');
    }

    console.log('Capturing PayPal order:', { 
      orderId,
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

    // First, get order details to validate
    const orderDetailsResponse = await fetch(`${baseURL}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`
      }
    });

    const orderDetails = await orderDetailsResponse.json();
    
    if (!orderDetailsResponse.ok) {
      console.error('Failed to get order details:', {
        status: orderDetailsResponse.status,
        data: orderDetails
      });
      throw new Error(`Failed to validate order: ${orderDetails.message || 'Order not found'}`);
    }

    console.log('Order details retrieved:', {
      orderId: orderDetails.id,
      status: orderDetails.status,
      intent: orderDetails.intent
    });

    // Check if order is in correct state for capture
    if (orderDetails.status !== 'APPROVED') {
      console.error('Order not in approved state:', orderDetails.status);
      throw new Error(`Order cannot be captured. Current status: ${orderDetails.status}`);
    }

    // Capture PayPal order
    const captureResponse = await fetch(`${baseURL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`,
        'PayPal-Request-Id': `capture_${orderId}_${Date.now()}`
      },
      body: JSON.stringify({
        // Add any additional capture details if needed
      })
    });

    const captureData = await captureResponse.json();
    
    if (!captureResponse.ok) {
      console.error('PayPal order capture failed:', {
        status: captureResponse.status,
        data: captureData
      });
      throw new Error(`PayPal payment capture failed: ${captureData.message || captureData.error_description || 'Unknown error'}`);
    }

    // Validate capture was successful
    if (captureData.status !== 'COMPLETED') {
      console.error('Payment capture not completed:', captureData);
      throw new Error(`Payment capture failed. Status: ${captureData.status}`);
    }

    // Extract transaction details
    const purchaseUnits = captureData.purchase_units || [];
    const captures = purchaseUnits[0]?.payments?.captures || [];
    const capture = captures[0];

    if (!capture) {
      console.error('No capture details found in response:', captureData);
      throw new Error('No capture details found in PayPal response');
    }

    console.log('PayPal payment captured successfully:', {
      orderId: captureData.id,
      captureId: capture.id,
      status: capture.status,
      amount: capture.amount,
      createTime: capture.create_time
    });

    // Return comprehensive success response
    return new Response(JSON.stringify({ 
      success: true,
      orderId: captureData.id,
      transactionId: capture.id,
      captureId: capture.id,
      status: captureData.status,
      captureStatus: capture.status,
      amount: capture.amount,
      createTime: capture.create_time,
      updateTime: capture.update_time,
      payer: captureData.payer
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in capture-paypal-order function:', error);
    
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
