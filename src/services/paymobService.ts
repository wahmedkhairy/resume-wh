import { supabase } from "@/integrations/supabase/client";

export interface PaymobOrderData {
  amount: number;
  currency: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  tier: string;
}

export interface PaymobPaymentResponse {
  success: boolean;
  paymentUrl?: string;
  orderId?: string;
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

    // Convert amount to cents (Paymob expects amount in cents)
    const amountInCents = Math.round(orderData.amount * 100);
    
    console.log('Creating Paymob order:', {
      ...orderData,
      amountInCents
    });

    const requestBody = {
      ...orderData,
      amount: amountInCents
    };

    console.log('Sending request to create-paymob-order function:', requestBody);

    const { data, error } = await supabase.functions.invoke('create-paymob-order', {
      body: requestBody
    });

    console.log('Supabase function response:', { data, error });

    if (error) {
      console.error('Supabase function error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create order'
      };
    }

    if (!data) {
      console.error('No data returned from function');
      return {
        success: false,
        error: 'No response from payment service'
      };
    }

    if (!data.success) {
      console.error('Function returned error:', data.error);
      return {
        success: false,
        error: data.error || 'Failed to create payment order'
      };
    }

    if (!data.paymentUrl) {
      console.error('No payment URL returned');
      return {
        success: false,
        error: 'No payment URL received'
      };
    }

    console.log('Payment order created successfully:', {
      orderId: data.orderId,
      paymentUrl: data.paymentUrl?.substring(0, 50) + '...' // Log partial URL for security
    });

    return {
      success: true,
      paymentUrl: data.paymentUrl,
      orderId: data.orderId
    };
  } catch (error) {
    console.error('Error creating Paymob order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order'
    };
  }
};

export const verifyPaymobPayment = async (transactionId: string): Promise<boolean> => {
  try {
    if (!transactionId?.trim()) {
      console.error('Transaction ID is required for verification');
      return false;
    }

    console.log('Verifying Paymob payment:', transactionId);

    const { data, error } = await supabase.functions.invoke('verify-paymob-payment', {
      body: { transactionId }
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

// Helper function to check payment status by order ID
export const checkPaymentStatus = async (orderId: string): Promise<{
  success: boolean;
  status?: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  error?: string;
}> => {
  try {
    if (!orderId?.trim()) {
      return {
        success: false,
        error: 'Order ID is required'
      };
    }

    const { data: paymentData, error } = await supabase
      .from('payments')
      .select('status, gateway_transaction_id')
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
      status: paymentData.status,
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
