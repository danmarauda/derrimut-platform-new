import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

/**
 * Push Notifications System
 * Browser and mobile push notifications
 */

// Subscribe to push notifications
export const subscribeToPush = mutation({
  args: {
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
    userAgent: v.optional(v.string()),
    deviceType: v.optional(v.union(v.literal("browser"), v.literal("mobile"))),
    preferences: v.object({
      achievements: v.boolean(),
      challenges: v.boolean(),
      classReminders: v.boolean(),
      bookings: v.boolean(),
      streakReminders: v.boolean(),
      workoutReminders: v.boolean(),
      specialOffers: v.boolean(),
      social: v.boolean(),
    }),
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

    // Check if subscription already exists
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (existing) {
      // Update existing subscription
      await ctx.db.patch(existing._id, {
        preferences: args.preferences,
        isActive: true,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    // Create new subscription
    const subscriptionId = await ctx.db.insert("pushSubscriptions", {
      userId: user._id,
      clerkId: identity.subject,
      endpoint: args.endpoint,
      keys: args.keys,
      userAgent: args.userAgent,
      deviceType: args.deviceType || "browser",
      preferences: args.preferences,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return subscriptionId;
  },
});

// Unsubscribe from push notifications
export const unsubscribeFromPush = mutation({
  args: {
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const subscription = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (!subscription || subscription.clerkId !== identity.subject) {
      throw new Error("Subscription not found or unauthorized");
    }

    await ctx.db.patch(subscription._id, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update push notification preferences
export const updatePushPreferences = mutation({
  args: {
    subscriptionId: v.id("pushSubscriptions"),
    preferences: v.object({
      achievements: v.boolean(),
      challenges: v.boolean(),
      classReminders: v.boolean(),
      bookings: v.boolean(),
      streakReminders: v.boolean(),
      workoutReminders: v.boolean(),
      specialOffers: v.boolean(),
      social: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const subscription = await ctx.db.get(args.subscriptionId);
    if (!subscription || subscription.clerkId !== identity.subject) {
      throw new Error("Subscription not found or unauthorized");
    }

    await ctx.db.patch(args.subscriptionId, {
      preferences: args.preferences,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get user's push subscriptions
export const getUserPushSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const subscriptions = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return subscriptions;
  },
});

// Send push notification (action - delegates to Node.js action)
export const sendPushNotification = action({
  args: {
    clerkId: v.string(),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
    type: v.union(
      v.literal("achievement"),
      v.literal("challenge"),
      v.literal("class_reminder"),
      v.literal("booking"),
      v.literal("system"),
      v.literal("social")
    ),
  },
  handler: async (ctx, args): Promise<{ sent: number; message?: string }> => {
    // Delegate to Node.js action for web-push
    return await ctx.runAction(internal.pushNotificationsActions.sendPushNotificationInternal, args);
  },
});

// Helper query for action (no auth check needed)
export const getUserPushSubscriptionsForAction = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return subscriptions;
  },
});

// Create notification and send push (combined)
export const createNotificationWithPush = mutation({
  args: {
    userId: v.id("users"),
    clerkId: v.string(),
    type: v.union(
      v.literal("achievement"),
      v.literal("challenge"),
      v.literal("class_reminder"),
      v.literal("booking"),
      v.literal("system"),
      v.literal("social")
    ),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
    sendPush: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<string> => {
    // Create in-app notification
    const notificationId: string = await ctx.runMutation(api.notifications.createNotification, {
      userId: args.userId,
      clerkId: args.clerkId,
      type: args.type,
      title: args.title,
      message: args.message,
      link: args.link,
      skipAuthCheck: true, // Allow system notifications
    });

    // Send push notification if requested
    if (args.sendPush !== false) {
      await ctx.scheduler.runAfter(0, api.pushNotifications.sendPushNotification, {
        clerkId: args.clerkId,
        title: args.title,
        message: args.message,
        link: args.link,
        type: args.type,
      });
    }

    return notificationId;
  },
});

