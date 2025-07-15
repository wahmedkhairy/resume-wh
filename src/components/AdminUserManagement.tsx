import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, Search, UserCheck, UserX, Crown, Shield, Gift, Key, Mail, Trash2, Eye, RefreshCw, UserMinus, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/adminClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  subscription_tier?: string;
  subscription_status?: string;
  resume_count?: number;
  scan_count?: number;
  max_scans?: number;
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [filterTier, setFilterTier] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users, filterTier]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log("Starting to fetch users...");

      // Use the admin client to get all users from auth.users
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (authError) {
        console.error("Error fetching auth users:", authError);
        // Fall back to profiles-based approach if auth admin API fails
        await fetchUsersFromProfiles();
        return;
      }

      console.log("Auth users found:", authUsers.users?.length || 0);

      // Get all subscription data using the regular client
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('user_id, tier, status, scan_count, max_scans, created_at');

      if (subscriptionsError) {
        console.error("Error fetching subscriptions:", subscriptionsError);
      }

      console.log("Subscriptions found:", subscriptions?.length || 0);

      // Get all profile data using the regular client
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, created_at');

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }

      console.log("Profiles found:", profiles?.length || 0);

      // Get resume counts for all users using the regular client
      const { data: resumes, error: resumesError } = await supabase
        .from('resumes')
        .select('user_id');

      if (resumesError) {
        console.error("Error fetching resumes:", resumesError);
      }

      console.log("Resumes found:", resumes?.length || 0);

      // Create comprehensive user list starting from auth users
      const usersArray = authUsers.users.map(authUser => {
        const profile = profiles?.find(p => p.id === authUser.id);
        const subscription = subscriptions?.find(s => s.user_id === authUser.id);
        const userResumeCount = resumes?.filter(r => r.user_id === authUser.id).length || 0;

        return {
          id: authUser.id,
          email: authUser.email || profile?.email || `user-${authUser.id.slice(0, 8)}@unknown.email`,
          created_at: authUser.created_at || profile?.created_at,
          last_sign_in_at: authUser.last_sign_in_at || authUser.created_at || profile?.created_at,
          subscription_tier: subscription?.tier || 'demo',
          subscription_status: subscription?.status || 'inactive',
          resume_count: userResumeCount,
          scan_count: subscription?.scan_count || 0,
          max_scans: subscription?.max_scans || 0
        };
      });

      console.log("Final users array:", usersArray.length);
      
      // Sort by creation date (newest first)
      usersArray.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setUsers(usersArray);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fall back to profiles-based approach
      await fetchUsersFromProfiles();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsersFromProfiles = async () => {
    try {
      console.log("Falling back to profiles-based user fetching...");

      // Get all subscription data to identify all users who have ever interacted with the system
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('user_id, tier, status, scan_count, max_scans, created_at');

      if (subscriptionsError) {
        console.error("Error fetching subscriptions:", subscriptionsError);
        throw subscriptionsError;
      }

      console.log("Subscriptions found:", subscriptions?.length || 0);

      // Get all profile data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, created_at');

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        // Don't throw here, as profiles might not exist for all users
      }

      console.log("Profiles found:", profiles?.length || 0);

      // Get resume counts for all users
      const { data: resumes, error: resumesError } = await supabase
        .from('resumes')
        .select('user_id');

      if (resumesError) {
        console.error("Error fetching resumes:", resumesError);
        // Don't throw here, as this is not critical
      }

      console.log("Resumes found:", resumes?.length || 0);

      // Create a comprehensive user list starting from subscriptions (which should exist for all users)
      const userMap = new Map();

      // Add users from subscriptions (this should be the most comprehensive list)
      subscriptions?.forEach(subscription => {
        if (!userMap.has(subscription.user_id)) {
          const profile = profiles?.find(p => p.id === subscription.user_id);
          const userResumeCount = resumes?.filter(r => r.user_id === subscription.user_id).length || 0;

          userMap.set(subscription.user_id, {
            id: subscription.user_id,
            email: profile?.email || `user-${subscription.user_id.slice(0, 8)}@unknown.email`,
            created_at: profile?.created_at || subscription.created_at,
            last_sign_in_at: profile?.created_at || subscription.created_at,
            subscription_tier: subscription.tier || 'demo',
            subscription_status: subscription.status || 'inactive',
            resume_count: userResumeCount,
            scan_count: subscription.scan_count || 0,
            max_scans: subscription.max_scans || 0
          });
        }
      });

      // Add any users from profiles that might not have subscriptions yet
      profiles?.forEach(profile => {
        if (!userMap.has(profile.id)) {
          const userResumeCount = resumes?.filter(r => r.user_id === profile.id).length || 0;
          
          userMap.set(profile.id, {
            id: profile.id,
            email: profile.email || `user-${profile.id.slice(0, 8)}@unknown.email`,
            created_at: profile.created_at,
            last_sign_in_at: profile.created_at,
            subscription_tier: 'demo',
            subscription_status: 'inactive',
            resume_count: userResumeCount,
            scan_count: 0,
            max_scans: 0
          });
        }
      });

      const usersArray = Array.from(userMap.values());
      console.log("Fallback users array:", usersArray.length);
      
      // Sort by creation date (newest first)
      usersArray.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setUsers(usersArray);

      toast({
        title: "Limited User Data",
        description: "Using fallback method to load users. Some user information may be incomplete.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error in fallback user fetch:', error);
      toast({
        title: "Error",
        description: "Failed to load user data. Please check the console for details.",
        variant: "destructive"
      });
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.subscription_tier?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tier filter
    if (filterTier !== 'all') {
      filtered = filtered.filter(user => user.subscription_tier === filterTier);
    }

    setFilteredUsers(filtered);
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    setIsDeletingUser(true);
    try {
      // Delete user data from all related tables
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', userId);

      const { error: resumeError } = await supabase
        .from('resumes')
        .delete()
        .eq('user_id', userId);

      const { error: tailoredError } = await supabase
        .from('tailored_resumes')
        .delete()
        .eq('user_id', userId);

      const { error: usageError } = await supabase
        .from('tailoring_usage')
        .delete()
        .eq('user_id', userId);

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (subscriptionError || resumeError || tailoredError || usageError || profileError) {
        throw new Error('Failed to delete user data');
      }

      toast({
        title: "User Deleted Successfully",
        description: `${userEmail} and all associated data have been permanently deleted.`,
      });

      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeletingUser(false);
    }
  };

  const suspendUser = async (userId: string, userEmail: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'suspended' })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "User Suspended",
        description: `${userEmail} has been suspended and their subscription deactivated.`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error suspending user:', error);
      toast({
        title: "Error",
        description: "Failed to suspend user.",
        variant: "destructive"
      });
    }
  };

  const reactivateUser = async (userId: string, userEmail: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'active' })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "User Reactivated",
        description: `${userEmail} has been reactivated.`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error reactivating user:', error);
      toast({
        title: "Error",
        description: "Failed to reactivate user.",
        variant: "destructive"
      });
    }
  };

  const assignFreePlan = async (userId: string, planType: 'basic' | 'premium' | 'unlimited') => {
    setIsAssigning(true);
    try {
      const planConfigs = {
        basic: { tier: 'basic', scan_count: 2, max_scans: 2 },
        premium: { tier: 'premium', scan_count: 6, max_scans: 6 },
        unlimited: { tier: 'unlimited', scan_count: 999, max_scans: 999 }
      };

      const config = planConfigs[planType];

      const { error } = await supabase
        .from('subscriptions')
        .update({
          tier: config.tier,
          scan_count: config.scan_count,
          max_scans: config.max_scans,
          status: 'active'
        })
        .eq('user_id', userId);

      if (error) {
        // If no subscription exists, create one
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            tier: config.tier,
            scan_count: config.scan_count,
            max_scans: config.max_scans,
            status: 'active'
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Plan Assigned Successfully",
        description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} plan has been assigned to the user.`,
      });

      // Refresh users list
      fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error('Error assigning plan:', error);
      toast({
        title: "Error",
        description: "Failed to assign plan to user",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const getUserTypeIcon = (tier: string) => {
    switch (tier) {
      case 'unlimited':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'premium':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'basic':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      default:
        return <UserX className="h-4 w-4 text-gray-600" />;
    }
  };

  const getUserTypeBadge = (tier: string, status: string) => {
    if (status !== 'active') {
      return <Badge variant="secondary">Free</Badge>;
    }

    switch (tier) {
      case 'unlimited':
        return <Badge className="bg-yellow-100 text-yellow-800">Unlimited</Badge>;
      case 'premium':
        return <Badge className="bg-blue-100 text-blue-800">Premium</Badge>;
      case 'basic':
        return <Badge className="bg-green-100 text-green-800">Basic</Badge>;
      default:
        return <Badge variant="secondary">Free</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-2">Loading user data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Advanced User Management
          </CardTitle>
          <CardDescription>
            Manage user accounts, assign free plans, and view detailed user information ({users.length} users found)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or subscription tier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Select value={filterTier} onValueChange={setFilterTier}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="demo">Demo</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchUsers}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.subscription_status === 'active').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Active Subscribers</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {users.reduce((total, user) => total + (user.resume_count || 0), 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Resumes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {users.reduce((total, user) => total + (user.scan_count || 0), 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Remaining Exports</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {users.filter(u => new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                  </div>
                  <p className="text-sm text-muted-foreground">New This Week</p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced User List */}
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getUserTypeIcon(user.subscription_tier || 'demo')}
                        <div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">{user.email}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ID: {user.id.slice(0, 8)}... • Joined {formatDate(user.created_at)}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>{user.resume_count} resumes</span>
                            <span>{user.scan_count}/{user.max_scans} exports</span>
                          </div>
                        </div>
                      </div>
                       
                       <div className="flex items-center space-x-2">
                         <div className="text-right">
                           <div className="flex items-center gap-2">
                             {getUserTypeBadge(user.subscription_tier || 'demo', user.subscription_status || 'inactive')}
                           </div>
                           <p className="text-xs text-muted-foreground mt-1">
                             Last active: {formatDate(user.last_sign_in_at)}
                           </p>
                         </div>
                         
                         {/* User Actions */}
                         <div className="flex items-center gap-1">
                           {/* Assign Plan Dialog */}
                           <Dialog>
                             <DialogTrigger asChild>
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => setSelectedUser(user)}
                               >
                                 <Gift className="h-4 w-4 mr-1" />
                                 Assign Plan
                               </Button>
                             </DialogTrigger>
                             <DialogContent>
                               <DialogHeader>
                                 <DialogTitle>Assign Free Plan</DialogTitle>
                                 <DialogDescription>
                                   Give {user.email} free access to any subscription plan
                                 </DialogDescription>
                               </DialogHeader>
                               <div className="space-y-4">
                                 <div className="grid grid-cols-1 gap-3">
                                   <Button
                                     onClick={() => assignFreePlan(user.id, 'basic')}
                                     disabled={isAssigning}
                                     className="flex items-center justify-between p-4 h-auto"
                                     variant="outline"
                                   >
                                     <div className="text-left">
                                       <div className="font-medium">Basic Plan</div>
                                       <div className="text-sm text-muted-foreground">2 exports • 1 targeted resume/month</div>
                                     </div>
                                     <UserCheck className="h-5 w-5 text-green-600" />
                                   </Button>
                                   
                                   <Button
                                     onClick={() => assignFreePlan(user.id, 'premium')}
                                     disabled={isAssigning}
                                     className="flex items-center justify-between p-4 h-auto"
                                     variant="outline"
                                   >
                                     <div className="text-left">
                                       <div className="font-medium">Premium Plan</div>
                                       <div className="text-sm text-muted-foreground">6 exports • 3 targeted resumes/month</div>
                                     </div>
                                     <Shield className="h-5 w-5 text-blue-600" />
                                   </Button>
                                   
                                   <Button
                                     onClick={() => assignFreePlan(user.id, 'unlimited')}
                                     disabled={isAssigning}
                                     className="flex items-center justify-between p-4 h-auto"
                                     variant="outline"
                                   >
                                     <div className="text-left">
                                       <div className="font-medium">Unlimited Plan</div>
                                       <div className="text-sm text-muted-foreground">Unlimited exports • Unlimited targeted resumes</div>
                                     </div>
                                     <Crown className="h-5 w-5 text-yellow-600" />
                                   </Button>
                                 </div>
                               </div>
                             </DialogContent>
                           </Dialog>

                           {/* Suspend/Reactivate Button */}
                           {user.subscription_status === 'active' || user.subscription_status === 'suspended' ? (
                             user.subscription_status === 'suspended' ? (
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => reactivateUser(user.id, user.email)}
                                 className="text-green-600 hover:text-green-700"
                               >
                                 <UserCheck className="h-4 w-4 mr-1" />
                                 Reactivate
                               </Button>
                             ) : (
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => suspendUser(user.id, user.email)}
                                 className="text-orange-600 hover:text-orange-700"
                               >
                                 <UserMinus className="h-4 w-4 mr-1" />
                                 Suspend
                               </Button>
                             )
                           ) : null}

                           {/* Delete User Dialog */}
                           <AlertDialog>
                             <AlertDialogTrigger asChild>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 className="text-red-600 hover:text-red-700"
                               >
                                 <Trash2 className="h-4 w-4 mr-1" />
                                 Delete
                               </Button>
                             </AlertDialogTrigger>
                             <AlertDialogContent>
                               <AlertDialogHeader>
                                 <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                 <AlertDialogDescription>
                                   This will permanently delete <strong>{user.email}</strong> and all their associated data:
                                   <ul className="list-disc list-inside mt-2 space-y-1">
                                     <li>Profile information</li>
                                     <li>All resumes ({user.resume_count})</li>
                                     <li>Subscription data</li>
                                     <li>Usage history</li>
                                     <li>Tailored resumes</li>
                                   </ul>
                                   <p className="mt-2 font-semibold">This action cannot be undone.</p>
                                 </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                                 <AlertDialogAction
                                   onClick={() => deleteUser(user.id, user.email)}
                                   disabled={isDeletingUser}
                                   className="bg-red-600 hover:bg-red-700"
                                 >
                                   {isDeletingUser ? "Deleting..." : "Delete User"}
                                 </AlertDialogAction>
                               </AlertDialogFooter>
                             </AlertDialogContent>
                           </AlertDialog>
                         </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center p-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2" />
                <p>No users found matching your search criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserManagement;
