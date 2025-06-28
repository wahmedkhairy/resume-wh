
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

// Simplified to only support USD
const getUSDCurrency = (): CurrencyConfig => {
  return {
    symbol: '$',
    code: 'USD',
    basicPrice: 2.00,
    premiumPrice: 3.00,
    unlimitedPrice: 4.99
  };
};

export const detectUserLocation = async (): Promise<LocationData> => {
  // Always return USD pricing
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
