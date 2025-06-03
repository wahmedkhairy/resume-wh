
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  leftPanel, 
  rightPanel 
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col space-y-4">
        {children}
        <div className="space-y-6">
          {leftPanel}
        </div>
        <div className="space-y-6">
          {rightPanel}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {children}
      <div className="lg:col-span-6 space-y-6">
        {leftPanel}
      </div>
      <div className="lg:col-span-6 space-y-6">
        {rightPanel}
      </div>
    </div>
  );
};

export default ResponsiveLayout;
