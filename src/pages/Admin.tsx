
import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import UserSettings from "@/components/UserSettings";
import SitemapUploader from "@/components/SitemapUploader";

import AdminAnalytics from "@/components/AdminAnalytics";
import AdminUserManagement from "@/components/AdminUserManagement";
import AIIntegrationTester from "@/components/AIIntegrationTester";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, FileText, BarChart, TestTube, Users } from "lucide-react";
import { useAdminCheck } from "@/hooks/useAdminCheck";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading } = useAdminCheck();

  // The AdminRoute wrapper handles all the authentication and authorization logic
  // This component only renders when the user is authenticated and authorized

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Comprehensive platform management and user administration</p>
            {user && <p className="text-sm text-muted-foreground mt-1">Logged in as: {user.email}</p>}
          </div>

          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="ai-testing" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                AI Testing
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="sitemap" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Sitemap
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics">
              <AdminAnalytics />
            </TabsContent>

            <TabsContent value="users">
              <AdminUserManagement />
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


            <TabsContent value="sitemap">
              <SitemapUploader />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;
