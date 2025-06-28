
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
}
