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
  TrendingUp, 
  Weight, 
  Ruler, 
  Camera, 
  Trophy,
  Plus,
  Calendar,
  Image as ImageIcon,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

export default function ProgressPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const progressSummary = useQuery(
    api.progressTracking.getProgressSummary,
    user?.id ? {} : "skip"
  );
  const progressHistory = useQuery(
    api.progressTracking.getProgressHistory,
    user?.id ? { limit: 50 } : "skip"
  );

  const recordProgress = useMutation(api.progressTracking.recordProgress);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <UserLayout title="Progress Tracking" subtitle="Track your fitness journey">
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

  const handleRecordProgress = async (type: string, value?: number, unit?: string) => {
    try {
      await recordProgress({
        type: type as any,
        value,
        unit,
        recordedAt: Date.now(),
      });
      toast.success("Progress recorded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to record progress");
    }
  };

  return (
    <UserLayout title="Progress Tracking" subtitle="Track your fitness journey">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Weight</CardTitle>
              <Weight className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progressSummary?.latestWeight?.value || "--"}
                {progressSummary?.latestWeight?.unit && (
                  <span className="text-sm font-normal ml-1">{progressSummary.latestWeight.unit}</span>
                )}
              </div>
              {progressSummary?.latestWeight && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(progressSummary.latestWeight.recordedAt).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Body Fat</CardTitle>
              <BarChart3 className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progressSummary?.latestBodyFat?.value || "--"}
                {progressSummary?.latestBodyFat?.unit && (
                  <span className="text-sm font-normal ml-1">{progressSummary.latestBodyFat.unit}</span>
                )}
              </div>
              {progressSummary?.latestBodyFat && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(progressSummary.latestBodyFat.recordedAt).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress Photos</CardTitle>
              <Camera className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progressSummary?.latestPhotos?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total photos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Measurements</CardTitle>
              <Ruler className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progressSummary?.measurements?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total entries</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="measurements">Measurements</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Record</CardTitle>
                <CardDescription>Record your progress quickly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleRecordProgress("weight")}
                    variant="outline"
                    className="h-20 flex-col"
                  >
                    <Weight className="h-6 w-6 mb-2" />
                    Record Weight
                  </Button>
                  <Button
                    onClick={() => handleRecordProgress("body_fat")}
                    variant="outline"
                    className="h-20 flex-col"
                  >
                    <BarChart3 className="h-6 w-6 mb-2" />
                    Body Fat %
                  </Button>
                  <Button
                    onClick={() => handleRecordProgress("measurement")}
                    variant="outline"
                    className="h-20 flex-col"
                  >
                    <Ruler className="h-6 w-6 mb-2" />
                    Measurement
                  </Button>
                  <Button
                    onClick={() => handleRecordProgress("photo")}
                    variant="outline"
                    className="h-20 flex-col"
                  >
                    <Camera className="h-6 w-6 mb-2" />
                    Progress Photo
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {progressHistory && progressHistory.length > 0 ? (
                  <div className="space-y-3">
                    {progressHistory.slice(0, 10).map((entry: any) => (
                      <div
                        key={entry._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {entry.type === "weight" && <Weight className="h-4 w-4" />}
                            {entry.type === "body_fat" && <BarChart3 className="h-4 w-4" />}
                            {entry.type === "measurement" && <Ruler className="h-4 w-4" />}
                            {entry.type === "photo" && <Camera className="h-4 w-4" />}
                            {entry.type === "strength" && <Trophy className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{entry.type.replace("_", " ")}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(entry.recordedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {entry.value && (
                          <div className="text-right">
                            <p className="font-bold">
                              {entry.value}
                              {entry.unit && <span className="text-sm font-normal ml-1">{entry.unit}</span>}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No progress entries yet. Start tracking your journey!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weight" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weight Tracking</CardTitle>
                <CardDescription>Track your weight over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input type="number" placeholder="Weight" className="flex-1" />
                    <select className="h-9 rounded-md border bg-background px-3">
                      <option>kg</option>
                      <option>lbs</option>
                    </select>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Record
                    </Button>
                  </div>
                  {/* Chart would go here */}
                  <div className="h-64 flex items-center justify-center border rounded-lg bg-white/5">
                    <p className="text-muted-foreground">Weight chart coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="measurements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Body Measurements</CardTitle>
                <CardDescription>Track chest, waist, arms, etc.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Measurement Type</Label>
                      <select className="w-full h-9 rounded-md border bg-background px-3 mt-1">
                        <option>Chest</option>
                        <option>Waist</option>
                        <option>Arms</option>
                        <option>Thighs</option>
                        <option>Neck</option>
                      </select>
                    </div>
                    <div>
                      <Label>Value</Label>
                      <Input type="number" placeholder="0" className="mt-1" />
                    </div>
                  </div>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Record Measurement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Progress Photos</CardTitle>
                <CardDescription>Visual progress tracking</CardDescription>
              </CardHeader>
              <CardContent>
                {progressSummary?.latestPhotos && progressSummary.latestPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {progressSummary.latestPhotos.map((photo: any, idx: number) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                        {photo.photoUrl ? (
                          <img
                            src={photo.photoUrl}
                            alt={`Progress ${photo.photoType || "photo"}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/5">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                          <p className="text-xs text-white capitalize">{photo.photoType || "progress"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg bg-white/5">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No progress photos yet</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Photo
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
