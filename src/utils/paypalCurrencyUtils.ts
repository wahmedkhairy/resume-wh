
// PayPal-specific currency utilities for USD conversion
export interface PayPalPricing {
  currency: string;
  symbol: string;
  basicPrice: number;
  premiumPrice: number;
  unlimitedPrice: number;
}

// Convert EGP prices to USD for PayPal
const EGP_TO_USD_RATE = 0.0203; // Approximate rate: 1 EGP = $0.0203

export const getPayPalPricing = (): PayPalPricing => {
  // Always return USD pricing for PayPal
  return {
    currency: "USD",
    symbol: "$",
    basicPrice: 2.00, // Convert 100 EGP to ~$2
    premiumPrice: 3.00, // Convert 150 EGP to ~$3
    unlimitedPrice: 4.99 // Convert 250 EGP to ~$5
  };
};

export const formatPayPalPrice = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};
