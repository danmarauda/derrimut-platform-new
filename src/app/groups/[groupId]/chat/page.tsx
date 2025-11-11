"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Id } from "../../../../convex/_generated/dataModel";

export default function GroupChatPage({ params }: { params: { groupId: string } }) {
  const { user } = useUser();
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const groupId = params.groupId as Id<"groups">;
  
  const group = useQuery(api.groups.getGroup, user?.id ? { groupId } : "skip");
  const messages = useQuery(api.groups.getGroupMessages, user?.id ? { groupId, limit: 50 } : "skip");
  
  const sendMessage = useMutation(api.groups.sendGroupMessage);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() && !imageUrl) return;

    try {
      await sendMessage({
        groupId,
        message: message.trim(),
        imageUrl,
      });
      setMessage("");
      setImageUrl(undefined);
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <UserLayout title={`${group?.name || "Group"} Chat`} subtitle="Group conversation">
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle>{group?.name} Chat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto space-y-4 pr-2">
            {messages?.map((msg) => (
              <div
                key={msg._id}
                className={`flex gap-3 ${
                  msg.clerkId === user.id ? "flex-row-reverse" : ""
                }`}
              >
                <Image
                  src={msg.userImage || "/default-avatar.png"}
                  alt={msg.userName}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div
                  className={`flex-1 ${
                    msg.clerkId === user.id ? "items-end" : "items-start"
                  } flex flex-col`}
                >
                  <p className="text-sm text-white/70 mb-1">{msg.userName}</p>
                  <div
                    className={`rounded-lg p-3 ${
                      msg.clerkId === user.id
                        ? "bg-primary text-white"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    {msg.imageUrl && (
                      <Image
                        src={msg.imageUrl}
                        alt="Message image"
                        width={200}
                        height={200}
                        className="rounded-lg mt-2"
                      />
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 pt-4 border-t border-white/10">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="bg-white/10 border-white/20 text-white resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() && !imageUrl}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </UserLayout>
  );
}

