

import { useEffect, useState } from "react";

type Country = {
  country_code: string;
};

type PlanId = "basic" | "premium" | "unlimited";

export default function SubscriptionPage() {
  const [isEgypt, setIsEgypt] = useState(false);

  useEffect(() => {
    // Detect country via IP geolocation
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then((data: Country) => {
        setIsEgypt(data.country_code === "EG");
      })
      .catch(err => console.error("Geo lookup failed:", err));
  }, []);

  useEffect(() => {
    const sdk = document.createElement("script");
    const clientId = "ATW52HhFLL9GSuqaUlDiXLhjc6puky0HqmKdmPGAhYRFcdZIu9qV5XowN4wT1td5GgwpQFgQvcq069V2";
    const currency = isEgypt ? "EGP" : "USD";

    sdk.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
    sdk.onload = () => {
      if ((window as any).paypal) {
        const plans = [
          { id: "basic", amount: isEgypt ? "99" : "2.00", label: "Basic" },
          { id: "premium", amount: isEgypt ? "149" : "3.00", label: "Premium" },
          { id: "unlimited", amount: isEgypt ? "249" : "4.99", label: "Unlimited" }
        ];

        plans.forEach(plan => {
          (window as any).paypal.Buttons({
            createOrder: (_: any, actions: any) => {
              return actions.order.create({
                purchase_units: [{
                  amount: { value: plan.amount },
                  currency_code: currency,
                  description: `${plan.label} Plan`
                }]
              });
            },
            onApprove: (_: any, actions: any) => {
              return actions.order.capture().then((details: any) => {
                alert(`Payment successful for ${plan.label} (${currency} ${plan.amount}). Thank you, ${details.payer.name.given_name}!`);
              });
            },
            onError: (err: any) => {
              console.error(`PayPal error on ${plan.label}:`, err);
              alert(`Payment failed for ${plan.label}; please try again.`);
            }
          }).render(`#paypal-button-container-${plan.id}`);
        });
      } else {
        alert("PayPal SDK failed to load.");
      }
    };
    sdk.onerror = () => alert("Failed to load PayPal SDK.");
    document.head.appendChild(sdk);

    return () => {
      document.head.removeChild(sdk);
    };
  }, [isEgypt]);

  const planPricing = {
    basic: isEgypt ? "99 EGP" : "$2.00",
    premium: isEgypt ? "149 EGP" : "$3.00", 
    unlimited: isEgypt ? "249 EGP" : "$4.99"
  };

  return (
    <div className="subscription-page">
      <h2>Choose Your Plan</h2>
      <p>You're browsing from {isEgypt ? "Egypt (EGP pricing)" : "outside Egypt (USD pricing)"}</p>

      <div style={{ marginTop: "30px" }}>
        {(["basic", "premium", "unlimited"] as PlanId[]).map(planId => (
          <div key={planId} style={{ marginTop: planId !== "basic" ? "40px" : "0" }}>
            <h3>
              {planId.charAt(0).toUpperCase() + planId.slice(1)} Plan – 
              {planPricing[planId]}
            </h3>
            <div id={`paypal-button-container-${planId}`}></div>
          </div>
        ))}
      </div>
    </div>
  );
}

