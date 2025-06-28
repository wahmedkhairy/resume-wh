
// Simple PayPal pricing configuration - USD only
export const getPayPalPricing = () => {
  return {
    basicPrice: 2.00,
    premiumPrice: 3.00,
    unlimitedPrice: 4.99,
    currency: 'USD'
  };
};

export const formatPayPalPrice = (amount: number): string => {
  return amount.toFixed(2);
};
