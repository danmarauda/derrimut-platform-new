"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Share2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageCircle,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export default function SocialSharingPage() {
  const { user } = useUser();
  const [copied, setCopied] = useState<string | null>(null);

  const shareableContent = useQuery(
    api.socialSharing.getShareableContent,
    user?.id ? { limit: 20 } : "skip"
  );

  const shareToPlatform = useMutation(api.socialSharing.shareToPlatform);

  const handleShare = async (
    platform: "facebook" | "twitter" | "instagram" | "linkedin" | "whatsapp",
    contentType: "achievement" | "workout" | "progress" | "challenge",
    contentId: string
  ) => {
    try {
      const result = await shareToPlatform({
        platform,
        contentType,
        contentId,
      });

      if (result.isDirectLink) {
        // Open share URL in new window
        window.open(result.shareUrl, "_blank", "width=600,height=400");
      } else {
        // Copy to clipboard for Instagram
        if (result.textToCopy) {
          await navigator.clipboard.writeText(result.textToCopy);
          toast.success("Link copied to clipboard!");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to share");
    }
  };

  const handleCopyLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    toast.success("Link copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  if (!user) {
    return null;
  }

  const platforms = [
    { id: "facebook" as const, name: "Facebook", icon: Facebook, color: "bg-blue-600" },
    { id: "twitter" as const, name: "Twitter", icon: Twitter, color: "bg-sky-500" },
    { id: "instagram" as const, name: "Instagram", icon: Instagram, color: "bg-pink-600" },
    { id: "linkedin" as const, name: "LinkedIn", icon: Linkedin, color: "bg-blue-700" },
    { id: "whatsapp" as const, name: "WhatsApp", icon: MessageCircle, color: "bg-green-600" },
  ];

  return (
    <UserLayout title="Share Your Progress" subtitle="Share your achievements with friends">
      <div className="space-y-6">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Your Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/70 mb-4">
              Share your fitness journey, achievements, and progress on social media!
            </p>
          </CardContent>
        </Card>

        {/* Shareable Content */}
        {shareableContent && shareableContent.length > 0 ? (
          <div className="space-y-4">
            {shareableContent.map((item) => (
              <Card key={item.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                      {item.description && (
                        <p className="text-white/70 text-sm mb-2">{item.description}</p>
                      )}
                      <Badge variant="secondary" className="mt-2">
                        {item.type}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      {platforms.map((platform) => (
                        <Button
                          key={platform.id}
                          onClick={() =>
                            handleShare(platform.id, item.type, item.id as string)
                          }
                          size="sm"
                          className={`${platform.color} hover:opacity-90`}
                        >
                          <platform.icon className="h-4 w-4 mr-2" />
                          {platform.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="py-12 text-center">
              <Share2 className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/70">No shareable content yet</p>
              <p className="text-white/50 text-sm mt-2">
                Complete challenges and unlock achievements to share!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </UserLayout>
  );
}

