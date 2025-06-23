
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

// Cache to avoid repeated API calls
let cachedLocationData: LocationData | null = null;
let isDetecting = false;

export const detectUserLocation = async (): Promise<LocationData> => {
  // Return cached data if available
  if (cachedLocationData) {
    return cachedLocationData;
  }

  // Prevent multiple simultaneous API calls
  if (isDetecting) {
    // Wait for ongoing detection
    while (isDetecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return cachedLocationData || getDefaultLocationData();
  }

  isDetecting = true;

  try {
    console.log('Detecting user location for pricing...');
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Location data received:', data);
    
    const locationData: LocationData = {
      country: data.country_name || "Unknown",
      countryCode: data.country_code || "US",
      currency: getCurrencyForCountry(data.country_code || "US")
    };

    cachedLocationData = locationData;
    console.log('Cached location data:', cachedLocationData);
    return locationData;
  } catch (error) {
    console.error('Error detecting location:', error);
    const defaultData = getDefaultLocationData();
    cachedLocationData = defaultData;
    return defaultData;
  } finally {
    isDetecting = false;
  }
};

const getCurrencyForCountry = (countryCode: string): CurrencyConfig => {
  switch (countryCode) {
    case 'EG': // Egypt
      return {
        symbol: 'EGP',
        code: 'EGP',
        basicPrice: 99,
        premiumPrice: 149,
        unlimitedPrice: 249
      };
    default: // Default to USD
      return {
        symbol: '$',
        code: 'USD',
        basicPrice: 2,
        premiumPrice: 3,
        unlimitedPrice: 4.99
      };
  }
};

const getDefaultLocationData = (): LocationData => ({
  country: "United States",
  countryCode: "US",
  currency: getCurrencyForCountry("US")
});

export const formatCurrency = (amount: number, currencyConfig: CurrencyConfig): string => {
  if (currencyConfig.code === 'EGP') {
    return `${currencyConfig.symbol} ${amount}`;
  }
  return `${currencyConfig.symbol}${amount.toFixed(2)}`;
};

// Legacy function for backward compatibility
export const detectUserCurrency = (): CurrencyConfig => {
  // Try to detect user's location using browser APIs first
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const userLocale = navigator.language || 'en-US';
  
  // Check if user is in Egypt based on timezone or locale
  const isEgyptUser = 
    userTimezone === 'Africa/Cairo' || 
    userLocale.toLowerCase().includes('ar-eg') ||
    userLocale.toLowerCase().includes('en-eg');

  if (isEgyptUser) {
    return getCurrencyForCountry('EG');
  }

  return getCurrencyForCountry('US');
};
