import { action, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Stripe Discount Codes Integration for Referrals
 * Creates Stripe discount codes for referral rewards
 */

// Create Stripe discount code for referee (50% off first month)
export const createReferralDiscountCode = action({
  args: {
    referralCode: v.string(),
    refereeEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = require("stripe")(stripeSecretKey);

    try {
      // Create a coupon for 50% off first month (one-time use)
      const coupon = await stripe.coupons.create({
        percent_off: 50,
        duration: "once", // One-time discount
        name: `Referral: ${args.referralCode}`,
        metadata: {
          referralCode: args.referralCode,
          refereeEmail: args.refereeEmail,
        },
      });

      // Create a promotion code from the coupon
      const promotionCode = await stripe.promotionCodes.create({
        coupon: coupon.id,
        code: `REF${args.referralCode.substring(0, 6).toUpperCase()}`, // REF + first 6 chars of referral code
        max_redemptions: 1, // Can only be used once
        metadata: {
          referralCode: args.referralCode,
          refereeEmail: args.refereeEmail,
        },
      });

      return {
        success: true,
        couponId: coupon.id,
        promotionCodeId: promotionCode.id,
        code: promotionCode.code,
      };
    } catch (error: any) {
      console.error("Error creating Stripe discount code:", error);
      throw new Error(`Failed to create discount code: ${error.message}`);
    }
  },
});

// Create Stripe discount code for referrer (free month after 5 referrals)
export const createReferrerRewardDiscountCode = action({
  args: {
    clerkId: v.string(),
    tier: v.union(
      v.literal("1_month"),
      v.literal("3_months"),
      v.literal("6_months"),
      v.literal("1_year")
    ),
  },
  handler: async (ctx, args): Promise<any> => {
    const user: any = await ctx.runQuery(api.users.getUserByClerkId, {
      clerkId: args.clerkId,
    });

    if (!user || !user.email) {
      throw new Error("User not found");
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = require("stripe")(stripeSecretKey);

    // Determine discount based on tier
    let percentOff = 0;
    let duration = "once";
    let name = "";

    switch (args.tier) {
      case "1_month":
        percentOff = 100; // Free month
        duration = "once";
        name = "Referral Reward: 1 Month Free";
        break;
      case "3_months":
        percentOff = 100;
        duration = "repeating";
        name = "Referral Reward: 3 Months Free";
        break;
      case "6_months":
        percentOff = 100;
        duration = "repeating";
        name = "Referral Reward: 6 Months Free";
        break;
      case "1_year":
        percentOff = 100;
        duration = "repeating";
        name = "Referral Reward: 1 Year Free";
        break;
    }

    try {
      const coupon = await stripe.coupons.create({
        percent_off: percentOff,
        duration: duration as any,
        duration_in_months: args.tier === "1_month" ? undefined : 
                           args.tier === "3_months" ? 3 :
                           args.tier === "6_months" ? 6 : 12,
        name,
        metadata: {
          clerkId: args.clerkId,
          tier: args.tier,
        },
      });

      const promotionCode: any = await stripe.promotionCodes.create({
        coupon: coupon.id,
        code: `REWARD${user.referralCode?.substring(0, 6).toUpperCase() || "REF"}`,
        metadata: {
          clerkId: args.clerkId,
          tier: args.tier,
        },
      });

      return {
        success: true,
        couponId: coupon.id,
        promotionCodeId: promotionCode.id,
        code: promotionCode.code,
      };
    } catch (error: any) {
      console.error("Error creating referrer reward discount code:", error);
      throw new Error(`Failed to create reward discount code: ${error.message}`);
    }
  },
});

// Get discount code for referral
export const getReferralDiscountCode = query({
  args: {
    referralCode: v.string(),
  },
  handler: async (ctx, args) => {
    // This would typically query a database table storing discount codes
    // For now, we'll generate it on-the-fly
    return {
      code: `REF${args.referralCode.substring(0, 6).toUpperCase()}`,
      discount: 50,
      type: "percent",
    };
  },
});

