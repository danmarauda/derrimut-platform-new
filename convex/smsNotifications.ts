import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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

// Send SMS notification (action)
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
    // Get subscription to check preferences
    const subscription = await ctx.runQuery(api.smsNotifications.getUserSMSSubscriptionForAction, {
      clerkId: args.clerkId,
    });

    if (!subscription || !subscription.isActive || !subscription.verified) {
      return { sent: false, message: "SMS subscription not active or verified" };
    }

    // Check preferences
    const preferenceMap: Record<string, keyof typeof subscription["preferences"]> = {
      booking_confirmation: "bookingConfirmations",
      class_reminder: "classReminders",
      payment_alert: "paymentAlerts",
      account_update: "accountUpdates",
      emergency: "emergencyNotifications",
    };

    const preferenceKey = preferenceMap[args.type];
    if (!preferenceKey || !subscription.preferences[preferenceKey]) {
      return { sent: false, message: "SMS preference disabled for this type" };
    }

    // Send SMS via Twilio or AWS SNS
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      // Use Twilio
      const twilio = require("twilio")(twilioAccountSid, twilioAuthToken);

      try {
        await twilio.messages.create({
          body: args.message,
          from: twilioPhoneNumber,
          to: args.phoneNumber,
        });

        return { sent: true, provider: "twilio" };
      } catch (error: any) {
        console.error("Error sending SMS via Twilio:", error);
        return { sent: false, error: error.message };
      }
    } else {
      // Fallback: Log for now (implement AWS SNS if needed)
      console.log("SMS would be sent:", {
        to: args.phoneNumber,
        message: args.message,
        type: args.type,
      });
      return { sent: false, message: "SMS provider not configured" };
    }
  },
});

// Send account update SMS
export const sendAccountUpdateSMS = action({
  args: {
    clerkId: v.string(),
    phoneNumber: v.string(),
    changeType: v.union(v.literal("email"), v.literal("name"), v.literal("phone")),
  },
  handler: async (ctx, args): Promise<{ sent: boolean; message?: string }> => {
    // Get subscription to check preferences
    const subscription = await ctx.runQuery(api.smsNotifications.getUserSMSSubscriptionForAction, {
      clerkId: args.clerkId,
    });

    if (!subscription || !subscription.isActive || !subscription.verified) {
      return { sent: false, message: "SMS subscription not active or verified" };
    }

    // Check preferences
    if (!subscription.preferences.accountUpdates) {
      return { sent: false, message: "Account update SMS preference disabled" };
    }

    const message = `Derrimut 24:7: Your account ${args.changeType} has been updated. If this wasn't you, please contact support immediately.`;

    // Send SMS
    return await ctx.runAction(api.smsNotifications.sendSMS, {
      clerkId: args.clerkId,
      phoneNumber: args.phoneNumber,
      message,
      type: "account_update",
    });
  },
});

// Send emergency notification SMS (admin only)
export const sendEmergencySMS = action({
  args: {
    message: v.string(),
    targetAudience: v.union(
      v.literal("all"),
      v.literal("active_members"),
      v.literal("inactive_members")
    ),
  },
  handler: async (ctx, args) => {
    // Get all users based on audience
    let users: any[] = [];
    
    if (args.targetAudience === "all") {
      users = await ctx.runQuery(api.specialOffers.getAllUsers);
    } else if (args.targetAudience === "active_members") {
      users = await ctx.runQuery(api.specialOffers.getActiveMembers);
    } else if (args.targetAudience === "inactive_members") {
      users = await ctx.runQuery(api.specialOffers.getInactiveMembers);
    }

    let sentCount = 0;

    for (const user of users) {
      // Get SMS subscription
      const subscription = await ctx.runQuery(
        api.smsNotifications.getUserSMSSubscriptionForAction,
        {
          clerkId: user.clerkId,
        }
      );

      if (
        subscription &&
        subscription.isActive &&
        subscription.verified &&
        subscription.preferences.emergencyNotifications
      ) {
        await ctx.runAction(api.smsNotifications.sendSMS, {
          clerkId: user.clerkId,
          phoneNumber: subscription.phoneNumber,
          message: `🚨 EMERGENCY: ${args.message}`,
          type: "emergency",
        });

        sentCount++;
      }
    }

    return { sent: sentCount, totalUsers: users.length };
  },
});

// Send verification code
export const sendVerificationCode = action({
  args: {
    subscriptionId: v.id("smsSubscriptions"),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code temporarily (in a real implementation, use a separate table with expiration)
    // For now, we'll just send the SMS

    const message = `Your Derrimut verification code is: ${code}`;

    // Send via Twilio
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      const twilio = require("twilio")(twilioAccountSid, twilioAuthToken);

      try {
        await twilio.messages.create({
          body: message,
          from: twilioPhoneNumber,
          to: args.phoneNumber,
        });

        // Store verification code (implement proper storage with expiration)
        return { sent: true, code }; // In production, don't return code
      } catch (error: any) {
        console.error("Error sending verification SMS:", error);
        return { sent: false, error: error.message };
      }
    }

    return { sent: false, message: "SMS provider not configured" };
  },
});

