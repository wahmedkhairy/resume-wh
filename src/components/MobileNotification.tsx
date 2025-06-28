
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const MobileNotification: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showMobileNotification = () => {
      // Check if notification was already shown in this session
      const notificationShown = sessionStorage.getItem('mobileNotificationShown');
      if (notificationShown) {
        return;
      }

      // Check for mobile devices
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod'];
      const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));
      const isMobileScreen = window.innerWidth <= 768;
      const isTouchDevice = 'ontouchstart' in window;
      
      const isMobile = isMobileUserAgent || isMobileScreen || isTouchDevice;
      
      if (isMobile) {
        setIsVisible(true);
        sessionStorage.setItem('mobileNotificationShown', 'true');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setIsVisible(false);
        }, 5000);
      }
    };

    // Show notification after a short delay
    const timer = setTimeout(showMobileNotification, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-4 shadow-lg animate-in slide-in-from-top duration-300">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-2 flex-1">
          <div className="text-sm font-medium">
            Better on big screens. Use a laptop or PC for a better experience.
          </div>
        </div>
        <button
          onClick={handleClose}
          className="ml-3 p-1 hover:bg-blue-700 rounded transition-colors flex-shrink-0"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default MobileNotification;
