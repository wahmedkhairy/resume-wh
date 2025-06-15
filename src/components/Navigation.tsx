import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Settings, Target, Sparkles } from "lucide-react";

interface NavigationProps {
  onSectionChange: (section: string) => void;
  currentSection: string;
}

const Navigation: React.FC<NavigationProps> = ({ onSectionChange, currentSection }) => {
  const navItems = [
    {
      id: "editor",
      label: "Resume Editor",
      icon: FileText,
      description: "Edit your resume content"
    },
    {
      id: "tailor",
      label: "Targeted Job Resume",
      icon: Sparkles,
      description: "Generate job-specific versions"
    },
    {
      id: "ats",
      label: "ATS Scan",
      icon: Target,
      description: "Check ATS compatibility"
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description: "Account and preferences"
    }
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-1 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                onClick={() => onSectionChange(item.id)}
                className={`flex items-center gap-2 ${isActive ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
