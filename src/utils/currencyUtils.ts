
interface CurrencyConfig {
  symbol: string;
  code: string;
  basicPrice: number;
  premiumPrice: number;
  unlimitedPrice: number;
}

interface LocationData {
  country: string;
  countryCode: string;
  currency: CurrencyConfig;
}

const getUSDCurrency = (): CurrencyConfig => {
  return {
    symbol: '$',
    code: 'USD',
    basicPrice: 2.00,
    premiumPrice: 3.00,
    unlimitedPrice: 4.99
  };
};

const getEGPCurrency = (): CurrencyConfig => {
  return {
    symbol: 'E£',
    code: 'EGP',
    basicPrice: 49.00,
    premiumPrice: 74.00,
    unlimitedPrice: 149.00
  };
};

export const detectUserLocation = async (): Promise<LocationData> => {
  try {
    // Try to detect user location
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
      const data = await response.json();
      
      if (data.country_code === 'EG') {
        return {
          country: "Egypt",
          countryCode: "EG",
          currency: getEGPCurrency()
        };
      }
    }
  } catch (error) {
    console.error('Error detecting location:', error);
  }
  
  // Default to USD pricing
  return {
    country: "United States",
    countryCode: "US",
    currency: getUSDCurrency()
  };
};

export const formatCurrency = (amount: number, currencyConfig: CurrencyConfig): string => {
  return `${currencyConfig.symbol}${amount.toFixed(2)}`;
};

export const detectUserCurrency = (): CurrencyConfig => {
  return getUSDCurrency();
};
