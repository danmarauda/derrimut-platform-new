"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MapPin, Users, Plus, Clock } from "lucide-react";
import { toast } from "sonner";
import { Id } from "../../../../convex/_generated/dataModel";

export default function GroupWorkoutsPage() {
  const { user } = useUser();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationId, setLocationId] = useState<Id<"organizations"> | undefined>();
  const [scheduledTime, setScheduledTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  const groupWorkouts = useQuery(api.friends.getUserGroupWorkouts, user?.id ? {} : "skip");
  const friends = useQuery(api.friends.getUserFriends, user?.id ? {} : "skip");
  const locations = useQuery(api.organizations.getOrganizations, {});

  const createGroupWorkout = useMutation(api.friends.createGroupWorkout);

  const handleCreateWorkout = async () => {
    if (!title.trim() || !description.trim() || !locationId || !scheduledTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createGroupWorkout({
        title: title.trim(),
        description: description.trim(),
        locationId: locationId as Id<"organizations">,
        scheduledTime: new Date(scheduledTime).getTime(),
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
        friendClerkIds: selectedFriends,
      });
      toast.success("Group workout created!");
      setShowCreateForm(false);
      setTitle("");
      setDescription("");
      setScheduledTime("");
      setMaxParticipants("");
      setSelectedFriends([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to create group workout");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <UserLayout title="Group Workouts" subtitle="Workout with friends">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Group Workouts</h1>
            <p className="text-white/70 mt-1">Schedule workouts with your friends</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Workout
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle>Create Group Workout</CardTitle>
              <CardDescription>Invite friends to join your workout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Workout title (e.g., Morning Cardio Session)"
                className="bg-white/10 border-white/20 text-white"
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Workout description"
                className="bg-white/10 border-white/20 text-white resize-none"
              />
              <div>
                <label className="text-white/90 text-sm mb-2 block">Location</label>
                <select
                  value={locationId || ""}
                  onChange={(e) => setLocationId(e.target.value as Id<"organizations">)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Select location</option>
                  {locations?.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-white/90 text-sm mb-2 block">Scheduled Time</label>
                <Input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <Input
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                placeholder="Max participants (optional)"
                type="number"
                className="bg-white/10 border-white/20 text-white"
              />
              <div>
                <label className="text-white/90 text-sm mb-2 block">Invite Friends</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {friends?.map((friend) => (
                    <label
                      key={friend.friendClerkId}
                      className="flex items-center gap-2 p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFriends.includes(friend.friendClerkId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFriends([...selectedFriends, friend.friendClerkId]);
                          } else {
                            setSelectedFriends(
                              selectedFriends.filter((id) => id !== friend.friendClerkId)
                            );
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-white">{friend.friendName}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateWorkout}
                  className="bg-primary hover:bg-primary/90 flex-1"
                >
                  Create Workout
                </Button>
                <Button
                  onClick={() => setShowCreateForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workouts List */}
        <div className="space-y-4">
          {groupWorkouts && groupWorkouts.length > 0 ? (
            groupWorkouts.map((workout) => (
              <Card key={workout._id} className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle>{workout.title}</CardTitle>
                  <CardDescription>{workout.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {workout.locationName}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {new Date(workout.scheduledTime).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {workout.participants.length}
                      {workout.maxParticipants && ` / ${workout.maxParticipants}`} participants
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-white/70 mb-2">Participants:</p>
                    <div className="flex flex-wrap gap-2">
                      {workout.participants.map((p: any) => (
                        <span
                          key={p.id}
                          className="px-2 py-1 bg-white/10 rounded text-sm text-white"
                        >
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/70">No group workouts scheduled</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </UserLayout>
  );
}

