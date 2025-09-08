
import React from "react";
import { Button } from "@/components/ui/button";
import { FileEdit, Settings, BarChart3, Target, Star } from "lucide-react";

interface NavigationProps {
  onSectionChange: (section: string) => void;
  currentSection: string;
}

const Navigation: React.FC<NavigationProps> = ({ onSectionChange, currentSection }) => {
  const navigationItems = [
    {
      id: "editor",
      label: "Resume Editor",
      icon: FileEdit,
      description: "Build your resume"
    },
    {
      id: "ats",
      label: "ATS Analysis",
      icon: BarChart3,
      description: "Optimize for ATS"
    },
    {
      id: "tailor",
      label: "Targeted Job Resume",
      icon: Target,
      description: "Customize for jobs"
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description: "Account & preferences"
    }
  ];


  return (
    <nav className="border-b bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center space-x-1 overflow-x-auto py-4">
          {navigationItems.map((item) => {
            const isActive = currentSection === item.id;
            const Icon = item.icon;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                onClick={() => onSectionChange(item.id)}
                className={`flex items-center gap-2 whitespace-nowrap ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            );
          })}
          
          {/* Success Stories button */}
          <Button
            variant={currentSection === "success-stories" ? "default" : "ghost"}
            onClick={() => onSectionChange("success-stories")}
            className={`flex items-center gap-2 whitespace-nowrap ${
              currentSection === "success-stories"
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Success Stories</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
