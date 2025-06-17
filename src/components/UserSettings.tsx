
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, CreditCard, History, Settings, Mail, Shield, Edit, Save, X } from "lucide-react";

const UserSettings: React.FC = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
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
        setNewEmail(user.email || "");
        
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

  const handleEmailUpdate = async () => {
    if (!newEmail || newEmail === userInfo?.email) {
      setIsEditingEmail(false);
      return;
    }

    try {
      setIsUpdatingSettings(true);
      const { error } = await supabase.auth.updateUser({ 
        email: newEmail 
      });

      if (error) throw error;

      toast({
        title: "Email Update",
        description: "Please check your email to confirm the change.",
      });
      
      setIsEditingEmail(false);
    } catch (error) {
      console.error('Error updating email:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update email.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    try {
      setIsUpdatingSettings(true);
      setEmailNotifications(enabled);
      
      // You can store this preference in user_settings table
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            email_notifications: enabled,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      toast({
        title: "Settings Updated",
        description: `Email notifications ${enabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      });
      // Revert the change
      setEmailNotifications(!enabled);
    } finally {
      setIsUpdatingSettings(false);
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

  // Helper function to get proper badge variant for subscription status
  const getSubscriptionStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
      case 'cancelled':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
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
      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Information
          </CardTitle>
          <CardDescription>Your account details and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              {isEditingEmail ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleEmailUpdate}
                    disabled={isUpdatingSettings}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setIsEditingEmail(false);
                      setNewEmail(userInfo?.email || "");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm flex-1">{userInfo?.email}</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsEditingEmail(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Account Created</label>
              <p className="text-sm mt-1">
                {userInfo?.created_at ? new Date(userInfo.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">User ID</label>
            <p className="text-xs font-mono text-muted-foreground mt-1 break-all">
              {userInfo?.id}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Status
          </CardTitle>
          <CardDescription>Your current plan and export credits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Plan</label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="capitalize">
                    {subscription.tier}
                  </Badge>
                  <Badge variant={getSubscriptionStatusVariant(subscription.status)}>
                    {subscription.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Exports Remaining</label>
                <p className="text-lg font-semibold text-green-600 mt-1">
                  {subscription.tier === 'unlimited' ? '∞' : subscription.scan_count || 0}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Credits</label>
                <p className="text-sm mt-1">
                  {subscription.tier === 'unlimited' ? 'Unlimited' : subscription.max_scans || 0}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No active subscription found.</p>
          )}
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={refreshSubscription}>
              Refresh Subscription Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>Account preferences and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates about your account</p>
              </div>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={handleNotificationToggle}
              disabled={isUpdatingSettings}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Account Security</p>
                <p className="text-sm text-muted-foreground">Manage your password and security settings</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                toast({
                  title: "Feature Coming Soon",
                  description: "Advanced security settings will be available in a future update.",
                });
              }}
            >
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSettings;
