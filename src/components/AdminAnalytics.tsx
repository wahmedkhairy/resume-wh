
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, CreditCard, Eye, TrendingUp, Calendar, FileText, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface AdminAnalyticsProps {}

const AdminAnalytics: React.FC<AdminAnalyticsProps> = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    subscribedUsers: 0,
    totalResumes: 0,
    newUsersToday: 0,
    totalTailoredResumes: 0,
    revenueThisMonth: 0,
    subscriptionBreakdown: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRealAnalytics();
  }, []);

  const fetchRealAnalytics = async () => {
    try {
      setIsLoading(true);

      // Get total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get subscribed users count (excluding demo tier)
      const { count: subscribedUsers } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .neq('tier', 'demo')
        .eq('status', 'active');

      // Get total resumes count
      const { count: totalResumes } = await supabase
        .from('resumes')
        .select('*', { count: 'exact', head: true });

      // Get new users today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Get total tailored resumes count
      const { count: totalTailoredResumes } = await supabase
        .from('tailored_resumes')
        .select('*', { count: 'exact', head: true });

      // Get subscription breakdown
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('tier, scan_count, status')
        .eq('status', 'active');

      // Calculate subscription breakdown
      const subscriptionBreakdown = subscriptions?.reduce((acc, sub) => {
        const tier = sub.tier === 'demo' ? 'Free' : sub.tier;
        const existing = acc.find(item => item.name === tier);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name: tier, value: 1 });
        }
        return acc;
      }, [] as any[]) || [];

      // Calculate estimated revenue
      const revenueEstimate = subscriptions?.reduce((total, sub) => {
        const tierPrices = { basic: 2, premium: 6, unlimited: 9.9 };
        return total + (tierPrices[sub.tier as keyof typeof tierPrices] || 0);
      }, 0) || 0;

      setAnalytics({
        totalUsers: totalUsers || 0,
        subscribedUsers: subscribedUsers || 0,
        totalResumes: totalResumes || 0,
        newUsersToday: newUsersToday || 0,
        totalTailoredResumes: totalTailoredResumes || 0,
        revenueThisMonth: revenueEstimate,
        subscriptionBreakdown
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    color = "text-blue-600" 
  }: {
    title: string;
    value: string | number;
    icon: any;
    description: string;
    color?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Real-time platform performance metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Users"
          value={analytics.totalUsers}
          icon={Users}
          description="All registered users"
          color="text-blue-600"
        />
        
        <StatCard
          title="Paid Subscribers"
          value={analytics.subscribedUsers}
          icon={CreditCard}
          description="Users with active paid subscriptions"
          color="text-green-600"
        />
        
        <StatCard
          title="Total Resumes"
          value={analytics.totalResumes}
          icon={FileText}
          description="Resumes created on platform"
          color="text-purple-600"
        />
        
        <StatCard
          title="New Users Today"
          value={analytics.newUsersToday}
          icon={UserPlus}
          description="Users registered today"
          color="text-orange-600"
        />
        
        <StatCard
          title="Tailored Resumes"
          value={analytics.totalTailoredResumes}
          icon={Zap}
          description="AI-tailored resumes generated"
          color="text-indigo-600"
        />
        
        <StatCard
          title="Monthly Revenue"
          value={`$${analytics.revenueThisMonth.toFixed(2)}`}
          icon={Calendar}
          description="Estimated monthly recurring revenue"
          color="text-emerald-600"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
            <CardDescription>Breakdown of user subscription tiers</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.subscriptionBreakdown.length > 0 ? (
              <ChartContainer
                config={{
                  value: {
                    label: "Users",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.subscriptionBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {analytics.subscriptionBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2" />
                <p>No subscription data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Activity</CardTitle>
            <CardDescription>Key metrics overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">User Registration Rate</span>
                <span className="font-medium">
                  {analytics.totalUsers > 0 ? `${((analytics.newUsersToday / analytics.totalUsers) * 100).toFixed(1)}%` : '0%'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Subscription Conversion</span>
                <span className="font-medium">
                  {analytics.totalUsers > 0 ? `${((analytics.subscribedUsers / analytics.totalUsers) * 100).toFixed(1)}%` : '0%'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg Resumes per User</span>
                <span className="font-medium">
                  {analytics.totalUsers > 0 ? (analytics.totalResumes / analytics.totalUsers).toFixed(1) : '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">AI Usage Rate</span>
                <span className="font-medium">
                  {analytics.totalResumes > 0 ? `${((analytics.totalTailoredResumes / analytics.totalResumes) * 100).toFixed(1)}%` : '0%'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
