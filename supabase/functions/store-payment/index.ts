
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const PaymentDataSchema = z.object({
  payment_id: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  payer_email: z.string().email().optional(),
  amount: z.number().positive().max(10000),
  transaction_id: z.string().max(200).optional(),
  tier: z.string().max(50).optional()
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Store payment function called');
    
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client with user auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse and validate request body
    const requestData = await req.json();
    console.log('Received payment data for user:', user.id);
    
    const validated = PaymentDataSchema.parse(requestData);
    const paymentData = {
      payment_id: validated.payment_id,
      payer_name: validated.name,
      payer_email: validated.payer_email || user.email,
      amount: validated.amount,
      transaction_id: validated.transaction_id
    };

    // Store payment in database (using service role for insert)
    const supabaseServiceRole = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { data, error } = await supabaseServiceRole
      .from('payments')
      .insert({
        payment_id: paymentData.payment_id,
        payer_name: paymentData.payer_name,
        payer_email: paymentData.payer_email,
        amount: paymentData.amount,
        currency: 'USD',
        transaction_id: paymentData.transaction_id,
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
    
    // Handle validation errors specifically
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ 
        error: 'Invalid payment data',
        details: error.errors 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
