export interface LivePayPalOrderData {
  amount: string;
  currency: string;
  description: string;
  tier: string;
}

export interface LivePayPalSettings {
  clientId: string;
  clientSecret?: string;
  webhookId?: string;
  isProduction: boolean;
}

export class LivePayPalService {
  private static instance: LivePayPalService;
  private paypal: any = null;
  private settings: LivePayPalSettings | null = null;

  private constructor() {}

  public static getInstance(): LivePayPalService {
    if (!LivePayPalService.instance) {
      LivePayPalService.instance = new LivePayPalService();
    }
    return LivePayPalService.instance;
  }

  async initialize(liveClientId: string): Promise<boolean> {
    try {
      this.settings = {
        clientId: liveClientId,
        isProduction: true
      };

      console.log('Live PayPal production settings loaded');
      return true;
    } catch (error) {
      console.error("Failed to initialize Live PayPal:", error);
      return false;
    }
  }

  getSettings() {
    return this.settings;
  }

  isProductionMode() {
    return this.settings?.isProduction || false;
  }
}
