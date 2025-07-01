
import { supabase } from '@/integrations/supabase/client';

export interface PayPalOrderData {
  amount: string;
  currency: string;
  description: string;
  tier: string;
}

// PayPal service with secure credential handling
export class PayPalService {
  private static instance: PayPalService;
  private paypalSdk: any = null;
  private clientId: string | null = null;

  private constructor() {}

  public static getInstance(): PayPalService {
    if (!PayPalService.instance) {
      PayPalService.instance = new PayPalService();
    }
    return PayPalService.instance;
  }

  async getClientId(): Promise<string> {
    if (this.clientId) {
      return this.clientId;
    }

    try {
      const { data, error } = await supabase.functions.invoke('get-paypal-config');
      
      if (error) {
        throw new Error('Failed to fetch PayPal configuration: ' + error.message);
      }
      
      if (!data?.clientId) {
        throw new Error('PayPal Client ID not configured');
      }
      
      this.clientId = data.clientId;
      return this.clientId;
    } catch (error) {
      console.error('Error fetching PayPal Client ID:', error);
      throw error;
    }
  }

  isProductionMode(): boolean {
    // Check if using production credentials based on client ID pattern
    return this.clientId ? this.clientId.startsWith('A') && !this.clientId.includes('sandbox') : false;
  }

  async initialize(): Promise<boolean> {
    try {
      // Get the client ID first
      const clientId = await this.getClientId();
      
      // Remove existing script if present
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Load PayPal SDK
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
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
    try {
      const { data, error } = await supabase.functions.invoke('create-paypal-order', {
        body: orderData
      });

      if (error) {
        throw new Error('Failed to create PayPal order: ' + error.message);
      }

      if (!data?.orderId) {
        throw new Error('No order ID received from PayPal');
      }

      return data.orderId;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  }

  async captureOrder(orderId: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('capture-paypal-order', {
        body: { orderId }
      });

      if (error) {
        throw new Error('Failed to capture PayPal order: ' + error.message);
      }

      return data;
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      throw error;
    }
  }
}
