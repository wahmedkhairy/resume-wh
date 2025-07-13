
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import UserSettings from "@/components/UserSettings";
import SitemapUploader from "@/components/SitemapUploader";
import PayPalLiveSettings from "@/components/PayPalLiveSettings";
import AdminAnalytics from "@/components/AdminAnalytics";
import AdminUserManagement from "@/components/AdminUserManagement";
import AIIntegrationTester from "@/components/AIIntegrationTester";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Settings, FileText, CreditCard, BarChart, TestTube } from "lucide-react";

const Admin = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("Starting admin auth check...");
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error getting user:", userError);
        toast({
          title: "Authentication Error",
          description: "Please sign in to access the admin panel.",
          variant: "destructive",
        });
        navigate("/auth?redirect=admin");
        return;
      }

      if (!user) {
        console.log("No user found, redirecting to auth");
        toast({
          title: "Authentication Required",
          description: "Please sign in to access the admin panel.",
          variant: "destructive",
        });
        navigate("/auth?redirect=admin");
        return;
      }

      console.log("User found:", user.email);
      setUser(user);

      // Check if user is admin using the database function
      try {
        const { data: isUserAdmin, error: adminError } = await supabase
          .rpc('is_admin');

        console.log("Admin check result:", { isUserAdmin, adminError });

        if (adminError) {
          console.error("Error checking admin status:", adminError);
          // Fallback to direct email check if RPC fails
          const isDirectAdmin = user.email === 'w.ahmedkhairy@gmail.com';
          console.log("Using fallback admin check:", isDirectAdmin);
          
          if (!isDirectAdmin) {
            toast({
              title: "Access Denied",
              description: "You don't have permission to access the admin panel.",
              variant: "destructive",
            });
            navigate("/");
            return;
          }
          setIsAdmin(true);
        } else {
          if (!isUserAdmin) {
            console.log("User is not admin, redirecting to home");
            toast({
              title: "Access Denied",
              description: "You don't have permission to access the admin panel.",
              variant: "destructive",
            });
            navigate("/");
            return;
          }
          setIsAdmin(true);
        }
      } catch (rpcError) {
        console.error("RPC call failed:", rpcError);
        // Fallback to direct email check
        const isDirectAdmin = user.email === 'w.ahmedkhairy@gmail.com';
        console.log("Using fallback admin check after RPC error:", isDirectAdmin);
        
        if (!isDirectAdmin) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin panel.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
        setIsAdmin(true);
      }

      console.log("Admin access granted");
    } catch (error) {
      console.error("Auth check error:", error);
      toast({
        title: "Error",
        description: "An error occurred while checking authentication.",
        variant: "destructive",
      });
      navigate("/auth?redirect=admin");
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

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Comprehensive platform management and user administration</p>
            <p className="text-sm text-muted-foreground mt-1">Logged in as: {user.email}</p>
          </div>

          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="ai-testing" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                AI Testing
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="paypal" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                PayPal
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

            <TabsContent value="analytics">
              <AdminAnalytics />
            </TabsContent>

            <TabsContent value="ai-testing">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    AI Integration Status
                  </CardTitle>
                  <CardDescription>
                    Monitor and test AI-powered features to ensure they are working correctly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AIIntegrationTester />
                </CardContent>
              </Card>
            </TabsContent>

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
