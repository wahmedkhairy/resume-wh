
import React from "react";
import UserSettings from "./UserSettings";

const SettingsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <UserSettings />
    </div>
  );
};

export default SettingsSection;
