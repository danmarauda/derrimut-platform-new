import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Submit contact form message
export const submitContactMessage = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // Insert contact message into database
    const messageId = await ctx.db.insert("contactMessages", {
      name: args.name,
      email: args.email,
      subject: args.subject,
      message: args.message,
      status: "new",
      submittedAt: Date.now(),
      readAt: undefined,
      respondedAt: undefined,
    });

    return { success: true, messageId };
  },
});

// Get contact messages (admin only)
export const getContactMessages = query({
  args: {
    status: v.optional(v.union(v.literal("new"), v.literal("read"), v.literal("responded"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      throw new Error("Unauthorized");
    }

    if (args.status) {
      return await ctx.db
        .query("contactMessages")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      return await ctx.db
        .query("contactMessages")
        .order("desc")
        .collect();
    }
  },
});

// Mark contact message as read
export const markContactMessageRead = mutation({
  args: {
    messageId: v.id("contactMessages"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.messageId, {
      status: "read",
      readAt: Date.now(),
    });

    return { success: true };
  },
});

// Mark contact message as responded
export const markContactMessageResponded = mutation({
  args: {
    messageId: v.id("contactMessages"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.messageId, {
      status: "responded",
      respondedAt: Date.now(),
    });

    return { success: true };
  },
});

