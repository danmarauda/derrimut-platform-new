import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Marketing Automation System
 * Email campaigns, automated sequences, segmentation, A/B testing
 */

// Create marketing campaign
export const createMarketingCampaign = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("welcome_series"),
      v.literal("onboarding"),
      v.literal("re_engagement"),
      v.literal("birthday"),
      v.literal("anniversary"),
      v.literal("custom")
    ),
    targetAudience: v.object({
      segment: v.union(
        v.literal("all"),
        v.literal("new_members"),
        v.literal("active_members"),
        v.literal("inactive_members"),
        v.literal("by_location"),
        v.literal("by_membership_type"),
        v.literal("custom")
      ),
      locationIds: v.optional(v.array(v.id("organizations"))),
      membershipTypes: v.optional(v.array(v.string())),
      customFilters: v.optional(v.string()),
    }),
    emails: v.array(v.object({
      subject: v.string(),
      body: v.string(),
      delay: v.number(),
      order: v.number(),
    })),
    scheduledAt: v.optional(v.number()),
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

    const campaignId = await ctx.db.insert("marketingCampaigns", {
      name: args.name,
      description: args.description,
      type: args.type,
      status: args.scheduledAt ? "draft" : "active",
      targetAudience: args.targetAudience,
      emails: args.emails,
      sentCount: 0,
      openedCount: 0,
      clickedCount: 0,
      convertedCount: 0,
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      scheduledAt: args.scheduledAt,
    });

    // Schedule campaign if scheduledAt is provided
    if (args.scheduledAt) {
      await ctx.scheduler.runAfter(
        args.scheduledAt - Date.now(),
        api.marketingAutomation.sendCampaign,
        { campaignId }
      );
    } else {
      // Send immediately
      await ctx.scheduler.runAfter(0, api.marketingAutomation.sendCampaign, { campaignId });
    }

    return campaignId;
  },
});

// Send campaign
export const sendCampaign = action({
  args: {
    campaignId: v.id("marketingCampaigns"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.runQuery(api.marketingAutomation.getCampaign, {
      campaignId: args.campaignId,
    });

    if (!campaign || campaign.status !== "active") {
      return { success: false, message: "Campaign not active" };
    }

    // Get target audience
    const recipients = await ctx.runQuery(api.marketingAutomation.getCampaignRecipients, {
      campaignId: args.campaignId,
    });

    let sentCount = 0;

    // Send emails in sequence based on delay
    for (const email of campaign.emails.sort((a: any, b: any) => a.order - b.order)) {
      for (const recipient of recipients) {
        // Schedule email based on delay
        await ctx.scheduler.runAfter(
          email.delay * 60 * 60 * 1000, // Convert hours to milliseconds
          api.marketingAutomation.sendCampaignEmail,
          {
            campaignId: args.campaignId,
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            recipientClerkId: recipient.clerkId,
            subject: email.subject,
            body: email.body,
            emailOrder: email.order,
          }
        );
        sentCount++;
      }
    }

    // Update campaign status
    await ctx.runMutation(api.marketingAutomation.updateCampaignStats, {
      campaignId: args.campaignId,
      sentCount,
    });

    return { success: true, sentCount };
  },
});

// Get campaign
export const getCampaign = query({
  args: {
    campaignId: v.id("marketingCampaigns"),
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

    return await ctx.db.get(args.campaignId);
  },
});

// Get campaign recipients
export const getCampaignRecipients = query({
  args: {
    campaignId: v.id("marketingCampaigns"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      return [];
    }

    let users = await ctx.db.query("users").collect();

    // Filter by segment
    if (campaign.targetAudience.segment === "new_members") {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      users = users.filter((u) => (u.createdAt || 0) > thirtyDaysAgo);
    } else if (campaign.targetAudience.segment === "active_members") {
      // Get users with recent check-ins
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const activeUserIds = new Set<string>();
      const checkIns = await ctx.db
        .query("memberCheckIns")
        .filter((q) => q.gte(q.field("checkInTime"), sevenDaysAgo))
        .collect();
      checkIns.forEach((ci) => activeUserIds.add(ci.clerkId));
      users = users.filter((u) => activeUserIds.has(u.clerkId));
    } else if (campaign.targetAudience.segment === "inactive_members") {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const activeUserIds = new Set<string>();
      const checkIns = await ctx.db
        .query("memberCheckIns")
        .filter((q) => q.gte(q.field("checkInTime"), thirtyDaysAgo))
        .collect();
      checkIns.forEach((ci) => activeUserIds.add(ci.clerkId));
      users = users.filter((u) => !activeUserIds.has(u.clerkId));
    }

    // Filter by location - locationId doesn't exist on users, skip this filter
    // if (campaign.targetAudience.locationIds && campaign.targetAudience.locationIds.length > 0) {
    //   users = users.filter((u) => campaign.targetAudience.locationIds!.includes(u.locationId!));
    // }

    return users.map((u) => ({
      clerkId: u.clerkId,
      email: u.email,
      name: u.name,
    }));
  },
});

// Send campaign email
export const sendCampaignEmail = action({
  args: {
    campaignId: v.id("marketingCampaigns"),
    recipientEmail: v.string(),
    recipientName: v.string(),
    recipientClerkId: v.string(),
    subject: v.string(),
    body: v.string(),
    emailOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const nextjsUrl = process.env.NEXTJS_URL || process.env.NEXT_PUBLIC_CONVEX_URL?.replace('/convex', '') || 'http://localhost:3000';
    
    const response = await fetch(`${nextjsUrl}/api/email/marketing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: args.recipientEmail,
        subject: args.subject,
        html: args.body,
        campaignId: args.campaignId,
        recipientClerkId: args.recipientClerkId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    // Track email sent
    await ctx.runMutation(api.marketingAutomation.trackEmailSent, {
      campaignId: args.campaignId,
      recipientClerkId: args.recipientClerkId,
    });

    return { success: true };
  },
});

// Track email sent
export const trackEmailSent = mutation({
  args: {
    campaignId: v.id("marketingCampaigns"),
    recipientClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (campaign) {
      await ctx.db.patch(args.campaignId, {
        sentCount: campaign.sentCount + 1,
        updatedAt: Date.now(),
      });
    }
  },
});

// Update campaign stats
export const updateCampaignStats = mutation({
  args: {
    campaignId: v.id("marketingCampaigns"),
    sentCount: v.number(),
    openedCount: v.optional(v.number()),
    clickedCount: v.optional(v.number()),
    convertedCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return;

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.sentCount !== undefined) updates.sentCount = args.sentCount;
    if (args.openedCount !== undefined) updates.openedCount = campaign.openedCount + args.openedCount;
    if (args.clickedCount !== undefined) updates.clickedCount = campaign.clickedCount + args.clickedCount;
    if (args.convertedCount !== undefined) updates.convertedCount = campaign.convertedCount + args.convertedCount;

    await ctx.db.patch(args.campaignId, updates);
  },
});

// Get all campaigns
export const getAllCampaigns = query({
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
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db.query("marketingCampaigns").order("desc").collect();
  },
});

// Track email open
export const trackEmailOpen = mutation({
  args: {
    campaignId: v.id("marketingCampaigns"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (campaign) {
      await ctx.db.patch(args.campaignId, {
        openedCount: campaign.openedCount + 1,
        updatedAt: Date.now(),
      });
    }
  },
});

// Track email click
export const trackEmailClick = mutation({
  args: {
    campaignId: v.id("marketingCampaigns"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (campaign) {
      await ctx.db.patch(args.campaignId, {
        clickedCount: campaign.clickedCount + 1,
        updatedAt: Date.now(),
      });
    }
  },
});

