
import { loadScript } from "@paypal/paypal-js";

export interface LivePayPalOrderData {
  amount: string;
  currency: string;
  description: string;
  tier: string;
}

export class LivePayPalService {
  private static instance: LivePayPalService;
  private paypal: any = null;
  private clientId: string = "";
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): LivePayPalService {
    if (!LivePayPalService.instance) {
      LivePayPalService.instance = new LivePayPalService();
    }
    return LivePayPalService.instance;
  }

  async initialize(liveClientId: string): Promise<boolean> {
    try {
      if (this.isInitialized && this.clientId === liveClientId) {
        return true;
      }

      this.clientId = liveClientId;
      
      console.log('Initializing Live PayPal with Client ID:', liveClientId.substring(0, 10) + '...');

      // Load PayPal SDK with live environment
      this.paypal = await loadScript({
        clientId: liveClientId,
        currency: "USD",
        intent: "capture",
        "data-environment": "production" // Use production environment
      });

      this.isInitialized = true;
      console.log('Live PayPal SDK loaded successfully');
      return true;
    } catch (error) {
      console.error("Failed to initialize Live PayPal:", error);
      this.isInitialized = false;
      return false;
    }
  }

  async createOrder(orderData: LivePayPalOrderData): Promise<string> {
    if (!this.paypal || !this.isInitialized) {
      throw new Error("Live PayPal not initialized");
    }

    try {
      console.log("Creating live PayPal order:", orderData);
      
      // Create order using PayPal SDK
      const orderId = await this.paypal.Buttons.createOrder({
        purchase_units: [{
          amount: {
            currency_code: orderData.currency,
            value: orderData.amount
          },
          description: orderData.description,
          custom_id: orderData.tier
        }],
        application_context: {
          return_url: `${window.location.origin}/payment-success`,
          cancel_url: `${window.location.origin}/payment-cancelled`
        }
      });
      
      console.log("Live PayPal order created:", orderId);
      return orderId;
    } catch (error) {
      console.error("Error creating live PayPal order:", error);
      throw error;
    }
  }

  getPayPal() {
    return this.paypal;
  }

  isLiveMode() {
    return true; // Always true for live service
  }

  getClientId() {
    return this.clientId;
  }
}
