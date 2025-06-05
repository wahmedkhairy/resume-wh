
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, CreditCard, History, Settings } from "lucide-react";

const UserSettings: React.FC = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [exportHistory, setExportHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
          .single();
        
        if (subData) {
          setSubscription(subData);
        }
        
        // Load export history (you can create this table later)
        // const { data: historyData } = await supabase
        //   .from('export_history')
        //   .select('*')
        //   .eq('user_id', user.id)
        //   .order('created_at', { ascending: false });
        
        // if (historyData) {
        //   setExportHistory(historyData);
        // }
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
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{userInfo?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Account Created</label>
              <p className="text-sm">{userInfo?.created_at ? new Date(userInfo.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
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
                <div className="flex items-center gap-2">
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
                <p className="text-lg font-semibold text-green-600">
                  {subscription.scan_count || 0}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Credits</label>
                <p className="text-sm">
                  {subscription.max_scans || 0}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No active subscription found.</p>
          )}
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Export History
          </CardTitle>
          <CardDescription>Your recent resume exports</CardDescription>
        </CardHeader>
        <CardContent>
          {exportHistory.length > 0 ? (
            <div className="space-y-2">
              {exportHistory.map((export_item, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">{export_item.filename || 'Resume Export'}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(export_item.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No export history available.</p>
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
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive updates about your account</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Privacy Settings</p>
              <p className="text-sm text-muted-foreground">Control your data and privacy</p>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSettings;
