
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { exportResumeToPDF } from "@/utils/resumeExport";

export const useSubscription = (currentUserId: string) => {
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkSubscription = async () => {
      if (!currentUserId) return;

      try {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', currentUserId)
          .maybeSingle();
        
        if (subscription && subscription.scan_count > 0) {
          setIsPremiumUser(true);
          setCurrentSubscription(subscription);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, [currentUserId]);

  const handleExport = async (exportData: any) => {
    if (!isPremiumUser || !currentSubscription || currentSubscription.scan_count <= 0) {
      toast({
        title: "Upgrade Required",
        description: "Please purchase export credits to download your resume.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      console.log('Starting export with data:', exportData);
      await exportResumeToPDF(exportData);
      
      // Decrement scan count
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ scan_count: currentSubscription.scan_count - 1 })
        .eq('user_id', currentUserId);
      
      if (updateError) {
        console.error('Error updating scan count:', updateError);
        throw updateError;
      }
      
      // Update local state
      setCurrentSubscription(prev => ({
        ...prev,
        scan_count: prev.scan_count - 1
      }));

      toast({
        title: "Resume Exported Successfully!",
        description: `Your resume has been downloaded as PDF. ${currentSubscription.scan_count - 1} exports remaining.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "There was an error exporting your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    currentSubscription,
    isPremiumUser,
    isExporting,
    handleExport,
  };
};
