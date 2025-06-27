import { loadScript } from "@paypal/paypal-js";
import { supabase } from "@/integrations/supabase/client";

export interface PayPalOrderData {
  amount: string;
  currency: string;
  description: string;
  tier: string;
}

export interface PayPalSettings {
  clientId: string;
  clientSecret?: string;
  webhookId?: string;
  isProduction: boolean;
}

export class PayPalService {
  private static instance: PayPalService;
  private paypal: any = null;
  private settings: PayPalSettings | null = null;

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

      // Fetch PayPal settings from user settings
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('paypal_client_id, paypal_client_secret, paypal_webhook_id, paypal_production_mode')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!userSettings?.paypal_client_id) {
        console.error("PayPal client ID not configured in user settings");
        return false;
      }

      this.settings = {
        clientId: userSettings.paypal_client_id,
        clientSecret: userSettings.paypal_client_secret,
        webhookId: userSettings.paypal_webhook_id,
        isProduction: userSettings.paypal_production_mode || false
      };

      console.log(`PayPal ${this.settings.isProduction ? 'production' : 'sandbox'} settings loaded`);

      // Load PayPal SDK with appropriate environment
      this.paypal = await loadScript({
        clientId: this.settings.clientId,
        currency: "USD",
        intent: "capture",
        // Use production environment if configured
        ...(this.settings.isProduction && { 
          "data-environment": "production" 
        })
      });

      console.log(`PayPal SDK loaded successfully in ${this.settings.isProduction ? 'production' : 'sandbox'} mode`);
      return true;
    } catch (error) {
      console.error("Failed to initialize PayPal:", error);
      return false;
    }
  }

  async createOrder(orderData: PayPalOrderData): Promise<any> {
    if (!this.paypal || !this.settings) {
      throw new Error("PayPal not initialized");
    }

    try {
      console.log("Creating PayPal order with data:", orderData);
      
      // Use the appropriate edge function endpoint based on environment
      const functionName = this.settings.isProduction ? 
        'create-paypal-order-production' : 
        'create-paypal-order';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          amount: orderData.amount,
          currency: orderData.currency,
          description: orderData.description,
          tier: orderData.tier,
          isProduction: this.settings.isProduction
        }
      });

      if (error) {
        console.error(`Error from ${functionName} function:`, error);
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
    if (!this.settings) {
      throw new Error("PayPal not initialized");
    }

    try {
      console.log("Capturing PayPal order:", orderId);
      
      // Use the appropriate edge function endpoint based on environment
      const functionName = this.settings.isProduction ? 
        'capture-paypal-order-production' : 
        'capture-paypal-order';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { 
          orderId,
          isProduction: this.settings.isProduction 
        }
      });

      if (error) {
        console.error(`Error from ${functionName} function:`, error);
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

  getSettings() {
    return this.settings;
  }

  isProductionMode() {
    return this.settings?.isProduction || false;
  }
}
