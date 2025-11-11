"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dumbbell,
  Plus,
  Trophy,
  Clock,
  Calendar,
  TrendingUp,
  Flame,
  History,
  FileText
} from "lucide-react";
import { toast } from "sonner";

export default function WorkoutsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("history");

  const workoutHistory = useQuery(
    api.workoutLogging.getWorkoutHistory,
    user?.id ? { limit: 50 } : "skip"
  );
  const personalRecords = useQuery(
    api.workoutLogging.getPersonalRecords,
    user?.id ? {} : "skip"
  );
  const workoutTemplates = useQuery(
    api.workoutLogging.getWorkoutTemplates,
    user?.id ? { includePublic: true } : "skip"
  );

  const logWorkout = useMutation(api.workoutLogging.logWorkout);
  const createTemplate = useMutation(api.workoutLogging.createWorkoutTemplate);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <UserLayout title="Workout Logging" subtitle="Log your workouts and track PRs">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-white/5 rounded-lg"></div>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!user) {
    router.push("/");
    return null;
  }

  return (
    <UserLayout title="Workout Logging" subtitle="Log your workouts and track PRs">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
              <Dumbbell className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workoutHistory?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Personal Records</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{personalRecords?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">PRs achieved</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workoutTemplates?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Saved templates</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="log">Log Workout</TabsTrigger>
            <TabsTrigger value="prs">PRs</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workout History</CardTitle>
                <CardDescription>Your logged workouts</CardDescription>
              </CardHeader>
              <CardContent>
                {workoutHistory && workoutHistory.length > 0 ? (
                  <div className="space-y-3">
                    {workoutHistory.map((workout: any) => (
                      <div
                        key={workout._id}
                        className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Dumbbell className="h-4 w-4 text-primary" />
                              <h3 className="font-semibold">{workout.workoutName}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {new Date(workout.workoutDate).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {workout.duration} min
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {workout.totalVolume} kg total
                              </span>
                              {workout.caloriesBurned && (
                                <span className="flex items-center gap-1">
                                  <Flame className="h-3 w-3" />
                                  {workout.caloriesBurned} kcal
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {workout.exercises.slice(0, 3).map((exercise: any, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 rounded bg-primary/10 text-primary"
                                >
                                  {exercise.exerciseName}
                                </span>
                              ))}
                              {workout.exercises.length > 3 && (
                                <span className="text-xs px-2 py-1 rounded bg-white/10">
                                  +{workout.exercises.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg bg-white/5">
                    <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No workouts logged yet</p>
                    <Button onClick={() => setActiveTab("log")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Log Your First Workout
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="log" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Log New Workout</CardTitle>
                <CardDescription>Record your exercises, sets, and reps</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Workout Name</Label>
                  <Input placeholder="e.g., Push Day, Leg Day" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input type="number" placeholder="60" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Exercises</Label>
                  <div className="border rounded-lg p-4 bg-white/5">
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Exercise logging form coming soon
                    </p>
                  </div>
                </div>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Workout
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Records</CardTitle>
                <CardDescription>Your best performances</CardDescription>
              </CardHeader>
              <CardContent>
                {personalRecords && personalRecords.length > 0 ? (
                  <div className="space-y-3">
                    {personalRecords.map((pr: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-500/20">
                              <Trophy className="h-5 w-5 text-yellow-500" />
                            </div>
                            <div>
                              <p className="font-semibold">{pr.exerciseName}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(pr.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold">
                              {pr.weight}
                              <span className="text-sm font-normal ml-1">kg</span>
                            </p>
                            <p className="text-sm text-muted-foreground">x {pr.reps} reps</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg bg-white/5">
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No personal records yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Log workouts and mark sets as PRs to track your records!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Workout Templates</CardTitle>
                    <CardDescription>Save and reuse workout routines</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {workoutTemplates && workoutTemplates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workoutTemplates.map((template: any) => (
                      <Card key={template._id} className="bg-white/5 border-white/10">
                        <CardHeader>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          {template.description && (
                            <CardDescription>{template.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-3 w-3" />
                              {template.estimatedDuration} minutes
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Dumbbell className="h-3 w-3" />
                              {template.exercises.length} exercises
                            </div>
                            {template.category && (
                              <div className="mt-2">
                                <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                                  {template.category}
                                </span>
                              </div>
                            )}
                          </div>
                          <Button className="w-full mt-4" variant="outline">
                            Use Template
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg bg-white/5">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No templates yet</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Template
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UserLayout>
  );
}

