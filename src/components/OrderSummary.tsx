
import React from "react";

interface OrderSummaryProps {
  selectedTier: string;
  amount: number;
  symbol: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  selectedTier,
  amount,
  symbol
}) => {
  return (
    <div className="text-center p-4 bg-muted rounded-lg">
      <h3 className="font-semibold capitalize">{selectedTier} Plan</h3>
      <p className="text-2xl font-bold">{symbol}{amount}</p>
      <p className="text-sm text-muted-foreground">One-time payment for export credits</p>
    </div>
  );
};

export default OrderSummary;
