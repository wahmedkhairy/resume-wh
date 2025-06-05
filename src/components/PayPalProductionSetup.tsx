
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Eye, EyeOff, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";

const PayPalProductionSetup: React.FC = () => {
  const [settings, setSettings] = useState({
    clientId: "",
    clientSecret: "",
    webhookId: "",
    isProduction: false
  });
  const [isVisible, setIsVisible] = useState({
    clientSecret: false,
    webhookId: false
  });
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
        .select('paypal_client_id, paypal_client_secret, paypal_webhook_id, paypal_production_mode')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error loading PayPal settings:', error);
        return;
      }
      
      if (data) {
        setSettings({
          clientId: data.paypal_client_id || "",
          clientSecret: data.paypal_client_secret || "",
          webhookId: data.paypal_webhook_id || "",
          isProduction: data.paypal_production_mode || false
        });
      }
    } catch (error) {
      console.log('Error loading PayPal settings:', error);
    }
  };

  const handleSave = async () => {
    if (!settings.clientId.trim()) {
      toast({
        title: "Client ID Required",
        description: "Please enter your PayPal client ID.",
        variant: "destructive",
      });
      return;
    }

    if (settings.isProduction && !settings.clientSecret.trim()) {
      toast({
        title: "Client Secret Required",
        description: "Client secret is required for production mode.",
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
          paypal_client_id: settings.clientId,
          paypal_client_secret: settings.clientSecret,
          paypal_webhook_id: settings.webhookId,
          paypal_production_mode: settings.isProduction,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: `PayPal ${settings.isProduction ? 'production' : 'sandbox'} settings saved successfully.`,
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

  const toggleVisibility = (field: keyof typeof isVisible) => {
    setIsVisible(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const webhookEndpoint = `https://wjijfiwweppsxcltggna.supabase.co/functions/v1/paypal-webhook`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            PayPal Production Setup
          </CardTitle>
          <CardDescription>
            Configure your PayPal credentials for accepting real payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Environment Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="production-mode" className="text-base font-medium">
                Production Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                {settings.isProduction ? 
                  "Using live PayPal environment for real payments" : 
                  "Using PayPal sandbox for testing"
                }
              </p>
            </div>
            <Switch
              id="production-mode"
              checked={settings.isProduction}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, isProduction: checked }))}
            />
          </div>

          {settings.isProduction && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Production Mode:</strong> You are configuring live PayPal credentials. 
                Real payments will be processed and transferred to your PayPal account.
              </AlertDescription>
            </Alert>
          )}

          {/* Client ID */}
          <div className="space-y-2">
            <Label htmlFor="paypal-client-id">PayPal Client ID</Label>
            <Input
              id="paypal-client-id"
              type="text"
              value={settings.clientId}
              onChange={(e) => setSettings(prev => ({ ...prev, clientId: e.target.value }))}
              placeholder={`Enter your PayPal ${settings.isProduction ? 'live' : 'sandbox'} client ID`}
            />
          </div>

          {/* Client Secret */}
          <div className="space-y-2">
            <Label htmlFor="paypal-client-secret">
              PayPal Client Secret {settings.isProduction && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative">
              <Input
                id="paypal-client-secret"
                type={isVisible.clientSecret ? "text" : "password"}
                value={settings.clientSecret}
                onChange={(e) => setSettings(prev => ({ ...prev, clientSecret: e.target.value }))}
                placeholder={`Enter your PayPal ${settings.isProduction ? 'live' : 'sandbox'} client secret`}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => toggleVisibility('clientSecret')}
              >
                {isVisible.clientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Webhook Configuration */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-medium">Webhook Configuration</h4>
            </div>
            
            <div className="space-y-2">
              <Label>Webhook Endpoint URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={webhookEndpoint}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(webhookEndpoint)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Copy this URL and configure it in your PayPal webhook settings
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-id">Webhook ID (Optional)</Label>
              <div className="relative">
                <Input
                  id="webhook-id"
                  type={isVisible.webhookId ? "text" : "password"}
                  value={settings.webhookId}
                  onChange={(e) => setSettings(prev => ({ ...prev, webhookId: e.target.value }))}
                  placeholder="Enter your PayPal webhook ID for verification"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => toggleVisibility('webhookId')}
                >
                  {isVisible.webhookId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isLoading || !settings.clientId.trim()}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Save PayPal Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to set up your PayPal {settings.isProduction ? 'production' : 'sandbox'} environment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Step 1: PayPal Developer Account</h4>
            <p className="text-sm text-muted-foreground">
              {settings.isProduction ? 
                "Go to the PayPal Developer Dashboard and create a live app" :
                "Go to the PayPal Developer Dashboard and create a sandbox app"
              }
            </p>
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://developer.paypal.com/developer/applications/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                PayPal Developer Dashboard
              </a>
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Step 2: Configure Webhooks</h4>
            <p className="text-sm text-muted-foreground">
              Set up webhooks in your PayPal app to receive payment notifications
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Copy the webhook endpoint URL above</li>
              <li>• Add it to your PayPal app's webhook settings</li>
              <li>• Subscribe to: PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.DENIED</li>
              <li>• Copy the webhook ID back to this form (optional but recommended)</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Step 3: Business Account</h4>
            <p className="text-sm text-muted-foreground">
              {settings.isProduction ?
                "Ensure you have a verified PayPal Business account to receive payments" :
                "For testing, you can use sandbox accounts"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayPalProductionSetup;
