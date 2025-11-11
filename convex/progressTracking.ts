import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Advanced Progress Tracking System
 * Track body measurements, weight, photos, and strength progress
 */

// Record progress entry
export const recordProgress = mutation({
  args: {
    type: v.union(
      v.literal("weight"),
      v.literal("body_fat"),
      v.literal("measurement"),
      v.literal("photo"),
      v.literal("strength")
    ),
    value: v.optional(v.number()),
    unit: v.optional(v.string()),
    measurementType: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    photoType: v.optional(v.union(v.literal("before"), v.literal("after"), v.literal("progress"))),
    notes: v.optional(v.string()),
    exerciseName: v.optional(v.string()),
    exerciseData: v.optional(v.object({
      sets: v.number(),
      reps: v.number(),
      weight: v.number(),
      pr: v.optional(v.boolean()),
    })),
    recordedAt: v.optional(v.number()),
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

    const entryId = await ctx.db.insert("progressTracking", {
      userId: user._id,
      clerkId: identity.subject,
      type: args.type,
      value: args.value,
      unit: args.unit,
      measurementType: args.measurementType,
      photoUrl: args.photoUrl,
      photoType: args.photoType,
      notes: args.notes,
      exerciseName: args.exerciseName,
      exerciseData: args.exerciseData,
      recordedAt: args.recordedAt || Date.now(),
      createdAt: Date.now(),
    });

    // Check for PR (Personal Record) and notify
    if (args.exerciseData?.pr) {
      await ctx.scheduler.runAfter(0, api.notifications.createNotificationWithPush, {
        userId: user._id,
        clerkId: identity.subject,
        type: "achievement",
        title: "🎉 Personal Record!",
        message: `New PR: ${args.exerciseName} - ${args.exerciseData.weight}${args.unit || "kg"} x ${args.exerciseData.reps} reps`,
        link: `/profile/progress`,
        sendPush: true,
      });
    }

    return entryId;
  },
});

// Get progress history
export const getProgressHistory = query({
  args: {
    type: v.optional(v.union(
      v.literal("weight"),
      v.literal("body_fat"),
      v.literal("measurement"),
      v.literal("photo"),
      v.literal("strength")
    )),
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

    let query = ctx.db
      .query("progressTracking")
      .withIndex("by_user", (q) => q.eq("userId", user._id));

    if (args.type) {
      query = ctx.db
        .query("progressTracking")
        .withIndex("by_user_type", (q) => q.eq("userId", user._id).eq("type", args.type!));
    }

    const entries = await query.order("desc").take(args.limit || 50);

    return entries;
  },
});

// Get progress summary (latest values)
export const getProgressSummary = query({
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
      return null;
    }

    // Get latest entries for each type
    const latestWeight = await ctx.db
      .query("progressTracking")
      .withIndex("by_user_type", (q) => q.eq("userId", user._id).eq("type", "weight"))
      .order("desc")
      .first();

    const latestBodyFat = await ctx.db
      .query("progressTracking")
      .withIndex("by_user_type", (q) => q.eq("userId", user._id).eq("type", "body_fat"))
      .order("desc")
      .first();

    const latestPhotos = await ctx.db
      .query("progressTracking")
      .withIndex("by_user_type", (q) => q.eq("userId", user._id).eq("type", "photo"))
      .order("desc")
      .take(10);

    // Get measurement history
    const measurements = await ctx.db
      .query("progressTracking")
      .withIndex("by_user_type", (q) => q.eq("userId", user._id).eq("type", "measurement"))
      .order("desc")
      .take(30);

    return {
      latestWeight,
      latestBodyFat,
      latestPhotos,
      measurements,
    };
  },
});

// Get progress charts data
export const getProgressCharts = query({
  args: {
    type: v.union(
      v.literal("weight"),
      v.literal("body_fat"),
      v.literal("measurement"),
      v.literal("strength")
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
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

    let entries = await ctx.db
      .query("progressTracking")
      .withIndex("by_user_type", (q) => q.eq("userId", user._id).eq("type", args.type))
      .order("asc")
      .collect();

    // Filter by date range if provided
    if (args.startDate || args.endDate) {
      entries = entries.filter((entry) => {
        const date = entry.recordedAt;
        if (args.startDate && date < args.startDate) return false;
        if (args.endDate && date > args.endDate) return false;
        return true;
      });
    }

    // Format for chart
    return entries.map((entry) => ({
      date: entry.recordedAt,
      value: entry.value,
      unit: entry.unit,
      measurementType: entry.measurementType,
    }));
  },
});

// Share progress to community
export const shareProgressToCommunity = mutation({
  args: {
    progressEntryId: v.id("progressTracking"),
    message: v.optional(v.string()),
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

    const entry = await ctx.db.get(args.progressEntryId);
    if (!entry || entry.userId !== user._id) {
      throw new Error("Progress entry not found");
    }

    // Create community post
    const postId = await ctx.db.insert("communityPosts", {
      userId: user._id,
      clerkId: identity.subject,
      type: "progress",
      content: args.message || `Check out my progress!`,
      images: entry.photoUrl ? [entry.photoUrl] : [],
      likes: [],
      comments: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return postId;
  },
});

