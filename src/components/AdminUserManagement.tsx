
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Search, UserCheck, UserX, Crown, Shield, Gift, Key, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      // Get profiles with user info
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, created_at');

      if (profilesError) throw profilesError;

      // Get subscription data
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('user_id, tier, status, scan_count, max_scans');

      if (subscriptionsError) throw subscriptionsError;

      // Get resume counts
      const { data: resumes, error: resumesError } = await supabase
        .from('resumes')
        .select('user_id');

      if (resumesError) throw resumesError;

      // Combine data with enhanced information
      const usersData = profiles?.map(profile => {
        const userSubscription = subscriptions?.find(sub => sub.user_id === profile.id);
        const userResumeCount = resumes?.filter(resume => resume.user_id === profile.id).length || 0;

        return {
          id: profile.id,
          email: profile.email || 'No email',
          created_at: profile.created_at,
          last_sign_in_at: profile.created_at,
          subscription_tier: userSubscription?.tier || 'demo',
          subscription_status: userSubscription?.status || 'inactive',
          resume_count: userResumeCount,
          scan_count: userSubscription?.scan_count || 0,
          max_scans: userSubscription?.max_scans || 0
        };
      }) || [];

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.subscription_tier?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
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
            Manage user accounts, assign free plans, and view detailed user information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or subscription tier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
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
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            {getUserTypeBadge(user.subscription_tier || 'demo', user.subscription_status || 'inactive')}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last active: {formatDate(user.last_sign_in_at)}
                          </p>
                        </div>
                        
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
