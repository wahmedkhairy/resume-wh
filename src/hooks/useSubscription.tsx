
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { exportResumeToPDF } from "@/utils/resumeExport";
import { exportResumeAsWord } from "@/utils/wordExport";

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

  const handleExport = async (exportData: any) => {
    console.log('=== useSubscription.handleExport called ===');
    console.log('Can export:', canExport());
    console.log('Is already exporting:', isExporting);
    
    // Prevent multiple exports
    if (isExporting) {
      console.log('Export already in progress, aborting');
      return;
    }
    
    if (!canExport()) {
      console.log('Export not allowed - insufficient permissions');
      toast({
        title: "Upgrade Required",
        description: "Please purchase export credits to download your resume.",
        variant: "destructive",
      });
      return;
    }

    // Validate export data
    if (!exportData || typeof exportData !== 'object') {
      console.error('Invalid export data provided to handleExport:', exportData);
      toast({
        title: "Export Error",
        description: "Invalid resume data. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    // Show immediate feedback
    toast({
      title: "Starting Export...",
      description: "Please wait while we generate your PDF. This may take a few moments.",
    });
    
    try {
      console.log('Calling exportResumeToPDF with validated data...');
      await exportResumeToPDF(exportData);
      
      // Only decrement scan count for non-unlimited users and non-special users
      const { data: { user } } = await supabase.auth.getUser();
      const isSpecialUser = user?.email === "ahmedkhairyabdelfatah@gmail.com";
      
      if (currentSubscription.tier !== 'unlimited' && !isSpecialUser) {
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
      } else {
        toast({
          title: "Resume Exported Successfully!",
          description: "Your resume has been downloaded as PDF.",
        });
      }
    } catch (error) {
      console.error('Export error in useSubscription:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "There was an error exporting your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleWordExport = async (exportData: any) => {
    console.log('=== useSubscription.handleWordExport called ===');
    console.log('Can export:', canExport());
    console.log('Is already exporting:', isExporting);
    
    // Prevent multiple exports
    if (isExporting) {
      console.log('Word export already in progress, aborting');
      return;
    }
    
    if (!canExport()) {
      console.log('Word export not allowed - insufficient permissions');
      toast({
        title: "Upgrade Required",
        description: "Please purchase export credits to download your resume.",
        variant: "destructive",
      });
      return;
    }

    // Validate export data
    if (!exportData || typeof exportData !== 'object') {
      console.error('Invalid export data provided to handleWordExport:', exportData);
      toast({
        title: "Export Error",
        description: "Invalid resume data. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    // Show immediate feedback
    toast({
      title: "Starting Word Export...",
      description: "Please wait while we generate your Word document. This may take a few moments.",
    });
    
    try {
      console.log('Calling exportResumeAsWord with validated data...');
      await exportResumeAsWord(exportData);
      
      // Only decrement scan count for non-unlimited users and non-special users
      const { data: { user } } = await supabase.auth.getUser();
      const isSpecialUser = user?.email === "ahmedkhairyabdelfatah@gmail.com";
      
      if (currentSubscription.tier !== 'unlimited' && !isSpecialUser) {
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
          description: `Your resume has been downloaded as Word document. ${currentSubscription.scan_count - 1} exports remaining.`,
        });
      } else {
        toast({
          title: "Resume Exported Successfully!",
          description: "Your resume has been downloaded as Word document.",
        });
      }
    } catch (error) {
      console.error('Word export error in useSubscription:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "There was an error exporting your resume as Word. Please try again.",
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
