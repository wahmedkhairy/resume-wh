
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, User, CreditCard } from "lucide-react";
import UserInfoCard from "./UserInfoCard";
import PasswordChangeCard from "./PasswordChangeCard";

const UserSettings: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [userInfo, setUserInfo] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    marketingEmails: false,
    twoFactorAuth: false
  });
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        setUserInfo(user);
        loadUserSettings(user.id);
        loadSubscription(user.id);
      }
    };
    
    checkUser();
  }, []);

  const loadUserSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('email_notifications, marketing_emails, two_factor_auth')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error loading user settings:', error);
        return;
      }
      
      if (data) {
        setSettings({
          emailNotifications: data.email_notifications ?? true,
          marketingEmails: data.marketing_emails ?? false,
          twoFactorAuth: data.two_factor_auth ?? false
        });
      }
    } catch (error) {
      console.log('Error loading user settings:', error);
    }
  };

  const loadSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error loading subscription:', error);
        return;
      }
      
      setSubscription(data);
    } catch (error) {
      console.log('Error loading subscription:', error);
    }
  };

  const handleUserInfoUpdate = () => {
    // Refresh user data when updated
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserInfo(user);
      }
    };
    checkUser();
  };

  const handleRefreshSubscription = () => {
    if (currentUserId) {
      loadSubscription(currentUserId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Account Information</h2>
        </div>
        <UserInfoCard userInfo={userInfo} onUserInfoUpdate={handleUserInfoUpdate} />
      </div>

      <Separator />

      {/* Subscription Status */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Subscription Status</h2>
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {subscription?.scan_count || 0} exports remaining
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Password Change */}
      <div className="space-y-4">
        <PasswordChangeCard />
      </div>
    </div>
  );
};

export default UserSettings;
