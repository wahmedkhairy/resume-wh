
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Target, Scan, Zap, TrendingUp } from "lucide-react";

interface NavigationProps {
  onSectionChange: (section: string) => void;
  currentSection: string;
}

const Navigation: React.FC<NavigationProps> = ({ onSectionChange, currentSection }) => {
  const navItems = [
    {
      id: "editor",
      label: "Resume Editor",
      icon: <FileText className="h-4 w-4" />,
      description: "Build your professional resume"
    },
    {
      id: "fix-resume",
      label: "Fix My Resume",
      icon: <Zap className="h-4 w-4" />,
      description: "AI-powered optimization",
      badge: "Premium"
    },
    {
      id: "ats-analysis",
      label: "ATS Analysis",
      icon: <TrendingUp className="h-4 w-4" />,
      description: "Score and optimize"
    },
    {
      id: "tailored-resume",
      label: "Targeted Resume",
      icon: <Target className="h-4 w-4" />,
      description: "Job-specific optimization"
    },
    {
      id: "ats-scanner",
      label: "Free ATS Scanner",
      icon: <Scan className="h-4 w-4" />,
      description: "Upload and scan any resume"
    }
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-1 overflow-x-auto py-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentSection === item.id ? "default" : "ghost"}
              onClick={() => onSectionChange(item.id)}
              className={`flex items-center gap-2 whitespace-nowrap min-w-fit px-4 py-2 ${
                currentSection === item.id 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {item.icon}
              <div className="flex flex-col items-start">
                <span className="font-medium text-sm flex items-center gap-1">
                  {item.label}
                  {item.badge && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                      {item.badge}
                    </span>
                  )}
                </span>
                <span className="text-xs opacity-75 hidden sm:block">
                  {item.description}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
