"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  Heart, 
  Share2,
  MoreVertical,
  User,
  Trophy,
  Target,
  Image as ImageIcon,
  Send
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

/**
 * Post Card Component
 */
export function PostCard({ post }: { post: any }) {
  const { user } = useUser();
  const likePost = useMutation(api.community.likePost);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  
  const addComment = useMutation(api.community.addComment);
  const [isCommenting, setIsCommenting] = useState(false);
  
  const isLiked = user?.id && post.likes?.some((likeId: Id<"users">) => {
    // Need to check if current user's ID matches
    return false; // Will be fixed with proper user ID checking
  });
  
  const handleLike = async () => {
    try {
      setIsLiking(true);
      await likePost({ postId: post._id });
    } catch (error) {
      console.error("Failed to like post", error);
    } finally {
      setIsLiking(false);
    }
  };
  
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    try {
      setIsCommenting(true);
      await addComment({ postId: post._id, content: commentText });
      setCommentText("");
      setShowComments(true);
    } catch (error) {
      console.error("Failed to add comment", error);
    } finally {
      setIsCommenting(false);
    }
  };
  
  const getTypeIcon = () => {
    const iconMap: Record<string, any> = {
      progress: Target,
      workout: Trophy,
      achievement: Trophy,
      question: MessageSquare,
      general: MessageSquare,
    };
    const Icon = iconMap[post.type] || MessageSquare;
    return <Icon className="h-4 w-4" />;
  };
  
  return (
    <Card variant="premium">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {post.user?.image ? (
              <Image
                src={post.user.image}
                alt={post.user.name || "User"}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <User className="h-5 w-5 text-white/70" />
              </div>
            )}
            <div>
              <CardTitle className="text-base">{post.user?.name || "Anonymous"}</CardTitle>
              <CardDescription className="text-xs">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </CardDescription>
            </div>
          </div>
          <Badge variant="standard" className="capitalize flex items-center gap-1">
            {getTypeIcon()}
            {post.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-white/90 whitespace-pre-wrap">{post.content}</p>
        
        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {post.images.map((imageUrl: string, index: number) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-white/5">
                <Image
                  src={imageUrl}
                  alt={`Post image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-4 pt-2 border-t border-white/10">
          <Button
            variant="tertiary"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center gap-2"
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-red-400 text-red-400" : ""}`} />
            <span>{post.likeCount || 0}</span>
          </Button>
          
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.commentCount || 0}</span>
          </Button>
          
          <Button variant="tertiary" size="sm" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
        
        {showComments && (
          <div className="pt-4 border-t border-white/10 space-y-4">
            {post.comments && post.comments.length > 0 && (
              <div className="space-y-3">
                {post.comments.map((comment: any) => (
                  <div key={comment._id} className="flex items-start gap-2">
                    {comment.user?.image ? (
                      <Image
                        src={comment.user.image}
                        alt={comment.user.name || "User"}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-white/70" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">
                        {comment.user?.name || "Anonymous"}
                      </div>
                      <div className="text-sm text-white/70">{comment.content}</div>
                      <div className="text-xs text-white/50 mt-1">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <form onSubmit={handleComment} className="flex gap-2">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 min-h-[60px]"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={isCommenting || !commentText.trim()}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Create Post Component
 */
export function CreatePost() {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<"progress" | "workout" | "achievement" | "question" | "general">("general");
  const [isPosting, setIsPosting] = useState(false);
  
  const createPost = useMutation(api.community.createPost);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    try {
      setIsPosting(true);
      await createPost({
        content,
        type: postType,
      });
      setContent("");
      alert("Post created successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };
  
  return (
    <Card variant="premium" className="mb-6">
      <CardHeader>
        <CardTitle>Create Post</CardTitle>
        <CardDescription>Share your fitness journey with the community</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            {(["general", "progress", "workout", "achievement", "question"] as const).map((type) => (
              <Button
                key={type}
                type="button"
                variant={postType === type ? "primary" : "secondary"}
                size="sm"
                onClick={() => setPostType(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
          
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="min-h-[100px]"
          />
          
          <Button
            type="submit"
            variant="primary"
            disabled={isPosting || !content.trim()}
            className="w-full"
          >
            {isPosting ? "Posting..." : "Post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Community Feed Component
 */
export function CommunityFeed({ locationId }: { locationId?: Id<"organizations"> }) {
  const [selectedType, setSelectedType] = useState<string | undefined>();
  
  const posts = useQuery(
    api.community.getCommunityPosts,
    { locationId, type: selectedType as any, limit: 50 }
  );
  
  const types = ["all", "progress", "workout", "achievement", "question", "general"];
  
  if (!posts) {
    return (
      <Card variant="premium">
        <CardContent className="py-12">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-white/30 mx-auto mb-4 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        {types.map((type) => (
          <Button
            key={type}
            variant={selectedType === type || (type === "all" && !selectedType) ? "primary" : "secondary"}
            size="sm"
            onClick={() => setSelectedType(type === "all" ? undefined : type)}
            className="capitalize"
          >
            {type}
          </Button>
        ))}
      </div>
      
      {posts.length === 0 ? (
        <Card variant="premium">
          <CardContent className="py-12">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                No Posts Yet
              </h3>
              <p className="text-white/70 text-sm">
                Be the first to share your fitness journey!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
