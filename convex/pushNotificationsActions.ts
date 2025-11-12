"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Push Notifications Actions (Node.js runtime)
 * 
 * This file contains actions that require Node.js runtime for web-push library.
 */

// Send push notification (internal Node.js action)
export const sendPushNotificationInternal = internalAction({
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
      return { sent: 0, message: "No active push subscriptions found" };
    }

    // Map notification type to preference key
    const preferenceMap: Record<string, string> = {
      achievement: "achievements",
      challenge: "challenges",
      class_reminder: "classReminders",
      booking: "bookings",
      system: "system",
      social: "social",
    };

    const preferenceKey = preferenceMap[args.type] || "system";

    // Filter subscriptions based on preferences
    const eligibleSubscriptions = subscriptions.filter(
      (sub: any) => sub.preferences[preferenceKey] === true
    );

    if (eligibleSubscriptions.length === 0) {
      return { sent: 0, message: `No subscriptions with ${preferenceKey} preference enabled` };
    }

    // Get VAPID keys from environment
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      console.error("VAPID keys not configured");
      return { sent: 0, message: "Push notifications not configured" };
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title: args.title,
      body: args.message,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      data: {
        url: args.link || "/",
        type: args.type,
      },
    });

    // Send to all eligible subscriptions
    let sentCount = 0;
    const errors: string[] = [];

    // Import web-push dynamically (Node.js only)
    const webpush = require("web-push");
    webpush.setVapidDetails(
      "mailto:notifications@derrimut.aliaslabs.ai",
      publicKey,
      privateKey
    );

    for (const subscription of eligibleSubscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          payload
        );

        sentCount++;
      } catch (error: any) {
        console.error("Error sending push notification:", error);
        errors.push(error.message);

        // If subscription is invalid, mark it as inactive
        if (error.statusCode === 410 || error.statusCode === 404) {
          await ctx.runMutation(api.pushNotifications.updatePushSubscription, {
            subscriptionId: subscription._id,
            isActive: false,
          });
        }
      }
    }

    if (sentCount === 0 && errors.length > 0) {
      return { sent: 0, message: `Failed to send: ${errors.join(", ")}` };
    }

    return { sent: sentCount };
  },
});

