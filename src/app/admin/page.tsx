"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { RoleGuard } from "@/components/RoleGuard";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminDashboardRedirect() {
  const router = useRouter();
  const { user } = useUser();
  const userRole = useQuery(api.users.getCurrentUserRole);
  const userOrg = useQuery(
    api.organizations.getUserOrganization,
    user?.id ? { clerkId: user.id } : "skip"
  );

  useEffect(() => {
    if (userRole === "superadmin") {
      router.replace("/super-admin/dashboard");
    } else if (userRole === "admin" && userOrg) {
      router.replace("/location-admin/dashboard");
    }
  }, [userRole, userOrg, router]);

  return (
    <RoleGuard allowedRoles={["admin", "superadmin"]}>
      <AdminLayout title="Redirecting..." subtitle="Loading dashboard...">
        <Card>
          <CardContent className="py-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Redirecting to your dashboard...</p>
          </CardContent>
        </Card>
      </AdminLayout>
    </RoleGuard>
  );
}
