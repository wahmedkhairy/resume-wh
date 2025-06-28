
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const MobileNotification: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkAndShowMobileNotification = () => {
      // Check for mobile devices using multiple methods
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
      const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));
      const isMobileScreen = window.innerWidth <= 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      const isMobile = isMobileUserAgent || (isMobileScreen && isTouchDevice);
      
      console.log('Mobile detection:', {
        userAgent: userAgent,
        isMobileUserAgent,
        isMobileScreen,
        isTouchDevice,
        finalIsMobile: isMobile,
        screenWidth: window.innerWidth
      });
      
      // Check if notification was already shown in this session
      const notificationShown = sessionStorage.getItem('mobileNotificationShown');
      
      if (isMobile && !notificationShown) {
        console.log('Showing mobile notification');
        setIsVisible(true);
        sessionStorage.setItem('mobileNotificationShown', 'true');
        
        // Auto-hide after 6 seconds
        setTimeout(() => {
          setIsVisible(false);
        }, 6000);
      }
    };

    // Initial check with a small delay to ensure DOM is ready
    const timer = setTimeout(checkAndShowMobileNotification, 500);

    // Listen for resize events to handle orientation changes
    const handleResize = () => {
      // Only check if notification isn't already visible
      if (!isVisible) {
        const notificationShown = sessionStorage.getItem('mobileNotificationShown');
        if (!notificationShown && window.innerWidth <= 768) {
          checkAndShowMobileNotification();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleClose = () => {
    console.log('Mobile notification closed by user');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-3 shadow-lg animate-in slide-in-from-top duration-300">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium">
            📱 Better on big screens. Use a laptop or PC for a better experience.
          </div>
        </div>
        <button
          onClick={handleClose}
          className="ml-2 p-1 hover:bg-blue-700 rounded transition-colors"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default MobileNotification;
