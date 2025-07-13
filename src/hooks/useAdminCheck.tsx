
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useAdminCheck = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }

      setUser(user);

      if (!user) {
        setIsAdmin(false);
        return;
      }

      // Direct email check for admin access
      const isDirectAdmin = user.email === 'w.ahmedkhairy@gmail.com';
      setIsAdmin(isDirectAdmin);

    } catch (err) {
      console.error('Admin check error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAdmin,
    isLoading,
    error,
    refetch: checkAdminStatus
  };
};
