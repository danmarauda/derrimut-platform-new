import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

/**
 * SMS Notifications System
 * SMS notifications via Twilio or AWS SNS
 */

// Subscribe to SMS notifications
export const subscribeToSMS = mutation({
  args: {
    phoneNumber: v.string(),
    preferences: v.object({
      bookingConfirmations: v.boolean(),
      classReminders: v.boolean(),
      paymentAlerts: v.boolean(),
      accountUpdates: v.boolean(),
      emergencyNotifications: v.boolean(),
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
      .query("smsSubscriptions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (existing) {
      // Update existing subscription
      await ctx.db.patch(existing._id, {
        phoneNumber: args.phoneNumber,
        preferences: args.preferences,
        isActive: true,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    // Create new subscription (unverified initially)
    const subscriptionId = await ctx.db.insert("smsSubscriptions", {
      userId: user._id,
      clerkId: identity.subject,
      phoneNumber: args.phoneNumber,
      preferences: args.preferences,
      isActive: true,
      verified: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Send verification code
    await ctx.scheduler.runAfter(0, api.smsNotifications.sendVerificationCode, {
      subscriptionId,
      phoneNumber: args.phoneNumber,
    });

    return subscriptionId;
  },
});

// Verify SMS phone number
export const verifySMSPhone = mutation({
  args: {
    subscriptionId: v.id("smsSubscriptions"),
    code: v.string(),
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

    // In a real implementation, verify the code against stored verification code
    // For now, we'll mark as verified (implement proper verification logic)
    await ctx.db.patch(args.subscriptionId, {
      verified: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Unsubscribe from SMS notifications
export const unsubscribeFromSMS = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const subscription = await ctx.db
      .query("smsSubscriptions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (subscription) {
      await ctx.db.patch(subscription._id, {
        isActive: false,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Update SMS preferences
export const updateSMSPreferences = mutation({
  args: {
    preferences: v.object({
      bookingConfirmations: v.boolean(),
      classReminders: v.boolean(),
      paymentAlerts: v.boolean(),
      accountUpdates: v.boolean(),
      emergencyNotifications: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const subscription = await ctx.db
      .query("smsSubscriptions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!subscription) {
      throw new Error("SMS subscription not found");
    }

    await ctx.db.patch(subscription._id, {
      preferences: args.preferences,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get user's SMS subscription
export const getUserSMSSubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const subscription = await ctx.db
      .query("smsSubscriptions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    return subscription || null;
  },
});

// Get user SMS subscription for action (internal query)
export const getUserSMSSubscriptionForAction = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("smsSubscriptions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    return subscription || null;
  },
});

// Send SMS notification (action - delegates to Node.js action)
export const sendSMS = action({
  args: {
    clerkId: v.string(),
    phoneNumber: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("booking_confirmation"),
      v.literal("class_reminder"),
      v.literal("payment_alert"),
      v.literal("account_update"),
      v.literal("emergency")
    ),
  },
  handler: async (ctx, args) => {
    // Delegate to Node.js action for Twilio
    return await ctx.runAction(internal.smsNotificationsActions.sendSMSInternal, args);
  },
});

// Send account update SMS (delegates to Node.js action)
export const sendAccountUpdateSMS = action({
  args: {
    clerkId: v.string(),
    phoneNumber: v.string(),
    changeType: v.union(v.literal("email"), v.literal("name"), v.literal("phone")),
  },
  handler: async (ctx, args): Promise<{ sent: boolean; message?: string }> => {
    return await ctx.runAction(internal.smsNotificationsActions.sendAccountUpdateSMSInternal, args);
  },
});

// Send emergency notification SMS (admin only - delegates to Node.js action)
export const sendEmergencySMS = action({
  args: {
    message: v.string(),
    targetAudience: v.union(
      v.literal("all"),
      v.literal("active_members"),
      v.literal("location_specific")
    ),
    locationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    return await ctx.runAction(internal.smsNotificationsActions.sendEmergencySMSInternal, args);
  },
});

// Send verification code (delegates to Node.js action)
export const sendVerificationCode = action({
  args: {
    subscriptionId: v.id("smsSubscriptions"),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.runAction(internal.smsNotificationsActions.sendVerificationCodeInternal, args);
  },
});

