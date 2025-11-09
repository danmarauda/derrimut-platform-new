"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { UserTable } from "@/components/admin/UserTable";
import { useAuth } from "@clerk/nextjs";

export default function AdminUsersPage() {
  const { isSignedIn } = useAuth();
  const users = useQuery(api.users.getAllUsers, isSignedIn ? undefined : "skip");
  const allMemberships = useQuery(api.memberships.getAllMemberships, isSignedIn ? undefined : "skip");
  const updateRole = useMutation(api.users.updateUserRole);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [membershipFilter, setMembershipFilter] = useState<string>("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUser(userId);
    try {
      await updateRole({
        userId: userId as any,
        role: newRole as any,
      });
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Error updating user role. Please try again.");
    } finally {
      setUpdatingUser(null);
    }
  };

  if (!mounted || !users || !allMemberships) {
    return (
      <AdminLayout title="User Management" subtitle="Manage platform users">
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
          <div className="text-center">
            <div className="h-16 w-16 border-4 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Management" subtitle="Manage platform users and roles">
      <UserTable
        users={users}
        memberships={allMemberships}
        onRoleChange={handleRoleChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        membershipFilter={membershipFilter}
        onMembershipFilterChange={setMembershipFilter}
      />
    </AdminLayout>
  );
}