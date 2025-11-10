import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Community Feed System
 * Members can share progress, workouts, and achievements
 */

// Get community posts
export const getCommunityPosts = query({
  args: {
    locationId: v.optional(v.id("organizations")),
    type: v.optional(v.union(
      v.literal("progress"),
      v.literal("workout"),
      v.literal("achievement"),
      v.literal("question"),
      v.literal("general")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all posts and filter manually since we need multiple filters
    const allPosts = await ctx.db
      .query("communityPosts")
      .collect();
    
    // Apply filters
    let posts = allPosts;
    
    if (args.locationId) {
      posts = posts.filter(p => p.locationId === args.locationId);
    }
    
    if (args.type) {
      posts = posts.filter(p => p.type === args.type);
    }
    
    // Sort by createdAt descending and limit
    posts = posts
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, args.limit || 50);

    // Get user details and comment counts
    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        const comments = await Promise.all(
          post.comments.slice(0, 10).map(async (commentId) => {
            const comment = await ctx.db.get(commentId);
            if (!comment) return null;
            const commentUser = await ctx.db.get(comment.userId);
            return {
              ...comment,
              user: commentUser ? {
                name: commentUser.name,
                image: commentUser.image,
              } : null,
            };
          })
        );

        return {
          ...post,
          user: user ? {
            name: user.name,
            image: user.image,
          } : null,
          comments: comments.filter(Boolean),
          commentCount: post.comments.length,
          likeCount: post.likes.length,
        };
      })
    );

    return postsWithDetails;
  },
});

// Create a post
export const createPost = mutation({
  args: {
    content: v.string(),
    type: v.union(
      v.literal("progress"),
      v.literal("workout"),
      v.literal("achievement"),
      v.literal("question"),
      v.literal("general")
    ),
    images: v.optional(v.array(v.string())),
    locationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    const postId = await ctx.db.insert("communityPosts", {
      userId: user._id,
      clerkId: identity.subject,
      content: args.content,
      type: args.type,
      images: args.images || [],
      locationId: args.locationId,
      likes: [],
      comments: [],
      createdAt: now,
      updatedAt: now,
    });

    return postId;
  },
});

// Like a post
export const likePost = mutation({
  args: {
    postId: v.id("communityPosts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const isLiked = post.likes.includes(user._id);

    if (isLiked) {
      // Unlike
      await ctx.db.patch(args.postId, {
        likes: post.likes.filter((id) => id !== user._id),
        updatedAt: Date.now(),
      });
    } else {
      // Like
      await ctx.db.patch(args.postId, {
        likes: [...post.likes, user._id],
        updatedAt: Date.now(),
      });
    }

    return { liked: !isLiked };
  },
});

// Add comment to post
export const addComment = mutation({
  args: {
    postId: v.id("communityPosts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const commentId = await ctx.db.insert("communityComments", {
      postId: args.postId,
      userId: user._id,
      clerkId: identity.subject,
      content: args.content,
      createdAt: Date.now(),
    });

    // Add comment to post
    await ctx.db.patch(args.postId, {
      comments: [...post.comments, commentId],
      updatedAt: Date.now(),
    });

    return commentId;
  },
});

// Delete post
export const deletePost = mutation({
  args: {
    postId: v.id("communityPosts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.clerkId !== identity.subject) {
      throw new Error("Not authorized");
    }

    // Delete all comments
    await Promise.all(
      post.comments.map((commentId) => ctx.db.delete(commentId))
    );

    await ctx.db.delete(args.postId);
    return { success: true };
  },
});
