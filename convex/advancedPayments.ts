import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-07-30.basil",
});

/**
 * Advanced Payment Features
 * Gift cards, corporate memberships, installment plans
 */

// Create gift card
export const createGiftCard = action({
  args: {
    amount: v.number(),
    recipientEmail: v.optional(v.string()),
    recipientName: v.optional(v.string()),
    message: v.optional(v.string()),
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

    // Generate unique gift card code
    const code = `GC${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(args.amount * 100), // Convert to cents
      currency: "aud",
      metadata: {
        type: "gift_card",
        purchaserClerkId: identity.subject,
        recipientEmail: args.recipientEmail || "",
      },
    });

    // Create gift card record
    const giftCardId: any = await ctx.runMutation(api.advancedPayments.insertGiftCard, {
      code,
      amount: args.amount,
      balance: args.amount,
      purchasedByClerkId: identity.subject,
      recipientEmail: args.recipientEmail,
      recipientName: args.recipientName,
      message: args.message,
      stripePaymentIntentId: paymentIntent.id,
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year expiry
    });

    return {
      giftCardId,
      code,
      clientSecret: paymentIntent.client_secret,
    };
  },
});

// Insert gift card
export const insertGiftCard = mutation({
  args: {
    code: v.string(),
    amount: v.number(),
    balance: v.number(),
    purchasedByClerkId: v.string(),
    recipientEmail: v.optional(v.string()),
    recipientName: v.optional(v.string()),
    message: v.optional(v.string()),
    stripePaymentIntentId: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.purchasedByClerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const giftCardId = await ctx.db.insert("giftCards", {
      code: args.code,
      amount: args.amount,
      balance: args.balance,
      purchasedBy: user._id,
      purchasedByClerkId: args.purchasedByClerkId,
      recipientEmail: args.recipientEmail,
      recipientName: args.recipientName,
      message: args.message,
      stripePaymentIntentId: args.stripePaymentIntentId,
      status: "active",
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return giftCardId;
  },
});

// Redeem gift card
export const redeemGiftCard = mutation({
  args: {
    code: v.string(),
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

    const giftCard = await ctx.db
      .query("giftCards")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!giftCard) {
      throw new Error("Gift card not found");
    }

    if (giftCard.status !== "active") {
      throw new Error("Gift card is not active");
    }

    if (giftCard.expiresAt && giftCard.expiresAt < Date.now()) {
      await ctx.db.patch(giftCard._id, {
        status: "expired",
        updatedAt: Date.now(),
      });
      throw new Error("Gift card has expired");
    }

    if (giftCard.balance <= 0) {
      throw new Error("Gift card has no balance");
    }

    // Update gift card
    await ctx.db.patch(giftCard._id, {
      balance: 0,
      status: "redeemed",
      redeemedBy: user._id,
      redeemedByClerkId: identity.subject,
      redeemedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add balance to user's account (could be stored as credit)
    // For now, award loyalty points equivalent to gift card amount
    await ctx.scheduler.runAfter(0, api.loyalty.addPointsWithExpiration, {
      clerkId: identity.subject,
      points: Math.floor(giftCard.balance), // 1 point per AUD
      source: "purchase",
      description: `Gift card redemption: ${args.code}`,
      relatedId: giftCard._id,
    });

    return { success: true, amount: giftCard.balance };
  },
});

// Get gift card by code
export const getGiftCardByCode = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("giftCards")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
  },
});

// Create corporate membership
export const createCorporateMembership = mutation({
  args: {
    companyName: v.string(),
    contactEmail: v.string(),
    contactName: v.string(),
    contactPhone: v.string(),
    totalMembers: v.number(),
    discountPercent: v.number(),
    billingCycle: v.union(v.literal("monthly"), v.literal("quarterly"), v.literal("annually")),
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

    const corporateId = await ctx.db.insert("corporateMemberships", {
      companyName: args.companyName,
      contactEmail: args.contactEmail,
      contactName: args.contactName,
      contactPhone: args.contactPhone,
      totalMembers: args.totalMembers,
      discountPercent: args.discountPercent,
      billingCycle: args.billingCycle,
      status: "pending",
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return corporateId;
  },
});

// Get corporate memberships
export const getCorporateMemberships = query({
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

    return await ctx.db.query("corporateMemberships").order("desc").collect();
  },
});

// Create installment plan
export const createInstallmentPlan = action({
  args: {
    membershipType: v.string(),
    totalAmount: v.number(),
    numberOfInstallments: v.number(), // e.g., 12 for monthly installments over a year
  },
  handler: async (ctx, args) => {
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

    const installmentAmount = Math.round((args.totalAmount / args.numberOfInstallments) * 100); // In cents

    // Create Stripe Payment Intent with installments
    const paymentIntent = await stripe.paymentIntents.create({
      amount: installmentAmount,
      currency: "aud",
      payment_method_types: ["card"],
      setup_future_usage: "off_session",
      metadata: {
        type: "installment",
        membershipType: args.membershipType,
        totalAmount: args.totalAmount.toString(),
        numberOfInstallments: args.numberOfInstallments.toString(),
        installmentNumber: "1",
        clerkId: identity.subject,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      installmentAmount: installmentAmount / 100,
      totalAmount: args.totalAmount,
      numberOfInstallments: args.numberOfInstallments,
    };
  },
});

// Pause membership
export const pauseMembership = mutation({
  args: {
    membershipId: v.id("memberships"),
    pauseUntil: v.number(), // Timestamp
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const membership = await ctx.db.get(args.membershipId);
    if (!membership || membership.clerkId !== identity.subject) {
      throw new Error("Membership not found");
    }

    // Update Stripe subscription to pause
    if (!membership.stripeSubscriptionId) {
      throw new Error("Membership has no Stripe subscription");
    }
    try {
      await stripe.subscriptions.update(membership.stripeSubscriptionId, {
        pause_collection: {
          behavior: "keep_as_draft",
          resumes_at: args.pauseUntil,
        },
      });
    } catch (error) {
      console.error("Error pausing Stripe subscription:", error);
      throw new Error("Failed to pause membership");
    }

    // Update membership record - use cancelled status instead of paused
    await ctx.db.patch(args.membershipId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Resume membership
export const resumeMembership = mutation({
  args: {
    membershipId: v.id("memberships"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const membership = await ctx.db.get(args.membershipId);
    if (!membership || membership.clerkId !== identity.subject) {
      throw new Error("Membership not found");
    }

    // Resume Stripe subscription
    if (!membership.stripeSubscriptionId) {
      throw new Error("Membership has no Stripe subscription");
    }
    try {
      await stripe.subscriptions.update(membership.stripeSubscriptionId, {
        pause_collection: null,
      });
    } catch (error) {
      console.error("Error resuming Stripe subscription:", error);
      throw new Error("Failed to resume membership");
    }

    // Update membership record
    await ctx.db.patch(args.membershipId, {
      status: "active",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Upgrade/downgrade membership
export const changeMembershipTier = action({
  args: {
    membershipId: v.id("memberships"),
    newMembershipType: v.string(),
    newPriceId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const membership = await ctx.runQuery(api.memberships.getMembership, {
      id: args.membershipId,
    });

    if (!membership || membership.clerkId !== identity.subject) {
      throw new Error("Membership not found");
    }

    // Update Stripe subscription
    if (!membership.stripeSubscriptionId) {
      throw new Error("Membership has no Stripe subscription");
    }
    try {
      await stripe.subscriptions.update(membership.stripeSubscriptionId, {
        items: [
          {
            id: membership.stripePriceId,
            price: args.newPriceId,
          },
        ],
        proration_behavior: "always_invoice",
      });
    } catch (error) {
      console.error("Error updating Stripe subscription:", error);
      throw new Error("Failed to change membership tier");
    }

    // Update membership record - use mutation since actions can't access db directly
    await ctx.runMutation(api.memberships.updateMembershipType, {
      membershipId: args.membershipId,
      membershipType: args.newMembershipType,
      stripePriceId: args.newPriceId,
    });

    return { success: true };
  },
});

