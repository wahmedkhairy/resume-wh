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
        
        // Get current user email for special user checks
        const { data: { user } } = await supabase.auth.getUser();
        
        // Check if this is one of the special free users
        const specialFreeUsers = [
          "ahmedkhairyabdelfatah@gmail.com",
          "ahmedz.khairy@gmail.com"
        ];
        const isSpecialUser = user?.email && specialFreeUsers.includes(user.email);
        
        // Check if this is the basic plan user
        const basicPlanUsers = ["ahmedz.khairy88@gmail.com"];
        const isBasicUser = user?.email && basicPlanUsers.includes(user.email);

        // First, always fetch the actual subscription from database
        const { data: subscription, error: fetchError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', currentUserId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching subscription:', fetchError);
          return;
        }

        console.log('Found subscription:', subscription);
        
        // Handle special users
        if (isSpecialUser) {
          if (subscription) {
            // Use existing subscription but ensure it's unlimited
            if (subscription.tier !== 'unlimited') {
              const { data: updatedSubscription, error: updateError } = await supabase
                .from('subscriptions')
                .update({
                  tier: 'unlimited',
                  scan_count: 999,
                  max_scans: 999,
                  status: 'active'
                })
                .eq('user_id', currentUserId)
                .select()
                .single();

              if (updateError) {
                console.error('Error updating unlimited subscription:', updateError);
              } else {
                setCurrentSubscription(updatedSubscription);
                setIsPremiumUser(true);
                return;
              }
            } else {
              setCurrentSubscription(subscription);
              setIsPremiumUser(true);
              return;
            }
          } else {
            // Create unlimited subscription
            const { data: newSubscription, error } = await supabase
              .from('subscriptions')
              .insert({
                user_id: currentUserId,
                tier: 'unlimited',
                scan_count: 999,
                max_scans: 999,
                status: 'active'
              })
              .select()
              .single();

            if (error) {
              console.error('Error creating unlimited subscription:', error);
              return;
            }

            setCurrentSubscription(newSubscription);
            setIsPremiumUser(true);
            return;
          }
        }
        
        if (isBasicUser) {
          if (subscription) {
            // Ensure they have the correct basic plan setup
            if (subscription.tier !== 'basic' || subscription.max_scans !== 2) {
              const { data: updatedSubscription, error: updateError } = await supabase
                .from('subscriptions')
                .update({
                  tier: 'basic',
                  scan_count: Math.max(subscription.scan_count || 0, 2),
                  max_scans: 2,
                  status: 'active'
                })
                .eq('user_id', currentUserId)
                .select()
                .single();
              
              if (updateError) {
                console.error('Error updating basic subscription:', updateError);
              } else {
                setCurrentSubscription(updatedSubscription);
                setIsPremiumUser(true);
                return;
              }
            }
            
            setCurrentSubscription(subscription);
            setIsPremiumUser(subscription.scan_count > 0 && subscription.tier !== 'demo');
            return;
          } else {
            // Create basic subscription
            const { data: newSubscription, error } = await supabase
              .from('subscriptions')
              .insert({
                user_id: currentUserId,
                tier: 'basic',
                scan_count: 2,
                max_scans: 2,
                status: 'active'
              })
              .select()
              .single();

            if (error) {
              console.error('Error creating basic subscription:', error);
              return;
            }

            setCurrentSubscription(newSubscription);
            setIsPremiumUser(true);
            return;
          }
        }

        // For all other users, use the subscription as-is
        if (subscription) {
          console.log('Setting subscription for regular user:', {
            tier: subscription.tier,
            status: subscription.status,
            scan_count: subscription.scan_count
          });
          
          // Determine if user is premium based on their actual subscription
          const isPremium = subscription.status === 'active' && 
                           subscription.tier !== 'demo' && 
                           ['basic', 'premium', 'unlimited'].includes(subscription.tier);
          
          console.log('User premium status:', isPremium);
          
          setCurrentSubscription(subscription);
          setIsPremiumUser(isPremium);
        } else {
          console.log('No subscription found for user');
          setCurrentSubscription(null);
          setIsPremiumUser(false);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, [currentUserId]);

  const canExport = () => {
    if (!currentSubscription) return false;
    
    // Special users with unlimited tier have unlimited exports
    if (currentSubscription.tier === 'unlimited') return true;
    
    // Other users must have active subscription and remaining scans
    return currentSubscription.status === 'active' && 
           currentSubscription.tier !== 'demo' && 
           currentSubscription.scan_count > 0;
  };

  const canAccessTargetedResumes = () => {
    console.log('Checking targeted resume access:', {
      hasSubscription: !!currentSubscription,
      tier: currentSubscription?.tier,
      status: currentSubscription?.status,
      isPremiumUser
    });
    
    if (!currentSubscription) return false;
    
    // Check if user has a paid tier (not demo)
    const hasAccess = currentSubscription.status === 'active' && 
                     currentSubscription.tier !== 'demo' &&
                     ['basic', 'premium', 'unlimited'].includes(currentSubscription.tier);
    
    console.log('Targeted resume access result:', hasAccess);
    return hasAccess;
  };

  // Updated export limits for resume editor
  const getMaxExports = () => {
    if (!currentSubscription) return 0;
    
    switch (currentSubscription.tier) {
      case 'basic':
        return 2; // 2 resume editor exports
      case 'premium':
        return 6; // 6 resume editor exports
      case 'unlimited':
        return 999; // Unlimited resume editor exports
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
    getMaxExports,
    getRemainingExports,
    canAccessTargetedResumes,
  };
};
