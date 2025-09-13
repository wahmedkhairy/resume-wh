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
  error?: string;
}

export const createPaymobOrder = async (orderData: PaymobOrderData): Promise<PaymobPaymentResponse> => {
  try {
    // Convert amount to cents (Paymob expects amount in cents)
    const amountInCents = Math.round(orderData.amount * 100);
    
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

    return data;
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