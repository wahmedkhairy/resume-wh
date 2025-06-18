
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import UserInfoCard from "./UserInfoCard";
import SubscriptionCard from "./SubscriptionCard";
import GeneralSettingsCard from "./GeneralSettingsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink } from "lucide-react";

const UserSettings: React.FC = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [hasLivePayPal, setHasLivePayPal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
    checkPayPalConfig();
  }, []);

  const checkPayPalConfig = () => {
    const savedClientId = localStorage.getItem('paypal_live_client_id');
    setHasLivePayPal(!!savedClientId);
  };

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserInfo(user);
        
        // Load subscription info
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (subData) {
          setSubscription(subData);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscription = async () => {
    try {
      setIsLoading(true);
      await loadUserData();
      checkPayPalConfig();
      toast({
        title: "Refreshed",
        description: "User data has been refreshed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data.",
        variant: "destructive",
      });
    }
  };

  const handlePayPalSetup = () => {
    // Navigate to PayPal tab
    const paypalTab = document.querySelector('[value="paypal"]') as HTMLButtonElement;
    if (paypalTab) {
      paypalTab.click();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserInfoCard 
        userInfo={userInfo} 
        onUserInfoUpdate={loadUserData}
      />
      
      <SubscriptionCard 
        subscription={subscription}
        onRefreshSubscription={refreshSubscription}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Configuration
          </CardTitle>
          <CardDescription>Configure your payment processing settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Live PayPal Configuration</p>
              <p className="text-sm text-muted-foreground">
                {hasLivePayPal 
                  ? "✅ Live PayPal credentials configured" 
                  : "⚠️ Live PayPal not configured - using demo mode"
                }
              </p>
            </div>
            <Button 
              variant={hasLivePayPal ? "outline" : "default"}
              onClick={handlePayPalSetup}
              className="flex items-center gap-2"
            >
              {hasLivePayPal ? "Update" : "Setup"}
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <GeneralSettingsCard 
        emailNotifications={emailNotifications}
        setEmailNotifications={setEmailNotifications}
      />
    </div>
  );
};

export default UserSettings;
