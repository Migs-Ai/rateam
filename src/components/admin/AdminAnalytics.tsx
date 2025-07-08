import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Building2, MessageSquare, Star, TrendingUp, Calendar } from "lucide-react";

export const AdminAnalytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const [usersRes, vendorsRes, reviewsRes, categoriesRes] = await Promise.all([
        supabase.from('profiles').select('id, created_at'),
        supabase.from('vendors').select('id, status, created_at, rating'),
        supabase.from('reviews').select('id, status, rating, created_at'),
        supabase.from('categories').select('id')
      ]);

      const users = usersRes.data || [];
      const vendors = vendorsRes.data || [];
      const reviews = reviewsRes.data || [];
      const categories = categoriesRes.data || [];

      // Calculate analytics
      const totalUsers = users.length;
      const totalVendors = vendors.length;
      const approvedVendors = vendors.filter(v => v.status === 'approved').length;
      const pendingVendors = vendors.filter(v => v.status === 'pending').length;
      const totalReviews = reviews.length;
      const approvedReviews = reviews.filter(r => r.status === 'approved').length;
      const avgRating = reviews.length > 0 ? 
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

      // Growth metrics (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const newUsersThisMonth = users.filter(u => 
        new Date(u.created_at) > thirtyDaysAgo
      ).length;
      
      const newVendorsThisMonth = vendors.filter(v => 
        new Date(v.created_at) > thirtyDaysAgo
      ).length;

      const newReviewsThisMonth = reviews.filter(r => 
        new Date(r.created_at) > thirtyDaysAgo
      ).length;

      return {
        totalUsers,
        totalVendors,
        approvedVendors,
        pendingVendors,
        totalReviews,
        approvedReviews,
        avgRating,
        totalCategories: categories.length,
        newUsersThisMonth,
        newVendorsThisMonth,
        newReviewsThisMonth
      };
    }
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2"></div>
              <div className="h-3 w-32 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: analytics?.totalUsers || 0,
      change: `+${analytics?.newUsersThisMonth || 0} this month`,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Total Vendors",
      value: analytics?.totalVendors || 0,
      change: `${analytics?.approvedVendors || 0} approved, ${analytics?.pendingVendors || 0} pending`,
      icon: Building2,
      color: "text-green-600"
    },
    {
      title: "Total Reviews",
      value: analytics?.totalReviews || 0,
      change: `${analytics?.approvedReviews || 0} approved`,
      icon: MessageSquare,
      color: "text-orange-600"
    },
    {
      title: "Average Rating",
      value: analytics?.avgRating ? analytics.avgRating.toFixed(1) : "0.0",
      change: "Platform average",
      icon: Star,
      color: "text-yellow-600"
    },
    {
      title: "Categories",
      value: analytics?.totalCategories || 0,
      change: "Total categories",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "New Users",
      value: analytics?.newUsersThisMonth || 0,
      change: "Last 30 days",
      icon: Calendar,
      color: "text-indigo-600"
    },
    {
      title: "New Vendors",
      value: analytics?.newVendorsThisMonth || 0,
      change: "Last 30 days",
      icon: Building2,
      color: "text-teal-600"
    },
    {
      title: "New Reviews",
      value: analytics?.newReviewsThisMonth || 0,
      change: "Last 30 days",
      icon: MessageSquare,
      color: "text-rose-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Platform Analytics</h2>
        <p className="text-muted-foreground">Overview of your Rate Am platform performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>Key metrics overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Vendor Approval Rate</span>
              <span className="text-sm text-muted-foreground">
                {analytics?.totalVendors ? 
                  `${Math.round((analytics.approvedVendors / analytics.totalVendors) * 100)}%` : 
                  '0%'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Review Approval Rate</span>
              <span className="text-sm text-muted-foreground">
                {analytics?.totalReviews ? 
                  `${Math.round((analytics.approvedReviews / analytics.totalReviews) * 100)}%` : 
                  '0%'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Users per Vendor</span>
              <span className="text-sm text-muted-foreground">
                {analytics?.totalVendors ? 
                  `${Math.round(analytics.totalUsers / analytics.totalVendors)}` : 
                  '0'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Metrics</CardTitle>
            <CardDescription>30-day growth trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">User Growth</span>
              <span className="text-sm text-green-600">
                +{analytics?.newUsersThisMonth || 0} users
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Vendor Growth</span>
              <span className="text-sm text-green-600">
                +{analytics?.newVendorsThisMonth || 0} vendors
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Review Growth</span>
              <span className="text-sm text-green-600">
                +{analytics?.newReviewsThisMonth || 0} reviews
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};