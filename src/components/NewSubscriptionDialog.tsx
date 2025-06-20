
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewSubscriptionDialogProps {
  children: React.ReactNode;
}

const NewSubscriptionDialog: React.FC<NewSubscriptionDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$2',
      description: 'Perfect for getting started',
      features: [
        '2 Resume exports',
        'Basic templates',
        'ATS optimization',
        'Email support'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$6',
      description: 'Most popular choice',
      features: [
        '6 Resume exports',
        'Premium templates',
        'Advanced ATS optimization',
        'AI content suggestions',
        'Priority support'
      ],
      popular: true
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      price: '$9.9',
      description: 'For power users',
      features: [
        'Unlimited exports',
        'All premium features',
        'Custom templates',
        'Advanced analytics',
        'Phone support'
      ],
      popular: false
    }
  ];

  const handlePlanSelect = (planId: string) => {
    console.log('Plan selected:', planId);
    
    // Check PayPal configuration
    const paypalClientId = localStorage.getItem('paypal_live_client_id');
    
    if (!paypalClientId) {
      toast({
        title: "Setup Required",
        description: "Please configure PayPal settings in the admin panel first.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Redirecting to Payment",
      description: `Proceeding with ${planId} plan payment...`
    });

    // Close dialog and redirect
    setIsOpen(false);
    window.location.href = `/subscription?plan=${planId}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Your Perfect Plan
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                plan.popular ? 'border-2 border-blue-500 scale-105' : 'border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-blue-600">
                  {plan.price}
                  <span className="text-sm text-gray-500 font-normal">/month</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  Choose {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>All plans include 30-day money-back guarantee</p>
          <p>Cancel anytime • Secure payment • No hidden fees</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewSubscriptionDialog;
