import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Debug query to get full user details including all optional fields
 */
export const getFullUserDetails = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    
    if (!user) {
      return { error: "User not found" };
    }
    
    // Return ALL fields including optional ones
    return {
      ...user,
      hasAccountType: !!user.accountType,
      hasOrganizationId: !!user.organizationId,
      hasOrganizationRole: !!user.organizationRole,
    };
  },
});

/**
 * Get organization details by slug
 */
export const getOrganizationBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db
      .query("organizations")
      .filter((q) => q.eq(q.field("slug"), args.slug))
      .first();
    
    return org || { error: "Organization not found" };
  },
});
