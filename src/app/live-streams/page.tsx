"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Radio,
  Play,
  Users,
  Clock,
  Calendar,
  Video,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function LiveStreamsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const liveStreams = useQuery(
    api.liveStreaming.getLiveStreams,
    user?.id ? { isLive: undefined, limit: 50 } : "skip"
  );

  const joinStream = useMutation(api.liveStreaming.joinLiveStream);
  const leaveStream = useMutation(api.liveStreaming.leaveLiveStream);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleJoinStream = async (streamId: string) => {
    try {
      await joinStream({ streamId });
      toast.success("Joined stream!");
      router.push(`/live-streams/${streamId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to join stream");
    }
  };

  const liveStreamsList = liveStreams || [];
  const activeStreams = liveStreamsList.filter((s: any) => s.isLive);
  const upcomingStreams = liveStreamsList.filter((s: any) => !s.isLive && s.startTime > Date.now());
  const pastStreams = liveStreamsList.filter((s: any) => !s.isLive && s.startTime <= Date.now());

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
      <section className="relative z-10 pt-32 pb-16 flex-grow">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Live Streaming Classes</h1>
            <p className="text-muted-foreground">Join live workout classes from anywhere</p>
          </div>

          {/* Live Now */}
          {activeStreams.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                <h2 className="text-2xl font-bold">Live Now</h2>
                <Badge className="bg-red-500">LIVE</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeStreams.map((stream: any) => (
                  <Card
                    key={stream._id}
                    className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20 hover:bg-red-500/15 transition-colors"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{stream.title}</CardTitle>
                          <CardDescription className="mt-1">{stream.description}</CardDescription>
                        </div>
                        <Badge className="bg-red-500 animate-pulse">LIVE</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {stream.currentViewers} viewers
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.floor((Date.now() - stream.startTime) / 60000)} min ago
                          </span>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => handleJoinStream(stream._id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Join Stream
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcomingStreams.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Upcoming Streams</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingStreams.map((stream: any) => (
                  <Card key={stream._id} className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-lg">{stream.title}</CardTitle>
                      <CardDescription>{stream.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(stream.startTime).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Capacity: {stream.capacity} viewers</span>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Starts Soon
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Past Streams */}
          {pastStreams.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Past Streams</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastStreams.map((stream: any) => (
                  <Card key={stream._id} className="bg-white/5 border-white/10 opacity-75">
                    <CardHeader>
                      <CardTitle className="text-lg">{stream.title}</CardTitle>
                      <CardDescription>{stream.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(stream.startTime).toLocaleDateString()}
                          </span>
                        </div>
                        {stream.recordingUrl ? (
                          <Button variant="outline" className="w-full">
                            <Video className="h-4 w-4 mr-2" />
                            Watch Recording
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            <span>No recording available</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {liveStreamsList.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Radio className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">No live streams scheduled</p>
                <p className="text-sm text-muted-foreground">
                  Check back later for upcoming live workout classes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}

