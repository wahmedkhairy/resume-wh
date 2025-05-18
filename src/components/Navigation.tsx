
import React from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Settings,
  Download,
  Search,
  CheckCircle,
} from "lucide-react";

const Navigation = () => {
  return (
    <nav className="py-4 px-6 border-b">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Button variant="ghost" size="sm" className="flex items-center">
            <FileText className="mr-1 h-4 w-4" /> Editor
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center">
            <Search className="mr-1 h-4 w-4" /> ATS Check
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center">
            <Settings className="mr-1 h-4 w-4" /> Settings
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <CheckCircle className="mr-1 h-4 w-4 text-resume-success" /> Save
          </Button>
          <Button variant="default" size="sm" className="flex items-center">
            <Download className="mr-1 h-4 w-4" /> Export
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
