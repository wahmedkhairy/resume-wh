
import React from "react";
import UserSettings from "@/components/UserSettings";

const SettingsSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-12">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Settings</h2>
          <UserSettings />
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;
