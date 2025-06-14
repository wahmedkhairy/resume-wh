
import React, { useEffect, useState } from "react";
import { detectUserCurrency, formatCurrency } from "@/utils/currencyUtils";

interface OrderSummaryProps {
  selectedTier: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  selectedTier
}) => {
  const [currencyConfig, setCurrencyConfig] = useState(detectUserCurrency());

  useEffect(() => {
    setCurrencyConfig(detectUserCurrency());
  }, []);

  const getPriceForTier = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'basic':
        return currencyConfig.basicPrice;
      case 'premium':
        return currencyConfig.premiumPrice;
      case 'enterprise':
        return currencyConfig.enterprisePrice;
      default:
        return currencyConfig.basicPrice;
    }
  };

  const amount = getPriceForTier(selectedTier);
  const formattedPrice = formatCurrency(amount, currencyConfig);

  return (
    <div className="text-center p-4 bg-muted rounded-lg">
      <h3 className="font-semibold capitalize">{selectedTier} Plan</h3>
      <p className="text-2xl font-bold">{formattedPrice}</p>
      <p className="text-sm text-muted-foreground">One-time payment for export credits</p>
      <p className="text-xs text-muted-foreground mt-1">
        Currency: {currencyConfig.code}
      </p>
    </div>
  );
};

export default OrderSummary;
