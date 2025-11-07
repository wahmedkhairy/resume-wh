
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Store payment function called');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const paymentData = await req.json();
    console.log('Received payment data:', paymentData);

    // Validate required fields
    if (!paymentData.payment_id || !paymentData.amount || !paymentData.name) {
      console.error('Missing required payment fields');
      return new Response('Missing required payment fields', {
        status: 400,
        headers: corsHeaders
      });
    }

    // Store payment in database
    const { data, error } = await supabase
      .from('payments')
      .insert({
        payment_id: paymentData.payment_id,
        payer_name: paymentData.name,
        payer_email: paymentData.payer_email || null,
        amount: parseFloat(paymentData.amount),
        currency: 'USD',
        transaction_id: paymentData.transaction_id || null,
        status: 'completed',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Database error:', error);
      return new Response(`Database error: ${error.message}`, {
        status: 500,
        headers: corsHeaders
      });
    }

    console.log('Payment stored successfully:', data);

    return new Response('Payment stored successfully', {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Error in store-payment function:', error);
    return new Response(`Server error: ${error.message}`, {
      status: 500,
      headers: corsHeaders
    });
  }
});
