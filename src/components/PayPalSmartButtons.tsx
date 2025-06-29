
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PayPalSmartButtonsProps {
  amount: string;
  onSuccess?: (details: any) => void;
  onError?: (error: any) => void;
}

const PayPalSmartButtons: React.FC<PayPalSmartButtonsProps> = ({
  amount = "2.00",
  onSuccess,
  onError
}) => {
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const { toast } = useToast();
  const mountedRef = useRef(true);

  const addDebugLog = (message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    mountedRef.current = true;
    addDebugLog('🚀 Component mounted, starting PayPal initialization');
    
    const liveClientId = 'AWiv-6cjprQeRqz07LMIvHDtAJ22f6BVGcpgQHXMT0n2zJ8CFAtgzMT4_v-bhLWmdswIp2E9ExU1NX5E';

    const checkContainer = () => {
      const container = paypalContainerRef.current;
      addDebugLog(`📦 Container check: ${container ? 'EXISTS' : 'NULL'}`);
      
      if (container) {
        const rect = container.getBoundingClientRect();
        addDebugLog(`📏 Container dimensions: ${rect.width}x${rect.height}`);
        addDebugLog(`👁️ Container visible: ${rect.width > 0 && rect.height > 0}`);
        addDebugLog(`🎯 Container ID: ${container.id}`);
        addDebugLog(`🏷️ Container classes: ${container.className}`);
        
        // Check if container is in the DOM
        const inDOM = document.contains(container);
        addDebugLog(`🌐 Container in DOM: ${inDOM}`);
        
        // Check computed styles
        const computedStyle = window.getComputedStyle(container);
        addDebugLog(`👀 Display: ${computedStyle.display}, Visibility: ${computedStyle.visibility}`);
      }
      
      return container;
    };

    const initializePayPalButtons = (retryCount = 0) => {
      addDebugLog(`🔄 Initializing PayPal buttons (attempt ${retryCount + 1})`);
      
      if (!mountedRef.current) {
        addDebugLog('❌ Component unmounted, aborting');
        return;
      }

      // Check PayPal SDK
      const paypalSDK = (window as any).paypal;
      addDebugLog(`💳 PayPal SDK available: ${!!paypalSDK}`);
      
      if (!paypalSDK) {
        if (retryCount < 10) {
          addDebugLog(`⏳ PayPal SDK not ready, retrying in 200ms...`);
          setTimeout(() => initializePayPalButtons(retryCount + 1), 200);
        } else {
          addDebugLog('❌ PayPal SDK failed to load after 10 attempts');
          setIsLoading(false);
        }
        return;
      }

      // Check container
      const container = checkContainer();
      if (!container) {
        if (retryCount < 10) {
          addDebugLog(`⏳ Container not ready, retrying in 200ms...`);
          setTimeout(() => initializePayPalButtons(retryCount + 1), 200);
        } else {
          addDebugLog('❌ Container not available after 10 attempts');
          setIsLoading(false);
        }
        return;
      }

      try {
        addDebugLog('🧹 Clearing container content');
        container.innerHTML = '';
        
        addDebugLog('🏗️ Creating PayPal buttons');
        
        const buttonConfig = {
          createOrder: (_data: any, actions: any) => {
            addDebugLog('💰 Creating order');
            return actions.order.create({
              purchase_units: [{
                amount: {
                  currency_code: "USD",
                  value: amount
                }
              }]
            });
          },
          onApprove: (_data: any, actions: any) => {
            addDebugLog('✅ Payment approved, capturing...');
            return actions.order.capture().then((details: any) => {
              addDebugLog('💳 Payment captured successfully');
              
              if (!mountedRef.current) return;

              toast({
                title: "Payment Successful!",
                description: `Transaction completed by ${details.payer.name.given_name}`,
              });

              const paymentData = {
                name: details.payer.name.given_name,
                amount: details.purchase_units[0].amount.value,
                payment_id: details.id,
                payer_email: details.payer.email_address,
                transaction_id: details.purchase_units[0].payments.captures[0].id
              };

              fetch(`https://wjijfiwweppsxcltggna.functions.supabase.co/store-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(paymentData)
              })
              .then(res => res.text())
              .then(msg => {
                addDebugLog("📝 Payment saved to database");
                if (mountedRef.current) {
                  toast({
                    title: "Payment Saved",
                    description: "Payment information saved successfully."
                  });
                }
              })
              .catch(err => {
                addDebugLog(`⚠️ Database save failed: ${err.message}`);
                if (mountedRef.current) {
                  toast({
                    title: "Warning",
                    description: "Payment succeeded but saving details failed.",
                    variant: "destructive"
                  });
                }
              });

              if (onSuccess) onSuccess(details);
            });
          },
          onError: (err: any) => {
            addDebugLog(`❌ PayPal error: ${err.message || err}`);
            if (mountedRef.current) {
              toast({
                title: "Payment Failed",
                description: "There was a problem with your payment.",
                variant: "destructive"
              });
            }
            if (onError) onError(err);
          },
          onCancel: (_data: any) => {
            addDebugLog('⛔ Payment cancelled by user');
            if (mountedRef.current) {
              toast({
                title: "Payment Cancelled",
                description: "You cancelled the transaction."
              });
            }
          }
        };

        addDebugLog('🎨 Rendering PayPal buttons to container');
        
        paypalSDK.Buttons(buttonConfig).render(container).then(() => {
          addDebugLog('✅ PayPal buttons rendered successfully');
          if (mountedRef.current) {
            setIsLoading(false);
          }
        }).catch((renderError: any) => {
          addDebugLog(`❌ PayPal render error: ${renderError.message || renderError}`);
          if (mountedRef.current) {
            toast({
              title: "PayPal Error",
              description: `Render failed: ${renderError.message || 'Unknown error'}`,
              variant: "destructive"
            });
            setIsLoading(false);
          }
        });

      } catch (error: any) {
        addDebugLog(`❌ Initialization error: ${error.message || error}`);
        if (mountedRef.current) {
          toast({
            title: "PayPal Error",
            description: `Initialization failed: ${error.message || 'Unknown error'}`,
            variant: "destructive"
          });
          setIsLoading(false);
        }
      }
    };

    const loadPayPalScript = () => {
      addDebugLog('📜 Loading PayPal script');
      
      // Check if already loaded
      if ((window as any).paypal) {
        addDebugLog('✅ PayPal SDK already available');
        setTimeout(() => initializePayPalButtons(), 100);
        return;
      }

      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (existingScript) {
        addDebugLog('🗑️ Removing existing PayPal script');
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${liveClientId}&currency=USD`;
      script.async = true;

      script.onload = () => {
        addDebugLog('✅ PayPal SDK script loaded');
        if (mountedRef.current) {
          setTimeout(() => initializePayPalButtons(), 100);
        }
      };

      script.onerror = (error) => {
        addDebugLog(`❌ PayPal script load failed: ${error}`);
        if (mountedRef.current) {
          toast({
            title: "PayPal Error",
            description: "Could not load PayPal SDK. Check your internet connection.",
            variant: "destructive"
          });
          setIsLoading(false);
        }
      };

      addDebugLog('🌐 Adding PayPal script to document head');
      document.head.appendChild(script);
    };

    // Start the process
    setTimeout(() => {
      checkContainer();
      loadPayPalScript();
    }, 50);

    return () => {
      addDebugLog('🧹 Component cleanup');
      mountedRef.current = false;
    };
  }, [amount, onSuccess, onError, toast]);

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center justify-center p-8 border border-gray-300 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-sm text-gray-600">Loading PayPal…</p>
        </div>
        
        {/* Debug Information */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs font-mono">
          <h4 className="font-bold mb-2">Debug Log:</h4>
          {debugInfo.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div 
        id="paypal-button-container" 
        ref={paypalContainerRef}
        className="min-h-[50px] w-full border border-red-200 bg-red-50"
        style={{ minHeight: '50px', width: '100%' }}
      />
      <p className="text-xs text-center text-gray-500 mt-2">
        Secure payment powered by PayPal
      </p>
      
      {/* Debug Information */}
      <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs font-mono">
        <h4 className="font-bold mb-2">Debug Log:</h4>
        {debugInfo.map((log, index) => (
          <div key={index} className="mb-1">{log}</div>
        ))}
      </div>
    </div>
  );
};

export default PayPalSmartButtons;