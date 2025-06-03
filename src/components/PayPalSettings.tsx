
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Eye, EyeOff } from "lucide-react";

const PayPalSettings: React.FC = () => {
  const [clientId, setClientId] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        loadPayPalSettings(user.id);
      }
    };
    
    checkUser();
  }, []);

  const loadPayPalSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('paypal_client_id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error loading PayPal settings:', error);
        return;
      }
      
      if (data?.paypal_client_id) {
        setClientId(data.paypal_client_id);
      }
    } catch (error) {
      console.log('Error loading PayPal settings:', error);
    }
  };

  const handleSave = async () => {
    if (!clientId.trim()) {
      toast({
        title: "Client ID Required",
        description: "Please enter your PayPal client ID.",
        variant: "destructive",
      });
      return;
    }

    if (!currentUserId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your PayPal settings.",
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
          paypal_client_id: clientId,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Your PayPal client ID has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving PayPal settings:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your PayPal settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          PayPal Configuration
        </CardTitle>
        <CardDescription>
          Enter your PayPal client ID to enable payment processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="paypal-client-id">PayPal Client ID</Label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                id="paypal-client-id"
                type={isVisible ? "text" : "password"}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Enter your PayPal client ID"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={toggleVisibility}
              >
                {isVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !clientId.trim()}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            To get your PayPal client ID:
          </p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Go to the PayPal Developer Dashboard</li>
            <li>Create or select your application</li>
            <li>Copy the "Client ID" from your app credentials</li>
            <li>Paste it in the field above</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-2">
            Note: Your client ID will be securely stored and used for payment processing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayPalSettings;
