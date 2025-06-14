
interface CurrencyConfig {
  symbol: string;
  code: string;
  basicPrice: number;
  premiumPrice: number;
  enterprisePrice: number;
}

export const detectUserCurrency = (): CurrencyConfig => {
  // Try to detect user's location
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const userLocale = navigator.language || 'en-US';
  
  // Check if user is in Egypt based on timezone or locale
  const isEgyptUser = 
    userTimezone === 'Africa/Cairo' || 
    userLocale.toLowerCase().includes('ar-eg') ||
    userLocale.toLowerCase().includes('en-eg');

  if (isEgyptUser) {
    return {
      symbol: 'EGP',
      code: 'EGP',
      basicPrice: 150,     // ~$5 USD equivalent
      premiumPrice: 300,   // ~$10 USD equivalent  
      enterprisePrice: 750 // ~$25 USD equivalent
    };
  }

  // Default to USD for worldwide users
  return {
    symbol: '$',
    code: 'USD',
    basicPrice: 5,
    premiumPrice: 10,
    enterprisePrice: 25
  };
};

export const formatCurrency = (amount: number, currencyConfig: CurrencyConfig): string => {
  if (currencyConfig.code === 'EGP') {
    return `${amount} ${currencyConfig.symbol}`;
  }
  return `${currencyConfig.symbol}${amount}`;
};
