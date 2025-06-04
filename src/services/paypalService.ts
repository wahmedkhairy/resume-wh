
import { loadScript } from "@paypal/paypal-js";
import { supabase } from "@/integrations/supabase/client";

export interface PayPalOrderData {
  amount: string;
  currency: string;
  description: string;
  tier: string;
}

export class PayPalService {
  private static instance: PayPalService;
  private paypal: any = null;
  private clientId: string = "";

  private constructor() {}

  public static getInstance(): PayPalService {
    if (!PayPalService.instance) {
      PayPalService.instance = new PayPalService();
    }
    return PayPalService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Fetch PayPal client ID from user settings
      const { data: settings } = await supabase
        .from('user_settings')
        .select('paypal_client_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!settings?.paypal_client_id) {
        throw new Error("PayPal client ID not configured");
      }

      this.clientId = settings.paypal_client_id;

      // Load PayPal SDK
      this.paypal = await loadScript({
        clientId: this.clientId,
        currency: "USD"
      });

      return true;
    } catch (error) {
      console.error("Failed to initialize PayPal:", error);
      return false;
    }
  }

  async createOrder(orderData: PayPalOrderData): Promise<any> {
    if (!this.paypal) {
      throw new Error("PayPal not initialized");
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-paypal-order', {
        body: {
          amount: orderData.amount,
          currency: orderData.currency,
          description: orderData.description,
          tier: orderData.tier
        }
      });

      if (error) throw error;
      return data.orderId;
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      throw error;
    }
  }

  async captureOrder(orderId: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('capture-paypal-order', {
        body: { orderId }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error capturing PayPal order:", error);
      throw error;
    }
  }

  getPayPal() {
    return this.paypal;
  }
}
