
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
        console.error("User not authenticated");
        return false;
      }

      // Fetch PayPal client ID from user settings
      const { data: settings } = await supabase
        .from('user_settings')
        .select('paypal_client_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!settings?.paypal_client_id) {
        console.error("PayPal client ID not configured in user settings");
        return false;
      }

      this.clientId = settings.paypal_client_id;
      console.log("PayPal client ID loaded successfully");

      // Load PayPal SDK
      this.paypal = await loadScript({
        clientId: this.clientId,
        currency: "USD"
      });

      console.log("PayPal SDK loaded successfully");
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
      console.log("Creating PayPal order with data:", orderData);
      
      const { data, error } = await supabase.functions.invoke('create-paypal-order', {
        body: {
          amount: orderData.amount,
          currency: orderData.currency,
          description: orderData.description,
          tier: orderData.tier
        }
      });

      if (error) {
        console.error("Error from create-paypal-order function:", error);
        throw error;
      }
      
      console.log("PayPal order created successfully:", data);
      return data.orderId;
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      throw error;
    }
  }

  async captureOrder(orderId: string): Promise<any> {
    try {
      console.log("Capturing PayPal order:", orderId);
      
      const { data, error } = await supabase.functions.invoke('capture-paypal-order', {
        body: { orderId }
      });

      if (error) {
        console.error("Error from capture-paypal-order function:", error);
        throw error;
      }
      
      console.log("PayPal order captured successfully:", data);
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
