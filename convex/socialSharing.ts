import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Social Sharing System
 * Share achievements, workouts, and progress to external platforms
 */

// Share to external platform
export const shareToPlatform = mutation({
  args: {
    platform: v.union(
      v.literal("facebook"),
      v.literal("twitter"),
      v.literal("instagram"),
      v.literal("linkedin"),
      v.literal("whatsapp")
    ),
    contentType: v.union(
      v.literal("achievement"),
      v.literal("workout"),
      v.literal("progress"),
      v.literal("challenge")
    ),
    contentId: v.string(),
    message: v.optional(v.string()),
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

    // Generate share URL based on content type
    let shareUrl = "";
    let shareText = args.message || "";

    const baseUrl = process.env.NEXTJS_URL || "https://derrimut-platform.vercel.app";

    if (args.contentType === "achievement") {
      shareUrl = `${baseUrl}/achievements/${args.contentId}`;
      if (!shareText) {
        shareText = `I just unlocked an achievement on Derrimut 24:7! 🎉`;
      }
    } else if (args.contentType === "workout") {
      shareUrl = `${baseUrl}/workouts/${args.contentId}`;
      if (!shareText) {
        shareText = `Just completed an amazing workout at Derrimut 24:7! 💪`;
      }
    } else if (args.contentType === "progress") {
      shareUrl = `${baseUrl}/profile/progress`;
      if (!shareText) {
        shareText = `Check out my fitness progress at Derrimut 24:7! 📈`;
      }
    } else if (args.contentType === "challenge") {
      shareUrl = `${baseUrl}/challenges/${args.contentId}`;
      if (!shareText) {
        shareText = `I'm crushing this challenge at Derrimut 24:7! 🔥`;
      }
    }

    // Generate platform-specific share URLs
    let platformUrl = "";
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    switch (args.platform) {
      case "facebook":
        platformUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case "twitter":
        platformUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case "linkedin":
        platformUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "whatsapp":
        platformUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case "instagram":
        // Instagram doesn't support direct URL sharing, return text for copy
        platformUrl = shareText;
        break;
    }

    return {
      platform: args.platform,
      shareUrl: platformUrl,
      isDirectLink: args.platform !== "instagram",
      textToCopy: args.platform === "instagram" ? `${shareText} ${shareUrl}` : undefined,
    };
  },
});

// Get shareable content for user
export const getShareableContent = query({
  args: {
    contentType: v.optional(
      v.union(v.literal("achievement"), v.literal("workout"), v.literal("progress"), v.literal("challenge"))
    ),
    limit: v.optional(v.number()),
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
      return [];
    }

    const content: any[] = [];

    if (!args.contentType || args.contentType === "achievement") {
      const allAchievements = await ctx.db
        .query("achievements")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .order("desc")
        .collect();
      
      const achievements = allAchievements.slice(0, args.limit || 10);

      content.push(
        ...achievements.map((a: any) => ({
          type: "achievement" as const,
          id: a._id,
          title: a.title,
          description: a.description,
          icon: a.icon,
          createdAt: a.unlockedAt,
        }))
      );
    }

    if (!args.contentType || args.contentType === "challenge") {
      const allChallenges = await ctx.db
        .query("challengeParticipations")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("completed"), true))
        .order("desc")
        .collect();
      
      const challenges = allChallenges.slice(0, args.limit || 10);

      for (const participation of challenges) {
        const challenge = await ctx.db.get(participation.challengeId);
        if (challenge) {
          content.push({
            type: "challenge" as const,
            id: challenge._id,
            title: challenge.title,
            description: challenge.description,
            completedAt: participation.completedAt,
          });
        }
      }
    }

    return content.sort((a, b) => (b.createdAt || b.completedAt || 0) - (a.createdAt || a.completedAt || 0));
  },
});

