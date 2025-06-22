
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, User, Bell, Shield, CreditCard } from "lucide-react";
import UserInfoCard from "./UserInfoCard";
import PasswordChangeCard from "./PasswordChangeCard";
import GeneralSettingsCard from "./GeneralSettingsCard";
import SubscriptionCard from "./SubscriptionCard";

const UserSettings: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [userInfo, setUserInfo] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    marketingEmails: false,
    twoFactorAuth: false
  });
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSaveNotifications = async () => {
    if (!currentUserId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your settings.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: currentUserId,
          email_notifications: settings.emailNotifications,
          marketing_emails: settings.marketingEmails,
          two_factor_auth: settings.twoFactorAuth,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
        <PasswordChangeCard />
        <GeneralSettingsCard 
          emailNotifications={settings.emailNotifications}
          setEmailNotifications={(value) => setSettings(prev => ({ ...prev, emailNotifications: value }))}
        />
      </div>

      <Separator />

      {/* Subscription */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Subscription</h2>
        </div>
        <SubscriptionCard subscription={subscription} onRefreshSubscription={handleRefreshSubscription} />
      </div>

      <Separator />

      {/* Notification Preferences */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Notification Preferences</h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>
              Manage how you receive notifications from us
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="email-notifications" className="text-base">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive important updates about your account and exports
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="marketing-emails" className="text-base">
                  Marketing Emails
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive tips, updates, and promotional content
                </p>
              </div>
              <Switch
                id="marketing-emails"
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, marketingEmails: checked }))}
              />
            </div>

            <Button 
              onClick={handleSaveNotifications} 
              disabled={isLoading}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Notification Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Security Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Security</h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Security Preferences</CardTitle>
            <CardDescription>
              Additional security options for your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="two-factor-auth" className="text-base">
                  Two-Factor Authentication
                </Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account (Coming Soon)
                </p>
              </div>
              <Switch
                id="two-factor-auth"
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                disabled={true}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserSettings;
