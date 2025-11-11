import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Send referral email to user
 */
export const sendReferralEmail = action({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getUserByClerkId, {
      clerkId: args.clerkId,
    });

    if (!user || !user.email) {
      throw new Error("User not found or no email");
    }

    // Get or create referral code
    const referralCode = await ctx.runMutation(api.referrals.getOrCreateReferralCode, {
      clerkId: args.clerkId,
    });

    const referralLink = `${process.env.NEXTJS_URL || "https://derrimut-platform.vercel.app"}/sign-up?ref=${referralCode}`;

    // Call Next.js API route to send email
    const nextjsUrl = process.env.NEXTJS_URL || process.env.NEXT_PUBLIC_CONVEX_URL?.replace('/convex', '') || 'http://localhost:3000';
    const response = await fetch(`${nextjsUrl}/api/email/referral`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: user.email,
        referrerName: user.name,
        referralCode,
        referralLink,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Failed to send referral email: ${error.error || response.statusText}`);
    }

    return { success: true };
  },
});

