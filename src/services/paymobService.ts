import { supabase } from "@/integrations/supabase/client";

export interface PaymobOrderData {
  amount: number;
  currency: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  tier: string;
  userId?: string; // Added userId for better tracking
}

export interface PaymobPaymentResponse {
  success: boolean;
  paymentUrl?: string;
  orderId?: string;
  paymobOrderId?: string;
  error?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  status?: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  error?: string;
}

export const createPaymobOrder = async (orderData: PaymobOrderData): Promise<PaymobPaymentResponse> => {
  try {
    // Validate input data
    if (!orderData.amount || orderData.amount <= 0) {
      throw new Error('Invalid payment amount');
    }

    if (!orderData.customerEmail || !orderData.customerEmail.includes('@')) {
      throw new Error('Valid email address is required');
    }

    if (!orderData.customerName?.trim()) {
      throw new Error('Customer name is required');
    }

    if (!orderData.tier || !['basic', 'premium', 'unlimited'].includes(orderData.tier)) {
      throw new Error('Valid tier is required');
    }

    // Convert amount to cents (Paymob expects amount in cents)
    const amountInCents = Math.round(orderData.amount * 100);
    
    console.log('Creating Paymob order:', {
      ...orderData,
      amountInCents,
      customerEmail: orderData.customerEmail.substring(0, 3) + '***' // Log partial email for privacy
    });

    const { data, error } = await supabase.functions.invoke('create-paymob-order', {
      body: {
        ...orderData,
        amount: amountInCents
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create order'
      };
    }

    if (!data || !data.success) {
      return {
        success: false,
        error: data?.error || 'Failed to create payment order'
      };
    }

    return {
      success: true,
      paymentUrl: data.paymentUrl,
      orderId: orderData.orderId,
      paymobOrderId: data.orderId
    };
  } catch (error) {
    console.error('Error creating Paymob order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order'
    };
  }
};

export const verifyPaymobPayment = async (transactionId: string, orderId?: string): Promise<boolean> => {
  try {
    if (!transactionId?.trim()) {
      console.error('Transaction ID is required for verification');
      return false;
    }

    console.log('Verifying Paymob payment:', { transactionId, orderId });

    const { data, error } = await supabase.functions.invoke('verify-paymob-payment', {
      body: { transactionId, orderId }
    });

    if (error) {
      console.error('Verification error:', error);
      return false;
    }

    return data?.success === true;
  } catch (error) {
    console.error('Error verifying Paymob payment:', error);
    return false;
  }
};

// Enhanced payment status checker with retry logic
export const checkPaymentStatus = async (orderId: string): Promise<PaymentStatusResponse> => {
  try {
    if (!orderId?.trim()) {
      return {
        success: false,
        error: 'Order ID is required'
      };
    }

    const { data: paymentData, error } = await supabase
      .from('payments')
      .select('status, gateway_transaction_id, tier, customer_email, created_at')
      .eq('payment_id', orderId)
      .single();

    if (error) {
      console.error('Error fetching payment status:', error);
      return {
        success: false,
        error: 'Payment not found'
      };
    }

    return {
      success: true,
      status: paymentData.status as 'pending' | 'completed' | 'failed',
      transactionId: paymentData.gateway_transaction_id
    };
  } catch (error) {
    console.error('Error checking payment status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check payment status'
    };
  }
};

// Helper function to get user profile data
export const getUserProfile = async (userId: string) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Function to handle successful payment and update subscription
export const processSuccessfulPayment = async (orderId: string, transactionId: string): Promise<boolean> => {
  try {
    // Get payment details
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('tier, customer_email, amount, currency')
      .eq('payment_id', orderId)
      .single();

    if (paymentError || !payment) {
      console.error('Error fetching payment details:', paymentError);
      return false;
    }

    // Find user by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', payment.customer_email)
      .single();

    if (profileError || !profile) {
      console.error('Error finding user profile:', profileError);
      return false;
    }

    // Define tier benefits
    const tierBenefits = {
      basic: { scans: 2, max_scans: 2 },
      premium: { scans: 6, max_scans: 6 },
      unlimited: { scans: 999, max_scans: 999 }
    };

    const benefits = tierBenefits[payment.tier as keyof typeof tierBenefits];

    // Update or create subscription
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: profile.id,
        tier: payment.tier,
        status: 'active',
        scan_count: benefits.scans,
        max_scans: benefits.max_scans,
        updated_at: new Date().toISOString()
      });

    if (subscriptionError) {
      console.error('Error updating subscription:', subscriptionError);
      return false;
    }

    // Update payment status to completed
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        gateway_transaction_id: transactionId,
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', orderId);

    if (updateError) {
      console.error('Error updating payment status:', updateError);
      return false;
    }

    console.log('Successfully processed payment and updated subscription');
    return true;
  } catch (error) {
    console.error('Error processing successful payment:', error);
    return false;
  }
};
