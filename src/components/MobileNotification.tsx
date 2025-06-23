
import React, { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { X } from "lucide-react";

const MobileNotification: React.FC = () => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setIsVisible(true);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  if (!isMobile || !isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-3 shadow-lg">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <p className="text-sm font-medium">
          Better on big screens. Use a laptop or PC for a better experience.
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 p-1 hover:bg-blue-700 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default MobileNotification;
