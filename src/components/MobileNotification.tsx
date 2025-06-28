
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const MobileNotification: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkAndShowMobileNotification = () => {
      console.log('🔍 Starting mobile notification check...');
      
      // Check for mobile devices using multiple methods
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
      const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));
      const isMobileScreen = window.innerWidth <= 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // More aggressive mobile detection
      const isMobile = isMobileUserAgent || isMobileScreen || isTouchDevice;
      
      console.log('📱 Mobile detection results:', {
        userAgent: userAgent,
        isMobileUserAgent,
        isMobileScreen,
        isTouchDevice,
        finalIsMobile: isMobile,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight
      });
      
      // Check if notification was already shown in this session
      const notificationShown = sessionStorage.getItem('mobileNotificationShown');
      console.log('💾 Session storage check:', { notificationShown });
      
      if (isMobile && !notificationShown) {
        console.log('✅ Showing mobile notification');
        setIsVisible(true);
        sessionStorage.setItem('mobileNotificationShown', 'true');
        
        // Auto-hide after 8 seconds (increased from 6)
        setTimeout(() => {
          console.log('⏰ Auto-hiding mobile notification');
          setIsVisible(false);
        }, 8000);
      } else {
        console.log('❌ Not showing mobile notification:', {
          isMobile,
          alreadyShown: !!notificationShown
        });
      }
    };

    // Initial check with a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      console.log('🚀 Running initial mobile notification check');
      checkAndShowMobileNotification();
    }, 100);

    // Listen for resize events to handle orientation changes
    const handleResize = () => {
      console.log('📏 Window resized, checking mobile notification again');
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
  }, [isVisible]);

  const handleClose = () => {
    console.log('👆 Mobile notification closed by user');
    setIsVisible(false);
  };

  // Force show for testing - remove this in production
  const isTestMode = window.innerWidth <= 768;
  
  console.log('🎨 Rendering MobileNotification:', { isVisible, isTestMode });

  if (!isVisible && !isTestMode) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-4 shadow-lg">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-2 flex-1">
          <div className="text-sm font-medium">
            📱 Better on big screens. Use a laptop or PC for a better experience.
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
