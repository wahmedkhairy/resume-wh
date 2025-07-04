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
        // Check if this is one of the special free users
        const { data: { user } } = await supabase.auth.getUser();
        const specialFreeUsers = [
          "ahmedkhairyabdelfatah@gmail.com",
          "ahmedz.khairy@gmail.com"
        ];
        const isSpecialUser = user?.email && specialFreeUsers.includes(user.email);
        
        // Check if this is the basic plan user
        const basicPlanUsers = ["ahmedz.khairy88@gmail.com"];
        const isBasicUser = user?.email && basicPlanUsers.includes(user.email);
        
        if (isSpecialUser) {
          // Check if subscription exists in database first
          const { data: existingSubscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', currentUserId)
            .maybeSingle();

          if (existingSubscription) {
            setIsPremiumUser(true);
            setCurrentSubscription(existingSubscription);
            return;
          }

          // Create unlimited subscription in database if it doesn't exist
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

          setIsPremiumUser(true);
          setCurrentSubscription(newSubscription);
          return;
        }
        
        if (isBasicUser) {
          console.log('Processing basic plan user:', user.email);
          
          // Check if subscription exists in database first
          const { data: existingSubscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', currentUserId)
            .maybeSingle();

          if (existingSubscription) {
            console.log('Found existing subscription for basic user:', existingSubscription);
            
            // Ensure they have the correct basic plan setup
            if (existingSubscription.tier !== 'basic' || existingSubscription.max_scans !== 2) {
              const { data: updatedSubscription, error: updateError } = await supabase
                .from('subscriptions')
                .update({
                  tier: 'basic',
                  scan_count: Math.max(existingSubscription.scan_count, 2),
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
            
            setIsPremiumUser(existingSubscription.scan_count > 0 && existingSubscription.tier !== 'demo');
            setCurrentSubscription(existingSubscription);
            return;
          }

          // Create basic subscription in database if it doesn't exist
          console.log('Creating new basic subscription for user');
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

          console.log('Created basic subscription:', newSubscription);
          setIsPremiumUser(true);
          setCurrentSubscription(newSubscription);
          return;
        }

        // For all other users, fetch from database
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', currentUserId)
          .maybeSingle();
        
        if (subscription && subscription.status === 'active') {
          // Only set as premium if user has remaining scans AND is not demo tier
          const hasPaidTier = subscription.tier !== 'demo';
          const hasRemainingScans = subscription.scan_count > 0;
          
          setIsPremiumUser(hasPaidTier && hasRemainingScans);
          setCurrentSubscription(subscription);
        } else {
          setIsPremiumUser(false);
          setCurrentSubscription(subscription);
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
