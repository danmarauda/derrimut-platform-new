import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Generate a unique referral code
function generateReferralCode(name: string): string {
  // Take first 3 letters of name, uppercase, add random 4-digit number
  const namePart = name
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, "X");
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  return `${namePart}${randomPart}`;
}

export const syncUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (existingUser) {
      // Update existing user with new fields if they don't exist
      if (!existingUser.role || !existingUser.createdAt) {
        await ctx.db.patch(existingUser._id, {
          role: existingUser.role || "user",
          createdAt: existingUser.createdAt || Date.now(),
          updatedAt: Date.now(),
        });
      }
      return existingUser._id;
    }

    // Generate referral code for new user
    let referralCode = generateReferralCode(args.name);
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure uniqueness
    while (attempts < maxAttempts) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_referral_code", (q) => q.eq("referralCode", referralCode))
        .first();

      if (!existing) {
        break; // Code is unique
      }

      referralCode = generateReferralCode(args.name);
      attempts++;
    }

    return await ctx.db.insert("users", {
      ...args,
      role: "user", // Default role for new users
      accountType: "personal", // Default to personal account
      referralCode, // Assign referral code
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!existingUser) return;

    // Track changes for SMS notification
    const emailChanged = existingUser.email !== args.email;
    const nameChanged = existingUser.name !== args.name;

    // Ensure required fields exist
    const updateData: any = {
      ...args,
      updatedAt: Date.now(),
    };

    // Add missing fields for existing users
    if (!existingUser.role) {
      updateData.role = "user";
    }
    if (!existingUser.createdAt) {
      updateData.createdAt = Date.now();
    }

    await ctx.db.patch(existingUser._id, updateData);

    // Send account update SMS if email or name changed
    if ((emailChanged || nameChanged) && existingUser.phoneNumber) {
      await ctx.scheduler.runAfter(0, api.smsNotifications.sendAccountUpdateSMS, {
        clerkId: args.clerkId,
        phoneNumber: existingUser.phoneNumber,
        changeType: emailChanged ? "email" : "name",
      });
    }

    return existingUser._id;
  },
});

export const getUserRole = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    
    return user?.role || "user";
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (currentUser?.role !== "admin" && currentUser?.role !== "superadmin") {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db.query("users").collect();
  },
});

export const getMemberCount = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    // Allow trainers and admins to see member count
    if (!currentUser?.role || !["trainer", "admin", "superadmin"].includes(currentUser.role)) {
      throw new Error("Unauthorized: Trainer or admin access required");
    }

    const users = await ctx.db.query("users").collect();
    return users.filter(u => (u.role || "user") === "user").length;
  },
});

export const getCurrentUserRole = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    return user?.role || "user";
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("superadmin"), v.literal("admin"), v.literal("trainer"), v.literal("user")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    // Only superadmin can promote to superadmin, admins can promote to admin/trainer/user
    if (args.role === "superadmin" && currentUser?.role !== "superadmin") {
      throw new Error("Unauthorized: Superadmin access required");
    }
    
    if (currentUser?.role !== "admin" && currentUser?.role !== "superadmin") {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: Date.now(),
    });
  },
});

export const createSuperAdmin = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    superAdminKey: v.string(),
  },
  handler: async (ctx, args) => {
    // Check super admin key (you can set this in your environment)
    const SUPER_ADMIN_KEY = process.env.SUPER_ADMIN_KEY || "DERRIMUT_SUPER_ADMIN_2025";
    
    if (args.superAdminKey !== SUPER_ADMIN_KEY) {
      throw new Error("Invalid super admin key");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // Update existing user to superadmin
      await ctx.db.patch(existingUser._id, {
        role: "superadmin",
        createdAt: existingUser.createdAt || Date.now(),
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    // Create new superadmin user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      role: "superadmin",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Check if user is superadmin
export const isSuperAdmin = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    return user?.role === "superadmin";
  },
});

// Get user by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    
    return user;
  },
});

// Migration function to update existing users
export const migrateExistingUsers = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    for (const user of users) {
      if (!user.role || !user.createdAt) {
        await ctx.db.patch(user._id, {
          role: user.role || "user",
          createdAt: user.createdAt || Date.now(),
          updatedAt: Date.now(),
        });
      }
    }
    
    return `Migrated ${users.length} users`;
  },
});
