
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import UserInfoCard from "./UserInfoCard";
import SubscriptionCard from "./SubscriptionCard";
import GeneralSettingsCard from "./GeneralSettingsCard";
import PasswordChangeCard from "./PasswordChangeCard";

const UserSettings: React.FC = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

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
      
      <PasswordChangeCard />
      
      <SubscriptionCard 
        subscription={subscription}
        onRefreshSubscription={refreshSubscription}
      />

      <GeneralSettingsCard 
        emailNotifications={emailNotifications}
        setEmailNotifications={setEmailNotifications}
      />
    </div>
  );
};

export default UserSettings;
