
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'w.ahmedkhairy@gmail.com';

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

      // Strict admin check - only allow the specific admin email
      const isAuthorizedAdmin = user.email === ADMIN_EMAIL;
      setIsAdmin(isAuthorizedAdmin);

      // Log unauthorized access attempts
      if (!isAuthorizedAdmin && user.email) {
        console.warn('Unauthorized admin access attempt by:', user.email);
      }

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
