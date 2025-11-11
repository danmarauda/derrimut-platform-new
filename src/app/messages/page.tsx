"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare,
  Send,
  Search,
  User,
  CheckCircle2,
  Clock,
  Plus,
  MoreVertical
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function MessagesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

  const conversations = useQuery(
    api.memberMessages.getConversations,
    user?.id ? {} : "skip"
  );
  const messages = useQuery(
    api.memberMessages.getMessages,
    user?.id && selectedConversation ? { otherClerkId: selectedConversation } : "skip"
  );
  const unreadCount = useQuery(
    api.memberMessages.getUnreadCount,
    user?.id ? {} : "skip"
  );

  const sendMessage = useMutation(api.memberMessages.sendMessage);
  const markAsRead = useMutation(api.memberMessages.markMessageAsRead);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Mark messages as read when viewing conversation
    if (selectedConversation && messages) {
      messages.forEach((msg: any) => {
        if (!msg.read && msg.recipientClerkId === user?.id) {
          markAsRead({ messageId: msg._id }).catch(console.error);
        }
      });
    }
  }, [selectedConversation, messages, user?.id, markAsRead]);

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

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      await sendMessage({
        recipientClerkId: selectedConversation,
        message: messageText,
        messageType: "direct",
      });
      setMessageText("");
      toast.success("Message sent");
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    }
  };

  const selectedConv = conversations?.find((c: any) => c.otherClerkId === selectedConversation);

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
      <section className="relative z-10 pt-32 pb-16 flex-grow">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Messages</h1>
            <p className="text-muted-foreground">Chat with trainers, members, and admins</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <Card className="lg:col-span-1 bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Conversations</CardTitle>
                  {unreadCount && unreadCount > 0 && (
                    <Badge className="bg-primary">{unreadCount}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 border-b border-white/10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search conversations..." className="pl-10" />
                  </div>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  {conversations && conversations.length > 0 ? (
                    <div className="divide-y divide-white/10">
                      {conversations.map((conv: any) => (
                        <div
                          key={conv.otherClerkId}
                          onClick={() => setSelectedConversation(conv.otherClerkId)}
                          className={`p-4 cursor-pointer hover:bg-white/5 transition-colors ${
                            selectedConversation === conv.otherClerkId ? "bg-white/10" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
                              {conv.otherUserImage ? (
                                <Image
                                  src={conv.otherUserImage}
                                  alt={conv.otherUserName || "User"}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <User className="h-6 w-6 text-primary" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold truncate">{conv.otherUserName || "Unknown"}</p>
                                {conv.unreadCount > 0 && (
                                  <Badge className="bg-primary text-xs">{conv.unreadCount}</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {conv.lastMessage.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No conversations yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-2 bg-white/5 border-white/10 flex flex-col">
              {selectedConversation ? (
                <>
                  <CardHeader className="border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary/10">
                        {selectedConv?.otherUserImage ? (
                          <Image
                            src={selectedConv.otherUserImage}
                            alt={selectedConv.otherUserName || "User"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle>{selectedConv?.otherUserName || "Unknown"}</CardTitle>
                        <CardDescription>Active now</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-0">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages && messages.length > 0 ? (
                        messages.map((msg: any) => {
                          const isOwn = msg.senderClerkId === user.id;
                          return (
                            <div
                              key={msg._id}
                              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  isOwn
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-white/10 text-foreground"
                                }`}
                              >
                                <p className="text-sm">{msg.message}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs opacity-70">
                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  {isOwn && (
                                    <span>
                                      {msg.read ? (
                                        <CheckCircle2 className="h-3 w-3" />
                                      ) : (
                                        <Clock className="h-3 w-3" />
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-white/10 p-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleSendMessage();
                            }
                          }}
                          className="flex-1"
                        />
                        <Button onClick={handleSendMessage}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Select a conversation to start messaging</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

