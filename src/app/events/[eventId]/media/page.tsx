"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Image as ImageIcon, Video, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Id } from "../../../../convex/_generated/dataModel";

export default function EventMediaPage({ params }: { params: { eventId: string } }) {
  const { user } = useUser();
  const [uploading, setUploading] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [mediaType, setMediaType] = useState<"photo" | "video">("photo");

  const eventId = params.eventId as Id<"events">;
  
  const event = useQuery(api.events.getEventById, user?.id ? { eventId } : "skip");
  const media = useQuery(api.events.getEventMedia, user?.id ? { eventId, limit: 50 } : "skip");
  
  const uploadMedia = useMutation(api.events.uploadEventMedia);

  const handleUpload = async () => {
    if (!mediaUrl.trim()) {
      toast.error("Please provide a media URL");
      return;
    }

    setUploading(true);
    try {
      await uploadMedia({
        eventId,
        type: mediaType,
        url: mediaUrl,
        caption: caption.trim() || undefined,
      });
      toast.success("Media uploaded successfully!");
      setMediaUrl("");
      setCaption("");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload media");
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <UserLayout title={`${event?.title || "Event"} Media`} subtitle="Share photos and videos">
      <div className="space-y-6">
        {/* Upload Form */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle>Upload Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={mediaType === "photo" ? "default" : "outline"}
                onClick={() => setMediaType("photo")}
                size="sm"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Photo
              </Button>
              <Button
                variant={mediaType === "video" ? "default" : "outline"}
                onClick={() => setMediaType("video")}
                size="sm"
              >
                <Video className="h-4 w-4 mr-2" />
                Video
              </Button>
            </div>
            <Input
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="Media URL (e.g., https://example.com/image.jpg)"
              className="bg-white/10 border-white/20 text-white"
            />
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption (optional)"
              className="bg-white/10 border-white/20 text-white resize-none"
            />
            <Button
              onClick={handleUpload}
              disabled={uploading || !mediaUrl.trim()}
              className="bg-primary hover:bg-primary/90 w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {mediaType === "photo" ? "Photo" : "Video"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Media Gallery */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Event Media</h2>
          {media && media.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {media.map((item) => (
                <Card key={item._id} className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardContent className="p-4">
                    {item.type === "photo" ? (
                      <Image
                        src={item.url}
                        alt={item.caption || "Event photo"}
                        width={300}
                        height={200}
                        className="rounded-lg w-full h-48 object-cover"
                      />
                    ) : (
                      <video
                        src={item.url}
                        controls
                        className="rounded-lg w-full h-48 object-cover"
                      />
                    )}
                    {item.caption && (
                      <p className="text-white/90 mt-2 text-sm">{item.caption}</p>
                    )}
                    <p className="text-white/60 text-xs mt-1">
                      By {item.userName} • {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="py-12 text-center">
                <ImageIcon className="h-12 w-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/70">No media uploaded yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </UserLayout>
  );
}

