
// PayPal pricing configuration
export const getPayPalPricing = () => {
  return {
    basicPrice: 2.00,
    premiumPrice: 3.00,
    unlimitedPrice: 4.99,
    currency: 'USD'
  };
};

// Format price for PayPal display
export const formatPayPalPrice = (amount: number): string => {
  return amount.toFixed(2);
};

// Convert price to cents for PayPal API
export const convertToCents = (amount: number): number => {
  return Math.round(amount * 100);
};

// Convert cents back to dollars
export const convertFromCents = (cents: number): number => {
  return cents / 100;
};
