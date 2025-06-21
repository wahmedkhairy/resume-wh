
import React from "react";
import UserInfoCard from "@/components/UserInfoCard";
import PasswordChangeCard from "@/components/PasswordChangeCard";
import PasswordResetCard from "@/components/PasswordResetCard";
import GeneralSettingsCard from "@/components/GeneralSettingsCard";
import PayPalSettings from "@/components/PayPalSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

const UserSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            User Settings
          </CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <UserInfoCard />
          <PasswordChangeCard />
          <PasswordResetCard />
          <GeneralSettingsCard />
          <PayPalSettings />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSettings;
