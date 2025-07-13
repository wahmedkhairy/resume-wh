
import { useState, useEffect } from 'react';
import { adminService, AdminStats, AdminUser } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [statsData, usersData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getAllUsers()
      ]);

      setStats(statsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserSubscription = async (userId: string, tier: string, status: string) => {
    try {
      await adminService.updateUserSubscription(userId, tier, status);
      toast({
        title: "Success",
        description: "User subscription updated successfully"
      });
      // Refresh the data
      await fetchDashboardData();
    } catch (err) {
      console.error('Update subscription error:', err);
      toast({
        title: "Error",
        description: "Failed to update user subscription",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats,
    users,
    isLoading,
    error,
    refetch: fetchDashboardData,
    updateUserSubscription
  };
};
