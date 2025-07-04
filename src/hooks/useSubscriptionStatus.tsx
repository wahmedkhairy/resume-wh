
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionInfo {
  tier: string;
  status: string;
  scan_count: number;
  max_scans: number;
  created_at: string;
  updated_at: string;
}

export const useSubscriptionStatus = (userId: string) => {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching subscription:', fetchError);
          setError('Failed to load subscription data');
          return;
        }

        setSubscription(data);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [userId]);

  const refreshSubscription = () => {
    if (userId) {
      const fetchSubscription = async () => {
        try {
          const { data } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
          
          setSubscription(data);
        } catch (err) {
          console.error('Error refreshing subscription:', err);
        }
      };
      
      fetchSubscription();
    }
  };

  return {
    subscription,
    isLoading,
    error,
    refreshSubscription
  };
};
