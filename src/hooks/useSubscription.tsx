import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { exportToPDF, exportToWord, ResumeData } from "@/utils/simpleExport";

export const useSubscription = (currentUserId: string) => {
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkSubscription = async () => {
      if (!currentUserId) return;

      try {
        // Check if this is the special free user
        const { data: { user } } = await supabase.auth.getUser();
        const isSpecialUser = user?.email === "ahmedkhairyabdelfatah@gmail.com";
        
        if (isSpecialUser) {
          // Give unlimited access to the special user
          const freeUnlimitedSubscription = {
            tier: 'unlimited',
            scan_count: 999,
            status: 'active',
            user_id: currentUserId
          };
          setIsPremiumUser(true);
          setCurrentSubscription(freeUnlimitedSubscription);
          return;
        }

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

  const canExport = () => {
    if (!isPremiumUser || !currentSubscription) return false;
    
    // Users with unlimited tier have unlimited exports
    if (currentSubscription.tier === 'unlimited') return true;
    
    // Other paid users (basic, premium) are limited by scan_count
    return currentSubscription.scan_count > 0;
  };

  const getTargetedResumeLimit = () => {
    if (!isPremiumUser || !currentSubscription) return 0;
    
    switch (currentSubscription.tier) {
      case 'basic':
        return 1;
      case 'premium':
        return 3;
      case 'unlimited':
        return 999;
      default:
        return 0;
    }
  };

  const handleExport = async (exportData: ResumeData) => {
    console.log('=== handleExport called ===');
    
    if (isExporting) {
      console.log('Export already in progress');
      return;
    }
    
    if (!canExport()) {
      toast({
        title: "Upgrade Required",
        description: "Please purchase export credits to download your resume.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      await exportToPDF(exportData);
      
      // Update scan count
      const { data: { user } } = await supabase.auth.getUser();
      const isSpecialUser = user?.email === "ahmedkhairyabdelfatah@gmail.com";
      
      if (currentSubscription.tier !== 'unlimited' && !isSpecialUser) {
        await supabase
          .from('subscriptions')
          .update({ scan_count: currentSubscription.scan_count - 1 })
          .eq('user_id', currentUserId);
        
        setCurrentSubscription(prev => ({
          ...prev,
          scan_count: prev.scan_count - 1
        }));

        toast({
          title: "Resume Exported!",
          description: `PDF downloaded. ${currentSubscription.scan_count - 1} exports remaining.`,
        });
      } else {
        toast({
          title: "Resume Exported!",
          description: "PDF downloaded successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Export failed",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleWordExport = async (exportData: ResumeData) => {
    console.log('=== handleWordExport called ===');
    
    if (isExporting) {
      console.log('Export already in progress');
      return;
    }
    
    if (!canExport()) {
      toast({
        title: "Upgrade Required",
        description: "Please purchase export credits to download your resume.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      await exportToWord(exportData);
      
      // Update scan count
      const { data: { user } } = await supabase.auth.getUser();
      const isSpecialUser = user?.email === "ahmedkhairyabdelfatah@gmail.com";
      
      if (currentSubscription.tier !== 'unlimited' && !isSpecialUser) {
        await supabase
          .from('subscriptions')
          .update({ scan_count: currentSubscription.scan_count - 1 })
          .eq('user_id', currentUserId);
        
        setCurrentSubscription(prev => ({
          ...prev,
          scan_count: prev.scan_count - 1
        }));

        toast({
          title: "Resume Exported!",
          description: `Word document downloaded. ${currentSubscription.scan_count - 1} exports remaining.`,
        });
      } else {
        toast({
          title: "Resume Exported!",
          description: "Word document downloaded successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Word export failed",
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
    handleWordExport,
    canExport,
    getTargetedResumeLimit,
  };
};
