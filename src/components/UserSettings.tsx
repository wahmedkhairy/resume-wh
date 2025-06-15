import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, CreditCard, History, Settings, Mail, Shield, Edit, Save, X, AlertTriangle, CheckCircle } from "lucide-react";

const UserSettings: React.FC = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [paypalSettings, setPaypalSettings] = useState<any>(null);
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

        // Load PayPal settings
        const { data: paypalData } = await supabase
          .from('user_settings')
          .select('paypal_client_id, paypal_client_secret, paypal_production_mode, paypal_webhook_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (paypalData) {
          setPaypalSettings(paypalData);
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

  const getPayPalStatus = () => {
    if (!paypalSettings?.paypal_client_id) {
      return { status: 'not_configured', color: 'destructive', icon: AlertTriangle };
    }
    
    if (paypalSettings.paypal_production_mode) {
      if (!paypalSettings.paypal_client_secret) {
        return { status: 'production_incomplete', color: 'destructive', icon: AlertTriangle };
      }
      return { status: 'production_ready', color: 'default', icon: CheckCircle };
    }
    
    return { status: 'sandbox_mode', color: 'secondary', icon: Settings };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const paypalStatus = getPayPalStatus();
  const StatusIcon = paypalStatus.icon;

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
                  <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
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

      {/* PayPal Payment Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            PayPal Payment Integration
          </CardTitle>
          <CardDescription>Configure PayPal for accepting subscription payments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <StatusIcon className={`h-5 w-5 ${paypalStatus.status === 'production_ready' ? 'text-green-600' : 
                paypalStatus.status === 'not_configured' || paypalStatus.status === 'production_incomplete' ? 'text-red-600' : 'text-yellow-600'}`} />
              <div>
                <p className="font-medium">Payment Integration Status</p>
                <p className="text-sm text-muted-foreground">
                  {paypalStatus.status === 'not_configured' && 'PayPal not configured'}
                  {paypalStatus.status === 'sandbox_mode' && 'Running in sandbox mode (testing only)'}
                  {paypalStatus.status === 'production_incomplete' && 'Production mode enabled but client secret missing'}
                  {paypalStatus.status === 'production_ready' && 'Ready for production payments'}
                </p>
              </div>
            </div>
            <Badge variant={paypalStatus.color}>
              {paypalStatus.status === 'not_configured' && 'Not Configured'}
              {paypalStatus.status === 'sandbox_mode' && 'Sandbox'}
              {paypalStatus.status === 'production_incomplete' && 'Incomplete'}
              {paypalStatus.status === 'production_ready' && 'Production Ready'}
            </Badge>
          </div>

          {paypalSettings && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Environment</label>
                <div className="mt-1">
                  <Badge variant={paypalSettings.paypal_production_mode ? 'default' : 'secondary'}>
                    {paypalSettings.paypal_production_mode ? 'Production' : 'Sandbox'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Client ID</label>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  {paypalSettings.paypal_client_id ? 
                    `${paypalSettings.paypal_client_id.substring(0, 15)}...` : 
                    'Not configured'
                  }
                </p>
              </div>
              {paypalSettings.paypal_production_mode && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Client Secret</label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {paypalSettings.paypal_client_secret ? 'Configured' : 'Missing (Required for production)'}
                  </p>
                </div>
              )}
              {paypalSettings.paypal_webhook_id && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Webhook ID</label>
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    {paypalSettings.paypal_webhook_id.substring(0, 15)}...
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/admin'}
            >
              Configure PayPal Settings
            </Button>
          </div>

          {paypalStatus.status === 'production_incomplete' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <p className="font-medium">Production Setup Incomplete</p>
              </div>
              <p className="text-sm text-red-700 mt-1">
                You have enabled production mode but haven't provided a client secret. This is required for processing real payments.
              </p>
            </div>
          )}

          {paypalStatus.status === 'sandbox_mode' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <Settings className="h-4 w-4" />
                <p className="font-medium">Sandbox Mode Active</p>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                You're currently in sandbox mode. Switch to production mode to accept real payments from customers.
              </p>
            </div>
          )}

          {paypalStatus.status === 'production_ready' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <p className="font-medium">Production Ready</p>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Your PayPal integration is configured for production and ready to accept real payments.
              </p>
            </div>
          )}
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
