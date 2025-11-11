import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Wearable Device Integration System
 * Connect and sync data from Apple Health, Google Fit, Fitbit, Strava
 */

// Connect wearable device
export const connectWearable = action({
  args: {
    platform: v.union(
      v.literal("apple_health"),
      v.literal("google_fit"),
      v.literal("fitbit"),
      v.literal("strava")
    ),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    platformUserId: v.string(),
    syncFrequency: v.union(v.literal("realtime"), v.literal("hourly"), v.literal("daily")),
  },
  handler: async (ctx, args): Promise<any> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(api.users.getUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if connection already exists
    const existing: any = await ctx.runQuery(api.wearables.getWearableConnection, {
      platform: args.platform,
    });

    if (existing) {
      // Update existing connection
      await ctx.runMutation(api.wearables.updateWearableConnection, {
        connectionId: existing._id,
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        syncFrequency: args.syncFrequency,
        isActive: true,
        lastSyncedAt: Date.now(),
      });
      return existing._id;
    } else {
      // Create new connection
      const connectionId: any = await ctx.runMutation(api.wearables.createWearableConnection, {
        platform: args.platform,
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        platformUserId: args.platformUserId,
        syncFrequency: args.syncFrequency,
      });
      return connectionId;
    }
  },
});

// Create wearable connection (internal)
export const createWearableConnection = mutation({
  args: {
    platform: v.union(
      v.literal("apple_health"),
      v.literal("google_fit"),
      v.literal("fitbit"),
      v.literal("strava")
    ),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    platformUserId: v.string(),
    syncFrequency: v.union(v.literal("realtime"), v.literal("hourly"), v.literal("daily")),
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

    const connectionId = await ctx.db.insert("wearableConnections", {
      userId: user._id,
      clerkId: identity.subject,
      platform: args.platform,
      accessToken: args.accessToken, // In production, encrypt this
      refreshToken: args.refreshToken,
      platformUserId: args.platformUserId,
      isActive: true,
      syncFrequency: args.syncFrequency,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return connectionId;
  },
});

// Get wearable connection
export const getWearableConnection = query({
  args: {
    platform: v.union(
      v.literal("apple_health"),
      v.literal("google_fit"),
      v.literal("fitbit"),
      v.literal("strava")
    ),
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
      return null;
    }

    return await ctx.db
      .query("wearableConnections")
      .withIndex("by_user_platform", (q) => q.eq("userId", user._id).eq("platform", args.platform))
      .first();
  },
});

// Update wearable connection
export const updateWearableConnection = mutation({
  args: {
    connectionId: v.id("wearableConnections"),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    syncFrequency: v.optional(v.union(v.literal("realtime"), v.literal("hourly"), v.literal("daily"))),
    isActive: v.optional(v.boolean()),
    lastSyncedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const connection = await ctx.db.get(args.connectionId);
    if (!connection || connection.clerkId !== identity.subject) {
      throw new Error("Connection not found");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.accessToken !== undefined) updates.accessToken = args.accessToken;
    if (args.refreshToken !== undefined) updates.refreshToken = args.refreshToken;
    if (args.syncFrequency !== undefined) updates.syncFrequency = args.syncFrequency;
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    if (args.lastSyncedAt !== undefined) updates.lastSyncedAt = args.lastSyncedAt;

    await ctx.db.patch(args.connectionId, updates);
  },
});

// Sync wearable data
export const syncWearableData = action({
  args: {
    platform: v.union(
      v.literal("apple_health"),
      v.literal("google_fit"),
      v.literal("fitbit"),
      v.literal("strava")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const connection = await ctx.runQuery(api.wearables.getWearableConnection, {
      platform: args.platform,
    });

    if (!connection || !connection.isActive) {
      throw new Error("Wearable device not connected");
    }

    // Fetch data from platform API (placeholder - would integrate with actual APIs)
    const data: any[] = [];

    // Store data in Convex
    for (const entry of data) {
      await ctx.runMutation(api.wearables.storeWearableData, {
        platform: args.platform,
        dataType: entry.dataType,
        date: entry.date,
        value: entry.value,
        unit: entry.unit,
        workoutType: entry.workoutType,
        duration: entry.duration,
        metadata: entry.metadata,
      });
    }

    // Update last synced time
    await ctx.runMutation(api.wearables.updateWearableConnection, {
      connectionId: connection._id,
      lastSyncedAt: Date.now(),
    });

    return { synced: data.length };
  },
});

// Store wearable data
export const storeWearableData = mutation({
  args: {
    platform: v.union(
      v.literal("apple_health"),
      v.literal("google_fit"),
      v.literal("fitbit"),
      v.literal("strava")
    ),
    dataType: v.union(
      v.literal("workout"),
      v.literal("heart_rate"),
      v.literal("steps"),
      v.literal("sleep"),
      v.literal("calories")
    ),
    date: v.number(),
    value: v.number(),
    unit: v.string(),
    workoutType: v.optional(v.string()),
    duration: v.optional(v.number()),
    metadata: v.optional(v.string()),
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

    await ctx.db.insert("wearableData", {
      userId: user._id,
      clerkId: identity.subject,
      platform: args.platform,
      dataType: args.dataType,
      date: args.date,
      value: args.value,
      unit: args.unit,
      workoutType: args.workoutType,
      duration: args.duration,
      metadata: args.metadata,
      syncedAt: Date.now(),
      createdAt: Date.now(),
    });
  },
});

// Get wearable data
export const getWearableData = query({
  args: {
    platform: v.optional(v.union(
      v.literal("apple_health"),
      v.literal("google_fit"),
      v.literal("fitbit"),
      v.literal("strava")
    )),
    dataType: v.optional(v.union(
      v.literal("workout"),
      v.literal("heart_rate"),
      v.literal("steps"),
      v.literal("sleep"),
      v.literal("calories")
    )),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
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

    let data = await ctx.db
      .query("wearableData")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Filter by platform
    if (args.platform) {
      data = data.filter((d) => d.platform === args.platform);
    }

    // Filter by data type
    if (args.dataType) {
      data = data.filter((d) => d.dataType === args.dataType);
    }

    // Filter by date range
    if (args.startDate || args.endDate) {
      data = data.filter((d) => {
        const date = d.date;
        if (args.startDate && date < args.startDate) return false;
        if (args.endDate && date > args.endDate) return false;
        return true;
      });
    }

    return data.slice(0, args.limit || 100);
  },
});

// Get wearable summary (today's stats)
export const getWearableSummary = query({
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const todayData = await ctx.db
      .query("wearableData")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("date"), todayTimestamp))
      .collect();

    const summary = {
      steps: todayData.filter((d) => d.dataType === "steps").reduce((sum, d) => sum + d.value, 0),
      calories: todayData.filter((d) => d.dataType === "calories").reduce((sum, d) => sum + d.value, 0),
      heartRate: todayData.filter((d) => d.dataType === "heart_rate"),
      sleep: todayData.filter((d) => d.dataType === "sleep").reduce((sum, d) => sum + d.value, 0),
      workouts: todayData.filter((d) => d.dataType === "workout"),
    };

    return summary;
  },
});

// Disconnect wearable
export const disconnectWearable = mutation({
  args: {
    platform: v.union(
      v.literal("apple_health"),
      v.literal("google_fit"),
      v.literal("fitbit"),
      v.literal("strava")
    ),
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

    const connection = await ctx.db
      .query("wearableConnections")
      .withIndex("by_user_platform", (q) => q.eq("userId", user._id).eq("platform", args.platform))
      .first();

    if (connection) {
      await ctx.db.patch(connection._id, {
        isActive: false,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

