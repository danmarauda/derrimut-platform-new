import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

/**
 * Live Streaming Classes System
 * Integrate Zoom/Google Meet for live streamed group classes
 */

// Create live stream class
export const createLiveStreamClass = mutation({
  args: {
    classId: v.id("groupFitnessClasses"),
    title: v.string(),
    description: v.string(),
    streamUrl: v.string(),
    streamType: v.union(v.literal("zoom"), v.literal("google_meet"), v.literal("custom")),
    startTime: v.number(),
    endTime: v.number(),
    capacity: v.number(),
    hasChat: v.boolean(),
    hasReactions: v.boolean(),
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

    if (!user || (user.role !== "admin" && user.role !== "superadmin" && user.role !== "trainer")) {
      throw new Error("Unauthorized: Admin or trainer access required");
    }

    const streamId = await ctx.db.insert("liveStreamClasses", {
      classId: args.classId,
      title: args.title,
      description: args.description,
      streamUrl: args.streamUrl,
      streamType: args.streamType,
      startTime: args.startTime,
      endTime: args.endTime,
      capacity: args.capacity,
      currentViewers: 0,
      isLive: false,
      hasChat: args.hasChat,
      hasReactions: args.hasReactions,
      instructorId: user._id,
      instructorClerkId: identity.subject,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Send notifications to class attendees
    await ctx.scheduler.runAfter(0, api.liveStreaming.notifyClassAttendees, {
      streamId,
      classId: args.classId,
    });

    return streamId;
  },
});

// Start live stream
export const startLiveStream = mutation({
  args: {
    streamId: v.id("liveStreamClasses"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const stream = await ctx.db.get(args.streamId);
    if (!stream) {
      throw new Error("Stream not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || stream.instructorClerkId !== identity.subject) {
      throw new Error("Unauthorized: Only instructor can start stream");
    }

    await ctx.db.patch(args.streamId, {
      isLive: true,
      updatedAt: Date.now(),
    });

    // Notify viewers
    await ctx.scheduler.runAfter(0, api.liveStreaming.notifyStreamStarted, {
      streamId: args.streamId,
    });

    return { success: true };
  },
});

// End live stream
export const endLiveStream = mutation({
  args: {
    streamId: v.id("liveStreamClasses"),
    recordingUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const stream = await ctx.db.get(args.streamId);
    if (!stream) {
      throw new Error("Stream not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || stream.instructorClerkId !== identity.subject) {
      throw new Error("Unauthorized: Only instructor can end stream");
    }

    await ctx.db.patch(args.streamId, {
      isLive: false,
      recordingUrl: args.recordingUrl,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Join live stream
export const joinLiveStream = mutation({
  args: {
    streamId: v.id("liveStreamClasses"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const stream = await ctx.db.get(args.streamId);
    if (!stream) {
      throw new Error("Stream not found");
    }

    // Check capacity
    const currentViewers = await ctx.db
      .query("liveStreamViewers")
      .withIndex("by_stream", (q) => q.eq("streamId", args.streamId))
      .filter((q) => q.eq(q.field("leftAt"), undefined))
      .collect();

    if (currentViewers.length >= stream.capacity) {
      throw new Error("Stream is at capacity");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if already joined
    const existingViewer = await ctx.db
      .query("liveStreamViewers")
      .withIndex("by_stream", (q) => q.eq("streamId", args.streamId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .filter((q) => q.eq(q.field("leftAt"), undefined))
      .first();

    if (existingViewer) {
      return { alreadyJoined: true };
    }

    // Add viewer
    await ctx.db.insert("liveStreamViewers", {
      streamId: args.streamId,
      userId: user._id,
      clerkId: identity.subject,
      joinedAt: Date.now(),
    });

    // Update viewer count
    await ctx.db.patch(args.streamId, {
      currentViewers: currentViewers.length + 1,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Leave live stream
export const leaveLiveStream = mutation({
  args: {
    streamId: v.id("liveStreamClasses"),
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

    const viewer = await ctx.db
      .query("liveStreamViewers")
      .withIndex("by_stream", (q) => q.eq("streamId", args.streamId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .filter((q) => q.eq(q.field("leftAt"), undefined))
      .first();

    if (viewer) {
      const duration = Date.now() - viewer.joinedAt;
      await ctx.db.patch(viewer._id, {
        leftAt: Date.now(),
        duration,
      });

      // Update viewer count
      const stream = await ctx.db.get(args.streamId);
      if (stream) {
        const currentViewers = await ctx.db
          .query("liveStreamViewers")
          .withIndex("by_stream", (q) => q.eq("streamId", args.streamId))
          .filter((q) => q.eq(q.field("leftAt"), undefined))
          .collect();

        await ctx.db.patch(args.streamId, {
          currentViewers: currentViewers.length - 1,
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

// Get live streams
export const getLiveStreams = query({
  args: {
    isLive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let streams = await ctx.db.query("liveStreamClasses").order("desc").collect();

    if (args.isLive !== undefined) {
      streams = streams.filter((s) => s.isLive === args.isLive);
    }

    return streams.slice(0, args.limit || 50);
  },
});

// Get live stream details
export const getLiveStream = query({
  args: {
    streamId: v.id("liveStreamClasses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.streamId);
  },
});

// Get stream viewers
export const getStreamViewers = query({
  args: {
    streamId: v.id("liveStreamClasses"),
  },
  handler: async (ctx, args) => {
    const viewers = await ctx.db
      .query("liveStreamViewers")
      .withIndex("by_stream", (q) => q.eq("streamId", args.streamId))
      .collect();

    // Enrich with user info
    const enrichedViewers = await Promise.all(
      viewers.map(async (viewer) => {
        const user = await ctx.db.get(viewer.userId);
        return {
          ...viewer,
          userName: user?.name,
          userImage: user?.image,
        };
      })
    );

    return enrichedViewers;
  },
});

// Notify class attendees (internal)
export const notifyClassAttendees = action({
  args: {
    streamId: v.id("liveStreamClasses"),
    classId: v.id("groupFitnessClasses"),
  },
  handler: async (ctx, args) => {
    // Get class bookings for group fitness classes
    const bookings = await ctx.runQuery(internal.groupClasses.getClassBookingsForNotification, {
      classId: args.classId,
    });

    // Send notifications to all booked members
    for (const booking of bookings) {
      const user = await ctx.runQuery(internal.notificationScheduler.getUserById, {
        userId: booking.userId,
      });

      if (user) {
        await ctx.scheduler.runAfter(0, api.notifications.createNotificationWithPush, {
          userId: booking.userId,
          clerkId: user.clerkId,
          type: "booking",
          title: "Live Stream Available",
          message: "A live stream is now available for your booked class!",
          link: `/live-streams/${args.streamId}`,
          sendPush: true,
        });
      }
    }
  },
});

// Notify stream started (internal)
export const notifyStreamStarted = action({
  args: {
    streamId: v.id("liveStreamClasses"),
  },
  handler: async (ctx, args) => {
    const stream = await ctx.runQuery(api.liveStreaming.getLiveStream, {
      streamId: args.streamId,
    });

    if (!stream) return;

    // Get all viewers who joined
    const viewers = await ctx.runQuery(api.liveStreaming.getStreamViewers, {
      streamId: args.streamId,
    });

    // Send push notifications
    for (const viewer of viewers) {
      await ctx.scheduler.runAfter(0, api.notifications.createNotificationWithPush, {
        userId: viewer.userId,
        clerkId: viewer.clerkId,
        type: "booking",
        title: "Stream Started!",
        message: `${stream.title} is now live!`,
        link: `/live-stream/${args.streamId}`,
        sendPush: true,
      });
    }
  },
});

