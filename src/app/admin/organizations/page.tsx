"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  MapPin, 
  Building2, 
  Users, 
  Phone, 
  Mail, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Search,
  Filter
} from "lucide-react";
import { useState, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OrganizationsAdminPage() {
  const { isSignedIn } = useAuth();
  
  // Fetch all organizations
  const organizations = useQuery(api.organizations.getAllOrganizations, isSignedIn ? undefined : "skip");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "pending">("all");
  const [stateFilter, setStateFilter] = useState<string>("all");

  // Filter organizations
  const filteredOrganizations = useMemo(() => {
    if (!organizations) return [];

    return organizations.filter((org) => {
      // Search filter
      const matchesSearch = 
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.address.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.slug.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || org.status === statusFilter;

      // State filter
      const matchesState = stateFilter === "all" || org.address.state === stateFilter;

      return matchesSearch && matchesStatus && matchesState;
    });
  }, [organizations, searchQuery, statusFilter, stateFilter]);

  // Get unique states for filter
  const uniqueStates = useMemo(() => {
    if (!organizations) return [];
    return Array.from(new Set(organizations.map(org => org.address.state))).sort();
  }, [organizations]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!organizations) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        pending: 0,
        totalMembers: 0,
        totalStaff: 0,
        vicCount: 0,
        saCount: 0,
        qldCount: 0,
        is24Hours: 0,
      };
    }

    return {
      total: organizations.length,
      active: organizations.filter(o => o.status === "active").length,
      inactive: organizations.filter(o => o.status === "inactive").length,
      pending: organizations.filter(o => o.status === "pending").length,
      totalMembers: organizations.reduce((sum, o) => sum + (o.totalMembers || 0), 0),
      totalStaff: organizations.reduce((sum, o) => sum + (o.totalStaff || 0), 0),
      vicCount: organizations.filter(o => o.address.state === "VIC").length,
      saCount: organizations.filter(o => o.address.state === "SA").length,
      qldCount: organizations.filter(o => o.address.state === "QLD").length,
      is24Hours: organizations.filter(o => o.is24Hours).length,
    };
  }, [organizations]);

  const formatAddress = (org: NonNullable<typeof organizations>[number]) => {
    return `${org.address.street}, ${org.address.city} ${org.address.state} ${org.address.postcode}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
      case "inactive":
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout 
      title="Locations Management" 
      subtitle="Manage all Derrimut 24:7 Gym locations and franchises"
      showAddButton={false}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.vicCount} VIC, {stats.saCount} SA, {stats.qldCount} QLD
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                {stats.is24Hours} with 24/7 access
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all locations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStaff.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Trainers and staff
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by name, city, or state..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>

                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All States</option>
                  {uniqueStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locations List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Locations ({filteredOrganizations.length})
            </h2>
          </div>

          {!organizations ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading locations...
              </CardContent>
            </Card>
          ) : filteredOrganizations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No locations found matching your filters.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrganizations.map((org) => (
                <Card key={org._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{org.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {getStatusBadge(org.status)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{formatAddress(org)}</span>
                    </div>

                    {org.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${org.phone}`} className="text-blue-600 hover:underline">
                          {org.phone}
                        </a>
                      </div>
                    )}

                    {org.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${org.email}`} className="text-blue-600 hover:underline truncate">
                          {org.email}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {org.is24Hours ? "24/7 Access" : "Limited Hours"}
                      </span>
                    </div>

                    {org.features && org.features.length > 0 && (
                      <div className="pt-2 border-t">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Features:</div>
                        <div className="flex flex-wrap gap-1">
                          {org.features.slice(0, 3).map((feature, idx) => (
                            <Badge variant="standard" className="text-xs">
                              {feature.replace(/_/g, " ")}
                            </Badge>
                          ))}
                          {org.features.length > 3 && (
                            <Badge variant="standard" className="text-xs">
                              +{org.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span><Users className="h-3 w-3 inline mr-1" />{org.totalMembers || 0}</span>
                        <span>Staff: {org.totalStaff || 0}</span>
                      </div>
                      <Button variant="secondary" size="sm" asChild>
                        <Link href={`/admin/organizations/${org._id}`}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

