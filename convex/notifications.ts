import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/**
 * Notifications System
 * Push notifications and messaging for members
 */

// Get user notifications
export const getUserNotifications = query({
  args: {
    clerkId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = args.clerkId || identity.subject;
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .order("desc")
      .take(args.limit || 50);

    return notifications;
  },
});

// Mark notification as read
export const markNotificationRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.clerkId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.notificationId, {
      read: true,
    });

    return { success: true };
  },
});

// Mark all notifications as read
export const markAllNotificationsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    await Promise.all(
      notifications.map((notification) =>
        ctx.db.patch(notification._id, {
          read: true,
        })
      )
    );

    return { success: true, count: notifications.length };
  },
});

// Get unread notification count
export const getUnreadNotificationCount = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = args.clerkId || identity.subject;
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    return notifications.length;
  },
});

// Create notification (internal/admin/system use)
export const createNotification = mutation({
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
    skipAuthCheck: v.optional(v.boolean()), // Allow system to create notifications
  },
  handler: async (ctx, args) => {
    // If skipAuthCheck is true, allow system notifications
    if (!args.skipAuthCheck) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      // Only admins or system can create notifications
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .first();

      if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
        throw new Error("Unauthorized");
      }
    }

    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      clerkId: args.clerkId,
      type: args.type,
      title: args.title,
      message: args.message,
      link: args.link,
      read: false,
      createdAt: Date.now(),
    });

    return notificationId;
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
    skipAuthCheck: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<Id<"notifications">> => {
    // Create in-app notification
    const notificationId: Id<"notifications"> = await ctx.runMutation(api.notifications.createNotification, {
      userId: args.userId,
      clerkId: args.clerkId,
      type: args.type,
      title: args.title,
      message: args.message,
      link: args.link,
      skipAuthCheck: args.skipAuthCheck,
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
