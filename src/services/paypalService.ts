
export interface PayPalOrderData {
  amount: string;
  currency: string;
  description: string;
  tier: string;
}

// PayPal client ID
export const PAYPAL_CLIENT_ID = "AWiv-6cjprQeRqz07LMIvHDtAJ22f6BVGcpgQHXMT0n2zJ8CFAtgzMT4_v-bhLWmdswIp2E9ExU1NX5E";

// PayPal service with all required methods
export class PayPalService {
  private static instance: PayPalService;
  private paypalSdk: any = null;

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

  async initialize(): Promise<boolean> {
    try {
      // Remove existing script if present
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Load PayPal SDK
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
      script.async = true;

      return new Promise((resolve) => {
        script.onload = () => {
          this.paypalSdk = (window as any).paypal;
          console.log('PayPal SDK loaded successfully');
          resolve(true);
        };

        script.onerror = () => {
          console.error('Failed to load PayPal SDK');
          resolve(false);
        };

        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('Error initializing PayPal:', error);
      return false;
    }
  }

  getPayPal(): any {
    return this.paypalSdk || (window as any).paypal;
  }

  async createOrder(orderData: PayPalOrderData): Promise<string> {
    const paypal = this.getPayPal();
    if (!paypal) {
      throw new Error('PayPal SDK not loaded');
    }

    // This is a simplified mock - in real implementation, you'd call PayPal's API
    return `ORDER_${Date.now()}`;
  }

  async captureOrder(orderId: string): Promise<any> {
    const paypal = this.getPayPal();
    if (!paypal) {
      throw new Error('PayPal SDK not loaded');
    }

    // This is a simplified mock - in real implementation, you'd call PayPal's API
    return {
      id: orderId,
      status: 'COMPLETED',
      amount: '2.00',
      currency: 'USD'
    };
  }
}
