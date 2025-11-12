"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * SMS Notifications Actions (Node.js runtime)
 * 
 * This file contains actions that require Node.js runtime for Twilio SDK.
 */

// Send SMS notification (internal Node.js action)
export const sendSMSInternal = internalAction({
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

    // Send SMS via Twilio
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
      // Fallback: Log for now
      console.log("SMS would be sent:", {
        to: args.phoneNumber,
        message: args.message,
        type: args.type,
      });
      return { sent: false, message: "SMS provider not configured" };
    }
  },
});

// Send account update SMS (internal Node.js action)
export const sendAccountUpdateSMSInternal = internalAction({
  args: {
    clerkId: v.string(),
    phoneNumber: v.string(),
    changeType: v.union(v.literal("email"), v.literal("name"), v.literal("phone")),
  },
  handler: async (ctx, args) => {
    const changeMessages = {
      email: "Your email address has been updated.",
      name: "Your name has been updated.",
      phone: "Your phone number has been updated.",
    };

    return await ctx.runAction(api.smsNotifications.sendSMS, {
      clerkId: args.clerkId,
      phoneNumber: args.phoneNumber,
      message: changeMessages[args.changeType],
      type: "account_update",
    });
  },
});

// Send emergency notification SMS (internal Node.js action)
export const sendEmergencySMSInternal = internalAction({
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
    // Get all users based on audience
    let users: any[] = [];
    
    if (args.targetAudience === "all") {
      users = await ctx.runQuery(api.specialOffers.getAllUsers);
    } else if (args.targetAudience === "active_members") {
      users = await ctx.runQuery(api.specialOffers.getActiveMembers);
    } else if (args.targetAudience === "location_specific" && args.locationId) {
      users = await ctx.runQuery(api.specialOffers.getUsersByLocation, {
        locationId: args.locationId,
      });
    }

    let sentCount = 0;

    for (const user of users) {
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
        const result = await ctx.runAction(api.smsNotifications.sendSMS, {
          clerkId: user.clerkId,
          phoneNumber: subscription.phoneNumber,
          message: args.message,
          type: "emergency",
        });

        if (result.sent) {
          sentCount++;
        }
      }
    }

    return { sent: sentCount, totalUsers: users.length };
  },
});

// Send verification code (internal Node.js action)
export const sendVerificationCodeInternal = internalAction({
  args: {
    subscriptionId: v.id("smsSubscriptions"),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Send SMS via Twilio
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      const twilio = require("twilio")(twilioAccountSid, twilioAuthToken);

      try {
        await twilio.messages.create({
          body: `Your Derrimut 24:7 verification code is: ${code}`,
          from: twilioPhoneNumber,
          to: args.phoneNumber,
        });

        // Store verification code (implement proper storage with expiration)
        return { sent: true, code }; // In production, don't return code
      } catch (error: any) {
        console.error("Error sending verification SMS:", error);
        return { sent: false, error: error.message };
      }
    } else {
      console.log("Verification code would be sent:", code);
      return { sent: false, message: "SMS provider not configured", code };
    }
  },
});

