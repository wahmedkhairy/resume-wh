
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Search, UserCheck, UserX, Crown, Shield, Mail, Calendar, Activity, Database } from "lucide-react";
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
  email_confirmed_at?: string;
  phone?: string;
  role?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscribers: 0,
    totalResumes: 0,
    newThisWeek: 0,
    totalExports: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterBy, users]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      // Get profiles with enhanced user info
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, created_at');

      if (profilesError) throw profilesError;

      // Get subscription data with enhanced fields
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('user_id, tier, status, scan_count, max_scans, created_at, expires_at');

      if (subscriptionsError) throw subscriptionsError;

      // Get resume counts
      const { data: resumes, error: resumesError } = await supabase
        .from('resumes')
        .select('user_id, created_at');

      if (resumesError) throw resumesError;

      // Get tailoring usage for additional insights
      const { data: tailoringUsage, error: tailoringError } = await supabase
        .from('tailoring_usage')
        .select('user_id, monthly_count, last_reset_date');

      if (tailoringError) console.warn('Could not fetch tailoring usage:', tailoringError);

      // Combine data with enhanced information
      const usersData = profiles?.map(profile => {
        const userSubscription = subscriptions?.find(sub => sub.user_id === profile.id);
        const userResumes = resumes?.filter(resume => resume.user_id === profile.id) || [];
        const userTailoring = tailoringUsage?.find(usage => usage.user_id === profile.id);

        return {
          id: profile.id,
          email: profile.email || 'No email',
          created_at: profile.created_at,
          last_sign_in_at: profile.created_at,
          subscription_tier: userSubscription?.tier || 'demo',
          subscription_status: userSubscription?.status || 'inactive',
          resume_count: userResumes.length,
          scan_count: userSubscription?.scan_count || 0,
          max_scans: userSubscription?.max_scans || 0,
          email_confirmed_at: profile.created_at, // Simplified for display
          phone: null, // Not available in current schema
          role: userSubscription?.tier === 'unlimited' ? 'premium' : 'user'
        };
      }) || [];

      setUsers(usersData);

      // Calculate stats
      const totalUsers = usersData.length;
      const activeSubscribers = usersData.filter(u => u.subscription_status === 'active').length;
      const totalResumes = usersData.reduce((total, user) => total + (user.resume_count || 0), 0);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newThisWeek = usersData.filter(u => new Date(u.created_at) > weekAgo).length;
      const totalExports = usersData.reduce((total, user) => total + (user.max_scans || 0) - (user.scan_count || 0), 0);

      setStats({
        totalUsers,
        activeSubscribers,
        totalResumes,
        newThisWeek,
        totalExports
      });

    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load user data from database",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.subscription_tier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'premium':
        filtered = filtered.filter(u => u.subscription_status === 'active' && u.subscription_tier !== 'demo');
        break;
      case 'free':
        filtered = filtered.filter(u => u.subscription_status !== 'active' || u.subscription_tier === 'demo');
        break;
      case 'new':
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(u => new Date(u.created_at) > weekAgo);
        break;
      case 'active':
        filtered = filtered.filter(u => u.resume_count && u.resume_count > 0);
        break;
    }

    setFilteredUsers(filtered);
  };

  const getUserTypeIcon = (tier: string, status: string) => {
    if (status !== 'active') return <UserX className="h-4 w-4 text-gray-600" />;
    
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
      return <Badge variant="secondary">Free User</Badge>;
    }

    switch (tier) {
      case 'unlimited':
        return <Badge className="bg-yellow-100 text-yellow-800">Unlimited</Badge>;
      case 'premium':
        return <Badge className="bg-blue-100 text-blue-800">Premium</Badge>;
      case 'basic':
        return <Badge className="bg-green-100 text-green-800">Basic</Badge>;
      default:
        return <Badge variant="secondary">Free User</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const refreshUserData = () => {
    fetchUsers();
    toast({
      title: "Data Refreshed",
      description: "User data has been synchronized with the database.",
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Integrated User Management
              </CardTitle>
              <CardDescription>
                Real-time user data synchronized with Supabase database
              </CardDescription>
            </div>
            <Button onClick={refreshUserData} variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Enhanced Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center space-x-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, user ID, or subscription..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="premium">Premium Users</SelectItem>
                  <SelectItem value="free">Free Users</SelectItem>
                  <SelectItem value="new">New This Week</SelectItem>
                  <SelectItem value="active">Active Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.activeSubscribers}</div>
                  <p className="text-sm text-muted-foreground">Premium Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.totalResumes}</div>
                  <p className="text-sm text-muted-foreground">Total Resumes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.totalExports}</div>
                  <p className="text-sm text-muted-foreground">Total Exports</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.newThisWeek}</div>
                  <p className="text-sm text-muted-foreground">New This Week</p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced User List */}
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getUserTypeIcon(user.subscription_tier || 'demo', user.subscription_status || 'inactive')}
                        <div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">{user.email}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ID: {user.id.slice(0, 8)}... • Joined {formatDate(user.created_at)}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Database className="h-3 w-3" />
                              {user.resume_count} resumes
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              {user.scan_count}/{user.max_scans} exports
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            {getUserTypeBadge(user.subscription_tier || 'demo', user.subscription_status || 'inactive')}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Last: {formatDate(user.last_sign_in_at)}
                          </p>
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>User Details</DialogTitle>
                              <DialogDescription>
                                Complete user information from Supabase database
                              </DialogDescription>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">User ID</label>
                                    <p className="text-sm text-muted-foreground font-mono">{selectedUser.id}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Subscription Tier</label>
                                    <p className="text-sm text-muted-foreground">{selectedUser.subscription_tier}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <p className="text-sm text-muted-foreground">{selectedUser.subscription_status}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Resumes Created</label>
                                    <p className="text-sm text-muted-foreground">{selectedUser.resume_count}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Exports Remaining</label>
                                    <p className="text-sm text-muted-foreground">{selectedUser.scan_count}/{selectedUser.max_scans}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Created At</label>
                                    <p className="text-sm text-muted-foreground">{formatDate(selectedUser.created_at)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Last Sign In</label>
                                    <p className="text-sm text-muted-foreground">{formatDate(selectedUser.last_sign_in_at)}</p>
                                  </div>
                                </div>
                              </div>
                            )}
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
                <Button onClick={() => { setSearchTerm(''); setFilterBy('all'); }} variant="outline" className="mt-2">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
