
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import UserSettings from "@/components/UserSettings";
import SitemapUploader from "@/components/SitemapUploader";
import PayPalLiveSettings from "@/components/PayPalLiveSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Settings, FileText, CreditCard } from "lucide-react";

const Admin = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access the admin panel.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      setUser(user);
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/auth");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Manage your account settings and application configuration</p>
          </div>

          <Tabs defaultValue="settings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                User Settings
              </TabsTrigger>
              <TabsTrigger value="paypal" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                PayPal Setup
              </TabsTrigger>
              <TabsTrigger value="sitemap" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Sitemap
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings">
              <UserSettings />
            </TabsContent>

            <TabsContent value="paypal">
              <PayPalLiveSettings />
            </TabsContent>

            <TabsContent value="sitemap">
              <SitemapUploader />
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Advanced security and authentication settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Additional security features will be available in future updates.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;
