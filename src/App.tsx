import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import MobileNotification from "@/components/MobileNotification";
import RedirectHandler from "@/components/RedirectHandler";
import CanonicalRedirectHandler from "@/components/CanonicalRedirectHandler";
import IndexingOptimizer from "@/components/IndexingOptimizer";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Subscription from "./pages/Subscription";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import FreeATSScannerPage from "./pages/FreeATSScanner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Hide Lovable badge on component mount
  React.useEffect(() => {
    // Remove any existing Lovable badges
    const removeLovableBadge = () => {
      const badges = document.querySelectorAll('[data-lovable-badge], .lovable-badge, [class*="lovable"], [id*="lovable"]');
      badges.forEach(badge => {
        if (badge.textContent?.toLowerCase().includes('lovable') || 
            badge.textContent?.toLowerCase().includes('edit in lovable')) {
          badge.remove();
        }
      });
    };

    // Remove immediately
    removeLovableBadge();

    // Also remove any that might be added later
    const observer = new MutationObserver(() => {
      removeLovableBadge();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <MobileNotification />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CanonicalRedirectHandler />
            <IndexingOptimizer>
              <RedirectHandler />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/admin" element={<Navigate to="/auth" replace />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-cancelled" element={<PaymentCancelled />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/free-ats-scanner" element={<FreeATSScannerPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </IndexingOptimizer>
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
