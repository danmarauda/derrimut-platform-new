import { internalMutation, internalQuery, internalAction, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
// Note: convex/cron may not be available in all Convex versions
// import { cronJobs } from "convex/cron";

/**
 * Win-Back Campaigns System
 * Automated email campaigns to re-engage inactive members
 * 
 * Note: cronJobs from convex/cron is not available in this version.
 * These functions can be called manually or scheduled via external cron services.
 */

// Check for inactive members and send win-back emails
export const checkInactiveMembers = internalAction({
  args: {},
  handler: async (ctx): Promise<{ campaignsSent: number }> => {
    const now = Date.now();
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000; // 14 days
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000; // 30 days
    const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000; // 90 days

    // Get all users with memberships
    const memberships: any[] = await ctx.runQuery(internal.winBackCampaigns.getAllActiveMemberships);

    for (const membership of memberships) {
      const user = await ctx.runQuery(internal.winBackCampaigns.getUserById, {
        userId: membership.userId,
      });

      if (!user || !user.email) continue;

      // Get last check-in
      const lastCheckIn = await ctx.runQuery(internal.winBackCampaigns.getLastCheckIn, {
        clerkId: user.clerkId,
      });

      const daysSinceLastActivity = lastCheckIn
        ? Math.floor((now - lastCheckIn) / (24 * 60 * 60 * 1000))
        : Math.floor((now - (user.createdAt || now)) / (24 * 60 * 60 * 1000));

      // Identify at-risk members based on inactivity thresholds
      let campaignType: "we_miss_you" | "come_back" | "special_return" | null = null;

      if (daysSinceLastActivity >= 14 && daysSinceLastActivity < 30) {
        campaignType = "we_miss_you";
      } else if (daysSinceLastActivity >= 30 && daysSinceLastActivity < 90) {
        campaignType = "come_back";
      } else if (daysSinceLastActivity >= 90) {
        campaignType = "special_return";
      }

      if (!campaignType) continue;

      // Check if campaign already sent
      const existingCampaign = await ctx.runQuery(
        internal.winBackCampaigns.getCampaignForUser,
        {
          userId: user._id,
        }
      );

      // Determine which campaign to send (reuse campaignType from above)
      if (daysSinceLastActivity >= 90 && (!existingCampaign || existingCampaign.type !== "special_return")) {
        campaignType = "special_return";
      } else if (daysSinceLastActivity >= 30 && (!existingCampaign || existingCampaign.type !== "come_back")) {
        campaignType = "come_back";
      } else if (daysSinceLastActivity >= 14 && (!existingCampaign || existingCampaign.type !== "we_miss_you")) {
        campaignType = "we_miss_you";
      }

      if (campaignType) {
        // Record campaign first to get campaign ID
        const campaignId = await ctx.runMutation(internal.winBackCampaigns.recordCampaign, {
          userId: user._id,
          clerkId: user.clerkId,
          campaignType,
          daysSinceLastActivity,
        });

        // Send win-back email with campaign ID
        await ctx.runAction(internal.winBackCampaigns.sendWinBackEmail, {
          userId: user._id,
          clerkId: user.clerkId,
          email: user.email,
          userName: user.name,
          campaignType,
          daysSinceLastActivity,
          membershipType: membership.planType,
          campaignId,
        });
      }
    }

    return { campaignsSent: memberships.length };
  },
});

// Get all active memberships
export const getAllActiveMemberships = internalQuery({
  args: {},
  handler: async (ctx) => {
    const memberships = await ctx.db.query("memberships").collect();
    // Filter active memberships (not cancelled, not expired)
    const now = Date.now();
    return memberships.filter(
      (m) =>
        m.status === "active"
    );
  },
});

// Get user by ID
export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Get last check-in for user
export const getLastCheckIn = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const checkIns = await ctx.db
      .query("memberCheckIns")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .order("desc")
      .take(1);

    return checkIns.length > 0 ? checkIns[0].checkInTime : null;
  },
});

// Get existing campaign for user (internal query)
export const getCampaignForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const campaigns = await ctx.db
      .query("winBackCampaigns")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(1);

    return campaigns.length > 0 ? campaigns[0] : null;
  },
});

// Get existing campaign for user (public query)
export const getCampaignForUserPublic = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(args.userId);
    if (!user || user.clerkId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const campaigns = await ctx.db
      .query("winBackCampaigns")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(1);

    return campaigns.length > 0 ? campaigns[0] : null;
  },
});

// Send win-back email
export const sendWinBackEmail = internalAction({
  args: {
    userId: v.id("users"),
    clerkId: v.string(),
    email: v.string(),
    userName: v.string(),
    campaignType: v.union(
      v.literal("we_miss_you"),
      v.literal("come_back"),
      v.literal("special_return")
    ),
    daysSinceLastActivity: v.number(),
    membershipType: v.string(),
    campaignId: v.optional(v.id("winBackCampaigns")),
  },
  handler: async (ctx, args) => {
    // Call Next.js API to send email
    const baseUrl = process.env.NEXTJS_URL || "http://localhost:3000";

    const emailData = {
      to: args.email,
      userName: args.userName,
      campaignType: args.campaignType,
      daysSinceLastActivity: args.daysSinceLastActivity,
      membershipType: args.membershipType,
      userId: args.userId,
      clerkId: args.clerkId,
      campaignId: args.campaignId,
    };

    try {
      const response = await fetch(`${baseUrl}/api/email/win-back`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error(`Email API returned ${response.status}`);
      }

      return { sent: true };
    } catch (error: any) {
      console.error("Error sending win-back email:", error);
      return { sent: false, error: error.message };
    }
  },
});

// Record campaign sent
export const recordCampaign = internalMutation({
  args: {
    userId: v.id("users"),
    clerkId: v.string(),
    campaignType: v.union(
      v.literal("we_miss_you"),
      v.literal("come_back"),
      v.literal("special_return")
    ),
    daysSinceLastActivity: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if campaign already exists
    const existing = await ctx.db
      .query("winBackCampaigns")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("type"), args.campaignType))
      .first();

    if (existing) {
      // Update existing campaign
      await ctx.db.patch(existing._id, {
        sentAt: Date.now(),
        daysSinceLastActivity: args.daysSinceLastActivity,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    // Create new campaign record
    return await ctx.db.insert("winBackCampaigns", {
      userId: args.userId,
      clerkId: args.clerkId,
      type: args.campaignType,
      daysSinceLastActivity: args.daysSinceLastActivity,
      sentAt: Date.now(),
      openedAt: undefined,
      clickedAt: undefined,
      convertedAt: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Track email open (internal)
export const trackEmailOpen = internalMutation({
  args: {
    campaignId: v.id("winBackCampaigns"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return;

    await ctx.db.patch(args.campaignId, {
      openedAt: campaign.openedAt || Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Track email open (public - for pixel tracking)
export const trackEmailOpenPublic = mutation({
  args: {
    campaignId: v.id("winBackCampaigns"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return;

    await ctx.db.patch(args.campaignId, {
      openedAt: campaign.openedAt || Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Track email click (internal)
export const trackEmailClick = internalMutation({
  args: {
    campaignId: v.id("winBackCampaigns"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return;

    await ctx.db.patch(args.campaignId, {
      clickedAt: campaign.clickedAt || Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Track email click (public - for link tracking)
export const trackEmailClickPublic = mutation({
  args: {
    campaignId: v.id("winBackCampaigns"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return;

    await ctx.db.patch(args.campaignId, {
      clickedAt: campaign.clickedAt || Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Track conversion (user returned) - public mutation for check-in tracking
export const trackConversion = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(args.userId);
    if (!user || user.clerkId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const campaigns = await ctx.db
      .query("winBackCampaigns")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("convertedAt"), null))
      .collect();

    for (const campaign of campaigns) {
      await ctx.db.patch(campaign._id, {
        convertedAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { converted: campaigns.length };
  },
});

// Get campaign statistics (admin) - internal
export const getCampaignStats = internalQuery({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("winBackCampaigns").collect();

    const stats = {
      total: campaigns.length,
      weMissYou: campaigns.filter((c) => c.type === "we_miss_you").length,
      comeBack: campaigns.filter((c) => c.type === "come_back").length,
      specialReturn: campaigns.filter((c) => c.type === "special_return").length,
      opened: campaigns.filter((c) => c.openedAt).length,
      clicked: campaigns.filter((c) => c.clickedAt).length,
      converted: campaigns.filter((c) => c.convertedAt).length,
    };

    return stats;
  },
});

// Get campaign statistics (public query for admin dashboard)
export const getPublicCampaignStats = query({
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

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      throw new Error("Unauthorized");
    }

    const campaigns = await ctx.db.query("winBackCampaigns").collect();

    const stats = {
      total: campaigns.length,
      weMissYou: campaigns.filter((c) => c.type === "we_miss_you").length,
      comeBack: campaigns.filter((c) => c.type === "come_back").length,
      specialReturn: campaigns.filter((c) => c.type === "special_return").length,
      opened: campaigns.filter((c) => c.openedAt).length,
      clicked: campaigns.filter((c) => c.clickedAt).length,
      converted: campaigns.filter((c) => c.convertedAt).length,
    };

    return stats;
  },
});

