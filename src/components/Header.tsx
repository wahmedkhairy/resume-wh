
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, CreditCard, LogIn, UserPlus } from "lucide-react";
import LiveSubscriptionDialog from "@/components/LiveSubscriptionDialog";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check current auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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
          {!user && (
            <>
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
            </>
          )}
          
          <LiveSubscriptionDialog>
            <Button 
              variant="default" 
              size="sm" 
              className="flex items-center bg-blue-600 hover:bg-blue-700"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Upgrade
            </Button>
          </LiveSubscriptionDialog>
        </div>
      </div>
    </header>
  );
};

export default Header;
