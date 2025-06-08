
import React from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Settings,
  Search,
} from "lucide-react";

interface NavigationProps {
  onSectionChange?: (section: string) => void;
  currentSection?: string;
}

const Navigation: React.FC<NavigationProps> = ({ onSectionChange, currentSection = "editor" }) => {
  const handleSectionClick = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  return (
    <nav className="py-4 px-6 border-b">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Button 
            variant={currentSection === "editor" ? "default" : "ghost"} 
            size="sm" 
            className="flex items-center"
            onClick={() => handleSectionClick("editor")}
          >
            <FileText className="mr-1 h-4 w-4" /> Editor
          </Button>
          <Button 
            variant={currentSection === "ats" ? "default" : "ghost"} 
            size="sm" 
            className="flex items-center"
            onClick={() => handleSectionClick("ats")}
          >
            <Search className="mr-1 h-4 w-4" /> ATS Check
          </Button>
          <Button 
            variant={currentSection === "settings" ? "default" : "ghost"} 
            size="sm" 
            className="flex items-center"
            onClick={() => handleSectionClick("settings")}
          >
            <Settings className="mr-1 h-4 w-4" /> Settings
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
