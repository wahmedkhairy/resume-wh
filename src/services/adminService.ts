
import { supabase } from '@/integrations/supabase/client';

export interface AdminStats {
  totalUsers: number;
  activeSubscribers: number;
  totalResumes: number;
  newUsersThisWeek: number;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  subscription_tier?: string;
  subscription_status?: string;
  resume_count?: number;
}

export const adminService = {
  // Check if current user is admin
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.warn('Admin check RPC failed:', error);
        // Fallback to direct email check
        const { data: { user } } = await supabase.auth.getUser();
        return user?.email === 'w.ahmedkhairy@gmail.com';
      }
      
      return Boolean(data);
    } catch (error) {
      console.error('Admin check error:', error);
      // Fallback to direct email check
      const { data: { user } } = await supabase.auth.getUser();
      return user?.email === 'w.ahmedkhairy@gmail.com';
    }
  },

  // Get admin statistics
  async getAdminStats(): Promise<AdminStats> {
    const [profilesResponse, subscriptionsResponse, resumesResponse] = await Promise.all([
      supabase.from('profiles').select('id, created_at'),
      supabase.from('subscriptions').select('user_id, tier, status'),
      supabase.from('resumes').select('user_id')
    ]);

    const profiles = profilesResponse.data || [];
    const subscriptions = subscriptionsResponse.data || [];
    const resumes = resumesResponse.data || [];

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = profiles.filter(
      profile => new Date(profile.created_at) > oneWeekAgo
    ).length;

    return {
      totalUsers: profiles.length,
      activeSubscribers: subscriptions.filter(sub => sub.status === 'active').length,
      totalResumes: resumes.length,
      newUsersThisWeek
    };
  },

  // Get all users with their details
  async getAllUsers(): Promise<AdminUser[]> {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, created_at');

    if (profilesError) throw profilesError;

    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('user_id, tier, status');

    const { data: resumes } = await supabase
      .from('resumes')
      .select('user_id');

    const usersData = profiles?.map(profile => {
      const userSubscription = subscriptions?.find(sub => sub.user_id === profile.id);
      const userResumeCount = resumes?.filter(resume => resume.user_id === profile.id).length || 0;

      return {
        id: profile.id,
        email: profile.email || 'No email',
        created_at: profile.created_at,
        last_sign_in_at: profile.created_at, // Fallback since we can't access auth.users directly
        subscription_tier: userSubscription?.tier || 'demo',
        subscription_status: userSubscription?.status || 'inactive',
        resume_count: userResumeCount
      };
    }) || [];

    return usersData;
  },

  // Update user subscription
  async updateUserSubscription(userId: string, tier: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .update({ tier, status, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Add user to admin list
  async addAdmin(email: string): Promise<void> {
    const { error } = await supabase
      .from('admin_users')
      .insert({ email });

    if (error) throw error;
  },

  // Remove user from admin list
  async removeAdmin(email: string): Promise<void> {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('email', email);

    if (error) throw error;
  }
};
