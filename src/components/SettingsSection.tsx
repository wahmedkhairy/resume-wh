
import React from "react";
import UserSettings from "./UserSettings";
import AIIntegrationTester from "./AIIntegrationTester";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SettingsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Settings & Tools</h1>
        <p className="text-muted-foreground">Manage your account settings and test AI features</p>
      </div>

      <Tabs defaultValue="user-settings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="user-settings">User Settings</TabsTrigger>
          <TabsTrigger value="ai-testing">AI Testing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="user-settings" className="space-y-6">
          <UserSettings />
        </TabsContent>
        
        <TabsContent value="ai-testing" className="space-y-6">
          <AIIntegrationTester />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsSection;
