"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Trophy, Calendar, MapPin, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Id } from "../../../../convex/_generated/dataModel";

export default function GroupDetailPage() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as Id<"groups">;

  const group = useQuery(api.groups.getGroupById, user?.id ? { groupId } : "skip");
  const challenges = useQuery(api.groups.getGroupChallenges, user?.id ? { groupId } : "skip");
  const leaderboard = useQuery(api.groups.getGroupLeaderboard, user?.id ? { groupId, limit: 10 } : "skip");

  if (!user) {
    router.push("/");
    return null;
  }

  if (!group) {
    return (
      <UserLayout title="Group" subtitle="Loading...">
        <div className="animate-pulse">
          <div className="h-32 bg-white/5 rounded-lg"></div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title={group.name} subtitle={group.description}>
      <div className="space-y-6">
        {/* Group Header */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {group.image ? (
                <Image
                  src={group.image}
                  alt={group.name}
                  width={80}
                  height={80}
                  className="rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Users className="h-10 w-10 text-primary" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-white">{group.name}</h1>
                  {group.isPublic ? (
                    <Badge variant="secondary">Public</Badge>
                  ) : (
                    <Badge variant="secondary">Private</Badge>
                  )}
                </div>
                <p className="text-white/70 mb-4">{group.description}</p>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {group.memberCount} members
                  </div>
                  {group.locationId && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Location
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          {group.isMember && (
            <Link href={`/groups/${groupId}/chat`}>
              <Button className="bg-primary hover:bg-primary/90">
                <MessageSquare className="h-4 w-4 mr-2" />
                Open Chat
              </Button>
            </Link>
          )}
          {group.userRole === "admin" && (
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Manage Group
            </Button>
          )}
        </div>

        {/* Group Challenges */}
        {challenges && challenges.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Group Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {challenges.map((challenge: any) => (
                  <Link key={challenge._id} href={`/challenges/${challenge._id}`}>
                    <Card className="bg-white/5 border-white/10 hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <h3 className="text-white font-medium">{challenge.title}</h3>
                        <p className="text-white/60 text-sm">{challenge.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        {leaderboard && leaderboard.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Group Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((member: any, index: number) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white/60 font-bold w-6">{index + 1}</span>
                      <Image
                        src={member.userImage || "/default-avatar.png"}
                        alt={member.userName}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <span className="text-white">{member.userName}</span>
                    </div>
                    <Badge variant="secondary">
                      {member.completedChallenges} / {member.totalChallenges}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </UserLayout>
  );
}

