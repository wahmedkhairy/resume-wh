
import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Star } from "lucide-react";

const Header = () => {
  const { toast } = useToast();

  const handleUpgradeClick = () => {
    toast({
      title: "Subscription Required",
      description: "Please subscribe to unlock all features.",
      variant: "default"
    });
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileText className="h-8 w-8 text-resume-primary" />
          <span className="text-xl font-bold">
            Resume<span className="text-resume-primary">Master</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleUpgradeClick}>
            <Star className="mr-1 h-4 w-4 text-resume-warning" /> Free Trial
          </Button>
          <Button variant="default" size="sm" onClick={handleUpgradeClick}>
            Upgrade to Pro
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
