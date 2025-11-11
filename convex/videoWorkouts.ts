import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Video Workout Library System
 * On-demand workout videos with tracking and favorites
 */

// Create video workout (admin/instructor)
export const createVideoWorkout = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    videoUrl: v.string(),
    thumbnailUrl: v.string(),
    duration: v.number(),
    category: v.union(
      v.literal("hiit"),
      v.literal("yoga"),
      v.literal("strength"),
      v.literal("cardio"),
      v.literal("pilates"),
      v.literal("stretching"),
      v.literal("dance"),
      v.literal("boxing")
    ),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    instructorName: v.string(),
    instructorImage: v.optional(v.string()),
    caloriesBurned: v.optional(v.number()),
    equipment: v.array(v.string()),
    tags: v.array(v.string()),
    isFeatured: v.boolean(),
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

    if (!user || (user.role !== "admin" && user.role !== "superadmin" && user.role !== "trainer")) {
      throw new Error("Unauthorized: Admin or trainer access required");
    }

    const videoId = await ctx.db.insert("videoWorkouts", {
      title: args.title,
      description: args.description,
      videoUrl: args.videoUrl,
      thumbnailUrl: args.thumbnailUrl,
      duration: args.duration,
      category: args.category,
      difficulty: args.difficulty,
      instructorId: user.role === "trainer" ? user._id : undefined,
      instructorName: args.instructorName,
      instructorImage: args.instructorImage,
      caloriesBurned: args.caloriesBurned,
      equipment: args.equipment,
      tags: args.tags,
      viewCount: 0,
      completionCount: 0,
      rating: 0,
      ratingCount: 0,
      isFeatured: args.isFeatured,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return videoId;
  },
});

// Get video workouts
export const getVideoWorkouts = query({
  args: {
    category: v.optional(v.union(
      v.literal("hiit"),
      v.literal("yoga"),
      v.literal("strength"),
      v.literal("cardio"),
      v.literal("pilates"),
      v.literal("stretching"),
      v.literal("dance"),
      v.literal("boxing")
    )),
    difficulty: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
    featured: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let videos = await ctx.db
      .query("videoWorkouts")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Filter by category
    if (args.category) {
      videos = videos.filter((v) => v.category === args.category);
    }

    // Filter by difficulty
    if (args.difficulty) {
      videos = videos.filter((v) => v.difficulty === args.difficulty);
    }

    // Filter featured
    if (args.featured !== undefined) {
      videos = videos.filter((v) => v.isFeatured === args.featured);
    }

    // Search
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      videos = videos.filter(
        (v) =>
          v.title.toLowerCase().includes(searchLower) ||
          v.description.toLowerCase().includes(searchLower) ||
          v.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort by featured, then by view count
    videos.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return b.viewCount - a.viewCount;
    });

    return videos.slice(0, args.limit || 50);
  },
});

// Get video workout details
export const getVideoWorkout = query({
  args: {
    videoId: v.id("videoWorkouts"),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video || !video.isActive) {
      throw new Error("Video workout not found");
    }

    return video;
  },
});

// Record video view
export const recordVideoView = mutation({
  args: {
    videoId: v.id("videoWorkouts"),
    progress: v.number(), // Percentage watched
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

    // Check if view already exists
    const existingView = await ctx.db
      .query("videoWorkoutViews")
      .withIndex("by_user_video", (q) => q.eq("userId", user._id).eq("videoWorkoutId", args.videoId))
      .first();

    if (existingView) {
      // Update existing view
      await ctx.db.patch(existingView._id, {
        progress: args.progress,
        viewedAt: Date.now(),
        completed: args.progress >= 90, // Consider 90%+ as completed
        completedAt: args.progress >= 90 ? Date.now() : existingView.completedAt,
      });
    } else {
      // Create new view
      await ctx.db.insert("videoWorkoutViews", {
        userId: user._id,
        clerkId: identity.subject,
        videoWorkoutId: args.videoId,
        viewedAt: Date.now(),
        completed: args.progress >= 90,
        completedAt: args.progress >= 90 ? Date.now() : undefined,
        progress: args.progress,
        favorited: false,
        createdAt: Date.now(),
      });

      // Increment view count
      const video = await ctx.db.get(args.videoId);
      if (video) {
        await ctx.db.patch(args.videoId, {
          viewCount: video.viewCount + 1,
        });
      }
    }

    return { success: true };
  },
});

// Mark video as completed
export const completeVideoWorkout = mutation({
  args: {
    videoId: v.id("videoWorkouts"),
    rating: v.optional(v.number()),
    review: v.optional(v.string()),
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

    // Update or create view
    const existingView = await ctx.db
      .query("videoWorkoutViews")
      .withIndex("by_user_video", (q) => q.eq("userId", user._id).eq("videoWorkoutId", args.videoId))
      .first();

    if (existingView) {
      await ctx.db.patch(existingView._id, {
        completed: true,
        completedAt: Date.now(),
        progress: 100,
        rating: args.rating,
        review: args.review,
      });
    } else {
      await ctx.db.insert("videoWorkoutViews", {
        userId: user._id,
        clerkId: identity.subject,
        videoWorkoutId: args.videoId,
        viewedAt: Date.now(),
        completed: true,
        completedAt: Date.now(),
        progress: 100,
        rating: args.rating,
        review: args.review,
        favorited: false,
        createdAt: Date.now(),
      });
    }

    // Update video completion count and rating
    const video = await ctx.db.get(args.videoId);
    if (video) {
      const views = await ctx.db
        .query("videoWorkoutViews")
        .withIndex("by_video", (q) => q.eq("videoWorkoutId", args.videoId))
        .collect();

      const completedViews = views.filter((v) => v.completed);
      const ratings = views.filter((v) => v.rating).map((v) => v.rating!);

      await ctx.db.patch(args.videoId, {
        completionCount: completedViews.length,
        rating: ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0,
        ratingCount: ratings.length,
        updatedAt: Date.now(),
      });
    }

    // Award loyalty points for completion
    await ctx.scheduler.runAfter(0, api.loyalty.addPointsWithExpiration, {
      clerkId: identity.subject,
      points: 30, // 30 points for completing a video workout
      source: "check_in", // Using check_in source
      description: `Video workout completed`,
      relatedId: args.videoId,
    });

    return { success: true };
  },
});

// Toggle favorite
export const toggleVideoFavorite = mutation({
  args: {
    videoId: v.id("videoWorkouts"),
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

    const view = await ctx.db
      .query("videoWorkoutViews")
      .withIndex("by_user_video", (q) => q.eq("userId", user._id).eq("videoWorkoutId", args.videoId))
      .first();

    if (view) {
      await ctx.db.patch(view._id, {
        favorited: !view.favorited,
      });
      return { favorited: !view.favorited };
    } else {
      // Create view with favorite
      await ctx.db.insert("videoWorkoutViews", {
        userId: user._id,
        clerkId: identity.subject,
        videoWorkoutId: args.videoId,
        viewedAt: Date.now(),
        completed: false,
        progress: 0,
        favorited: true,
        createdAt: Date.now(),
      });
      return { favorited: true };
    }
  },
});

// Get user's video workout history
export const getUserVideoHistory = query({
  args: {
    limit: v.optional(v.number()),
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
      return [];
    }

    const views = await ctx.db
      .query("videoWorkoutViews")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit || 50);

    // Enrich with video details
    const enrichedViews = await Promise.all(
      views.map(async (view) => {
        const video = await ctx.db.get(view.videoWorkoutId);
        return {
          ...view,
          video: video || null,
        };
      })
    );

    return enrichedViews;
  },
});

// Get favorite videos
export const getFavoriteVideos = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    const favorites = await ctx.db
      .query("videoWorkoutViews")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("favorited"), true))
      .collect();

    // Enrich with video details
    const enrichedFavorites = await Promise.all(
      favorites.map(async (fav) => {
        const video = await ctx.db.get(fav.videoWorkoutId);
        return video;
      })
    );

    return enrichedFavorites.filter(Boolean);
  },
});

