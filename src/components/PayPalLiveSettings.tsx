
import React from "react";
import LivePayPalConfig from "./LivePayPalConfig";

const PayPalLiveSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">PayPal Live Configuration</h2>
        <p className="text-muted-foreground">
          Set up your live PayPal credentials to accept real payments in USD
        </p>
      </div>
      
      <LivePayPalConfig />
      
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-3">Getting Your Live Client ID</h3>
        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
          <li>Log into your PayPal Developer Dashboard</li>
          <li>Navigate to "My Apps & Credentials"</li>
          <li>Under "Live" section, click "Create App"</li>
          <li>Choose your business account and create the app</li>
          <li>Copy the "Client ID" from the live app details</li>
          <li>Paste it in the configuration above</li>
        </ol>
        <div className="mt-4">
          <a 
            href="https://developer.paypal.com/developer/applications/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            → Open PayPal Developer Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default PayPalLiveSettings;
