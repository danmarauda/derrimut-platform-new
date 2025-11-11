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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Video,
  Play,
  Star,
  Heart,
  Filter,
  Search,
  Clock,
  Flame,
  TrendingUp,
  PlayCircle
} from "lucide-react";
import { toast } from "sonner";

export default function VideoWorkoutsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | undefined>(undefined);

  const videoWorkouts = useQuery(
    api.videoWorkouts.getVideoWorkouts,
    user?.id ? { limit: 50, category: selectedCategory, difficulty: selectedDifficulty, search: searchQuery || undefined } : "skip"
  );
  const favoriteVideos = useQuery(
    api.videoWorkouts.getFavoriteVideos,
    user?.id ? {} : "skip"
  );
  const videoHistory = useQuery(
    api.videoWorkouts.getUserVideoHistory,
    user?.id ? { limit: 20 } : "skip"
  );

  const toggleFavorite = useMutation(api.videoWorkouts.toggleVideoFavorite);
  const recordView = useMutation(api.videoWorkouts.recordVideoView);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <UserLayout title="Video Workout Library" subtitle="On-demand workout videos">
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

  const categories = [
    { value: undefined, label: "All Categories" },
    { value: "hiit", label: "HIIT" },
    { value: "yoga", label: "Yoga" },
    { value: "strength", label: "Strength" },
    { value: "cardio", label: "Cardio" },
    { value: "pilates", label: "Pilates" },
    { value: "stretching", label: "Stretching" },
    { value: "dance", label: "Dance" },
    { value: "boxing", label: "Boxing" },
  ];

  const difficulties = [
    { value: undefined, label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <UserLayout title="Video Workout Library" subtitle="On-demand workout videos">
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search workouts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                className="h-9 rounded-md border bg-background px-3"
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value || undefined)}
              >
                {categories.map((cat) => (
                  <option key={cat.value || "all"} value={cat.value || ""}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <select
                className="h-9 rounded-md border bg-background px-3"
                value={selectedDifficulty || ""}
                onChange={(e) => setSelectedDifficulty(e.target.value || undefined)}
              >
                {difficulties.map((diff) => (
                  <option key={diff.value || "all"} value={diff.value || ""}>
                    {diff.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            {videoWorkouts && videoWorkouts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videoWorkouts.map((video: any) => (
                  <Card key={video._id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors group">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <PlayCircle className="h-16 w-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-black/60 text-white">
                          {formatDuration(video.duration)}
                        </Badge>
                      </div>
                      {video.isFeatured && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-primary">Featured</Badge>
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                          <CardDescription className="mt-1">{video.instructorName}</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            try {
                              await toggleFavorite({ videoId: video._id });
                              toast.success("Favorite updated");
                            } catch (error: any) {
                              toast.error(error.message);
                            }
                          }}
                        >
                          <Heart className={`h-4 w-4 ${videoHistory?.some((v: any) => v.video?._id === video._id && v.favorited) ? "fill-red-500 text-red-500" : ""}`} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="capitalize">{video.category}</span>
                        <span>•</span>
                        <span className="capitalize">{video.difficulty}</span>
                        {video.caloriesBurned && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Flame className="h-3 w-3" />
                              {video.caloriesBurned} kcal
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">
                          {video.rating.toFixed(1)} ({video.ratingCount})
                        </span>
                        <span className="text-sm text-muted-foreground">
                          • {video.viewCount} views
                        </span>
                      </div>
                      <Button className="w-full" onClick={() => router.push(`/profile/videos/${video._id}`)}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Workout
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No videos found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            {favoriteVideos && favoriteVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteVideos.map((video: any) => (
                  <Card key={video._id} className="bg-white/5 border-white/10">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-black/60 text-white">
                          {formatDuration(video.duration)}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                      <CardDescription>{video.instructorName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Start Workout
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No favorite videos yet</p>
                  <Button onClick={() => setActiveTab("browse")}>Browse Videos</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {videoHistory && videoHistory.length > 0 ? (
              <div className="space-y-3">
                {videoHistory.map((view: any) => (
                  <Card key={view._id} className="bg-white/5 border-white/10">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={view.video?.thumbnailUrl}
                            alt={view.video?.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{view.video?.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {view.completed ? "Completed" : `${view.progress}% watched`} •{" "}
                            {new Date(view.viewedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {view.completed && (
                          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                            Completed
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No viewing history yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </UserLayout>
  );
}

