import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building2, MessageSquare, BarChart3, Star, TrendingUp } from "lucide-react";
import { AdminAnalytics } from "./AdminAnalytics";
import { UserManagement } from "./UserManagement";
import { VendorManagement } from "./VendorManagement";
import { ReviewManagement } from "./ReviewManagement";

const AdminDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your Rate Am platform</p>
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Vendors
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="polls" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Polls
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-6">
          <AdminAnalytics />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="vendors" className="mt-6">
          <VendorManagement />
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <ReviewManagement />
        </TabsContent>

        <TabsContent value="polls" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Poll Management</CardTitle>
              <CardDescription>Manage community polls and voting</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Poll management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;