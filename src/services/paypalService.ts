
export interface PayPalOrderData {
  amount: string;
  currency: string;
  description: string;
  tier: string;
}

// Simple PayPal client ID
export const PAYPAL_CLIENT_ID = "AWiv-6cjprQeRqz07LMIvHDtAJ22f6BVGcpgQHXMT0n2zJ8CFAtgzMT4_v-bhLWmdswIp2E9ExU1NX5E";

// Simple PayPal service
export class PayPalService {
  private static instance: PayPalService;

  private constructor() {}

  public static getInstance(): PayPalService {
    if (!PayPalService.instance) {
      PayPalService.instance = new PayPalService();
    }
    return PayPalService.instance;
  }

  getClientId(): string {
    return PAYPAL_CLIENT_ID;
  }

  isProductionMode(): boolean {
    return false; // Sandbox mode
  }
}
