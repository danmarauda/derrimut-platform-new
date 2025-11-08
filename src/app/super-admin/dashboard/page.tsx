"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { RoleGuard } from "@/components/RoleGuard";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Building2,
  Users, 
  TrendingUp,
  DollarSign,
  MapPin,
  Activity,
  Award,
  BarChart3,
  Calendar,
  CreditCard,
  Package,
  ShoppingBag,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SuperAdminDashboard() {
  const { isSignedIn } = useAuth();
  
  // Fetch all data
  const organizations = useQuery(api.organizations.getAllOrganizations, isSignedIn ? undefined : "skip");
  const users = useQuery(api.users.getAllUsers, isSignedIn ? undefined : "skip");
  const allMemberships = useQuery(api.memberships.getAllMemberships, isSignedIn ? undefined : "skip");
  const membershipPlans = useQuery(api.memberships.getMembershipPlans, isSignedIn ? undefined : "skip");
  const orders = useQuery(api.orders.getAllOrders, isSignedIn ? undefined : "skip");
  const activeTrainers = useQuery(api.trainerProfiles.getActiveTrainers, isSignedIn ? {} : "skip");
  const marketplaceStats = useQuery(api.marketplace.getMarketplaceStats, isSignedIn ? undefined : "skip");

  // Calculate comprehensive statistics
  const stats = {
    // Organizations
    totalLocations: organizations?.length || 0,
    activeLocations: organizations?.filter(o => o.status === "active").length || 0,
    totalLocationMembers: organizations?.reduce((sum, o) => sum + (o.totalMembers || 0), 0) || 0,
    totalLocationStaff: organizations?.reduce((sum, o) => sum + (o.totalStaff || 0), 0) || 0,
    
    // Users
    totalUsers: users?.length || 0,
    totalMembers: users?.filter(u => u.role === "user" || !u.role).length || 0,
    totalAdmins: users?.filter(u => u.role === "admin").length || 0,
    totalTrainers: users?.filter(u => u.role === "trainer").length || 0,
    
    // Memberships
    activeMemberships: allMemberships?.filter(m => m.status === "active").length || 0,
    expiredMemberships: allMemberships?.filter(m => m.status === "expired").length || 0,
    totalMemberships: allMemberships?.length || 0,
    
    // Revenue (simplified - would need proper calculation)
    monthlyRevenue: allMemberships?.filter(m => m.status === "active").reduce((sum, m) => {
      const plan = membershipPlans?.find(p => p.type === m.membershipType);
      return sum + (plan?.price || 0);
    }, 0) || 0,
    
    // Orders
    totalOrders: orders?.length || 0,
    totalRevenue: orders?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0,
    
    // Trainers
    activeTrainersCount: activeTrainers?.length || 0,
    
    // Marketplace
    marketplaceRevenue: marketplaceStats?.totalRevenue || 0,
    marketplaceItems: marketplaceStats?.totalItems || 0,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Group locations by state
  const locationsByState = organizations?.reduce((acc, org) => {
    const state = org.address.state;
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <RoleGuard allowedRoles={["superadmin"]}>
      <AdminLayout 
        title="Super Admin Dashboard" 
        subtitle="Derrimut 24:7 Gym - Complete Platform Overview"
        showAddButton={false}
      >
      <div className="space-y-6">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-red-600 to-red-800 text-white border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Welcome, Super Admin</CardTitle>
                <CardDescription className="text-red-100">
                  Complete overview of all Derrimut 24:7 Gym locations and operations
                </CardDescription>
              </div>
              <Building2 className="h-12 w-12 text-red-200" />
            </div>
          </CardHeader>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLocations}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeLocations} active locations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLocationMembers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all locations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Memberships</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeMemberships}</div>
              <p className="text-xs text-muted-foreground">
                {stats.expiredMemberships} expired
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                From active memberships
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalMembers} members, {stats.totalTrainers} trainers, {stats.totalAdmins} admins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Trainers</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeTrainersCount}</div>
              <p className="text-xs text-muted-foreground">
                Available for bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.totalRevenue)} revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Marketplace</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.marketplaceItems}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.marketplaceRevenue)} revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Locations Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Locations by State</CardTitle>
              <CardDescription>Distribution across Australia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(locationsByState).map(([state, count]) => (
                  <div key={state} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{state}</span>
                    </div>
                    <Badge variant="outline">{count} locations</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/organizations">
                    <Building2 className="h-4 w-4 mr-2" />
                    Manage All Locations
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-auto flex-col py-3" asChild>
                  <Link href="/admin/organizations">
                    <Building2 className="h-5 w-5 mb-1" />
                    <span className="text-xs">Locations</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-3" asChild>
                  <Link href="/admin/users">
                    <Users className="h-5 w-5 mb-1" />
                    <span className="text-xs">Users</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-3" asChild>
                  <Link href="/admin/memberships">
                    <CreditCard className="h-5 w-5 mb-1" />
                    <span className="text-xs">Memberships</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-3" asChild>
                  <Link href="/admin/trainer-applications">
                    <UserCheck className="h-5 w-5 mb-1" />
                    <span className="text-xs">Trainers</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity / Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Platform health and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="font-medium">All Systems Operational</span>
                </div>
                <Badge className="bg-green-500">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">{stats.activeLocations} Active Locations</span>
                </div>
                <Badge variant="outline">{stats.totalLocationMembers} Total Members</Badge>
              </div>
              {stats.expiredMemberships > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">{stats.expiredMemberships} Expired Memberships</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/memberships">Review</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
    </RoleGuard>
  );
}

