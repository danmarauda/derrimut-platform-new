"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Building2,
  Users, 
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Calendar,
  CreditCard,
  UserCheck,
  TrendingUp,
  Activity,
  Package
} from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleGuard } from "@/components/RoleGuard";
import { AdminLayout } from "@/components/AdminLayout";
import { StatisticsGrid } from "@/components/dashboard/StatisticsGrid";

export default function LocationAdminDashboard() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  
  // Get current user's organization
  const organization = useQuery(
    api.organizations.getUserOrganization,
    isSignedIn && user?.id ? { clerkId: user.id } : "skip"
  );
  
  // Get organization members
  const orgMembers = useQuery(
    api.organizations.getOrganizationMembers,
    organization?._id ? { organizationId: organization._id } : "skip"
  );
  
  // Get memberships for this location (would need to add location filter to memberships query)
  const allMemberships = useQuery(api.memberships.getAllMemberships, isSignedIn ? undefined : "skip");
  const activeTrainers = useQuery(api.trainerProfiles.getActiveTrainers, isSignedIn ? {} : "skip");
  
  // Filter trainers by location (check if trainer's user is in orgMembers)
  const locationTrainers = activeTrainers?.filter(trainer => 
    orgMembers?.some(member => member._id === trainer.userId)
  ) || [];

  // Calculate statistics for this location
  const stats = {
    totalMembers: organization?.totalMembers || 0,
    totalStaff: organization?.totalStaff || 0,
    activeTrainers: locationTrainers.length,
    // Note: Would need location-specific membership queries
    activeMemberships: allMemberships?.filter(m => m.status === "active").length || 0,
  };

  const formatAddress = (org: typeof organization) => {
    if (!org) return "N/A";
    return `${org.address.street}, ${org.address.city} ${org.address.state} ${org.address.postcode}`;
  };

  if (!organization) {
    return (
      <RoleGuard allowedRoles={["admin", "superadmin"]}>
        <AdminLayout title="Location Dashboard" subtitle="Loading location data...">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No location assigned to your account.</p>
              <p className="text-sm mt-2">Contact a super admin to assign you to a location.</p>
            </CardContent>
          </Card>
        </AdminLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["admin", "superadmin"]}>
      <AdminLayout 
        title={`${organization.name} Dashboard`}
        subtitle={`Manage your location and members`}
        showAddButton={false}
      >
        <div className="space-y-6">
          {/* Location Header */}
          <Card variant="premium" className="bg-gradient-to-r from-white/10 to-white/5 border-white/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2 text-white">{organization.name}</CardTitle>
                  <CardDescription className="text-white/60">
                    {formatAddress(organization)}
                  </CardDescription>
                </div>
                <Badge variant={organization.status === "active" ? "accent" : "standard"}>
                  {organization.status === "active" ? "Active" : organization.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {organization.phone && (
                  <div className="flex items-center gap-2 text-white/80">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${organization.phone}`} className="text-sm hover:text-white transition-colors">
                      {organization.phone}
                    </a>
                  </div>
                )}
                {organization.email && (
                  <div className="flex items-center gap-2 text-white/80">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${organization.email}`} className="text-sm hover:text-white transition-colors truncate">
                      {organization.email}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {organization.is24Hours ? "24/7 Access" : "Limited Hours"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{organization.address.state}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics - Using new StatisticsGrid */}
          <StatisticsGrid
            stats={[
              {
                title: "Total Members",
                value: stats.totalMembers,
                change: 12.5,
                icon: Users,
                trend: "up",
              },
              {
                title: "Staff Members",
                value: stats.totalStaff,
                change: stats.activeTrainers > 0 ? 5.2 : 0,
                icon: UserCheck,
                trend: "up",
              },
              {
                title: "Active Memberships",
                value: stats.activeMemberships,
                change: 8.1,
                icon: CreditCard,
                trend: "up",
              },
              {
                title: "Active Trainers",
                value: stats.activeTrainers,
                change: stats.activeTrainers > 0 ? 15.3 : 0,
                icon: Activity,
                trend: "up",
              },
            ]}
          />

          {/* Location Features */}
          {organization.features && organization.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Location Features</CardTitle>
                <CardDescription>Available amenities and services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {organization.features.map((feature, idx) => (
                    <Badge variant="standard">
                      {feature.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button variant="secondary" className="h-auto flex-col py-3" asChild>
                  <Link href="/admin/users">
                    <Users className="h-5 w-5 mb-1" />
                    <span className="text-xs">Members</span>
                  </Link>
                </Button>
                <Button variant="secondary" className="h-auto flex-col py-3" asChild>
                  <Link href="/admin/trainer-applications">
                    <UserCheck className="h-5 w-5 mb-1" />
                    <span className="text-xs">Trainers</span>
                  </Link>
                </Button>
                <Button variant="secondary" className="h-auto flex-col py-3" asChild>
                  <Link href="/admin/memberships">
                    <CreditCard className="h-5 w-5 mb-1" />
                    <span className="text-xs">Memberships</span>
                  </Link>
                </Button>
                <Button variant="secondary" className="h-auto flex-col py-3" asChild>
                  <Link href={`/admin/organizations/${organization._id}`}>
                    <Building2 className="h-5 w-5 mb-1" />
                    <span className="text-xs">Settings</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Staff Members */}
          {orgMembers && orgMembers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Staff Members</CardTitle>
                <CardDescription>Team members at this location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {orgMembers.slice(0, 5).map((member) => (
                    <div key={member._id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      <Badge variant="standard">
                        {member.organizationRole === "org_admin" ? "Admin" : "Staff"}
                      </Badge>
                    </div>
                  ))}
                  {orgMembers.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      +{orgMembers.length - 5} more staff members
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AdminLayout>
    </RoleGuard>
  );
}