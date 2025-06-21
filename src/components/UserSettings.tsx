
import React, { useState, useEffect } from "react";
import UserInfoCard from "@/components/UserInfoCard";
import PasswordChangeCard from "@/components/PasswordChangeCard";
import PasswordResetCard from "@/components/PasswordResetCard";
import GeneralSettingsCard from "@/components/GeneralSettingsCard";
import PayPalSettings from "@/components/PayPalSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const UserSettings = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserInfo(user);
        
        // Load user settings
        const { data: settings } = await supabase
          .from('user_settings')
          .select('email_notifications')
          .eq('user_id', user.id)
          .single();
          
        if (settings) {
          setEmailNotifications(settings.email_notifications || false);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserInfoUpdate = () => {
    loadUserData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            User Settings
          </CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <UserInfoCard 
            userInfo={userInfo} 
            onUserInfoUpdate={handleUserInfoUpdate} 
          />
          <PasswordChangeCard />
          <PasswordResetCard />
          <GeneralSettingsCard 
            emailNotifications={emailNotifications}
            setEmailNotifications={setEmailNotifications}
          />
          <PayPalSettings />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSettings;
