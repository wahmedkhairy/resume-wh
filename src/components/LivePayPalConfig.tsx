
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Save, CheckCircle, AlertTriangle } from "lucide-react";

interface LivePayPalConfigProps {
  onClientIdSaved?: (clientId: string) => void;
}

const LivePayPalConfig: React.FC<LivePayPalConfigProps> = ({ onClientIdSaved }) => {
  const [liveClientId, setLiveClientId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved client ID from localStorage
    const savedClientId = localStorage.getItem('paypal_live_client_id');
    if (savedClientId) {
      setLiveClientId(savedClientId);
      setIsSaved(true);
    }
  }, []);

  const handleSave = async () => {
    if (!liveClientId.trim()) {
      toast({
        title: "Client ID Required",
        description: "Please enter your PayPal Live Client ID.",
        variant: "destructive",
      });
      return;
    }

    // Validate Client ID format (basic validation)
    if (!liveClientId.includes('AZaL') && !liveClientId.includes('sb')) {
      toast({
        title: "Invalid Client ID",
        description: "Please check your PayPal Client ID format.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Save to localStorage for now
      localStorage.setItem('paypal_live_client_id', liveClientId);
      setIsSaved(true);
      
      if (onClientIdSaved) {
        onClientIdSaved(liveClientId);
      }

      toast({
        title: "Configuration Saved",
        description: "Your live PayPal Client ID has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving PayPal config:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your PayPal configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Live PayPal Configuration
        </CardTitle>
        <CardDescription>
          Enter your PayPal Business Account Live Client ID to accept real payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Production Mode:</strong> This will process real payments using your PayPal Business account.
            Make sure you're using your Live Client ID, not sandbox credentials.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="live-client-id">PayPal Live Client ID</Label>
          <Input
            id="live-client-id"
            type="text"
            value={liveClientId}
            onChange={(e) => setLiveClientId(e.target.value)}
            placeholder="Enter your Live Client ID (starts with AZaL...)"
            className={isSaved ? "border-green-500 bg-green-50" : ""}
          />
          <p className="text-xs text-muted-foreground">
            You can find this in your PayPal Developer Dashboard under your live app settings
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Payment Settings:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Currency: USD (United States Dollar)</li>
            <li>• Environment: Production (Live)</li>
            <li>• Basic Plan: $2.00 USD</li>
            <li>• Premium Plan: $3.00 USD</li>
            <li>• Unlimited Plan: $4.99 USD</li>
          </ul>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isLoading || !liveClientId.trim()}
          className="w-full"
        >
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : isSaved ? "Update Configuration" : "Save Live Configuration"}
        </Button>

        {isSaved && (
          <div className="flex items-center text-sm text-green-600">
            <CheckCircle className="h-4 w-4 mr-2" />
            Live PayPal configuration is active
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LivePayPalConfig;
