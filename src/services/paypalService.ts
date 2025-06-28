
export interface PayPalOrderData {
  amount: string;
  currency: string;
  description: string;
  tier: string;
}

export interface PayPalSettings {
  clientId: string;
  isProduction: boolean;
}

// Simple PayPal service for basic operations
export class PayPalService {
  private static instance: PayPalService;
  private paypalSDK: any = null;

  private constructor() {}

  public static getInstance(): PayPalService {
    if (!PayPalService.instance) {
      PayPalService.instance = new PayPalService();
    }
    return PayPalService.instance;
  }

  // Simple method to get client ID (using sandbox for now)
  getClientId(): string {
    return "ATW52HhFLL9GSuqaUlDiXLhjc6puky0HqmKdmPGAhYRFcdZIu9qV5XowN4wT1td5GgwpQFgQvcq069V2";
  }

  isProductionMode(): boolean {
    return false; // Always sandbox for now
  }

  // Initialize PayPal SDK
  async initialize(): Promise<boolean> {
    try {
      const clientId = this.getClientId();
      const currency = "USD";
      
      // Remove existing script if any
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Load PayPal SDK
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture`;
      script.async = true;
      
      return new Promise((resolve) => {
        script.onload = () => {
          this.paypalSDK = (window as any).paypal;
          resolve(true);
        };
        
        script.onerror = () => {
          resolve(false);
        };
        
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('PayPal initialization error:', error);
      return false;
    }
  }

  // Get PayPal SDK instance
  getPayPal(): any {
    return this.paypalSDK || (window as any).paypal;
  }

  // Create PayPal order
  async createOrder(orderData: PayPalOrderData): Promise<string> {
    try {
      const paypal = this.getPayPal();
      if (!paypal) {
        throw new Error('PayPal SDK not loaded');
      }

      // For now, return a mock order ID since we're using client-side SDK
      // In a real implementation, this would call your backend
      return Promise.resolve('MOCK_ORDER_ID');
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  }

  // Capture PayPal order
  async captureOrder(orderId: string): Promise<any> {
    try {
      // For now, return mock capture data
      // In a real implementation, this would call your backend
      return Promise.resolve({
        id: orderId,
        status: 'COMPLETED',
        purchase_units: [{
          payments: {
            captures: [{
              id: 'MOCK_CAPTURE_ID',
              status: 'COMPLETED'
            }]
          }
        }]
      });
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      throw error;
    }
  }
}
