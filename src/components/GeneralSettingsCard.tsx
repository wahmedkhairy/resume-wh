
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Mail, Shield } from "lucide-react";

interface GeneralSettingsCardProps {
  emailNotifications: boolean;
  setEmailNotifications: (value: boolean) => void;
}

const GeneralSettingsCard: React.FC<GeneralSettingsCardProps> = ({ 
  emailNotifications, 
  setEmailNotifications 
}) => {
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const { toast } = useToast();

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

  return (
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
  );
};

export default GeneralSettingsCard;
