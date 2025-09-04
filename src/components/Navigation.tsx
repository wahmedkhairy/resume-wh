
import React from "react";
import { Button } from "@/components/ui/button";
import { FileEdit, Settings, BarChart3, Target, Star, Shield, ScrollText, CreditCard, UserCheck, ScanLine } from "lucide-react";

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
      id: "free-ats-scanner",
      label: "Free ATS Scanner",
      icon: ScanLine,
      description: "Free resume scan"
    },
    {
      id: "subscription",
      label: "Subscription",
      icon: CreditCard,
      description: "Pricing plans"
    },
    {
      id: "auth",
      label: "Sign In/Up",
      icon: UserCheck,
      description: "Account access"
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description: "Account & preferences"
    }
  ];

  const footerItems = [
    {
      id: "privacy-policy",
      label: "Privacy Policy",
      icon: Shield,
      description: "Data protection"
    },
    {
      id: "terms-of-service",
      label: "Terms of Service",
      icon: ScrollText,
      description: "User agreement"
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
        
        {/* Footer Items */}
        <div className="flex items-center justify-center space-x-4 py-2 border-t border-gray-200 dark:border-gray-700">
          {footerItems.map((item) => {
            const isActive = currentSection === item.id;
            const Icon = item.icon;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => onSectionChange(item.id)}
                className={`flex items-center gap-1 text-xs ${
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
