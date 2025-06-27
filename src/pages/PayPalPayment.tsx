
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import PayPalSmartButtons from '@/components/PayPalSmartButtons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PayPalPayment = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("2.00");

  const handlePaymentSuccess = (details: any) => {
    console.log('Payment completed successfully:', details);
    // You can add additional success handling here
    // For example, redirect to a success page or update user subscription
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment failed:', error);
    // You can add additional error handling here
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">PayPal Payment</CardTitle>
              <p className="text-gray-600">
                Complete your payment securely with PayPal
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Amount:</span>
                  <span className="text-xl font-bold text-blue-600">${amount} USD</span>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  One-time payment • Secure checkout with PayPal
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Payment Method</h3>
                <PayPalSmartButtons
                  amount={amount}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">What you get:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Secure payment processing</li>
                  <li>• Instant payment confirmation</li>
                  <li>• Email receipt</li>
                  <li>• PayPal buyer protection</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PayPalPayment;
