import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Friends System
 * Social graph and friend connections
 */

// Send friend request
export const sendFriendRequest = mutation({
  args: {
    friendClerkId: v.string(),
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

    const friend = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.friendClerkId))
      .first();

    if (!friend) {
      throw new Error("Friend not found");
    }

    // Prevent self-friending
    if (user._id === friend._id) {
      throw new Error("Cannot send friend request to yourself");
    }

    // Check if friendship already exists
    const existingFriendship = await ctx.db
      .query("friendships")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", identity.subject))
      .filter((q) => q.eq(q.field("friendClerkId"), args.friendClerkId))
      .first();

    if (existingFriendship) {
      if (existingFriendship.status === "accepted") {
        throw new Error("Already friends");
      }
      if (existingFriendship.status === "pending") {
        throw new Error("Friend request already sent");
      }
      if (existingFriendship.status === "blocked") {
        throw new Error("Cannot send request to blocked user");
      }
    }

    // Check reverse friendship (if they already sent a request)
    const reverseFriendship = await ctx.db
      .query("friendships")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", args.friendClerkId))
      .filter((q) => q.eq(q.field("friendClerkId"), identity.subject))
      .first();

    if (reverseFriendship && reverseFriendship.status === "pending") {
      // Accept the existing request instead
      await ctx.db.patch(reverseFriendship._id, {
        status: "accepted",
        updatedAt: Date.now(),
      });

      // Create reverse friendship record
      await ctx.db.insert("friendships", {
        userId: user._id,
        friendId: friend._id,
        userClerkId: identity.subject,
        friendClerkId: args.friendClerkId,
        status: "accepted",
        requestedBy: friend._id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Send notification
      await ctx.scheduler.runAfter(0, api.notifications.createNotificationWithPush, {
        userId: friend._id,
        clerkId: args.friendClerkId,
        type: "social",
        title: "Friend Request Accepted",
        message: `${user.name} accepted your friend request!`,
        link: `/profile/friends`,
        sendPush: true,
      });

      return { success: true, action: "accepted" };
    }

    // Create new friend request
    const friendshipId = await ctx.db.insert("friendships", {
      userId: user._id,
      friendId: friend._id,
      userClerkId: identity.subject,
      friendClerkId: args.friendClerkId,
      status: "pending",
      requestedBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Send notification to friend
    await ctx.scheduler.runAfter(0, api.notifications.createNotificationWithPush, {
      userId: friend._id,
      clerkId: args.friendClerkId,
      type: "social",
      title: "New Friend Request",
      message: `${user.name} sent you a friend request`,
      link: `/profile/friends`,
      sendPush: true,
    });

    return { success: true, friendshipId };
  },
});

// Accept friend request
export const acceptFriendRequest = mutation({
  args: {
    friendshipId: v.id("friendships"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const friendship = await ctx.db.get(args.friendshipId);
    if (!friendship) {
      throw new Error("Friendship not found");
    }

    // Only the friend (recipient) can accept
    if (friendship.friendClerkId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    if (friendship.status !== "pending") {
      throw new Error("Friend request already processed");
    }

    // Update friendship to accepted
    await ctx.db.patch(args.friendshipId, {
      status: "accepted",
      updatedAt: Date.now(),
    });

    // Create reverse friendship record
    await ctx.db.insert("friendships", {
      userId: friendship.friendId,
      friendId: friendship.userId,
      userClerkId: friendship.friendClerkId,
      friendClerkId: friendship.userClerkId,
      status: "accepted",
      requestedBy: friendship.requestedBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Send notification to requester
    const requester = await ctx.db.get(friendship.userId);
    if (requester) {
      await ctx.scheduler.runAfter(0, api.notifications.createNotificationWithPush, {
        userId: friendship.userId,
        clerkId: friendship.userClerkId,
        type: "social",
        title: "Friend Request Accepted",
        message: `${requester.name} accepted your friend request!`,
        link: `/profile/friends`,
        sendPush: true,
      });
    }

    return { success: true };
  },
});

// Decline friend request
export const declineFriendRequest = mutation({
  args: {
    friendshipId: v.id("friendships"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const friendship = await ctx.db.get(args.friendshipId);
    if (!friendship) {
      throw new Error("Friendship not found");
    }

    // Only the friend (recipient) can decline
    if (friendship.friendClerkId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Delete the friendship request
    await ctx.db.delete(args.friendshipId);

    return { success: true };
  },
});

// Remove friend
export const removeFriend = mutation({
  args: {
    friendClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Delete both friendship records
    const friendships = await ctx.db
      .query("friendships")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", identity.subject))
      .filter((q) => q.eq(q.field("friendClerkId"), args.friendClerkId))
      .collect();

    await Promise.all(friendships.map((f) => ctx.db.delete(f._id)));

    // Delete reverse friendships
    const reverseFriendships = await ctx.db
      .query("friendships")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", args.friendClerkId))
      .filter((q) => q.eq(q.field("friendClerkId"), identity.subject))
      .collect();

    await Promise.all(reverseFriendships.map((f) => ctx.db.delete(f._id)));

    return { success: true };
  },
});

// Block user
export const blockUser = mutation({
  args: {
    friendClerkId: v.string(),
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

    const friend = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.friendClerkId))
      .first();

    if (!friend) {
      throw new Error("User not found");
    }

    // Delete existing friendships
    await removeFriend(ctx, { friendClerkId: args.friendClerkId });

    // Create blocked friendship
    await ctx.db.insert("friendships", {
      userId: user._id,
      friendId: friend._id,
      userClerkId: identity.subject,
      friendClerkId: args.friendClerkId,
      status: "blocked",
      requestedBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get user's friends
export const getUserFriends = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = args.clerkId || identity.subject;

    const friendships = await ctx.db
      .query("friendships")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", clerkId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    // Enrich with friend information
    const friends = await Promise.all(
      friendships.map(async (friendship) => {
        const friend = await ctx.db.get(friendship.friendId);
        return {
          ...friendship,
          friendName: friend?.name || "Unknown",
          friendEmail: friend?.email || "Unknown",
          friendImage: friend?.image,
        };
      })
    );

    return friends;
  },
});

// Get pending friend requests (received)
export const getPendingFriendRequests = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const requests = await ctx.db
      .query("friendships")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", identity.subject))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Enrich with requester information
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const requester = await ctx.db.get(request.userId);
        return {
          ...request,
          requesterName: requester?.name || "Unknown",
          requesterEmail: requester?.email || "Unknown",
          requesterImage: requester?.image,
        };
      })
    );

    return enrichedRequests;
  },
});

// Get sent friend requests (pending)
export const getSentFriendRequests = query({
  args: {},
  handler: async (ctx) => {
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

    const requests = await ctx.db
      .query("friendships")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", identity.subject))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .filter((q) => q.eq(q.field("requestedBy"), user._id))
      .collect();

    // Enrich with friend information
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const friend = await ctx.db.get(request.friendId);
        return {
          ...request,
          friendName: friend?.name || "Unknown",
          friendEmail: friend?.email || "Unknown",
          friendImage: friend?.image,
        };
      })
    );

    return enrichedRequests;
  },
});

// Search users (for finding friends)
export const searchUsers = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const searchTerm = args.query.toLowerCase();
    const limit = args.limit || 20;

    // Get all users and filter (in production, use a proper search index)
    const allUsers = await ctx.db.query("users").collect();

    const matchingUsers = allUsers
      .filter(
        (user) =>
          user.clerkId !== identity.subject &&
          (user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm))
      )
      .slice(0, limit);

    // Check friendship status for each user
    const enrichedUsers = await Promise.all(
      matchingUsers.map(async (user) => {
        const friendship = await ctx.db
          .query("friendships")
          .withIndex("by_user_clerk", (q) => q.eq("userClerkId", identity.subject))
          .filter((q) => q.eq(q.field("friendClerkId"), user.clerkId))
          .first();

        return {
          _id: user._id,
          clerkId: user.clerkId,
          name: user.name,
          email: user.email,
          image: user.image,
          friendshipStatus: friendship?.status || null,
        };
      })
    );

    return enrichedUsers;
  },
});

// Get friend activity feed
export const getFriendActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user's friends
    const friends = await getUserFriends(ctx, { clerkId: identity.subject });
    const friendClerkIds = friends.map((f) => f.friendClerkId);

    if (friendClerkIds.length === 0) {
      return [];
    }

    // Get recent check-ins from friends
    const checkIns = await ctx.db
      .query("memberCheckIns")
      .withIndex("by_clerk_id")
      .filter((q) => {
        // Filter by friend clerk IDs
        return true; // Simplified - need proper filtering
      })
      .order("desc")
      .take(args.limit || 20);

    // Get recent achievements from friends
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_clerk_id")
      .filter((q) => {
        // Filter by friend clerk IDs
        return true; // Simplified
      })
      .order("desc")
      .take(args.limit || 20);

    // Combine and sort by date
    const activities: any[] = [
      ...checkIns.map((ci) => ({ type: "check_in", data: ci, createdAt: ci.checkInTime })),
      ...achievements.map((a) => ({ type: "achievement", data: a, createdAt: a.unlockedAt })),
    ];

    activities.sort((a, b) => b.createdAt - a.createdAt);

    return activities.slice(0, args.limit || 20);
  },
});

