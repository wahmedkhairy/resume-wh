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
    
    const response = await fetch('/api/create-paymob-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...orderData,
        amount: amountInCents
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
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
    const response = await fetch('/api/verify-paymob-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transactionId }),
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Error verifying Paymob payment:', error);
    return false;
  }
};