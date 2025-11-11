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
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Activity,
  Trophy,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function FriendsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const friends = useQuery(api.friends.getUserFriends, user?.id ? {} : "skip");
  const pendingRequests = useQuery(api.friends.getPendingFriendRequests, user?.id ? {} : "skip");
  const sentRequests = useQuery(api.friends.getSentFriendRequests, user?.id ? {} : "skip");
  const searchResults = useQuery(
    api.friends.searchUsers,
    searchQuery.length >= 2 ? { query: searchQuery } : "skip"
  );
  const friendActivity = useQuery(api.friends.getFriendActivity, user?.id ? {} : "skip");

  const sendRequest = useMutation(api.friends.sendFriendRequest);
  const acceptRequest = useMutation(api.friends.acceptFriendRequest);
  const declineRequest = useMutation(api.friends.declineFriendRequest);
  const removeFriend = useMutation(api.friends.removeFriend);

  const handleSendRequest = async (friendClerkId: string) => {
    try {
      await sendRequest({ friendClerkId });
      toast.success("Friend request sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send friend request");
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      await acceptRequest({ friendshipId: friendshipId as any });
      toast.success("Friend request accepted!");
    } catch (error: any) {
      toast.error("Failed to accept friend request");
    }
  };

  const handleDeclineRequest = async (friendshipId: string) => {
    try {
      await declineRequest({ friendshipId: friendshipId as any });
      toast.success("Friend request declined");
    } catch (error: any) {
      toast.error("Failed to decline friend request");
    }
  };

  const handleRemoveFriend = async (friendClerkId: string) => {
    if (!confirm("Are you sure you want to remove this friend?")) return;

    try {
      await removeFriend({ friendClerkId });
      toast.success("Friend removed");
    } catch (error: any) {
      toast.error("Failed to remove friend");
    }
  };

  if (!user) {
    router.push("/");
    return null;
  }

  return (
    <UserLayout title="Friends" subtitle="Connect with your gym community">
      <div className="space-y-6">
        {/* Search Friends */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Friends
            </CardTitle>
            <CardDescription className="text-white/60">
              Search for members to connect with
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            {searchResults && searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((result) => (
                  <div
                    key={result.clerkId}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      {result.image ? (
                        <Image
                          src={result.image}
                          alt={result.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">{result.name}</p>
                        <p className="text-sm text-white/60">{result.email}</p>
                      </div>
                    </div>
                    <div>
                      {result.friendshipStatus === "accepted" ? (
                        <Badge variant="secondary">Friends</Badge>
                      ) : result.friendshipStatus === "pending" ? (
                        <Badge variant="outline">Pending</Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleSendRequest(result.clerkId)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Friend
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Requests */}
        {pendingRequests && pendingRequests.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle>Friend Requests</CardTitle>
              <CardDescription className="text-white/60">
                {pendingRequests.length} pending request{pendingRequests.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      {request.requesterImage ? (
                        <Image
                          src={request.requesterImage}
                          alt={request.requesterName}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">{request.requesterName}</p>
                        <p className="text-sm text-white/60">{request.requesterEmail}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request._id)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeclineRequest(request._id)}
                        className="border-white/20 hover:bg-white/10"
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Friends List */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Friends
            </CardTitle>
            <CardDescription className="text-white/60">
              {friends?.length || 0} friend{friends?.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {friends && friends.length > 0 ? (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      {friend.friendImage ? (
                        <Image
                          src={friend.friendImage}
                          alt={friend.friendName}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">{friend.friendName}</p>
                        <p className="text-sm text-white/60">{friend.friendEmail}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveFriend(friend.friendClerkId)}
                      className="border-white/20 hover:bg-white/10"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No friends yet. Start connecting!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Friend Activity Feed */}
        {friendActivity && friendActivity.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Friend Activity
              </CardTitle>
              <CardDescription className="text-white/60">
                Recent activities from your friends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {friendActivity.slice(0, 10).map((activity: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    {activity.type === "check_in" ? (
                      <Calendar className="h-5 w-5 text-blue-500" />
                    ) : activity.type === "achievement" ? (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Activity className="h-5 w-5 text-green-500" />
                    )}
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        {activity.type === "check_in"
                          ? "Checked in at the gym"
                          : activity.type === "achievement"
                          ? `Unlocked achievement: ${activity.data.title}`
                          : "Activity"}
                      </p>
                      <p className="text-xs text-white/40">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
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

