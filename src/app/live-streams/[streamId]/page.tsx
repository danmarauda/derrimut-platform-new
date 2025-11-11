"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Radio,
  Play,
  Users,
  Clock,
  Video,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

export default function LiveStreamDetailPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const streamId = params.streamId as string;
  const [mounted, setMounted] = useState(false);

  const stream = useQuery(
    api.liveStreaming.getLiveStream,
    user?.id && streamId ? { streamId: streamId as any } : "skip"
  );
  const viewers = useQuery(
    api.liveStreaming.getStreamViewers,
    user?.id && streamId ? { streamId: streamId as any } : "skip"
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

  if (!stream) {
    return (
      <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
        <section className="relative z-10 pt-32 pb-16 flex-grow">
          <div className="container mx-auto px-4">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Stream not found</p>
                <Button onClick={() => router.push("/live-streams")} className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Streams
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  const handleJoin = async () => {
    try {
      await joinStream({ streamId: stream._id });
      toast.success("Joined stream!");
    } catch (error: any) {
      toast.error(error.message || "Failed to join stream");
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
      <section className="relative z-10 pt-32 pb-16 flex-grow">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/live-streams")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Streams
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stream Player */}
            <div className="lg:col-span-2 space-y-6">
              <Card className={`bg-white/5 border-white/10 ${stream.isLive ? "border-red-500/50" : ""}`}>
                <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                  {stream.isLive ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                        <Badge className="bg-red-500 animate-pulse">LIVE</Badge>
                      </div>
                      <iframe
                        src={stream.streamUrl}
                        className="w-full h-full"
                        allow="camera; microphone; fullscreen"
                        title={stream.title}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Stream starts at {new Date(stream.startTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">{stream.title}</CardTitle>
                  <CardDescription>{stream.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{stream.currentViewers} viewers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">
                        {new Date(stream.startTime).toLocaleTimeString()} -{" "}
                        {new Date(stream.endTime).toLocaleTimeString()}
                      </span>
                    </div>
                    {stream.hasChat && (
                      <Badge variant="outline">Chat Enabled</Badge>
                    )}
                    {stream.hasReactions && (
                      <Badge variant="outline">Reactions Enabled</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {stream.isLive && (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle>Live Chat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border rounded-lg bg-white/5">
                      <p className="text-muted-foreground">Chat coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle>Stream Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Platform</p>
                    <Badge className="capitalize">{stream.streamType.replace("_", " ")}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Capacity</p>
                    <p className="font-semibold">
                      {stream.currentViewers} / {stream.capacity} viewers
                    </p>
                  </div>
                  {stream.recordingUrl && (
                    <Button variant="outline" className="w-full">
                      <Video className="h-4 w-4 mr-2" />
                      Watch Recording
                    </Button>
                  )}
                  {stream.isLive && (
                    <Button className="w-full" onClick={handleJoin}>
                      <Play className="h-4 w-4 mr-2" />
                      Join Stream
                    </Button>
                  )}
                </CardContent>
              </Card>

              {viewers && viewers.length > 0 && (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle>Viewers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {viewers.slice(0, 10).map((viewer: any) => (
                        <div key={viewer._id} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>{viewer.userName || "Anonymous"}</span>
                        </div>
                      ))}
                      {viewers.length > 10 && (
                        <p className="text-sm text-muted-foreground">
                          +{viewers.length - 10} more
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

