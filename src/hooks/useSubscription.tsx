import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { exportToHighQualityPDF, exportToEnhancedWord, ResumeData } from "@/utils/enhancedExport";

export const useSubscription = (currentUserId: string) => {
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkSubscription = async () => {
      if (!currentUserId) return;

      try {
        console.log('Checking subscription for user:', currentUserId);
        
        // Get current user email for special user handling
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Current user email:', user?.email);
        
        // Check if this is one of the special free users
        const specialFreeUsers = [
          "ahmedkhairyabdelfatah@gmail.com",
          "ahmedz.khairy@gmail.com"
        ];
        const isSpecialUser = user?.email && specialFreeUsers.includes(user.email);
        console.log('Is special unlimited user:', isSpecialUser);
        
        // Check if this is the basic plan user
        const basicPlanUsers = ["ahmedz.khairy88@gmail.com"];
        const isBasicUser = user?.email && basicPlanUsers.includes(user.email);
        console.log('Is basic plan user:', isBasicUser);
        
        if (isSpecialUser) {
          // Handle unlimited users
          let subscription = await getOrCreateSubscription(currentUserId, 'unlimited', 999, 999);
          setIsPremiumUser(true);
          setCurrentSubscription(subscription);
          return;
        }
        
        if (isBasicUser) {
          // Handle basic plan user
          let subscription = await getOrCreateSubscription(currentUserId, 'basic', 2, 2);
          setIsPremiumUser(true);
          setCurrentSubscription(subscription);
          return;
        }

        // For all other users, fetch actual subscription from database
        const { data: subscription, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', currentUserId)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching subscription:', error);
          return;
        }
        
        console.log('Fetched subscription from database:', subscription);
        
        if (subscription) {
          // Determine premium status based on actual subscription data
          const hasPaidTier = subscription.tier !== 'demo' && subscription.tier !== null;
          const hasRemainingScans = subscription.scan_count > 0;
          const isActiveStatus = subscription.status === 'active';
          
          console.log('Subscription analysis:', {
            tier: subscription.tier,
            hasPaidTier,
            scanCount: subscription.scan_count,
            hasRemainingScans,
            status: subscription.status,
            isActiveStatus
          });
          
          setIsPremiumUser(hasPaidTier && hasRemainingScans && isActiveStatus);
          setCurrentSubscription(subscription);
        } else {
          console.log('No subscription found, user is not premium');
          setIsPremiumUser(false);
          setCurrentSubscription(null);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, [currentUserId]);

  // Helper function to get or create subscription for special users
  const getOrCreateSubscription = async (userId: string, tier: string, scanCount: number, maxScans: number) => {
    // Check if subscription exists
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingSubscription) {
      // Update if tier or limits don't match
      if (existingSubscription.tier !== tier || existingSubscription.max_scans !== maxScans) {
        const { data: updatedSubscription, error } = await supabase
          .from('subscriptions')
          .update({
            tier,
            scan_count: Math.max(existingSubscription.scan_count, scanCount),
            max_scans: maxScans,
            status: 'active'
          })
          .eq('user_id', userId)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating subscription:', error);
          return existingSubscription;
        }
        return updatedSubscription;
      }
      return existingSubscription;
    }

    // Create new subscription
    const { data: newSubscription, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        tier,
        scan_count: scanCount,
        max_scans: maxScans,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      return null;
    }

    return newSubscription;
  };

  const canExport = () => {
    if (!currentSubscription) return false;
    
    // Special users with unlimited tier have unlimited exports
    if (currentSubscription.tier === 'unlimited') return true;
    
    // Other users must have active subscription and remaining scans
    return currentSubscription.status === 'active' && 
           currentSubscription.tier !== 'demo' && 
           currentSubscription.scan_count > 0;
  };

  const getTargetedResumeLimit = () => {
    if (!currentSubscription) return 0;
    
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

  const getMaxExports = () => {
    if (!currentSubscription) return 0;
    
    switch (currentSubscription.tier) {
      case 'basic':
        return 2;
      case 'premium':
        return 6;
      case 'unlimited':
        return 999;
      default:
        return 0;
    }
  };

  const getRemainingExports = () => {
    if (!currentSubscription) return 0;
    
    if (currentSubscription.tier === 'unlimited') {
      return 999; // Show as unlimited
    }
    
    return currentSubscription.scan_count || 0;
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
      console.log('Starting enhanced PDF export');
      await exportToHighQualityPDF(exportData);
      
      // Update scan count for non-unlimited users
      if (currentSubscription.tier !== 'unlimited') {
        const newScanCount = currentSubscription.scan_count - 1;
        const { error } = await supabase
          .from('subscriptions')
          .update({ scan_count: newScanCount })
          .eq('user_id', currentUserId);

        if (error) {
          console.error('Error updating scan count:', error);
          toast({
            title: "Export Warning",
            description: "Resume exported but could not update usage count.",
            variant: "destructive",
          });
          return;
        }
        
        setCurrentSubscription(prev => ({
          ...prev,
          scan_count: newScanCount
        }));

        toast({
          title: "Resume Exported!",
          description: `High-quality PDF downloaded. ${newScanCount} exports remaining.`,
        });
      } else {
        toast({
          title: "Resume Exported!",
          description: "High-quality PDF downloaded successfully.",
        });
      }
    } catch (error) {
      console.error('Enhanced PDF export error:', error);
      toast({
        title: "Export Failed",
        description: "Export failed. Please try again.",
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
      console.log('Starting enhanced Word export');
      await exportToEnhancedWord(exportData);
      
      // Update scan count for non-unlimited users
      if (currentSubscription.tier !== 'unlimited') {
        const newScanCount = currentSubscription.scan_count - 1;
        const { error } = await supabase
          .from('subscriptions')
          .update({ scan_count: newScanCount })
          .eq('user_id', currentUserId);

        if (error) {
          console.error('Error updating scan count:', error);
          toast({
            title: "Export Warning",
            description: "Word document exported but could not update usage count.",
            variant: "destructive",
          });
          return;
        }
        
        setCurrentSubscription(prev => ({
          ...prev,
          scan_count: newScanCount
        }));

        toast({
          title: "Resume Exported!",
          description: `Enhanced Word document downloaded. ${newScanCount} exports remaining.`,
        });
      } else {
        toast({
          title: "Resume Exported!",
          description: "Enhanced Word document downloaded successfully.",
        });
      }
    } catch (error) {
      console.error('Enhanced Word export error:', error);
      toast({
        title: "Export Failed",
        description: "Word export failed. Please try again.",
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
    getMaxExports,
    getRemainingExports,
  };
};
