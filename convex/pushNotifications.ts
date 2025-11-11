"use node";

import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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

// Send push notification (action - calls external API)
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
    // Get user's active push subscriptions
    const subscriptions: any[] = await ctx.runQuery(api.pushNotifications.getUserPushSubscriptionsForAction, {
      clerkId: args.clerkId,
    });

    if (subscriptions.length === 0) {
      return { sent: 0, message: "No active subscriptions" };
    }

    // Check preferences for this notification type
    const preferenceMap: Record<string, string> = {
      achievement: "achievements",
      challenge: "challenges",
      class_reminder: "classReminders",
      booking: "bookings",
      system: "specialOffers",
      social: "social",
    };

    const preferenceKey = preferenceMap[args.type];
    if (!preferenceKey) {
      return { sent: 0, message: "Invalid notification type" };
    }

    // Filter subscriptions based on preferences
    const eligibleSubscriptions = subscriptions.filter(
      (sub: any) => sub.preferences[preferenceKey] === true
    );

    if (eligibleSubscriptions.length === 0) {
      return { sent: 0, message: "No subscriptions with preferences enabled" };
    }

    // Get VAPID keys from environment
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      console.warn("VAPID keys not configured, skipping push notification");
      return { sent: 0, message: "VAPID keys not configured" };
    }

    const webpush = require("web-push");
    webpush.setVapidDetails("mailto:notifications@derrimut.aliaslabs.ai", publicKey, privateKey);

    let sentCount = 0;
    const errors: string[] = [];

    // Send to each subscription
    for (const subscription of eligibleSubscriptions) {
      try {
        const payload = JSON.stringify({
          title: args.title,
          message: args.message,
          link: args.link,
          type: args.type,
          icon: "/logo.png",
        });

        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.keys.p256dh,
              auth: subscription.keys.auth,
            },
          },
          payload
        );

        sentCount++;
      } catch (error: any) {
        console.error("Error sending push notification:", error);
        errors.push(error.message);

        // If subscription is invalid, mark as inactive
        if (error.statusCode === 410 || error.statusCode === 404) {
          await ctx.runMutation(api.pushNotifications.unsubscribeFromPush, {
            endpoint: subscription.endpoint,
          });
        }
      }
    }

    return {
      sent: sentCount,
      message: errors.length > 0 ? `Some notifications failed: ${errors.join(", ")}` : undefined,
    };
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

