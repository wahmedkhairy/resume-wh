
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, UserCheck, UserX, Crown, Shield } from "lucide-react";
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
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
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
        .select('user_id, tier, status');

      if (subscriptionsError) throw subscriptionsError;

      // Get resume counts
      const { data: resumes, error: resumesError } = await supabase
        .from('resumes')
        .select('user_id');

      if (resumesError) throw resumesError;

      // Combine data
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
            User Management
          </CardTitle>
          <CardDescription>
            View and manage user accounts and subscription details
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

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                    {users.filter(u => new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                  </div>
                  <p className="text-sm text-muted-foreground">New This Week</p>
                </CardContent>
              </Card>
            </div>

            {/* User List */}
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getUserTypeIcon(user.subscription_tier || 'demo')}
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Joined {formatDate(user.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">{user.resume_count} resumes</p>
                          <p className="text-xs text-muted-foreground">
                            Last active: {formatDate(user.last_sign_in_at)}
                          </p>
                        </div>
                        {getUserTypeBadge(user.subscription_tier || 'demo', user.subscription_status || 'inactive')}
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

export default UserManagement;
