import { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

interface Subscription {
  id: string;
  tier: string;
  scan_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  canExport: boolean;
  canAccessTargetedResumes: boolean;
  remainingExports: number;
  remainingTargetedResumes: number;
  refreshSubscription: () => Promise<void>;
  decrementExports: () => Promise<boolean>;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = useSupabaseClient();
  const user = useUser();

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No subscription found
          setSubscription(null);
        } else {
          throw fetchError;
        }
      } else {
        setSubscription(data);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  const decrementExports = async (): Promise<boolean> => {
    if (!subscription || !user) return false;

    try {
      const newScanCount = Math.max(0, subscription.scan_count - 1);
      
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ scan_count: newScanCount })
        .eq('id', subscription.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setSubscription(prev => prev ? { ...prev, scan_count: newScanCount } : null);
      return true;
    } catch (err) {
      console.error('Error decrementing exports:', err);
      return false;
    }
  };

  // Get plan limits based on tier
  const getPlanLimits = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'basic':
        return { exports: 2, targetedResumes: 1 };
      case 'premium':
        return { exports: 6, targetedResumes: 3 };
      case 'unlimited':
        return { exports: 999, targetedResumes: 999 };
      case 'demo':
        return { exports: 1, targetedResumes: 0 };
      default:
        return { exports: 0, targetedResumes: 0 };
    }
  };

  // Calculate derived values
  const canExport = subscription ? subscription.scan_count > 0 : false;
  
  const canAccessTargetedResumes = subscription 
    ? ['basic', 'premium', 'unlimited'].includes(subscription.tier?.toLowerCase())
    : false;
  
  const remainingExports = subscription?.scan_count || 0;
  
  const remainingTargetedResumes = subscription 
    ? (() => {
        const limits = getPlanLimits(subscription.tier);
        return limits.targetedResumes === 999 ? 999 : limits.targetedResumes;
      })()
    : 0;

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  return {
    subscription,
    loading,
    error,
    canExport,
    canAccessTargetedResumes,
    remainingExports,
    remainingTargetedResumes,
    refreshSubscription,
    decrementExports
  };
};