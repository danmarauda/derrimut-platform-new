"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Search,
  MapPin,
  Target,
  Heart,
  Globe,
  Lock,
  Trophy,
  Calendar,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export default function GroupsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const groups = useQuery(
    api.groups.getGroups,
    user?.id
      ? {
          category: selectedCategory as any,
          limit: 50,
        }
      : "skip"
  );
  const userGroups = useQuery(api.groups.getUserGroups, user?.id ? {} : "skip");

  const joinGroup = useMutation(api.groups.joinGroup);
  const leaveGroup = useMutation(api.groups.leaveGroup);

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroup({ groupId: groupId as any });
      toast.success("Joined group!");
    } catch (error: any) {
      toast.error(error.message || "Failed to join group");
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!confirm("Are you sure you want to leave this group?")) return;

    try {
      await leaveGroup({ groupId: groupId as any });
      toast.success("Left group");
    } catch (error: any) {
      toast.error(error.message || "Failed to leave group");
    }
  };

  if (!user) {
    router.push("/");
    return null;
  }

  const filteredGroups = groups?.filter(
    (group) =>
      !searchQuery ||
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryIcons = {
    location: MapPin,
    interest: Heart,
    goal: Target,
    general: Users,
  };

  return (
    <UserLayout title="Groups & Communities" subtitle="Connect with like-minded members">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1">
            <div className="flex gap-2">
              <Input
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 border-white/20 text-white max-w-md"
              />
            </div>
          </div>
          <Button
            onClick={() => router.push("/groups/create")}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(undefined)}
            className={selectedCategory === undefined ? "bg-primary" : "border-white/20"}
          >
            All Groups
          </Button>
          <Button
            variant={selectedCategory === "location" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("location")}
            className={selectedCategory === "location" ? "bg-primary" : "border-white/20"}
          >
            <MapPin className="h-4 w-4 mr-2" />
            By Location
          </Button>
          <Button
            variant={selectedCategory === "interest" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("interest")}
            className={selectedCategory === "interest" ? "bg-primary" : "border-white/20"}
          >
            <Heart className="h-4 w-4 mr-2" />
            By Interest
          </Button>
          <Button
            variant={selectedCategory === "goal" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("goal")}
            className={selectedCategory === "goal" ? "bg-primary" : "border-white/20"}
          >
            <Target className="h-4 w-4 mr-2" />
            By Goal
          </Button>
        </div>

        {/* My Groups */}
        {userGroups && userGroups.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Groups ({userGroups.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userGroups.map((group) => {
                  const CategoryIcon = categoryIcons[group.category] || Users;
                  return (
                    <Link key={group._id} href={`/groups/${group._id}`}>
                      <Card className="bg-white/5 border-white/10 hover:border-primary/50 transition-colors cursor-pointer h-full">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {group.image ? (
                              <Image
                                src={group.image}
                                alt={group.name}
                                width={48}
                                height={48}
                                className="rounded-lg"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                                <CategoryIcon className="h-6 w-6 text-primary" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white truncate">{group.name}</h3>
                              <p className="text-sm text-white/60 line-clamp-2">
                                {group.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {group.memberCount} members
                                </Badge>
                                {group.isPublic ? (
                                  <Globe className="h-3 w-3 text-white/40" />
                                ) : (
                                  <Lock className="h-3 w-3 text-white/40" />
                                )}
                                {group.membershipRole === "admin" && (
                                  <Badge variant="outline" className="text-xs">
                                    Admin
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Groups */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle>Discover Groups</CardTitle>
            <CardDescription className="text-white/60">
              Find groups that match your interests and goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredGroups && filteredGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGroups.map((group) => {
                  const CategoryIcon = categoryIcons[group.category] || Users;
                  return (
                    <Card
                      key={group._id}
                      className="bg-white/5 border-white/10 hover:border-primary/50 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          {group.image ? (
                            <Image
                              src={group.image}
                              alt={group.name}
                              width={48}
                              height={48}
                              className="rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                              <CategoryIcon className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate">{group.name}</h3>
                            <p className="text-sm text-white/60 line-clamp-2">
                              {group.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {group.memberCount} members
                            </Badge>
                            {group.isPublic ? (
                              <Globe className="h-3 w-3 text-white/40" />
                            ) : (
                              <Lock className="h-3 w-3 text-white/40" />
                            )}
                          </div>
                          {group.isMember ? (
                            <div className="flex gap-2">
                              <Link href={`/groups/${group._id}`}>
                                <Button size="sm" variant="outline" className="border-white/20">
                                  View
                                </Button>
                              </Link>
                              {group.userRole !== "admin" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleLeaveGroup(group._id)}
                                  className="border-white/20"
                                >
                                  <UserMinus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleJoinGroup(group._id)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Join
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-white/60">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No groups found. Be the first to create one!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}

