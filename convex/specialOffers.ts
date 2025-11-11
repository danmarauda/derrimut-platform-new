import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

/**
 * Special Offers & Promotions System
 * Admin can create and send special offers to users
 */

// Create a special offer (admin only)
export const createSpecialOffer = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    discountCode: v.optional(v.string()),
    discountPercent: v.optional(v.number()),
    discountAmount: v.optional(v.number()),
    validUntil: v.number(), // Timestamp
    link: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    targetAudience: v.union(
      v.literal("all"),
      v.literal("active_members"),
      v.literal("inactive_members"),
      v.literal("new_members")
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

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      throw new Error("Unauthorized: Admin access required");
    }

    const offerId = await ctx.db.insert("specialOffers", {
      title: args.title,
      description: args.description,
      discountCode: args.discountCode,
      discountPercent: args.discountPercent,
      discountAmount: args.discountAmount,
      validUntil: args.validUntil,
      link: args.link,
      imageUrl: args.imageUrl,
      targetAudience: args.targetAudience,
      status: "active",
      sentCount: 0,
      openedCount: 0,
      clickedCount: 0,
      createdAt: Date.now(),
      createdBy: user._id,
    });

    // Schedule sending notifications to target audience
    await ctx.scheduler.runAfter(0, api.specialOffers.sendSpecialOfferNotifications, {
      offerId,
    });

    return offerId;
  },
});

// Send special offer notifications to target audience
export const sendSpecialOfferNotifications = action({
  args: {
    offerId: v.id("specialOffers"),
  },
  handler: async (ctx, args) => {
    const offer = await ctx.runQuery(api.specialOffers.getOffer, {
      offerId: args.offerId,
    });

    if (!offer || offer.status !== "active") {
      return { sent: 0, message: "Offer not found or inactive" };
    }

    // Get target users based on audience
    let users: any[] = [];
    
    if (offer.targetAudience === "all") {
      users = await ctx.runQuery(api.specialOffers.getAllUsers);
    } else if (offer.targetAudience === "active_members") {
      users = await ctx.runQuery(api.specialOffers.getActiveMembers);
    } else if (offer.targetAudience === "inactive_members") {
      users = await ctx.runQuery(api.specialOffers.getInactiveMembers);
    } else if (offer.targetAudience === "new_members") {
      users = await ctx.runQuery(api.specialOffers.getNewMembers);
    }

    let sentCount = 0;

    for (const user of users) {
      // Check push notification preferences
      const pushSubscriptions = await ctx.runQuery(
        internal.notificationScheduler.getUserPushSubscriptions,
        {
          clerkId: user.clerkId,
        }
      );

      const hasSpecialOffersEnabled = pushSubscriptions.some(
        (sub: any) => sub.isActive && sub.preferences.specialOffers
      );

      if (hasSpecialOffersEnabled) {
        // Send push notification
        await ctx.runAction(api.pushNotifications.sendPushNotification, {
          clerkId: user.clerkId,
          title: `🎉 ${offer.title}`,
          message: offer.description,
          link: offer.link || `/offers/${args.offerId}`,
          type: "system",
        });

        // Create in-app notification
        await ctx.runMutation(api.notifications.createNotificationWithPush, {
          userId: user._id,
          clerkId: user.clerkId,
          type: "system",
          title: offer.title,
          message: offer.description,
          link: offer.link || `/offers/${args.offerId}`,
          sendPush: false,
          skipAuthCheck: true,
        });

        sentCount++;
      }
    }

    // Update offer sent count
    await ctx.runMutation(api.specialOffers.updateOfferSentCount, {
      offerId: args.offerId,
      sentCount,
    });

    return { sent: sentCount, totalUsers: users.length };
  },
});

// Get offer
export const getOffer = query({
  args: { offerId: v.id("specialOffers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.offerId);
  },
});

// Get all active offers
export const getActiveOffers = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    return await ctx.db
      .query("specialOffers")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.gte(q.field("validUntil"), now)
        )
      )
      .order("desc")
      .collect();
  },
});

// Update offer sent count
export const updateOfferSentCount = mutation({
  args: {
    offerId: v.id("specialOffers"),
    sentCount: v.number(),
  },
  handler: async (ctx, args) => {
    const offer = await ctx.db.get(args.offerId);
    if (!offer) return;

    await ctx.db.patch(args.offerId, {
      sentCount: offer.sentCount + args.sentCount,
    });
  },
});

// Track offer open
export const trackOfferOpen = mutation({
  args: { offerId: v.id("specialOffers") },
  handler: async (ctx, args) => {
    const offer = await ctx.db.get(args.offerId);
    if (!offer) return;

    await ctx.db.patch(args.offerId, {
      openedCount: offer.openedCount + 1,
    });
  },
});

// Track offer click
export const trackOfferClick = mutation({
  args: { offerId: v.id("specialOffers") },
  handler: async (ctx, args) => {
    const offer = await ctx.db.get(args.offerId);
    if (!offer) return;

    await ctx.db.patch(args.offerId, {
      clickedCount: offer.clickedCount + 1,
    });
  },
});

// Helper queries for action
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getActiveMembers = query({
  args: {},
  handler: async (ctx) => {
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const userIds = new Set(memberships.map((m) => m.userId));
    const users = await Promise.all(
      Array.from(userIds).map((userId) => ctx.db.get(userId))
    );

    return users.filter((u) => u !== null) as any[];
  },
});

export const getInactiveMembers = query({
  args: {},
  handler: async (ctx) => {
    // Members who haven't checked in for 30+ days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    
    const allUsers = await ctx.db.query("users").collect();
    const inactiveUsers = [];

    for (const user of allUsers) {
      const recentCheckIn = await ctx.db
        .query("memberCheckIns")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", user.clerkId))
        .order("desc")
        .first();

      if (!recentCheckIn || recentCheckIn.checkInTime < thirtyDaysAgo) {
        inactiveUsers.push(user);
      }
    }

    return inactiveUsers;
  },
});

export const getNewMembers = query({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return await ctx.db
      .query("users")
      .filter((q) => q.gte(q.field("createdAt"), thirtyDaysAgo))
      .collect();
  },
});

