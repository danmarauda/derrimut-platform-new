"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter,
  Users,
  UserCheck,
  UserX,
  Crown,
  Shield,
  Mail,
  Phone,
  Calendar,
  Eye,
  Edit,
  MoreVertical
} from "lucide-react";
import { useState } from "react";

interface UserTableProps {
  users: Array<{
    _id: any;
    name: string;
    email: string;
    role?: string;
    clerkId: string;
    _creationTime?: number;
    createdAt?: number;
    image?: string;
  }>;
  memberships: Array<{
    clerkId: string;
    status: string;
    membershipType: string;
    currentPeriodEnd: number;
    cancelAtPeriodEnd?: boolean;
  }>;
  onRoleChange?: (userId: string, newRole: string) => Promise<void>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  membershipFilter: string;
  onMembershipFilterChange: (value: string) => void;
}

export function UserTable({
  users,
  memberships,
  onRoleChange,
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  membershipFilter,
  onMembershipFilterChange,
}: UserTableProps) {
  const getUserMembership = (clerkId: string) => {
    return memberships
      .filter(m => m.clerkId === clerkId)
      .sort((a, b) => b.currentPeriodEnd - a.currentPeriodEnd)[0];
  };

  const getMembershipStatus = (membership: any) => {
    if (!membership) return { color: "gray", text: "No Membership" };
    
    const now = Date.now();
    const daysRemaining = Math.ceil((membership.currentPeriodEnd - now) / (1000 * 60 * 60 * 24));

    if (membership.status === "active" && membership.cancelAtPeriodEnd) {
      return { color: "orange", text: `Cancelling (${daysRemaining}d)` };
    } else if (membership.status === "active" && daysRemaining > 0) {
      return { color: "emerald", text: daysRemaining > 30 ? "Active" : `${daysRemaining}d left` };
    } else if (membership.status === "expired" || daysRemaining <= 0) {
      return { color: "red", text: "Expired" };
    }
    return { color: "gray", text: membership.status };
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    const membership = getUserMembership(user.clerkId);
    const matchesMembership = 
      membershipFilter === "all" ||
      (membershipFilter === "active" && membership?.status === "active") ||
      (membershipFilter === "expired" && (!membership || membership.status === "expired")) ||
      (membershipFilter === "none" && !membership);

    return matchesSearch && matchesRole && matchesMembership;
  });

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    try {
      return new Date(timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card variant="premium">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>

            <select
              value={membershipFilter}
              onChange={(e) => onMembershipFilterChange(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="all">All Memberships</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="none">No Membership</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card variant="premium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Users</CardTitle>
              <CardDescription className="text-white/60">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const membership = getUserMembership(user.clerkId);
              const membershipStatus = getMembershipStatus(membership);
              
              return (
                <div
                  key={user._id}
                  className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-white/10 to-white/5 flex items-center justify-center border border-white/10 text-white font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-white font-semibold">{user.name}</h3>
                          <Badge variant={user.role === "superadmin" ? "accent" : "standard"}>
                            {user.role || "user"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined {formatDate(user.createdAt || user._creationTime)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {membership && (
                        <Badge 
                          variant="standard"
                          className={
                            membershipStatus.color === "emerald" 
                              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                              : membershipStatus.color === "orange"
                              ? "bg-orange-500/20 border-orange-500/30 text-orange-400"
                              : "bg-red-500/20 border-red-500/30 text-red-400"
                          }
                        >
                          {membershipStatus.text}
                        </Badge>
                      )}
                      
                      {onRoleChange && (
                        <select
                          value={user.role || "user"}
                          onChange={(e) => onRoleChange(String(user._id), e.target.value)}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                        >
                          <option value="user">User</option>
                          <option value="trainer">Trainer</option>
                          <option value="admin">Admin</option>
                          <option value="superadmin">Super Admin</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/60">No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}