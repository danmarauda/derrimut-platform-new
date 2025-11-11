"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Video,
  Play,
  Star,
  Heart,
  Clock,
  Flame,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function VideoWorkoutDetailPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const videoId = params.videoId as string;
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);

  const video = useQuery(
    api.videoWorkouts.getVideoWorkout,
    user?.id && videoId ? { videoId: videoId as any } : "skip"
  );
  const videoView = useQuery(
    api.videoWorkouts.getUserVideoHistory,
    user?.id ? { limit: 100 } : "skip"
  );

  const recordView = useMutation(api.videoWorkouts.recordVideoView);
  const completeWorkout = useMutation(api.videoWorkouts.completeVideoWorkout);
  const toggleFavorite = useMutation(api.videoWorkouts.toggleVideoFavorite);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Update progress periodically
    const interval = setInterval(() => {
      if (video && progress < 100) {
        setProgress((prev) => Math.min(prev + 1, 100));
        recordView({ videoId: video._id, progress }).catch(console.error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [video, progress, recordView]);

  if (!mounted || !isLoaded) {
    return (
      <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
        <section className="relative z-10 pt-32 pb-16 flex-grow">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-accent rounded-lg"></div>
              <div className="h-64 bg-accent rounded-lg"></div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!user) {
    router.push("/");
    return null;
  }

  if (!video) {
    return (
      <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
        <section className="relative z-10 pt-32 pb-16 flex-grow">
          <div className="container mx-auto px-4">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Video not found</p>
                <Button onClick={() => router.push("/profile/videos")} className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Videos
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isFavorited = videoView?.some((v: any) => v.video?._id === video._id && v.favorited);

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
      <section className="relative z-10 pt-32 pb-16 flex-grow">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/profile/videos")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Videos
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/5 border-white/10">
                <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                  {video.videoUrl ? (
                    <video
                      src={video.videoUrl}
                      controls
                      className="w-full h-full"
                      onTimeUpdate={(e) => {
                        const videoEl = e.currentTarget;
                        const progressPercent = (videoEl.currentTime / videoEl.duration) * 100;
                        setProgress(progressPercent);
                        recordView({ videoId: video._id, progress: progressPercent }).catch(console.error);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-16 w-16 text-white/50" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl">{video.title}</CardTitle>
                      <CardDescription className="mt-2">{video.description}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        try {
                          await toggleFavorite({ videoId: video._id });
                          toast.success(isFavorited ? "Removed from favorites" : "Added to favorites");
                        } catch (error: any) {
                          toast.error(error.message);
                        }
                      }}
                    >
                      <Heart className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Badge className="capitalize">{video.category}</Badge>
                    <Badge variant="outline" className="capitalize">{video.difficulty}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">
                        {video.rating.toFixed(1)} ({video.ratingCount})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatDuration(video.duration)}
                    </div>
                    {video.caloriesBurned && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Flame className="h-4 w-4" />
                        {video.caloriesBurned} kcal
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Instructor Info */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle>Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {video.instructorImage ? (
                      <Image
                        src={video.instructorImage}
                        alt={video.instructorName}
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Video className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{video.instructorName}</p>
                      <p className="text-sm text-muted-foreground">Fitness Instructor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle>Workout Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Equipment Needed</p>
                    <div className="flex flex-wrap gap-2">
                      {video.equipment.map((eq: string) => (
                        <Badge key={eq} variant="outline">
                          {eq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {video.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={async () => {
                      try {
                        await completeWorkout({
                          videoId: video._id,
                          rating: 5,
                        });
                        toast.success("Workout completed! Great job!");
                      } catch (error: any) {
                        toast.error(error.message);
                      }
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle>Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Views</span>
                    <span className="font-semibold">{video.viewCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completions</span>
                    <span className="font-semibold">{video.completionCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{video.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

