
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const MobileNotification: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check for mobile devices using user agent and screen size
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
      const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));
      const isMobileScreen = window.innerWidth <= 768;
      
      return isMobileUserAgent || isMobileScreen;
    };

    const handleResize = () => {
      const mobileStatus = checkMobile();
      setIsMobile(mobileStatus);
    };

    // Initial check
    const mobileStatus = checkMobile();
    setIsMobile(mobileStatus);
    
    // Check if notification was already shown in this session
    const notificationShown = sessionStorage.getItem('mobileNotificationShown');
    
    if (mobileStatus && !notificationShown) {
      setIsVisible(true);
      sessionStorage.setItem('mobileNotificationShown', 'true');
    }
    
    // Listen for resize events but don't affect visibility
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Separate useEffect for auto-hide timer
  useEffect(() => {
    if (isMobile && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isMobile, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isMobile || !isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-3 shadow-lg">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <p className="text-sm font-medium">
          Better on big screens. Use a laptop or PC for a better experience.
        </p>
        <button
          onClick={handleClose}
          className="ml-2 p-1 hover:bg-blue-700 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default MobileNotification;
