
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, CreditCard, LogIn, UserPlus } from "lucide-react";
import LiveSubscriptionDialog from "./LiveSubscriptionDialog";
import ErrorBoundary from "./ErrorBoundary";

const Header = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/auth");
  };

  const handleSignUp = () => {
    navigate("/auth");
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileText className="h-8 w-8 text-resume-primary" />
          <span className="text-xl font-bold">
            Resume<span className="text-resume-primary"> Builder</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            onClick={handleSignIn}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            className="flex items-center"
            onClick={handleSignUp}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Sign Up
          </Button>
          
          <ErrorBoundary fallback={
            <Button variant="default" size="sm" disabled>
              <CreditCard className="mr-2 h-4 w-4" />
              Upgrade
            </Button>
          }>
            <LiveSubscriptionDialog>
              <Button variant="default" size="sm" className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                Upgrade
              </Button>
            </LiveSubscriptionDialog>
          </ErrorBoundary>
        </div>
      </div>
    </header>
  );
};

export default Header;
