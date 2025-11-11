"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Watch,
  Activity,
  Heart,
  Footprints,
  Moon,
  Flame,
  Link as LinkIcon,
  CheckCircle2,
  X,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";

export default function WearablesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const wearableSummary = useQuery(
    api.wearables.getWearableSummary,
    user?.id ? {} : "skip"
  );
  const wearableData = useQuery(
    api.wearables.getWearableData,
    user?.id ? { limit: 50 } : "skip"
  );

  const connectWearable = useMutation(api.wearables.connectWearable);
  const disconnectWearable = useMutation(api.wearables.disconnectWearable);
  const syncWearableData = useMutation(api.wearables.syncWearableData);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <UserLayout title="Wearable Devices" subtitle="Connect and sync your fitness devices">
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

  const platforms = [
    {
      id: "apple_health",
      name: "Apple Health",
      icon: "🍎",
      color: "from-red-500/10 to-red-500/5",
      borderColor: "border-red-500/20",
    },
    {
      id: "google_fit",
      name: "Google Fit",
      icon: "🏃",
      color: "from-blue-500/10 to-blue-500/5",
      borderColor: "border-blue-500/20",
    },
    {
      id: "fitbit",
      name: "Fitbit",
      icon: "⌚",
      color: "from-teal-500/10 to-teal-500/5",
      borderColor: "border-teal-500/20",
    },
    {
      id: "strava",
      name: "Strava",
      icon: "🚴",
      color: "from-orange-500/10 to-orange-500/5",
      borderColor: "border-orange-500/20",
    },
  ];

  return (
    <UserLayout title="Wearable Devices" subtitle="Connect and sync your fitness devices">
      <div className="space-y-6">
        {/* Today's Summary */}
        {wearableSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Steps</CardTitle>
                <Footprints className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {wearableSummary.steps?.toLocaleString() || "0"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Today</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calories</CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {wearableSummary.calories?.toLocaleString() || "0"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Burned today</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                <Heart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {wearableSummary.heartRate?.length > 0
                    ? `${Math.round(wearableSummary.heartRate.reduce((sum: number, hr: any) => sum + hr.value, 0) / wearableSummary.heartRate.length)}`
                    : "--"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Avg BPM</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sleep</CardTitle>
                <Moon className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {wearableSummary.sleep ? `${wearableSummary.sleep.toFixed(1)}h` : "--"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Last night</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Connect</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Connect Your Devices</CardTitle>
                <CardDescription>
                  Sync data from your favorite fitness apps and wearables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {platforms.map((platform) => (
                    <Card
                      key={platform.id}
                      className={`bg-gradient-to-br ${platform.color} ${platform.borderColor} border hover:bg-white/10 transition-colors cursor-pointer`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{platform.icon}</div>
                            <div>
                              <h3 className="font-semibold">{platform.name}</h3>
                              <p className="text-sm text-muted-foreground">Not connected</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Synced Data</CardTitle>
                <CardDescription>Your wearable device data</CardDescription>
              </CardHeader>
              <CardContent>
                {wearableData && wearableData.length > 0 ? (
                  <div className="space-y-3">
                    {wearableData.map((entry: any) => (
                      <div
                        key={entry._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {entry.dataType === "steps" && <Footprints className="h-4 w-4" />}
                            {entry.dataType === "calories" && <Flame className="h-4 w-4" />}
                            {entry.dataType === "heart_rate" && <Heart className="h-4 w-4" />}
                            {entry.dataType === "sleep" && <Moon className="h-4 w-4" />}
                            {entry.dataType === "workout" && <Activity className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{entry.dataType.replace("_", " ")}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {entry.platform.replace("_", " ")} •{" "}
                              {new Date(entry.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {entry.value}
                            {entry.unit && <span className="text-sm font-normal ml-1">{entry.unit}</span>}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg bg-white/5">
                    <Watch className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No data synced yet</p>
                    <p className="text-sm text-muted-foreground">
                      Connect a device to start syncing your fitness data
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sync Settings</CardTitle>
                <CardDescription>Configure how often data is synced</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Sync Frequency</Label>
                  <select className="w-full h-9 rounded-md border bg-background px-3">
                    <option value="realtime">Real-time</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
                <Button className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Sync Now
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UserLayout>
  );
}

